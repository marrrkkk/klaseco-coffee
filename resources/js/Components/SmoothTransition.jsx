import React, { useState, useEffect, useRef } from "react";
import { Transition } from "@headlessui/react";

const SmoothTransition = ({
    children,
    isTransitioning,
    transitionData,
    duration = 300,
    type = "fade",
    className = "",
    onTransitionComplete,
}) => {
    const [showTransition, setShowTransition] = useState(false);
    const [currentContent, setCurrentContent] = useState(children);
    const [nextContent, setNextContent] = useState(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (isTransitioning && transitionData) {
            // Start transition
            setShowTransition(true);
            setNextContent(children);

            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Complete transition after duration
            timeoutRef.current = setTimeout(() => {
                setCurrentContent(children);
                setNextContent(null);
                setShowTransition(false);

                if (onTransitionComplete) {
                    onTransitionComplete(transitionData);
                }
            }, duration);
        } else if (!isTransitioning) {
            // No transition needed, update content immediately
            setCurrentContent(children);
            setNextContent(null);
            setShowTransition(false);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [
        isTransitioning,
        transitionData,
        children,
        duration,
        onTransitionComplete,
    ]);

    const getTransitionClasses = (type, entering) => {
        switch (type) {
            case "slide":
                return {
                    enter: "transform transition-transform duration-300 ease-out",
                    enterFrom: entering
                        ? "translate-x-full"
                        : "-translate-x-full",
                    enterTo: "translate-x-0",
                    leave: "transform transition-transform duration-300 ease-in",
                    leaveFrom: "translate-x-0",
                    leaveTo: entering
                        ? "-translate-x-full"
                        : "translate-x-full",
                };
            case "scale":
                return {
                    enter: "transform transition-all duration-300 ease-out",
                    enterFrom: "scale-95 opacity-0",
                    enterTo: "scale-100 opacity-100",
                    leave: "transform transition-all duration-300 ease-in",
                    leaveFrom: "scale-100 opacity-100",
                    leaveTo: "scale-105 opacity-0",
                };
            case "fade":
            default:
                return {
                    enter: "transition-opacity duration-300 ease-out",
                    enterFrom: "opacity-0",
                    enterTo: "opacity-100",
                    leave: "transition-opacity duration-300 ease-in",
                    leaveFrom: "opacity-100",
                    leaveTo: "opacity-0",
                };
        }
    };

    const transitionClasses = getTransitionClasses(type);

    if (!showTransition) {
        return <div className={className}>{currentContent}</div>;
    }

    return (
        <div className={`relative ${className}`}>
            {/* Current content (leaving) */}
            <Transition show={!showTransition} {...transitionClasses}>
                <div className="absolute inset-0">{currentContent}</div>
            </Transition>

            {/* Next content (entering) */}
            <Transition show={showTransition} {...transitionClasses}>
                <div>{nextContent}</div>
            </Transition>
        </div>
    );
};

// Order status transition component
export const OrderStatusTransition = ({
    order,
    isTransitioning,
    transitionData,
    className = "",
}) => {
    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "accepted":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "preparing":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "ready":
                return "bg-green-100 text-green-800 border-green-200";
            case "served":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending":
                return "Pending";
            case "accepted":
                return "Accepted";
            case "preparing":
                return "Preparing";
            case "ready":
                return "Ready";
            case "served":
                return "Served";
            case "cancelled":
                return "Cancelled";
            default:
                return status;
        }
    };

    const currentStatus = order?.status || "unknown";
    const statusColor = getStatusColor(currentStatus);
    const statusLabel = getStatusLabel(currentStatus);

    return (
        <SmoothTransition
            isTransitioning={isTransitioning}
            transitionData={transitionData}
            type="scale"
            className={className}
        >
            <span
                className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                border transition-all duration-200
                ${statusColor}
            `}
            >
                {statusLabel}
            </span>
        </SmoothTransition>
    );
};

// Order list transition component
export const OrderListTransition = ({
    orders,
    isTransitioning,
    transitionData,
    renderOrder,
    className = "",
}) => {
    return (
        <SmoothTransition
            isTransitioning={isTransitioning}
            transitionData={transitionData}
            type="fade"
            className={className}
            onTransitionComplete={(data) => {
                // Log transition details for debugging
                if (data?.added?.length > 0) {
                    console.debug(`${data.added.length} new orders added`);
                }
                if (data?.removed?.length > 0) {
                    console.debug(`${data.removed.length} orders removed`);
                }
                if (data?.updated?.length > 0) {
                    console.debug(`${data.updated.length} orders updated`);
                }
            }}
        >
            <div className="space-y-4">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="transform transition-all duration-200"
                    >
                        {renderOrder(order)}
                    </div>
                ))}
            </div>
        </SmoothTransition>
    );
};

// Loading state transition
export const LoadingTransition = ({
    isLoading,
    children,
    loadingComponent,
    className = "",
}) => {
    return (
        <SmoothTransition
            isTransitioning={isLoading}
            type="fade"
            className={className}
        >
            {isLoading ? loadingComponent || <div>Loading...</div> : children}
        </SmoothTransition>
    );
};

export default SmoothTransition;
