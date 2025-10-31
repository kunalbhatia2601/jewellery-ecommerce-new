import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Subcategory from '@/models/Subcategory';
import connectDB from '@/lib/mongodb';
import cache from '@/lib/cache';

// GET single category
export async function GET(request, context) {
    const params = await context.params;
    try {
        await connectDB();
        
        const { slug } = await params;
        const category = await Category.findOne({ slug, isActive: true });
        
        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }
        
        // Update product count
        const productCount = await Product.countDocuments({ 
            category: category.name, 
            isActive: true 
        });
        category.productsCount = productCount;
        await category.save();
        
        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

// PUT update category
export async function PUT(request, context) {
    const params = await context.params;
    try {
        await connectDB();
        
        const { slug } = await params;
        const data = await request.json();
        
        const category = await Category.findOneAndUpdate(
            { slug },
            data,
            { new: true, runValidators: true }
        );
        
        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

// DELETE category
export async function DELETE(request, context) {
    const params = await context.params;
    try {
        await connectDB();
        
        const { slug } = await params;
        
        // Find the category
        const category = await Category.findOne({ slug });
        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }
        
        // Get all subcategories associated with this category
        const subcategories = await Subcategory.find({ category: category._id });
        const subcategoryIds = subcategories.map(sub => sub._id);
        
        // Count products to be deleted (for logging)
        const productsByCategory = await Product.countDocuments({ category: category.name });
        const productsBySubcategory = await Product.countDocuments({ subcategory: { $in: subcategoryIds } });
        
        // Delete all products associated with this category (by category name)
        await Product.deleteMany({ category: category.name });
        
        // Delete all products associated with subcategories of this category
        // (in case there are products linked by subcategory but different category name)
        await Product.deleteMany({ subcategory: { $in: subcategoryIds } });
        
        // Delete all subcategories associated with this category
        await Subcategory.deleteMany({ category: category._id });
        
        // Delete the category itself
        await Category.findOneAndDelete({ slug });
        
        // Clear all related caches
        cache.clear(); // Clear all category, subcategory and product caches
        
        return NextResponse.json({ 
            message: 'Category and related data deleted successfully',
            deleted: {
                category: category.name,
                subcategories: subcategories.length,
                products: Math.max(productsByCategory, productsBySubcategory) // Avoid double counting
            }
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}