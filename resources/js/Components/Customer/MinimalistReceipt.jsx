import {
    XMarkIcon,
    PrinterIcon,
    DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MinimalistReceipt({ isOpen, onClose, order }) {
    const [receiptData, setReceiptData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    // Fetch detailed receipt data when modal opens
    useEffect(() => {
        if (isOpen && order && order.status === "served") {
            fetchReceiptData();
            // Smooth entrance animation
            setTimeout(() => setIsVisible(true), 50);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, order]);

    const fetchReceiptData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/orders/${order.id}/receipt`);
            setReceiptData(response.data.data);
        } catch (err) {
            setError("Unable to load receipt details");
            console.error("Receipt fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200); // Wait for exit animation
    };

    const handlePrint = () => {
        const receiptContent = document.getElementById(
            "minimalist-receipt-content"
        );
        if (receiptContent) {
            // Create a new window for printing with minimal styling
            const printWindow = window.open("", "_blank");
            printWindow.document.write(`
                <html>
                    <head>
                        <title>KlaséCo Receipt</title>
                        <style>
                            body { 
                                font-family: 'Helvetica Neue', Arial, sans-serif; 
                                font-size: 12px; 
                                line-height: 1.4; 
                                color: #333; 
                                max-width: 300px; 
                                margin: 0 auto; 
                                padding: 20px;
                            }
                            .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #8b4513; padding-bottom: 15px; }
                            .receipt-title { font-size: 24px; font-weight: 300; margin-bottom: 5px; color: #8b4513; }
                            .receipt-subtitle { font-size: 11px; color: #6c757d; margin-bottom: 10px; }
                            .receipt-section { margin-bottom: 15px; }
                            .receipt-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                            .receipt-label { color: #6c757d; font-weight: 300; }
                            .receipt-value { font-weight: 400; }
                            .receipt-items { border-top: 1px solid #f8f9fa; padding-top: 15px; }
                            .receipt-item { margin-bottom: 12px; }
                            .receipt-item-name { font-weight: 400; margin-bottom: 3px; }
                            .receipt-item-details { font-size: 10px; color: #6c757d; margin-bottom: 3px; }
                            .receipt-item-addons { font-size: 10px; color: #8b4513; }
                            .receipt-total { border-top: 2px solid #8b4513; padding-top: 10px; margin-top: 15px; }
                            .receipt-total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 500; }
                            .receipt-footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #f8f9fa; }
                            .receipt-footer-text { font-size: 10px; color: #6c757d; margin-bottom: 5px; }
                        </style>
                    </head>
                    <body>
                        ${receiptContent.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
        }
    };

    if (!isOpen || !order) return null;

    // Use receipt data if available, otherwise fall back to order data
    const displayData = receiptData || order;

    return (
        <div
            className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-200 ${
                isVisible ? "opacity-100" : "opacity-0"
            }`}
        >
            {/* Elegant Backdrop */}
            <div
                className="absolute inset-0 bg-dark-gray bg-opacity-60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Minimalist Modal */}
            <div
                className={`absolute inset-4 bg-primary-white rounded-2xl shadow-2xl overflow-hidden 
                           transition-all duration-300 ${
                               isVisible
                                   ? "scale-100 opacity-100"
                                   : "scale-95 opacity-0"
                           }`}
            >
                <div className="flex flex-col h-full">
                    {/* Clean Header */}
                    <div className="flex items-center justify-between p-6 border-b border-light-gray">
                        <div>
                            <h3 className="text-lg font-light text-dark-gray tracking-wide">
                                Receipt
                            </h3>
                            <p className="text-sm text-medium-gray font-light">
                                Order #{displayData.id}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePrint}
                                className="p-2 text-medium-gray hover:text-coffee-accent hover:bg-light-gray 
                                         rounded-lg transition-all duration-200"
                                title="Print Receipt"
                            >
                                <PrinterIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handleClose}
                                className="p-2 text-medium-gray hover:text-dark-gray hover:bg-light-gray 
                                         rounded-lg transition-all duration-200"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Receipt Content */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-8 h-8 border-2 border-coffee-accent border-t-transparent rounded-full animate-spin" />
                                    <span className="text-medium-gray font-light">
                                        Loading receipt...
                                    </span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="text-red-600 font-light mb-2">
                                        {error}
                                    </div>
                                    <button
                                        onClick={fetchReceiptData}
                                        className="text-coffee-accent hover:text-opacity-80 font-light text-sm"
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div
                                    id="minimalist-receipt-content"
                                    className="max-w-sm mx-auto bg-primary-white"
                                >
                                    {/* Elegant Header */}
                                    <div className="text-center mb-8 pb-6 border-b-2 border-coffee-accent">
                                        <h2 className="text-3xl font-light text-coffee-accent mb-2 tracking-wide">
                                            {receiptData?.business_info?.name ||
                                                "KlaséCo"}
                                        </h2>
                                        <p className="text-medium-gray text-sm font-light mb-3">
                                            {receiptData?.business_info
                                                ?.tagline ||
                                                "Premium Coffee Experience"}
                                        </p>
                                        {receiptData?.receipt_metadata && (
                                            <p className="text-xs text-medium-gray font-light">
                                                Receipt #
                                                {
                                                    receiptData.receipt_metadata
                                                        .receipt_number
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* Minimalist Order Info */}
                                    <div className="mb-8 space-y-3">
                                        <div className="receipt-row">
                                            <span className="receipt-label">
                                                Order
                                            </span>
                                            <span className="receipt-value">
                                                #
                                                {displayData.order_info?.id ||
                                                    displayData.id}
                                            </span>
                                        </div>
                                        <div className="receipt-row">
                                            <span className="receipt-label">
                                                Customer
                                            </span>
                                            <span className="receipt-value">
                                                {displayData.order_info
                                                    ?.customer_name ||
                                                    displayData.customer_name}
                                            </span>
                                        </div>

                                        <div className="receipt-row">
                                            <span className="receipt-label">
                                                Ordered
                                            </span>
                                            <span className="receipt-value">
                                                {new Date(
                                                    displayData.order_info
                                                        ?.created_at ||
                                                        displayData.created_at
                                                ).toLocaleString("en-PH", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        {displayData.order_info?.served_at && (
                                            <div className="receipt-row">
                                                <span className="receipt-label">
                                                    Completed
                                                </span>
                                                <span className="receipt-value">
                                                    {new Date(
                                                        displayData.order_info.served_at
                                                    ).toLocaleString("en-PH", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Staff Information */}
                                    {(displayData.staff_info?.cashier ||
                                        displayData.staff_info?.barista) && (
                                        <div className="mb-8 pb-6 border-b border-light-gray">
                                            <h5 className="text-xs font-light text-medium-gray mb-4 tracking-wide uppercase">
                                                Served By
                                            </h5>
                                            <div className="space-y-2">
                                                {displayData.staff_info
                                                    ?.cashier && (
                                                    <div className="receipt-row text-sm">
                                                        <span className="receipt-label">
                                                            Cashier
                                                        </span>
                                                        <span className="receipt-value">
                                                            {
                                                                displayData
                                                                    .staff_info
                                                                    .cashier
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {displayData.staff_info
                                                    ?.barista && (
                                                    <div className="receipt-row text-sm">
                                                        <span className="receipt-label">
                                                            Barista
                                                        </span>
                                                        <span className="receipt-value">
                                                            {
                                                                displayData
                                                                    .staff_info
                                                                    .barista
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Items Section */}
                                    <div className="mb-8">
                                        <h4 className="text-xs font-light text-medium-gray mb-6 tracking-wide uppercase">
                                            Order Details
                                        </h4>

                                        <div className="space-y-6">
                                            {(
                                                displayData.items_breakdown ||
                                                displayData.order_items
                                            )?.map((item, index) => {
                                                // Handle both enhanced receipt data and fallback order data
                                                const isEnhanced =
                                                    displayData.items_breakdown;
                                                const itemName = isEnhanced
                                                    ? item.menu_item?.name
                                                    : item.menu_item?.name;
                                                const quantity = isEnhanced
                                                    ? item.quantity
                                                    : item.quantity;
                                                const size = isEnhanced
                                                    ? item.size
                                                    : item.size === "daily"
                                                    ? "Daily"
                                                    : "Extra";
                                                const variant = isEnhanced
                                                    ? item.variant
                                                    : item.variant === "hot"
                                                    ? "Hot"
                                                    : "Cold";
                                                const itemTotal = isEnhanced
                                                    ? item.item_total
                                                    : item.subtotal;
                                                const unitPrice = isEnhanced
                                                    ? item.unit_price
                                                    : item.unit_price;
                                                const addons = isEnhanced
                                                    ? item.addons
                                                    : item.order_item_addons;

                                                return (
                                                    <div
                                                        key={index}
                                                        className="receipt-item border-b border-light-gray pb-4"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex-1">
                                                                <div className="receipt-item-name text-dark-gray">
                                                                    {itemName ||
                                                                        "Item"}
                                                                </div>
                                                                <div className="receipt-item-details">
                                                                    {size} •{" "}
                                                                    {variant}
                                                                    {quantity >
                                                                        1 &&
                                                                        ` • Qty: ${quantity}`}
                                                                </div>
                                                            </div>
                                                            <div className="text-dark-gray font-medium ml-4">
                                                                ₱
                                                                {parseFloat(
                                                                    itemTotal
                                                                ).toFixed(2)}
                                                            </div>
                                                        </div>

                                                        {/* Elegant Price Breakdown */}
                                                        <div className="ml-4 space-y-1">
                                                            <div className="flex justify-between text-xs text-medium-gray">
                                                                <span>
                                                                    Base (
                                                                    {quantity}×
                                                                    ₱
                                                                    {parseFloat(
                                                                        unitPrice
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                    )
                                                                </span>
                                                                <span>
                                                                    ₱
                                                                    {(
                                                                        parseFloat(
                                                                            unitPrice
                                                                        ) *
                                                                        quantity
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                            </div>

                                                            {/* Add-ons */}
                                                            {addons &&
                                                                addons.length >
                                                                    0 && (
                                                                    <>
                                                                        {addons.map(
                                                                            (
                                                                                addon,
                                                                                addonIndex
                                                                            ) => {
                                                                                const addonName =
                                                                                    isEnhanced
                                                                                        ? addon.name
                                                                                        : addon
                                                                                              .addon
                                                                                              ?.name;
                                                                                const addonQty =
                                                                                    isEnhanced
                                                                                        ? addon.quantity
                                                                                        : addon.quantity;
                                                                                const addonPrice =
                                                                                    isEnhanced
                                                                                        ? addon.unit_price
                                                                                        : addon.unit_price;
                                                                                const addonTotal =
                                                                                    isEnhanced
                                                                                        ? addon.total
                                                                                        : addonPrice *
                                                                                          addonQty;

                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            addonIndex
                                                                                        }
                                                                                        className="flex justify-between text-xs"
                                                                                    >
                                                                                        <span className="text-coffee-accent">
                                                                                            +{" "}
                                                                                            {
                                                                                                addonName
                                                                                            }{" "}
                                                                                            (
                                                                                            {
                                                                                                addonQty
                                                                                            }

                                                                                            ×
                                                                                            ₱
                                                                                            {parseFloat(
                                                                                                addonPrice
                                                                                            ).toFixed(
                                                                                                2
                                                                                            )}

                                                                                            )
                                                                                        </span>
                                                                                        <span className="text-coffee-accent">
                                                                                            ₱
                                                                                            {parseFloat(
                                                                                                addonTotal
                                                                                            ).toFixed(
                                                                                                2
                                                                                            )}
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </>
                                                                )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Elegant Total Section */}
                                    <div className="receipt-total border-t-2 border-coffee-accent pt-6 mb-8">
                                        <div className="space-y-3">
                                            {displayData.pricing && (
                                                <>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-medium-gray font-light">
                                                            Items (
                                                            {
                                                                displayData
                                                                    .pricing
                                                                    .items_count
                                                            }
                                                            )
                                                        </span>
                                                        <span className="text-dark-gray">
                                                            ₱
                                                            {parseFloat(
                                                                displayData
                                                                    .pricing
                                                                    .subtotal ||
                                                                    displayData
                                                                        .pricing
                                                                        .total_amount
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-medium-gray font-light">
                                                            Total Quantity
                                                        </span>
                                                        <span className="text-dark-gray">
                                                            {
                                                                displayData
                                                                    .pricing
                                                                    .total_quantity
                                                            }
                                                        </span>
                                                    </div>
                                                </>
                                            )}

                                            <div className="receipt-total-row pt-3 border-t border-light-gray">
                                                <span className="text-dark-gray">
                                                    Total
                                                </span>
                                                <span className="text-dark-gray">
                                                    ₱
                                                    {parseFloat(
                                                        displayData.pricing
                                                            ?.total_amount ||
                                                            displayData.total_amount
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Minimalist Footer */}
                                    <div className="receipt-footer text-center border-t border-light-gray pt-6">
                                        <p className="receipt-footer-text font-light mb-2">
                                            {receiptData?.business_info
                                                ?.receipt_footer ||
                                                "Thank you for choosing KlaséCo"}
                                        </p>
                                        <p className="receipt-footer-text">
                                            Visit us again soon
                                        </p>

                                        <div className="mt-6 pt-4 border-t border-light-gray">
                                            <p className="text-xs text-medium-gray font-light">
                                                Status:{" "}
                                                <span className="font-medium uppercase tracking-wide">
                                                    {displayData.order_info
                                                        ?.status ||
                                                        displayData.status}
                                                </span>
                                            </p>
                                            {receiptData?.receipt_metadata
                                                ?.generated_at && (
                                                <p className="text-xs text-medium-gray font-light mt-2">
                                                    Generated:{" "}
                                                    {new Date(
                                                        receiptData.receipt_metadata.generated_at
                                                    ).toLocaleString("en-PH")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="border-t border-light-gray p-6">
                        <div className="flex space-x-3">
                            <button
                                onClick={handlePrint}
                                className="flex-1 bg-coffee-accent text-primary-white py-3 px-4 rounded-lg 
                                         font-light tracking-wide hover:bg-opacity-90 transition-all duration-200
                                         focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:ring-offset-2
                                         flex items-center justify-center space-x-2"
                            >
                                <PrinterIcon className="h-4 w-4" />
                                <span>Print</span>
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 bg-light-gray text-dark-gray py-3 px-4 rounded-lg 
                                         font-light tracking-wide hover:bg-medium-gray hover:bg-opacity-20 
                                         transition-all duration-200
                                         focus:outline-none focus:ring-2 focus:ring-medium-gray focus:ring-offset-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
