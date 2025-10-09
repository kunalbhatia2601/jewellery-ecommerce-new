import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import Product from '@/models/Product';
import connectDB from '@/lib/mongodb';

// GET all categories
export async function GET() {
    try {
        await connectDB();
        
        const categories = await Category.find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 });
        
        // Update product counts for each category
        for (let category of categories) {
            const productCount = await Product.countDocuments({ 
                category: category.name, 
                isActive: true 
            });
            category.productsCount = productCount;
            await category.save();
        }

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// POST create new category
export async function POST(request) {
    try {
        await connectDB();
        
        const data = await request.json();
        
        // Validate required fields
        if (!data.name || !data.description || !data.image) {
            return NextResponse.json(
                { error: 'Name, description, and image are required' },
                { status: 400 }
            );
        }
        
        // Check if category already exists
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${data.name}$`, 'i') }
        });
        
        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 409 }
            );
        }
        
        const category = new Category(data);
        await category.save();
        
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 409 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}