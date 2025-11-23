import { useEffect, useState } from "react";

/**
 * PageTransition component provides smooth fade-in animations for page content
 * Ensures consistent loading experience across all pages
 */
export default function PageTransition({ children, delay = 0 }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={`transition-all duration-500 ${
                isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
            }`}
        >
            {children}
        </div>
    );
}
