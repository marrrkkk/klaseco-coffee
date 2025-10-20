import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import ReceiptModal from "@/Components/Menu/ReceiptModal";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

// Mock window.print
Object.defineProperty(window, "print", {
    value: vi.fn(),
    writable: true,
});

describe("ReceiptModal", () => {
    const mockOrder = {
        id: 1,
        customer_name: "John Doe",
        customer_phone: "09123456789",
        status: "served",
        total_amount: "155.00",
        created_at: "2024-01-15T10:30:00Z",
        order_items: [
            {
                id: 1,
                quantity: 2,
                size: "extra",
                variant: "cold",
                unit_price: "91.00",
                subtotal: "212.00",
                menu_item: {
                    name: "Americano",
                },
                order_item_addons: [
                    {
                        addon: {
                            name: "Extra Shot",
                        },
                        quantity: 1,
                        unit_price: "15.00",
                    },
                ],
            },
        ],
    };

    const mockReceiptData = {
        order_info: {
            id: 1,
            customer_name: "John Doe",
            customer_phone: "09123456789",
            status: "served",
            created_at: "2024-01-15T10:30:00Z",
            served_at: "2024-01-15T10:45:00Z",
        },
        staff_info: {
            cashier: { id: 1, name: "Test Cashier" },
            owner: { id: 2, name: "Test Owner" },
        },
        items_breakdown: [
            {
                menu_item: { name: "Americano", category: "Coffee" },
                quantity: 2,
                size: "Extra",
                variant: "Cold",
                unit_price: 91.0,
                base_subtotal: 182.0,
                addons: [
                    {
                        name: "Extra Shot",
                        quantity: 1,
                        unit_price: 15.0,
                        total: 15.0,
                    },
                ],
                addon_total: 15.0,
                item_total: 212.0,
            },
        ],
        pricing: {
            subtotal: 212.0,
            total_amount: 212.0,
            currency: "PHP",
            items_count: 1,
            total_quantity: 2,
        },
        business_info: {
            name: "KlaséCo",
            tagline: "Premium Coffee Experience",
            receipt_footer:
                "Thank you for choosing KlaséCo! Visit us again soon.",
        },
        receipt_metadata: {
            generated_at: "2024-01-15T10:45:00Z",
            receipt_number: "R000001",
            format_version: "1.0",
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders nothing when not open", () => {
        render(
            <ReceiptModal isOpen={false} onClose={vi.fn()} order={mockOrder} />
        );

        expect(screen.queryByText("Order Receipt")).not.toBeInTheDocument();
    });

    it("renders nothing when no order provided", () => {
        render(<ReceiptModal isOpen={true} onClose={vi.fn()} order={null} />);

        expect(screen.queryByText("Order Receipt")).not.toBeInTheDocument();
    });

    it("fetches and displays enhanced receipt data for served orders", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: { data: mockReceiptData },
        });

        render(
            <ReceiptModal isOpen={true} onClose={vi.fn()} order={mockOrder} />
        );

        // Should show loading initially
        expect(screen.getByText("Loading receipt...")).toBeInTheDocument();

        // Wait for receipt data to load
        await waitFor(() => {
            expect(screen.getByText("Order Receipt")).toBeInTheDocument();
        });

        // Verify API call was made
        expect(mockedAxios.get).toHaveBeenCalledWith("/api/orders/1/receipt");

        // Verify enhanced receipt content is displayed
        expect(screen.getByText("KlaséCo")).toBeInTheDocument();
        expect(
            screen.getByText("Premium Coffee Experience")
        ).toBeInTheDocument();
        expect(screen.getByText("Receipt #R000001")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Test Cashier")).toBeInTheDocument();
        expect(screen.getByText("Test Owner")).toBeInTheDocument();
        expect(screen.getByText("Americano")).toBeInTheDocument();
        expect(screen.getByText("Extra • Cold")).toBeInTheDocument();
        expect(
            screen.getByText("+ Extra Shot (1x ₱15.00):")
        ).toBeInTheDocument();
        expect(screen.getByText("₱212.00")).toBeInTheDocument();
    });

    it("displays fallback order data when receipt API fails", async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

        render(
            <ReceiptModal isOpen={true} onClose={vi.fn()} order={mockOrder} />
        );

        await waitFor(() => {
            expect(
                screen.getByText("Failed to load receipt data")
            ).toBeInTheDocument();
        });

        // Should still show basic order information
        expect(screen.getByText("Order Receipt")).toBeInTheDocument();
    });

    it("calls window.print when print button is clicked", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: { data: mockReceiptData },
        });

        render(
            <ReceiptModal isOpen={true} onClose={vi.fn()} order={mockOrder} />
        );

        await waitFor(() => {
            expect(screen.getByText("Print Receipt")).toBeInTheDocument();
        });

        const printButton = screen.getByText("Print Receipt");
        fireEvent.click(printButton);

        expect(window.print).toHaveBeenCalled();
    });

    it("calls onClose when close button is clicked", async () => {
        const mockOnClose = vi.fn();

        mockedAxios.get.mockResolvedValueOnce({
            data: { data: mockReceiptData },
        });

        render(
            <ReceiptModal
                isOpen={true}
                onClose={mockOnClose}
                order={mockOrder}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Close")).toBeInTheDocument();
        });

        const closeButton = screen.getByText("Close");
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it("disables print button when loading or error", async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

        render(
            <ReceiptModal isOpen={true} onClose={vi.fn()} order={mockOrder} />
        );

        await waitFor(() => {
            const printButton = screen.getByText("Print Receipt");
            expect(printButton).toBeDisabled();
        });
    });

    it("displays proper Philippine peso formatting", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: { data: mockReceiptData },
        });

        render(
            <ReceiptModal isOpen={true} onClose={vi.fn()} order={mockOrder} />
        );

        await waitFor(() => {
            // Check for peso symbol and proper decimal formatting
            expect(screen.getByText("₱212.00")).toBeInTheDocument();
            expect(screen.getByText("₱15.00")).toBeInTheDocument();
        });
    });

    it("shows detailed pricing breakdown", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: { data: mockReceiptData },
        });

        render(
            <ReceiptModal isOpen={true} onClose={vi.fn()} order={mockOrder} />
        );

        await waitFor(() => {
            // Check for detailed breakdown elements
            expect(
                screen.getByText("Base price (2x ₱91.00):")
            ).toBeInTheDocument();
            expect(
                screen.getByText("+ Extra Shot (1x ₱15.00):")
            ).toBeInTheDocument();
            expect(screen.getByText("Items (1):")).toBeInTheDocument();
            expect(screen.getByText("Total Quantity:")).toBeInTheDocument();
            expect(screen.getByText("2")).toBeInTheDocument();
        });
    });
});
