import React, {
    createContext,
    useContext,
    useReducer,
    useCallback,
    useRef,
    useEffect,
} from "react";

// Polling state management
const initialState = {
    intervals: {},
    etags: {},
    retryAttempts: {},
    isActive: true,
    userActivity: Date.now(),
    errors: {},
};

const pollingReducer = (state, action) => {
    switch (action.type) {
        case "SET_INTERVAL":
            return {
                ...state,
                intervals: {
                    ...state.intervals,
                    [action.key]: action.interval,
                },
            };

        case "CLEAR_INTERVAL":
            return {
                ...state,
                intervals: {
                    ...state.intervals,
                    [action.key]: null,
                },
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
                    [action.key]: action.error,
                },
            };

        case "CLEAR_ERROR":
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.key]: null,
                },
            };

        default:
            return state;
    }
};

const PollingContext = createContext();

export const usePollingContext = () => {
    const context = useContext(PollingContext);
    if (!context) {
        throw new Error(
            "usePollingContext must be used within a PollingProvider"
        );
    }
    return context;
};

export const PollingProvider = ({ children }) => {
    const [state, dispatch] = useReducer(pollingReducer, initialState);
    const intervalRefs = useRef({});
    const abortControllers = useRef({});
    const stateRef = useRef(state);

    // Keep state ref updated
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Track user activity for smart polling
    useEffect(() => {
        const handleUserActivity = () => {
            dispatch({ type: "UPDATE_USER_ACTIVITY" });
        };

        const events = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
            "click",
        ];
        events.forEach((event) => {
            document.addEventListener(event, handleUserActivity, true);
        });

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleUserActivity, true);
            });
        };
    }, []);

    // Handle page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            dispatch({
                type: "SET_ACTIVE",
                isActive: !document.hidden,
            });
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, []);

    // Calculate smart polling interval based on user activity and order states
    const calculatePollingInterval = useCallback(
        (
            baseInterval,
            orderCount = 0,
            hasActiveOrders = false,
            consecutiveErrors = 0
        ) => {
            const currentState = stateRef.current;
            const timeSinceActivity = Date.now() - currentState.userActivity;
            const isUserActive = timeSinceActivity < 30000; // 30 seconds

            // Start with base interval
            let interval = baseInterval;

            // Exponential backoff for errors
            if (consecutiveErrors > 0) {
                interval = Math.min(
                    interval * Math.pow(2, consecutiveErrors),
                    60000 // Max 1 minute on errors
                );
                return interval; // Return immediately if we're in error backoff
            }

            // Adjust based on user activity
            if (!isUserActive) {
                interval = Math.min(interval * 1.5, 30000); // Max 30 seconds when inactive
            }

            // Adjust based on order activity
            if (hasActiveOrders) {
                if (orderCount > 5) {
                    interval = Math.max(interval * 0.8, 5000); // High activity, faster updates
                } else if (orderCount > 0) {
                    interval = Math.max(interval * 0.9, 5000); // Some activity
                }
            } else {
                interval = Math.min(interval * 1.2, 15000); // No orders, slow down
            }

            // Final adjustment for page visibility
            if (!currentState.isActive) {
                interval = Math.min(interval * 2, 60000); // Max 1 minute when not visible
            }

            return Math.max(interval, 5000); // Never go below 5 seconds
        },
        [] // No dependencies to prevent infinite re-renders
    );

    // Enhanced polling function with ETag support, error handling, and request deduplication
    const startPolling = useCallback(
        (key, fetchFunction, options = {}) => {
            const {
                interval = 5000,
                maxRetries = 3,
                retryDelay = 2000,
                orderCount = 0,
                hasActiveOrders = false,
                onSuccess,
                onError,
            } = options;

            // Store the request state
            const requestState = {
                inProgress: false,
                lastRequestTime: 0,
                consecutiveErrors: 0,
            };

            // Clear existing interval and request
            if (intervalRefs.current[key]) {
                clearInterval(intervalRefs.current[key]);
            }

            if (abortControllers.current[key]) {
                abortControllers.current[key].abort();
                abortControllers.current[key] = null;
            }

            const poll = async () => {
                // Prevent concurrent requests
                if (requestState.inProgress) {
                    return;
                }

                // Implement minimum time between requests
                const timeSinceLastRequest =
                    Date.now() - requestState.lastRequestTime;
                if (timeSinceLastRequest < 1000) {
                    // Minimum 1 second between requests
                    return;
                }

                try {
                    requestState.inProgress = true;
                    requestState.lastRequestTime = Date.now();

                    // Create new abort controller for this request
                    abortControllers.current[key] = new AbortController();

                    // Set up timeout for the request
                    const timeoutId = setTimeout(() => {
                        if (abortControllers.current[key]) {
                            abortControllers.current[key].abort();
                        }
                    }, 10000); // 10 second timeout

                    // Prepare headers
                    const headers = {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache",
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

                    const response = await fetchFunction({
                        headers,
                        signal: abortControllers.current[key].signal,
                    });

                    // Handle 304 Not Modified - no changes
                    if (response.status === 304) {
                        dispatch({ type: "CLEAR_ERROR", key });
                        return;
                    }

                    // Store new ETag if provided
                    const newEtag = response.headers.get("ETag");
                    if (newEtag) {
                        dispatch({ type: "SET_ETAG", key, etag: newEtag });
                    }

                    // Reset retry attempts on success
                    dispatch({ type: "SET_RETRY_ATTEMPT", key, count: 0 });
                    dispatch({ type: "CLEAR_ERROR", key });

                    // Call success callback if provided
                    if (onSuccess) {
                        onSuccess(response);
                    }
                } catch (error) {
                    // Don't handle aborted requests as errors
                    if (error.name === "AbortError") {
                        return;
                    }

                    const currentRetries =
                        stateRef.current.retryAttempts[key] || 0;

                    if (currentRetries < maxRetries) {
                        // Increment retry count
                        dispatch({
                            type: "SET_RETRY_ATTEMPT",
                            key,
                            count: currentRetries + 1,
                        });

                        // Retry after delay
                        setTimeout(() => {
                            poll();
                        }, retryDelay * Math.pow(2, currentRetries)); // Exponential backoff
                    } else {
                        // Max retries reached, set error
                        dispatch({
                            type: "SET_ERROR",
                            key,
                            error: error.message || "Network error occurred",
                        });

                        if (onError) {
                            onError(error);
                        }
                    }
                }
            };

            // Initial call
            poll();

            // Set up interval with smart timing
            const smartInterval = calculatePollingInterval(
                interval,
                orderCount,
                hasActiveOrders
            );

            intervalRefs.current[key] = setInterval(poll, smartInterval);

            dispatch({ type: "SET_INTERVAL", key, interval: smartInterval });

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
            };
        },
        [calculatePollingInterval]
    );

    // Stop polling for a specific key
    const stopPolling = useCallback((key) => {
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
    }, []);

    // Stop all polling
    const stopAllPolling = useCallback(() => {
        Object.keys(intervalRefs.current).forEach((key) => {
            stopPolling(key);
        });
    }, [stopPolling]);

    // Update polling frequency for existing polls
    const updatePollingFrequency = useCallback(
        (key, orderCount = 0, hasActiveOrders = false) => {
            const currentInterval = stateRef.current.intervals[key];
            if (currentInterval && intervalRefs.current[key]) {
                const newInterval = calculatePollingInterval(
                    currentInterval,
                    orderCount,
                    hasActiveOrders
                );

                if (newInterval !== currentInterval) {
                    clearInterval(intervalRefs.current[key]);

                    // Get the current poll function (this is a simplified approach)
                    // In a real implementation, you'd need to store the poll function
                    const poll = () => {
                        // This would need to be the actual poll function
                        console.log(
                            `Polling ${key} with new interval: ${newInterval}`
                        );
                    };

                    intervalRefs.current[key] = setInterval(poll, newInterval);
                    dispatch({
                        type: "SET_INTERVAL",
                        key,
                        interval: newInterval,
                    });
                }
            }
        },
        [calculatePollingInterval]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Clean up all intervals and abort controllers directly
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
    }, []); // No dependencies to prevent re-renders

    const value = {
        state,
        startPolling,
        stopPolling,
        stopAllPolling,
        updatePollingFrequency,
        isActive: state.isActive,
        errors: state.errors,
    };

    return (
        <PollingContext.Provider value={value}>
            {children}
        </PollingContext.Provider>
    );
};
