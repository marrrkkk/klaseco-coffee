import { useState, useEffect, useCallback } from "react";
import { usePolling } from "./usePolling";

/**
 * Hook to track customer cart state in real-time
 * @param {Function} onCartUpdate - Callback when cart data is updated
 * @param {Object} options - Configuration options
 * @returns {Object} - Cart polling state and controls
 */
export function useCustomerCartPolling(onCartUpdate, options = {}) {
    const {
        interval = 3000, // Poll every 3 seconds
        enabled = true,
    } = options;

    const [activeCarts, setActiveCarts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Poll for active customer carts
    const { error: pollingError } = usePolling(
        "customer-carts",
        "/api/carts/active",
        {
            interval,
            enabled,
            onSuccess: (data) => {
                if (data.success) {
                    setActiveCarts(data.data);
                    setError(null);

                    // Call the provided callback
                    if (onCartUpdate) {
                        onCartUpdate(data.data);
                    }
                } else {
                    setError("Failed to fetch active carts");
                }
                setIsLoading(false);
            },
            onError: (err) => {
                setError("Network error occurred");
                console.error("Error fetching active carts:", err);
                setIsLoading(false);
            },
        }
    );

    return {
        activeCarts,
        isLoading,
        error: error || pollingError,
    };
}
