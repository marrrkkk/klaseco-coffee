import { useEffect, useCallback, useRef } from "react";
import { usePollingContext } from "@/Contexts/PollingContext";

/**
 * Enhanced polling hook that uses the PollingContext for smart polling
 * @param {string} key - Unique identifier for this polling instance
 * @param {Function} fetchFunction - Function that returns a fetch promise
 * @param {Object} options - Polling configuration options
 * @returns {Object} - Polling control functions and state
 */
export function usePolling(key, fetchFunction, options = {}) {
    const {
        interval = 3000,
        orderCount = 0,
        hasActiveOrders = false,
        onSuccess,
        onError,
        enabled = true,
        dependencies = [],
    } = options;

    const { startPolling, stopPolling, errors } = usePollingContext();

    // Keep track of the current abortController
    const abortControllerRef = useRef(null);

    // Store callbacks in refs to avoid dependency issues
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
    }, [onSuccess, onError]);

    // Enhanced fetch function that works with the polling context
    const enhancedFetchFunction = useCallback(
        async ({ headers, signal }) => {
            // Abort any existing request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            // Create new controller and store it
            const controller = new AbortController();
            abortControllerRef.current = controller;

            const response = await fetch(fetchFunction.url || fetchFunction, {
                method: "GET",
                headers: {
                    ...headers,
                    Accept: "application/json",
                },
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok && response.status !== 304) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            return response;
        },
        [fetchFunction]
    );

    // Memoize success handler
    const handleSuccess = useCallback(async (response) => {
        if (response.status !== 304) {
            const data = await response.json();
            if (onSuccessRef.current) {
                onSuccessRef.current(data);
            }
        }
    }, []);

    // Start polling when enabled and dependencies change
    useEffect(() => {
        if (!enabled) {
            stopPolling(key);
            return;
        }

        const cleanup = startPolling(key, enhancedFetchFunction, {
            interval,
            orderCount,
            hasActiveOrders,
            onSuccess: handleSuccess,
            onError: onErrorRef.current,
        });

        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, interval, orderCount, hasActiveOrders, enabled, ...dependencies]);

    // Cleanup on unmount or when key changes
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            stopPolling(key);
        };
    }, [key, stopPolling]);

    return {
        error: errors[key],
        stopPolling: () => stopPolling(key),
    };
}

/**
 * Legacy polling hook for backward compatibility
 * @deprecated Use the new usePolling hook with PollingContext instead
 */
export function useLegacyPolling(callback, interval = 3000, dependencies = []) {
    const intervalRef = useRef(null);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const startPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Call immediately
        callbackRef.current();

        // Then set up interval
        intervalRef.current = setInterval(() => {
            callbackRef.current();
        }, interval);
    }, [interval]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Start polling when dependencies change
    useEffect(() => {
        startPolling();

        return () => {
            stopPolling();
        };
    }, [startPolling, stopPolling, ...dependencies]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return { startPolling, stopPolling };
}
