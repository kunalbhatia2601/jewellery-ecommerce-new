"use client";
import { Suspense, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Benefits from './components/Benefits';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import LoginModalHandler from './components/LoginModalHandler';
import NewArrivals from './components/NewArrivals';
import CouponShowcase from './components/CouponShowcase';

// Force dynamic rendering to avoid SSG issues with useSearchParams
export const dynamic = 'force-dynamic';

function ProductsSection() {
  return (
    <section id="products-section" className="py-20 px-4 bg-[#FAFAFA] pt-32 lg:pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-2">
            Explore
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-[#2C2C2C] tracking-tight mb-4">
            Our Collections
          </h2>
          <p className="text-gray-600 font-light mb-8">
            Discover our curated jewelry collections, each crafted with precision and passion
          </p>
          
          {/* CTA Button to Collections */}
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/collections'}
              className="px-8 py-3 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] transition-colors font-medium"
            >
              Browse All Collections
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <Navbar />
      <Suspense fallback={null}>
        <LoginModalHandler />
      </Suspense>
      <Hero />
      <NewArrivals />
      <CouponShowcase />
      <Benefits />
      <Testimonials />
      <Footer />
    </main>
  );
}