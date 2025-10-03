"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from './ProductGrid';
import { useProductFilter } from '../hooks/useProducts';

export default function Collections() {
    const searchParams = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Set initial search term from URL
    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        if (searchFromUrl) {
            setSearchTerm(searchFromUrl);
        }
    }, [searchParams]);
    
    const { 
        products: sortedProducts, 
        categories, 
        loading, 
        error 
    } = useProductFilter(searchTerm, selectedCategory, sortBy);

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <p className="text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-2">Shop</p>
                    <h1 className="text-5xl md:text-6xl font-light text-[#2C2C2C] mb-4 tracking-tight">All Collections</h1>
                    <p className="text-gray-600 font-light">Discover timeless pieces crafted for elegance</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
                    <div className="flex flex-wrap gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2.5 rounded-full text-sm font-light transition-all ${
                                    selectedCategory === category
                                        ? 'bg-[#2C2C2C] text-white shadow-lg'
                                        : 'bg-white text-[#2C2C2C] hover:bg-[#F5F5F5] border border-[#E5E5E5]'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-6 py-3 bg-white border border-[#E5E5E5] rounded-full focus:outline-none focus:border-[#D4AF76] font-light text-[#2C2C2C] cursor-pointer"
                    >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name</option>
                    </select>
                </div>
                
                {searchTerm && (
                    <div className="mb-8 flex items-center gap-2 text-sm">
                        <span className="text-gray-600 font-light">Searching for:</span>
                        <span className="px-4 py-2 bg-[#D4AF76]/10 text-[#2C2C2C] rounded-full font-normal">
                            "{searchTerm}"
                        </span>
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="text-gray-400 hover:text-[#2C2C2C] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Products Grid */}
                <ProductGrid 
                    products={sortedProducts}
                    loading={loading}
                    error={error}
                    emptyMessage="No products found in this category."
                />
            </div>
        </div>
    );
}