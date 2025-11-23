import { memo } from "react";
import ImageSkeleton from "./ImageSkeleton";

/**
 * CategoryGridSkeleton displays loading placeholders for category cards
 * Provides visual feedback during data fetching
 */
const CategoryGridSkeleton = memo(function CategoryGridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-light-gray">
                        <ImageSkeleton className="absolute inset-0 w-full h-full" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent flex items-end justify-center p-6">
                            <div className="h-6 w-32 bg-white/30 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

export default CategoryGridSkeleton;
