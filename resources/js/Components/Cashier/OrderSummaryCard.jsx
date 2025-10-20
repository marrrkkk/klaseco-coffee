import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/Utils/currency";
import QuickActions from "./QuickActions";

export default function OrderSummaryCard({
    order,
    isOpen,
    onClose,
    onAccept,
    onReject,
}) {
    if (!order) return null;

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                                {/* Condensed Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                            #{order.id}
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-lg font-semibold text-gray-900">
                                                {order.customer_name}
                                            </Dialog.Title>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <ClockIcon className="h-3 w-3 mr-1" />
                                                {formatDateTime(
                                                    order.created_at
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-500"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Essential Order Info */}
                                <div className="p-4 space-y-4">
                                    {/* Customer Contact */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            Phone:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {order.customer_phone}
                                        </span>
                                    </div>

                                    {/* Order Items - Condensed */}
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 mb-2">
                                            Items (
                                            {order.order_items?.length || 0})
                                        </div>
                                        <div className="space-y-2">
                                            {order.order_items?.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between items-center text-sm"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">
                                                                {item.quantity}x{" "}
                                                                {
                                                                    item
                                                                        .menu_item
                                                                        ?.name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {item.size} •{" "}
                                                                {item.variant}
                                                                {item.addons &&
                                                                    item.addons
                                                                        .length >
                                                                        0 && (
                                                                        <span className="ml-1">
                                                                            +{" "}
                                                                            {
                                                                                item
                                                                                    .addons
                                                                                    .length
                                                                            }{" "}
                                                                            add-on(s)
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        </div>
                                                        <div className="font-medium text-gray-900">
                                                            {formatCurrency(
                                                                item.subtotal
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-900">
                                                Total
                                            </span>
                                            <span className="text-xl font-bold text-gray-900">
                                                {formatCurrency(
                                                    order.total_amount
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions Footer */}
                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                    <div className="flex justify-center">
                                        <QuickActions
                                            order={order}
                                            onAccept={onAccept}
                                            onReject={onReject}
                                        />
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
