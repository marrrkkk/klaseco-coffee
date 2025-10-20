export default function SophisticatedLoadingState({
    variant = "default",
    size = "md",
    message = "Loading...",
    className = "",
}) {
    const sizes = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12",
    };

    const variants = {
        default: (
            <div
                className={`flex items-center justify-center space-x-3 ${className}`}
            >
                <div
                    className={`${sizes[size]} border-2 border-coffee-accent border-t-transparent rounded-full animate-spin`}
                ></div>
                {message && (
                    <span className="text-medium-gray font-light">
                        {message}
                    </span>
                )}
            </div>
        ),
        dots: (
            <div
                className={`flex items-center justify-center space-x-2 ${className}`}
            >
                <div
                    className={`${sizes[size]} bg-coffee-accent rounded-full animate-pulse`}
                ></div>
                <div
                    className={`${sizes[size]} bg-coffee-accent rounded-full animate-pulse`}
                    style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                    className={`${sizes[size]} bg-coffee-accent rounded-full animate-pulse`}
                    style={{ animationDelay: "0.4s" }}
                ></div>
            </div>
        ),
        bars: (
            <div
                className={`flex items-center justify-center space-x-1 ${className}`}
            >
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="w-1 bg-coffee-accent rounded-full animate-pulse"
                        style={{
                            height:
                                size === "sm"
                                    ? "16px"
                                    : size === "md"
                                    ? "24px"
                                    : "32px",
                            animationDelay: `${i * 0.15}s`,
                        }}
                    ></div>
                ))}
            </div>
        ),
        coffee: (
            <div
                className={`flex flex-col items-center justify-center space-y-3 ${className}`}
            >
                <div className="relative">
                    <div
                        className={`${sizes[size]} text-coffee-accent animate-pulse-subtle`}
                    >
                        <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 21h18v-2H2v2zm2-8h12V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v8zm14-8v3h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v3c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V5c0-1.66 1.34-3 3-3h8c1.66 0 3 1.34 3 3z" />
                        </svg>
                    </div>
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <div className="flex space-x-0.5">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="w-0.5 h-2 bg-coffee-accent rounded-full opacity-60 animate-slide-up"
                                    style={{
                                        animationDelay: `${i * 0.2}s`,
                                        animationDuration: "1s",
                                        animationIterationCount: "infinite",
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
                {message && (
                    <span className="text-medium-gray font-light text-sm">
                        {message}
                    </span>
                )}
            </div>
        ),
        skeleton: (
            <div className={`space-y-3 ${className}`}>
                <div className="h-4 bg-light-gray rounded animate-pulse"></div>
                <div className="h-4 bg-light-gray rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-light-gray rounded animate-pulse w-4/6"></div>
            </div>
        ),
    };

    return variants[variant] || variants.default;
}
