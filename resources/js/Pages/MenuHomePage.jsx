import { useState, useEffect } from "react";
import MinimalistLayout from "@/Layouts/MinimalistLayout";
import PromotionalCarousel from "@/Components/Menu/PromotionalCarousel";
import CategoryGrid from "@/Components/Menu/CategoryGrid";
import CategoryGridSkeleton from "@/Components/Menu/CategoryGridSkeleton";
import LuxuryCartDrawer from "@/Components/Menu/LuxuryCartDrawer";
import PageTransition from "@/Components/PageTransition";
import ErrorState from "@/Components/Menu/ErrorState";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { router } from "@inertiajs/react";
import axios from "axios";
import useCart from "@/Hooks/useCart";

export default function MenuHomePage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Use the cart hook for shared cart state
    const {
        cart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
    } = useCart();

    // Fetch menu data on mount
    useEffect(() => {
        fetchMenuData();
    }, []);

    const fetchMenuData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get("/api/menu/complete");
            const { categories } = response.data;
            setCategories(categories);
        } catch (err) {
            console.error("Error fetching menu data:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to load menu. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (categoryId) => {
        // Navigate to category detail page
        router.visit(`/menu/category/${categoryId}`);
    };

    if (error) {
        return (
            <MinimalistLayout title="Menu - KlaséCo">
                <ErrorState message={error} onRetry={fetchMenuData} />
            </MinimalistLayout>
        );
    }

    return (
        <ErrorBoundary onReset={() => window.location.reload()}>
            <MinimalistLayout title="Menu - KlaséCo">
                <div className="min-h-screen bg-primary-white">
                    {/* Promotional Carousel */}
                    <PageTransition delay={0}>
                        <PromotionalCarousel />
                    </PageTransition>

                    {/* Category Grid Section */}
                    <div className="max-w-7xl mx-auto py-8 sm:py-12">
                        <PageTransition delay={100}>
                            <div className="px-4 sm:px-6 mb-8">
                                <h2 className="text-2xl sm:text-3xl font-semibold text-dark-gray mb-2">
                                    Browse Menu
                                </h2>
                                <p className="text-sm sm:text-base text-medium-gray">
                                    Choose from our premium selection
                                </p>
                            </div>
                        </PageTransition>

                        <PageTransition delay={200}>
                            {loading ? (
                                <CategoryGridSkeleton count={6} />
                            ) : categories.length > 0 ? (
                                <CategoryGrid
                                    categories={categories}
                                    onCategoryClick={handleCategoryClick}
                                />
                            ) : (
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
