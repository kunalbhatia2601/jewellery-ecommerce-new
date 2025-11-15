import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { adminAuth } from '@/middleware/adminAuth';

/**
 * GET /api/admin/orders/stuck
 * Get orders that are stuck and need manual intervention
 * - Orders with payment but no Shiprocket ID
 * - Orders older than 30 minutes in pending state with paid status
 * - Orders marked for urgent attention in notes
 */
export async function GET(request) {
    try {
        // Check admin authentication
        const authResult = await adminAuth(request);
        if (authResult && authResult.error === null) {
            // Authorized, continue
        } else {
            return authResult;
        }

        await connectDB();

        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        // Find stuck orders with various criteria
        const stuckOrders = await Order.find({
            $or: [
                // Online payment successful but no Shiprocket order
                {
                    paymentMethod: 'online',
                    paymentStatus: 'paid',
                    shiprocketOrderId: { $exists: false },
                    createdAt: { $lt: thirtyMinutesAgo }
                },
                // Pending status but payment already captured
                {
                    status: 'pending',
                    paymentStatus: 'paid',
                    createdAt: { $lt: thirtyMinutesAgo }
                },
                // Orders with urgent notes
                {
                    notes: { $regex: /URGENT|CRITICAL|MANUAL.*REQUIRED/i },
                    status: { $nin: ['delivered', 'cancelled', 'returned'] }
                },
                // Cancelled orders with paid status (needs refund verification)
                {
                    status: 'cancelled',
                    paymentStatus: 'paid',
                    updatedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
                }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('userId', 'name email')
        .lean();

        // Categorize stuck orders
        const categorized = {
            urgentRefunds: [],
            noShipment: [],
            pendingVerification: [],
            cancelledNeedsRefund: [],
            other: []
        };

        stuckOrders.forEach(order => {
            const category = {
                orderId: order._id,
                orderNumber: order.orderNumber,
                customerName: order.userId?.name || order.shippingAddress?.fullName,
                customerEmail: order.userId?.email,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                status: order.status,
                razorpayPaymentId: order.razorpayPaymentId,
                shiprocketOrderId: order.shiprocketOrderId,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                notes: order.notes,
                ageInMinutes: Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
            };

            // Categorize based on issue type
            if (order.notes?.match(/URGENT.*refund failed/i)) {
                categorized.urgentRefunds.push({
                    ...category,
                    priority: 'critical',
                    issue: 'Automatic refund failed - manual refund required immediately',
                    action: 'Process manual refund using admin panel'
                });
            } else if (order.paymentStatus === 'paid' && !order.shiprocketOrderId) {
                categorized.noShipment.push({
                    ...category,
                    priority: 'high',
                    issue: 'Payment received but shipment not created',
                    action: 'Create Shiprocket shipment manually or initiate refund'
                });
            } else if (order.status === 'cancelled' && order.paymentStatus === 'paid') {
                categorized.cancelledNeedsRefund.push({
                    ...category,
                    priority: 'high',
                    issue: 'Order cancelled but payment not refunded',
                    action: 'Verify refund status and process if needed'
                });
            } else if (order.status === 'pending' && order.paymentStatus === 'paid') {
                categorized.pendingVerification.push({
                    ...category,
                    priority: 'medium',
                    issue: 'Order stuck in pending state with payment received',
                    action: 'Verify order status and proceed with fulfillment or refund'
                });
            } else {
                categorized.other.push({
                    ...category,
                    priority: 'medium',
                    issue: 'Requires manual review',
                    action: 'Review order details and take appropriate action'
                });
            }
        });

        // Calculate totals
        const totalStuck = stuckOrders.length;
        const totalAmount = stuckOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const criticalCount = categorized.urgentRefunds.length;
        const highPriorityCount = categorized.noShipment.length + categorized.cancelledNeedsRefund.length;

        return NextResponse.json({
            success: true,
            summary: {
                totalStuckOrders: totalStuck,
                totalAmountAtRisk: totalAmount,
                criticalIssues: criticalCount,
                highPriorityIssues: highPriorityCount,
                mediumPriorityIssues: totalStuck - criticalCount - highPriorityCount
            },
            categories: categorized,
            message: totalStuck > 0 
                ? `Found ${totalStuck} orders requiring manual intervention` 
                : 'No stuck orders found'
        });

    } catch (error) {
        console.error('Error fetching stuck orders:', error);
        return NextResponse.json({
            error: 'Failed to fetch stuck orders',
            message: error.message
        }, { status: 500 });
    }
}
