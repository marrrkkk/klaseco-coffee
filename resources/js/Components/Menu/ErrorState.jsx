import { useState, memo } from "react";

const ErrorState = memo(function ErrorState({
    message,
    onRetry,
    showHomeButton = true,
}) {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = async () => {
        if (!onRetry) return;

        setIsRetrying(true);
        try {
            await onRetry();
        } catch (error) {
            console.error("Retry failed:", error);
        } finally {
            setIsRetrying(false);
        }
    };

    const getUserFriendlyMessage = (errorMessage) => {
        if (!errorMessage) {
            return "We're having trouble loading the menu. Please check your connection and try again.";
        }

        // Network errors
        if (
            errorMessage.includes("Network Error") ||
            errorMessage.includes("Failed to fetch")
        ) {
            return "Unable to connect to the server. Please check your internet connection and try again.";
        }

        // Timeout errors
        if (errorMessage.includes("timeout")) {
            return "The request took too long to complete. Please try again.";
        }

        // Server errors
        if (
            errorMessage.includes("500") ||
            errorMessage.includes("Internal Server Error")
        ) {
            return "Our server encountered an issue. We're working to fix it. Please try again in a moment.";
        }

        // Not found errors
        if (
            errorMessage.includes("404") ||
            errorMessage.includes("Not Found")
        ) {
            return "The requested content could not be found. It may have been moved or removed.";
        }

        // Default to the provided message
        return errorMessage;
    };

    return (
        <div className="min-h-[400px] flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center animate-fadeIn">
                {/* Error Icon */}
                <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                {/* Error Message */}
                <h3 className="text-2xl font-light text-dark-gray mb-3 tracking-wide">
                    Unable to Load Menu
                </h3>
                <p className="text-medium-gray font-light mb-6 leading-relaxed">
                    {getUserFriendlyMessage(message)}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {/* Retry Button */}
                    {onRetry && (
                        <button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            className="px-6 py-3 bg-coffee-accent text-white rounded-lg font-medium tracking-wide hover:bg-dark-gray transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg
                                className={`w-5 h-5 ${
                                    isRetrying ? "animate-spin" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            {isRetrying ? "Retrying..." : "Try Again"}
                        </button>
                    )}

                    {/* Home Button */}
                    {showHomeButton && (
                        <a
                            href="/"
                            className="px-6 py-3 border border-coffee-accent text-coffee-accent rounded-lg font-medium tracking-wide hover:bg-coffee-accent hover:text-white transition-all duration-300 inline-flex items-center justify-center gap-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            Go to Home
                        </a>
                    )}
                </div>

                {/* Help Text */}
                <p className="text-sm text-medium-gray font-light mt-6">
                    If the problem persists, please contact support or try again
                    later.
                </p>
            </div>
        </div>
    );
});

export default ErrorState;
