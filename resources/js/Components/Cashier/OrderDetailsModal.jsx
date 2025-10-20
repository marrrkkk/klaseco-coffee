import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function OrderDetailsModal({ order, isOpen, onClose }) {
    if (!order) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-2xl font-bold leading-6 text-coffee-800"
                                    >
                                        Order #{order.id}
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Order Status and Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">
                                                Status
                                            </h4>
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">
                                                Order Time
                                            </h4>
                                            <p className="text-sm text-gray-900">
                                                {formatDateTime(
                                                    order.created_at
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    <div className="bg-coffee-50 rounded-lg p-4">
                                        <h4 className="text-lg font-semibold text-coffee-800 mb-3">
                                            Customer Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">
                                                    Name:
                                                </span>
                                                <p className="text-gray-900 font-medium">
                                                    {order.customer_name}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">
                                                    Phone:
                                                </span>
                                                <p className="text-gray-900 font-medium">
                                                    {order.customer_phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-coffee-800 mb-3">
                                            Order Items
                                        </h4>
                                        <div className="space-y-3">
                                            {order.order_items?.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-gray-200 rounded-lg p-4"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h5 className="font-semibold text-gray-900">
                                                                    {
                                                                        item
                                                                            .menu_item
                                                                            ?.name
                                                                    }
                                                                </h5>
                                                                <p className="text-sm text-gray-600">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                    x{" "}
                                                                    {item.size}{" "}
                                                                    •{" "}
                                                                    {
                                                                        item.variant
                                                                    }
                                                                </p>
                                                            </div>
                                                            <span className="font-semibold text-coffee-600">
                                                                {formatCurrency(
                                                                    item.subtotal
                                                                )}
                                                            </span>
                                                        </div>

                                                        {/* Add-ons */}
                                                        {item.addons &&
                                                            item.addons.length >
                                                                0 && (
                                                                <div className="mt-2 pl-4 border-l-2 border-coffee-200">
                                                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                                                        Add-ons:
                                                                    </p>
                                                                    {item.addons.map(
                                                                        (
                                                                            addon,
                                                                            addonIndex
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    addonIndex
                                                                                }
                                                                                className="flex justify-between text-sm text-gray-600"
                                                                            >
                                                                                <span>
                                                                                    {
                                                                                        addon.quantity
                                                                                    }
                                                                                    x{" "}
                                                                                    {
                                                                                        addon
                                                                                            .addon
                                                                                            ?.name
                                                                                    }
                                                                                </span>
                                                                                <span>
                                                                                    {formatCurrency(
                                                                                        addon.unit_price *
                                                                                            addon.quantity
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Total */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-coffee-800">
                                                Total Amount:
                                            </span>
                                            <span className="text-2xl font-bold text-coffee-600">
                                                {formatCurrency(
                                                    order.total_amount
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Staff Information */}
                                    {(order.cashier || order.barista) && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-3">
                                                Staff Information
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {order.cashier && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500">
                                                            Cashier:
                                                        </span>
                                                        <p className="text-gray-900 font-medium">
                                                            {order.cashier.name}
                                                        </p>
                                                    </div>
                                                )}
                                                {order.barista && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500">
                                                            Barista:
                                                        </span>
                                                        <p className="text-gray-900 font-medium">
                                                            {order.barista.name}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
