import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subcategory from '@/models/Subcategory';
import Product from '@/models/Product';
import { adminAuth } from '@/middleware/adminAuth';
import cache from '@/lib/cache';

// GET: Fetch a single subcategory by ID
export async function GET(request, context) {
    try {
        await connectDB();
        
        const params = await context.params;
        const { id } = params;
        
        const subcategory = await Subcategory.findById(id).populate('category', 'name slug');
        
        if (!subcategory) {
            return NextResponse.json(
                { error: 'Subcategory not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            subcategory
        });
    } catch (error) {
        console.error('Error fetching subcategory:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subcategory' },
            { status: 500 }
        );
    }
}

// PUT: Update a subcategory (Admin only)
export async function PUT(request, context) {
    try {
        // Check admin authentication
        const authResult = await adminAuth(request);
        if (authResult && authResult.error === null) {
            // Authorized, continue
        } else {
            return authResult; // Return error response
        }
        
        await connectDB();
        
        const params = await context.params;
        const { id } = params;
        const body = await request.json();
        const { name, categoryId, description, image, order, isActive } = body;
        
        const updateData = {};
        
        if (name !== undefined) updateData.name = name;
        if (categoryId !== undefined) updateData.category = categoryId;
        if (description !== undefined) updateData.description = description;
        if (image !== undefined) updateData.image = image;
        if (order !== undefined) updateData.order = order;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const subcategory = await Subcategory.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name slug');
        
        if (!subcategory) {
            return NextResponse.json(
                { error: 'Subcategory not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            subcategory
        });
    } catch (error) {
        console.error('Error updating subcategory:', error);
        return NextResponse.json(
            { error: 'Failed to update subcategory' },
            { status: 500 }
        );
    }
}

// DELETE: Delete a subcategory (Admin only)
export async function DELETE(request, context) {
    try {
        // Check admin authentication
        const authResult = await adminAuth(request);
        if (authResult && authResult.error === null) {
            // Authorized, continue
        } else {
            return authResult; // Return error response
        }
        
        await connectDB();
        
        const params = await context.params;
        const { id } = params;
        
        // Check if subcategory exists
        const subcategory = await Subcategory.findById(id);
        if (!subcategory) {
            return NextResponse.json(
                { error: 'Subcategory not found' },
                { status: 404 }
            );
        }
        
        // Count products to be deleted (for logging)
        const productsCount = await Product.countDocuments({ subcategory: id });
        
        // Delete all products associated with this subcategory
        await Product.deleteMany({ subcategory: id });
        
        // Delete the subcategory itself
        await Subcategory.findByIdAndDelete(id);
        
        // Clear all related caches
        cache.clear(); // Clear all subcategory and product caches
        
        return NextResponse.json({
            success: true,
            message: 'Subcategory and related products deleted successfully',
            deleted: {
                subcategory: subcategory.name,
                products: productsCount
            }
        });
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        return NextResponse.json(
            { error: 'Failed to delete subcategory' },
            { status: 500 }
        );
    }
}
