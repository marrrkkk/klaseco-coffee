import { useState, memo, useCallback } from "react";
import MenuItemCard from "./MenuItemCard";
import Modal from "@/Components/Modal";
import SizeSelector from "./SizeSelector";
import VariantSelector from "./VariantSelector";
import AddonsSelector from "./AddonsSelector";
import QuantitySelector from "./QuantitySelector";
import { formatCurrency } from "@/Utils/currency";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

const MenuItemGrid = memo(function MenuItemGrid({
    items,
    addons = [],
    onAddToCart,
}) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [size, setSize] = useState("daily");
    const [variant, setVariant] = useState("hot");
    const [quantity, setQuantity] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState([]);

    const handleItemClick = useCallback((item) => {
        setSelectedItem(item);
        setSize("daily");
        setVariant("hot");
        setQuantity(1);
        setSelectedAddons([]);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedItem(null);
    }, []);

    const calculatePrice = useCallback(() => {
        if (!selectedItem) return 0;
        const multiplier = size === "extra" ? 1.3 : 1.0;
        const basePrice = selectedItem.base_price * multiplier;
        const addonsTotal = selectedAddons.reduce(
            (sum, addon) => sum + parseFloat(addon.price || 0),
            0
        );
        return (basePrice + addonsTotal) * quantity;
    }, [selectedItem, size, selectedAddons, quantity]);

    const toggleAddon = useCallback((addon) => {
        setSelectedAddons((prev) => {
            const exists = prev.find((a) => a.id === addon.id);
            if (exists) {
                return prev.filter((a) => a.id !== addon.id);
            } else {
                return [...prev, addon];
            }
        });
    }, []);

    const handleAddToCart = useCallback(() => {
        if (onAddToCart && selectedItem) {
            onAddToCart(selectedItem, size, variant, selectedAddons, quantity);
            handleCloseModal();
        }
    }, [
        onAddToCart,
        selectedItem,
        size,
        variant,
        selectedAddons,
        quantity,
        handleCloseModal,
    ]);

    // Handle empty state
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-24">
                <div className="w-16 h-16 mx-auto mb-8 bg-light-gray rounded-full flex items-center justify-center">
                    <span className="text-2xl text-medium-gray">☕</span>
                </div>
                <h3 className="text-2xl font-light text-dark-gray mb-4 tracking-wide">
                    No Items Available
                </h3>
                <p className="text-medium-gray font-light max-w-md mx-auto">
                    There are no items in this category at the moment.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Responsive Grid: 1 column (mobile), 2 columns (tablet), 3-4 columns (desktop) with staggered animations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="animate-scaleIn"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <MenuItemCard
                            item={item}
                            onAddToCart={handleItemClick}
                        />
                    </div>
                ))}
            </div>

            {/* Item Customization Modal */}
            <Modal
                show={selectedItem !== null}
                onClose={handleCloseModal}
                maxWidth="2xl"
            >
                {selectedItem && (
                    <div className="bg-primary-white">
                        {/* Modal Header */}
                        <div className="border-b border-light-gray px-6 py-4">
                            <h2 className="text-2xl font-light text-dark-gray">
                                Customize Your Order
                            </h2>
                        </div>

                        {/* Modal Content */}
                        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                            {/* Product Info */}
                            <div className="mb-6">
                                <h3 className="text-xl font-light text-dark-gray mb-2">
                                    {selectedItem.name}
                                </h3>
                                {selectedItem.description && (
                                    <p className="text-medium-gray font-light mb-4">
                                        {selectedItem.description}
                                    </p>
                                )}
                                <div className="text-xl font-light text-coffee-accent">
                                    {formatCurrency(selectedItem.base_price)}
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-dark-gray mb-3 uppercase tracking-wide">
                                    Size
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setSize("daily")}
                                        className={`p-4 border-2 rounded-lg transition-all ${
                                            size === "daily"
                                                ? "border-coffee-accent bg-coffee-accent bg-opacity-5"
                                                : "border-light-gray hover:border-medium-gray"
                                        }`}
                                    >
                                        <div className="font-medium text-dark-gray">
                                            Daily
                                        </div>
                                        <div className="text-sm text-medium-gray">
                                            Regular size
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setSize("extra")}
                                        className={`p-4 border-2 rounded-lg transition-all ${
                                            size === "extra"
                                                ? "border-coffee-accent bg-coffee-accent bg-opacity-5"
                                                : "border-light-gray hover:border-medium-gray"
                                        }`}
                                    >
                                        <div className="font-medium text-dark-gray">
                                            Extra
                                        </div>
                                        <div className="text-sm text-medium-gray">
                                            +30%
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Variant Selection */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-dark-gray mb-3 uppercase tracking-wide">
                                    Temperature
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setVariant("hot")}
                                        className={`p-4 border-2 rounded-lg transition-all ${
                                            variant === "hot"
                                                ? "border-coffee-accent bg-coffee-accent bg-opacity-5"
                                                : "border-light-gray hover:border-medium-gray"
                                        }`}
                                    >
                                        <div className="font-medium text-dark-gray">
                                            Hot
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setVariant("cold")}
                                        className={`p-4 border-2 rounded-lg transition-all ${
                                            variant === "cold"
                                                ? "border-coffee-accent bg-coffee-accent bg-opacity-5"
                                                : "border-light-gray hover:border-medium-gray"
                                        }`}
                                    >
                                        <div className="font-medium text-dark-gray">
                                            Cold
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Add-ons */}
                            {addons.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-dark-gray mb-3 uppercase tracking-wide">
                                        Add-ons
                                    </h4>
                                    <div className="space-y-3">
                                        {addons.map((addon) => (
                                            <button
                                                key={addon.id}
                                                onClick={() =>
                                                    toggleAddon(addon)
                                                }
                                                className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                                                    selectedAddons.find(
                                                        (a) => a.id === addon.id
                                                    )
                                                        ? "border-coffee-accent bg-coffee-accent bg-opacity-5"
                                                        : "border-light-gray hover:border-medium-gray"
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="font-medium text-dark-gray">
                                                            {addon.name}
                                                        </div>
                                                        <div className="text-sm text-medium-gray">
                                                            {formatCurrency(
                                                                addon.price
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectedAddons.find(
                                                        (a) => a.id === addon.id
                                                    ) && (
                                                        <div className="w-6 h-6 bg-coffee-accent rounded-full flex items-center justify-center">
                                                            <svg
                                                                className="w-4 h-4 text-white"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-dark-gray mb-3 uppercase tracking-wide">
                                    Quantity
                                </h4>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1)
                                            )
                                        }
                                        className="w-12 h-12 border-2 border-light-gray rounded-lg hover:border-coffee-accent transition-colors flex items-center justify-center"
                                    >
                                        <MinusIcon className="w-5 h-5 text-dark-gray" />
                                    </button>
                                    <div className="text-2xl font-light text-dark-gray min-w-[3rem] text-center">
                                        {quantity}
                                    </div>
                                    <button
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="w-12 h-12 border-2 border-light-gray rounded-lg hover:border-coffee-accent transition-colors flex items-center justify-center"
                                    >
                                        <PlusIcon className="w-5 h-5 text-dark-gray" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-light-gray px-6 py-4 flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="text-sm text-medium-gray">
                                    Total
                                </div>
                                <div className="text-2xl font-light text-dark-gray">
                                    {formatCurrency(calculatePrice())}
                                </div>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-coffee-accent text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-all"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
});

export default MenuItemGrid;
