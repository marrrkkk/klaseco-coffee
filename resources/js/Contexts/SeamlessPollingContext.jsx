import React, {
    createContext,
    useContext,
    useReducer,
    useCallback,
    useRef,
    useEffect,
    useMemo,
} from "react";

// Enhanced polling state management for premium experience
const initialState = {
    intervals: {},
    etags: {},
    retryAttempts: {},
    isActive: true,
    userActivity: Date.now(),
    errors: {},
    connectionQuality: "excellent", // excellent, good, poor, offline
    adaptiveIntervals: {},
    requestQueue: {},
    backgroundUpdates: {},
    transitionStates: {},
    gracefulDegradation: false,
};

const seamlessPollingReducer = (state, action) => {
    switch (action.type) {
        case "SET_INTERVAL":
            return {
                ...state,
                intervals: {
                    ...state.intervals,
                    [action.key]: action.interval,
                },
                adaptiveIntervals: {
                    ...state.adaptiveIntervals,
                    [action.key]: {
                        current: action.interval,
                        base: action.baseInterval || action.interval,
                        lastAdjustment: Date.now(),
                    },
                },
            };

        case "CLEAR_INTERVAL":
            const { [action.key]: removedInterval, ...remainingIntervals } =
                state.intervals;
            const { [action.key]: removedAdaptive, ...remainingAdaptive } =
                state.adaptiveIntervals;
            return {
                ...state,
                intervals: remainingIntervals,
                adaptiveIntervals: remainingAdaptive,
            };

        case "SET_ETAG":
            return {
                ...state,
                etags: {
                    ...state.etags,
                    [action.key]: action.etag,
                },
            };

        case "SET_RETRY_ATTEMPT":
            return {
                ...state,
                retryAttempts: {
                    ...state.retryAttempts,
                    [action.key]: action.count,
                },
            };

        case "SET_ACTIVE":
            return {
                ...state,
                isActive: action.isActive,
            };

        case "UPDATE_USER_ACTIVITY":
            return {
                ...state,
                userActivity: Date.now(),
            };

        case "SET_ERROR":
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.key]: {
                        message: action.error,
                        timestamp: Date.now(),
                        severity: action.severity || "medium",
                        recoverable: action.recoverable !== false,
                    },
                },
            };

        case "CLEAR_ERROR":
            const { [action.key]: removedError, ...remainingErrors } =
                state.errors;
            return {
                ...state,
                errors: remainingErrors,
            };

        case "SET_CONNECTION_QUALITY":
            return {
                ...state,
                connectionQuality: action.quality,
                gracefulDegradation:
                    action.quality === "poor" || action.quality === "offline",
            };

        case "SET_BACKGROUND_UPDATE":
            return {
                ...state,
                backgroundUpdates: {
                    ...state.backgroundUpdates,
                    [action.key]: {
                        data: action.data,
                        timestamp: Date.now(),
                        pending: action.pending || false,
                    },
                },
            };

        case "SET_TRANSITION_STATE":
            return {
                ...state,
                transitionStates: {
                    ...state.transitionStates,
                    [action.key]: {
                        from: action.from,
                        to: action.to,
                        progress: action.progress || 0,
                        startTime: action.startTime || Date.now(),
                    },
                },
            };

        case "CLEAR_TRANSITION_STATE":
            const { [action.key]: removedTransition, ...remainingTransitions } =
                state.transitionStates;
            return {
                ...state,
                transitionStates: remainingTransitions,
            };

        default:
            return state;
    }
};

const SeamlessPollingContext = createContext();

export const useSeamlessPolling = () => {
    const context = useContext(SeamlessPollingContext);
    if (!context) {
        throw new Error(
            "useSeamlessPolling must be used within a SeamlessPollingProvider"
        );
    }
    return context;
};

export const SeamlessPollingProvider = ({ children }) => {
    const [state, dispatch] = useReducer(seamlessPollingReducer, initialState);
    const intervalRefs = useRef({});
    const abortControllers = useRef({});
    const stateRef = useRef(state);
    const requestCache = useRef({});
    const connectionMonitor = useRef(null);

    // Keep state ref updated
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Enhanced user activity tracking with interaction quality detection
    useEffect(() => {
        let interactionCount = 0;
        let lastInteractionTime = Date.now();

        const handleUserActivity = (event) => {
            const now = Date.now();
            const timeSinceLastInteraction = now - lastInteractionTime;

            // Track interaction frequency for smart polling
            if (timeSinceLastInteraction < 1000) {
                interactionCount++;
            } else {
                interactionCount = Math.max(0, interactionCount - 1);
            }

            lastInteractionTime = now;
            dispatch({ type: "UPDATE_USER_ACTIVITY" });

            // Adjust polling based on interaction intensity
            if (interactionCount > 5) {
                // High interaction - reduce polling frequency to avoid interruption
                Object.keys(stateRef.current.intervals).forEach((key) => {
                    updateAdaptiveInterval(key, "high_interaction");
                });
            }
        };

        const events = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
            "click",
            "focus",
            "blur",
        ];

        events.forEach((event) => {
            document.addEventListener(event, handleUserActivity, {
                passive: true,
                capture: true,
            });
        });

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleUserActivity, true);
            });
        };
    }, []);

    // Enhanced page visibility and connection quality monitoring
    useEffect(() => {
        const handleVisibilityChange = () => {
            const isVisible = !document.hidden;
            dispatch({ type: "SET_ACTIVE", isActive: isVisible });

            if (isVisible) {
                // Page became visible - trigger immediate updates for all active polls
                Object.keys(stateRef.current.intervals).forEach((key) => {
                    triggerImmediateUpdate(key);
                });
            }
        };

        const monitorConnectionQuality = () => {
            const connection =
                navigator.connection ||
                navigator.mozConnection ||
                navigator.webkitConnection;

            if (connection) {
                const updateConnectionQuality = () => {
                    let quality = "excellent";

                    if (connection.effectiveType) {
                        switch (connection.effectiveType) {
                            case "slow-2g":
                            case "2g":
                                quality = "poor";
                                break;
                            case "3g":
                                quality = "good";
                                break;
                            case "4g":
                            default:
                                quality = "excellent";
                                break;
                        }
                    }

                    if (connection.saveData) {
                        quality = "poor"; // Respect data saver mode
                    }

                    dispatch({ type: "SET_CONNECTION_QUALITY", quality });
                };

                updateConnectionQuality();
                connection.addEventListener("change", updateConnectionQuality);

                return () => {
                    connection.removeEventListener(
                        "change",
                        updateConnectionQuality
                    );
                };
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        const connectionCleanup = monitorConnectionQuality();

        // Monitor online/offline status
        const handleOnline = () =>
            dispatch({ type: "SET_CONNECTION_QUALITY", quality: "excellent" });
        const handleOffline = () =>
            dispatch({ type: "SET_CONNECTION_QUALITY", quality: "offline" });

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            if (connectionCleanup) connectionCleanup();
        };
    }, []);

    // Adaptive interval calculation with premium experience focus
    const calculateAdaptiveInterval = useCallback(
        (
            key,
            baseInterval,
            orderCount = 0,
            hasActiveOrders = false,
            consecutiveErrors = 0,
            context = "normal"
        ) => {
            const currentState = stateRef.current;
            const timeSinceActivity = Date.now() - currentState.userActivity;
            const isUserActive = timeSinceActivity < 30000; // 30 seconds
            const isHighInteraction = timeSinceActivity < 5000; // 5 seconds for high interaction

            let interval = baseInterval;

            // Connection quality adjustments
            switch (currentState.connectionQuality) {
                case "poor":
                    interval = Math.min(interval * 2, 30000); // Slower on poor connection
                    break;
                case "offline":
                    return null; // Stop polling when offline
                case "good":
                    interval = Math.max(interval * 1.1, 3000);
                    break;
                case "excellent":
                default:
                    // Keep base interval
                    break;
            }

            // Exponential backoff for errors with elegant recovery
            if (consecutiveErrors > 0) {
                const backoffMultiplier = Math.min(
                    Math.pow(1.5, consecutiveErrors),
                    8
                );
                interval = Math.min(interval * backoffMultiplier, 60000);
                return interval;
            }

            // Context-specific adjustments
            switch (context) {
                case "high_interaction":
                    // During high user interaction, slow down to avoid interruption
                    interval = Math.max(interval * 1.5, 8000);
                    break;
                case "background":
                    // Background updates can be less frequent
                    interval = Math.max(interval * 1.2, 6000);
                    break;
                case "critical":
                    // Critical updates (like order status) need faster polling
                    interval = Math.max(interval * 0.8, 2000);
                    break;
            }

            // User activity adjustments
            if (isHighInteraction) {
                // Very recent activity - be less aggressive
                interval = Math.max(interval * 1.3, 6000);
            } else if (!isUserActive) {
                // User not active - can poll more frequently without interruption
                interval = Math.max(interval * 0.9, 4000);
            }

            // Order activity adjustments
            if (hasActiveOrders) {
                if (orderCount > 10) {
                    interval = Math.max(interval * 0.7, 3000); // Very high activity
                } else if (orderCount > 5) {
                    interval = Math.max(interval * 0.8, 4000); // High activity
                } else if (orderCount > 0) {
                    interval = Math.max(interval * 0.9, 5000); // Some activity
                }
            } else {
                interval = Math.min(interval * 1.2, 15000); // No orders, slow down
            }

            // Page visibility adjustments
            if (!currentState.isActive) {
                interval = Math.min(interval * 2, 60000); // Much slower when not visible
            }

            return Math.max(interval, 2000); // Never go below 2 seconds for premium feel
        },
        []
    );

    // Update adaptive interval for existing polls
    const updateAdaptiveInterval = useCallback(
        (key, context = "normal") => {
            const adaptiveData = stateRef.current.adaptiveIntervals[key];
            if (!adaptiveData || !intervalRefs.current[key]) return;

            const newInterval = calculateAdaptiveInterval(
                key,
                adaptiveData.base,
                0, // This would need to be passed from the polling hook
                false, // This would need to be passed from the polling hook
                stateRef.current.retryAttempts[key] || 0,
                context
            );

            if (newInterval && newInterval !== adaptiveData.current) {
                dispatch({
                    type: "SET_INTERVAL",
                    key,
                    interval: newInterval,
                    baseInterval: adaptiveData.base,
                });
            }
        },
        [calculateAdaptiveInterval]
    );

    // Trigger immediate update for a specific poll
    const triggerImmediateUpdate = useCallback((key) => {
        // This would trigger an immediate poll without waiting for the interval
        // Implementation would depend on how we store the poll functions
        console.debug(`Triggering immediate update for ${key}`);
    }, []);

    // Enhanced polling function with seamless background updates
    const startSeamlessPolling = useCallback(
        (key, fetchFunction, options = {}) => {
            const {
                interval = 5000,
                maxRetries = 3,
                retryDelay = 2000,
                orderCount = 0,
                hasActiveOrders = false,
                onSuccess,
                onError,
                onTransition,
                priority = "normal", // normal, high, low
                backgroundUpdates = true,
                gracefulDegradation = true,
            } = options;

            // Clear existing interval and request
            if (intervalRefs.current[key]) {
                clearInterval(intervalRefs.current[key]);
            }

            if (abortControllers.current[key]) {
                abortControllers.current[key].abort();
                abortControllers.current[key] = null;
            }

            // Request state management
            const requestState = {
                inProgress: false,
                lastRequestTime: 0,
                consecutiveErrors: 0,
                lastSuccessfulData: null,
                requestCount: 0,
            };

            const executeSeamlessUpdate = async (
                isBackgroundUpdate = false
            ) => {
                // Prevent concurrent requests
                if (requestState.inProgress) {
                    return;
                }

                // Implement minimum time between requests based on priority
                const minInterval =
                    priority === "high"
                        ? 500
                        : priority === "low"
                        ? 2000
                        : 1000;
                const timeSinceLastRequest =
                    Date.now() - requestState.lastRequestTime;
                if (timeSinceLastRequest < minInterval) {
                    return;
                }

                // Check if we should skip this update due to graceful degradation
                if (
                    stateRef.current.gracefulDegradation &&
                    gracefulDegradation &&
                    isBackgroundUpdate
                ) {
                    const shouldSkip = Math.random() < 0.3; // Skip 30% of background updates
                    if (shouldSkip) return;
                }

                let timeoutId = null; // Declare outside try block

                try {
                    requestState.inProgress = true;
                    requestState.lastRequestTime = Date.now();
                    requestState.requestCount++;

                    // Create new abort controller
                    abortControllers.current[key] = new AbortController();

                    // Set up timeout based on connection quality
                    const timeoutDuration =
                        stateRef.current.connectionQuality === "poor"
                            ? 15000
                            : 10000;
                    timeoutId = setTimeout(() => {
                        if (abortControllers.current[key]) {
                            abortControllers.current[key].abort();
                        }
                    }, timeoutDuration);

                    // Prepare headers with enhanced caching
                    const headers = {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache",
                        "X-Requested-With": "XMLHttpRequest",
                    };

                    const etag = stateRef.current.etags[key];
                    if (etag) {
                        headers["If-None-Match"] = etag;
                    }

                    // Add CSRF token if available
                    const csrfToken = document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content");
                    if (csrfToken) {
                        headers["X-CSRF-TOKEN"] = csrfToken;
                    }

                    // Add request metadata for server optimization
                    headers["X-Polling-Key"] = key;
                    headers["X-Request-Count"] =
                        requestState.requestCount.toString();
                    headers["X-Background-Update"] = isBackgroundUpdate
                        ? "true"
                        : "false";

                    const response = await fetchFunction({
                        headers,
                        signal: abortControllers.current[key].signal,
                    });

                    clearTimeout(timeoutId);

                    // Handle 304 Not Modified - no changes (seamless!)
                    if (response.status === 304) {
                        dispatch({ type: "CLEAR_ERROR", key });
                        requestState.consecutiveErrors = 0;
                        return;
                    }

                    // Store new ETag if provided
                    const newEtag = response.headers.get("ETag");
                    if (newEtag) {
                        dispatch({ type: "SET_ETAG", key, etag: newEtag });
                    }

                    // Parse response data
                    const responseData = await response.json();

                    // Detect data changes for smooth transitions
                    if (requestState.lastSuccessfulData && onTransition) {
                        const hasChanges =
                            JSON.stringify(requestState.lastSuccessfulData) !==
                            JSON.stringify(responseData);
                        if (hasChanges) {
                            dispatch({
                                type: "SET_TRANSITION_STATE",
                                key,
                                from: requestState.lastSuccessfulData,
                                to: responseData,
                            });

                            // Trigger transition callback
                            onTransition(
                                requestState.lastSuccessfulData,
                                responseData
                            );

                            // Clear transition state after animation time
                            setTimeout(() => {
                                dispatch({
                                    type: "CLEAR_TRANSITION_STATE",
                                    key,
                                });
                            }, 300); // 300ms for smooth transitions
                        }
                    }

                    requestState.lastSuccessfulData = responseData;

                    // Reset retry attempts on success
                    dispatch({ type: "SET_RETRY_ATTEMPT", key, count: 0 });
                    dispatch({ type: "CLEAR_ERROR", key });
                    requestState.consecutiveErrors = 0;

                    // Store background update if this was a background request
                    if (isBackgroundUpdate && backgroundUpdates) {
                        dispatch({
                            type: "SET_BACKGROUND_UPDATE",
                            key,
                            data: responseData,
                            pending: false,
                        });
                    }

                    // Call success callback
                    if (onSuccess) {
                        onSuccess(responseData, {
                            isBackgroundUpdate,
                            requestCount: requestState.requestCount,
                        });
                    }
                } catch (error) {
                    if (timeoutId) clearTimeout(timeoutId);

                    // Don't handle aborted requests as errors
                    if (error.name === "AbortError") {
                        return;
                    }

                    requestState.consecutiveErrors++;
                    const currentRetries =
                        stateRef.current.retryAttempts[key] || 0;

                    if (currentRetries < maxRetries) {
                        // Increment retry count
                        dispatch({
                            type: "SET_RETRY_ATTEMPT",
                            key,
                            count: currentRetries + 1,
                        });

                        // Exponential backoff with jitter
                        const jitter = Math.random() * 1000;
                        const backoffDelay =
                            retryDelay * Math.pow(1.5, currentRetries) + jitter;

                        setTimeout(() => {
                            executeSeamlessUpdate(isBackgroundUpdate);
                        }, Math.min(backoffDelay, 30000)); // Max 30 seconds
                    } else {
                        // Max retries reached - set elegant error
                        const errorSeverity =
                            stateRef.current.connectionQuality === "offline"
                                ? "low"
                                : "medium";
                        dispatch({
                            type: "SET_ERROR",
                            key,
                            error:
                                error.message ||
                                "Connection temporarily unavailable",
                            severity: errorSeverity,
                            recoverable: true,
                        });

                        if (onError) {
                            onError(error, {
                                isBackgroundUpdate,
                                consecutiveErrors:
                                    requestState.consecutiveErrors,
                                gracefulDegradation:
                                    stateRef.current.gracefulDegradation,
                            });
                        }
                    }
                } finally {
                    requestState.inProgress = false;
                }
            };

            // Initial call (not background)
            executeSeamlessUpdate(false);

            // Set up adaptive interval
            const adaptiveInterval = calculateAdaptiveInterval(
                key,
                interval,
                orderCount,
                hasActiveOrders,
                0,
                "normal"
            );

            if (adaptiveInterval) {
                intervalRefs.current[key] = setInterval(() => {
                    executeSeamlessUpdate(true); // Subsequent calls are background updates
                }, adaptiveInterval);

                dispatch({
                    type: "SET_INTERVAL",
                    key,
                    interval: adaptiveInterval,
                    baseInterval: interval,
                });
            }

            // Return cleanup function
            return () => {
                if (intervalRefs.current[key]) {
                    clearInterval(intervalRefs.current[key]);
                    intervalRefs.current[key] = null;
                }
                if (abortControllers.current[key]) {
                    abortControllers.current[key].abort();
                    abortControllers.current[key] = null;
                }
                dispatch({ type: "CLEAR_INTERVAL", key });
                dispatch({ type: "CLEAR_ERROR", key });
                dispatch({ type: "CLEAR_TRANSITION_STATE", key });
            };
        },
        [calculateAdaptiveInterval]
    );

    // Stop polling for a specific key
    const stopSeamlessPolling = useCallback((key) => {
        if (intervalRefs.current[key]) {
            clearInterval(intervalRefs.current[key]);
            intervalRefs.current[key] = null;
        }
        if (abortControllers.current[key]) {
            abortControllers.current[key].abort();
            abortControllers.current[key] = null;
        }
        dispatch({ type: "CLEAR_INTERVAL", key });
        dispatch({ type: "CLEAR_ERROR", key });
        dispatch({ type: "CLEAR_TRANSITION_STATE", key });
    }, []);

    // Stop all polling
    const stopAllPolling = useCallback(() => {
        Object.keys(intervalRefs.current).forEach((key) => {
            stopSeamlessPolling(key);
        });
    }, [stopSeamlessPolling]);

    // Get elegant error state for UI
    const getElegantError = useCallback(
        (key) => {
            const error = state.errors[key];
            if (!error) return null;

            return {
                message: error.message,
                severity: error.severity,
                recoverable: error.recoverable,
                timestamp: error.timestamp,
                isStale: Date.now() - error.timestamp > 30000, // 30 seconds
                suggestion: error.recoverable
                    ? "We're working to restore the connection. Your experience will continue seamlessly."
                    : "Please check your internet connection and try again.",
            };
        },
        [state.errors]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.keys(intervalRefs.current).forEach((key) => {
                if (intervalRefs.current[key]) {
                    clearInterval(intervalRefs.current[key]);
                    intervalRefs.current[key] = null;
                }
                if (abortControllers.current[key]) {
                    abortControllers.current[key].abort();
                    abortControllers.current[key] = null;
                }
            });
        };
    }, []);

    const value = useMemo(
        () => ({
            state,
            startSeamlessPolling,
            stopSeamlessPolling,
            stopAllPolling,
            updateAdaptiveInterval,
            triggerImmediateUpdate,
            getElegantError,
            isActive: state.isActive,
            connectionQuality: state.connectionQuality,
            gracefulDegradation: state.gracefulDegradation,
            errors: state.errors,
            transitionStates: state.transitionStates,
            backgroundUpdates: state.backgroundUpdates,
        }),
        [
            state,
            startSeamlessPolling,
            stopSeamlessPolling,
            stopAllPolling,
            updateAdaptiveInterval,
            triggerImmediateUpdate,
            getElegantError,
        ]
    );

    return (
        <SeamlessPollingContext.Provider value={value}>
            {children}
        </SeamlessPollingContext.Provider>
    );
};
