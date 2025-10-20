import { useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import StaffLayout from "@/Layouts/StaffLayout";
import PreparationQueue from "@/Components/Barista/PreparationQueue";
import OrderDetailsModal from "@/Components/Cashier/OrderDetailsModal";
import { useSmartPolling } from "@/Hooks/useSmartPolling";
import { useNotify } from "@/Hooks/useNotify";

export default function BaristaDashboard() {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const notify = useNotify();

    // Use smart polling for barista orders
    const {
        orders,
        queueStats,
        isLoading,
        error,
        smartInterval,
        hasActiveOrders,
    } = useSmartPolling("barista", (ordersData, meta) => {
        setLastUpdated(new Date());
    });

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleMarkReady = async (orderId) => {
        try {
            const response = await fetch(`/api/orders/${orderId}/ready`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                },
                body: JSON.stringify({
                    barista_id: 3, // Using barista user ID from seeder
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Remove the completed order from the queue
                setOrders((prev) =>
                    prev.filter((order) => order.id !== orderId)
                );

                notify.orderReady(data.order?.id || "Unknown");
            } else {
                notify.error(data.message || "Failed to mark order as ready");
            }
        } catch (err) {
            notify.networkError();
            console.error("Error marking order as ready:", err);
        }
    };

    const formatLastUpdated = (date) => {
        if (!date) return "";
        return date.toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <StaffLayout role="Barista">
            <Head title="Barista Dashboard - KlaséCo" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-coffee-800">
                                Barista Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage order preparation and fulfillment
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-coffee-600">
                                {orders.length}
                            </div>
                            <div className="text-sm text-gray-500">
                                Orders in Queue
                            </div>
                            {lastUpdated && (
                                <div className="text-xs text-gray-400 mt-1">
                                    Last updated:{" "}
                                    {formatLastUpdated(lastUpdated)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preparation Queue */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-coffee-800">
                            Preparation Queue
                        </h2>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">
                                Smart polling ({smartInterval}ms)
                            </span>
                            {queueStats && (
                                <span className="text-xs text-gray-500">
                                    • {queueStats.total_active} active orders
                                </span>
                            )}
                        </div>
                    </div>

                    <PreparationQueue
                        orders={orders}
                        onViewDetails={handleViewDetails}
                        onMarkReady={handleMarkReady}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* Order Details Modal */}
            <OrderDetailsModal
                order={selectedOrder}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </StaffLayout>
    );
}
