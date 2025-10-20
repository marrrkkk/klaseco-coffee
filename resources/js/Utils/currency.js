/**
 * Currency formatting utilities for Philippine Peso
 */

/**
 * Format amount as Philippine Peso currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the ₱ symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
    const formatted = new Intl.NumberFormat("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    return showSymbol ? `₱${formatted}` : formatted;
};

/**
 * Format amount as compact Philippine Peso currency (e.g., ₱1.2K)
 * @param {number} amount - The amount to format
 * @returns {string} Compact formatted currency string
 */
export const formatCompactCurrency = (amount) => {
    const formatter = new Intl.NumberFormat("en-PH", {
        notation: "compact",
        compactDisplay: "short",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    });

    return `₱${formatter.format(amount)}`;
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed amount
 */
export const parseCurrency = (currencyString) => {
    return parseFloat(currencyString.replace(/[₱,\s]/g, "")) || 0;
};
