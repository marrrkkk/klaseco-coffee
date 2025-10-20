import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import MinimalistLayout from "@/Layouts/MinimalistLayout";
import {
    useSeamlessPolling,
    useSeamlessOrderTracking,
} from "@/Hooks/useSeamlessPolling";
import ElegantErrorState, {
    ConnectionQualityIndicator,
    GracefulDegradationNotice,
} from "@/Components/ElegantErrorState";
import {
    OrderStatusTransition,
    LoadingTransition,
} from "@/Components/SmoothTransition";

export default function SeamlessPollingDemo() {
    const [orderNumber, setOrderNumber] = useState("");
    const [trackingEnabled, setTrackingEnabled] = useState(false);

    // Demo order tracking with seamless polling
    const {
        orderStatus,
        isLoading,
        error,
        isTransitioning,
        connectionQuality,
        checkOrderStatus,
    } = useSeamlessOrderTracking(
        orderNumber,
        (orderData, meta) => {
            console.log("Order status updated:", orderData);
        },
        {
            enabled: trackingEnabled && orderNumber.length > 0,
            smoothTransitions: true,
        }
    );

    // Demo queue stats polling
    const {
        error: statsError,
        connectionQuality: statsConnectionQuality,
        gracefulDegradation,
    } = useSeamlessPolling("demo-stats", "/api/orders/stats", {
        interval: 10000,
        enabled: true,
        priority: "low",
        backgroundUpdates: true,
        gracefulDegradation: true,
        onSuccess: (data) => {
            console.log("Queue stats updated:", data);
        },
        dependencies: [],
    });

    const handleStartTracking = () => {
        if (orderNumber.trim()) {
            setTrackingEnabled(true);
            checkOrderStatus(orderNumber);
        }
    };

    const handleStopTracking = () => {
        setTrackingEnabled(false);
    };

    return (
        <MinimalistLayout>
            <Head title="Seamless Polling Demo - KlaséCo" />

            <div className="min-h-screen bg-white">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Seamless Polling Demo
                        </h1>
                        <p className="text-lg text-gray-600">
                            Experience premium real-time updates with elegant
                            error handling
                        </p>
                    </div>

                    {/* Connection Quality Indicator */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Connection Status
                        </h2>
                        <div className="flex items-center justify-between">
                            <ConnectionQualityIndicator
                                quality={connectionQuality}
                            />
                            <div className="text-sm text-gray-500">
                                Real-time connection monitoring
                            </div>
                        </div>
                    </div>

                    {/* Graceful Degradation Notice */}
                    <GracefulDegradationNotice
                        isActive={gracefulDegradation}
                        className="mb-8"
                    />

                    {/* Error States */}
                    {error && (
                        <div className="mb-8">
                            <ElegantErrorState
                                error={error}
                                onRetry={() => checkOrderStatus(orderNumber)}
                                size="medium"
                            />
                        </div>
                    )}

                    {statsError && (
                        <div className="mb-8">
                            <ElegantErrorState
                                error={statsError}
                                onRetry={() => window.location.reload()}
                                size="small"
                                inline={true}
                            />
                        </div>
                    )}

                    {/* Order Tracking Demo */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Order Tracking with Smooth Transitions
                        </h2>

                        <div className="space-y-4">
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    value={orderNumber}
                                    onChange={(e) =>
                                        setOrderNumber(e.target.value)
                                    }
                                    placeholder="Enter order number (e.g., 1, 2, 3)"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={
                                        trackingEnabled
                                            ? handleStopTracking
                                            : handleStartTracking
                                    }
                                    disabled={!orderNumber.trim()}
                                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                        trackingEnabled
                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                            : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
                                    }`}
                                >
                                    {trackingEnabled
                                        ? "Stop Tracking"
                                        : "Start Tracking"}
                                </button>
                            </div>

                            {trackingEnabled && (
                                <div className="border-t pt-4">
                                    <LoadingTransition
                                        isLoading={isLoading}
                                        loadingComponent={
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                <span className="text-sm text-gray-600">
                                                    Loading order status...
                                                </span>
                                            </div>
                                        }
                                    >
                                        {orderStatus && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-900">
                                                        Order #{orderStatus.id}
                                                    </span>
                                                    <OrderStatusTransition
                                                        order={orderStatus}
                                                        isTransitioning={
                                                            isTransitioning
                                                        }
                                                    />
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <div>
                                                        Customer:{" "}
                                                        {
                                                            orderStatus.customer_name
                                                        }
                                                    </div>
                                                    <div>
                                                        Total: ₱
                                                        {
                                                            orderStatus.total_amount
                                                        }
                                                    </div>
                                                    <div>
                                                        Created:{" "}
                                                        {new Date(
                                                            orderStatus.created_at
                                                        ).toLocaleString()}
                                                    </div>
                                                </div>
                                                {isTransitioning && (
                                                    <div className="text-xs text-blue-600 flex items-center space-x-1">
                                                        <div className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"></div>
                                                        <span>
                                                            Status updating...
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </LoadingTransition>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Features Overview */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Seamless Polling Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">
                                    Background Updates
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Updates happen seamlessly in the background
                                    without interrupting user interactions.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">
                                    Smooth Transitions
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Status changes and data updates use elegant
                                    animations for a premium feel.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">
                                    Elegant Error Handling
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Network issues are handled gracefully with
                                    informative, non-intrusive error states.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">
                                    Adaptive Performance
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Polling frequency adapts to connection
                                    quality and user activity for optimal
                                    performance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MinimalistLayout>
    );
}
