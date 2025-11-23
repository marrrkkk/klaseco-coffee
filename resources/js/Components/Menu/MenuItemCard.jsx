import { memo } from "react";
import { formatCurrency } from "@/Utils/currency";
import ProductImage from "./ProductImage";

const MenuItemCard = memo(function MenuItemCard({ item, onAddToCart }) {
    const handleAddToCartClick = () => {
        if (onAddToCart) {
            onAddToCart(item);
        }
    };

    return (
        <div className="group bg-primary-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Product Image */}
            <div className="h-48 w-full overflow-hidden flex-shrink-0">
                <ProductImage
                    item={item}
                    className="w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Product Details */}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-light text-dark-gray mb-2 tracking-wide">
                    {item.name}
                </h3>

                {item.description && (
                    <p className="text-sm text-medium-gray font-light leading-relaxed mb-4 line-clamp-2">
                        {item.description}
                    </p>
                )}

                {/* Price and Action */}
                <div className="flex items-center justify-between mt-auto pt-4">
                    <span className="text-2xl font-light text-dark-gray">
                        {formatCurrency(item.base_price)}
                    </span>

                    <button
                        onClick={handleAddToCartClick}
                        className="py-2 px-6 bg-dark-gray text-primary-white font-light tracking-wide hover:bg-coffee-accent transition-all duration-300 rounded-lg shadow-md hover:shadow-lg"
                        aria-label={`Add ${item.name} to cart`}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
});

export default MenuItemCard;
