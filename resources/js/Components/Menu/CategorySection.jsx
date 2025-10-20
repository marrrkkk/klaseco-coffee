import MenuItemCard from "./MenuItemCard";

export default function CategorySection({
    category,
    items,
    addons,
    onAddToCart,
}) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="mb-16 px-4 md:px-8">
            {/* Premium Category Header */}
            <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-light text-dark-gray mb-3 tracking-wide">
                    {category.name}
                </h2>
                <div className="h-px w-24 bg-coffee-accent mx-auto md:mx-0"></div>
            </div>

            {/* Premium Menu Items */}
            <div className="space-y-6">
                {items
                    .filter((item) => item.is_available)
                    .map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            addons={addons}
                            onAddToCart={onAddToCart}
                        />
                    ))}
            </div>
        </div>
    );
}
