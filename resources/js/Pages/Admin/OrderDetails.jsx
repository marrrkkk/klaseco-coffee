import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function OrderDetails({ order }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            accepted: "bg-blue-100 text-blue-800",
            preparing: "bg-purple-100 text-purple-800",
            ready: "bg-green-100 text-green-800",
            served: "bg-gray-100 text-gray-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    return (
        <AdminLayout title={`Order #${order.order_number}`}>
            <Head title={`Order #${order.order_number} - Admin`} />

            <div className="space-y-6">
                {/* Back Button */}
                <div>
                    <Link
                        href={route("admin.orders.index")}
                        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Transaction History
                    </Link>
                </div>

                {/* Order Header */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Order #{order.order_number}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Placed on {order.created_at}
                            </p>
                        </div>
                        <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(
                                order.status
                            )}`}
                        >
                            {order.status_display}
                        </span>
                    </div>

                    {/* Order Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Order Type
                            </h4>
                            <p className="text-lg font-semibold text-gray-900">
                                {order.order_type_display}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Payment Method
                            </h4>
                            <p className="text-lg font-semibold text-gray-900">
                                {order.payment_method_display}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Total Amount
                            </h4>
                            <p className="text-2xl font-bold text-green-600">
                                ₱{order.total_amount}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Last Updated
                            </h4>
                            <p className="text-lg font-semibold text-gray-900">
                                {order.updated_at}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Name
                            </h4>
                            <p className="text-lg font-semibold text-gray-900">
                                {order.customer_name}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Phone Number
                            </h4>
                            <p className="text-lg font-semibold text-gray-900">
                                {order.customer_phone || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Order Items
                    </h3>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {item.menu_item.name}
                                        </h4>
                                        {item.menu_item.category && (
                                            <p className="text-sm text-gray-500">
                                                {item.menu_item.category.name}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600 mt-1">
                                            {item.menu_item.description}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-xl font-bold text-gray-900">
                                            ₱{item.subtotal}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100">
                                        Quantity: {item.quantity}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                                        Size: {item.size_display}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                                        Variant: {item.variant_display}
                                    </span>
                                    <span className="text-gray-500">
                                        Unit Price: ₱{item.unit_price}
                                    </span>
                                </div>

                                {/* Add-ons */}
                                {item.addons && item.addons.length > 0 && (
                                    <div className="mt-3 pl-4 border-l-2 border-gray-200">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            Add-ons:
                                        </p>
                                        <div className="space-y-1">
                                            {item.addons.map((addon) => (
                                                <div
                                                    key={addon.id}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span className="text-gray-600">
                                                        {addon.quantity}x{" "}
                                                        {addon.name}
                                                    </span>
                                                    <span className="text-gray-900 font-medium">
                                                        ₱
                                                        {(
                                                            parseFloat(
                                                                addon.unit_price
                                                            ) * addon.quantity
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Order Total */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-gray-900">
                                Total Amount:
                            </span>
                            <span className="text-3xl font-bold text-green-600">
                                ₱{order.total_amount}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Staff Information */}
                {(order.cashier || order.owner) && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Staff Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {order.cashier && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                                        Cashier
                                    </h4>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {order.cashier.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {order.cashier.email}
                                    </p>
                                </div>
                            )}
                            {order.owner && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                                        Owner/Barista
                                    </h4>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {order.owner.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {order.owner.email}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Timestamps */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Order Timeline
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-600">
                                Order Created
                            </span>
                            <span className="text-sm text-gray-900">
                                {order.created_at}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm font-medium text-gray-600">
                                Last Updated
                            </span>
                            <span className="text-sm text-gray-900">
                                {order.updated_at}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
