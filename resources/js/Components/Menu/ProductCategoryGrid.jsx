import CoffeeProductCard from "./CoffeeProductCard";

export default function ProductCategoryGrid({
    category,
    items,
    addons,
    onAddToCart,
}) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Sophisticated Category Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-light text-dark-gray mb-4 tracking-wide">
                        {category.name}
                    </h2>
                    <div className="w-16 h-px bg-coffee-accent mx-auto"></div>
                </div>

                {/* Premium Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                    {items
                        .filter((item) => item.is_available)
                        .map((item) => (
                            <CoffeeProductCard
                                key={item.id}
                                item={item}
                                addons={addons}
                                onAddToCart={onAddToCart}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}
