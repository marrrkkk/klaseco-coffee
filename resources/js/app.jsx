import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { SeamlessPollingProvider } from "./Contexts/SeamlessPollingContext";
import { PollingProvider } from "./Contexts/PollingContext";
import { NotificationProvider } from "./Contexts/NotificationContext";
import PremiumNotifications from "./Components/PremiumNotifications";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <NotificationProvider>
                <PollingProvider>
                    <SeamlessPollingProvider>
                        <App {...props} />
                        <PremiumNotifications />
                    </SeamlessPollingProvider>
                </PollingProvider>
            </NotificationProvider>
        );
    },
    progress: {
        color: "#4B5563",
    },
});
