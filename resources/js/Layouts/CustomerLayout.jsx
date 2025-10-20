import { Head, Link } from "@inertiajs/react";

export default function CustomerLayout({ children, title = "KlaséCo" }) {
    return (
        <div className="min-h-screen bg-cream">
            <Head title={title} />

            {/* Mobile-First Header */}
            <header className="mobile-header">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
                        >
                            <div className="w-8 h-8 bg-cream rounded-full flex items-center justify-center">
                                <span className="text-coffee-600 font-bold text-lg">
                                    K
                                </span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-wide text-white">
                                    KlaséCo
                                </h1>
                                <p className="text-coffee-100 text-xs leading-none">
                                    Premium Coffee
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/track-order"
                            className="coffee-button-outline border-cream text-cream hover:bg-cream hover:text-coffee-600 text-sm px-3 py-2"
                        >
                            Track Order
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Container */}
            <main className="mobile-container">{children}</main>

            {/* Footer for branding */}
            <footer className="bg-coffee-800 text-coffee-100 py-6 mt-8">
                <div className="max-w-md mx-auto px-4 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-cream rounded-full flex items-center justify-center">
                            <span className="text-coffee-600 font-bold text-sm">
                                K
                            </span>
                        </div>
                        <span className="font-semibold">KlaséCo</span>
                    </div>
                    <p className="text-coffee-300 text-sm">
                        Crafting exceptional coffee experiences since 2024
                    </p>
                    <div className="mt-3 flex justify-center space-x-4 text-xs">
                        <span>📍 Philippines</span>
                        <span>☕ Premium Quality</span>
                        <span>🚀 Fast Service</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
