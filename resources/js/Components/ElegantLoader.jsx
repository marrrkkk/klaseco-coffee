export default function ElegantLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary-white">
            <div className="relative">
                {/* Coffee cup animation */}
                <div className="w-16 h-16 mb-8">
                    <div className="absolute inset-0 border-2 border-light-gray rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-coffee-accent rounded-full animate-spin border-t-transparent"></div>
                    <div className="absolute inset-4 flex items-center justify-center">
                        <span className="text-coffee-accent text-xl">☕</span>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <h3 className="text-xl font-light text-dark-gray mb-2 tracking-wide">
                    Preparing Your Experience
                </h3>
                <p className="text-medium-gray font-light tracking-wide">
                    Curating our finest selections
                </p>
            </div>

            {/* Elegant loading dots */}
            <div className="flex space-x-2 mt-8">
                <div className="w-2 h-2 bg-coffee-accent rounded-full animate-pulse"></div>
                <div
                    className="w-2 h-2 bg-coffee-accent rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                    className="w-2 h-2 bg-coffee-accent rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                ></div>
            </div>
        </div>
    );
}
