import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenuItemCard from "@/Components/Menu/MenuItemCard";

describe("MenuItemCard", () => {
    const mockItem = {
        id: 1,
        name: "Americano",
        description: "Classic black coffee",
        base_price: 70.0,
        is_available: true,
    };

    const mockAddons = [
        {
            id: 1,
            name: "Extra Shot",
            price: 15.0,
            is_available: true,
        },
        {
            id: 2,
            name: "Whipped Cream",
            price: 10.0,
            is_available: true,
        },
    ];

    const mockOnAddToCart = vi.fn();

    beforeEach(() => {
        mockOnAddToCart.mockClear();
    });

    it("renders menu item information correctly", () => {
        render(
            <MenuItemCard
                item={mockItem}
                addons={mockAddons}
                onAddToCart={mockOnAddToCart}
            />
        );

        expect(screen.getByText("Americano")).toBeInTheDocument();
        expect(screen.getByText("Classic black coffee")).toBeInTheDocument();
        expect(screen.getByText("₱70")).toBeInTheDocument();
        expect(screen.getByText("Extra: ₱91")).toBeInTheDocument();
    });

    it("calculates prices correctly for different sizes", () => {
        render(
            <MenuItemCard
                item={mockItem}
                addons={mockAddons}
                onAddToCart={mockOnAddToCart}
            />
        );

        // Daily size should be base price
        expect(screen.getByText("₱70")).toBeInTheDocument();

        // Extra size should be base price * 1.3 = 91
        expect(screen.getByText("Extra: ₱91")).toBeInTheDocument();
    });

    it("shows customization panel when customize button is clicked", async () => {
        const user = userEvent.setup();

        render(
            <MenuItemCard
                item={mockItem}
                addons={mockAddons}
                onAddToCart={mockOnAddToCart}
            />
        );

        const customizeButton = screen.getByText("Customize");
        await user.click(customizeButton);

        expect(screen.getByText("Size")).toBeInTheDocument();
        expect(screen.getByText("Temperature")).toBeInTheDocument();
        expect(screen.getByText("Add-ons")).toBeInTheDocument();
        expect(screen.getByText("Quantity")).toBeInTheDocument();
    });

    it("allows size selection and updates price", async () => {
        const user = userEvent.setup();

        render(
            <MenuItemCard
                item={mockItem}
                addons={mockAddons}
                onAddToCart={mockOnAddToCart}
            />
        );

        await user.click(screen.getByText("Customize"));

        // Select Extra size
        const extraButton = screen.getByText("Extra - ₱91");
        await user.click(extraButton);

        // Check if the button is selected (has the selected styling)
        expect(extraButton).toHaveClass("bg-coffee-600");
    });

    it("allows variant selection", async () => {
        const user = userEvent.setup();

        render(
            <MenuItemCard
                item={mockItem}
                addons={mockAddons}
                onAddToCart={mockOnAddToCart}
            />
        );

        await user.click(screen.getByText("Customize"));

        // Select Cold variant
        const coldButton = screen.getByText("Cold");
        await user.click(coldButton);

        expect(coldButton).toHaveClass("bg-coffee-600");
    });

    it("allows addon selection and deselection", async () => {
        const user = userEvent.setup();

        render(
            <MenuItemCard
                item={mockItem}
                addons={mockAddons}
                onAddToCart={mockOnAddToCart}
            />
        );

        await user.click(screen.getByText("Customize"));

        // Select Extra Shot addon
        const extraShotCheckbox = screen.getByRole("checkbox", {
            name: /extra shot/i,
        });
        await user.click(extraShotCheckbox);

        expect(extraShotCheckbox).toBeChecked();

        // Deselect it
        await user.click(extraShotCheckbox);
        expect(extraShotCheckbox).not.toBeChecked();
    });

    it("allows quantity adjustment", async () => {
        const user = userEvent.setup();

        render(
            <MenuItemCard
                item={mockItem}
                addons={mockAddons}
                onAddToCart={mockOnAddToCart}
            />
        );

        await user.click(screen.getByText("Customize"));

        // Initial quantity should be 1
        expect(screen.getByText("1")).toBeInTheDocument();

        // Increase quantity
        const plusButton = screen.getByRole("button", { name: "" }); // Plus icon button
        await user.click(plusButton);

        expect(screen.getByText("2")).toBeInTheDocument();

        // Decrease quantity
        const minusButton =
            screen.getAllByRole("button")[
                screen.getAllByRole("button").length - 3
            ]; // Minus icon button
        await user.click(minusButton);

        expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("prevents quantity from going below 1", async () => {
        const user = userEvent.setup();

        render(
            <MenuItemCard
                item={mockItem}
                addons={mockAddons}
                onAddToCart={mockOnAddToCart}
            />
        );

        await user.click(screen.getByText("Customize"));

        // Try to decrease quantity below 1
        const minusButton =
            screen.getAllByRole("button")[
                screen.getAllByRole("button").length - 3
            ];
        await user.click(minusButton);

        // Should still be 1
        expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("calculates total price correctly with addons and quantity", async () => {
        const user = userEvent.setup();

        render(
            <MenuItemCard
                item={mockItem}
                addons={mockAddons}
                onAddToCart={mockOnAddToCart}
            />
        );

        await user.click(screen.getByText("Customize"));

        // Select Extra Shot addon (₱15)
        const extraShotCheckbox = screen.getByRole("checkbox", {
            name: /extra shot/i,
        });
        await user.click(extraShotCheckbox);

        // Increase quantity to 2
        const plusButton = screen.getByRole("button", { name: "" });
        await user.click(plusButton);

        // Total should be (₱70 + ₱15) * 2 = ₱170
        expect(screen.getByText("₱170.00")).toBeInTheDocument();
    });

    it("calls onAddToCart with correct parameters", async () => {
        const user = userEvent.setup();

        render(
            <MenuItemCard
                item={mockItem}
                addons={mockAddons}
                onAddToCart={mockOnAddToCart}
            />
        );

        await user.click(screen.getByText("Customize"));

        // Select Extra size
        await user.click(screen.getByText("Extra - ₱91"));

        // Select Cold variant
        await user.click(screen.getByText("Cold"));

        // Select Extra Shot addon
        const extraShotCheckbox = screen.getByRole("checkbox", {
            name: /extra shot/i,
        });
        await user.click(extraShotCheckbox);

        // Increase quantity to 2
        const plusButton = screen.getByRole("button", { name: "" });
        await user.click(plusButton);

        // Add to cart
        const addToCartButton = screen.getByText("Add to Cart");
        await user.click(addToCartButton);

        expect(mockOnAddToCart).toHaveBeenCalledWith(
            mockItem,
            "extra",
            "cold",
            [mockAddons[0]], // Extra Shot addon
            2
        );
    });

    it("resets customization after adding to cart", async () => {
        const user = userEvent.setup();

        render(
            <MenuItemCard
                item={mockItem}
                addons={mockAddons}
                onAddToCart={mockOnAddToCart}
            />
        );

        await user.click(screen.getByText("Customize"));

        // Make some selections
        await user.click(screen.getByText("Extra - ₱91"));
        await user.click(screen.getByText("Cold"));

        const extraShotCheckbox = screen.getByRole("checkbox", {
            name: /extra shot/i,
        });
        await user.click(extraShotCheckbox);

        // Add to cart
        const addToCartButton = screen.getByText("Add to Cart");
        await user.click(addToCartButton);

        // Customization panel should be hidden
        expect(screen.queryByText("Size")).not.toBeInTheDocument();

        // Customize button should be visible again
        expect(screen.getByText("Customize")).toBeInTheDocument();
    });

    it("hides unavailable addons", () => {
        const addonsWithUnavailable = [
            ...mockAddons,
            {
                id: 3,
                name: "Unavailable Addon",
                price: 5.0,
                is_available: false,
            },
        ];

        render(
            <MenuItemCard
                item={mockItem}
                addons={addonsWithUnavailable}
                onAddToCart={mockOnAddToCart}
            />
        );

        fireEvent.click(screen.getByText("Customize"));

        expect(screen.getByText("Extra Shot")).toBeInTheDocument();
        expect(screen.getByText("Whipped Cream")).toBeInTheDocument();
        expect(screen.queryByText("Unavailable Addon")).not.toBeInTheDocument();
    });

    it("handles empty addons array", () => {
        render(
            <MenuItemCard
                item={mockItem}
                addons={[]}
                onAddToCart={mockOnAddToCart}
            />
        );

        fireEvent.click(screen.getByText("Customize"));

        // Add-ons section should not be rendered
        expect(screen.queryByText("Add-ons")).not.toBeInTheDocument();
    });
});
