import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import User from '@/models/User';

/**
 * MANUAL SYNC TRACKING FROM SHIPROCKET
 * 
 * Use this endpoint when:
 * - Webhook didn't trigger (cancelled from Shiprocket dashboard)
 * - Status is out of sync
 * - Need to force refresh tracking data
 * 
 * This will fetch the latest status from Shiprocket API directly
 */

// Middleware to check admin authentication
async function checkAdminAuth() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return { error: 'Unauthorized', status: 401 };
        }

        const decoded = verifyToken(token.value);
        if (!decoded) {
            return { error: 'Invalid token', status: 401 };
        }

        await connectDB();
        const user = await User.findById(decoded.userId);

        if (!user || !user.isAdmin) {
            return { error: 'Admin access required', status: 403 };
        }

        return { userId: decoded.userId };
    } catch (error) {
        console.error('Admin auth error:', error);
        return { error: 'Internal server error', status: 500 };
    }
}

// Fetch Shiprocket auth token
async function getShiprocketToken() {
    try {
        const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: process.env.SHIPROCKET_EMAIL,
                password: process.env.SHIPROCKET_PASSWORD
            })
        });

        if (!response.ok) {
            throw new Error('Failed to authenticate with Shiprocket');
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Shiprocket auth error:', error);
        throw error;
    }
}

// Fetch tracking info from Shiprocket
async function fetchShiprocketTracking(shipmentId, awbCode) {
    try {
        const token = await getShiprocketToken();
        
        let url;
        let response;

        // Try with shipment ID first
        if (shipmentId) {
            url = `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`;
            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        }

        // If shipment ID fails, try with AWB code
        if ((!response || !response.ok) && awbCode) {
            url = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`;
            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        }

        if (!response || !response.ok) {
            throw new Error('Failed to fetch tracking from Shiprocket');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Shiprocket tracking fetch error:', error);
        throw error;
    }
}

// Parse Shiprocket's date format
function parseShiprocketDate(dateStr) {
    if (!dateStr) return new Date();
    try {
        const parts = dateStr.split(' ');
        if (parts.length >= 3) {
            const [day, month, year, time] = parts;
            return new Date(`${year}-${month}-${day}${time ? ' ' + time : ''}`);
        }
        return new Date(dateStr);
    } catch (e) {
        return new Date();
    }
}

// Status mapping (same as webhook)
const statusMapping = {
    1: { shipping: 'processing', order: 'processing' },
    2: { shipping: 'processing', order: 'processing' },
    3: { shipping: 'processing', order: 'processing' },
    4: { shipping: 'processing', order: 'processing' },
    5: { shipping: 'processing', order: 'processing' },
    6: { shipping: 'shipped', order: 'shipped' },
    7: { shipping: 'delivered', order: 'delivered' },
    8: { shipping: 'cancelled', order: 'cancelled' },
    9: { shipping: 'cancelled', order: 'cancelled' },
    10: { shipping: 'cancelled', order: 'cancelled' },
    11: { shipping: 'cancelled', order: 'cancelled' },
    12: { shipping: 'cancelled', order: 'cancelled' },
    13: { shipping: 'shipped', order: 'shipped' },
    14: { shipping: 'shipped', order: 'shipped' },
    15: { shipping: 'shipped', order: 'shipped' },
    16: { shipping: 'pending', order: 'pending' },
    17: { shipping: 'shipped', order: 'shipped' },
    18: { shipping: 'shipped', order: 'shipped' },
    19: { shipping: 'shipped', order: 'shipped' },
    20: { shipping: 'shipped', order: 'shipped' },
    21: { shipping: 'cancelled', order: 'cancelled' },
    38: { shipping: 'shipped', order: 'shipped' },
    42: { shipping: 'shipped', order: 'shipped' },
    43: { shipping: 'cancelled', order: 'cancelled' },
    44: { shipping: 'cancelled', order: 'cancelled' },
    45: { shipping: 'cancelled', order: 'cancelled' },
    46: { shipping: 'cancelled', order: 'cancelled' },
};

export async function POST(req, context) {
    const params = await context.params;
    
    try {
        // Check admin authentication
        const authResult = await checkAdminAuth();
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { orderId } = params;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if order has shipping info
        if (!order.shipping.shipmentId && !order.shipping.awbCode) {
            return NextResponse.json(
                { error: 'Order has no shipment information to sync' },
                { status: 400 }
            );
        }

        console.log(`🔄 Manually syncing tracking for order ${order.orderNumber}...`);

        // Fetch latest tracking from Shiprocket
        const trackingData = await fetchShiprocketTracking(
            order.shipping.shipmentId,
            order.shipping.awbCode
        );

        console.log('📦 Shiprocket tracking data:', JSON.stringify(trackingData, null, 2));

        // Extract tracking info
        const tracking = trackingData.tracking_data || trackingData;
        
        if (!tracking) {
            return NextResponse.json(
                { error: 'No tracking data available from Shiprocket' },
                { status: 404 }
            );
        }

        // Extract status information
        const {
            shipment_status_id,
            current_status_id,
            shipment_status,
            current_status,
            awb_code,
            courier_name,
            etd,
            scans = []
        } = tracking;

        const statusCode = shipment_status_id || current_status_id;
        const statusLabel = shipment_status || current_status;

        // Prepare update data
        const updateData = {
            'shipping.lastUpdateAt': new Date()
        };

        // Update status
        if (statusCode && statusMapping[statusCode]) {
            const oldStatus = order.status;
            const newStatus = statusMapping[statusCode].order;
            
            updateData['shipping.status'] = statusMapping[statusCode].shipping;
            updateData['status'] = newStatus;

            console.log(`📊 Status Sync: ${oldStatus} → ${newStatus}`);
            console.log(`   Status Code: ${statusCode} (${statusLabel})`);
        }

        // Update AWB and courier if available
        if (awb_code) {
            updateData['shipping.awbCode'] = awb_code;
        }
        if (courier_name) {
            updateData['shipping.courier'] = courier_name;
        }
        if (etd) {
            updateData['shipping.estimatedDelivery'] = parseShiprocketDate(etd);
        }

        // Update current location from latest scan
        if (scans && scans.length > 0) {
            const latestScan = scans[scans.length - 1];
            updateData['shipping.currentLocation'] = latestScan.location || statusLabel;

            // Add tracking history
            const trackingEntries = scans.map(scan => ({
                activity: scan.activity,
                location: scan.location,
                timestamp: parseShiprocketDate(scan.date),
                statusCode: scan['sr-status'],
                statusLabel: scan['sr-status-label'],
                scanStatus: scan.status
            }));

            // Replace entire tracking history with fresh data
            updateData['shipping.trackingHistory'] = trackingEntries;
        }

        // Update the order
        await Order.findByIdAndUpdate(order._id, updateData);

        console.log(`✅ Order ${order.orderNumber} synced successfully!`);

        // Fetch updated order
        const updatedOrder = await Order.findById(order._id);

        return NextResponse.json({
            success: true,
            message: 'Tracking synced successfully',
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                previousStatus: order.status,
                newStatus: updatedOrder.status,
                statusCode,
                statusLabel,
                tracking: trackingData
            }
        });

    } catch (error) {
        console.error('Error syncing tracking:', error);
        return NextResponse.json(
            { 
                error: 'Failed to sync tracking',
                message: error.message,
                details: error.response?.data || error.toString()
            },
            { status: 500 }
        );
    }
}
