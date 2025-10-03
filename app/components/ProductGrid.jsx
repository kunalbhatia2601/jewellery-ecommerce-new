"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import QuickViewModal from './QuickViewModal';
import { useCart } from '../context/CartContext';

export default function ProductGrid({ 
    products, 
    loading = false, 
    error = null,
    showQuickView = true,
    showAddToCart = true,
    className = "",
    emptyMessage = "No products found."
}) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToCart, setIsCartOpen } = useCart();

    const handleAddToCart = (product) => {
        addToCart(product);
        setIsCartOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load products: {error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-[#8B6B4C] text-white px-4 py-2 rounded hover:bg-[#6d5238]"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <>
            <motion.div 
                layout
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
            >
                <AnimatePresence>
                    {products.map((product, index) => (
                        <motion.div
                            key={product._id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="group card-hover"
                        >
                            <div className="relative overflow-hidden bg-white rounded-3xl">
                                <div className="relative aspect-square overflow-hidden">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    {/* Hover Actions */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex gap-2">
                                            {showQuickView && (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="flex-1 bg-white/95 backdrop-blur-sm text-[#2C2C2C] px-3 py-2.5 rounded-full hover:bg-[#D4AF76] hover:text-white transition-all duration-300 text-sm font-light"
                                                >
                                                    View
                                                </button>
                                            )}
                                            {showAddToCart && (
                                                <button 
                                                    onClick={() => handleAddToCart(product)}
                                                    className="flex-1 bg-[#2C2C2C] text-white px-3 py-2.5 rounded-full hover:bg-[#D4AF76] transition-all duration-300 text-sm font-light"
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 text-center">
                                <p className="text-xs text-[#D4AF76] font-light tracking-widest uppercase mb-2">{product.category}</p>
                                <h3 className="text-[#2C2C2C] font-light text-base mb-2 px-2">{product.name}</h3>
                                <div className="flex justify-center items-center gap-2">
                                    {product.mrp && product.mrp > (product.sellingPrice || product.price) && (
                                        <span className="text-sm text-gray-400 line-through font-light">₹{product.mrp}</span>
                                    )}
                                    <span className="text-[#2C2C2C] font-normal">₹{product.sellingPrice || product.price}</span>
                                </div>
                                {product.stock !== undefined && (
                                    <p className={`text-xs font-light mt-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {showQuickView && (
                <QuickViewModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={selectedProduct}
                />
            )}
        </>
    );
}