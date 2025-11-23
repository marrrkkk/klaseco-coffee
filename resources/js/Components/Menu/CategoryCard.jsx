import { useState, memo } from "react";
import ImageSkeleton from "./ImageSkeleton";

const CategoryCard = memo(function CategoryCard({ category, onClick }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleClick = () => {
        onClick(category.id);
    };

    const handleImageError = (e) => {
        // Use a data URI as fallback to avoid network requests
        const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23FFFFFF' font-family='Arial, sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(
            category.name
        )}%3C/text%3E%3C/svg%3E`;
        e.target.src = fallbackSvg;
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <div onClick={handleClick} className="group cursor-pointer">
            {/* Modern Category Card */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-primary-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-light-gray">
                {/* Skeleton Loader */}
                {!imageLoaded && (
                    <ImageSkeleton className="absolute inset-0 w-full h-full" />
                )}

                {/* Category Image */}
                <img
                    src={
                        category.image_url ||
                        `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23FFFFFF' font-family='Arial, sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(
                            category.name
                        )}%3C/text%3E%3C/svg%3E`
                    }
                    alt={category.name}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                />

                {/* Modern Category Name Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                    <div className="w-full">
                        <h3 className="text-primary-white text-lg sm:text-xl font-semibold mb-1">
                            {category.name}
                        </h3>
                        <div className="flex items-center text-primary-white/80 text-xs sm:text-sm">
                            <span>View Menu</span>
                            <svg
                                className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CategoryCard;
