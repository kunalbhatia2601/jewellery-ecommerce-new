import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit')) || 10;

        if (!query || query.trim() === '') {
            return NextResponse.json([]);
        }

        // Search for products by name or SKU
        const products = await Product.find({
            isActive: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { sku: { $regex: query, $options: 'i' } }
            ]
        })
        .select('name slug images price sku category subcategory')
        .limit(limit)
        .lean();

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        return NextResponse.json(
            { error: 'Failed to search products' },
            { status: 500 }
        );
    }
}
