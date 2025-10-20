export default function QuantitySelector({
    quantity,
    onQuantityChange,
    className = "",
}) {
    const handleDecrease = () => {
        if (quantity > 1) {
            onQuantityChange(quantity - 1);
        }
    };

    const handleIncrease = () => {
        onQuantityChange(quantity + 1);
    };

    return (
        <div className={className}>
            <h4 className="text-sm font-light text-dark-gray mb-4 tracking-[0.15em] uppercase">
                Quantity
            </h4>
            <div className="flex items-center space-x-6">
                <button
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className={`w-12 h-12 border transition-all duration-300 flex items-center justify-center ${
                        quantity <= 1
                            ? "border-light-gray text-light-gray cursor-not-allowed"
                            : "border-medium-gray text-medium-gray hover:border-dark-gray hover:text-dark-gray hover:bg-warm-white"
                    }`}
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M20 12H4"></path>
                    </svg>
                </button>

                <div className="flex-1 text-center">
                    <div className="text-3xl font-light text-dark-gray tracking-tight">
                        {quantity}
                    </div>
                </div>

                <button
                    onClick={handleIncrease}
                    className="w-12 h-12 border border-medium-gray text-medium-gray hover:border-dark-gray hover:text-dark-gray hover:bg-warm-white transition-all duration-300 flex items-center justify-center"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M12 4v16m8-8H4"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
}
