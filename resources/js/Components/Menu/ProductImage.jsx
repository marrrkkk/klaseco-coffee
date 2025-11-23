import { useState, memo } from "react";
import ImageSkeleton from "./ImageSkeleton";

const ProductImage = memo(function ProductImage({ item, className = "" }) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const defaultImage = "/images/products/default-coffee.svg";
    const imageSrc =
        imageError || !item.image_url ? defaultImage : item.image_url;

    return (
        <div className={`relative overflow-hidden bg-warm-white ${className}`}>
            {/* Skeleton loader with coffee icon */}
            {!imageLoaded && (
                <>
                    <ImageSkeleton className="absolute inset-0 w-full h-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl text-medium-gray opacity-30 animate-pulse">
                            ☕
                        </div>
                    </div>
                </>
            )}

            {/* Product image with smooth fade-in */}
            <img
                src={imageSrc}
                alt={item.name}
                onError={() => setImageError(true)}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
                className={`w-full h-full object-cover transition-all duration-700 ${
                    imageLoaded
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-105"
                }`}
            />

            {}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-gray/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

            {}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gold-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        </div>
    );
});

export default ProductImage;
