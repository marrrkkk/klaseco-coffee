import { memo } from "react";
import { router } from "@inertiajs/react";
import { formatCurrency } from "@/Utils/currency";
import ProductImage from "./ProductImage";
import PricingDisplay from "./PricingDisplay";

const CoffeeProductCard = memo(function CoffeeProductCard({ item }) {
    const handleViewProduct = () => {
        router.visit(`/product?id=${item.id}`);
    };

    return (
        <div onClick={handleViewProduct} className="group cursor-pointer">
            {/* Premium Product Card - Mobile Responsive */}
            <div className="bg-primary-white border border-light-gray hover:border-coffee-accent transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 rounded-lg overflow-hidden">
                {/* High-Quality Product Image */}
                <div className="aspect-square border-b border-light-gray overflow-hidden">
                    <div className="transform transition-transform duration-500 group-hover:scale-105">
                        <ProductImage item={item} className="w-full h-full" />
                    </div>
                </div>

                {/* Refined Product Details */}
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-light text-dark-gray mb-2 sm:mb-3 tracking-wide">
                            {item.name}
                        </h3>
                        {item.description && (
                            <p className="text-medium-gray font-light leading-relaxed text-sm line-clamp-2">
                                {item.description}
                            </p>
                        )}
                    </div>

                    {/* Elegant Pricing */}
                    <div className="mb-4 sm:mb-6">
                        <div className="text-xl sm:text-2xl font-light text-coffee-accent">
                            {formatCurrency(item.base_price)}
                        </div>
                        <div className="text-xs sm:text-sm text-medium-gray mt-1">
                            Starting price
                        </div>
                    </div>

                    {/* Sophisticated Action */}
                    <div className="flex items-center justify-between text-dark-gray group-hover:text-coffee-accent transition-colors">
                        <span className="text-sm sm:text-base font-light">
                            Customize Order
                        </span>
                        <svg
                            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
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
    );
});

export default CoffeeProductCard;
