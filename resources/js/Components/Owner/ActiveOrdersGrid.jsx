import { useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import PreparationCard from "./PreparationCard";

export default function ActiveOrdersGrid({
    orders,
    onMarkReady,
    isLoading = false,
    smartInterval,
    queueStats,
}) {
    const [processingOrders, setProcessingOrders] = useState(new Set());

    const handleMarkReady = async (orderId) => {
        setProcessingOrders((prev) => new Set(prev).add(orderId));
        try {
            await onMarkReady(orderId);
        } finally {
            setProcessingOrders((prev) => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500">
                        Loading active orders...
                    </p>
                </div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                    <ClockIcon className="h-full w-full" />
                </div>
                <h3 className="text-lg font-light text-gray-900 mb-2">
                    No Active Orders
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Orders accepted by the cashier will appear here for
                    preparation. Focus on quality when they arrive.
                </p>
                {smartInterval && (
                    <div className="mt-4 flex items-center justify-center space-x-2">
                        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-400">
                            Checking for new orders every{" "}
                            {Math.round(smartInterval / 1000)}s
                        </span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Status Indicator */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">
                        Live updates every {Math.round(smartInterval / 1000)}s
                    </span>
                    {queueStats && (
                        <span className="text-xs text-gray-400">
                            • {queueStats.total_active} total active orders
                        </span>
                    )}
                </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders.map((order) => (
                    <PreparationCard
                        key={order.id}
                        order={order}
                        onMarkReady={handleMarkReady}
                        isProcessing={processingOrders.has(order.id)}
                    />
                ))}
            </div>
        </div>
    );
}
