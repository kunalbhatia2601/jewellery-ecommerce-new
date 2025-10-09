import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
    try {
        console.log('Testing MongoDB connection from API route...');
        console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
        
        await connectDB();
        
        return NextResponse.json({ 
            success: true, 
            message: 'MongoDB connection successful!',
            mongodbUri: process.env.MONGODB_URI ? 'Present' : 'Missing'
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message,
                mongodbUri: process.env.MONGODB_URI ? 'Present' : 'Missing'
            },
            { status: 500 }
        );
    }
}