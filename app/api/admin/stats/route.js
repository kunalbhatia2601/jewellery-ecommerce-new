import { NextResponse } from 'next/server';
import { adminAuth } from '@/middleware/adminAuth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(req) {
    const authError = await adminAuth(req);
    if (authError) return authError;

    try {
        await connectDB();

        const [totalProducts, totalOrders, totalUsers, revenueData] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments(),
            Order.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ])
        ]);

        return NextResponse.json({
            totalProducts,
            totalOrders,
            totalUsers,
            revenue: revenueData[0]?.total || 0
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}