import { formatCurrency } from "@/Utils/currency";

export default function SizeSelector({
    basePrice,
    selectedSize,
    onSizeChange,
    className = "",
}) {
    const calculatePrice = (size) => {
        const multiplier = size === "extra" ? 1.3 : 1.0;
        return Math.round(basePrice * multiplier);
    };

    const sizes = [
        {
            value: "daily",
            label: "Daily",
            description: "Perfect for everyday",
            price: calculatePrice("daily"),
        },
        {
            value: "extra",
            label: "Extra",
            description: "More to savor",
            price: calculatePrice("extra"),
        },
    ];

    return (
        <div className={className}>
            <h4 className="text-sm font-light text-dark-gray mb-4 tracking-[0.15em] uppercase">
                Size Selection
            </h4>
            <div className="grid grid-cols-2 gap-4">
                {sizes.map((size) => (
                    <button
                        key={size.value}
                        onClick={() => onSizeChange(size.value)}
                        className={`group relative p-6 border transition-all duration-300 
                            transform hover:scale-105 active:scale-95
                            focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:ring-offset-2
                            ${
                                selectedSize === size.value
                                    ? "border-coffee-accent bg-primary-white shadow-md scale-105"
                                    : "border-light-gray hover:border-medium-gray bg-warm-white hover:shadow-sm"
                            }`}
                    >
                        {/* Selection indicator with animation */}
                        {selectedSize === size.value && (
                            <div className="absolute top-3 right-3 w-2 h-2 bg-coffee-accent rounded-full animate-pulse"></div>
                        )}

                        <div className="text-center">
                            <div className="text-xs text-medium-gray font-light tracking-[0.15em] uppercase mb-2 transition-colors duration-300 group-hover:text-coffee-accent">
                                {size.label}
                            </div>
                            <div className="text-xl font-light text-dark-gray tracking-tight mb-1 transition-transform duration-300 group-hover:scale-110">
                                {formatCurrency(size.price)}
                            </div>
                            <div className="text-xs text-medium-gray font-light opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                                {size.description}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
