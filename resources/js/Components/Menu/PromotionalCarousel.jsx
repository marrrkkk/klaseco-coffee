import { useState, useEffect, useRef, memo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const PromotionalCarousel = memo(function PromotionalCarousel({
    banners,
    autoPlayInterval = 5000,
    showControls = true,
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const intervalRef = useRef(null);

    // Default placeholder banners if none provided - using data URIs to avoid network requests
    const defaultBanners = [
        {
            id: 1,
            imageUrl:
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1200 400'%3E%3Crect fill='%238B7355' width='1200' height='400'/%3E%3Ctext fill='%23FFFFFF' font-family='Arial, sans-serif' font-size='36' font-weight='300' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EWelcome to KlaséCo%3C/text%3E%3C/svg%3E",
            altText: "Welcome Banner",
        },
        {
            id: 2,
            imageUrl:
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1200 400'%3E%3Crect fill='%238B7355' width='1200' height='400'/%3E%3Ctext fill='%23FFFFFF' font-family='Arial, sans-serif' font-size='36' font-weight='300' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ESpecial Offers%3C/text%3E%3C/svg%3E",
            altText: "Special Offers",
        },
        {
            id: 3,
            imageUrl:
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1200 400'%3E%3Crect fill='%238B7355' width='1200' height='400'/%3E%3Ctext fill='%23FFFFFF' font-family='Arial, sans-serif' font-size='36' font-weight='300' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENew Arrivals%3C/text%3E%3C/svg%3E",
            altText: "New Arrivals",
        },
    ];

    // Return null if explicitly passed empty array
    if (Array.isArray(banners) && banners.length === 0) {
        return null;
    }

    const displayBanners =
        banners && banners.length > 0 ? banners : defaultBanners;
    const totalBanners = displayBanners.length;

    // Auto-rotation logic
    useEffect(() => {
        if (!isPaused && totalBanners > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % totalBanners);
            }, autoPlayInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, autoPlayInterval, totalBanners]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex(
            (prevIndex) => (prevIndex - 1 + totalBanners) % totalBanners
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalBanners);
    };

    const handleMouseEnter = () => {
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
    };

    // Touch gesture handling for mobile
    const minSwipeDistance = 50;

    const handleTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goToNext();
        } else if (isRightSwipe) {
            goToPrevious();
        }
    };

    if (totalBanners === 0) {
        return null;
    }

    return (
        <div
            className="relative w-full overflow-hidden bg-warm-white"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Banner slides - only render current and adjacent slides for performance */}
            <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {displayBanners.map((banner, index) => {
                    // Only render current slide and adjacent slides
                    const isVisible =
                        index === currentIndex ||
                        index ===
                            (currentIndex - 1 + totalBanners) % totalBanners ||
                        index === (currentIndex + 1) % totalBanners;

                    return (
                        <div
                            key={banner.id}
                            className="min-w-full flex-shrink-0"
                        >
                            <div className="relative w-full aspect-[3/1] sm:aspect-[3/1] md:aspect-[3/1]">
                                {isVisible ? (
                                    <>
                                        <img
                                            src={banner.imageUrl}
                                            alt={banner.altText}
                                            className="w-full h-full object-cover"
                                            loading={
                                                index === currentIndex
                                                    ? "eager"
                                                    : "lazy"
                                            }
                                        />
                                        {banner.link && (
                                            <a
                                                href={banner.link}
                                                className="absolute inset-0"
                                                aria-label={`View ${banner.altText}`}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-light-gray" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Previous/Next arrow controls - hidden on mobile, visible on tablet+ */}
            {showControls && totalBanners > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="hidden sm:block absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-primary-white/80 hover:bg-primary-white text-dark-gray p-1.5 md:p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-coffee-accent"
                        aria-label="Previous banner"
                    >
                        <ChevronLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="hidden sm:block absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-primary-white/80 hover:bg-primary-white text-dark-gray p-1.5 md:p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-coffee-accent"
                        aria-label="Next banner"
                    >
                        <ChevronRightIcon className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                </>
            )}

            {/* Dot indicators */}
            {totalBanners > 1 && (
                <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {displayBanners.map((banner, index) => (
                        <button
                            key={banner.id}
                            onClick={() => goToSlide(index)}
                            className={`h-2 md:h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-coffee-accent focus:ring-offset-1 md:focus:ring-offset-2 ${
                                index === currentIndex
                                    ? "bg-coffee-accent w-6 md:w-8"
                                    : "bg-primary-white/60 hover:bg-primary-white/80 w-2 md:w-3"
                            }`}
                            aria-label={`Go to banner ${index + 1}`}
                            aria-current={index === currentIndex}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

export default PromotionalCarousel;
