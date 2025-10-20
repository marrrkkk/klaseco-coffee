import { useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function QuickActions({
    order,
    onAccept,
    onReject,
    disabled = false,
}) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionFeedback, setActionFeedback] = useState(null);

    const handleAccept = async () => {
        if (disabled || isProcessing) return;

        setIsProcessing(true);
        setActionFeedback("accepting");

        try {
            await onAccept(order.id);
            setActionFeedback("accepted");
            setTimeout(() => setActionFeedback(null), 1500);
        } catch (error) {
            setActionFeedback("error");
            setTimeout(() => setActionFeedback(null), 2000);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (disabled || isProcessing) return;

        setIsProcessing(true);
        setActionFeedback("rejecting");

        try {
            await onReject(order.id);
            setActionFeedback("rejected");
            setTimeout(() => setActionFeedback(null), 1500);
        } catch (error) {
            setActionFeedback("error");
            setTimeout(() => setActionFeedback(null), 2000);
        } finally {
            setIsProcessing(false);
        }
    };

    if (order.status !== "pending") {
        return (
            <div className="text-xs text-gray-500 capitalize">
                {order.status}
            </div>
        );
    }

    // Show feedback states
    if (actionFeedback === "accepted") {
        return (
            <div className="flex items-center text-green-600 text-sm font-medium">
                <CheckIcon className="h-4 w-4 mr-1" />
                Accepted
            </div>
        );
    }

    if (actionFeedback === "rejected") {
        return (
            <div className="flex items-center text-red-600 text-sm font-medium">
                <XMarkIcon className="h-4 w-4 mr-1" />
                Rejected
            </div>
        );
    }

    if (actionFeedback === "error") {
        return (
            <div className="text-red-600 text-sm font-medium">
                Error - Try again
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={handleAccept}
                disabled={disabled || isProcessing}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all duration-150 hover:scale-105 active:scale-95"
            >
                {actionFeedback === "accepting" ? (
                    <>
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                        Accepting...
                    </>
                ) : (
                    <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Accept
                    </>
                )}
            </button>
            <button
                onClick={handleReject}
                disabled={disabled || isProcessing}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all duration-150 hover:scale-105 active:scale-95"
            >
                {actionFeedback === "rejecting" ? (
                    <>
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                        Rejecting...
                    </>
                ) : (
                    <>
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Reject
                    </>
                )}
            </button>
        </div>
    );
}
