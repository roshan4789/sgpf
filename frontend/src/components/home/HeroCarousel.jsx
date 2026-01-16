import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const HeroCarousel = ({ scrollToProducts }) => {
    const { banners } = useShop();
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

    useEffect(() => {
        if (banners.length === 0) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [banners]);

    if (banners.length === 0) return null;

    return (
        <div className="relative bg-stone-900 text-white rounded-2xl overflow-hidden mb-12 h-[300px] md:h-[400px] flex items-center w-full shadow-lg group">
            {banners.map((slide, index) => (
                <div key={slide.id || index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10"></div>
                    <img src={slide.image} alt="Hero" className="w-full h-full object-cover" />

                    {/* Content */}
                    <div className="absolute z-20 inset-0 flex flex-col justify-center px-6 md:px-16 text-center">
                        <div className="max-w-2xl">
                            <span className="text-stone-300 font-medium tracking-wide uppercase mb-2 block text-sm">
                                {slide.subtitle}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                                {slide.title}
                            </h1>
                            <p className="text-stone-200 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
                                {slide.desc}
                            </p>
                            <button
                                onClick={scrollToProducts}
                                className="inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-lg font-semibold hover:bg-stone-100 transition-all duration-200 shadow-lg"
                            >
                                Shop Now <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 z-30 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/20 transition-all duration-200"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 z-30 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/20 transition-all duration-200"
            >
                <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
                {banners.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide
                            ? 'bg-white w-8'
                            : 'bg-white/40 w-1.5 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
