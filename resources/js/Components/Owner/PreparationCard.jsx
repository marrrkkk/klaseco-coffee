import { ClockIcon, UserIcon } from "@heroicons/react/24/outline";
import ReadyNotificationButton from "./ReadyNotificationButton";

export default function PreparationCard({ order, onMarkReady, isProcessing }) {
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
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "preparing":
                return "bg-orange-50 text-orange-700 border-orange-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
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

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Order Header */}
            <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                        Order #{order.id}
                    </h3>
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            order.status
                        )}`}
                    >
                        {getStatusLabel(order.status)}
                    </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatTime(order.created_at)}</span>
                    <span className="text-gray-300">•</span>
                    <span>{getTimeAgo(order.created_at)}</span>
                </div>
            </div>

            {/* Order Content */}
            <div className="px-6 py-4">
                {/* Customer Info */}
                <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-1">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">
                            {order.customer_name}
                        </p>
                    </div>
                </div>

                {/* Preparation Details */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Preparation Details
                    </h4>
                    <div className="space-y-3">
                        {order.order_items?.map((item, index) => (
                            <div
                                key={index}
                                className="border-l-3 border-coffee-200 pl-4 py-2 bg-gray-50 rounded-r-lg"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-900">
                                        {item.quantity}x {item.menu_item?.name}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {formatCurrency(item.subtotal)}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">
                                        {item.size}
                                    </span>{" "}
                                    • {item.variant}
                                </div>
                                {item.addons && item.addons.length > 0 && (
                                    <div className="text-xs text-gray-500">
                                        Add-ons:{" "}
                                        {item.addons
                                            .map(
                                                (addon) =>
                                                    `${addon.quantity}x ${addon.addon?.name}`
                                            )
                                            .join(", ")}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                            Total Amount
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(order.total_amount)}
                        </span>
                    </div>
                </div>

                {/* Ready Notification Button */}
                <ReadyNotificationButton
                    order={order}
                    onMarkReady={onMarkReady}
                    isProcessing={isProcessing}
                />
            </div>
        </div>
    );
}
