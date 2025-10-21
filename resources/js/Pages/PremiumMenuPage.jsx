import { useState, useEffect, useRef } from "react";
import MinimalistLayout from "@/Layouts/MinimalistLayout";
import ProductCategoryGrid from "@/Components/Menu/ProductCategoryGrid";
import LuxuryCartDrawer from "@/Components/Menu/LuxuryCartDrawer";
import ElegantLoader from "@/Components/ElegantLoader";
import { formatCurrency } from "@/Utils/currency";
import axios from "axios";

export default function PremiumMenuPage() {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState({});
    const [addons, setAddons] = useState([]);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);

    // Refs for scroll handling
    const categoryRefs = useRef({});

    useEffect(() => {
        fetchMenuData();
    }, []);

    const fetchMenuData = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/menu/complete");
            const { categories, menu_items, addons } = response.data;

            setCategories(categories);
            setAddons(addons);

            // Group menu items by category
            const itemsByCategory = {};
            menu_items.forEach((item) => {
                if (!itemsByCategory[item.category_id]) {
                    itemsByCategory[item.category_id] = [];
                }
                itemsByCategory[item.category_id].push(item);
            });
            setMenuItems(itemsByCategory);

            // Set initial active category
            if (categories.length > 0) {
                setActiveCategory(categories[0].id);
            }
        } catch (error) {
            console.error("Error fetching menu data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error loading cart:", e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item, size, variant, selectedAddons, quantity = 1) => {
        const unitPrice = calculateItemPrice(item.base_price, size);
        const addonTotal = selectedAddons.reduce(
            (sum, addon) => sum + parseFloat(addon.price || 0),
            0
        );
        const itemTotal = (unitPrice + addonTotal) * quantity;

        const cartItem = {
            id: Date.now(), // Temporary ID for cart management
            menu_item_id: item.id,
            name: item.name,
            size,
            variant,
            quantity,
            base_price: parseFloat(item.base_price),
            unit_price: unitPrice,
            subtotal: itemTotal,
            addons: selectedAddons.map((addon) => ({
                id: addon.id,
                name: addon.name,
                price: parseFloat(addon.price || 0),
                quantity: 1,
            })),
        };

        setCart((prevCart) => [...prevCart, cartItem]);
    };

    const calculateItemPrice = (basePrice, size) => {
        const multiplier = size === "extra" ? 1.3 : 1.0;
        return Math.round(parseFloat(basePrice) * multiplier);
    };

    const removeFromCart = (cartItemId) => {
        setCart((prevCart) =>
            prevCart.filter((item) => item.id !== cartItemId)
        );
    };

    const updateCartItemQuantity = (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(cartItemId);
            return;
        }

        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.id === cartItemId) {
                    const addonTotal = item.addons.reduce(
                        (sum, addon) => sum + addon.price * addon.quantity,
                        0
                    );
                    const subtotal =
                        (item.unit_price + addonTotal) * newQuantity;
                    return { ...item, quantity: newQuantity, subtotal };
                }
                return item;
            })
        );
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.subtotal, 0);
    };

    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const clearCart = () => {
        setCart([]);
    };

    const handleScroll = () => {
        // Find the current visible category based on scroll position
        for (const category of categories) {
            const element = categoryRefs.current[category.id];
            if (element) {
                const rect = element.getBoundingClientRect();

                // Check if element is in viewport (with some offset for better UX)
                if (rect.top <= 200 && rect.bottom > 200) {
                    setActiveCategory(category.id);
                    break;
                }
            }
        }
    };

    // Add scroll listener to window
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [categories]);

    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);
        const element = categoryRefs.current[categoryId];
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    if (loading) {
        return (
            <MinimalistLayout title="Menu - KlaséCo">
                <ElegantLoader />
            </MinimalistLayout>
        );
    }

    return (
        <MinimalistLayout title="Menu - KlaséCo">
            <div className="min-h-screen bg-primary-white">
                {/* Premium Hero Section */}
                <div className="bg-primary-white py-16 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-light text-dark-gray mb-4 tracking-wide">
                            Curated Coffee Collection
                        </h1>
                        <p className="text-lg text-medium-gray font-light max-w-2xl mx-auto leading-relaxed">
                            Discover our carefully selected premium coffee
                            offerings, crafted with precision and served with
                            elegance.
                        </p>
                    </div>
                </div>

                <div className="flex relative">
                    {/* Elegant Categories Navigation */}
                    <div
                        className="hidden lg:block w-80 bg-primary-white border-r border-light-gray sticky top-60 self-start overflow-y-auto"
                        style={{ maxHeight: "calc(100vh - 4rem)" }}
                    >
                        <div className="p-8">
                            <h2 className="text-xl font-light text-dark-gray mb-8 tracking-wide">
                                Collections
                            </h2>
                            <div className="space-y-1">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            handleCategoryClick(category.id)
                                        }
                                        className={`w-full text-left px-6 py-4 rounded-none transition-all duration-300 font-light tracking-wide ${
                                            activeCategory === category.id
                                                ? "text-coffee-accent border-l-2 border-coffee-accent bg-warm-white"
                                                : "text-medium-gray hover:text-dark-gray hover:bg-warm-white"
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Premium Menu Content */}
                    <div className="flex-1">
                        {/* Mobile Categories - Fixed at Bottom */}
                        <div className="lg:hidden bg-primary-white border-t border-light-gray fixed bottom-0 left-0 right-0 z-30 shadow-lg">
                            <div className="overflow-x-auto">
                                <div className="flex px-6 py-4 space-x-8">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() =>
                                                handleCategoryClick(category.id)
                                            }
                                            className={`whitespace-nowrap font-light tracking-wide transition-all duration-300 ${
                                                activeCategory === category.id
                                                    ? "text-coffee-accent border-b-2 border-coffee-accent pb-2"
                                                    : "text-medium-gray hover:text-dark-gray"
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Premium Product Sections */}
                        <div className="pb-32 lg:pb-32">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    ref={(el) =>
                                        (categoryRefs.current[category.id] = el)
                                    }
                                >
                                    <ProductCategoryGrid
                                        category={category}
                                        items={menuItems[category.id] || []}
                                        addons={addons}
                                        onAddToCart={addToCart}
                                    />
                                </div>
                            ))}

                            {/* Elegant Empty State */}
                            {categories.length === 0 && (
                                <div className="text-center py-24">
                                    <div className="w-16 h-16 mx-auto mb-8 bg-light-gray rounded-full flex items-center justify-center">
                                        <span className="text-2xl text-medium-gray">
                                            ☕
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-light text-dark-gray mb-4 tracking-wide">
                                        Collection Coming Soon
                                    </h3>
                                    <p className="text-medium-gray font-light max-w-md mx-auto">
                                        We're curating something extraordinary
                                        for your coffee experience.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Floating Cart Button - Always Visible */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className={`fixed bottom-24 lg:bottom-6 right-6 z-50 bg-coffee-accent text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                            cart.length > 0
                                ? "w-16 h-16"
                                : "w-14 h-14 opacity-50"
                        }`}
                    >
                        <div className="relative flex items-center justify-center">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-white text-coffee-accent text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {getCartItemCount()}
                                </span>
                            )}
                        </div>
                    </button>

                    {/* Cart Drawer */}
                    <LuxuryCartDrawer
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                        cart={cart}
                        onRemoveItem={removeFromCart}
                        onUpdateQuantity={updateCartItemQuantity}
                        onClearCart={clearCart}
                        total={getCartTotal()}
                        isMobile={true}
                    />
                </div>
            </div>
        </MinimalistLayout>
    );
}
