"use client";
import React, { useState, useEffect } from "react";
import { CldImage } from 'next-cloudinary';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero() {
    const { user } = useAuth();
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const slides = [
        {
            image: "carousel1_l76hra.jpg",
            title: "Luxury, Redefined",
            subtitle: "Exclusive Experience",
            description: "Experience the pinnacle of artistry and craftsmanship with our signature collection. Every creation is a blend of timeless tradition, precision, and modern elegance.",
            cta: "Shop Signature Collection",
        },
        {
            image: "carousel2_gycam4.jpg",
            title: "Crafted by Hands, Perfected by Heart",
            subtitle: "The Nandika Signature Collection",
            description: "Every detail reflects devotion — from the artisan's touch to the final shine, our jewellery celebrates the soul of true craftsmanship.",
            cta: "Discover the Artistry",
        },
        {
            image: "carousel3_xpvlxx.jpg",
            title: "Unveil the New Era of Jewellery",
            subtitle: "Exclusively Crafted for the Discerning Few",
            description: "Step into a world of contemporary elegance — modern silhouettes inspired by heritage, designed to make every moment shine.",
            cta: "Explore New Arrivals",
        }
    ];

    // Auto-advance slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Change slide every 5 seconds
        return () => clearInterval(timer);
    }, [slides.length]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const scrollToProducts = () => {
        // Navigate to products page
        router.push('/products');
    };

    return (
        <div className="relative w-full h-[calc(100vh-64px)] lg:h-screen overflow-hidden bg-black">
            {/* Full-screen Image Slideshow */}
            <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <CldImage
                            src={slides[currentSlide].image}
                            alt={slides[currentSlide].title}
                            fill
                            className="object-cover object-center"
                            priority
                            quality={90}
                        />
                        {/* Simple dark overlay */}
                        <div className="absolute inset-0 bg-black/40" />
                    </motion.div>
                </AnimatePresence>
            </div>



            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
                <div className="max-w-5xl mx-auto text-center text-white">
                    <div className="space-y-3 lg:space-y-8">
                        {/* Subtitle */}
                        {slides[currentSlide].subtitle && (
                            <div 
                                key={`subtitle-${currentSlide}`}
                                className="text-xs md:text-sm lg:text-base tracking-[0.2em] lg:tracking-[0.3em] uppercase text-white/90 font-light relative"
                            >
                                <span className="relative z-10">{slides[currentSlide].subtitle}</span>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                            </div>
                        )}

                        {/* Main Title */}
                        <h1 
                            key={`title-${currentSlide}`}
                            className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-light leading-tight tracking-tight px-2"
                        >
                            <span className="block text-white">{slides[currentSlide].title}</span>
                        </h1>

                        {/* Description */}
                        <p
                            key={`desc-${currentSlide}`}
                            className="text-sm md:text-lg lg:text-xl xl:text-2xl leading-relaxed max-w-3xl mx-auto text-white/95 font-light px-4"
                        >
                            {slides[currentSlide].description}
                        </p>

                        {/* Enhanced CTA Section */}
                        <div 
                            key={`cta-section-${currentSlide}`}
                            className="pt-3 lg:pt-8 space-y-3 lg:space-y-6"
                        >
                            {/* Primary CTA */}
                            <button
                                onClick={scrollToProducts}
                                className="group relative px-6 py-3 lg:px-10 lg:py-5 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-full hover:shadow-2xl transition-all duration-500 font-light tracking-wide shadow-xl overflow-hidden hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                            >
                                <span className="relative z-10 flex items-center gap-2 lg:gap-3 text-sm lg:text-lg">
                                    {slides[currentSlide].cta}
                                    <svg className="w-4 h-4 lg:w-6 lg:h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#8B6B4C] to-[#D4AF76] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </button>
                            {/* Trust Indicators */}
                            <div 
                                className="hidden lg:flex items-center justify-center gap-8 pt-8"
                            >
                                <div className="flex items-center gap-2 text-white/80">
                                    <svg className="w-5 h-5 text-[#D4AF76]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-sm font-light">Rated 4.9/5</span>
                                </div>
                                <div className="w-px h-4 bg-white/30" />
                                <div className="flex items-center gap-2 text-white/80">
                                    <svg className="w-5 h-5 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="text-sm font-light">Certified Quality</span>
                                </div>
                                <div className="w-px h-4 bg-white/30" />
                                <div className="flex items-center gap-2 text-white/80">
                                    <svg className="w-5 h-5 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                    </svg>
                                    <span className="text-sm font-light">Free Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}