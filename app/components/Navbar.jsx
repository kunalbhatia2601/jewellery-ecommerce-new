"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Cart from './Cart';
import Login from './Login';
import Register from './Register';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { setIsCartOpen, cartItems } = useCart();
    const { user, logout, showLoginModal, closeLoginModal, triggerLoginModal } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            // Optional: Add a toast notification here
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileOpen && !event.target.closest('.profile-menu')) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    const scrollToNewArrivals = (e) => {
        e.preventDefault();
        const section = document.getElementById('new-arrivals');
        if (section) {
            const navbarHeight = 80; // Height of your navbar
            const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Debug user data
    useEffect(() => {
        console.log('Current user:', user);
    }, [user]);

    const getInitials = () => {
        if (user?.name) {
            return user.name[0].toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return 'U';
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <>
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-[90] border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center gap-8">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-light tracking-widest text-[#2C2C2C] hover:text-[#D4AF76] transition-colors">
                            LUXE
                        </Link>
                    </div>
                    
                    {/* Search Bar - Center */}
                    <div className="hidden md:flex flex-1 max-w-2xl">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className="w-full px-6 py-3 rounded-full bg-[#F5F5F5] border border-transparent focus:border-[#D4AF76] focus:bg-white outline-none transition-all"
                            />
                            <button 
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[#D4AF76]/10 transition-colors"
                            >
                                <svg className="w-5 h-5 text-[#2C2C2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="relative profile-menu">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2C2C2C] to-[#D4AF76] text-white flex items-center justify-center hover:shadow-lg transition-all duration-300 relative z-50 font-light"
                            >
                                {getInitials()}
                            </button>
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100"
                                    >
                                        <div className="px-5 py-4 border-b border-gray-100">
                                            <p className="text-sm font-medium text-[#2C2C2C]">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                                        </div>
                                        
                                        <div className="py-2">
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    router.push('/orders');
                                                }}
                                                className="flex items-center w-full px-5 py-3 text-sm text-[#2C2C2C] hover:bg-[#F5F5F5] transition-colors rounded-xl mx-2"
                                            >
                                                <svg className="mr-3 h-5 w-5 text-[#D4AF76]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                My Orders
                                            </button>
                                            
                                            {user.isAdmin && (
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        router.push('/admin');
                                                    }}
                                                    className="flex items-center w-full px-5 py-3 text-sm text-[#2C2C2C] hover:bg-[#F5F5F5] transition-colors rounded-xl mx-2"
                                                >
                                                    <svg className="mr-3 h-5 w-5 text-[#D4AF76]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Admin Dashboard
                                                </button>
                                            )}
                                        </div>

                                        <div className="border-t border-gray-100 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                disabled={isLoggingOut}
                                                className="flex items-center w-full px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-xl mx-2 disabled:opacity-50"
                                            >
                                                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        ) : (
                            <button
                                onClick={() => triggerLoginModal()}
                                className="px-6 py-2.5 text-sm font-light text-[#2C2C2C] hover:text-[#D4AF76] border border-[#E5E5E5] rounded-full hover:border-[#D4AF76] transition-all"
                            >
                                Sign In
                            </button>
                        )}
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2.5 rounded-full hover:bg-[#F5F5F5] transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2C2C2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#D4AF76] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden px-4 pb-4">
                <form onSubmit={handleSearch} className="w-full relative">
                    <input
                        type="text"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-3 rounded-full bg-[#F5F5F5] border border-transparent focus:border-[#D4AF76] focus:bg-white outline-none transition-all"
                    />
                    <button 
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[#D4AF76]/10 transition-colors"
                    >
                        <svg className="w-5 h-5 text-[#2C2C2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </form>
            </div>

        </nav>
        
        {/* Modals and Cart rendered outside nav for proper z-index stacking */}
        <Suspense fallback={null}>
            <Login 
                isOpen={showLoginModal} 
                onClose={() => closeLoginModal()}
                onRegisterClick={() => setIsRegisterOpen(true)}
            />
        </Suspense>
        <Register 
            isOpen={isRegisterOpen} 
            onClose={() => setIsRegisterOpen(false)}
            onLoginClick={() => triggerLoginModal()}
        />
        <Cart />
        </>
    );
}