"use client";
import React, { useState, useEffect } from "react";
import { CldImage } from 'next-cloudinary';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Hero() {
    const { user } = useAuth();
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(1); // Start with middle slide

    const slides = [
        {
            image: "carousel1_l76hra.jpg",
            title: "Timeless Elegance",
            subtitle: "Curated Collection"
        },
        {
            image: "carousel2_gycam4.jpg",
            title: "Artisan Craftsmanship",
            subtitle: "Handcrafted with Precision"
        },
        {
            image: "carousel3_xpvlxx.jpg",
            title: "New Arrivals",
            subtitle: "Contemporary Luxury"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const scrollToProducts = () => {
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-gradient-to-b from-[#FAFAFA] via-white to-[#FAFAFA] pt-24 pb-20 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#D4AF76]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4AF76]/5 rounded-full blur-3xl" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header Text */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[#D4AF76]/20 mb-6"
                    >
                        <span className="w-2 h-2 bg-[#D4AF76] rounded-full animate-pulse" />
                        <p className="text-xs text-[#2C2C2C] font-light tracking-widest uppercase">
                            Discover Luxury
                        </p>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-[#2C2C2C] mb-6 tracking-tight leading-none">
                        Timeless
                        <span className="block bg-gradient-to-r from-[#2C2C2C] via-[#D4AF76] to-[#2C2C2C] bg-clip-text text-transparent">
                            Jewelry
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
                        Handcrafted pieces that tell your unique story
                    </p>
                </motion.div>

                {/* 3-Image Gallery Carousel */}
                <div className="relative px-4 overflow-hidden">
                    <div className="relative h-[500px] md:h-[650px] lg:h-[750px] max-w-[1600px] mx-auto">
                        {slides.map((slide, index) => {
                            const position = (index - currentSlide + slides.length) % slides.length;
                            const isCenter = position === 0;
                            const isLeft = position === slides.length - 1;
                            const isRight = position === 1;

                            // Calculate positions to center the active image
                            let xPosition = '0%';
                            if (isCenter) {
                                xPosition = '0%'; // Center position
                            } else if (isLeft) {
                                xPosition = '-85%'; // Left position
                            } else if (isRight) {
                                xPosition = '85%'; // Right position
                            }

                            return (
                                <motion.div
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    animate={{
                                        scale: isCenter ? 1 : 0.85,
                                        x: xPosition,
                                        opacity: isCenter ? 1 : 0.4,
                                        zIndex: isCenter ? 30 : 10,
                                        filter: isCenter ? 'brightness(1)' : 'brightness(0.7)'
                                    }}
                                    transition={{ 
                                        duration: 0.7, 
                                        ease: [0.43, 0.13, 0.23, 0.96] // Premium easing
                                    }}
                                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[2.5rem] overflow-hidden ${
                                        isCenter 
                                            ? 'w-[340px] h-[450px] md:w-[480px] md:h-[620px] lg:w-[550px] lg:h-[700px] shadow-[0_25px_80px_rgba(0,0,0,0.4)]' 
                                            : 'w-[300px] h-[400px] md:w-[420px] md:h-[550px] lg:w-[480px] lg:h-[630px] shadow-[0_20px_50px_rgba(0,0,0,0.25)]'
                                    } hover:shadow-[0_30px_90px_rgba(212,175,118,0.3)] transition-shadow duration-500`}
                                >
                                    <CldImage
                                        src={slide.image}
                                        alt={slide.title}
                                        fill
                                        className="object-cover"
                                        priority={isCenter}
                                    />
                                    
                                    {/* Premium double border effect */}
                                    <div className={`absolute inset-0 rounded-[2.5rem] ${
                                        isCenter 
                                            ? 'ring-4 ring-[#D4AF76]/50 ring-offset-4 ring-offset-white/10' 
                                            : 'ring-2 ring-white/10'
                                    } pointer-events-none transition-all duration-500`} />
                                    
                                    {/* Luxury glow effect on center image */}
                                    {isCenter && (
                                        <div className="absolute -inset-1 bg-gradient-to-tr from-[#D4AF76]/20 via-transparent to-[#D4AF76]/20 blur-2xl -z-10 rounded-[2.5rem]" />
                                    )}
                                    
                                    {/* Overlay - only show on center image */}
                                    {isCenter && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3, duration: 0.5 }}
                                            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
                                        >
                                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                                                <motion.div
                                                    initial={{ y: 30, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.4, duration: 0.6 }}
                                                >
                                                    <div className="w-16 h-[2px] bg-gradient-to-r from-[#D4AF76] to-transparent mb-6" />
                                                    <p className="text-xs md:text-sm text-[#D4AF76] font-light tracking-[0.25em] uppercase mb-4">
                                                        {slide.subtitle}
                                                    </p>
                                                    <h3 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
                                                        {slide.title}
                                                    </h3>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}
                                    
                                    {/* Elegant vignette on side images */}
                                    {!isCenter && (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/40" />
                                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50" />
                                        </>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Slide indicators */}
                    <div className="flex justify-center gap-2 mt-10">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all duration-500 rounded-full ${
                                    index === currentSlide 
                                        ? 'w-16 h-2 bg-gradient-to-r from-[#D4AF76] via-[#C19A5B] to-[#D4AF76] shadow-lg shadow-[#D4AF76]/50' 
                                        : 'w-2 h-2 bg-gray-300 hover:bg-[#D4AF76]/50 hover:w-8'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* CTA Button */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-center mt-14"
                >
                    <button 
                        onClick={scrollToProducts}
                        className="group relative px-12 py-5 bg-gradient-to-r from-[#2C2C2C] to-[#3a3a3a] text-white rounded-full hover:from-[#D4AF76] hover:to-[#C19A5B] transition-all duration-500 font-light tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(212,175,118,0.4)] transform hover:scale-105"
                    >
                        <span className="relative z-10">Explore Collection</span>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </button>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div 
                    className="flex justify-center mt-16"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <button onClick={scrollToProducts} className="flex flex-col items-center gap-2 group">
                        <div className="w-6 h-10 border-2 border-[#D4AF76] rounded-full flex justify-center p-2">
                            <motion.div 
                                className="w-1.5 h-1.5 bg-[#D4AF76] rounded-full"
                                animate={{ y: [0, 12, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                        </div>
                        <p className="text-[#2C2C2C] text-xs font-light tracking-wider uppercase opacity-60 group-hover:opacity-100 transition-opacity">Discover More</p>
                    </button>
                </motion.div>
            </div>
        </div>
    );
}