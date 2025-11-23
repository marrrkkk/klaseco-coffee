import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import MinimalistLayout from "@/Layouts/MinimalistLayout";
import CategoryHeader from "@/Components/Menu/CategoryHeader";
import MenuItemGrid from "@/Components/Menu/MenuItemGrid";
import MenuItemGridSkeleton from "@/Components/Menu/MenuItemGridSkeleton";
import LuxuryCartDrawer from "@/Components/Menu/LuxuryCartDrawer";
import PageTransition from "@/Components/PageTransition";
import ErrorState from "@/Components/Menu/ErrorState";
import ErrorBoundary from "@/Components/ErrorBoundary";
import axios from "axios";
import useCart from "@/Hooks/useCart";

export default function CategoryDetailPage({ categoryId }) {
    const [category, setCategory] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Use the cart hook for shared cart state
    const {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
    } = useCart();

    // Fetch category data on mount
    useEffect(() => {
        fetchCategoryData();
    }, [categoryId]);

    const fetchCategoryData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch menu items for this category
            const itemsResponse = await axios.get(
                `/api/menu/categories/${categoryId}/items`
            );

            // Fetch addons
            const addonsResponse = await axios.get("/api/menu/addons");

            setCategory(itemsResponse.data.category);
            setMenuItems(itemsResponse.data.items);
            setAddons(addonsResponse.data.data);
        } catch (err) {
            console.error("Error fetching category data:", err);

            // Handle invalid category ID - redirect to menu home
            if (err.response?.status === 404) {
                router.visit("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to load category items. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.visit("/");
    };

    const handleAddToCart = (item, size, variant, selectedAddons, quantity) => {
        addToCart(item, size, variant, selectedAddons, quantity);
    };

    if (error) {
        return (
            <MinimalistLayout title="Error - KlaséCo">
                <ErrorState message={error} onRetry={fetchCategoryData} />
            </MinimalistLayout>
        );
    }

    return (
        <ErrorBoundary onReset={() => window.location.reload()}>
            <MinimalistLayout
                title={`${category?.name || "Category"} - KlaséCo`}
            >
                <div className="min-h-screen bg-primary-white">
                    {/* Category Header with Back Button */}
                    <PageTransition delay={0}>
                        <CategoryHeader
                            categoryName={category?.name || "Category"}
                            onBack={handleBack}
                        />
                    </PageTransition>

                    {/* Menu Items Grid */}
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <PageTransition delay={100}>
                            {loading ? (
                                <MenuItemGridSkeleton count={6} />
                            ) : (
                                <MenuItemGrid
                                    items={menuItems}
                                    addons={addons}
                                    onAddToCart={handleAddToCart}
                                />
                            )}
                        </PageTransition>
                    </div>

                    {/* Floating Cart Button */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className={`fixed bottom-6 right-6 z-50 bg-coffee-accent text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
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
                        onUpdateQuantity={updateQuantity}
                        onClearCart={clearCart}
                        total={getCartTotal()}
                        isMobile={true}
                    />
                </div>
            </MinimalistLayout>
        </ErrorBoundary>
    );
}
