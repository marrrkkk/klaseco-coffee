export default function InputError({ message, className = "", ...props }) {
    return message ? (
        <div className="animate-slide-down">
            <p
                {...props}
                className={`text-sm text-red-600 font-light flex items-center space-x-2 mt-2 ${className}`}
            >
                <svg
                    className="w-4 h-4 flex-shrink-0"
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
                <span>{message}</span>
            </p>
        </div>
    ) : null;
}
