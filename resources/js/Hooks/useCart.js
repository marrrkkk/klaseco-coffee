import { useState, useEffect } from "react";

/**
 * Custom hook for managing cart state with localStorage persistence
 * Provides cart operations and calculations for the menu system
 */
export default function useCart() {
    const [cart, setCart] = useState([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCart(parsedCart);
            } catch (e) {
                console.error("Error loading cart from localStorage:", e);
                // Clear invalid cart data
                localStorage.removeItem("cart");
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    /**
     * Add an item to the cart
     * @param {Object} item - Menu item to add
     * @param {string} size - Size selection (daily/extra)
     * @param {string} variant - Variant selection (hot/cold)
     * @param {Array} selectedAddons - Array of selected addon objects
     * @param {number} quantity - Quantity to add
     */
    const addToCart = (item, size, variant, selectedAddons, quantity) => {
        // Calculate pricing
        const multiplier = size === "extra" ? 1.3 : 1.0;
        const basePrice = item.base_price * multiplier;
        const addonsTotal = selectedAddons.reduce(
            (sum, addon) => sum + parseFloat(addon.price || 0),
            0
        );
        const unitPrice = basePrice + addonsTotal;
        const subtotal = unitPrice * quantity;

        // Create cart item with unique ID
        const cartItem = {
            id: `${item.id}-${size}-${variant}-${Date.now()}`,
            menu_item_id: item.id,
            name: item.name,
            size,
            variant,
            quantity,
            unit_price: basePrice,
            addons: selectedAddons.map((addon) => ({
                id: addon.id,
                name: addon.name,
                price: addon.price,
                quantity: 1,
            })),
            subtotal,
        };

        setCart((prevCart) => [...prevCart, cartItem]);
    };

    /**
     * Remove an item from the cart
     * @param {string} cartItemId - Unique ID of the cart item to remove
     */
    const removeFromCart = (cartItemId) => {
        setCart((prevCart) =>
            prevCart.filter((item) => item.id !== cartItemId)
        );
    };

    /**
     * Update the quantity of a cart item
     * @param {string} cartItemId - Unique ID of the cart item
     * @param {number} newQuantity - New quantity (removes item if <= 0)
     */
    const updateQuantity = (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(cartItemId);
            return;
        }

        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.id === cartItemId) {
                    // Recalculate subtotal with new quantity
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

    /**
     * Clear all items from the cart
     */
    const clearCart = () => {
        setCart([]);
    };

    /**
     * Calculate the total price of all items in the cart
     * @returns {number} Total cart value
     */
    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.subtotal, 0);
    };

    /**
     * Calculate the total number of items in the cart
     * @returns {number} Total item count
     */
    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
    };
}
