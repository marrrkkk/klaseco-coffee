import { useState } from "react";
import { CheckCircleIcon, BellIcon } from "@heroicons/react/24/outline";

export default function ReadyNotificationButton({
    order,
    onMarkReady,
    isProcessing = false,
}) {
    const [isMarking, setIsMarking] = useState(false);

    const handleMarkReady = async () => {
        if (isProcessing || isMarking) return;

        setIsMarking(true);
        try {
            await onMarkReady(order.id);
        } finally {
            setIsMarking(false);
        }
    };

    // Only show the button for orders that can be marked as ready
    if (!["accepted", "preparing"].includes(order.status)) {
        return (
            <div className="flex items-center justify-center py-3">
                <span className="text-sm text-gray-500 capitalize">
                    Status: {order.status}
                </span>
            </div>
        );
    }

    return (
        <button
            onClick={handleMarkReady}
            disabled={isProcessing || isMarking}
            className="w-full flex items-center justify-center px-6 py-4 
                bg-success-green hover:bg-opacity-90 
                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none
                text-white font-light tracking-wide rounded-lg 
                transition-all duration-200 
                transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0
                shadow-sm hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-success-green focus:ring-offset-2
                group"
        >
            <div className="flex items-center space-x-3">
                {isMarking || isProcessing ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Notifying Customer...</span>
                    </>
                ) : (
                    <>
                        <CheckCircleIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        <span>Mark Ready & Notify</span>
                        <BellIcon className="h-4 w-4 opacity-75 transition-all duration-300 group-hover:opacity-100 group-hover:animate-wiggle" />
                    </>
                )}
            </div>
        </button>
    );
}
