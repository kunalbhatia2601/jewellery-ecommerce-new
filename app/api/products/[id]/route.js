import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(request, { params }) {
    try {
        // Add timeout for production environment
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 15000)
        );

        const executeQuery = async () => {
            await dbConnect();
            
            const { id } = await params;
            
            // Validate if id is a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { error: 'Invalid product ID' },
                    { status: 400 }
                );
            }
            
            const product = await Product.findById(id)
                .populate('subcategory', 'name slug')
                .lean()
                .maxTimeMS(10000); // Add MongoDB query timeout
            
            if (!product) {
                return NextResponse.json(
                    { error: 'Product not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(product, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    'CDN-Cache-Control': 'no-store',
                    'Vercel-CDN-Cache-Control': 'no-store',
                },
            });
        };

        return await Promise.race([executeQuery(), timeoutPromise]);
    } catch (error) {
        console.error('Error fetching product:', error);
        
        // Check if it's a timeout error
        if (error.message === 'Request timeout') {
            return NextResponse.json(
                { error: 'Request timeout - please try again' },
                { status: 504 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}
