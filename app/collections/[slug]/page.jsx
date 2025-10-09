"use client";
import { Suspense, use } from 'react';
import CategoryProducts from './CategoryProducts';

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';

function CategoryProductsContent({ params }) {
    const resolvedParams = use(params);
    return <CategoryProducts slug={resolvedParams.slug} />;
}

export default function CategoryPage({ params }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
                    </div>
                </div>
            </div>
        }>
            <CategoryProductsContent params={params} />
        </Suspense>
    );
}