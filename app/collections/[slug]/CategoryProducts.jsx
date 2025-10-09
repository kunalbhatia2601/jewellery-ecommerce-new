"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import ProductGrid from '../../components/ProductGrid';
import { motion } from 'framer-motion';

export default function CategoryProducts({ slug }) {
    const router = useRouter();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('featured');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        if (slug) {
            fetchCategoryProducts();
        }
    }, [slug, sortBy, currentPage]);

    const fetchCategoryProducts = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(
                `/api/categories/${slug}/products?sortBy=${sortBy}&page=${currentPage}&limit=12`
            );
            
            if (response.ok) {
                const data = await response.json();
                setCategory(data.category);
                setProducts(data.products);
                setPagination(data.pagination);
            } else if (response.status === 404) {
                setError('Category not found');
            } else {
                setError('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching category products:', error);
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        setCurrentPage(1); // Reset to first page when sorting changes
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && !category) {
        return (
            <div className="min-h-screen pt-24 bg-[#FAFAFA]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF76]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-24 bg-[#FAFAFA]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-16">
                        <div className="text-red-600 mb-4">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {error === 'Category not found' ? 'Category Not Found' : 'Something went wrong'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {error === 'Category not found' 
                                ? 'The category you are looking for does not exist.' 
                                : 'Unable to load products at this time.'
                            }
                        </p>
                        <div className="space-x-4">
                            <button 
                                onClick={() => router.push('/collections')}
                                className="px-4 py-2 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] transition-colors"
                            >
                                Back to Collections
                            </button>
                            {error !== 'Category not found' && (
                                <button 
                                    onClick={fetchCategoryProducts}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-16 pb-20 lg:pt-24 lg:pb-16">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                    <button 
                        onClick={() => router.push('/collections')}
                        className="hover:text-[#D4AF76] transition-colors"
                    >
                        Collections
                    </button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[#2C2C2C] font-medium">{category?.name}</span>
                </nav>

                {/* Category Header */}
                {category && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8 lg:mb-12"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="md:flex">
                                {/* Category Image */}
                                <div className="md:w-1/3 lg:w-1/4">
                                    <div className="aspect-square md:aspect-[4/3] lg:aspect-square relative">
                                        <CldImage
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                
                                {/* Category Info */}
                                <div className="md:w-2/3 lg:w-3/4 p-6 lg:p-8 flex flex-col justify-center">
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#2C2C2C] mb-4 tracking-tight">
                                        {category.name}
                                    </h1>
                                    <p className="text-gray-600 font-light text-lg leading-relaxed mb-6">
                                        {category.description}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <span>{category.productsCount || 0} {category.productsCount === 1 ? 'product' : 'products'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    {/* Results Count */}
                    <div>
                        <p className="text-gray-600 font-light">
                            {pagination ? (
                                <>
                                    Showing {((pagination.page - 1) * 12) + 1}-{Math.min(pagination.page * 12, pagination.totalProducts)} of {pagination.totalProducts} products
                                </>
                            ) : (
                                `${products.length} products`
                            )}
                        </p>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-[#2C2C2C]">Sort by:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF76] text-sm"
                        >
                            <option value="featured">Featured</option>
                            <option value="newest">Newest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                <ProductGrid 
                    products={products}
                    loading={loading}
                    error={error && error !== 'Category not found' ? error : ''}
                    emptyMessage={`No products found in ${category?.name || 'this category'}.`}
                />

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <div className="flex items-center space-x-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const page = Math.max(1, Math.min(
                                    pagination.totalPages - 4,
                                    pagination.page - 2
                                )) + i;
                                
                                if (page > pagination.totalPages) return null;
                                
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            page === pagination.page
                                                ? 'bg-[#8B6B4C] text-white'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}