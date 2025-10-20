import { useState, useEffect, useRef } from "react";
import CustomerLayout from "@/Layouts/CustomerLayout";
import CategorySection from "@/Components/Menu/CategorySection";
import CartSidebar from "@/Components/Menu/CartSidebar";
import { formatCurrency } from "@/Utils/currency";
import axios from "axios";

export default function MenuPage() {
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

    const addToCart = (item, size, variant, selectedAddons, quantity = 1) => {
        const cartItem = {
            id: Date.now(), // Temporary ID for cart management
            menu_item_id: item.id,
            name: item.name,
            size,
            variant,
            quantity,
            base_price: item.base_price,
            unit_price: calculateItemPrice(item.base_price, size),
            subtotal: calculateItemPrice(item.base_price, size) * quantity,
            addons: selectedAddons.map((addon) => ({
                id: addon.id,
                name: addon.name,
                price: addon.price,
                quantity: 1,
            })),
        };

        // Add addon costs to subtotal
        const addonTotal = cartItem.addons.reduce(
            (sum, addon) => sum + addon.price * addon.quantity,
            0
        );
        cartItem.subtotal += addonTotal * quantity;

        setCart((prevCart) => [...prevCart, cartItem]);
    };

    const calculateItemPrice = (basePrice, size) => {
        const multiplier = size === "extra" ? 1.3 : 1.0;
        return Math.round(basePrice * multiplier);
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

    const handleScroll = (e) => {
        const container = e.target;
        const { scrollTop } = container;

        // Find the current visible category
        for (const category of categories) {
            const element = categoryRefs.current[category.id];
            if (element) {
                const { offsetTop, offsetHeight } = element;
                if (
                    scrollTop >= offsetTop - 100 &&
                    scrollTop < offsetTop + offsetHeight - 100
                ) {
                    setActiveCategory(category.id);
                    break;
                }
            }
        }
    };

    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);
        const element = categoryRefs.current[categoryId];
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    if (loading) {
        return (
            <CustomerLayout title="Menu - KlaséCo">
                <div className="flex flex-col items-center justify-center h-64 p-8">
                    <div className="loading-spinner h-12 w-12 mb-4"></div>
                    <p className="text-coffee-600 font-medium">
                        Loading our delicious menu...
                    </p>
                    <p className="text-coffee-400 text-sm mt-1">
                        Please wait a moment
                    </p>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout title="Menu - KlaséCo">
            <div className="flex min-h-screen bg-gray-50">
                {/* Categories Sidebar */}
                <div className="hidden md:block w-64 bg-white shadow-lg p-4 sticky top-0 h-screen overflow-y-auto">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-coffee-800 mb-4">
                            Categories
                        </h2>
                    </div>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    activeCategory === category.id
                                        ? "bg-coffee-100 text-coffee-800 font-medium"
                                        : "hover:bg-gray-100"
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Content */}
                <div
                    className="flex-1 max-h-screen overflow-y-auto"
                    onScroll={handleScroll}
                >
                    {/* Mobile Categories */}
                    <div className="md:hidden overflow-x-auto sticky top-0 bg-white shadow-sm z-30">
                        <div className="flex p-4 space-x-4">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() =>
                                        handleCategoryClick(category.id)
                                    }
                                    className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                                        activeCategory === category.id
                                            ? "bg-coffee-800 text-white font-medium"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Menu Sections */}
                    <div className="pb-32">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                ref={(el) =>
                                    (categoryRefs.current[category.id] = el)
                                }
                            >
                                <CategorySection
                                    category={category}
                                    items={menuItems[category.id] || []}
                                    addons={addons}
                                    onAddToCart={addToCart}
                                />
                            </div>
                        ))}

                        {/* Empty state */}
                        {categories.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">☕</div>
                                <h3 className="text-lg font-semibold text-coffee-800 mb-2">
                                    Menu Coming Soon
                                </h3>
                                <p className="text-coffee-600">
                                    We're preparing something special for you!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                    <>
                        {/* Mobile Cart Button */}
                        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="w-full bg-coffee-700 text-white py-3 px-6 rounded-lg flex items-center justify-between"
                            >
                                <span className="flex items-center">
                                    <span className="bg-coffee-600 px-2 py-1 rounded-full mr-2">
                                        {getCartItemCount()}
                                    </span>
                                    View Cart
                                </span>
                                <span>{formatCurrency(getCartTotal())}</span>
                            </button>
                        </div>

                        {/* Desktop Cart Sidebar */}
                        <div className="hidden md:block w-96">
                            <div className="fixed w-96 right-0 top-0 h-screen bg-white shadow-lg">
                                <CartSidebar
                                    isOpen={true}
                                    onClose={() => {}}
                                    cart={cart}
                                    onRemoveItem={removeFromCart}
                                    onUpdateQuantity={updateCartItemQuantity}
                                    total={getCartTotal()}
                                />
                            </div>
                        </div>

                        {/* Mobile Cart Sidebar */}
                        <CartSidebar
                            isOpen={isCartOpen}
                            onClose={() => setIsCartOpen(false)}
                            cart={cart}
                            onRemoveItem={removeFromCart}
                            onUpdateQuantity={updateCartItemQuantity}
                            total={getCartTotal()}
                            isMobile={true}
                        />
                    </>
                )}
            </div>
        </CustomerLayout>
    );
}
