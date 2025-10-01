"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickViewModal from './QuickViewModal';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

export default function Collections() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('featured');

    const { addToCart, setIsCartOpen } = useCart();

    const categories = [
        'All',
        'Necklaces',
        'Rings',
        'Earrings',
        'Bracelets'
    ];

    const filteredProducts = products.filter(product => 
        selectedCategory === 'All' ? true : product.category === selectedCategory
    );

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

    const handleAddToCart = (product) => {
        addToCart(product);
        setIsCartOpen(true);
    };

    return (
        <div className="min-h-screen bg-white pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light text-gray-900 mb-4">Our Collections</h1>
                    <p className="text-gray-600">Discover our exquisite jewelry collection</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-[#8B6B4C] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B6B4C]"
                    >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name</option>
                    </select>
                </div>

                {/* Products Grid */}
                <motion.div 
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence>
                        {sortedProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="group"
                            >
                                <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-square">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <button 
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setIsModalOpen(true);
                                                }}
                                                className="bg-white text-[#8B6B4C] px-6 py-2 rounded hover:bg-[#8B6B4C] hover:text-white transition-colors"
                                            >
                                                Quick View
                                            </button>
                                            <button 
                                                onClick={() => handleAddToCart(product)}
                                                className="bg-white text-[#8B6B4C] px-6 py-2 rounded hover:bg-[#8B6B4C] hover:text-white transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-[#8B6B4C] mb-1">{product.category}</p>
                                    <h3 className="text-gray-900 font-light text-lg mb-1">{product.name}</h3>
                                    <p className="text-gray-700">${product.price}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            <QuickViewModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
}