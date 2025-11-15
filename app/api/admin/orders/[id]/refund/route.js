import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { adminAuth } from '@/middleware/adminAuth';
import { createRefund } from '@/lib/razorpay';

/**
 * POST /api/admin/orders/[id]/refund
 * Manual refund processing by admin
 */
export async function POST(request, context) {
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
        const { amount, reason, notes } = body;

        // Fetch the order
        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Validate refund eligibility
        if (order.paymentMethod !== 'online') {
            return NextResponse.json({ 
                error: 'Cannot refund COD orders through this endpoint',
                message: 'COD orders require manual bank transfer processing'
            }, { status: 400 });
        }

        if (!order.razorpayPaymentId) {
            return NextResponse.json({ 
                error: 'No payment ID found for this order',
                message: 'This order does not have a valid Razorpay payment ID'
            }, { status: 400 });
        }

        if (order.paymentStatus === 'refunded') {
            return NextResponse.json({ 
                error: 'Order already refunded',
                message: 'This order has already been refunded'
            }, { status: 400 });
        }

        if (order.paymentStatus !== 'paid') {
            return NextResponse.json({ 
                error: 'Order payment is not in paid status',
                message: `Current payment status: ${order.paymentStatus}`
            }, { status: 400 });
        }

        // Calculate refund amount
        const refundAmount = amount || order.totalAmount;

        if (refundAmount > order.totalAmount) {
            return NextResponse.json({ 
                error: 'Refund amount exceeds order total',
                message: `Cannot refund ₹${refundAmount} for an order of ₹${order.totalAmount}`
            }, { status: 400 });
        }

        console.log(`💰 Admin initiating refund for order ${order.orderNumber}`);
        console.log(`   Payment ID: ${order.razorpayPaymentId}`);
        console.log(`   Amount: ₹${refundAmount} (Order total: ₹${order.totalAmount})`);

        // Process refund through Razorpay
        try {
            const refund = await createRefund(order.razorpayPaymentId, refundAmount);
            
            console.log(`✅ Refund successful. Refund ID: ${refund.id}`);

            // Update order
            order.paymentStatus = 'refunded';
            if (order.status !== 'cancelled') {
                order.status = 'cancelled';
            }
            
            const refundNotes = `[ADMIN REFUND] Amount: ₹${refundAmount}. ` +
                `Refund ID: ${refund.id}. ` +
                `Reason: ${reason || 'Manual admin refund'}. ` +
                `${notes ? 'Notes: ' + notes : ''}`;
            
            order.notes = (order.notes ? order.notes + '\n' : '') + refundNotes;
            await order.save();

            return NextResponse.json({
                success: true,
                message: 'Refund processed successfully',
                refund: {
                    id: refund.id,
                    amount: refundAmount,
                    status: refund.status,
                    paymentId: order.razorpayPaymentId,
                    orderNumber: order.orderNumber,
                    created_at: refund.created_at
                },
                order: {
                    id: order._id,
                    orderNumber: order.orderNumber,
                    paymentStatus: order.paymentStatus,
                    status: order.status
                }
            });

        } catch (refundError) {
            console.error('❌ Refund failed:', refundError);

            // Log the failed attempt
            const failedRefundNote = `[REFUND FAILED] Attempted refund of ₹${refundAmount} failed. ` +
                `Error: ${refundError.message}. Payment ID: ${order.razorpayPaymentId}`;
            
            order.notes = (order.notes ? order.notes + '\n' : '') + failedRefundNote;
            await order.save();

            return NextResponse.json({
                error: 'Refund processing failed',
                message: refundError.message || 'Failed to process refund through payment gateway',
                details: {
                    orderNumber: order.orderNumber,
                    paymentId: order.razorpayPaymentId,
                    attemptedAmount: refundAmount
                }
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in manual refund process:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}

/**
 * GET /api/admin/orders/[id]/refund
 * Check refund eligibility and details
 */
export async function GET(request, context) {
    try {
        // Check admin authentication
        const authResult = await adminAuth(request);
        if (authResult && authResult.error === null) {
            // Authorized, continue
        } else {
            return authResult;
        }

        await connectDB();

        const params = await context.params;
        const { id } = params;

        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const eligible = order.paymentMethod === 'online' && 
                        order.paymentStatus === 'paid' && 
                        order.razorpayPaymentId;

        return NextResponse.json({
            eligible,
            order: {
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                razorpayPaymentId: order.razorpayPaymentId,
                status: order.status
            },
            reasons: eligible ? [
                'Customer requested cancellation',
                'Shiprocket shipment failed',
                'Product out of stock',
                'Unable to fulfill order',
                'Duplicate order',
                'Customer dispute',
                'Other'
            ] : [],
            message: eligible 
                ? 'Order is eligible for refund' 
                : 'Order is not eligible for refund through this system'
        });

    } catch (error) {
        console.error('Error checking refund eligibility:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}
