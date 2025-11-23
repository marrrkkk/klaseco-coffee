import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function AdminLayout({ children, title }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        {
            name: "Dashboard",
            href: route("admin.dashboard"),
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
            ),
            current: route().current("admin.dashboard"),
        },
        {
            name: "Categories",
            href: route("admin.categories.index"),
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                </svg>
            ),
            current: route().current("admin.categories.*"),
        },
        {
            name: "Products",
            href: route("admin.products.index"),
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                </svg>
            ),
            current: route().current("admin.products.*"),
        },
        {
            name: "Orders",
            href: route("admin.orders.index"),
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                </svg>
            ),
            current: route().current("admin.orders.*"),
        },
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to logout?")) {
            window.location.href = route("logout");
            // Trigger logout via form submission
            const form = document.createElement("form");
            form.method = "POST";
            form.action = route("logout");

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");
            if (csrfToken) {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = "_token";
                input.value = csrfToken;
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:hidden ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
                    <Link
                        href={route("admin.dashboard")}
                        className="flex items-center space-x-2"
                    >
                        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                K
                            </span>
                        </div>
                        <span className="text-white font-semibold text-lg">
                            KlaséCo Admin
                        </span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-gray-400 hover:text-white"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                item.current
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                        >
                            <span
                                className={
                                    item.current
                                        ? "text-white"
                                        : "text-gray-400 group-hover:text-gray-300"
                                }
                            >
                                {item.icon}
                            </span>
                            <span className="ml-3">{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                    <div className="flex items-center mb-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {auth.user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">
                                {auth.user?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                                {auth.user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                        <span className="ml-3">Logout</span>
                    </button>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-gray-900 overflow-y-auto">
                    <div className="flex items-center h-16 px-4 bg-gray-800">
                        <Link
                            href={route("admin.dashboard")}
                            className="flex items-center space-x-2"
                        >
                            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    K
                                </span>
                            </div>
                            <span className="text-white font-semibold text-lg">
                                KlaséCo Admin
                            </span>
                        </Link>
                    </div>
                    <nav className="mt-5 flex-1 px-2 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    item.current
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                }`}
                            >
                                <span
                                    className={
                                        item.current
                                            ? "text-white"
                                            : "text-gray-400 group-hover:text-gray-300"
                                    }
                                >
                                    {item.icon}
                                </span>
                                <span className="ml-3">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="flex-shrink-0 p-4 border-t border-gray-800">
                        <div className="flex items-center mb-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {auth.user?.name
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">
                                    {auth.user?.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {auth.user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            <span className="ml-3">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64 flex flex-col flex-1">
                {/* Mobile header */}
                <div className="sticky top-0 z-10 lg:hidden bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-500 hover:text-gray-600"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                        <Link
                            href={route("admin.dashboard")}
                            className="flex items-center space-x-2"
                        >
                            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    K
                                </span>
                            </div>
                            <span className="text-gray-900 font-semibold text-lg">
                                KlaséCo Admin
                            </span>
                        </Link>
                        <div className="w-6" /> {/* Spacer for centering */}
                    </div>
                </div>

                {/* Page header */}
                {title && (
                    <header className="bg-white shadow-sm">
                        <div className="px-4 py-6 sm:px-6 lg:px-8">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {title}
                            </h1>
                        </div>
                    </header>
                )}

                {/* Page content */}
                <main className="flex-1">
                    <div className="py-6">
                        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
