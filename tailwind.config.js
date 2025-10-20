import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Inter",
                    "Helvetica Neue",
                    "Arial",
                    ...defaultTheme.fontFamily.sans,
                ],
                premium: [
                    "Inter",
                    "Helvetica Neue",
                    "system-ui",
                    "-apple-system",
                    "sans-serif",
                ],
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "slide-down": {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(-10px)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)",
                    },
                },
                "slide-up": {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(10px)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)",
                    },
                },
                wiggle: {
                    "0%, 100%": { transform: "rotate(-3deg)" },
                    "50%": { transform: "rotate(3deg)" },
                },
                "pulse-subtle": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.8" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.3s ease-out",
                "slide-down": "slide-down 0.3s ease-out",
                "slide-up": "slide-up 0.3s ease-out",
                wiggle: "wiggle 0.5s ease-in-out",
                "pulse-subtle":
                    "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            colors: {
                // Premium minimalist color palette
                "primary-white": "#ffffff",
                "warm-white": "#fefefe",
                "light-gray": "#f8f9fa",
                "medium-gray": "#6c757d",
                "dark-gray": "#343a40",
                "coffee-accent": "#8b4513",
                "gold-accent": "#d4af37",
                "success-green": "#28a745",

                // Legacy coffee colors for compatibility
                coffee: {
                    50: "#fdf8f6",
                    100: "#f2e8e5",
                    200: "#eaddd7",
                    300: "#e0cec7",
                    400: "#d2b48c",
                    500: "#a0522d",
                    600: "#8b4513",
                    700: "#654321",
                    800: "#4a2c17",
                    900: "#2d1810",
                },
                cream: "#f5f5dc",
                gold: "#daa520",
            },
        },
    },

    plugins: [forms],
};
