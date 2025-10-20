import { formatCurrency } from "@/Utils/currency";

export default function PricingDisplay({
    basePrice,
    size = "daily",
    variant = "default",
    className = "",
}) {
    const calculatePrice = (priceSize) => {
        const multiplier = priceSize === "extra" ? 1.3 : 1.0;
        return Math.round(basePrice * multiplier);
    };

    if (variant === "compact") {
        // Compact display for cards
        return (
            <div className={`flex items-baseline space-x-2 ${className}`}>
                <span className="text-2xl font-light text-dark-gray tracking-tight">
                    {formatCurrency(calculatePrice(size))}
                </span>
            </div>
        );
    }

    if (variant === "dual") {
        // Dual pricing display showing both sizes
        return (
            <div className={`flex items-center justify-between ${className}`}>
                <div className="space-y-1">
                    <div className="text-xs text-medium-gray font-light tracking-wider uppercase">
                        Daily Size
                    </div>
                    <div className="text-2xl font-light text-dark-gray tracking-tight">
                        {formatCurrency(calculatePrice("daily"))}
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <div className="text-xs text-medium-gray font-light tracking-wider uppercase">
                        Extra Size
                    </div>
                    <div className="text-lg font-light text-medium-gray tracking-tight">
                        {formatCurrency(calculatePrice("extra"))}
                    </div>
                </div>
            </div>
        );
    }

    if (variant === "boutique") {
        // Boutique-style pricing with elegant formatting
        return (
            <div className={`text-center ${className}`}>
                <div className="text-xs text-medium-gray font-light tracking-[0.2em] uppercase mb-2">
                    From
                </div>
                <div className="text-3xl font-light text-dark-gray tracking-tight">
                    {formatCurrency(calculatePrice("daily"))}
                </div>
                <div className="text-xs text-medium-gray font-light tracking-wider mt-1">
                    Daily Size
                </div>
            </div>
        );
    }

    // Default elegant display
    return (
        <div className={`${className}`}>
            <div className="text-xs text-medium-gray font-light tracking-[0.15em] uppercase mb-1">
                {size === "extra" ? "Extra Size" : "Daily Size"}
            </div>
            <div className="text-2xl font-light text-dark-gray tracking-tight">
                {formatCurrency(calculatePrice(size))}
            </div>
        </div>
    );
}
