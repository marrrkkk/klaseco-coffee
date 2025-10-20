import { Head, Link, router } from "@inertiajs/react";

export default function StaffLayout({
    children,
    title = "KlaséCo Staff",
    role = "Staff",
}) {
    const handleLogout = () => {
        router.post(route("staff.logout"));
    };

    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen bg-coffee-50">
            <Head title={title} />

            {/* Desktop-Optimized Header */}
            <header className="desktop-header">
                <div className="desktop-container py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <Link
                                href="/"
                                className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
                            >
                                <div className="w-10 h-10 bg-cream rounded-lg flex items-center justify-center">
                                    <span className="text-coffee-600 font-bold text-xl">
                                        K
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-wide text-white">
                                        KlaséCo
                                    </h1>
                                    <p className="text-coffee-100 text-sm leading-none">
                                        Staff Portal
                                    </p>
                                </div>
                            </Link>
                            <div className="hidden md:flex items-center space-x-1">
                                <span className="text-coffee-200 text-xl">
                                    |
                                </span>
                                <div className="ml-4">
                                    <span className="text-coffee-100 text-lg font-semibold">
                                        {role} Dashboard
                                    </span>
                                    <div className="text-coffee-200 text-sm">
                                        Order Management System
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex items-center space-x-2">
                            <Link
                                href="/cashier"
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    currentPath === "/cashier"
                                        ? "bg-cream text-coffee-600 shadow-md"
                                        : "bg-coffee-700 hover:bg-coffee-800 text-white"
                                }`}
                            >
                                💰 Cashier
                            </Link>
                            <Link
                                href="/owner"
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    currentPath === "/owner"
                                        ? "bg-cream text-coffee-600 shadow-md"
                                        : "bg-coffee-700 hover:bg-coffee-800 text-white"
                                }`}
                            >
                                ☕ Owner
                            </Link>
                            <Link
                                href="/"
                                className="px-4 py-2 text-coffee-200 hover:text-white hover:bg-coffee-700 rounded-lg font-medium transition-all duration-200"
                            >
                                📱 Customer Menu
                            </Link>
                            <div className="w-px h-6 bg-coffee-500 mx-2"></div>
                            <button
                                onClick={handleLogout}
                                className="coffee-button-danger px-4 py-2"
                            >
                                🚪 Logout
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="desktop-main">
                <div className="desktop-container py-6">{children}</div>
            </main>

            {/* Footer */}
            <footer className="bg-coffee-800 text-coffee-100 py-4 border-t border-coffee-700">
                <div className="desktop-container">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                            <span>© 2024 KlaséCo</span>
                            <span>•</span>
                            <span>Staff Portal v1.0</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span>🇵🇭 Philippines</span>
                            <span>•</span>
                            <span>Premium Coffee Solutions</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
