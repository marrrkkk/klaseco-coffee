import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotifications must be used within a NotificationProvider"
        );
    }
    return context;
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type: "info",
            duration: 5000,
            ...notification,
        };

        setNotifications((prev) => [...prev, newNotification]);

        // Auto-remove notification after duration
        if (newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Convenience methods
    const success = useCallback(
        (message, options = {}) => {
            return addNotification({
                type: "success",
                message,
                ...options,
            });
        },
        [addNotification]
    );

    const error = useCallback(
        (message, options = {}) => {
            return addNotification({
                type: "error",
                message,
                duration: 7000, // Longer duration for errors
                ...options,
            });
        },
        [addNotification]
    );

    const warning = useCallback(
        (message, options = {}) => {
            return addNotification({
                type: "warning",
                message,
                ...options,
            });
        },
        [addNotification]
    );

    const info = useCallback(
        (message, options = {}) => {
            return addNotification({
                type: "info",
                message,
                ...options,
            });
        },
        [addNotification]
    );

    const value = {
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        success,
        error,
        warning,
        info,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}
