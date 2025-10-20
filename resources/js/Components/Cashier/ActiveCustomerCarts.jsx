import React from "react";
import { formatCurrency } from "@/Utils/currency";

export default function ActiveCustomerCarts({ carts }) {
    if (!carts || carts.length === 0) {
        return (
            <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">
                    Active Customer Carts
                </h3>
                <p className="text-gray-500">No active customer carts</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
                Active Customer Carts
            </h3>
            <div className="space-y-4">
                {carts.map((cart) => (
                    <div
                        key={cart.id}
                        className="p-3 border border-gray-200 rounded hover:bg-gray-50"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-medium">
                                    Cart #{cart.id}
                                </span>
                                {cart.customer_name && (
                                    <span className="text-gray-600 ml-2">
                                        - {cart.customer_name}
                                    </span>
                                )}
                            </div>
                            <span className="text-gray-600 text-sm">
                                {formatCurrency(cart.total)}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {cart.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="text-sm text-gray-600 flex justify-between"
                                >
                                    <span>
                                        {item.quantity}x {item.name} (
                                        {item.size}, {item.variant})
                                    </span>
                                    <span>{formatCurrency(item.subtotal)}</span>
                                </div>
                            ))}
                        </div>
                        {cart.addons && cart.addons.length > 0 && (
                            <div className="mt-2 text-sm text-gray-500">
                                <div className="font-medium">Add-ons:</div>
                                {cart.addons.map((addon, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between pl-4"
                                    >
                                        <span>
                                            {addon.quantity}x {addon.name}
                                        </span>
                                        <span>
                                            {formatCurrency(
                                                addon.price * addon.quantity
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-2 text-sm text-gray-500">
                            Last updated:{" "}
                            {new Date(cart.updated_at).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
