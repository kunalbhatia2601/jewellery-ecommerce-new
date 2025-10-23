import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Subcategory from '@/models/Subcategory';

export async function GET(request, context) {
    try {
        await connectDB();
        
        const params = await context.params;
        const { id } = params;
        
        // Verify subcategory exists
        const subcategory = await Subcategory.findById(id).populate('category');
        
        if (!subcategory) {
            return NextResponse.json(
                { error: 'Subcategory not found' },
                { status: 404 }
            );
        }
        
        // Get query parameters for filtering and pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
        const includeInactive = searchParams.get('includeInactive') === 'true';
        
        // Build query
        const query = { subcategory: id };
        
        if (!includeInactive) {
            query.isActive = true;
        }
        
        // Get total count for pagination
        const totalProducts = await Product.countDocuments(query);
        
        // Fetch products with pagination
        const products = await Product.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('subcategory', 'name slug')
            .lean();
        
        return NextResponse.json({
            success: true,
            subcategory: {
                _id: subcategory._id,
                name: subcategory.name,
                slug: subcategory.slug,
                description: subcategory.description,
                category: subcategory.category
            },
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching products by subcategory:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
