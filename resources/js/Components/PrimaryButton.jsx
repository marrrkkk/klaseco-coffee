import { useState } from "react";

export default function PrimaryButton({
    className = "",
    disabled,
    loading = false,
    children,
    variant = "primary",
    ...props
}) {
    const [isPressed, setIsPressed] = useState(false);

    const variants = {
        primary: "bg-dark-gray hover:bg-coffee-accent text-primary-white",
        secondary: "bg-coffee-accent hover:bg-dark-gray text-primary-white",
        success: "bg-success-green hover:bg-opacity-90 text-primary-white",
        outline:
            "border-2 border-dark-gray text-dark-gray hover:bg-dark-gray hover:text-primary-white",
    };

    return (
        <button
            {...props}
            className={`
                inline-flex items-center justify-center rounded-md px-6 py-3
                font-light tracking-wide
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${variants[variant]}
                ${
                    !disabled && !loading
                        ? "hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                        : ""
                }
                ${isPressed && !disabled && !loading ? "scale-95" : "scale-100"}
                ${className}
            `}
            disabled={disabled || loading}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
        >
            {loading ? (
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                        {typeof children === "string" ? children : "Loading..."}
                    </span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}
