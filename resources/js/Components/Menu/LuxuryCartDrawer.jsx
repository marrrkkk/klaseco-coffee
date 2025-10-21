import { useState, useRef, useEffect } from "react";
import { formatCurrency } from "@/Utils/currency";
import axios from "axios";

export default function LuxuryCartDrawer({
    isOpen,
    onClose,
    cart,
    onRemoveItem,
    onUpdateQuantity,
    onClearCart,
    total,
    isMobile = false,
}) {
    const [customerName, setCustomerName] = useState("");
    const [orderType, setOrderType] = useState("dine_in");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [currentStep, setCurrentStep] = useState(1); // 1: Cart, 2: Details, 3: Order Type, 4: Payment
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState(null);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    // Mobile gesture handling
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [dragOffset, setDragOffset] = useState(0);
    const drawerRef = useRef(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    // Touch gesture handlers for mobile swipe-to-close
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
        const distance = e.targetTouches[0].clientX - touchStart;
        if (distance > 0) {
            setDragOffset(distance);
        }
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchEnd - touchStart;
        const isRightSwipe = distance > minSwipeDistance;

        if (isRightSwipe) {
            handleClose();
        }

        setDragOffset(0);
        setTouchStart(null);
        setTouchEnd(null);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!customerName.trim()) {
            newErrors.customerName = "Please enter your name";
        } else if (customerName.trim().length < 2) {
            newErrors.customerName = "Name must be at least 2 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setErrors({ ...errors, submit: "Please check your information" });
            return;
        }

        if (cart.length === 0) {
            setErrors({ ...errors, submit: "Your selection is empty" });
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const orderData = {
                customer_name: customerName.trim(),
                customer_phone: "N/A",
                order_type: orderType,
                payment_method: paymentMethod,
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

            // Redirect to tracking page with order number
            window.location.href = `/track-order?order=${response.data.order.order_number}`;
        } catch (error) {
            console.error("=== ERROR SUBMITTING ORDER ===");
            console.error("Error:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            console.error("Error message:", error.message);

            if (error.response?.status === 422) {
                const serverErrors = error.response.data.errors || {};
                setErrors({
                    ...serverErrors,
                    submit: "Please check your order details and try again.",
                });
            } else if (error.response?.status === 500) {
                setErrors({
                    submit:
                        error.response.data.message ||
                        "Server error. Please try again later.",
                });
            } else {
                setErrors({
                    submit: "Network error. Please check your connection and try again.",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (orderSuccess) {
            setOrderSuccess(false);
            setOrderNumber(null);
            // Clear the cart when closing the success screen
            if (onClearCart) {
                onClearCart();
            }
        }
        setErrors({});
        setDragOffset(0);
        setCurrentStep(1);
        onClose();
    };

    const handleNextStep = () => {
        if (currentStep === 2) {
            // Validate name before proceeding
            if (!customerName.trim()) {
                setErrors({ customerName: "Please enter your name" });
                return;
            }
            if (customerName.trim().length < 2) {
                setErrors({
                    customerName: "Name must be at least 2 characters",
                });
                return;
            }
            setErrors({});
        }
        setCurrentStep(currentStep + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
        setErrors({});
    };

    if (!isOpen && isMobile) return null;

    const drawerContent = (
        <div className="flex flex-col h-full bg-primary-white">
            {/* Elegant Header */}
            <div className="border-b border-light-gray p-8">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="text-2xl font-light text-dark-gray tracking-wide">
                            {orderSuccess
                                ? "Order Confirmed"
                                : currentStep === 1
                                ? "Your Selection"
                                : currentStep === 2
                                ? "Your Details"
                                : currentStep === 3
                                ? "Order Type"
                                : "Payment Method"}
                        </h3>
                        {!orderSuccess && (
                            <p className="text-medium-gray font-light text-sm mt-1">
                                {currentStep === 1
                                    ? "Review your curated items"
                                    : currentStep === 2
                                    ? "Tell us your name"
                                    : currentStep === 3
                                    ? "Choose how you'd like to receive your order"
                                    : "Select your payment method"}
                            </p>
                        )}
                        {!orderSuccess && currentStep > 1 && (
                            <div className="flex items-center space-x-2 mt-3">
                                {[1, 2, 3, 4].map((step) => (
                                    <div
                                        key={step}
                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                            step <= currentStep
                                                ? "bg-coffee-accent"
                                                : "bg-light-gray"
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {isMobile && (
                        <button
                            onClick={handleClose}
                            className="text-medium-gray hover:text-dark-gray transition-colors duration-300 ml-4"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {orderSuccess ? (
                /* Full Screen Order Success Overlay */
                <div className="absolute inset-0 bg-primary-white z-[110] flex flex-col">
                    {/* Close Button */}
                    <div className="absolute top-6 right-6 z-[111]">
                        <button
                            onClick={handleClose}
                            className="text-medium-gray hover:text-dark-gray transition-colors duration-300 p-2"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Success Content - Starts from Top */}
                    <div className="flex-1 overflow-y-auto pt-20 pb-8 px-8">
                        <div className="max-w-md mx-auto space-y-8 text-center">
                            {/* Success Icon */}
                            <div className="flex justify-center">
                                <div className="w-24 h-24 bg-coffee-accent rounded-full flex items-center justify-center shadow-xl">
                                    <svg
                                        className="w-12 h-12 text-primary-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Success Title */}
                            <div>
                                <h4 className="text-3xl md:text-4xl font-light text-dark-gray tracking-wide mb-2">
                                    Order Placed Successfully
                                </h4>
                                <p className="text-medium-gray font-light">
                                    Thank you for your order!
                                </p>
                            </div>

                            {/* Order Number Card */}
                            <div className="bg-warm-white border-2 border-coffee-accent rounded-xl p-8 shadow-lg">
                                <p className="text-medium-gray font-light mb-3 text-xs uppercase tracking-widest">
                                    Your order number
                                </p>
                                <div className="text-5xl md:text-6xl font-light text-coffee-accent mb-3 tracking-wide">
                                    #{String(orderNumber).padStart(4, "0")}
                                </div>
                                <p className="text-sm text-medium-gray font-light mb-4">
                                    Please keep this number for tracking
                                </p>

                                {/* Order Details */}
                                <div className="border-t border-light-gray pt-4 mt-4 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-medium-gray font-light">
                                            Order Type
                                        </span>
                                        <span className="text-dark-gray font-medium">
                                            {orderType === "dine_in"
                                                ? "Dine In"
                                                : "Take Away"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-medium-gray font-light">
                                            Payment
                                        </span>
                                        <span className="text-dark-gray font-medium">
                                            {paymentMethod === "cash"
                                                ? "Cash"
                                                : "GCash"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-2 border-t border-light-gray">
                                        <span className="text-medium-gray font-light">
                                            Total
                                        </span>
                                        <span className="text-dark-gray font-medium">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* What's Next Card */}
                            <div className="bg-light-gray rounded-xl p-6">
                                <p className="text-dark-gray font-medium text-sm mb-3 uppercase tracking-wider">
                                    What's Next?
                                </p>
                                <p className="text-medium-gray font-light text-sm leading-relaxed">
                                    We'll notify you when your order is ready
                                    for pickup. Estimated preparation time: 5-10
                                    minutes.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-4">
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-coffee-accent text-primary-white py-4 px-8 rounded-xl font-light tracking-wide
                                             hover:bg-dark-gray transition-all duration-300
                                             transform hover:scale-[1.02] active:scale-[0.98]
                                             shadow-lg hover:shadow-xl
                                             focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:ring-offset-2"
                                >
                                    Continue Shopping
                                </button>
                                <a
                                    href="/track-order"
                                    className="block w-full border-2 border-coffee-accent text-coffee-accent py-4 px-8 rounded-xl font-light tracking-wide
                                             hover:bg-coffee-accent hover:text-primary-white transition-all duration-300
                                             transform hover:scale-[1.02] active:scale-[0.98]
                                             focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:ring-offset-2"
                                >
                                    Track Your Order
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Step Content */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {cart.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl text-medium-gray">
                                        ☕
                                    </span>
                                </div>
                                <h4 className="text-xl font-light text-dark-gray mb-3 tracking-wide">
                                    Your selection is empty
                                </h4>
                                <p className="text-medium-gray font-light">
                                    Add some premium items to get started
                                </p>
                            </div>
                        ) : currentStep === 1 ? (
                            /* Step 1: Cart Items */
                            <div className="space-y-6">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border-b border-light-gray pb-6 last:border-b-0"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-light text-dark-gray text-lg">
                                                {item.name}
                                            </h4>
                                            <button
                                                onClick={() =>
                                                    onRemoveItem(item.id)
                                                }
                                                className="text-medium-gray hover:text-dark-gray text-sm font-light transition-colors duration-300"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="text-sm text-medium-gray font-light mb-3">
                                            {item.size === "daily"
                                                ? "Daily"
                                                : "Extra"}{" "}
                                            •{" "}
                                            {item.variant === "hot"
                                                ? "Hot"
                                                : "Cold"}
                                        </div>

                                        {item.addons.length > 0 && (
                                            <div className="text-sm text-medium-gray font-light mb-3">
                                                Upgrades:{" "}
                                                {item.addons
                                                    .map((addon) => addon.name)
                                                    .join(", ")}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() =>
                                                        onUpdateQuantity(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="w-8 h-8 border border-medium-gray text-medium-gray hover:border-dark-gray hover:text-dark-gray transition-all duration-300"
                                                >
                                                    −
                                                </button>
                                                <span className="font-light text-dark-gray min-w-[1.5rem] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        onUpdateQuantity(
                                                            item.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="w-8 h-8 border border-medium-gray text-medium-gray hover:border-dark-gray hover:text-dark-gray transition-all duration-300"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-lg font-light text-dark-gray">
                                                {formatCurrency(item.subtotal)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : currentStep === 2 ? (
                            /* Step 2: Customer Name */
                            <div className="max-w-md mx-auto py-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-warm-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg
                                            className="w-8 h-8 text-coffee-accent"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-light text-dark-gray mb-2">
                                        What's your name?
                                    </h4>
                                    <p className="text-medium-gray font-light text-sm">
                                        We'll call you when your order is ready
                                    </p>
                                </div>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => {
                                        setCustomerName(e.target.value);
                                        if (errors.customerName) {
                                            setErrors({});
                                        }
                                    }}
                                    className={`w-full px-6 py-4 border-2 rounded-lg font-light text-lg transition-all duration-200
                                        ${
                                            errors.customerName
                                                ? "border-red-300 focus:border-red-500"
                                                : "border-light-gray focus:border-coffee-accent"
                                        }
                                        focus:outline-none placeholder-medium-gray text-center`}
                                    placeholder="Enter your name"
                                    autoFocus
                                />
                                {errors.customerName && (
                                    <p className="text-sm text-red-600 font-light mt-3 text-center">
                                        {errors.customerName}
                                    </p>
                                )}
                            </div>
                        ) : currentStep === 3 ? (
                            /* Step 3: Order Type */
                            <div className="max-w-md mx-auto py-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-warm-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg
                                            className="w-8 h-8 text-coffee-accent"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-light text-dark-gray mb-2">
                                        How would you like your order?
                                    </h4>
                                    <p className="text-medium-gray font-light text-sm">
                                        Choose your preferred option
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => setOrderType("dine_in")}
                                        className={`w-full p-6 border-2 rounded-lg font-light transition-all duration-200 text-left ${
                                            orderType === "dine_in"
                                                ? "border-coffee-accent bg-warm-white"
                                                : "border-light-gray hover:border-medium-gray"
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                    orderType === "dine_in"
                                                        ? "border-coffee-accent"
                                                        : "border-medium-gray"
                                                }`}
                                            >
                                                {orderType === "dine_in" && (
                                                    <div className="w-3 h-3 rounded-full bg-coffee-accent" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-dark-gray">
                                                    Dine In
                                                </div>
                                                <div className="text-sm text-medium-gray">
                                                    Enjoy your coffee here
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOrderType("take_away")
                                        }
                                        className={`w-full p-6 border-2 rounded-lg font-light transition-all duration-200 text-left ${
                                            orderType === "take_away"
                                                ? "border-coffee-accent bg-warm-white"
                                                : "border-light-gray hover:border-medium-gray"
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                    orderType === "take_away"
                                                        ? "border-coffee-accent"
                                                        : "border-medium-gray"
                                                }`}
                                            >
                                                {orderType === "take_away" && (
                                                    <div className="w-3 h-3 rounded-full bg-coffee-accent" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-dark-gray">
                                                    Take Away
                                                </div>
                                                <div className="text-sm text-medium-gray">
                                                    Grab and go
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Step 4: Payment Method */
                            <div className="max-w-md mx-auto py-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-warm-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg
                                            className="w-8 h-8 text-coffee-accent"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                            />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-light text-dark-gray mb-2">
                                        How will you pay?
                                    </h4>
                                    <p className="text-medium-gray font-light text-sm">
                                        Select your payment method
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("cash")}
                                        className={`w-full p-6 border-2 rounded-lg font-light transition-all duration-200 text-left ${
                                            paymentMethod === "cash"
                                                ? "border-coffee-accent bg-warm-white"
                                                : "border-light-gray hover:border-medium-gray"
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                    paymentMethod === "cash"
                                                        ? "border-coffee-accent"
                                                        : "border-medium-gray"
                                                }`}
                                            >
                                                {paymentMethod === "cash" && (
                                                    <div className="w-3 h-3 rounded-full bg-coffee-accent" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-dark-gray">
                                                    Cash
                                                </div>
                                                <div className="text-sm text-medium-gray">
                                                    Pay at the counter
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPaymentMethod("gcash")
                                        }
                                        className={`w-full p-6 border-2 rounded-lg font-light transition-all duration-200 text-left ${
                                            paymentMethod === "gcash"
                                                ? "border-coffee-accent bg-warm-white"
                                                : "border-light-gray hover:border-medium-gray"
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                    paymentMethod === "gcash"
                                                        ? "border-coffee-accent"
                                                        : "border-medium-gray"
                                                }`}
                                            >
                                                {paymentMethod === "gcash" && (
                                                    <div className="w-3 h-3 rounded-full bg-coffee-accent" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-dark-gray">
                                                    GCash
                                                </div>
                                                <div className="text-sm text-medium-gray">
                                                    Digital payment
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step Navigation Footer */}
                    {cart.length > 0 && (
                        <div className="border-t border-light-gray p-8">
                            <div className="bg-warm-white p-4 mb-6 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-light text-medium-gray">
                                        Total Amount
                                    </span>
                                    <span className="text-xl font-medium text-dark-gray">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>

                            {errors.submit && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600 font-light">
                                        {errors.submit}
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-3">
                                {currentStep > 1 && (
                                    <button
                                        onClick={handlePreviousStep}
                                        className="px-6 py-4 border-2 border-medium-gray text-medium-gray rounded-lg font-light hover:border-dark-gray hover:text-dark-gray transition-all duration-300"
                                    >
                                        Back
                                    </button>
                                )}
                                {currentStep < 4 ? (
                                    <button
                                        onClick={handleNextStep}
                                        className="flex-1 bg-coffee-accent text-primary-white py-4 px-6 rounded-lg font-light tracking-wide hover:bg-dark-gray transition-all duration-300"
                                    >
                                        Continue
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-dark-gray text-primary-white py-4 px-6 rounded-lg font-light tracking-wide hover:bg-coffee-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center space-x-3">
                                                <div className="w-4 h-4 border border-primary-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Placing Order...</span>
                                            </div>
                                        ) : (
                                            "Place Order"
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-[100] overflow-hidden">
                {/* Backdrop with fade animation */}
                <div
                    className="absolute inset-0 bg-dark-gray transition-opacity duration-300 z-[100]"
                    style={{ opacity: isOpen ? 0.5 : 0 }}
                    onClick={handleClose}
                ></div>

                {/* Mobile Drawer with swipe gesture */}
                <div
                    ref={drawerRef}
                    className="absolute right-0 top-0 h-full w-full max-w-md bg-primary-white transition-transform duration-300 ease-out shadow-2xl z-[101]"
                    style={{
                        transform: `translateX(${dragOffset}px)`,
                        transition:
                            dragOffset > 0
                                ? "none"
                                : "transform 300ms ease-out",
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Swipe indicator */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-coffee-accent opacity-20 rounded-r-full"></div>
                    {drawerContent}
                </div>
            </div>
        );
    }

    return drawerContent;
}
