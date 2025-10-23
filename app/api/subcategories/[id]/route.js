import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subcategory from '@/models/Subcategory';
import Product from '@/models/Product';
import { adminAuth } from '@/middleware/adminAuth';

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
        
        // Check if any products are using this subcategory
        const productsCount = await Product.countDocuments({ subcategory: id });
        
        if (productsCount > 0) {
            return NextResponse.json(
                { 
                    error: `Cannot delete subcategory. ${productsCount} product(s) are using this subcategory.`,
                    productsCount 
                },
                { status: 400 }
            );
        }
        
        const subcategory = await Subcategory.findByIdAndDelete(id);
        
        if (!subcategory) {
            return NextResponse.json(
                { error: 'Subcategory not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            message: 'Subcategory deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        return NextResponse.json(
            { error: 'Failed to delete subcategory' },
            { status: 500 }
        );
    }
}
