import { useState, useEffect } from "react";
import {
    CheckCircleIcon,
    ClockIcon,
    CogIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import MinimalistReceipt from "./MinimalistReceipt";
import SophisticatedLoadingState from "@/Components/SophisticatedLoadingState";
import axios from "axios";

export default function OrderTrackingInterface() {
    const [orderNumber, setOrderNumber] = useState("");
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [polling, setPolling] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [statusAnimation, setStatusAnimation] = useState("");

    // Auto-load order from URL parameter
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const orderParam = urlParams.get("order");
        if (orderParam) {
            setOrderNumber(orderParam);
            // Auto-track the order after component mounts
            setTimeout(() => {
                trackOrderById(orderParam);
            }, 100);
        }
    }, []);

    // Simple order status check without complex polling
    const currentOrderStatus = orderStatus;
    const currentError = error;
    const currentLoading = loading;

    const trackOrderById = async (orderId) => {
        if (!orderId || !orderId.trim()) {
            setError("Please enter an order number");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.get(`/api/orders/${orderId}/status`);
            const data = response.data;
            const orderData = data.order || data;

            setOrderStatus(orderData);
            setPolling(true);

            // Start simple polling for status updates
            if (!["served", "cancelled"].includes(orderData.status)) {
                startSimplePolling(orderId);
            }
        } catch (err) {
            setError("Order not found. Please check your order number.");
            setOrderStatus(null);
            setPolling(false);
        } finally {
            setLoading(false);
        }
    };

    const handleTrackOrder = async () => {
        trackOrderById(orderNumber);
    };

    // Simple polling without complex context
    const startSimplePolling = (orderId) => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await axios.get(
                    `/api/orders/${orderId}/status`
                );
                const data = response.data;
                const orderData = data.order || data;

                if (orderData && orderData.status !== orderStatus?.status) {
                    setStatusAnimation("animate-pulse");
                    setTimeout(() => setStatusAnimation(""), 1000);
                }

                setOrderStatus(orderData);

                if (["served", "cancelled"].includes(orderData.status)) {
                    clearInterval(pollInterval);
                    setPolling(false);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 5000); // Poll every 5 seconds

        // Cleanup on unmount
        return () => clearInterval(pollInterval);
    };

    const markAsServed = async () => {
        if (!currentOrderStatus) return;

        try {
            setLoading(true);
            await axios.patch(`/api/orders/${currentOrderStatus.id}/served`);

            // Update local status and show receipt with elegant transition
            setOrderStatus((prev) => ({ ...prev, status: "served" }));
            setPolling(false);

            // Delay receipt modal for smooth transition
            setTimeout(() => setShowReceipt(true), 500);
        } catch (error) {
            setError("Failed to mark order as served. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                icon: ClockIcon,
                color: "text-amber-600",
                bgColor: "bg-amber-50",
                borderColor: "border-amber-200",
                title: "Order Received",
                subtitle: "Awaiting confirmation",
                progress: 25,
            },
            accepted: {
                icon: CheckCircleIcon,
                color: "text-blue-600",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200",
                title: "Order Confirmed",
                subtitle: "Preparation will begin shortly",
                progress: 50,
            },
            preparing: {
                icon: CogIcon,
                color: "text-coffee-accent",
                bgColor: "bg-orange-50",
                borderColor: "border-orange-200",
                title: "Crafting Your Order",
                subtitle: "Our barista is preparing your coffee",
                progress: 75,
            },
            ready: {
                icon: SparklesIcon,
                color: "text-success-green",
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
                title: "Ready for Pickup!",
                subtitle: "Your order is waiting for you",
                progress: 100,
            },
            served: {
                icon: CheckCircleIconSolid,
                color: "text-medium-gray",
                bgColor: "bg-light-gray",
                borderColor: "border-medium-gray",
                title: "Order Complete",
                subtitle: "Thank you for choosing KlaséCo",
                progress: 100,
            },
            cancelled: {
                icon: CheckCircleIcon,
                color: "text-red-600",
                bgColor: "bg-red-50",
                borderColor: "border-red-200",
                title: "Order Cancelled",
                subtitle: "Please contact us for assistance",
                progress: 0,
            },
        };
        return configs[status] || configs.pending;
    };

    const StatusProgressBar = ({ progress }) => (
        <div className="w-full bg-light-gray rounded-full h-1 mb-6">
            <div
                className="bg-coffee-accent h-1 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );

    const StatusIcon = ({ config, animated }) => {
        const IconComponent = config.icon;
        return (
            <div
                className={`
                w-16 h-16 rounded-full ${config.bgColor} ${
                    config.borderColor
                } border-2
                flex items-center justify-center mb-4 mx-auto
                ${animated ? statusAnimation : ""}
                transition-all duration-300
            `}
            >
                <IconComponent className={`w-8 h-8 ${config.color}`} />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-primary-white">
            {/* Elegant Header */}
            <div className="bg-primary-white border-b border-light-gray">
                <div className="max-w-md mx-auto px-6 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-light text-dark-gray mb-2 tracking-wide">
                            Order Tracking
                        </h1>
                        <p className="text-medium-gray font-light">
                            Follow your coffee journey
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-6 py-8">
                {/* Minimalist Order Input */}
                <div className="mb-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-light text-medium-gray mb-3">
                                Order Number
                            </label>
                            <input
                                type="text"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                className="w-full px-4 py-4 border border-light-gray rounded-lg
                                         focus:ring-1 focus:ring-coffee-accent focus:border-coffee-accent
                                         bg-primary-white text-dark-gray font-light
                                         placeholder-medium-gray transition-all duration-200"
                                placeholder="Enter your order number"
                                onKeyPress={(e) =>
                                    e.key === "Enter" && handleTrackOrder()
                                }
                            />
                        </div>
                        <button
                            onClick={handleTrackOrder}
                            disabled={currentLoading}
                            className="w-full bg-coffee-accent text-primary-white py-4 rounded-lg
                                     font-light tracking-wide hover:bg-opacity-90
                                     transition-all duration-200 disabled:opacity-50
                                     transform hover:scale-[1.02] active:scale-[0.98]
                                     hover:shadow-md
                                     focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:ring-offset-2"
                        >
                            {currentLoading ? (
                                <SophisticatedLoadingState
                                    size="sm"
                                    message="Tracking..."
                                />
                            ) : (
                                "Track Order"
                            )}
                        </button>
                    </div>

                    {currentError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm font-light text-center">
                                {currentError}
                            </p>
                        </div>
                    )}
                </div>

                {/* Elegant Order Status Display */}
                {currentOrderStatus && (
                    <div className="bg-primary-white border border-light-gray rounded-2xl p-8 shadow-sm animate-slide-up">
                        {/* Progress Bar */}
                        <StatusProgressBar
                            progress={
                                getStatusConfig(currentOrderStatus.status)
                                    .progress
                            }
                        />

                        {/* Status Icon and Text */}
                        <div className="text-center mb-8">
                            <StatusIcon
                                config={getStatusConfig(
                                    currentOrderStatus.status
                                )}
                                animated={statusAnimation}
                            />
                            <h3 className="text-xl font-light text-dark-gray mb-2 tracking-wide">
                                {
                                    getStatusConfig(currentOrderStatus.status)
                                        .title
                                }
                            </h3>
                            <p className="text-medium-gray font-light">
                                {
                                    getStatusConfig(currentOrderStatus.status)
                                        .subtitle
                                }
                            </p>
                        </div>

                        {/* Minimalist Order Details */}
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center py-2 border-b border-light-gray">
                                <span className="text-medium-gray font-light">
                                    Order
                                </span>
                                <span className="text-dark-gray font-medium">
                                    #{currentOrderStatus.id}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-light-gray">
                                <span className="text-medium-gray font-light">
                                    Customer
                                </span>
                                <span className="text-dark-gray font-medium">
                                    {currentOrderStatus.customer_name}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-light-gray">
                                <span className="text-medium-gray font-light">
                                    Order Type
                                </span>
                                <span className="text-dark-gray font-medium">
                                    {currentOrderStatus.order_type_display ||
                                        (currentOrderStatus.order_type ===
                                        "dine_in"
                                            ? "Dine In"
                                            : "Take Away")}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-light-gray">
                                <span className="text-medium-gray font-light">
                                    Payment
                                </span>
                                <span className="text-dark-gray font-medium">
                                    {currentOrderStatus.payment_method_display ||
                                        (currentOrderStatus.payment_method ===
                                        "cash"
                                            ? "Cash"
                                            : "GCash")}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-light-gray">
                                <span className="text-medium-gray font-light">
                                    Total
                                </span>
                                <span className="text-dark-gray font-medium">
                                    ₱
                                    {parseFloat(
                                        currentOrderStatus.total_amount
                                    ).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-medium-gray font-light">
                                    Ordered
                                </span>
                                <span className="text-dark-gray font-medium">
                                    {new Date(
                                        currentOrderStatus.created_at
                                    ).toLocaleString("en-PH", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Elegant Order Items */}
                        {currentOrderStatus.items &&
                            currentOrderStatus.items.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-sm font-light text-medium-gray mb-4 tracking-wide uppercase">
                                        Your Order
                                    </h4>
                                    <div className="space-y-4">
                                        {currentOrderStatus.items.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-start"
                                                >
                                                    <div className="flex-1">
                                                        <div className="text-dark-gray font-medium mb-1">
                                                            {item.menu_item
                                                                ?.name ||
                                                                "Item"}
                                                        </div>
                                                        <div className="text-sm text-medium-gray font-light">
                                                            {item.size ===
                                                            "daily"
                                                                ? "Daily"
                                                                : "Extra"}{" "}
                                                            •{" "}
                                                            {item.variant ===
                                                            "hot"
                                                                ? "Hot"
                                                                : "Cold"}
                                                            {item.quantity >
                                                                1 &&
                                                                ` • Qty: ${item.quantity}`}
                                                        </div>
                                                        {item.addons &&
                                                            item.addons.length >
                                                                0 && (
                                                                <div className="text-sm text-coffee-accent font-light mt-1">
                                                                    +{" "}
                                                                    {item.addons
                                                                        .map(
                                                                            (
                                                                                addon
                                                                            ) =>
                                                                                addon.name
                                                                        )
                                                                        .join(
                                                                            ", "
                                                                        )}
                                                                </div>
                                                            )}
                                                    </div>
                                                    <div className="text-dark-gray font-medium ml-4">
                                                        ₱
                                                        {parseFloat(
                                                            item.subtotal
                                                        ).toFixed(2)}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Action Buttons */}
                        {currentOrderStatus.status === "ready" && (
                            <div className="space-y-4 animate-slide-up">
                                <button
                                    onClick={markAsServed}
                                    disabled={currentLoading}
                                    className="w-full bg-success-green text-primary-white py-4 rounded-lg
                                             font-light tracking-wide hover:bg-opacity-90
                                             transition-all duration-200 disabled:opacity-50
                                             transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0
                                             hover:shadow-lg
                                             focus:outline-none focus:ring-2 focus:ring-success-green focus:ring-offset-2
                                             group"
                                >
                                    {currentLoading ? (
                                        <SophisticatedLoadingState
                                            size="sm"
                                            message="Processing..."
                                        />
                                    ) : (
                                        <span className="flex items-center justify-center space-x-2">
                                            <svg
                                                className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <span>Confirm Pickup</span>
                                        </span>
                                    )}
                                </button>
                                <p className="text-sm text-medium-gray text-center font-light">
                                    Tap when you've received your order
                                </p>
                            </div>
                        )}

                        {currentOrderStatus.status === "served" && (
                            <div className="text-center space-y-4">
                                <div className="text-success-green font-medium mb-2">
                                    ✓ Order Complete
                                </div>
                                <p className="text-sm text-medium-gray font-light mb-4">
                                    Thank you for choosing KlaséCo
                                </p>
                                <button
                                    onClick={() => setShowReceipt(true)}
                                    className="bg-coffee-accent text-primary-white px-8 py-3 rounded-lg
                                             font-light tracking-wide hover:bg-opacity-90
                                             transition-all duration-200
                                             focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:ring-offset-2"
                                >
                                    View Receipt
                                </button>
                            </div>
                        )}

                        {currentOrderStatus.status === "cancelled" && (
                            <div className="text-center">
                                <div className="text-red-600 font-medium mb-2">
                                    Order Cancelled
                                </div>
                                <p className="text-sm text-medium-gray font-light">
                                    Please contact us if you have any questions
                                </p>
                            </div>
                        )}

                        {/* Elegant Real-time Indicator */}
                        {polling &&
                            currentOrderStatus.status !== "served" &&
                            currentOrderStatus.status !== "cancelled" && (
                                <div className="mt-8 pt-6 border-t border-light-gray">
                                    <div className="flex items-center justify-center space-x-3 text-medium-gray">
                                        <div className="w-2 h-2 bg-coffee-accent rounded-full animate-pulse"></div>
                                        <span className="text-sm font-light">
                                            Live updates active
                                        </span>
                                        <div
                                            className="w-2 h-2 bg-coffee-accent rounded-full animate-pulse"
                                            style={{ animationDelay: "0.5s" }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                    </div>
                )}

                {/* Elegant Instructions */}
                {!currentOrderStatus && (
                    <div className="bg-warm-white border border-light-gray rounded-2xl p-8 text-center">
                        <div className="w-12 h-12 bg-coffee-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SparklesIcon className="w-6 h-6 text-coffee-accent" />
                        </div>
                        <h3 className="text-lg font-light text-dark-gray mb-3 tracking-wide">
                            Track Your Coffee Journey
                        </h3>
                        <p className="text-medium-gray font-light text-sm leading-relaxed">
                            Enter your order number to follow your coffee from
                            preparation to pickup. We'll keep you updated with
                            real-time status changes.
                        </p>
                    </div>
                )}
            </div>

            {/* Minimalist Receipt Modal */}
            <MinimalistReceipt
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                order={currentOrderStatus}
            />
        </div>
    );
}
