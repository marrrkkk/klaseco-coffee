import { memo } from "react";
import ImageSkeleton from "./ImageSkeleton";

/**
 * MenuItemGridSkeleton displays loading placeholders for menu item cards
 * Provides visual feedback during data fetching
 */
const MenuItemGridSkeleton = memo(function MenuItemGridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-primary-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    {/* Image skeleton */}
                    <div className="h-48 w-full relative">
                        <ImageSkeleton className="absolute inset-0 w-full h-full" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-5xl text-medium-gray opacity-20">
                                ☕
                            </div>
                        </div>
                    </div>

                    {/* Content skeleton */}
                    <div className="p-6 space-y-4">
                        {/* Title */}
                        <div className="h-6 bg-light-gray rounded w-3/4"></div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="h-4 bg-light-gray rounded w-full"></div>
                            <div className="h-4 bg-light-gray rounded w-5/6"></div>
                        </div>

                        {/* Price and button */}
                        <div className="flex items-center justify-between pt-4">
                            <div className="h-8 bg-light-gray rounded w-20"></div>
                            <div className="h-10 bg-light-gray rounded w-28"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

export default MenuItemGridSkeleton;
