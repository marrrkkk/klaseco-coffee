import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderQueue from "@/Components/Cashier/OrderQueue";

describe("OrderQueue", () => {
    const mockOrders = [
        {
            id: 1,
            customer_name: "John Doe",
            customer_phone: "09123456789",
            status: "pending",
            total_amount: 170.0,
            created_at: "2024-01-15T10:30:00Z",
            order_items: [
                {
                    id: 1,
                    quantity: 2,
                    size: "daily",
                    variant: "hot",
                    subtotal: 140.0,
                    menu_item: {
                        id: 1,
                        name: "Americano",
                    },
                },
                {
                    id: 2,
                    quantity: 1,
                    size: "extra",
                    variant: "cold",
                    subtotal: 30.0,
                    menu_item: {
                        id: 2,
                        name: "Extra Shot",
                    },
                },
            ],
        },
        {
            id: 2,
            customer_name: "Jane Smith",
            customer_phone: "09987654321",
            status: "pending",
            total_amount: 85.0,
            created_at: "2024-01-15T10:45:00Z",
            order_items: [
                {
                    id: 3,
                    quantity: 1,
                    size: "daily",
                    variant: "hot",
                    subtotal: 85.0,
                    menu_item: {
                        id: 3,
                        name: "Cappuccino",
                    },
                },
            ],
        },
    ];

    const mockProps = {
        orders: mockOrders,
        onViewDetails: vi.fn(),
        onAcceptOrder: vi.fn(),
        onRejectOrder: vi.fn(),
        isLoading: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock Date to have consistent time calculations
        vi.setSystemTime(new Date("2024-01-15T10:50:00Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders orders correctly", () => {
        render(<OrderQueue {...mockProps} />);

        expect(screen.getByText("Order #1")).toBeInTheDocument();
        expect(screen.getByText("Order #2")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.getByText("09123456789")).toBeInTheDocument();
        expect(screen.getByText("09987654321")).toBeInTheDocument();
    });

    it("formats currency correctly", () => {
        render(<OrderQueue {...mockProps} />);

        expect(screen.getByText("₱170.00")).toBeInTheDocument();
        expect(screen.getByText("₱85.00")).toBeInTheDocument();
    });

    it("shows order items preview", () => {
        render(<OrderQueue {...mockProps} />);

        expect(
            screen.getByText("2x Americano (daily, hot)")
        ).toBeInTheDocument();
        expect(
            screen.getByText("1x Extra Shot (extra, cold)")
        ).toBeInTheDocument();
        expect(
            screen.getByText("1x Cappuccino (daily, hot)")
        ).toBeInTheDocument();
    });

    it("shows item count correctly", () => {
        render(<OrderQueue {...mockProps} />);

        expect(screen.getByText("2 item(s)")).toBeInTheDocument();
        expect(screen.getByText("1 item(s)")).toBeInTheDocument();
    });

    it("limits order items preview to 3 items", () => {
        const orderWithManyItems = {
            ...mockOrders[0],
            order_items: [
                ...mockOrders[0].order_items,
                {
                    id: 4,
                    quantity: 1,
                    size: "daily",
                    variant: "hot",
                    subtotal: 70.0,
                    menu_item: { name: "Item 3" },
                },
                {
                    id: 5,
                    quantity: 1,
                    size: "daily",
                    variant: "hot",
                    subtotal: 70.0,
                    menu_item: { name: "Item 4" },
                },
            ],
        };

        render(<OrderQueue {...mockProps} orders={[orderWithManyItems]} />);

        expect(screen.getByText("+1 more item(s)")).toBeInTheDocument();
    });

    it("shows loading state", () => {
        render(<OrderQueue {...mockProps} isLoading={true} />);

        expect(screen.getByText("Loading orders...")).toBeInTheDocument();
        expect(screen.getByRole("status")).toBeInTheDocument(); // Loading spinner
    });

    it("shows empty state when no orders", () => {
        render(<OrderQueue {...mockProps} orders={[]} />);

        expect(screen.getByText("No pending orders")).toBeInTheDocument();
        expect(
            screen.getByText(
                "New orders will appear here when customers place them."
            )
        ).toBeInTheDocument();
    });

    it("handles null orders gracefully", () => {
        render(<OrderQueue {...mockProps} orders={null} />);

        expect(screen.getByText("No pending orders")).toBeInTheDocument();
    });

    it("calls onViewDetails when view details button is clicked", async () => {
        const user = userEvent.setup();

        render(<OrderQueue {...mockProps} />);

        const viewDetailsButtons = screen.getAllByText("View Details");
        await user.click(viewDetailsButtons[0]);

        expect(mockProps.onViewDetails).toHaveBeenCalledWith(mockOrders[0]);
    });

    it("calls onAcceptOrder when accept button is clicked", async () => {
        const user = userEvent.setup();

        render(<OrderQueue {...mockProps} />);

        const acceptButtons = screen.getAllByText("Accept");
        await user.click(acceptButtons[0]);

        expect(mockProps.onAcceptOrder).toHaveBeenCalledWith(1);
    });

    it("calls onRejectOrder when reject button is clicked", async () => {
        const user = userEvent.setup();

        render(<OrderQueue {...mockProps} />);

        const rejectButtons = screen.getAllByText("Reject");
        await user.click(rejectButtons[0]);

        expect(mockProps.onRejectOrder).toHaveBeenCalledWith(1);
    });

    it("shows processing state for orders being processed", async () => {
        const user = userEvent.setup();

        // Mock a delayed response
        mockProps.onAcceptOrder.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<OrderQueue {...mockProps} />);

        const acceptButton = screen.getAllByText("Accept")[0];
        await user.click(acceptButton);

        // Button should be disabled during processing
        expect(acceptButton).toBeDisabled();
    });

    it("formats time correctly", () => {
        render(<OrderQueue {...mockProps} />);

        // Should show formatted time (mocked to 10:50, orders at 10:30 and 10:45)
        expect(screen.getByText("10:30 AM")).toBeInTheDocument();
        expect(screen.getByText("10:45 AM")).toBeInTheDocument();
    });

    it("shows time ago correctly", () => {
        render(<OrderQueue {...mockProps} />);

        // Orders are 20 and 5 minutes old respectively
        expect(screen.getByText("20 minutes ago")).toBeInTheDocument();
        expect(screen.getByText("5 minutes ago")).toBeInTheDocument();
    });

    it('shows "Just now" for very recent orders', () => {
        const recentOrder = {
            ...mockOrders[0],
            created_at: "2024-01-15T10:49:30Z", // 30 seconds ago
        };

        render(<OrderQueue {...mockProps} orders={[recentOrder]} />);

        expect(screen.getByText("Just now")).toBeInTheDocument();
    });

    it("shows hours for old orders", () => {
        const oldOrder = {
            ...mockOrders[0],
            created_at: "2024-01-15T08:30:00Z", // 2 hours and 20 minutes ago
        };

        render(<OrderQueue {...mockProps} orders={[oldOrder]} />);

        expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    });

    it("shows pending status badge", () => {
        render(<OrderQueue {...mockProps} />);

        const pendingBadges = screen.getAllByText("Pending");
        expect(pendingBadges).toHaveLength(2);

        pendingBadges.forEach((badge) => {
            expect(badge).toHaveClass("bg-yellow-100", "text-yellow-800");
        });
    });

    it("handles orders without items gracefully", () => {
        const orderWithoutItems = {
            ...mockOrders[0],
            order_items: null,
        };

        render(<OrderQueue {...mockProps} orders={[orderWithoutItems]} />);

        expect(screen.getByText("0 item(s)")).toBeInTheDocument();
    });

    it("applies hover effects to order cards", () => {
        render(<OrderQueue {...mockProps} />);

        const orderCards = document.querySelectorAll(".hover\\:shadow-lg");
        expect(orderCards).toHaveLength(2);
    });

    it("shows correct order status styling", () => {
        render(<OrderQueue {...mockProps} />);

        const statusBadges = screen.getAllByText("Pending");
        statusBadges.forEach((badge) => {
            expect(badge).toHaveClass(
                "inline-flex",
                "items-center",
                "px-2.5",
                "py-0.5",
                "rounded-full"
            );
        });
    });
});
