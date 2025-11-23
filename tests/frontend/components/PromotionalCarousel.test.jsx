import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import PromotionalCarousel from "@/Components/Menu/PromotionalCarousel";

describe("PromotionalCarousel", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("renders with default placeholder banners when no banners provided", () => {
        render(<PromotionalCarousel />);

        const images = screen.getAllByRole("img");
        expect(images).toHaveLength(3);
        expect(images[0]).toHaveAttribute("alt", "Welcome Banner");
    });

    it("renders custom banners when provided", () => {
        const customBanners = [
            {
                id: 1,
                imageUrl: "https://example.com/banner1.jpg",
                altText: "Custom Banner 1",
            },
            {
                id: 2,
                imageUrl: "https://example.com/banner2.jpg",
                altText: "Custom Banner 2",
            },
        ];

        render(<PromotionalCarousel banners={customBanners} />);

        expect(screen.getByAltText("Custom Banner 1")).toBeInTheDocument();
        expect(screen.getByAltText("Custom Banner 2")).toBeInTheDocument();
    });

    it("displays navigation controls when showControls is true", () => {
        render(<PromotionalCarousel showControls={true} />);

        expect(
            screen.getByRole("button", { name: /previous banner/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /next banner/i })
        ).toBeInTheDocument();
    });

    it("hides navigation controls when showControls is false", () => {
        render(<PromotionalCarousel showControls={false} />);

        expect(
            screen.queryByRole("button", { name: /previous banner/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /next banner/i })
        ).not.toBeInTheDocument();
    });

    it("displays dot indicators for manual navigation", () => {
        render(<PromotionalCarousel />);

        const dotButtons = screen.getAllByRole("button", {
            name: /go to banner/i,
        });
        expect(dotButtons).toHaveLength(3);
    });

    it("navigates to next banner when next button is clicked", async () => {
        const user = userEvent.setup({ delay: null });
        render(<PromotionalCarousel />);

        const nextButton = screen.getByRole("button", {
            name: /next banner/i,
        });
        await user.click(nextButton);

        const dotButtons = screen.getAllByRole("button", {
            name: /go to banner/i,
        });
        expect(dotButtons[1]).toHaveAttribute("aria-current", "true");
    });

    it("navigates to previous banner when previous button is clicked", async () => {
        const user = userEvent.setup({ delay: null });
        render(<PromotionalCarousel />);

        const prevButton = screen.getByRole("button", {
            name: /previous banner/i,
        });
        await user.click(prevButton);

        const dotButtons = screen.getAllByRole("button", {
            name: /go to banner/i,
        });
        // Should wrap around to last banner (index 2)
        expect(dotButtons[2]).toHaveAttribute("aria-current", "true");
    });

    it("navigates to specific banner when dot indicator is clicked", async () => {
        const user = userEvent.setup({ delay: null });
        render(<PromotionalCarousel />);

        const dotButtons = screen.getAllByRole("button", {
            name: /go to banner/i,
        });
        await user.click(dotButtons[2]);

        expect(dotButtons[2]).toHaveAttribute("aria-current", "true");
    });

    it("auto-rotates through banners at specified interval", async () => {
        render(<PromotionalCarousel autoPlayInterval={1000} />);

        const dotButtons = screen.getAllByRole("button", {
            name: /go to banner/i,
        });

        // Initially on first banner
        expect(dotButtons[0]).toHaveAttribute("aria-current", "true");

        // Advance time by 1 second
        vi.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(dotButtons[1]).toHaveAttribute("aria-current", "true");
        });

        // Advance another 1 second
        vi.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(dotButtons[2]).toHaveAttribute("aria-current", "true");
        });
    });

    it("returns null when no banners are available", () => {
        const { container } = render(<PromotionalCarousel banners={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders banner with link when link is provided", () => {
        const bannersWithLink = [
            {
                id: 1,
                imageUrl: "https://example.com/banner.jpg",
                altText: "Banner with link",
                link: "/special-offer",
            },
        ];

        render(<PromotionalCarousel banners={bannersWithLink} />);

        const link = screen.getByRole("link", {
            name: /view banner with link/i,
        });
        expect(link).toHaveAttribute("href", "/special-offer");
    });
});
