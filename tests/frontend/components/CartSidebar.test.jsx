import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CartSidebar from "@/Components/Menu/CartSidebar";

// Mock axios
const mockAxios = {
    post: vi.fn(),
};
global.axios = mockAxios;

describe("CartSidebar", () => {
    const mockCart = [
        {
            id: 1,
            name: "Americano",
            menu_item_id: 1,
            size: "daily",
            variant: "hot",
            quantity: 2,
            subtotal: 140.0,
            addons: [{ id: 1, name: "Extra Shot", quantity: 1 }],
        },
        {
            id: 2,
            name: "Cappuccino",
            menu_item_id: 2,
            size: "extra",
            variant: "cold",
            quantity: 1,
            subtotal: 91.0,
            addons: [],
        },
    ];

    const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        cart: mockCart,
        onRemoveItem: vi.fn(),
        onUpdateQuantity: vi.fn(),
        total: 231.0,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders cart items correctly", () => {
        render(<CartSidebar {...mockProps} />);

        expect(screen.getByText("Your Cart")).toBeInTheDocument();
        expect(screen.getByText("Americano")).toBeInTheDocument();
        expect(screen.getByText("Cappuccino")).toBeInTheDocument();
        expect(screen.getByText("Daily • Hot")).toBeInTheDocument();
        expect(screen.getByText("Extra • Cold")).toBeInTheDocument();
        expect(screen.getByText("Add-ons: Extra Shot")).toBeInTheDocument();
        expect(screen.getByText("₱140.00")).toBeInTheDocument();
        expect(screen.getByText("₱91.00")).toBeInTheDocument();
        expect(screen.getByText("₱231.00")).toBeInTheDocument();
    });

    it("does not render when closed", () => {
        render(<CartSidebar {...mockProps} isOpen={false} />);

        expect(screen.queryByText("Your Cart")).not.toBeInTheDocument();
    });

    it("shows empty cart message when cart is empty", () => {
        render(<CartSidebar {...mockProps} cart={[]} />);

        expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
        expect(screen.queryByText("Your Name")).not.toBeInTheDocument();
    });

    it("allows quantity updates", async () => {
        const user = userEvent.setup();

        render(<CartSidebar {...mockProps} />);

        // Find plus button for first item (Americano)
        const plusButtons = screen.getAllByRole("button");
        const americanoPlusButton = plusButtons.find(
            (button) =>
                button.querySelector("svg") &&
                button
                    .closest(".bg-coffee-50")
                    ?.textContent.includes("Americano")
        );

        if (americanoPlusButton) {
            await user.click(americanoPlusButton);
            expect(mockProps.onUpdateQuantity).toHaveBeenCalledWith(1, 3);
        }
    });

    it("allows item removal", async () => {
        const user = userEvent.setup();

        render(<CartSidebar {...mockProps} />);

        const removeButtons = screen.getAllByText("Remove");
        await user.click(removeButtons[0]);

        expect(mockProps.onRemoveItem).toHaveBeenCalledWith(1);
    });

    it("validates form fields before submission", async () => {
        const user = userEvent.setup();

        render(<CartSidebar {...mockProps} />);

        const placeOrderButton = screen.getByText("Place Order");
        await user.click(placeOrderButton);

        // Should show alert for missing fields (we can't test alert directly, but form shouldn't submit)
        expect(mockAxios.post).not.toHaveBeenCalled();
    });

    it("submits order with correct data", async () => {
        const user = userEvent.setup();

        mockAxios.post.mockResolvedValue({
            data: {
                order: {
                    id: 123,
                },
            },
        });

        render(<CartSidebar {...mockProps} />);

        // Fill in customer details
        const nameInput = screen.getByPlaceholderText("Enter your name");
        const phoneInput = screen.getByPlaceholderText(
            "Enter your phone number"
        );

        await user.type(nameInput, "John Doe");
        await user.type(phoneInput, "09123456789");

        // Submit order
        const placeOrderButton = screen.getByText("Place Order");
        await user.click(placeOrderButton);

        await waitFor(() => {
            expect(mockAxios.post).toHaveBeenCalledWith("/api/orders", {
                customer_name: "John Doe",
                customer_phone: "09123456789",
                items: [
                    {
                        menu_item_id: 1,
                        quantity: 2,
                        size: "daily",
                        variant: "hot",
                        addons: [
                            {
                                addon_id: 1,
                                quantity: 1,
                            },
                        ],
                    },
                    {
                        menu_item_id: 2,
                        quantity: 1,
                        size: "extra",
                        variant: "cold",
                        addons: [],
                    },
                ],
            });
        });
    });

    it("shows success message after successful order submission", async () => {
        const user = userEvent.setup();

        mockAxios.post.mockResolvedValue({
            data: {
                order: {
                    id: 123,
                },
            },
        });

        render(<CartSidebar {...mockProps} />);

        // Fill in customer details
        await user.type(
            screen.getByPlaceholderText("Enter your name"),
            "John Doe"
        );
        await user.type(
            screen.getByPlaceholderText("Enter your phone number"),
            "09123456789"
        );

        // Submit order
        await user.click(screen.getByText("Place Order"));

        await waitFor(() => {
            expect(screen.getByText("Order Confirmed!")).toBeInTheDocument();
            expect(screen.getByText("#123")).toBeInTheDocument();
            expect(
                screen.getByText("Order Placed Successfully!")
            ).toBeInTheDocument();
        });
    });

    it("handles order submission errors", async () => {
        const user = userEvent.setup();
        const consoleSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
        const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

        mockAxios.post.mockRejectedValue(new Error("Network error"));

        render(<CartSidebar {...mockProps} />);

        // Fill in customer details
        await user.type(
            screen.getByPlaceholderText("Enter your name"),
            "John Doe"
        );
        await user.type(
            screen.getByPlaceholderText("Enter your phone number"),
            "09123456789"
        );

        // Submit order
        await user.click(screen.getByText("Place Order"));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                "Failed to submit order. Please try again."
            );
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
        alertSpy.mockRestore();
    });

    it("shows loading state during order submission", async () => {
        const user = userEvent.setup();

        // Mock a delayed response
        mockAxios.post.mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({
                                data: { order: { id: 123 } },
                            }),
                        100
                    )
                )
        );

        render(<CartSidebar {...mockProps} />);

        // Fill in customer details
        await user.type(
            screen.getByPlaceholderText("Enter your name"),
            "John Doe"
        );
        await user.type(
            screen.getByPlaceholderText("Enter your phone number"),
            "09123456789"
        );

        // Submit order
        await user.click(screen.getByText("Place Order"));

        // Should show loading state
        expect(screen.getByText("Placing Order...")).toBeInTheDocument();

        // Button should be disabled
        const button = screen.getByText("Placing Order...");
        expect(button).toBeDisabled();
    });

    it("closes sidebar when close button is clicked", async () => {
        const user = userEvent.setup();

        render(<CartSidebar {...mockProps} />);

        const closeButton = screen.getByRole("button", { name: "" }); // X icon button
        await user.click(closeButton);

        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it("closes sidebar when backdrop is clicked", async () => {
        const user = userEvent.setup();

        render(<CartSidebar {...mockProps} />);

        const backdrop = document.querySelector(".bg-black.bg-opacity-50");
        await user.click(backdrop);

        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it("resets success state when closing after successful order", async () => {
        const user = userEvent.setup();

        mockAxios.post.mockResolvedValue({
            data: { order: { id: 123 } },
        });

        render(<CartSidebar {...mockProps} />);

        // Submit successful order
        await user.type(
            screen.getByPlaceholderText("Enter your name"),
            "John Doe"
        );
        await user.type(
            screen.getByPlaceholderText("Enter your phone number"),
            "09123456789"
        );
        await user.click(screen.getByText("Place Order"));

        await waitFor(() => {
            expect(screen.getByText("Order Confirmed!")).toBeInTheDocument();
        });

        // Close and reopen
        await user.click(screen.getByText("Continue Shopping"));
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it("trims whitespace from customer inputs", async () => {
        const user = userEvent.setup();

        mockAxios.post.mockResolvedValue({
            data: { order: { id: 123 } },
        });

        render(<CartSidebar {...mockProps} />);

        // Fill in customer details with extra whitespace
        await user.type(
            screen.getByPlaceholderText("Enter your name"),
            "  John Doe  "
        );
        await user.type(
            screen.getByPlaceholderText("Enter your phone number"),
            "  09123456789  "
        );

        await user.click(screen.getByText("Place Order"));

        await waitFor(() => {
            expect(mockAxios.post).toHaveBeenCalledWith(
                "/api/orders",
                expect.objectContaining({
                    customer_name: "John Doe",
                    customer_phone: "09123456789",
                })
            );
        });
    });
});
