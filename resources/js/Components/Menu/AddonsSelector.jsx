import { formatCurrency } from "@/Utils/currency";

export default function AddonsSelector({
    addons,
    selectedAddons,
    onAddonToggle,
    className = "",
}) {
    if (!addons || addons.length === 0) {
        return null;
    }

    const availableAddons = addons.filter((addon) => addon.is_available);

    if (availableAddons.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            <h4 className="text-sm font-light text-dark-gray mb-4 tracking-[0.15em] uppercase">
                Premium Upgrades
            </h4>
            <div className="space-y-3">
                {availableAddons.map((addon) => {
                    const isSelected = selectedAddons.some(
                        (a) => a.id === addon.id
                    );

                    return (
                        <label
                            key={addon.id}
                            className={`group flex items-center justify-between p-5 border cursor-pointer transition-all duration-300 ${
                                isSelected
                                    ? "border-coffee-accent bg-primary-white shadow-sm"
                                    : "border-light-gray hover:border-medium-gray bg-warm-white"
                            }`}
                        >
                            <div className="flex items-center space-x-4 flex-1">
                                {/* Custom checkbox */}
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => onAddonToggle(addon)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-5 h-5 border-2 rounded transition-all duration-300 flex items-center justify-center ${
                                            isSelected
                                                ? "border-coffee-accent bg-coffee-accent"
                                                : "border-medium-gray group-hover:border-dark-gray"
                                        }`}
                                    >
                                        {isSelected && (
                                            <svg
                                                className="w-3 h-3 text-primary-white"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="font-light text-dark-gray">
                                        {addon.name}
                                    </div>
                                    {addon.description && (
                                        <div className="text-xs text-medium-gray font-light mt-1">
                                            {addon.description}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="ml-4 text-right">
                                <div className="text-sm font-light text-medium-gray tracking-tight">
                                    +{formatCurrency(addon.price)}
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>

            {/* Selected addons summary */}
            {selectedAddons.length > 0 && (
                <div className="mt-4 p-4 bg-warm-white border border-light-gray">
                    <div className="text-xs text-medium-gray font-light tracking-[0.15em] uppercase mb-2">
                        Selected Upgrades
                    </div>
                    <div className="space-y-1">
                        {selectedAddons.map((addon) => (
                            <div
                                key={addon.id}
                                className="flex justify-between text-sm font-light text-dark-gray"
                            >
                                <span>{addon.name}</span>
                                <span className="text-medium-gray">
                                    +{formatCurrency(addon.price)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
