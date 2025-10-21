import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import MinimalistLayout from "@/Layouts/MinimalistLayout";
import { formatCurrency } from "@/Utils/currency";
import {
    ArrowLeftIcon,
    PlusIcon,
    MinusIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

export default function ProductDetailPage() {
    const [product, setProduct] = useState(null);
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [size, setSize] = useState("daily");
    const [variant, setVariant] = useState("hot");
    const [quantity, setQuantity] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState([]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get("id");
        if (productId) {
            fetchProductData(productId);
        }
    }, []);

    const fetchProductData = async (productId) => {
        try {
            setLoading(true);
            const response = await axios.get("/api/menu/complete");
            const { menu_items, addons } = response.data;

            const foundProduct = menu_items.find(
                (item) => item.id === parseInt(productId)
            );
            setProduct(foundProduct);
            setAddons(addons);
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = () => {
        if (!product) return 0;
        const multiplier = size === "extra" ? 1.3 : 1.0;
        const basePrice = product.base_price * multiplier;
        const addonsTotal = selectedAddons.reduce(
            (sum, addon) => sum + parseFloat(addon.price),
            0
        );
        return (basePrice + addonsTotal) * quantity;
    };

    const toggleAddon = (addon) => {
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
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const multiplier = size === "extra" ? 1.3 : 1.0;
        const basePrice = product.base_price * multiplier;
        const addonsTotal = selectedAddons.reduce(
            (sum, addon) => sum + parseFloat(addon.price),
            0
        );
        const unitPrice = basePrice + addonsTotal;

        const cartItem = {
            id: Date.now(),
            menu_item_id: product.id,
            name: product.name,
            size,
            variant,
            quantity,
            base_price: product.base_price,
            unit_price: unitPrice,
            subtotal: unitPrice * quantity,
            addons: selectedAddons.map((addon) => ({
                id: addon.id,
                name: addon.name,
                price: parseFloat(addon.price),
                quantity: 1,
            })),
        };

        cart.push(cartItem);
        localStorage.setItem("cart", JSON.stringify(cart));
        router.visit("/");
    };

    if (loading) {
        return (
            <MinimalistLayout title="Loading...">
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-2 border-coffee-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-medium-gray">Loading product...</p>
                    </div>
                </div>
            </MinimalistLayout>
        );
    }

    if (!product) {
        return (
            <MinimalistLayout title="Product Not Found">
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-light text-dark-gray mb-4">
                            Product Not Found
                        </h2>
                        <button
                            onClick={() => router.visit("/")}
                            className="text-coffee-accent hover:underline"
                        >
                            Back to Menu
                        </button>
                    </div>
                </div>
            </MinimalistLayout>
        );
    }

    return (
        <MinimalistLayout title={product.name}>
            <div className="min-h-screen bg-primary-white">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-primary-white border-b border-light-gray">
                    <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
                        <button
                            onClick={() => router.visit("/")}
                            className="p-2 -ml-2 hover:bg-light-gray rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-dark-gray" />
                        </button>
                        <h1 className="ml-4 text-lg font-light text-dark-gray">
                            Customize Your Order
                        </h1>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
                    {/* Product Info */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-light text-dark-gray mb-2">
                            {product.name}
                        </h2>
                        <p className="text-medium-gray font-light mb-4">
                            {product.description}
                        </p>
                        <div className="text-2xl font-light text-coffee-accent">
                            {formatCurrency(product.base_price)}
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-dark-gray mb-4 uppercase tracking-wide">
                            Size
                        </h3>
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
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-dark-gray mb-4 uppercase tracking-wide">
                            Temperature
                        </h3>
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
                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-dark-gray mb-4 uppercase tracking-wide">
                                Add-ons
                            </h3>
                            <div className="space-y-3">
                                {addons.map((addon) => (
                                    <button
                                        key={addon.id}
                                        onClick={() => toggleAddon(addon)}
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
                                                            strokeWidth={2}
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
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-dark-gray mb-4 uppercase tracking-wide">
                            Quantity
                        </h3>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() =>
                                    setQuantity(Math.max(1, quantity - 1))
                                }
                                className="w-12 h-12 border-2 border-light-gray rounded-lg hover:border-coffee-accent transition-colors flex items-center justify-center"
                            >
                                <MinusIcon className="w-5 h-5 text-dark-gray" />
                            </button>
                            <div className="text-2xl font-light text-dark-gray min-w-[3rem] text-center">
                                {quantity}
                            </div>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-12 h-12 border-2 border-light-gray rounded-lg hover:border-coffee-accent transition-colors flex items-center justify-center"
                            >
                                <PlusIcon className="w-5 h-5 text-dark-gray" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fixed Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-primary-white border-t border-light-gray p-4 safe-area-bottom">
                    <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
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
                            className="flex-1 bg-coffee-accent text-white py-4 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-all"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </MinimalistLayout>
    );
}
