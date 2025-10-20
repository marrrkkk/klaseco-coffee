import { useNotifications } from "../Contexts/NotificationContext";

export function useNotify() {
    const { success, error, warning, info } = useNotifications();

    return {
        success: (message, title = null) => {
            return success(message, { title });
        },
        error: (message, title = "Error") => {
            return error(message, { title });
        },
        warning: (message, title = "Warning") => {
            return warning(message, { title });
        },
        info: (message, title = null) => {
            return info(message, { title });
        },
        orderAccepted: (orderNumber) => {
            return success(
                `Order #${orderNumber} has been accepted and sent to preparation.`,
                "Order Accepted"
            );
        },
        orderReady: (orderNumber) => {
            return success(
                `Order #${orderNumber} is ready for pickup!`,
                "Order Ready"
            );
        },
        orderSubmitted: (orderNumber) => {
            return success(
                `Your order #${orderNumber} has been submitted successfully.`,
                "Order Submitted"
            );
        },
        orderRejected: (orderNumber, reason = null) => {
            const message = reason
                ? `Order #${orderNumber} was rejected: ${reason}`
                : `Order #${orderNumber} was rejected.`;
            return error(message, "Order Rejected");
        },
        networkError: () => {
            return error(
                "Unable to connect to the server. Please check your connection and try again.",
                "Connection Error"
            );
        },
        validationError: (message) => {
            return warning(message, "Please Check Your Input");
        },
    };
}
