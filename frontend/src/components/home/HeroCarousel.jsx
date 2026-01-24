import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const HeroCarousel = ({ scrollToProducts }) => {
    const { banners } = useShop();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

    useEffect(() => {
        if (banners.length === 0 || !isAutoPlaying) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [banners, isAutoPlaying, currentSlide]);

    if (banners.length === 0) return null;

    return (
        <div
            className="relative bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white rounded-3xl overflow-hidden mb-12 h-[400px] md:h-[500px] lg:h-[550px] shadow-2xl group"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(251,191,36,0.05)_49%,rgba(251,191,36,0.05)_51%,transparent_52%)] bg-[length:20px_20px]"></div>
            </div>

            {/* Slides */}
            {banners.map((slide, index) => (
                <div
                    key={slide.id || index}
                    className={`absolute inset-0 transition-all duration-1000 ${index === currentSlide
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-105'
                        }`}
                >
                    {/* Image with Parallax Effect */}
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover transition-transform duration-[8000ms] ease-out group-hover:scale-110"
                        />
                        {/* Multi-layer Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    {/* Content - Properly Aligned */}
                    <div className="absolute inset-0 z-20 flex items-center">
                        <div className="w-full px-8 md:px-16 lg:px-20">
                            <div className="max-w-3xl">
                                {/* Animated Badge */}
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-md border border-amber-400/30 rounded-full px-5 py-2.5 mb-5 shadow-lg shadow-amber-500/20">
                                    <Sparkles size={16} className="text-amber-400" />
                                    <span className="text-amber-300 font-bold text-xs md:text-sm uppercase tracking-widest">
                                        {slide.subtitle}
                                    </span>
                                </div>

                                {/* Title with Stagger Animation */}
                                <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-5 leading-[1.15] text-white drop-shadow-2xl transition-all duration-700 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                    }`}>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-50 to-amber-200">
                                        {slide.title}
                                    </span>
                                </h1>

                                {/* Description */}
                                <p className={`text-stone-200 text-base md:text-lg lg:text-xl mb-7 leading-relaxed font-light max-w-2xl transition-all duration-700 delay-100 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                    }`}>
                                    {slide.desc}
                                </p>

                                {/* CTA Button with Glow Effect */}
                                <button
                                    onClick={scrollToProducts}
                                    className={`group/btn inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-bold text-base md:text-lg shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/50 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ${index === currentSlide ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-4 opacity-0'
                                        }`}
                                >
                                    Shop Collection
                                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows - Enhanced */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all duration-300 hover:scale-110 shadow-lg border border-white/10 opacity-0 group-hover:opacity-100"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all duration-300 hover:scale-110 shadow-lg border border-white/10 opacity-0 group-hover:opacity-100"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Progress Indicators - Modern Design */}
            {banners.length > 1 && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className="group/indicator relative"
                            aria-label={`Go to slide ${i + 1}`}
                        >
                            {/* Background bar */}
                            <div className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide
                                    ? 'bg-amber-500 w-12 shadow-lg shadow-amber-500/50'
                                    : 'bg-white/30 w-8 group-hover/indicator:bg-white/50 group-hover/indicator:w-10'
                                }`}>
                                {/* Animated progress fill */}
                                {i === currentSlide && isAutoPlaying && (
                                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full animate-[progress_5s_linear]"></div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Slide Counter */}
            {banners.length > 1 && (
                <div className="absolute top-6 right-6 z-30 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium border border-white/10">
                    {currentSlide + 1} / {banners.length}
                </div>
            )}

            {/* Custom CSS for progress animation */}
            <style jsx>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default HeroCarousel;
