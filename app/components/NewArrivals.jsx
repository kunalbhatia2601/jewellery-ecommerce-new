"use client";
import React, { useRef } from "react";
import { motion } from "framer-motion";

export default function NewArrivals() {
    const scrollRef = useRef(null);

    const products = [
        {
            id: 1,
            name: "Diamond Pendant Necklace",
            price: 1299,
            image: "/product1.jpg",
            category: "Necklaces"
        },
        {
            id: 2,
            name: "Rose Gold Ring",
            price: 899,
            image: "/product2.jpg",
            category: "Rings"
        },
        {
            id: 3,
            name: "Pearl Drop Earrings",
            price: 599,
            image: "/product3.jpg",
            category: "Earrings"
        },
        {
            id: 4,
            name: "Sapphire Bracelet",
            price: 1499,
            image: "/product4.jpg",
            category: "Bracelets"
        },
        {
            id: 5,
            name: "Gold Chain Necklace",
            price: 799,
            image: "/product5.jpg",
            category: "Necklaces"
        },
        {
            id: 6,
            name: "Diamond Stud Earrings",
            price: 999,
            image: "/product6.jpg",
            category: "Earrings"
        },
    ];

    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-light text-gray-900">New Arrivals</h2>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => scrollRef.current.scrollLeft -= 300}
                            className="p-2 rounded-full border border-[#8B6B4C] text-[#8B6B4C] hover:bg-[#8B6B4C] hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => scrollRef.current.scrollLeft += 300}
                            className="p-2 rounded-full border border-[#8B6B4C] text-[#8B6B4C] hover:bg-[#8B6B4C] hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div 
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="min-w-[300px] group"
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
                                    <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-[#8B6B4C] px-6 py-2 
                                        opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#8B6B4C] hover:text-white">
                                        Quick View
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-sm text-[#8B6B4C] mb-1">{product.category}</p>
                                <h3 className="text-gray-900 font-light text-lg mb-1">{product.name}</h3>
                                <p className="text-gray-700">${product.price}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}