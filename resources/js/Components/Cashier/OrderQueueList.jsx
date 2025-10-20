import { useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/Utils/currency";
import QuickActions from "./QuickActions";

export default function OrderQueueList({
    orders,
    onViewDetails,
    onAcceptOrder,
    onRejectOrder,
    isLoading = false,
}) {
    const [processingOrders, setProcessingOrders] = useState(new Set());

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const orderTime = new Date(dateString);
        const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));

        if (diffInMinutes < 1) return "Now";
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        return `${diffInHours}h`;
    };

    const handleAccept = async (orderId) => {
        setProcessingOrders((prev) => new Set(prev).add(orderId));
        try {
            await onAcceptOrder(orderId);
        } finally {
            setProcessingOrders((prev) => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    const handleReject = async (orderId) => {
        setProcessingOrders((prev) => new Set(prev).add(orderId));
        try {
            await onRejectOrder(orderId);
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
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-3 text-gray-600">Loading orders...</span>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No pending orders
                </h3>
                <p className="text-gray-500">
                    New orders will appear here automatically.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {orders.map((order) => (
                <div
                    key={order.id}
                    className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                    <div className="p-4">
                        {/* Quick-scan header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                    #{order.id}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {order.customer_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {order.customer_phone}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                    {formatCurrency(order.total_amount)}
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    {getTimeAgo(order.created_at)}
                                </div>
                            </div>
                        </div>

                        {/* Essential order items - condensed view */}
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                                {order.order_items
                                    ?.slice(0, 3)
                                    .map((item, index) => (
                                        <div
                                            key={index}
                                            className="inline-flex items-center bg-gray-50 rounded-md px-2 py-1 text-xs"
                                        >
                                            <span className="font-medium text-gray-900">
                                                {item.quantity}x
                                            </span>
                                            <span className="ml-1 text-gray-600">
                                                {item.menu_item?.name}
                                            </span>
                                            <span className="ml-1 text-gray-500">
                                                ({item.size})
                                            </span>
                                        </div>
                                    ))}
                                {order.order_items?.length > 3 && (
                                    <div className="inline-flex items-center bg-gray-100 rounded-md px-2 py-1 text-xs text-gray-600">
                                        +{order.order_items.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => onViewDetails(order)}
                                className="text-sm text-gray-600 hover:text-gray-900 underline"
                            >
                                View Details
                            </button>
                            <QuickActions
                                order={order}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                disabled={processingOrders.has(order.id)}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
