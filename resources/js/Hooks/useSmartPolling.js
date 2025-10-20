import { useState, useEffect, useCallback, useRef } from "react";
import { usePolling } from "./usePolling";

// Helper function to compare arrays of orders
const compareArrays = (a, b) => {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every(
        (item, index) =>
            item.id === b[index].id && item.status === b[index].status
    );
};

/**
 * Smart polling hook that adjusts frequency based on queue activity
 * @param {string} role - 'cashier' or 'barista'
 * @param {Function} onDataUpdate - Callback when data is updated
 * @param {Object} options - Configuration options
 * @returns {Object} - Polling state and controls
 */
export function useSmartPolling(role, onDataUpdate, options = {}) {
    const {
        baseInterval = 5000,
        statsInterval = 15000,
        maxBackoff = 30000,
        minBackoff = 5000,
        enabled = true,
    } = options;

    const [queueStats, setQueueStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [consecutiveErrors, setConsecutiveErrors] = useState(0);
    const lastSuccessTime = useRef(Date.now());
    const ordersRef = useRef(orders);
    const queueStatsRef = useRef(queueStats);

    // Reset error state on success
    useEffect(() => {
        if (!error) {
            setConsecutiveErrors(0);
            lastSuccessTime.current = Date.now();
        }
    }, [error]);

    // Update refs when state changes
    useEffect(() => {
        ordersRef.current = orders;
    }, [orders]);

    useEffect(() => {
        queueStatsRef.current = queueStats;
    }, [queueStats]);

    // Determine the appropriate endpoint based on role
    const getEndpoint = useCallback(() => {
        switch (role) {
            case "cashier":
                return "/api/orders/pending";
            case "barista":
                return "/api/orders/accepted";
            case "owner":
                return "/api/orders/active"; // New endpoint for consolidated owner role
            default:
                throw new Error(`Invalid role: ${role}`);
        }
    }, [role]);

    // Calculate smart interval based on queue stats and activity
    const calculateSmartInterval = useCallback(() => {
        if (!queueStatsRef.current) return baseInterval;

        const relevantCount =
            role === "cashier"
                ? queueStatsRef.current.pending_count
                : role === "owner"
                ? queueStatsRef.current.accepted_count
                : queueStatsRef.current.accepted_count;

        // If there are errors, use exponential backoff
        if (consecutiveErrors > 0) {
            return Math.min(
                baseInterval * Math.pow(2, consecutiveErrors),
                maxBackoff
            );
        }

        // Increase frequency when there are more orders
        if (relevantCount > 5) {
            return Math.max(baseInterval * 0.7, minBackoff);
        } else if (relevantCount > 2) {
            return Math.max(baseInterval * 0.7, 2000); // Min 2 seconds
        } else if (relevantCount > 0) {
            return baseInterval;
        } else {
            return Math.min(baseInterval * 1.5, 10000); // Max 10 seconds when empty
        }
    }, [role, baseInterval, maxBackoff, minBackoff]);

    // Poll queue statistics for smart interval calculation
    const { error: statsError } = usePolling(
        `queue-stats-${role}`,
        "/api/orders/stats",
        {
            interval: statsInterval,
            enabled,
            onSuccess: (data) => {
                if (data.success) {
                    setQueueStats(data.data);
                }
            },
            onError: (err) => {
                console.error("Error fetching queue stats:", err);
            },
            dependencies: [role],
        }
    );

    // Poll actual order data with smart interval
    const { error: ordersError } = usePolling(`${role}-orders`, getEndpoint(), {
        interval: calculateSmartInterval(),
        orderCount: orders.length,
        hasActiveOrders: orders.length > 0,
        enabled,
        onSuccess: (data) => {
            if (data.success) {
                // Only update if orders have changed
                if (!compareArrays(ordersRef.current, data.data)) {
                    setOrders(data.data);

                    // Call the provided callback only if data changed
                    if (onDataUpdate) {
                        onDataUpdate(data.data, data.meta);
                    }
                }
                setError(null);
            } else {
                setError("Failed to fetch orders");
            }
            setIsLoading(false);
        },
        onError: (err) => {
            setError("Network error occurred");
            console.error(`Error fetching ${role} orders:`, err);
            setIsLoading(false);
        },
        dependencies: [role],
    });

    // Combine errors
    const combinedError = error || ordersError || statsError;

    return {
        orders,
        queueStats,
        isLoading,
        error: combinedError,
        smartInterval: calculateSmartInterval(),
        hasActiveOrders: orders.length > 0,
    };
}

/**
 * Customer order tracking with smart polling
 * @param {string} orderNumber - Order number to track
 * @param {Function} onStatusUpdate - Callback when status updates
 * @param {Object} options - Configuration options
 * @returns {Object} - Tracking state and controls
 */
export function useOrderTracking(orderNumber, onStatusUpdate, options = {}) {
    const { baseInterval = 5000, enabled = true } = options;

    const [orderStatus, setOrderStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Calculate smart interval based on order status
    const calculateTrackingInterval = useCallback(() => {
        if (!orderStatus) return baseInterval;

        // More frequent updates for active statuses
        switch (orderStatus.status) {
            case "pending":
                return 3000; // Check every 3 seconds when pending
            case "accepted":
            case "preparing":
                return 4000; // Check every 4 seconds when being prepared
            case "ready":
                return 2000; // Check every 2 seconds when ready (customer might pick up)
            case "served":
            case "cancelled":
                return null; // Stop polling for final states
            default:
                return baseInterval;
        }
    }, [orderStatus, baseInterval]);

    const isActive =
        orderStatus && !["served", "cancelled"].includes(orderStatus.status);
    const smartInterval = calculateTrackingInterval();

    // Poll order status with smart interval
    const { error: pollingError } = usePolling(
        `order-tracking-${orderNumber}`,
        `/api/orders/${orderNumber}/status`,
        {
            interval: smartInterval,
            hasActiveOrders: isActive,
            enabled: enabled && orderNumber && smartInterval !== null,
            onSuccess: (data) => {
                const orderData = data.success ? data.data : data;
                setOrderStatus(orderData);
                setError("");

                // Call the provided callback
                if (onStatusUpdate) {
                    onStatusUpdate(orderData, data.meta);
                }
            },
            onError: (err) => {
                setError("Failed to check order status. Please try again.");
                console.error("Error checking order status:", err);
            },
            dependencies: [orderNumber, orderStatus?.status],
        }
    );

    // Manual order status check (for initial load)
    const checkOrderStatus = useCallback(
        async (orderId, showLoading = true) => {
            if (!orderId?.trim()) {
                setError("Please enter an order number");
                return;
            }

            try {
                if (showLoading) setIsLoading(true);
                setError("");

                const response = await fetch(`/api/orders/${orderId}/status`);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                const orderData = data.success ? data.data : data;

                setOrderStatus(orderData);

                if (onStatusUpdate) {
                    onStatusUpdate(orderData, data.meta);
                }
            } catch (error) {
                setError("Order not found. Please check your order number.");
                setOrderStatus(null);
            } finally {
                if (showLoading) setIsLoading(false);
            }
        },
        [onStatusUpdate]
    );

    return {
        orderStatus,
        isLoading,
        error: error || pollingError,
        checkOrderStatus,
        smartInterval,
        isActive,
    };
}
