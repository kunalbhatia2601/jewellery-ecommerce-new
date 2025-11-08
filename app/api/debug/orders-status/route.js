import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await dbConnect();

        // Get total counts
        const totalOrders = await Order.countDocuments();
        const ordersWithShiprocketCount = await Order.countDocuments({
            shiprocketOrderId: { $exists: true, $ne: null }
        });

        // Get one sample order with Shiprocket ID
        const sampleOrder = await Order.findOne({
            shiprocketOrderId: { $exists: true, $ne: null }
        }).select('orderNumber shiprocketOrderId status createdAt');

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .select('orderNumber shiprocketOrderId status createdAt');

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                totalOrders,
                ordersWithShiprocketCount,
                percentage: totalOrders > 0 ? ((ordersWithShiprocketCount / totalOrders) * 100).toFixed(1) + '%' : '0%',
                sampleOrderWithShiprocket: sampleOrder ? {
                    orderNumber: sampleOrder.orderNumber,
                    shiprocketOrderId: sampleOrder.shiprocketOrderId,
                    status: sampleOrder.status,
                } : null,
                recentOrders: recentOrders.map(o => ({
                    orderNumber: o.orderNumber,
                    hasShiprocketId: !!o.shiprocketOrderId,
                    shiprocketOrderId: o.shiprocketOrderId,
                    status: o.status,
                }))
            }
        });
    } catch (error) {
        console.error('Error in orders check:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
