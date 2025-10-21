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
async function fetchShiprocketTracking(shipmentId, shiprocketOrderId, awbCode) {
    try {
        const token = await getShiprocketToken();
        
        let url;
        let response;

        // Try with Shipment ID first (most reliable, returns object format)
        if (shipmentId) {
            url = `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`;
            console.log(`🔍 Fetching tracking with Shipment ID: ${shipmentId}`);
            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Got tracking data from Shipment ID');
                return data;
            }
            console.log('⚠️ Failed to fetch with Shipment ID, trying Shiprocket Order ID...');
        }

        // Try with Shiprocket Order ID as fallback (returns array format)
        if (shiprocketOrderId) {
            url = `https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${shiprocketOrderId}`;
            console.log(`🔍 Fetching tracking with Shiprocket Order ID: ${shiprocketOrderId}`);
            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Got tracking data from Shiprocket Order ID');
                return data;
            }
            console.log('⚠️ Failed to fetch with Shiprocket Order ID, trying AWB...');
        }

        // If shipment ID fails, try with AWB code (only available after courier assignment)
        if (awbCode) {
            url = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`;
            console.log(`🔍 Fetching tracking with AWB: ${awbCode}`);
            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Got tracking data from AWB');
                return data;
            }
        }

        // All methods failed
        const errorDetails = response ? await response.text() : 'No response';
        console.error('❌ All tracking fetch methods failed:', errorDetails);
        throw new Error(`Failed to fetch tracking from Shiprocket. Tried: ${[
            shipmentId ? 'Shipment ID' : null,
            shiprocketOrderId ? 'Order ID' : null,
            awbCode ? 'AWB' : null
        ].filter(Boolean).join(', ')}`);
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

        // Check if order has shipping info (prioritize Shipment ID)
        if (!order.shipping.shipmentId && !order.shipping.shiprocketOrderId && !order.shipping.awbCode) {
            return NextResponse.json(
                { 
                    error: 'Order has no shipment information to sync',
                    details: 'Order must have at least one of: Shipment ID, Shiprocket Order ID, or AWB code'
                },
                { status: 400 }
            );
        }

        const orderDisplayId = order.orderNumber || order._id.toString().slice(-8).toUpperCase();
        console.log(`🔄 Manually syncing tracking for order ${orderDisplayId}...`);
        console.log(`📋 Available identifiers:`, {
            shipmentId: order.shipping.shipmentId,
            shiprocketOrderId: order.shipping.shiprocketOrderId,
            awbCode: order.shipping.awbCode
        });

        // Fetch latest tracking from Shiprocket (prioritize Shipment ID)
        const trackingData = await fetchShiprocketTracking(
            order.shipping.shipmentId,
            order.shipping.shiprocketOrderId,
            order.shipping.awbCode
        );

        console.log('📦 Shiprocket tracking data:', JSON.stringify(trackingData, null, 2));

        // Extract tracking info - handle nested structure
        let tracking;
        let rawData = trackingData;
        
        // STEP 1: Handle array wrapper (sometimes Shiprocket returns [{...}] instead of {...})
        if (Array.isArray(rawData) && rawData.length > 0) {
            console.log('⚠️ Response is wrapped in array, extracting first element...');
            rawData = rawData[0];
        }
        
        // STEP 2: Response can be in different formats:
        // Format 1: Direct - { tracking_data: {...} }
        // Format 2: Nested - { "shipmentId": { tracking_data: {...} } }
        // Format 3: Nested - { "orderId": { tracking_data: {...} } }
        
        if (rawData.tracking_data) {
            // Direct format
            tracking = rawData.tracking_data;
            console.log('✅ Using direct tracking_data format');
        } else if (order.shipping.shipmentId && rawData[order.shipping.shipmentId]) {
            // Nested with Shipment ID (priority)
            tracking = rawData[order.shipping.shipmentId].tracking_data;
            console.log(`✅ Using nested format with Shipment ID: ${order.shipping.shipmentId}`);
        } else if (order.shipping.shiprocketOrderId && rawData[order.shipping.shiprocketOrderId]) {
            // Nested with Shiprocket Order ID
            tracking = rawData[order.shipping.shiprocketOrderId].tracking_data;
            console.log(`✅ Using nested format with Shiprocket Order ID: ${order.shipping.shiprocketOrderId}`);
        } else if (order.shipping.awbCode && rawData[order.shipping.awbCode]) {
            // Nested with AWB code
            tracking = rawData[order.shipping.awbCode].tracking_data;
            console.log(`✅ Using nested format with AWB: ${order.shipping.awbCode}`);
        } else {
            // Try to find any key that has tracking_data
            const keys = Object.keys(rawData);
            console.log(`⚠️ Trying to find tracking_data in keys:`, keys);
            for (const key of keys) {
                if (rawData[key]?.tracking_data) {
                    tracking = rawData[key].tracking_data;
                    console.log(`✅ Found tracking_data in key: ${key}`);
                    break;
                }
            }
        }
        
        if (!tracking) {
            return NextResponse.json(
                { 
                    error: 'No tracking data available from Shiprocket',
                    rawResponse: trackingData
                },
                { status: 404 }
            );
        }

        // Check for error message (cancelled shipment)
        if (tracking.error) {
            console.log(`⚠️ Shiprocket error: ${tracking.error}`);
            
            // If shipment is cancelled, update status
            if (tracking.error.toLowerCase().includes('cancelled') || tracking.shipment_status === 8) {
                console.log('📋 Detected cancelled shipment, updating order status...');
                
                await Order.findByIdAndUpdate(order._id, {
                    'shipping.status': 'cancelled',
                    'status': 'cancelled',
                    'shipping.lastUpdateAt': new Date(),
                    'shipping.errorMessage': tracking.error
                });

                const updatedOrder = await Order.findById(order._id);
                
                return NextResponse.json({
                    success: true,
                    message: 'Shipment cancelled status synced',
                    data: {
                        orderId: order._id,
                        orderNumber: orderDisplayId,
                        previousStatus: order.status,
                        newStatus: 'cancelled',
                        statusCode: 8,
                        statusLabel: 'Cancelled',
                        errorMessage: tracking.error
                    }
                });
            }
            
            // For other errors (like "no activities found"), just log but continue processing
            console.log('ℹ️ Non-critical error, continuing with available data...');
        }

        // Extract status information
        const {
            shipment_status_id,
            shipment_status,
            track_status,
            awb_code,
            courier_name,
            edd,
            shipment_track = [],
            shipment_track_activities = []
        } = tracking;

        // Get scans from shipment_track_activities
        const scans = shipment_track_activities || [];

        // Use shipment_status as the status code (8 = Cancelled in your case)
        const statusCode = shipment_status_id || shipment_status || track_status;
        const statusLabel = tracking.current_status || (statusCode === 8 ? 'Cancelled' : 'Unknown');

        console.log(`📊 Status Info:`, {
            statusCode,
            statusLabel,
            shipment_status,
            shipment_status_id,
            track_status,
            hasError: !!tracking.error
        });

        // Check if we have any meaningful data to update
        if (!statusCode || statusCode === 0) {
            console.log('⚠️ No valid status code found in tracking data');
            
            // If there's a helpful error message, return it
            if (tracking.error) {
                return NextResponse.json({
                    success: false,
                    message: 'No tracking updates available yet',
                    data: {
                        orderId: order._id,
                        orderNumber: orderDisplayId,
                        currentStatus: order.status,
                        shiprocketMessage: tracking.error,
                        hint: 'Shipment may be newly created. Please try again in a few minutes.'
                    }
                }, { status: 200 }); // Return 200 but success: false
            }
        }

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

        console.log(`✅ Order ${orderDisplayId} synced successfully!`);

        // Fetch updated order
        const updatedOrder = await Order.findById(order._id);

        return NextResponse.json({
            success: true,
            message: 'Tracking synced successfully',
            data: {
                orderId: order._id,
                orderNumber: orderDisplayId,
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
