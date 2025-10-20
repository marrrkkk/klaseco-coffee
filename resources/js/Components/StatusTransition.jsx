import { useState, useEffect } from "react";

export default function StatusTransition({
    status,
    previousStatus,
    children,
    className = "",
}) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayStatus, setDisplayStatus] = useState(status);

    useEffect(() => {
        if (status !== previousStatus && previousStatus) {
            setIsTransitioning(true);

            // Fade out
            setTimeout(() => {
                setDisplayStatus(status);
            }, 150);

            // Fade in
            setTimeout(() => {
                setIsTransitioning(false);
            }, 300);
        } else {
            setDisplayStatus(status);
        }
    }, [status, previousStatus]);

    return (
        <div
            className={`transition-all duration-300 ${
                isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
            } ${className}`}
        >
            {children}
        </div>
    );
}

// Status badge component with smooth transitions
export function StatusBadge({ status, className = "" }) {
    const statusConfig = {
        pending: {
            label: "Pending",
            color: "bg-amber-100 text-amber-800 border-amber-200",
            icon: "⏳",
        },
        accepted: {
            label: "Accepted",
            color: "bg-blue-100 text-blue-800 border-blue-200",
            icon: "✓",
        },
        preparing: {
            label: "Preparing",
            color: "bg-orange-100 text-orange-800 border-orange-200",
            icon: "☕",
        },
        ready: {
            label: "Ready",
            color: "bg-green-100 text-green-800 border-green-200",
            icon: "✨",
        },
        served: {
            label: "Served",
            color: "bg-gray-100 text-gray-800 border-gray-200",
            icon: "✓",
        },
        cancelled: {
            label: "Cancelled",
            color: "bg-red-100 text-red-800 border-red-200",
            icon: "✕",
        },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span
            className={`
                inline-flex items-center space-x-2 px-3 py-1 rounded-full 
                border font-light text-sm tracking-wide
                transition-all duration-300
                ${config.color}
                ${className}
            `}
        >
            <span className="text-base">{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}

// Progress indicator for order status
export function OrderProgressIndicator({ status, className = "" }) {
    const steps = [
        { key: "pending", label: "Received" },
        { key: "accepted", label: "Confirmed" },
        { key: "preparing", label: "Preparing" },
        { key: "ready", label: "Ready" },
    ];

    const statusIndex = {
        pending: 0,
        accepted: 1,
        preparing: 2,
        ready: 3,
        served: 3,
    };

    const currentIndex = statusIndex[status] || 0;

    return (
        <div className={`flex items-center justify-between ${className}`}>
            {steps.map((step, index) => (
                <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                        {/* Step circle */}
                        <div
                            className={`
                                w-8 h-8 rounded-full border-2 flex items-center justify-center
                                transition-all duration-500 ease-out
                                ${
                                    index <= currentIndex
                                        ? "bg-coffee-accent border-coffee-accent text-primary-white scale-110"
                                        : "bg-primary-white border-light-gray text-medium-gray"
                                }
                            `}
                        >
                            {index < currentIndex ? (
                                <svg
                                    className="w-4 h-4"
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
                            ) : (
                                <span className="text-xs font-light">
                                    {index + 1}
                                </span>
                            )}
                        </div>

                        {/* Step label */}
                        <span
                            className={`
                                text-xs font-light mt-2 text-center
                                transition-colors duration-300
                                ${
                                    index <= currentIndex
                                        ? "text-dark-gray"
                                        : "text-medium-gray"
                                }
                            `}
                        >
                            {step.label}
                        </span>
                    </div>

                    {/* Connector line */}
                    {index < steps.length - 1 && (
                        <div className="flex-1 h-0.5 mx-2 mb-6 relative">
                            <div className="absolute inset-0 bg-light-gray"></div>
                            <div
                                className={`
                                    absolute inset-0 bg-coffee-accent transition-all duration-500 ease-out
                                    ${index < currentIndex ? "w-full" : "w-0"}
                                `}
                            ></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
