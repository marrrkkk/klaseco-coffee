import { memo } from "react";

/**
 * ImageSkeleton component provides a smooth shimmer loading effect for images
 * Uses gradient animation to indicate loading state
 */
const ImageSkeleton = memo(function ImageSkeleton({ className = "" }) {
    return (
        <div
            className={`bg-gradient-to-r from-light-gray via-medium-gray/20 to-light-gray bg-[length:200%_100%] ${className}`}
            style={{
                animation: "shimmer 1.8s ease-in-out infinite",
            }}
        >
            <style>{`
                @keyframes shimmer {
                    0% {
                        background-position: 200% 0;
                    }
                    100% {
                        background-position: -200% 0;
                    }
                }
            `}</style>
        </div>
    );
});

export default ImageSkeleton;
