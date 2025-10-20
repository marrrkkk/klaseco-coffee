import { useState } from "react";
import { ClockIcon, EyeIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/Utils/currency";
import OrderActions from "./OrderActions";

export default function OrderQueue({
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

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes === 1) return "1 minute ago";
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours === 1) return "1 hour ago";
        return `${diffInHours} hours ago`;
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
            <div className="flex flex-col items-center justify-center py-16">
                <div className="loading-spinner h-12 w-12 mb-4"></div>
                <p className="text-coffee-600 font-medium">Loading orders...</p>
                <p className="text-coffee-400 text-sm mt-1">
                    Please wait while we fetch the latest data
                </p>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-coffee-800 mb-2">
                    No pending orders
                </h3>
                <p className="text-coffee-600 mb-4">
                    New orders will appear here when customers place them.
                </p>
                <div className="bg-coffee-50 rounded-lg p-4 max-w-md mx-auto border border-coffee-200">
                    <p className="text-coffee-700 text-sm font-medium mb-2">
                        💡 While you wait:
                    </p>
                    <ul className="text-coffee-600 text-sm space-y-1">
                        <li>• Check inventory levels</li>
                        <li>• Review menu items</li>
                        <li>• Prepare for the next rush</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <div
                    key={order.id}
                    className="coffee-card overflow-hidden hover:scale-[1.01] transition-all duration-200"
                >
                    {/* Enhanced Order Header */}
                    <div className="coffee-card-header">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-coffee-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        #{order.id}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-coffee-800">
                                            Order #{order.id}
                                        </h3>
                                        <span className="status-badge status-pending">
                                            ⏳ Pending Review
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center space-x-2 text-sm text-coffee-600 mb-1">
                                    <ClockIcon className="h-4 w-4" />
                                    <span className="font-medium">
                                        {formatTime(order.created_at)}
                                    </span>
                                </div>
                                <div className="text-xs text-coffee-500">
                                    {getTimeAgo(order.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Order Content */}
                    <div className="coffee-card-body">
                        {/* Customer Info */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-coffee-100 rounded-full flex items-center justify-center">
                                        <span className="text-coffee-600 font-bold text-lg">
                                            {order.customer_name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-coffee-800 text-lg">
                                            {order.customer_name}
                                        </p>
                                        <p className="text-coffee-600 flex items-center">
                                            <span className="mr-1">📱</span>
                                            {order.customer_phone}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-coffee-50 rounded-lg p-3 border border-coffee-200">
                                        <p className="currency-large mb-1">
                                            {formatCurrency(order.total_amount)}
                                        </p>
                                        <p className="text-sm text-coffee-600">
                                            {order.order_items?.length || 0}{" "}
                                            item(s)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Order Items Preview */}
                        <div className="mb-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="text-lg">☕</span>
                                <h4 className="font-semibold text-coffee-800">
                                    Order Items
                                </h4>
                            </div>
                            <div className="bg-coffee-50 rounded-lg p-4 space-y-3 border border-coffee-200">
                                {order.order_items
                                    ?.slice(0, 3)
                                    .map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center bg-white rounded-lg p-3 border border-coffee-200"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-coffee-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                    {item.quantity}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-coffee-800">
                                                        {item.menu_item?.name}
                                                    </span>
                                                    <div className="text-xs text-coffee-600">
                                                        {item.size} •{" "}
                                                        {item.variant}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="currency font-bold">
                                                {formatCurrency(item.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                {order.order_items?.length > 3 && (
                                    <div className="text-center py-2">
                                        <span className="text-sm text-coffee-600 bg-coffee-100 px-3 py-1 rounded-full">
                                            +{order.order_items.length - 3} more
                                            items
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Actions */}
                        <div className="flex space-x-3 pt-4 border-t border-coffee-200">
                            <button
                                onClick={() => onViewDetails(order)}
                                className="coffee-button-ghost flex items-center px-4 py-2"
                            >
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View Details
                            </button>
                            <div className="flex-1">
                                <OrderActions
                                    order={order}
                                    onAccept={handleAccept}
                                    onReject={handleReject}
                                    disabled={processingOrders.has(order.id)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
