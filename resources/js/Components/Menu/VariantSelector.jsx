export default function VariantSelector({
    selectedVariant,
    onVariantChange,
    className = "",
}) {
    const variants = [
        {
            value: "hot",
            label: "Hot",
            icon: "🔥",
            description: "Warm & comforting",
        },
        {
            value: "cold",
            label: "Cold",
            icon: "🧊",
            description: "Refreshing & cool",
        },
    ];

    return (
        <div className={className}>
            <h4 className="text-sm font-light text-dark-gray mb-4 tracking-[0.15em] uppercase">
                Temperature
            </h4>
            <div className="grid grid-cols-2 gap-4">
                {variants.map((variant) => (
                    <button
                        key={variant.value}
                        onClick={() => onVariantChange(variant.value)}
                        className={`group relative p-6 border transition-all duration-300 ${
                            selectedVariant === variant.value
                                ? "border-coffee-accent bg-primary-white shadow-sm"
                                : "border-light-gray hover:border-medium-gray bg-warm-white"
                        }`}
                    >
                        {/* Selection indicator */}
                        {selectedVariant === variant.value && (
                            <div className="absolute top-3 right-3 w-2 h-2 bg-coffee-accent rounded-full"></div>
                        )}

                        <div className="text-center">
                            <div className="text-2xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                                {variant.icon}
                            </div>
                            <div className="text-base font-light text-dark-gray mb-1">
                                {variant.label}
                            </div>
                            <div className="text-xs text-medium-gray font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {variant.description}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
