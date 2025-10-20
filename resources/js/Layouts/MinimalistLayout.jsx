import { Head, Link } from "@inertiajs/react";

export default function MinimalistLayout({ children, title = "KlaséCo" }) {
    return (
        <div className="min-h-screen bg-primary-white">
            <Head title={title} />

            {/* Minimalist Header */}
            <header className="bg-primary-white border-b border-light-gray sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-300"
                        >
                            <div className="w-10 h-10 bg-dark-gray rounded-full flex items-center justify-center">
                                <span className="text-primary-white font-light text-lg tracking-wider">
                                    K
                                </span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-light tracking-wider text-dark-gray">
                                    KlaséCo
                                </h1>
                                <p className="text-medium-gray text-sm font-light tracking-wide">
                                    Premium Coffee
                                </p>
                            </div>
                        </Link>

                        <div className="flex items-center space-x-6">
                            <Link
                                href="/track-order"
                                className="text-medium-gray hover:text-dark-gray font-light tracking-wide transition-colors duration-300"
                            >
                                Track Order
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>{children}</main>

            {/* Minimalist Footer */}
            <footer className="bg-primary-white border-t border-light-gray py-12 mt-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-dark-gray rounded-full flex items-center justify-center">
                                <span className="text-primary-white font-light text-sm tracking-wider">
                                    K
                                </span>
                            </div>
                            <span className="text-xl font-light tracking-wider text-dark-gray">
                                KlaséCo
                            </span>
                        </div>
                        <p className="text-medium-gray font-light tracking-wide mb-6">
                            Crafting exceptional coffee experiences with
                            precision and elegance
                        </p>
                        <div className="flex justify-center space-x-8 text-sm text-medium-gray font-light">
                            <span>Philippines</span>
                            <span>Premium Quality</span>
                            <span>Artisan Crafted</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
