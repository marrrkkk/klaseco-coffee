import { useState } from "react";
import { formatCurrency } from "@/Utils/currency";
import ProductImage from "./ProductImage";
import PricingDisplay from "./PricingDisplay";
import SizeSelector from "./SizeSelector";
import VariantSelector from "./VariantSelector";
import AddonsSelector from "./AddonsSelector";
import QuantitySelector from "./QuantitySelector";

export default function MenuItemCard({ item, addons, onAddToCart }) {
    const [selectedSize, setSelectedSize] = useState("daily");
    const [selectedVariant, setSelectedVariant] = useState("hot");
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [showCustomization, setShowCustomization] = useState(false);

    const calculatePrice = (size) => {
        const multiplier = size === "extra" ? 1.3 : 1.0;
        return Math.round(item.base_price * multiplier);
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
            (sum, addon) => sum + addon.price,
            0
        );
        return (basePrice + addonPrice) * quantity;
    };

    return (
        <div className="group cursor-pointer">
            {/* Premium Product Card */}
            <div className="bg-primary-white border border-light-gray hover:border-coffee-accent transition-all duration-500 hover:shadow-lg">
                <div className="flex flex-col md:flex-row">
                    {/* High-Quality Product Image */}
                    <div className="md:w-48 md:h-48 h-64 flex-shrink-0">
                        <ProductImage item={item} className="w-full h-full" />
                    </div>

                    {/* Refined Product Details */}
                    <div className="flex-1 p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 pr-6">
                                <h3 className="text-2xl font-light text-dark-gray mb-3 tracking-wide">
                                    {item.name}
                                </h3>
                                {item.description && (
                                    <p className="text-medium-gray font-light leading-relaxed">
                                        {item.description}
                                    </p>
                                )}
                            </div>

                            {/* Elegant Pricing */}
                            <div className="flex-shrink-0">
                                <PricingDisplay
                                    basePrice={item.base_price}
                                    size="daily"
                                    variant="boutique"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-light-gray">
                            <div className="flex items-center space-x-4 text-sm font-light text-medium-gray">
                                <span>
                                    Extra:{" "}
                                    {formatCurrency(calculatePrice("extra"))}
                                </span>
                                <span className="w-1 h-1 bg-medium-gray rounded-full"></span>
                                <span>Hot & Cold Available</span>
                            </div>

                            {/* Sophisticated Action */}
                            <button
                                onClick={() =>
                                    setShowCustomization(!showCustomization)
                                }
                                className={`py-3 px-8 font-light tracking-wide transition-all duration-300 ${
                                    showCustomization
                                        ? "bg-dark-gray text-primary-white"
                                        : "border border-dark-gray text-dark-gray hover:bg-dark-gray hover:text-primary-white"
                                }`}
                            >
                                {showCustomization ? "Close" : "Customize"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Customization Panel */}
            {showCustomization && (
                <div className="mt-4 bg-warm-white border border-light-gray p-8">
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
                        className="w-full bg-dark-gray text-primary-white py-4 px-6 font-light tracking-wide hover:bg-coffee-accent transition-all duration-300 flex items-center justify-between group"
                    >
                        <span>Add to Selection</span>
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
