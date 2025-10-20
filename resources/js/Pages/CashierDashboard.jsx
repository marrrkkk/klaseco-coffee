import { useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import StaffLayout from "@/Layouts/StaffLayout";
import OrderQueueList from "@/Components/Cashier/OrderQueueList";
import OrderSummaryCard from "@/Components/Cashier/OrderSummaryCard";
import { useSeamlessSmartPolling } from "@/Hooks/useSeamlessPolling";
import { useCustomerCartPolling } from "@/Hooks/useCustomerCartPolling";
import ElegantErrorState, {
    ConnectionQualityIndicator,
    GracefulDegradationNotice,
} from "@/Components/ElegantErrorState";
import { OrderListTransition } from "@/Components/SmoothTransition";
import ActiveCustomerCarts from "@/Components/Cashier/ActiveCustomerCarts";
import { formatCurrency } from "@/Utils/currency";
import { useNotify } from "@/Hooks/useNotify";

export default function CashierDashboard() {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const notify = useNotify();

    // Use smart polling for cashier orders
    const handleOrdersUpdate = useCallback((ordersData, meta) => {
        setLastUpdated(new Date());
    }, []);

    const {
        orders,
        queueStats,
        isLoading,
        error,
        isTransitioning,
        connectionQuality,
        gracefulDegradation,
        hasActiveOrders,
    } = useSeamlessSmartPolling("cashier", handleOrdersUpdate, {
        priority: "high",
        smoothTransitions: true,
    });

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    // Track active customer carts
    const { activeCarts, isLoading: cartsLoading } = useCustomerCartPolling(
        (carts) => {
            console.log("Active carts updated:", carts);
        }
    );

    const handleAcceptOrder = useCallback(
        async (orderId) => {
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
                        cashier_id: 2, // Using cashier user ID from seeder
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    notify.orderAccepted(data.order?.id || "Unknown");
                    // The polling will automatically update the orders list
                } else {
                    notify.error(data.message || "Failed to accept order");
                }
            } catch (err) {
                console.error("Network error occurred:", err);
                notify.networkError();
            }
        },
        [notify]
    );

    const handleRejectOrder = useCallback(
        async (orderId) => {
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
                        cashier_id: 2, // Using cashier user ID from seeder
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    notify.orderRejected(data.order?.id || "Unknown");
                    // The polling will automatically update the orders list
                } else {
                    notify.error(data.message || "Failed to reject order");
                }
            } catch (err) {
                console.error("Network error occurred:", err);
                notify.networkError();
            }
        },
        [notify]
    );

    const formatLastUpdated = (date) => {
        if (!date) return "";
        return date.toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <StaffLayout role="Cashier">
            <Head title="Cashier - KlaséCo" />

            <div className="min-h-screen bg-white">
                {/* Clean Header */}
                <div className="border-b border-gray-100 bg-white">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Cashier
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Process orders efficiently
                                </p>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {orders.length}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Pending
                                    </div>
                                </div>
                                <ConnectionQualityIndicator
                                    quality={connectionQuality}
                                    className="hidden sm:flex"
                                />
                                <div
                                    className={`h-2 w-2 rounded-full ${
                                        isTransitioning
                                            ? "bg-blue-500 animate-pulse"
                                            : connectionQuality === "excellent"
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

                {/* Elegant Error State */}
                {error && (
                    <div className="mx-6 mt-4">
                        <ElegantErrorState
                            error={error}
                            onRetry={() => window.location.reload()}
                            size="medium"
                        />
                    </div>
                )}

                {/* Graceful Degradation Notice */}
                <GracefulDegradationNotice
                    isActive={gracefulDegradation}
                    className="mx-6 mt-4"
                />

                {/* Main Content with Smooth Transitions */}
                <div className="p-6">
                    <OrderListTransition
                        orders={orders}
                        isTransitioning={isTransitioning}
                        renderOrder={(order) => (
                            <div
                                key={order.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {order.customer_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {formatCurrency(order.total_amount)}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                handleViewDetails(order)
                                            }
                                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleAcceptOrder(order.id)
                                            }
                                            className="px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleRejectOrder(order.id)
                                            }
                                            className="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        className="space-y-4"
                    />

                    {/* Fallback for when transitions are disabled */}
                    {!isTransitioning && (
                        <OrderQueueList
                            orders={orders}
                            onViewDetails={handleViewDetails}
                            onAcceptOrder={handleAcceptOrder}
                            onRejectOrder={handleRejectOrder}
                            isLoading={isLoading}
                        />
                    )}
                </div>

                {/* Order Summary Card */}
                {selectedOrder && (
                    <OrderSummaryCard
                        order={selectedOrder}
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onAccept={handleAcceptOrder}
                        onReject={handleRejectOrder}
                    />
                )}
            </div>
        </StaffLayout>
    );
}
