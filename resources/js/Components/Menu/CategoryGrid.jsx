import { memo } from "react";
import CategoryCard from "./CategoryCard";

const CategoryGrid = memo(function CategoryGrid({
    categories,
    onCategoryClick,
}) {
    // Determine if we should center the grid (when there are few categories)
    const shouldCenter = categories.length <= 4;

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            {/* Responsive Grid Layout with staggered animations */}
            <div
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${
                    shouldCenter
                        ? "lg:flex lg:justify-center lg:flex-wrap lg:max-w-5xl lg:mx-auto"
                        : ""
                }`}
            >
                {categories.map((category, index) => (
                    <div
                        key={category.id}
                        className={`animate-scaleIn ${
                            shouldCenter ? "lg:w-64" : ""
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <CategoryCard
                            category={category}
                            onClick={onCategoryClick}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
});

export default CategoryGrid;
