import { useState } from "react";
import { ClockIcon, EyeIcon } from "@heroicons/react/24/outline";
import OrderCard from "./OrderCard";

export default function PreparationQueue({
    orders,
    onViewDetails,
    onMarkReady,
    isLoading = false,
}) {
    const [processingOrders, setProcessingOrders] = useState(new Set());

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

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

    const getStatusColor = (status) => {
        switch (status) {
            case "accepted":
                return "bg-blue-100 text-blue-800";
            case "preparing":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "accepted":
                return "Ready to Prepare";
            case "preparing":
                return "In Preparation";
            default:
                return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

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
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
                <span className="ml-3 text-gray-600">Loading orders...</span>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-12">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No orders in preparation queue
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Accepted orders will appear here for preparation.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
                <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={onViewDetails}
                    onMarkReady={handleMarkReady}
                    isProcessing={processingOrders.has(order.id)}
                    formatCurrency={formatCurrency}
                    formatTime={formatTime}
                    getTimeAgo={getTimeAgo}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                />
            ))}
        </div>
    );
}
