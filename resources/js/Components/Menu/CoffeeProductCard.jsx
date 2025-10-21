import { useState } from "react";
import { formatCurrency } from "@/Utils/currency";
import ProductImage from "./ProductImage";
import PricingDisplay from "./PricingDisplay";
import SizeSelector from "./SizeSelector";
import VariantSelector from "./VariantSelector";
import AddonsSelector from "./AddonsSelector";
import QuantitySelector from "./QuantitySelector";

export default function CoffeeProductCard({ item, addons, onAddToCart }) {
    const [selectedSize, setSelectedSize] = useState("daily");
    const [selectedVariant, setSelectedVariant] = useState("hot");
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [showCustomization, setShowCustomization] = useState(false);

    const calculatePrice = (size) => {
        const multiplier = size === "extra" ? 1.3 : 1.0;
        return Math.round(parseFloat(item.base_price) * multiplier);
    };

    const handleAddonToggle = (addon) => {
        setSelectedAddons((prev) => {
            const exists = prev.find((a) => a.id === addon.id);
            if (exists) {
                return prev.filter((a) => a.id !== addon.id);
            } else {
                return [...prev, addon];
            }
        });
    };

    const handleAddToCart = () => {
        onAddToCart(
            item,
            selectedSize,
            selectedVariant,
            selectedAddons,
            quantity
        );

        // Reset customization
        setSelectedSize("daily");
        setSelectedVariant("hot");
        setSelectedAddons([]);
        setQuantity(1);
        setShowCustomization(false);
    };

    const getTotalPrice = () => {
        const basePrice = calculatePrice(selectedSize);
        const addonPrice = selectedAddons.reduce(
            (sum, addon) => sum + parseFloat(addon.price || 0),
            0
        );
        return (basePrice + addonPrice) * quantity;
    };

    return (
        <div className="group cursor-pointer">
            {/* Premium Product Card */}
            <div className="bg-primary-white border border-light-gray hover:border-coffee-accent transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                {/* High-Quality Product Image */}
                <div className="aspect-square border-b border-light-gray overflow-hidden">
                    <div className="transform transition-transform duration-500 group-hover:scale-105">
                        <ProductImage item={item} className="w-full h-full" />
                    </div>
                </div>

                {/* Refined Product Details */}
                <div className="p-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-light text-dark-gray mb-3 tracking-wide">
                            {item.name}
                        </h3>
                        {item.description && (
                            <p className="text-medium-gray font-light leading-relaxed text-sm">
                                {item.description}
                            </p>
                        )}
                    </div>

                    {/* Elegant Pricing */}
                    <PricingDisplay
                        basePrice={item.base_price}
                        size="daily"
                        variant="dual"
                        className="mb-6"
                    />

                    {/* Sophisticated Action */}
                    <button
                        onClick={() => setShowCustomization(!showCustomization)}
                        className={`w-full py-3 px-6 font-light tracking-wide transition-all duration-300
                            transform hover:scale-[1.02] active:scale-[0.98]
                            focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:ring-offset-2
                            ${
                                showCustomization
                                    ? "bg-dark-gray text-primary-white shadow-md"
                                    : "border border-dark-gray text-dark-gray hover:bg-dark-gray hover:text-primary-white hover:shadow-md"
                            }`}
                    >
                        <span className="flex items-center justify-center space-x-2">
                            <span>
                                {showCustomization ? "Close" : "Customize"}
                            </span>
                            <svg
                                className={`w-4 h-4 transition-transform duration-300 ${
                                    showCustomization ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>

            {/* Premium Customization Panel */}
            {showCustomization && (
                <div className="mt-4 bg-warm-white border border-light-gray p-8 animate-slide-down">
                    {/* Elegant Size Selection */}
                    <SizeSelector
                        basePrice={item.base_price}
                        selectedSize={selectedSize}
                        onSizeChange={setSelectedSize}
                        className="mb-8"
                    />

                    {/* Refined Variant Selection */}
                    <VariantSelector
                        selectedVariant={selectedVariant}
                        onVariantChange={setSelectedVariant}
                        className="mb-8"
                    />

                    {/* Premium Add-ons */}
                    <AddonsSelector
                        addons={addons}
                        selectedAddons={selectedAddons}
                        onAddonToggle={handleAddonToggle}
                        className="mb-8"
                    />

                    {/* Elegant Quantity */}
                    <QuantitySelector
                        quantity={quantity}
                        onQuantityChange={setQuantity}
                        className="mb-8"
                    />

                    {/* Premium Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-dark-gray text-primary-white py-4 px-6 font-light tracking-wide
                            hover:bg-coffee-accent transition-all duration-300
                            flex items-center justify-between group
                            transform hover:scale-[1.02] active:scale-[0.98]
                            hover:shadow-lg
                            focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:ring-offset-2"
                    >
                        <span className="flex items-center space-x-2">
                            <svg
                                className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <span>Add to Selection</span>
                        </span>
                        <span className="font-normal flex items-center space-x-2">
                            <span>{formatCurrency(getTotalPrice())}</span>
                            <svg
                                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                            </svg>
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
