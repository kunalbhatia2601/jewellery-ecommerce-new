import Razorpay from 'razorpay';

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in smallest currency unit (paise for INR)
 * @param {string} currency - Currency code (default: INR)
 * @param {object} notes - Additional notes for the order
 * @returns {Promise<object>} Razorpay order object
 */
export async function createRazorpayOrder(amount, currency = 'INR', notes = {}) {
    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: `receipt_${Date.now()}`,
            notes,
        };

        const order = await razorpayInstance.orders.create(options);
        return order;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw new Error('Failed to create payment order');
    }
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} Whether signature is valid
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(orderId + '|' + paymentId)
        .digest('hex');
    
    return generated_signature === signature;
}

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Payment details
 */
export async function fetchPaymentDetails(paymentId) {
    try {
        const payment = await razorpayInstance.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Error fetching payment details:', error);
        throw new Error('Failed to fetch payment details');
    }
}

/**
 * Create a refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund in smallest currency unit (optional, full refund if not specified)
 * @returns {Promise<object>} Refund object
 */
export async function createRefund(paymentId, amount = null) {
    try {
        console.log('🔄 Initiating Razorpay refund...');
        console.log('   Payment ID:', paymentId);
        console.log('   Amount:', amount ? `₹${amount}` : 'Full refund');
        console.log('   Using Key ID:', process.env.RAZORPAY_KEY_ID);
        
        const options = amount ? { amount: Math.round(amount * 100) } : {};
        
        console.log('📤 Calling Razorpay API with options:', options);
        const refund = await razorpayInstance.payments.refund(paymentId, options);
        
        console.log('✅ Razorpay refund response:', JSON.stringify(refund, null, 2));
        
        return refund;
    } catch (error) {
        console.error('❌ Razorpay refund error:', error);
        console.error('Error details:', {
            message: error.message,
            statusCode: error.statusCode,
            error: error.error
        });
        
        // Re-throw with more context
        const errorMessage = error.error?.description || error.message || 'Failed to create refund';
        throw new Error(`Razorpay Refund Failed: ${errorMessage}`);
    }
}

