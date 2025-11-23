import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            isRetrying: false,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
        this.setState({ errorInfo });

        // Log to error reporting service in production
        if (!import.meta.env.DEV) {
            // TODO: Send to error tracking service (e.g., Sentry)
            console.error("Production error:", {
                error: error.toString(),
                componentStack: errorInfo.componentStack,
            });
        }
    }

    handleReset = async () => {
        this.setState({ isRetrying: true });

        // Small delay to show loading state
        await new Promise((resolve) => setTimeout(resolve, 300));

        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            isRetrying: false,
        });

        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    getUserFriendlyMessage = (error) => {
        if (!error) return "An unexpected error occurred.";

        const errorString = error.toString();

        // Network errors
        if (errorString.includes("Network") || errorString.includes("fetch")) {
            return "Unable to connect to the server. Please check your internet connection.";
        }

        // Rendering errors
        if (
            errorString.includes("Cannot read property") ||
            errorString.includes("undefined")
        ) {
            return "We encountered a problem displaying this content.";
        }

        // Generic fallback
        return "We encountered an unexpected error while loading this page.";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-primary-white flex items-center justify-center px-6">
                    <div className="max-w-md w-full text-center animate-fadeIn">
                        {/* Error Icon */}
                        <div className="w-20 h-20 mx-auto mb-8 bg-red-50 rounded-full flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>

                        {/* Error Message */}
                        <h2 className="text-3xl font-light text-dark-gray mb-4 tracking-wide">
                            Something Went Wrong
                        </h2>
                        <p className="text-medium-gray font-light mb-8 leading-relaxed">
                            {this.getUserFriendlyMessage(this.state.error)}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                disabled={this.state.isRetrying}
                                className="px-6 py-3 bg-coffee-accent text-white rounded-lg font-medium tracking-wide hover:bg-dark-gray transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                            >
                                <svg
                                    className={`w-5 h-5 ${
                                        this.state.isRetrying
                                            ? "animate-spin"
                                            : ""
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
                                {this.state.isRetrying
                                    ? "Retrying..."
                                    : "Try Again"}
                            </button>
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
                        </div>

                        {/* Help Text */}
                        <p className="text-sm text-medium-gray font-light mt-6">
                            If the problem persists, please refresh the page or
                            contact support.
                        </p>

                        {/* Error Details (Development Only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mt-8 text-left">
                                <summary className="cursor-pointer text-sm text-medium-gray hover:text-dark-gray font-medium">
                                    Technical Details (Development Only)
                                </summary>
                                <div className="mt-4 p-4 bg-red-50 rounded-lg text-left">
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-red-900 mb-1">
                                            Error:
                                        </p>
                                        <pre className="text-xs text-red-800 overflow-auto whitespace-pre-wrap">
                                            {this.state.error.toString()}
                                        </pre>
                                    </div>
                                    {this.state.errorInfo && (
                                        <div>
                                            <p className="text-xs font-semibold text-red-900 mb-1">
                                                Component Stack:
                                            </p>
                                            <pre className="text-xs text-red-800 overflow-auto whitespace-pre-wrap max-h-40">
                                                {
                                                    this.state.errorInfo
                                                        .componentStack
                                                }
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
