import React from "react";
import {
    ExclamationTriangleIcon,
    WifiIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";

const ElegantErrorState = ({
    error,
    onRetry,
    showRetry = true,
    size = "medium",
    className = "",
    inline = false,
}) => {
    if (!error) return null;

    const getSeverityConfig = (severity) => {
        switch (severity) {
            case "low":
                return {
                    icon: WifiIcon,
                    bgColor: "bg-blue-50",
                    textColor: "text-blue-700",
                    iconColor: "text-blue-400",
                    borderColor: "border-blue-200",
                };
            case "high":
                return {
                    icon: ExclamationTriangleIcon,
                    bgColor: "bg-red-50",
                    textColor: "text-red-700",
                    iconColor: "text-red-400",
                    borderColor: "border-red-200",
                };
            case "medium":
            default:
                return {
                    icon: WifiIcon,
                    bgColor: "bg-amber-50",
                    textColor: "text-amber-700",
                    iconColor: "text-amber-400",
                    borderColor: "border-amber-200",
                };
        }
    };

    const getSizeConfig = (size) => {
        switch (size) {
            case "small":
                return {
                    container: "p-3",
                    icon: "h-4 w-4",
                    title: "text-sm font-medium",
                    message: "text-xs",
                    button: "px-2 py-1 text-xs",
                };
            case "large":
                return {
                    container: "p-6",
                    icon: "h-8 w-8",
                    title: "text-lg font-semibold",
                    message: "text-base",
                    button: "px-4 py-2 text-sm",
                };
            case "medium":
            default:
                return {
                    container: "p-4",
                    icon: "h-5 w-5",
                    title: "text-base font-medium",
                    message: "text-sm",
                    button: "px-3 py-1.5 text-sm",
                };
        }
    };

    const severityConfig = getSeverityConfig(error.severity);
    const sizeConfig = getSizeConfig(size);
    const Icon = severityConfig.icon;

    const getErrorTitle = () => {
        if (error.severity === "low") {
            return "Connection Quality Reduced";
        }
        if (error.severity === "high") {
            return "Connection Issue";
        }
        return "Temporary Connection Issue";
    };

    const getErrorMessage = () => {
        if (error.isStale) {
            return "Connection has been restored. Everything is working normally.";
        }

        if (error.recoverable) {
            return (
                error.suggestion ||
                "We're working to restore the connection. Your experience will continue seamlessly."
            );
        }

        return (
            error.message ||
            "Please check your internet connection and try again."
        );
    };

    if (inline) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <Icon
                    className={`${sizeConfig.icon} ${severityConfig.iconColor} flex-shrink-0`}
                />
                <span
                    className={`${sizeConfig.message} ${severityConfig.textColor}`}
                >
                    {getErrorMessage()}
                </span>
                {showRetry && onRetry && !error.isStale && (
                    <button
                        onClick={onRetry}
                        className={`
                            ${sizeConfig.button} ${severityConfig.textColor}
                            hover:bg-white hover:bg-opacity-50 
                            rounded-md transition-colors duration-200
                            flex items-center space-x-1
                        `}
                    >
                        <ArrowPathIcon className="h-3 w-3" />
                        <span>Retry</span>
                    </button>
                )}
            </div>
        );
    }

    return (
        <div
            className={`
            ${sizeConfig.container} 
            ${severityConfig.bgColor} 
            ${severityConfig.borderColor}
            border rounded-lg shadow-sm
            ${className}
        `}
        >
            <div className="flex items-start space-x-3">
                <Icon
                    className={`${sizeConfig.icon} ${severityConfig.iconColor} flex-shrink-0 mt-0.5`}
                />
                <div className="flex-1 min-w-0">
                    <h3
                        className={`${sizeConfig.title} ${severityConfig.textColor}`}
                    >
                        {getErrorTitle()}
                    </h3>
                    <p
                        className={`${sizeConfig.message} ${severityConfig.textColor} mt-1 opacity-90`}
                    >
                        {getErrorMessage()}
                    </p>
                    {showRetry && onRetry && !error.isStale && (
                        <div className="mt-3">
                            <button
                                onClick={onRetry}
                                className={`
                                    ${sizeConfig.button}
                                    bg-white bg-opacity-80 hover:bg-opacity-100
                                    ${severityConfig.textColor}
                                    border border-current border-opacity-20
                                    rounded-md transition-all duration-200
                                    flex items-center space-x-2
                                    hover:shadow-sm
                                `}
                            >
                                <ArrowPathIcon className="h-4 w-4" />
                                <span>Try Again</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Connection quality indicator component
export const ConnectionQualityIndicator = ({ quality, className = "" }) => {
    const getQualityConfig = (quality) => {
        switch (quality) {
            case "excellent":
                return {
                    color: "text-green-500",
                    bgColor: "bg-green-100",
                    label: "Excellent",
                    bars: 4,
                };
            case "good":
                return {
                    color: "text-blue-500",
                    bgColor: "bg-blue-100",
                    label: "Good",
                    bars: 3,
                };
            case "poor":
                return {
                    color: "text-amber-500",
                    bgColor: "bg-amber-100",
                    label: "Limited",
                    bars: 2,
                };
            case "offline":
                return {
                    color: "text-red-500",
                    bgColor: "bg-red-100",
                    label: "Offline",
                    bars: 0,
                };
            default:
                return {
                    color: "text-gray-500",
                    bgColor: "bg-gray-100",
                    label: "Unknown",
                    bars: 1,
                };
        }
    };

    const config = getQualityConfig(quality);

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <div className="flex items-end space-x-0.5">
                {[1, 2, 3, 4].map((bar) => (
                    <div
                        key={bar}
                        className={`
                            w-1 rounded-sm transition-colors duration-300
                            ${
                                bar <= config.bars
                                    ? config.color
                                    : "text-gray-300"
                            }
                            ${
                                bar === 1
                                    ? "h-2"
                                    : bar === 2
                                    ? "h-3"
                                    : bar === 3
                                    ? "h-4"
                                    : "h-5"
                            }
                        `}
                        style={{ backgroundColor: "currentColor" }}
                    />
                ))}
            </div>
            <span className={`text-xs ${config.color} font-medium`}>
                {config.label}
            </span>
        </div>
    );
};

// Graceful degradation notice
export const GracefulDegradationNotice = ({ isActive, className = "" }) => {
    if (!isActive) return null;

    return (
        <div
            className={`
            bg-blue-50 border border-blue-200 rounded-lg p-3
            ${className}
        `}
        >
            <div className="flex items-center space-x-2">
                <WifiIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                    <span className="font-medium">Optimized Mode:</span>
                    <span className="ml-1">
                        Updates are running in the background to preserve your
                        experience.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ElegantErrorState;
