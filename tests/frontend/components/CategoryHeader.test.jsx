import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryHeader from "@/Components/Menu/CategoryHeader";

describe("CategoryHeader", () => {
    const mockOnBack = vi.fn();

    beforeEach(() => {
        mockOnBack.mockClear();
    });

    it("renders category name correctly", () => {
        render(<CategoryHeader categoryName="Coffee" onBack={mockOnBack} />);

        expect(screen.getByText("Coffee")).toBeInTheDocument();
    });

    it("renders back button", () => {
        render(<CategoryHeader categoryName="Coffee" onBack={mockOnBack} />);

        const backButton = screen.getByRole("button", {
            name: /back to menu/i,
        });
        expect(backButton).toBeInTheDocument();
    });

    it("calls onBack when back button is clicked", async () => {
        const user = userEvent.setup();

        render(<CategoryHeader categoryName="Coffee" onBack={mockOnBack} />);

        const backButton = screen.getByRole("button", {
            name: /back to menu/i,
        });
        await user.click(backButton);

        expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it("applies responsive text sizing classes", () => {
        render(<CategoryHeader categoryName="Coffee" onBack={mockOnBack} />);

        const heading = screen.getByText("Coffee");
        expect(heading).toHaveClass("text-3xl", "sm:text-4xl", "md:text-5xl");
    });

    it("renders with different category names", () => {
        const { rerender } = render(
            <CategoryHeader categoryName="Espresso" onBack={mockOnBack} />
        );

        expect(screen.getByText("Espresso")).toBeInTheDocument();

        rerender(
            <CategoryHeader categoryName="Pastries" onBack={mockOnBack} />
        );

        expect(screen.getByText("Pastries")).toBeInTheDocument();
        expect(screen.queryByText("Espresso")).not.toBeInTheDocument();
    });
});
