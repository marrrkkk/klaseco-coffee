import "@testing-library/jest-dom";

// Mock Inertia.js
global.route = vi.fn((name, params) => {
    const routes = {
        "orders.store": "/api/orders",
        "orders.pending": "/api/orders/pending",
        "orders.accepted": "/api/orders/accepted",
        "orders.accept": (id) => `/api/orders/${id}/accept`,
        "orders.reject": (id) => `/api/orders/${id}/reject`,
        "orders.ready": (id) => `/api/orders/${id}/ready`,
        "orders.served": (id) => `/api/orders/${id}/served`,
        "orders.status": (id) => `/api/orders/${id}/status`,
        "menu.categories": "/api/menu/categories",
        "menu.addons": "/api/menu/addons",
    };

    if (typeof routes[name] === "function") {
        return routes[name](params);
    }
    return routes[name] || `/${name}`;
});

// Mock axios
global.axios = {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
};

// Mock window.location
Object.defineProperty(window, "location", {
    value: {
        href: "http://localhost",
        pathname: "/",
        search: "",
        hash: "",
    },
    writable: true,
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
};
