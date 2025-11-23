import { Head, Link } from "@inertiajs/react";
import { ShoppingBagIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function MinimalistLayout({ children, title = "KlaséCo" }) {
    return (
        <div className="min-h-screen bg-warm-white">
            <Head title={title} />

            {/* Modern App-Style Header */}
            <header className="bg-primary-white shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-primary-white/95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-coffee-accent to-dark-gray rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-primary-white font-semibold text-base">
                                    K
                                </span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-semibold text-dark-gray tracking-tight">
                                    KlaséCo
                                </h1>
                            </div>
                        </Link>

                        {/* Navigation */}
                        <nav className="flex items-center space-x-2 sm:space-x-4">
                            <Link
                                href="/"
                                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-medium-gray hover:text-dark-gray hover:bg-warm-white transition-all duration-200"
                            >
                                <ShoppingBagIcon className="h-5 w-5" />
                                <span className="hidden sm:inline">Menu</span>
                            </Link>
                            <Link
                                href="/track-order"
                                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-medium-gray hover:text-dark-gray hover:bg-warm-white transition-all duration-200"
                            >
                                <ClockIcon className="h-5 w-5" />
                                <span className="hidden sm:inline">Track</span>
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pb-8">{children}</main>

            {/* Modern Footer */}
            <footer className="bg-primary-white border-t border-light-gray mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        {/* Brand */}
                        <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-coffee-accent to-dark-gray rounded-lg flex items-center justify-center">
                                <span className="text-primary-white font-semibold text-xs">
                                    K
                                </span>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-dark-gray">
                                    KlaséCo
                                </span>
                                <p className="text-xs text-medium-gray">
                                    Premium Coffee Experience
                                </p>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex items-center space-x-6 text-xs text-medium-gray">
                            <span className="flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                <span>Open Now</span>
                            </span>
                            <span>Philippines</span>
                            <span>© 2025</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
