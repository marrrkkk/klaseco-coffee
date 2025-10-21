import { useState, useCallback, useEffect } from "react";
import { Head } from "@inertiajs/react";
import MinimalistLayout from "@/Layouts/MinimalistLayout";
import { useSeamlessSmartPolling } from "@/Hooks/useSeamlessPolling";
import { formatCurrency } from "@/Utils/currency";
import { ClockIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function BaristaDashboard() {
    const [lastUpdated, setLastUpdated] = useState(null);
    const [processingOrders, setProcessingOrders] = useState(new Set());
    const [activeTab, setActiveTab] = useState("active"); // "active" or "history"
    const [historyOrders, setHistoryOrders] = useState([]);
    const [checklistOrder, setChecklistOrder] = useState(null);
    const [checkedItems, setCheckedItems] = useState({});

    const handleOrdersUpdate = useCallback((ordersData, meta) => {
        setLastUpdated(new Date());
    }, []);

    // Fetch history orders
    const fetchHistory = useCallback(async () => {
        try {
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
        useSeamlessSmartPolling("owner", handleOrdersUpdate, {
            priority: "high",
            smoothTransitions: true,
        });

    const openChecklist = useCallback((order) => {
        console.log("Opening checklist for order:", order);
        setChecklistOrder(order);
        // Initialize all items as unchecked
        const initialChecked = {};
        order.items?.forEach((item, index) => {
            initialChecked[index] = false;
        });
        setCheckedItems(initialChecked);
        console.log("Checklist state set:", { order, initialChecked });
    }, []);

    const closeChecklist = useCallback(() => {
        setChecklistOrder(null);
        setCheckedItems({});
    }, []);

    const toggleItemCheck = useCallback((index) => {
        console.log("Toggling item:", index);
        setCheckedItems((prev) => {
            const newState = {
                ...prev,
                [index]: !prev[index],
            };
            console.log("New checked state:", newState);
            return newState;
        });
    }, []);

    const allItemsChecked = useCallback(() => {
        if (!checklistOrder) return false;
        return checklistOrder.items?.every((_, index) => checkedItems[index]);
    }, [checklistOrder, checkedItems]);

    const handleMarkReady = useCallback(async () => {
        if (!checklistOrder) return;

        setProcessingOrders((prev) => new Set(prev).add(checklistOrder.id));

        try {
            const response = await fetch(
                `/api/orders/${checklistOrder.id}/ready`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                    body: JSON.stringify({
                        barista_id: 3,
                    }),
                }
            );

            const data = await response.json();

            if (!data.success) {
                console.error("Failed to mark order as ready:", data.message);
            } else {
                closeChecklist();
            }
        } catch (err) {
            console.error("Network error occurred:", err);
        } finally {
            setProcessingOrders((prev) => {
                const newSet = new Set(prev);
                newSet.delete(checklistOrder.id);
                return newSet;
            });
        }
    }, [checklistOrder, closeChecklist]);

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
        <MinimalistLayout title="Barista Dashboard">
            <Head title="Barista - KlaséCo" />

            <div className="min-h-screen bg-primary-white">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-primary-white border-b border-light-gray">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-light text-dark-gray">
                                    Barista Dashboard
                                </h1>
                                <p className="text-sm text-medium-gray mt-1">
                                    Prepare orders
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <a
                                    href="/cashier"
                                    className="px-4 py-2 text-sm font-medium text-coffee-accent border border-coffee-accent rounded-lg hover:bg-coffee-accent hover:text-white transition-all"
                                >
                                    <span className="hidden sm:inline">
                                        Switch to{" "}
                                    </span>
                                    Cashier
                                </a>
                                <div className="text-right hidden sm:block">
                                    <div className="text-2xl font-light text-dark-gray">
                                        {orders.length}
                                    </div>
                                    <div className="text-xs text-medium-gray">
                                        Active
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

                        {/* Tabs */}
                        <div className="flex space-x-1 border-b border-light-gray -mb-px">
                            <button
                                onClick={() => setActiveTab("active")}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === "active"
                                        ? "text-coffee-accent border-b-2 border-coffee-accent"
                                        : "text-medium-gray hover:text-dark-gray"
                                }`}
                            >
                                Active ({orders.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === "history"
                                        ? "text-coffee-accent border-b-2 border-coffee-accent"
                                        : "text-medium-gray hover:text-dark-gray"
                                }`}
                            >
                                History
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    {activeTab === "active" ? (
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
                                            No orders to prepare right now
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
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            order.status ===
                                                            "accepted"
                                                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                : "bg-orange-50 text-orange-700 border border-orange-200"
                                                        }`}
                                                    >
                                                        {order.status ===
                                                        "accepted"
                                                            ? "Ready to Prepare"
                                                            : "In Preparation"}
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
                                                            Total
                                                        </span>
                                                        <span className="text-lg font-medium text-dark-gray">
                                                            {formatCurrency(
                                                                order.total_amount
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Mark Ready Button */}
                                                <button
                                                    onClick={() =>
                                                        openChecklist(order)
                                                    }
                                                    disabled={processingOrders.has(
                                                        order.id
                                                    )}
                                                    className="w-full bg-coffee-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="flex items-center justify-center space-x-2">
                                                        <CheckIcon className="w-5 h-5" />
                                                        <span>
                                                            Mark as Ready
                                                        </span>
                                                    </span>
                                                </button>
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
                                    All prepared and completed orders
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
                                            Prepared orders will appear here
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
                                                                ? "Cancelled"
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

                {/* Checklist Modal */}
                {checklistOrder && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                        onClick={(e) =>
                            e.target === e.currentTarget && closeChecklist()
                        }
                    >
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-light-gray">
                                <h3 className="text-xl font-medium text-dark-gray">
                                    Verify Order #{checklistOrder.id}
                                </h3>
                                <p className="text-sm text-medium-gray mt-1">
                                    Check off each item as you prepare it
                                </p>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                <div className="space-y-3">
                                    {checklistOrder.items?.map(
                                        (item, index) => (
                                            <div
                                                key={index}
                                                onClick={() =>
                                                    toggleItemCheck(index)
                                                }
                                                className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                    checkedItems[index]
                                                        ? "border-coffee-accent bg-warm-white"
                                                        : "border-light-gray hover:border-medium-gray"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        !!checkedItems[index]
                                                    }
                                                    onChange={() => {}}
                                                    readOnly
                                                    className="mt-1 w-5 h-5 text-coffee-accent border-medium-gray rounded focus:ring-coffee-accent focus:ring-2 pointer-events-none"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-dark-gray">
                                                        {item.quantity}x{" "}
                                                        {item.menu_item?.name}
                                                    </div>
                                                    <div className="text-sm text-medium-gray mt-1">
                                                        {item.size === "daily"
                                                            ? "Daily"
                                                            : "Extra"}{" "}
                                                        •{" "}
                                                        {item.variant === "hot"
                                                            ? "Hot"
                                                            : "Cold"}
                                                    </div>
                                                    {item.addons &&
                                                        item.addons.length >
                                                            0 && (
                                                            <div className="text-sm text-coffee-accent mt-1">
                                                                +{" "}
                                                                {item.addons
                                                                    .map(
                                                                        (
                                                                            addon
                                                                        ) =>
                                                                            addon.name
                                                                    )
                                                                    .join(", ")}
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-light-gray bg-warm-white">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={closeChecklist}
                                        className="flex-1 px-4 py-3 border border-medium-gray text-medium-gray rounded-lg font-medium hover:bg-light-gray transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleMarkReady}
                                        disabled={
                                            !allItemsChecked() ||
                                            processingOrders.has(
                                                checklistOrder.id
                                            )
                                        }
                                        className="flex-1 px-4 py-3 bg-coffee-accent text-white rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processingOrders.has(
                                            checklistOrder.id
                                        ) ? (
                                            <span className="flex items-center justify-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </span>
                                        ) : (
                                            "Confirm Ready"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MinimalistLayout>
    );
}
