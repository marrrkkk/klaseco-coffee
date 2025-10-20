import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNotifications } from "../Contexts/NotificationContext";

const notificationIcons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
};

const notificationStyles = {
    success: {
        container: "bg-primary-white border-l-4 border-success-green shadow-lg",
        icon: "text-success-green",
        title: "text-success-green",
        message: "text-dark-gray",
    },
    error: {
        container: "bg-primary-white border-l-4 border-red-500 shadow-lg",
        icon: "text-red-500",
        title: "text-red-500",
        message: "text-dark-gray",
    },
    warning: {
        container: "bg-primary-white border-l-4 border-gold-accent shadow-lg",
        icon: "text-gold-accent",
        title: "text-gold-accent",
        message: "text-dark-gray",
    },
    info: {
        container: "bg-primary-white border-l-4 border-coffee-accent shadow-lg",
        icon: "text-coffee-accent",
        title: "text-coffee-accent",
        message: "text-dark-gray",
    },
};

function NotificationItem({ notification, onRemove }) {
    const Icon = notificationIcons[notification.type];
    const styles = notificationStyles[notification.type];

    return (
        <Transition
            show={true}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className={`max-w-sm w-full rounded-lg ${styles.container}`}>
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <Icon
                                className={`h-5 w-5 ${styles.icon}`}
                                aria-hidden="true"
                            />
                        </div>
                        <div className="ml-3 w-0 flex-1">
                            {notification.title && (
                                <p
                                    className={`text-sm font-medium ${styles.title} mb-1`}
                                >
                                    {notification.title}
                                </p>
                            )}
                            <p className={`text-sm ${styles.message}`}>
                                {notification.message}
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                className="rounded-md inline-flex text-medium-gray hover:text-dark-gray focus:outline-none focus:ring-2 focus:ring-coffee-accent transition-colors duration-200"
                                onClick={() => onRemove(notification.id)}
                            >
                                <span className="sr-only">Close</span>
                                <XMarkIcon
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    );
}

export default function PremiumNotifications() {
    const { notifications, removeNotification } = useNotifications();

    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map((notification) => (
                    <div key={notification.id} className="pointer-events-auto">
                        <NotificationItem
                            notification={notification}
                            onRemove={removeNotification}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
