import { useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import StaffLayout from "@/Layouts/StaffLayout";
import ActiveOrdersGrid from "@/Components/Owner/ActiveOrdersGrid";
import { useSmartPolling } from "@/Hooks/useSmartPolling";

export default function OwnerDashboard() {
    const [lastUpdated, setLastUpdated] = useState(null);

    // Use smart polling for owner orders (consolidated barista/owner role)
    const {
        orders,
        queueStats,
        isLoading,
        error,
        smartInterval,
        hasActiveOrders,
    } = useSmartPolling("owner", (ordersData, meta) => {
        setLastUpdated(new Date());
    });

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
                    barista_id: 3, // Using owner user ID from seeder
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Success feedback will be handled by polling updates
                console.log("Order marked as ready successfully");
            } else {
                console.error("Failed to mark order as ready:", data.message);
            }
        } catch (err) {
            console.error("Network error occurred:", err);
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
        <StaffLayout role="Owner">
            <Head title="Owner Dashboard - KlaséCo" />

            <div className="min-h-screen bg-gray-50">
                {/* Clean Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-6">
                            <div>
                                <h1 className="text-2xl font-light text-gray-900">
                                    Preparation Queue
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Focus on coffee quality and timely service
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-light text-gray-900">
                                    {orders.length}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Active Orders
                                </div>
                                {lastUpdated && (
                                    <div className="text-xs text-gray-400 mt-1">
                                        Updated {formatLastUpdated(lastUpdated)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
                                        Connection Error
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        {error}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Orders Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ActiveOrdersGrid
                        orders={orders}
                        onMarkReady={handleMarkReady}
                        isLoading={isLoading}
                        smartInterval={smartInterval}
                        queueStats={queueStats}
                    />
                </div>
            </div>
        </StaffLayout>
    );
}
