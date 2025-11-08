import { NextResponse } from 'next/server';

/**
 * Test webhook endpoint that captures EVERYTHING
 * Use this to see what Shiprocket is sending
 */

let webhookLog = [];
const MAX_LOGS = 100;

export async function GET(request) {
    return NextResponse.json({
        success: true,
        count: webhookLog.length,
        webhooks: webhookLog,
        instructions: {
            message: 'This endpoint captures all POST requests',
            usage: 'Add this as a webhook in Shiprocket to see what they send',
            url: 'https://www.nandikajewellers.in/api/test-webhook',
            note: 'Data is stored in memory and will be cleared on server restart'
        }
    });
}

export async function POST(request) {
    try {
        const timestamp = new Date().toISOString();
        const body = await request.json();
        
        // Capture all headers
        const headers = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });
        
        // Log to console
        console.log('\n' + '🧪'.repeat(40));
        console.log('🧪 TEST WEBHOOK RECEIVED');
        console.log('⏰ Time:', timestamp);
        console.log('📦 Payload:', JSON.stringify(body, null, 2));
        console.log('📋 Headers:', JSON.stringify(headers, null, 2));
        console.log('🧪'.repeat(40) + '\n');
        
        // Store in memory
        webhookLog.unshift({
            timestamp,
            payload: body,
            headers,
            url: request.url,
            method: request.method
        });
        
        // Keep only last MAX_LOGS
        if (webhookLog.length > MAX_LOGS) {
            webhookLog = webhookLog.slice(0, MAX_LOGS);
        }
        
        // ALWAYS return 200 (Shiprocket requirement)
        return new Response(null, { 
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    } catch (error) {
        console.error('❌ Test webhook error:', error);
        // Still return 200
        return new Response(null, { status: 200 });
    }
}

export async function OPTIONS(request) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}

export async function DELETE(request) {
    // Clear all logs
    webhookLog = [];
    return NextResponse.json({
        success: true,
        message: 'All webhook logs cleared'
    });
}
