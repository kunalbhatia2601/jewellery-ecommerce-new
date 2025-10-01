"use client";
import React, { useState, useEffect } from "react";
import { CldImage } from 'next-cloudinary';
import { useAuth } from '../context/AuthContext'; // Add this import
import Register from './Register';
import Login from './Login';

export default function Hero() {
    const { user } = useAuth(); // Add this line
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const slides = [
        {
            image: "carousel1_l76hra.jpg",
            title: "Timeless Elegance",
            subtitle: "Discover our exclusive collection"
        },
        {
            image: "carousel2_gycam4.jpg",
            title: "Luxury Defined",
            subtitle: "Handcrafted with precision"
        },
        {
            image: "carousel3_xpvlxx.jpg",  // Cloudinary public ID
            title: "New Arrivals",
            subtitle: "Experience contemporary designs"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <div className="relative h-screen w-full overflow-hidden">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                            index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <CldImage
                            src={slide.image}
                            alt={slide.title}
                            fill
                            priority
                            className="object-cover"
                        />
                        {/* Multiple overlay layers for better text visibility */}
                        <div className="absolute inset-0 bg-black/50 z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
                            <h1 className="text-5xl md:text-6xl font-light mb-4 drop-shadow-lg">{slide.title}</h1>
                            <p className="text-xl md:text-2xl drop-shadow-lg">{slide.subtitle}</p>
                            <div className="flex gap-4 mt-8">
                                <button className="px-8 py-3 bg-[#8B6B4C] text-white hover:bg-[#725939] transition-colors">
                                    Shop Now
                                </button>
                                {!user && ( // Only show Sign Up button if user is not logged in
                                    <button 
                                        onClick={() => setIsRegisterOpen(true)}
                                        className="px-8 py-3 bg-white text-[#8B6B4C] hover:bg-gray-100 transition-colors"
                                    >
                                        Sign Up
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <Register 
                isOpen={isRegisterOpen} 
                onClose={() => setIsRegisterOpen(false)}
                onLoginClick={() => {
                    setIsRegisterOpen(false);
                    setIsLoginOpen(true);
                }}
            />
            
            <Login 
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onRegisterClick={() => {
                    setIsLoginOpen(false);
                    setIsRegisterOpen(true);
                }}
            />
        </>
    );
}