import { useState, useCallback, useEffect } from "react";
import { Head } from "@inertiajs/react";
import MinimalistLayout from "@/Layouts/MinimalistLayout";
import { useSeamlessSmartPolling } from "@/Hooks/useSeamlessPolling";
import { formatCurrency } from "@/Utils/currency";
import { ClockIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function CashierDashboard() {
    const [lastUpdated, setLastUpdated] = useState(null);
    const [processingOrders, setProcessingOrders] = useState(new Set());
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState("pending"); // "pending" or "history"
    const [historyOrders, setHistoryOrders] = useState([]);
    const [calculatorOrder, setCalculatorOrder] = useState(null);
    const [amountReceived, setAmountReceived] = useState("");

    const handleOrdersUpdate = useCallback((ordersData, meta) => {
        setLastUpdated(new Date());
    }, []);

    // Fetch history orders
    const fetchHistory = useCallback(async () => {
        try {
            const response = await fetch("/api/orders/stats");
            const data = await response.json();

            // Fetch all non-pending orders
            const historyResponse = await fetch("/api/orders/history");
            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                setHistoryOrders(historyData.data || []);
            }
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    }, []);

    // Load history when switching to history tab
    useEffect(() => {
        if (activeTab === "history") {
            fetchHistory();
        }
    }, [activeTab, fetchHistory]);

    const { orders, isLoading, error, connectionQuality } =
        useSeamlessSmartPolling("cashier", handleOrdersUpdate, {
            priority: "high",
            smoothTransitions: true,
        });

    const handleAcceptOrderClick = useCallback((order) => {
        // Check payment method
        if (order.payment_method === "cash") {
            // Show calculator for cash payment
            setCalculatorOrder(order);
            setAmountReceived("");
        } else {
            // GCash - accept immediately
            handleAcceptOrder(order.id);
        }
    }, []);

    const handleAcceptOrder = useCallback(async (orderId) => {
        setProcessingOrders((prev) => new Set(prev).add(orderId));

        try {
            const response = await fetch(`/api/orders/${orderId}/accept`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                },
                body: JSON.stringify({
                    cashier_id: 2,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                console.error("Failed to accept order:", data.message);
            } else {
                // Close calculator if open
                setCalculatorOrder(null);
                setAmountReceived("");
            }
        } catch (err) {
            console.error("Network error occurred:", err);
        } finally {
            setProcessingOrders((prev) => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    }, []);

    const handleCalculatorInput = useCallback((value) => {
        if (value === "clear") {
            setAmountReceived("");
        } else if (value === "backspace") {
            setAmountReceived((prev) => prev.slice(0, -1));
        } else {
            setAmountReceived((prev) => prev + value);
        }
    }, []);

    const getChange = useCallback(() => {
        if (!calculatorOrder || !amountReceived) return 0;
        const received = parseFloat(amountReceived) || 0;
        const total = parseFloat(calculatorOrder.total_amount) || 0;
        return Math.max(0, received - total);
    }, [calculatorOrder, amountReceived]);

    const canAcceptCashPayment = useCallback(() => {
        if (!calculatorOrder || !amountReceived) return false;
        const received = parseFloat(amountReceived) || 0;
        const total = parseFloat(calculatorOrder.total_amount) || 0;
        return received >= total;
    }, [calculatorOrder, amountReceived]);

    const handleRejectOrder = useCallback(async (orderId) => {
        setProcessingOrders((prev) => new Set(prev).add(orderId));

        try {
            const response = await fetch(`/api/orders/${orderId}/reject`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                },
                body: JSON.stringify({
                    cashier_id: 2,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                console.error("Failed to reject order:", data.message);
            }
        } catch (err) {
            console.error("Network error occurred:", err);
        } finally {
            setProcessingOrders((prev) => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    }, []);

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const orderTime = new Date(dateString);
        const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes === 1) return "1 min ago";
        if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours === 1) return "1 hour ago";
        return `${diffInHours} hours ago`;
    };

    return (
        <MinimalistLayout title="Cashier Dashboard">
            <Head title="Cashier - KlaséCo" />

            <div className="min-h-screen bg-primary-white">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-primary-white border-b border-light-gray">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-light text-dark-gray">
                                    Cashier Dashboard
                                </h1>
                                <p className="text-sm text-medium-gray mt-1">
                                    Review and accept orders
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <a
                                    href="/barista"
                                    className="px-4 py-2 text-sm font-medium text-coffee-accent border border-coffee-accent rounded-lg hover:bg-coffee-accent hover:text-white transition-all"
                                >
                                    <span className="hidden sm:inline">
                                        Switch to{" "}
                                    </span>
                                    Barista
                                </a>
                                <div className="text-right hidden sm:block">
                                    <div className="text-2xl font-light text-dark-gray">
                                        {orders.length}
                                    </div>
                                    <div className="text-xs text-medium-gray">
                                        Pending
                                    </div>
                                </div>
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        connectionQuality === "excellent"
                                            ? "bg-green-500"
                                            : connectionQuality === "good"
                                            ? "bg-blue-500"
                                            : connectionQuality === "poor"
                                            ? "bg-amber-500"
                                            : "bg-red-500"
                                    }`}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    {activeTab === "pending" ? (
                        <>
                            {isLoading && orders.length === 0 ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <div className="w-12 h-12 border-2 border-coffee-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-medium-gray">
                                            Loading orders...
                                        </p>
                                    </div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckIcon className="w-8 h-8 text-medium-gray" />
                                        </div>
                                        <h3 className="text-xl font-light text-dark-gray mb-2">
                                            All Caught Up!
                                        </h3>
                                        <p className="text-medium-gray">
                                            No pending orders
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="bg-white border border-light-gray rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                        >
                                            {/* Order Header */}
                                            <div className="px-4 sm:px-6 py-4 border-b border-light-gray bg-warm-white">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-lg font-medium text-dark-gray">
                                                        Order #{order.id}
                                                    </h3>
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                        Pending
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-medium-gray">
                                                    <ClockIcon className="h-4 w-4" />
                                                    <span>
                                                        {getTimeAgo(
                                                            order.created_at
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Order Content */}
                                            <div className="px-4 sm:px-6 py-4">
                                                {/* Customer Name */}
                                                <div className="mb-4">
                                                    <p className="text-sm font-medium text-dark-gray">
                                                        {order.customer_name}
                                                    </p>
                                                    <div className="flex items-center space-x-3 mt-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                                            {order.order_type_display ||
                                                                (order.order_type ===
                                                                "dine_in"
                                                                    ? "Dine In"
                                                                    : "Take Away")}
                                                        </span>
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-50 text-green-700 border border-green-200">
                                                            {order.payment_method_display ||
                                                                (order.payment_method ===
                                                                "cash"
                                                                    ? "Cash"
                                                                    : "GCash")}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                <div className="mb-4">
                                                    <h4 className="text-xs font-medium text-medium-gray mb-3 uppercase tracking-wide">
                                                        Items
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {order.items?.map(
                                                            (item, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="border-l-2 border-coffee-accent pl-3 py-2 bg-warm-white rounded-r"
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="font-medium text-dark-gray text-sm">
                                                                            {
                                                                                item.quantity
                                                                            }
                                                                            x{" "}
                                                                            {
                                                                                item
                                                                                    .menu_item
                                                                                    ?.name
                                                                            }
                                                                        </span>
                                                                        <span className="text-sm text-medium-gray">
                                                                            {formatCurrency(
                                                                                item.subtotal
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs text-medium-gray">
                                                                        <span className="font-medium">
                                                                            {item.size ===
                                                                            "daily"
                                                                                ? "Daily"
                                                                                : "Extra"}
                                                                        </span>
                                                                        {" • "}
                                                                        {item.variant ===
                                                                        "hot"
                                                                            ? "Hot"
                                                                            : "Cold"}
                                                                    </div>
                                                                    {item.addons &&
                                                                        item
                                                                            .addons
                                                                            .length >
                                                                            0 && (
                                                                            <div className="text-xs text-coffee-accent mt-1">
                                                                                +{" "}
                                                                                {item.addons
                                                                                    .map(
                                                                                        (
                                                                                            addon
                                                                                        ) =>
                                                                                            addon.name
                                                                                    )
                                                                                    .join(
                                                                                        ", "
                                                                                    )}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Total */}
                                                <div className="mb-4 p-3 bg-warm-white rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-medium-gray">
                                                            Total Amount
                                                        </span>
                                                        <span className="text-lg font-medium text-dark-gray">
                                                            {formatCurrency(
                                                                order.total_amount
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleRejectOrder(
                                                                order.id
                                                            )
                                                        }
                                                        disabled={processingOrders.has(
                                                            order.id
                                                        )}
                                                        className="py-3 px-4 border-2 border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {processingOrders.has(
                                                            order.id
                                                        ) ? (
                                                            <span className="flex items-center justify-center">
                                                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center justify-center space-x-1">
                                                                <XMarkIcon className="w-5 h-5" />
                                                                <span className="hidden sm:inline">
                                                                    Reject
                                                                </span>
                                                            </span>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleAcceptOrderClick(
                                                                order
                                                            )
                                                        }
                                                        disabled={processingOrders.has(
                                                            order.id
                                                        )}
                                                        className="py-3 px-4 bg-coffee-accent text-white rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {processingOrders.has(
                                                            order.id
                                                        ) ? (
                                                            <span className="flex items-center justify-center">
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center justify-center space-x-1">
                                                                <CheckIcon className="w-5 h-5" />
                                                                <span className="hidden sm:inline">
                                                                    Accept
                                                                </span>
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        /* History Tab */
                        <div>
                            <div className="mb-4">
                                <h2 className="text-lg font-light text-dark-gray">
                                    Order History
                                </h2>
                                <p className="text-sm text-medium-gray">
                                    All accepted and rejected orders
                                </p>
                            </div>

                            {historyOrders.length === 0 ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ClockIcon className="w-8 h-8 text-medium-gray" />
                                        </div>
                                        <h3 className="text-xl font-light text-dark-gray mb-2">
                                            No History Yet
                                        </h3>
                                        <p className="text-medium-gray">
                                            Accepted and rejected orders will
                                            appear here
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {historyOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="bg-white border border-light-gray rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-medium text-dark-gray">
                                                            Order #{order.id}
                                                        </h3>
                                                        <span
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                order.status ===
                                                                "cancelled"
                                                                    ? "bg-red-50 text-red-700 border border-red-200"
                                                                    : order.status ===
                                                                      "accepted"
                                                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                    : order.status ===
                                                                      "preparing"
                                                                    ? "bg-orange-50 text-orange-700 border border-orange-200"
                                                                    : order.status ===
                                                                      "ready"
                                                                    ? "bg-green-50 text-green-700 border border-green-200"
                                                                    : "bg-gray-50 text-gray-700 border border-gray-200"
                                                            }`}
                                                        >
                                                            {order.status ===
                                                            "cancelled"
                                                                ? "Rejected"
                                                                : order.status ===
                                                                  "accepted"
                                                                ? "Accepted"
                                                                : order.status ===
                                                                  "preparing"
                                                                ? "Preparing"
                                                                : order.status ===
                                                                  "ready"
                                                                ? "Ready"
                                                                : "Served"}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-medium-gray">
                                                        {order.customer_name} •{" "}
                                                        {formatCurrency(
                                                            order.total_amount
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-medium-gray mt-1">
                                                        {new Date(
                                                            order.created_at
                                                        ).toLocaleString(
                                                            "en-PH",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Cash Payment Calculator Modal */}
                {calculatorOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-8 max-h-[90vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="px-4 py-3 border-b border-light-gray">
                                <h3 className="text-lg font-medium text-dark-gray">
                                    Cash Payment - Order #{calculatorOrder.id}
                                </h3>
                                <p className="text-xs text-medium-gray mt-1">
                                    {calculatorOrder.customer_name}
                                </p>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="px-4 py-3 overflow-y-auto flex-1">
                                {/* Order Total */}
                                <div className="mb-2 p-2 bg-warm-white rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-medium-gray">
                                            Order Total
                                        </span>
                                        <span className="text-lg font-medium text-dark-gray">
                                            {formatCurrency(
                                                calculatorOrder.total_amount
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Amount Received Display */}
                                <div className="mb-2">
                                    <label className="block text-xs text-medium-gray mb-1">
                                        Amount Received
                                    </label>
                                    <div className="text-2xl font-medium text-dark-gray text-center p-2 bg-light-gray rounded-lg flex items-center justify-center">
                                        {amountReceived
                                            ? `₱${amountReceived}`
                                            : "₱0"}
                                    </div>
                                </div>

                                {/* Change Display */}
                                {amountReceived && canAcceptCashPayment() && (
                                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-green-700">
                                                Change
                                            </span>
                                            <span className="text-lg font-medium text-green-700">
                                                {formatCurrency(getChange())}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Calculator Keypad */}
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {[
                                        "1",
                                        "2",
                                        "3",
                                        "4",
                                        "5",
                                        "6",
                                        "7",
                                        "8",
                                        "9",
                                        ".",
                                        "0",
                                        "00",
                                    ].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() =>
                                                handleCalculatorInput(num)
                                            }
                                            className="p-3 text-lg font-medium text-dark-gray bg-light-gray hover:bg-medium-gray hover:text-white rounded-lg transition-all"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>

                                {/* Quick Amount Buttons */}
                                <div className="grid grid-cols-5 gap-1 mb-2">
                                    {[20, 50, 100, 500, 1000].map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() =>
                                                setAmountReceived(
                                                    amount.toString()
                                                )
                                            }
                                            className="p-2 text-xs font-medium text-coffee-accent border border-coffee-accent hover:bg-coffee-accent hover:text-white rounded transition-all"
                                        >
                                            ₱{amount}
                                        </button>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-3 gap-1">
                                    <button
                                        onClick={() =>
                                            handleCalculatorInput("clear")
                                        }
                                        className="p-2 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded transition-all"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleCalculatorInput("backspace")
                                        }
                                        className="p-2 text-xs font-medium text-medium-gray border border-light-gray hover:bg-light-gray rounded transition-all"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCalculatorOrder(null);
                                            setAmountReceived("");
                                        }}
                                        className="p-2 text-xs font-medium text-medium-gray border border-light-gray hover:bg-light-gray rounded transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-4 py-3 border-t border-light-gray bg-warm-white">
                                <button
                                    onClick={() =>
                                        handleAcceptOrder(calculatorOrder.id)
                                    }
                                    disabled={
                                        !canAcceptCashPayment() ||
                                        processingOrders.has(calculatorOrder.id)
                                    }
                                    className="w-full bg-coffee-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processingOrders.has(
                                        calculatorOrder.id
                                    ) ? (
                                        <span className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Processing...</span>
                                        </span>
                                    ) : (
                                        "Accept Payment & Confirm Order"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MinimalistLayout>
    );
}
