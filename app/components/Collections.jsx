"use client";
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import { motion } from 'framer-motion';

export default function Collections() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Set initial search term from URL
    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        if (searchFromUrl) {
            setSearchTerm(searchFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                setError('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCategoryClick = (categorySlug) => {
        router.push(`/collections/${categorySlug}`);
    };

    // Clear search functionality
    const clearSearch = () => {
        setSearchTerm('');
        // Update URL to remove search parameter
        router.push('/collections');
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-16 pb-20 lg:pt-24 lg:pb-16">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                {/* Header */}
                <div className="mb-8 lg:mb-12">
                    <div className="text-center">
                        <p className="text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-2">Explore</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#2C2C2C] mb-4 tracking-tight">Our Collections</h1>
                        <p className="text-gray-600 font-light max-w-2xl mx-auto">
                            Discover our curated selection of jewelry collections, each crafted with precision and passion
                        </p>
                        
                        {searchTerm && (
                            <div className="mt-4 flex items-center justify-center">
                                <p className="text-sm text-gray-600">
                                    Searching for "<span className="font-medium text-[#D4AF76]">{searchTerm}</span>"
                                </p>
                                <button 
                                    onClick={clearSearch}
                                    className="ml-2 text-sm text-[#D4AF76] font-medium flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF76]"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-16">
                        <div className="text-red-600 mb-4">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button 
                            onClick={fetchCategories}
                            className="px-4 py-2 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Categories Grid */}
                {!loading && !error && (
                    <>
                        {filteredCategories.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm ? 'No categories found' : 'No categories available'}
                                </h3>
                                <p className="text-gray-500">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Categories will appear here once they are added'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                                {filteredCategories.map((category, index) => (
                                    <motion.div
                                        key={category._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="group cursor-pointer"
                                        onClick={() => handleCategoryClick(category.slug)}
                                    >
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2">
                                            {/* Category Image */}
                                            <div className="aspect-[4/3] overflow-hidden relative">
                                                <CldImage
                                                    src={category.image}
                                                    alt={category.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                
                                                {/* Products Count Badge */}
                                                {category.productsCount > 0 && (
                                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                                                        <span className="text-xs font-medium text-[#2C2C2C]">
                                                            {category.productsCount} {category.productsCount === 1 ? 'item' : 'items'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Category Info */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-medium text-[#2C2C2C] mb-2 group-hover:text-[#D4AF76] transition-colors">
                                                    {category.name}
                                                </h3>
                                                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                                    {category.description}
                                                </p>
                                                
                                                {/* Explore Button */}
                                                <div className="flex items-center text-[#D4AF76] text-sm font-medium group-hover:text-[#8B6B4C] transition-colors">
                                                    <span>Explore Collection</span>
                                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        
                        {/* Results Count */}
                        {filteredCategories.length > 0 && (
                            <div className="text-center mt-12">
                                <p className="text-sm text-gray-500">
                                    Showing {filteredCategories.length} {filteredCategories.length === 1 ? 'collection' : 'collections'}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}