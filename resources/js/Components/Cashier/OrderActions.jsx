import { useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function OrderActions({
    order,
    onAccept,
    onReject,
    disabled = false,
}) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAccept = async () => {
        if (disabled || isProcessing) return;

        setIsProcessing(true);
        try {
            await onAccept(order.id);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (disabled || isProcessing) return;

        setIsProcessing(true);
        try {
            await onReject(order.id);
        } finally {
            setIsProcessing(false);
        }
    };

    if (order.status !== "pending") {
        return (
            <div className="flex items-center justify-center py-2">
                <span className="text-sm text-gray-500 capitalize">
                    Status: {order.status}
                </span>
            </div>
        );
    }

    return (
        <div className="flex space-x-2">
            <button
                onClick={handleAccept}
                disabled={disabled || isProcessing}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
                <CheckIcon className="h-4 w-4 mr-2" />
                {isProcessing ? "Processing..." : "Accept"}
            </button>
            <button
                onClick={handleReject}
                disabled={disabled || isProcessing}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
                <XMarkIcon className="h-4 w-4 mr-2" />
                {isProcessing ? "Processing..." : "Reject"}
            </button>
        </div>
    );
}
