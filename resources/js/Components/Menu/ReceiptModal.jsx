import { XMarkIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ReceiptModal({ isOpen, onClose, order }) {
    const [receiptData, setReceiptData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch detailed receipt data when modal opens
    useEffect(() => {
        if (isOpen && order && order.status === "served") {
            fetchReceiptData();
        }
    }, [isOpen, order]);

    const fetchReceiptData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/orders/${order.id}/receipt`);
            setReceiptData(response.data.data);
        } catch (err) {
            setError("Failed to load receipt data");
            console.error("Receipt fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        // Focus on the receipt content for better printing
        const receiptContent = document.getElementById("receipt-content");
        if (receiptContent) {
            window.print();
        }
    };

    if (!isOpen || !order) return null;

    // Use receipt data if available, otherwise fall back to order data
    const displayData = receiptData || order;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="absolute inset-4 bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-coffee-200 bg-coffee-600 text-white">
                        <h3 className="text-lg font-semibold">Order Receipt</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-coffee-700 rounded"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Receipt Content */}
                    <div
                        className="flex-1 overflow-y-auto p-6"
                        id="receipt-content"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-coffee-600">
                                    Loading receipt...
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-red-600">{error}</div>
                            </div>
                        ) : (
                            <div className="max-w-sm mx-auto bg-white">
                                {/* Header */}
                                <div className="text-center mb-6 pb-4 border-b-2 border-coffee-800">
                                    <h2 className="text-3xl font-bold text-coffee-800 mb-1">
                                        {receiptData?.business_info?.name ||
                                            "KlaséCo"}
                                    </h2>
                                    <p className="text-coffee-600 text-sm mb-2">
                                        {receiptData?.business_info?.tagline ||
                                            "Premium Coffee Experience"}
                                    </p>
                                    {receiptData?.receipt_metadata && (
                                        <p className="text-xs text-coffee-500">
                                            Receipt #
                                            {
                                                receiptData.receipt_metadata
                                                    .receipt_number
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Order Info */}
                                <div className="mb-6 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-coffee-600">
                                            Order #:
                                        </span>
                                        <span className="font-semibold">
                                            {displayData.order_info?.id ||
                                                displayData.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-coffee-600">
                                            Customer:
                                        </span>
                                        <span className="font-semibold">
                                            {displayData.order_info
                                                ?.customer_name ||
                                                displayData.customer_name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-coffee-600">
                                            Phone:
                                        </span>
                                        <span className="font-semibold">
                                            {displayData.order_info
                                                ?.customer_phone ||
                                                displayData.customer_phone}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-coffee-600">
                                            Order Date:
                                        </span>
                                        <span className="font-semibold">
                                            {new Date(
                                                displayData.order_info
                                                    ?.created_at ||
                                                    displayData.created_at
                                            ).toLocaleString("en-PH", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    {displayData.order_info?.served_at && (
                                        <div className="flex justify-between">
                                            <span className="text-coffee-600">
                                                Served:
                                            </span>
                                            <span className="font-semibold">
                                                {new Date(
                                                    displayData.order_info.served_at
                                                ).toLocaleString("en-PH", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Staff Info */}
                                {(displayData.staff_info?.cashier ||
                                    displayData.staff_info?.barista) && (
                                    <>
                                        <div className="border-t border-coffee-200 pt-3 mb-4">
                                            <h5 className="text-xs font-semibold text-coffee-700 mb-2">
                                                SERVED BY
                                            </h5>
                                            <div className="space-y-1 text-xs">
                                                {displayData.staff_info
                                                    ?.cashier && (
                                                    <div className="flex justify-between">
                                                        <span className="text-coffee-600">
                                                            Cashier:
                                                        </span>
                                                        <span>
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
                                                    <div className="flex justify-between">
                                                        <span className="text-coffee-600">
                                                            Barista:
                                                        </span>
                                                        <span>
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
                                    </>
                                )}

                                <div className="border-t border-coffee-200 pt-4 mb-4">
                                    <h4 className="font-semibold text-coffee-800 mb-3 text-sm">
                                        ORDER DETAILS
                                    </h4>
                                </div>

                                {/* Order Items with Enhanced Breakdown */}
                                <div className="mb-6">
                                    <div className="space-y-4">
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
                                                    className="text-sm border-b border-coffee-100 pb-3"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-coffee-800">
                                                                {itemName ||
                                                                    "Item"}
                                                            </div>
                                                            <div className="text-coffee-600 text-xs">
                                                                {size} •{" "}
                                                                {variant}
                                                                {quantity > 1 &&
                                                                    ` • Qty: ${quantity}`}
                                                            </div>
                                                        </div>
                                                        <div className="font-semibold ml-2 text-coffee-800">
                                                            ₱
                                                            {parseFloat(
                                                                itemTotal
                                                            ).toFixed(2)}
                                                        </div>
                                                    </div>

                                                    {/* Base Price Breakdown */}
                                                    <div className="ml-2 text-xs text-coffee-500 space-y-1">
                                                        <div className="flex justify-between">
                                                            <span>
                                                                Base price (
                                                                {quantity}x ₱
                                                                {parseFloat(
                                                                    unitPrice
                                                                ).toFixed(2)}
                                                                ):
                                                            </span>
                                                            <span>
                                                                ₱
                                                                {(
                                                                    parseFloat(
                                                                        unitPrice
                                                                    ) * quantity
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>

                                                        {/* Addons Breakdown */}
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
                                                                                    className="flex justify-between"
                                                                                >
                                                                                    <span>
                                                                                        +{" "}
                                                                                        {
                                                                                            addonName
                                                                                        }{" "}
                                                                                        (
                                                                                        {
                                                                                            addonQty
                                                                                        }

                                                                                        x
                                                                                        ₱
                                                                                        {parseFloat(
                                                                                            addonPrice
                                                                                        ).toFixed(
                                                                                            2
                                                                                        )}
                                                                                        ):
                                                                                    </span>
                                                                                    <span>
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

                                <div className="border-t-2 border-coffee-800 pt-4 mb-4">
                                    {/* Pricing Summary */}
                                    <div className="space-y-2 text-sm">
                                        {displayData.pricing && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-coffee-600">
                                                        Items (
                                                        {
                                                            displayData.pricing
                                                                .items_count
                                                        }
                                                        ):
                                                    </span>
                                                    <span>
                                                        ₱
                                                        {parseFloat(
                                                            displayData.pricing
                                                                .subtotal ||
                                                                displayData
                                                                    .pricing
                                                                    .total_amount
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-coffee-600">
                                                        Total Quantity:
                                                    </span>
                                                    <span>
                                                        {
                                                            displayData.pricing
                                                                .total_quantity
                                                        }
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        {/* Final Total */}
                                        <div className="flex justify-between items-center text-lg font-bold text-coffee-800 pt-2 border-t border-coffee-300">
                                            <span>TOTAL:</span>
                                            <span>
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

                                {/* Footer */}
                                <div className="text-center text-xs text-coffee-500 space-y-2 pt-4 border-t border-coffee-200">
                                    <p className="font-medium">
                                        {receiptData?.business_info
                                            ?.receipt_footer ||
                                            "Thank you for choosing KlaséCo!"}
                                    </p>
                                    <p>Visit us again soon</p>

                                    <div className="mt-4 pt-2 border-t border-coffee-100">
                                        <p className="text-coffee-400">
                                            Order Status:{" "}
                                            <span className="font-semibold uppercase">
                                                {displayData.order_info
                                                    ?.status ||
                                                    displayData.status}
                                            </span>
                                        </p>
                                        {receiptData?.receipt_metadata
                                            ?.generated_at && (
                                            <p className="text-coffee-400 mt-1">
                                                Receipt generated:{" "}
                                                {new Date(
                                                    receiptData.receipt_metadata.generated_at
                                                ).toLocaleString("en-PH")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-coffee-200 p-4 bg-coffee-50">
                        <div className="flex space-x-3">
                            <button
                                onClick={handlePrint}
                                disabled={loading || error}
                                className="flex-1 bg-coffee-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-coffee-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                <PrinterIcon className="h-4 w-4" />
                                <span>Print Receipt</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                        {error && (
                            <div className="mt-2 text-xs text-red-600 text-center">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Print Styles */}
            <style>{`
                @media print {
                    /* Hide everything except receipt content */
                    body * {
                        visibility: hidden;
                    }

                    #receipt-content,
                    #receipt-content * {
                        visibility: visible;
                    }

                    /* Position receipt content for printing */
                    #receipt-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 0;
                        margin: 0;
                        background: white !important;
                    }

                    /* Optimize receipt layout for thermal printers */
                    #receipt-content > div {
                        max-width: 80mm !important;
                        margin: 0 auto;
                        font-size: 12px !important;
                        line-height: 1.3 !important;
                        color: black !important;
                    }

                    /* Ensure proper spacing and borders */
                    #receipt-content .border-coffee-800 {
                        border-color: black !important;
                    }

                    #receipt-content .border-coffee-200,
                    #receipt-content .border-coffee-100,
                    #receipt-content .border-coffee-300 {
                        border-color: #ccc !important;
                    }

                    /* Ensure text colors are print-friendly */
                    #receipt-content .text-coffee-800,
                    #receipt-content .text-coffee-600,
                    #receipt-content .text-coffee-500,
                    #receipt-content .text-coffee-400 {
                        color: black !important;
                    }

                    /* Remove page margins for cleaner printing */
                    @page {
                        margin: 0.5cm;
                        size: auto;
                    }
                }
            `}</style>
        </div>
    );
}
