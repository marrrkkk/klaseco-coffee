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
            {/* Category Card with rounded square design */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-light-gray border border-light-gray hover:border-coffee-accent transition-all duration-300 hover:shadow-lg hover:scale-105">
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
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                />

                {/* Category Name Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center p-6">
                    <h3 className="text-primary-white text-xl sm:text-2xl font-light tracking-wide text-center">
                        {category.name}
                    </h3>
                </div>
            </div>
        </div>
    );
});

export default CategoryCard;
