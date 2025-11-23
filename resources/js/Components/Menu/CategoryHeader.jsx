import { memo } from "react";

const CategoryHeader = memo(function CategoryHeader({ categoryName, onBack }) {
    return (
        <div className="bg-primary-white border-b border-light-gray sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center space-x-4">
                    {/* Back Button */}
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-light-gray hover:bg-dark-gray hover:text-primary-white text-dark-gray transition-all duration-300 shadow-md hover:shadow-lg flex-shrink-0"
                        aria-label="Back to menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    {/* Category Name */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider text-dark-gray">
                        {categoryName}
                    </h1>
                </div>
            </div>
        </div>
    );
});

export default CategoryHeader;
