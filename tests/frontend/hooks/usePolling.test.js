import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";

// Mock the actual hook file
const mockUsePolling = vi.fn();

// Mock implementation
const usePolling = (callback, interval = 3000, dependencies = []) => {
    const [isPolling, setIsPolling] = React.useState(false);
    const [error, setError] = React.useState(null);
    const intervalRef = React.useRef(null);

    const startPolling = React.useCallback(() => {
        if (intervalRef.current) return;

        setIsPolling(true);
        setError(null);

        // Execute immediately
        callback().catch(setError);

        intervalRef.current = setInterval(async () => {
            try {
                await callback();
                setError(null);
            } catch (err) {
                setError(err);
            }
        }, interval);
    }, [callback, interval]);

    const stopPolling = React.useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPolling(false);
    }, []);

    React.useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (isPolling) {
            stopPolling();
            startPolling();
        }
    }, dependencies);

    return {
        isPolling,
        error,
        startPolling,
        stopPolling,
    };
};

describe("usePolling", () => {
    let mockCallback;

    beforeEach(() => {
        mockCallback = vi.fn().mockResolvedValue("success");
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("should initialize with correct default state", () => {
        const { result } = renderHook(() => usePolling(mockCallback));

        expect(result.current.isPolling).toBe(false);
        expect(result.current.error).toBe(null);
        expect(typeof result.current.startPolling).toBe("function");
        expect(typeof result.current.stopPolling).toBe("function");
    });

    it("should start polling when startPolling is called", async () => {
        const { result } = renderHook(() => usePolling(mockCallback, 1000));

        act(() => {
            result.current.startPolling();
        });

        expect(result.current.isPolling).toBe(true);
        expect(mockCallback).toHaveBeenCalledTimes(1);

        // Advance timer to trigger interval
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(mockCallback).toHaveBeenCalledTimes(2);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(mockCallback).toHaveBeenCalledTimes(3);
    });

    it("should stop polling when stopPolling is called", async () => {
        const { result } = renderHook(() => usePolling(mockCallback, 1000));

        act(() => {
            result.current.startPolling();
        });

        expect(result.current.isPolling).toBe(true);

        act(() => {
            result.current.stopPolling();
        });

        expect(result.current.isPolling).toBe(false);

        // Advance timer - callback should not be called again
        const callCountBeforeStop = mockCallback.mock.calls.length;

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(mockCallback).toHaveBeenCalledTimes(callCountBeforeStop);
    });

    it("should handle callback errors", async () => {
        const error = new Error("Polling failed");
        mockCallback.mockRejectedValue(error);

        const { result } = renderHook(() => usePolling(mockCallback, 1000));

        act(() => {
            result.current.startPolling();
        });

        // Wait for the promise to resolve
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe(error);
        expect(result.current.isPolling).toBe(true); // Should continue polling despite error
    });

    it("should clear error on successful callback after error", async () => {
        const error = new Error("Polling failed");
        mockCallback.mockRejectedValueOnce(error).mockResolvedValue("success");

        const { result } = renderHook(() => usePolling(mockCallback, 1000));

        act(() => {
            result.current.startPolling();
        });

        // Wait for first call (error)
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe(error);

        // Advance timer for second call (success)
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe(null);
    });

    it("should restart polling when dependencies change", async () => {
        let dependency = "initial";
        const { result, rerender } = renderHook(
            ({ dep }) => usePolling(mockCallback, 1000, [dep]),
            { initialProps: { dep: dependency } }
        );

        act(() => {
            result.current.startPolling();
        });

        expect(mockCallback).toHaveBeenCalledTimes(1);

        // Change dependency
        dependency = "changed";
        rerender({ dep: dependency });

        // Should restart polling (call callback again immediately)
        expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it("should not start multiple intervals", async () => {
        const { result } = renderHook(() => usePolling(mockCallback, 1000));

        act(() => {
            result.current.startPolling();
            result.current.startPolling(); // Call again
        });

        expect(result.current.isPolling).toBe(true);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // Should only have been called twice (once immediately, once after interval)
        expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it("should cleanup interval on unmount", () => {
        const clearIntervalSpy = vi.spyOn(global, "clearInterval");

        const { result, unmount } = renderHook(() =>
            usePolling(mockCallback, 1000)
        );

        act(() => {
            result.current.startPolling();
        });

        unmount();

        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it("should use custom interval", async () => {
        const customInterval = 500;
        const { result } = renderHook(() =>
            usePolling(mockCallback, customInterval)
        );

        act(() => {
            result.current.startPolling();
        });

        expect(mockCallback).toHaveBeenCalledTimes(1);

        act(() => {
            vi.advanceTimersByTime(customInterval);
        });

        expect(mockCallback).toHaveBeenCalledTimes(2);

        act(() => {
            vi.advanceTimersByTime(customInterval);
        });

        expect(mockCallback).toHaveBeenCalledTimes(3);
    });

    it("should handle rapid start/stop calls", async () => {
        const { result } = renderHook(() => usePolling(mockCallback, 1000));

        act(() => {
            result.current.startPolling();
            result.current.stopPolling();
            result.current.startPolling();
        });

        expect(result.current.isPolling).toBe(true);
        expect(mockCallback).toHaveBeenCalledTimes(1);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(mockCallback).toHaveBeenCalledTimes(2);
    });
});
