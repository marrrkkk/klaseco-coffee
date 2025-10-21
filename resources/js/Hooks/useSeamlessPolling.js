import { useEffect, useCallback, useRef, useState } from "react";
import { useSeamlessPolling as useSeamlessPollingContext } from "@/Contexts/SeamlessPollingContext";

/**
 * Enhanced seamless polling hook with premium experience focus
 * @param {string} key - Unique identifier for this polling instance
 * @param {string|Function} fetchFunction - URL string or function that returns a fetch promise
 * @param {Object} options - Polling configuration options
 * @returns {Object} - Polling control functions and state
 */
export function useSeamlessPolling(key, fetchFunction, options = {}) {
    const {
        interval = 5000,
        orderCount = 0,
        hasActiveOrders = false,
        onSuccess,
        onError,
        onTransition,
        enabled = true,
        dependencies = [],
        priority = "normal",
        backgroundUpdates = true,
        gracefulDegradation = true,
        smoothTransitions = true,
    } = options;

    const {
        startSeamlessPolling,
        stopSeamlessPolling,
        getElegantError,
        connectionQuality,
        gracefulDegradation: globalGracefulDegradation,
        transitionStates,
    } = useSeamlessPollingContext();

    const [transitionData, setTransitionData] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const abortControllerRef = useRef(null);
    const lastDataRef = useRef(null);

    // Enhanced fetch function with seamless request handling
    const enhancedFetchFunction = useCallback(
        async ({ headers, signal }) => {
            // Abort any existing request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new controller and store it
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const url =
                    typeof fetchFunction === "string"
                        ? fetchFunction
                        : fetchFunction.url || fetchFunction;
                const method =
                    typeof fetchFunction === "object"
                        ? fetchFunction.method || "GET"
                        : "GET";
                const body =
                    typeof fetchFunction === "object"
                        ? fetchFunction.body
                        : undefined;

                const response = await fetch(url, {
                    method,
                    headers: {
                        ...headers,
                        Accept: "application/json",
                        "X-Seamless-Polling": "true",
                        "X-Minimal-Payload": backgroundUpdates
                            ? "true"
                            : "false",
                    },
                    body: body ? JSON.stringify(body) : undefined,
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok && response.status !== 304) {
                    throw new Error(
                        `HTTP ${response.status}: ${response.statusText}`
                    );
                }

                return response;
            } catch (error) {
                // Don't throw for aborted requests
                if (error.name === "AbortError") {
                    console.debug("Seamless polling request aborted");
                    return;
                }
                throw error;
            }
        },
        [fetchFunction]
    );

    // Handle smooth transitions between data states
    const handleTransition = useCallback(
        (fromData, toData) => {
            if (!smoothTransitions) return;

            setIsTransitioning(true);
            setTransitionData({ from: fromData, to: toData });

            // Call user-provided transition handler
            if (onTransitionRef.current) {
                onTransitionRef.current(fromData, toData);
            }

            // Clear transition state after animation
            setTimeout(() => {
                setIsTransitioning(false);
                setTransitionData(null);
            }, 300);
        },
        [smoothTransitions]
    );

    // Store callbacks in refs to avoid dependency issues
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    const onTransitionRef = useRef(onTransition);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
        onTransitionRef.current = onTransition;
    }, [onSuccess, onError, onTransition]);

    // Enhanced success handler with transition detection
    const handleSuccess = useCallback(
        (data, metadata) => {
            // data is already parsed JSON from SeamlessPollingContext
            // Detect changes for smooth transitions
            if (lastDataRef.current && smoothTransitions) {
                const hasChanges =
                    JSON.stringify(lastDataRef.current) !==
                    JSON.stringify(data);
                if (hasChanges) {
                    handleTransition(lastDataRef.current, data);
                }
            }

            lastDataRef.current = data;

            if (onSuccessRef.current) {
                onSuccessRef.current(data, metadata);
            }
        },
        [handleTransition, smoothTransitions]
    );

    // Enhanced error handler with graceful degradation
    const handleError = useCallback(
        (error, metadata) => {
            const {
                isBackgroundUpdate,
                consecutiveErrors,
                gracefulDegradation: isGraceful,
            } = metadata;

            // Don't show errors for background updates if graceful degradation is enabled
            if (isBackgroundUpdate && isGraceful && consecutiveErrors < 3) {
                console.debug(
                    `Background update failed for ${key}, continuing gracefully`
                );
                return;
            }

            if (onErrorRef.current) {
                onErrorRef.current(error, metadata);
            }
        },
        [key]
    );

    // Start seamless polling when enabled and dependencies change
    useEffect(() => {
        if (!enabled) {
            stopSeamlessPolling(key);
            return;
        }

        const cleanup = startSeamlessPolling(key, enhancedFetchFunction, {
            interval,
            orderCount,
            hasActiveOrders,
            onSuccess: handleSuccess,
            onError: handleError,
            onTransition: handleTransition,
            priority,
            backgroundUpdates,
            gracefulDegradation,
        });

        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        key,
        interval,
        orderCount,
        hasActiveOrders,
        enabled,
        priority,
        backgroundUpdates,
        gracefulDegradation,
        ...dependencies,
    ]);

    // Cleanup on unmount or when key changes
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            stopSeamlessPolling(key);
        };
    }, [key, stopSeamlessPolling]);

    // Get current transition state for this key
    const currentTransition = transitionStates[key];

    return {
        error: getElegantError(key),
        connectionQuality,
        gracefulDegradation: globalGracefulDegradation,
        isTransitioning: isTransitioning || !!currentTransition,
        transitionData: transitionData || currentTransition,
        stopPolling: () => stopSeamlessPolling(key),
    };
}

/**
 * Enhanced smart polling hook with seamless experience
 * @param {string} role - 'cashier', 'barista', or 'owner'
 * @param {Function} onDataUpdate - Callback when data is updated
 * @param {Object} options - Configuration options
 * @returns {Object} - Polling state and controls
 */
export function useSeamlessSmartPolling(role, onDataUpdate, options = {}) {
    const {
        baseInterval = 5000,
        statsInterval = 15000,
        enabled = true,
        priority = "normal",
        smoothTransitions = true,
    } = options;

    const [queueStats, setQueueStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const ordersRef = useRef(orders);

    // Update refs when state changes
    useEffect(() => {
        ordersRef.current = orders;
    }, [orders]);

    // Determine the appropriate endpoint based on role
    const getEndpoint = useCallback(() => {
        switch (role) {
            case "cashier":
                return "/api/orders/pending";
            case "barista":
                return "/api/orders/accepted";
            case "owner":
                return "/api/orders/active";
            default:
                throw new Error(`Invalid role: ${role}`);
        }
    }, [role]);

    // Enhanced transition handler for order changes
    const handleOrderTransition = useCallback(
        (fromData, toData) => {
            // Detect specific types of changes for different transition effects
            const fromOrders = fromData?.data || [];
            const toOrders = toData?.data || [];

            const addedOrders = toOrders.filter(
                (order) =>
                    !fromOrders.find((oldOrder) => oldOrder.id === order.id)
            );

            const removedOrders = fromOrders.filter(
                (order) =>
                    !toOrders.find((newOrder) => newOrder.id === order.id)
            );

            const updatedOrders = toOrders.filter((order) => {
                const oldOrder = fromOrders.find(
                    (oldOrder) => oldOrder.id === order.id
                );
                return oldOrder && oldOrder.status !== order.status;
            });

            // Provide rich transition context
            const transitionContext = {
                type: "orders",
                added: addedOrders,
                removed: removedOrders,
                updated: updatedOrders,
                hasChanges:
                    addedOrders.length > 0 ||
                    removedOrders.length > 0 ||
                    updatedOrders.length > 0,
            };

            console.debug(`Order transition for ${role}:`, transitionContext);
        },
        [role]
    );

    // Memoize callbacks to prevent infinite loops
    const handleStatsSuccess = useCallback((data) => {
        if (data.success) {
            setQueueStats(data.data);
        }
    }, []);

    const handleStatsError = useCallback((err) => {
        console.debug("Error fetching queue stats:", err);
    }, []);

    // Poll queue statistics with seamless updates
    const { error: statsError } = useSeamlessPolling(
        `queue-stats-${role}`,
        "/api/orders/stats",
        {
            interval: statsInterval,
            enabled,
            priority: "low", // Stats are less critical
            backgroundUpdates: true,
            gracefulDegradation: true,
            smoothTransitions: false, // Stats don't need smooth transitions
            onSuccess: handleStatsSuccess,
            onError: handleStatsError,
            dependencies: [role],
        }
    );

    // Store onDataUpdate in ref to avoid recreating callbacks
    const onDataUpdateRef = useRef(onDataUpdate);
    useEffect(() => {
        onDataUpdateRef.current = onDataUpdate;
    }, [onDataUpdate]);

    // Memoize order callbacks
    const handleOrdersSuccess = useCallback((data) => {
        if (data.success) {
            setOrders(data.data);
            setError(null);
            setIsLoading(false);

            // Call the provided callback
            if (onDataUpdateRef.current) {
                onDataUpdateRef.current(data.data, data.meta);
            }
        } else {
            setError("Failed to fetch orders");
            setIsLoading(false);
        }
    }, []);

    const handleOrdersError = useCallback((err, metadata) => {
        // Only set error state for non-background updates or critical failures
        if (!metadata.isBackgroundUpdate || metadata.consecutiveErrors >= 3) {
            setError("Connection temporarily unavailable");
        }
        console.debug(`Error fetching orders:`, err);
        setIsLoading(false);
    }, []);

    // Poll actual order data with seamless updates and smooth transitions
    const {
        error: ordersError,
        isTransitioning,
        connectionQuality,
        gracefulDegradation,
    } = useSeamlessPolling(`${role}-orders`, getEndpoint(), {
        interval: baseInterval,
        orderCount: orders.length,
        hasActiveOrders: orders.length > 0,
        enabled,
        priority,
        backgroundUpdates: true,
        gracefulDegradation: true,
        smoothTransitions,
        onSuccess: handleOrdersSuccess,
        onError: handleOrdersError,
        onTransition: handleOrderTransition,
        dependencies: [role],
    });

    // Combine errors with elegant handling
    const combinedError = error || ordersError || statsError;

    return {
        orders,
        queueStats,
        isLoading,
        error: combinedError,
        isTransitioning,
        connectionQuality,
        gracefulDegradation,
        hasActiveOrders: orders.length > 0,
    };
}

/**
 * Enhanced customer order tracking with seamless updates
 * @param {string} orderNumber - Order number to track
 * @param {Function} onStatusUpdate - Callback when status updates
 * @param {Object} options - Configuration options
 * @returns {Object} - Tracking state and controls
 */
export function useSeamlessOrderTracking(
    orderNumber,
    onStatusUpdate,
    options = {}
) {
    const {
        baseInterval = 5000,
        enabled = true,
        smoothTransitions = true,
    } = options;

    const [orderStatus, setOrderStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Calculate adaptive interval based on order status
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
                return 2000; // Check every 2 seconds when ready
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

    // Enhanced status transition handler
    const handleStatusTransition = useCallback(
        (fromData, toData) => {
            const oldStatus = fromData?.data?.status;
            const newStatus = toData?.data?.status;

            if (oldStatus && newStatus && oldStatus !== newStatus) {
                console.debug(
                    `Order ${orderNumber} status changed: ${oldStatus} → ${newStatus}`
                );

                // Provide rich transition context for UI animations
                const transitionContext = {
                    type: "status_change",
                    orderNumber,
                    from: oldStatus,
                    to: newStatus,
                    timestamp: Date.now(),
                };

                // You could emit this to a global event system for UI notifications
                window.dispatchEvent(
                    new CustomEvent("orderStatusTransition", {
                        detail: transitionContext,
                    })
                );
            }
        },
        [orderNumber]
    );

    // Poll order status with seamless updates
    const {
        error: pollingError,
        isTransitioning,
        connectionQuality,
    } = useSeamlessPolling(
        `order-tracking-${orderNumber}`,
        `/api/orders/${orderNumber}/status`,
        {
            interval: smartInterval,
            hasActiveOrders: isActive,
            enabled: enabled && orderNumber && smartInterval !== null,
            priority: "high", // Order tracking is high priority for customers
            backgroundUpdates: true,
            gracefulDegradation: true,
            smoothTransitions,
            onSuccess: (data) => {
                const orderData = data.success ? data.data : data;
                setOrderStatus(orderData);
                setError("");

                // Call the provided callback
                if (onStatusUpdate) {
                    onStatusUpdate(orderData, data.meta);
                }
            },
            onError: (err, metadata) => {
                // Only show errors for critical failures
                if (
                    !metadata.isBackgroundUpdate ||
                    metadata.consecutiveErrors >= 2
                ) {
                    setError("Unable to check order status. Please try again.");
                }
                console.debug("Error checking order status:", err);
            },
            onTransition: handleStatusTransition,
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
        isTransitioning,
        connectionQuality,
        checkOrderStatus,
        smartInterval,
        isActive,
    };
}
