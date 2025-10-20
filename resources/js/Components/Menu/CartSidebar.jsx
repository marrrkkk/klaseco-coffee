import { useState } from "react";
import { XMarkIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/Utils/currency";
import { useNotify } from "@/Hooks/useNotify";
import axios from "axios";

export default function CartSidebar({
    isOpen,
    onClose,
    cart,
    onRemoveItem,
    onUpdateQuantity,
    total,
}) {
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState(null);
    const notify = useNotify();

    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (!customerName.trim() || !customerPhone.trim()) {
            notify.validationError("Please enter your name and phone number");
            return;
        }

        if (cart.length === 0) {
            notify.validationError("Your cart is empty");
            return;
        }

        setIsSubmitting(true);

        try {
            const orderData = {
                customer_name: customerName.trim(),
                customer_phone: customerPhone.trim(),
                items: cart.map((item) => ({
                    menu_item_id: item.menu_item_id,
                    quantity: item.quantity,
                    size: item.size,
                    variant: item.variant,
                    addons: item.addons.map((addon) => ({
                        addon_id: addon.id,
                        quantity: addon.quantity,
                    })),
                })),
            };

            const response = await axios.post("/api/orders", orderData);

            setOrderSuccess(true);
            setOrderNumber(response.data.order.id);
            notify.orderSubmitted(response.data.order.id);

            // Clear form
            setCustomerName("");
            setCustomerPhone("");
        } catch (error) {
            console.error("Error submitting order:", error);
            if (error.response?.status === 422) {
                notify.validationError(
                    "Please check your order details and try again."
                );
            } else {
                notify.networkError();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (orderSuccess) {
            setOrderSuccess(false);
            setOrderNumber(null);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={handleClose}
            ></div>

            {/* Sidebar */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
                <div className="flex flex-col h-full">
                    {/* Enhanced Header */}
                    <div className="flex items-center justify-between p-6 border-b border-coffee-200 coffee-gradient text-white">
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                                {orderSuccess ? "🎉" : "🛒"}
                            </span>
                            <div>
                                <h3 className="text-xl font-bold">
                                    {orderSuccess
                                        ? "Order Confirmed!"
                                        : "Your Cart"}
                                </h3>
                                {!orderSuccess && (
                                    <p className="text-coffee-100 text-sm">
                                        Review your items before checkout
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-coffee-700 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {orderSuccess ? (
                        /* Enhanced Order Success */
                        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                <svg
                                    className="w-10 h-10 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h4 className="text-2xl font-bold text-coffee-800 mb-3">
                                Order Placed Successfully! 🎉
                            </h4>
                            <div className="bg-coffee-50 rounded-xl p-4 mb-6 border-2 border-coffee-200">
                                <p className="text-coffee-600 mb-2">
                                    Your order number is
                                </p>
                                <div className="text-3xl font-bold text-coffee-800 mb-2">
                                    #{orderNumber}
                                </div>
                                <p className="text-sm text-coffee-500">
                                    Keep this number for order tracking
                                </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                                <p className="text-blue-800 text-sm font-medium mb-1">
                                    📱 What's Next?
                                </p>
                                <p className="text-blue-700 text-sm">
                                    We'll notify you when your order is ready
                                    for pickup. Estimated time: 5-10 minutes.
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="coffee-button-lg w-full"
                            >
                                🛍️ Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🛒</div>
                                        <h4 className="text-lg font-semibold text-coffee-800 mb-2">
                                            Your cart is empty
                                        </h4>
                                        <p className="text-coffee-500">
                                            Add some delicious items to get
                                            started!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-coffee-50 rounded-lg p-4"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium text-coffee-800">
                                                        {item.name}
                                                    </h4>
                                                    <button
                                                        onClick={() =>
                                                            onRemoveItem(
                                                                item.id
                                                            )
                                                        }
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="text-sm text-coffee-600 mb-2">
                                                    {item.size === "daily"
                                                        ? "Daily"
                                                        : "Extra"}{" "}
                                                    •{" "}
                                                    {item.variant === "hot"
                                                        ? "Hot"
                                                        : "Cold"}
                                                </div>

                                                {item.addons.length > 0 && (
                                                    <div className="text-sm text-coffee-600 mb-2">
                                                        Add-ons:{" "}
                                                        {item.addons
                                                            .map(
                                                                (addon) =>
                                                                    addon.name
                                                            )
                                                            .join(", ")}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                onUpdateQuantity(
                                                                    item.id,
                                                                    item.quantity -
                                                                        1
                                                                )
                                                            }
                                                            className="p-1 rounded border border-coffee-300 text-coffee-600 hover:bg-coffee-100"
                                                        >
                                                            <MinusIcon className="h-4 w-4" />
                                                        </button>
                                                        <span className="font-medium text-coffee-800 min-w-[1.5rem] text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                onUpdateQuantity(
                                                                    item.id,
                                                                    item.quantity +
                                                                        1
                                                                )
                                                            }
                                                            className="p-1 rounded border border-coffee-300 text-coffee-600 hover:bg-coffee-100"
                                                        >
                                                            <PlusIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="currency-large">
                                                        {formatCurrency(
                                                            item.subtotal
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Checkout Form */}
                            {cart.length > 0 && (
                                <div className="border-t border-coffee-200 p-4">
                                    <form
                                        onSubmit={handleSubmitOrder}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                value={customerName}
                                                onChange={(e) =>
                                                    setCustomerName(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                                                placeholder="Enter your name"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={customerPhone}
                                                onChange={(e) =>
                                                    setCustomerPhone(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-coffee-500 focus:border-coffee-500"
                                                placeholder="Enter your phone number"
                                                required
                                            />
                                        </div>

                                        <div className="border-t border-coffee-200 pt-4">
                                            <div className="bg-coffee-50 rounded-xl p-4 mb-6 border-2 border-coffee-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-semibold text-coffee-800">
                                                        💰 Total Amount:
                                                    </span>
                                                    <span className="text-2xl font-bold text-coffee-800">
                                                        {formatCurrency(total)}
                                                    </span>
                                                </div>
                                                <p className="text-coffee-500 text-sm mt-1">
                                                    All prices in Philippine
                                                    Peso (₱)
                                                </p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full coffee-gradient text-white py-4 px-6 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <div className="loading-spinner h-5 w-5 border-white"></div>
                                                        <span>
                                                            Placing Order...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <span className="text-lg">
                                                            🚀
                                                        </span>
                                                        <span>Place Order</span>
                                                        <span className="text-lg">
                                                            →
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
