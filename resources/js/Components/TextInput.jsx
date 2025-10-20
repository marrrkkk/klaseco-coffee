import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

export default forwardRef(function TextInput(
    {
        type = "text",
        className = "",
        isFocused = false,
        error = false,
        success = false,
        ...props
    },
    ref
) {
    const localRef = useRef(null);
    const [isFocusedState, setIsFocusedState] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const handleFocus = (e) => {
        setIsFocusedState(true);
        props.onFocus?.(e);
    };

    const handleBlur = (e) => {
        setIsFocusedState(false);
        props.onBlur?.(e);
    };

    const handleChange = (e) => {
        setHasValue(e.target.value.length > 0);
        props.onChange?.(e);
    };

    // Determine border color based on state
    const getBorderColor = () => {
        if (error)
            return "border-red-300 focus:border-red-500 focus:ring-red-500";
        if (success)
            return "border-success-green focus:border-success-green focus:ring-success-green";
        if (isFocusedState)
            return "border-coffee-accent focus:border-coffee-accent focus:ring-coffee-accent";
        return "border-light-gray focus:border-coffee-accent focus:ring-coffee-accent";
    };

    return (
        <div className="relative">
            <input
                {...props}
                type={type}
                className={`
                    w-full px-4 py-3 rounded-md border transition-all duration-200
                    bg-primary-white text-dark-gray font-light
                    placeholder-medium-gray placeholder-opacity-60
                    focus:outline-none focus:ring-1
                    disabled:bg-light-gray disabled:cursor-not-allowed disabled:opacity-60
                    ${getBorderColor()}
                    ${isFocusedState ? "shadow-sm" : ""}
                    ${hasValue ? "border-medium-gray" : ""}
                    ${className}
                `}
                ref={localRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
            />

            {/* Success indicator */}
            {success && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success-green animate-fade-in">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
            )}

            {/* Error indicator */}
            {error && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 animate-fade-in">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
});
