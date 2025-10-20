import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ReadyButton({ order, onMarkReady, disabled = false }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleMarkReady = async () => {
        if (disabled || isProcessing) return;

        setIsProcessing(true);
        try {
            await onMarkReady(order.id);
        } finally {
            setIsProcessing(false);
        }
    };

    // Only show the button for orders that can be marked as ready
    if (!["accepted", "preparing"].includes(order.status)) {
        return (
            <div className="flex items-center justify-center py-2">
                <span className="text-sm text-gray-500 capitalize">
                    Status: {order.status}
                </span>
            </div>
        );
    }

    return (
        <button
            onClick={handleMarkReady}
            disabled={disabled || isProcessing}
            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {isProcessing ? "Marking Ready..." : "Mark as Ready"}
        </button>
    );
}
