import {
    ClockIcon,
    EyeIcon,
    UserIcon,
    PhoneIcon,
} from "@heroicons/react/24/outline";
import ReadyButton from "./ReadyButton";

export default function OrderCard({
    order,
    onViewDetails,
    onMarkReady,
    isProcessing,
    formatCurrency,
    formatTime,
    getTimeAgo,
    getStatusColor,
    getStatusLabel,
}) {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Order Header */}
            <div className="px-4 py-3 bg-coffee-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-coffee-800">
                        Order #{order.id}
                    </h3>
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                        )}`}
                    >
                        {getStatusLabel(order.status)}
                    </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatTime(order.created_at)}</span>
                    <span className="text-gray-400">•</span>
                    <span>{getTimeAgo(order.created_at)}</span>
                </div>
            </div>

            {/* Order Content */}
            <div className="px-4 py-4">
                {/* Customer Info */}
                <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-1">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-900">
                            {order.customer_name}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <PhoneIcon className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-600">
                            {order.customer_phone}
                        </p>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Total Amount
                        </span>
                        <span className="text-lg font-bold text-coffee-600">
                            {formatCurrency(order.total_amount)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Items</span>
                        <span className="text-sm font-medium text-gray-900">
                            {order.order_items?.length || 0} item(s)
                        </span>
                    </div>
                </div>

                {/* Order Items Preview */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Preparation Details:
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {order.order_items?.map((item, index) => (
                            <div
                                key={index}
                                className="text-sm border-l-2 border-coffee-200 pl-3"
                            >
                                <div className="font-medium text-gray-900">
                                    {item.quantity}x {item.menu_item?.name}
                                </div>
                                <div className="text-gray-600">
                                    Size: {item.size} • Variant: {item.variant}
                                </div>
                                {item.addons && item.addons.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
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

                {/* Cashier Info */}
                {order.cashier && (
                    <div className="mb-4 text-xs text-gray-500">
                        Accepted by: {order.cashier.name}
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                    <button
                        onClick={() => onViewDetails(order)}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-coffee-600 bg-coffee-50 hover:bg-coffee-100 rounded-lg transition-colors"
                    >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Full Details
                    </button>
                    <ReadyButton
                        order={order}
                        onMarkReady={onMarkReady}
                        disabled={isProcessing}
                    />
                </div>
            </div>
        </div>
    );
}
