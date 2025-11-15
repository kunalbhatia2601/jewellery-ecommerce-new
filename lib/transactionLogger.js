/**
 * Transaction Logger Utility
 * Logs all critical transaction events for audit and debugging
 */

import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const TRANSACTION_LOG_FILE = path.join(LOG_DIR, 'transactions.log');

// Ensure log directory exists
if (typeof window === 'undefined') {
    try {
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }
    } catch (error) {
        console.error('Failed to create log directory:', error);
    }
}

/**
 * Log levels
 */
export const LogLevel = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL',
    SUCCESS: 'SUCCESS'
};

/**
 * Transaction types
 */
export const TransactionType = {
    ORDER_CREATED: 'ORDER_CREATED',
    PAYMENT_CAPTURED: 'PAYMENT_CAPTURED',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    SHIPMENT_CREATED: 'SHIPMENT_CREATED',
    SHIPMENT_FAILED: 'SHIPMENT_FAILED',
    REFUND_INITIATED: 'REFUND_INITIATED',
    REFUND_SUCCESS: 'REFUND_SUCCESS',
    REFUND_FAILED: 'REFUND_FAILED',
    ORDER_CANCELLED: 'ORDER_CANCELLED',
    STOCK_UPDATED: 'STOCK_UPDATED',
    MANUAL_INTERVENTION: 'MANUAL_INTERVENTION'
};

/**
 * Format log entry
 */
function formatLogEntry(level, type, message, data = {}) {
    const timestamp = new Date().toISOString();
    const entry = {
        timestamp,
        level,
        type,
        message,
        data,
        environment: process.env.NODE_ENV || 'development'
    };
    
    return JSON.stringify(entry);
}

/**
 * Write to log file (server-side only)
 */
function writeToFile(entry) {
    if (typeof window !== 'undefined') return; // Skip on client-side
    
    try {
        fs.appendFileSync(TRANSACTION_LOG_FILE, entry + '\n', 'utf8');
    } catch (error) {
        console.error('Failed to write to transaction log:', error);
    }
}

/**
 * Log a transaction event
 */
export function logTransaction(level, type, message, data = {}) {
    const entry = formatLogEntry(level, type, message, data);
    
    // Console output with emoji
    const emoji = {
        [LogLevel.INFO]: 'ℹ️',
        [LogLevel.WARNING]: '⚠️',
        [LogLevel.ERROR]: '❌',
        [LogLevel.CRITICAL]: '🚨',
        [LogLevel.SUCCESS]: '✅'
    };
    
    console.log(`${emoji[level] || '📝'} [${type}] ${message}`);
    if (Object.keys(data).length > 0) {
        console.log('   Data:', JSON.stringify(data, null, 2));
    }
    
    // Write to file
    writeToFile(entry);
}

/**
 * Log order creation
 */
export function logOrderCreated(orderNumber, userId, totalAmount, paymentMethod) {
    logTransaction(
        LogLevel.INFO,
        TransactionType.ORDER_CREATED,
        `Order ${orderNumber} created`,
        { orderNumber, userId, totalAmount, paymentMethod }
    );
}

/**
 * Log payment capture
 */
export function logPaymentCaptured(orderNumber, paymentId, amount) {
    logTransaction(
        LogLevel.SUCCESS,
        TransactionType.PAYMENT_CAPTURED,
        `Payment captured for order ${orderNumber}`,
        { orderNumber, paymentId, amount }
    );
}

/**
 * Log shipment creation
 */
export function logShipmentCreated(orderNumber, shiprocketOrderId, courierName) {
    logTransaction(
        LogLevel.SUCCESS,
        TransactionType.SHIPMENT_CREATED,
        `Shipment created for order ${orderNumber}`,
        { orderNumber, shiprocketOrderId, courierName }
    );
}

/**
 * Log shipment failure
 */
export function logShipmentFailed(orderNumber, error, paymentStatus) {
    logTransaction(
        LogLevel.ERROR,
        TransactionType.SHIPMENT_FAILED,
        `Shipment creation failed for order ${orderNumber}`,
        { orderNumber, error: error.message, paymentStatus }
    );
}

/**
 * Log refund initiation
 */
export function logRefundInitiated(orderNumber, paymentId, amount, reason) {
    logTransaction(
        LogLevel.WARNING,
        TransactionType.REFUND_INITIATED,
        `Refund initiated for order ${orderNumber}`,
        { orderNumber, paymentId, amount, reason }
    );
}

/**
 * Log successful refund
 */
export function logRefundSuccess(orderNumber, refundId, amount) {
    logTransaction(
        LogLevel.SUCCESS,
        TransactionType.REFUND_SUCCESS,
        `Refund successful for order ${orderNumber}`,
        { orderNumber, refundId, amount }
    );
}

/**
 * Log refund failure
 */
export function logRefundFailed(orderNumber, paymentId, amount, error) {
    logTransaction(
        LogLevel.CRITICAL,
        TransactionType.REFUND_FAILED,
        `Refund FAILED for order ${orderNumber} - MANUAL INTERVENTION REQUIRED`,
        { orderNumber, paymentId, amount, error: error.message }
    );
}

/**
 * Log order cancellation
 */
export function logOrderCancelled(orderNumber, reason, refunded = false) {
    logTransaction(
        LogLevel.INFO,
        TransactionType.ORDER_CANCELLED,
        `Order ${orderNumber} cancelled`,
        { orderNumber, reason, refunded }
    );
}

/**
 * Log manual intervention requirement
 */
export function logManualInterventionRequired(orderNumber, issue, details) {
    logTransaction(
        LogLevel.CRITICAL,
        TransactionType.MANUAL_INTERVENTION,
        `MANUAL INTERVENTION REQUIRED for order ${orderNumber}`,
        { orderNumber, issue, details }
    );
}

/**
 * Get recent transaction logs (for admin dashboard)
 */
export function getRecentTransactions(limit = 100) {
    if (typeof window !== 'undefined') return []; // Skip on client-side
    
    try {
        if (!fs.existsSync(TRANSACTION_LOG_FILE)) {
            return [];
        }
        
        const content = fs.readFileSync(TRANSACTION_LOG_FILE, 'utf8');
        const lines = content.trim().split('\n').filter(line => line);
        const recent = lines.slice(-limit);
        
        return recent.map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        }).filter(Boolean);
        
    } catch (error) {
        console.error('Failed to read transaction log:', error);
        return [];
    }
}

/**
 * Get transactions by order number
 */
export function getTransactionsByOrder(orderNumber) {
    if (typeof window !== 'undefined') return [];
    
    try {
        if (!fs.existsSync(TRANSACTION_LOG_FILE)) {
            return [];
        }
        
        const content = fs.readFileSync(TRANSACTION_LOG_FILE, 'utf8');
        const lines = content.trim().split('\n').filter(line => line);
        
        return lines.map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        })
        .filter(entry => entry && entry.data?.orderNumber === orderNumber);
        
    } catch (error) {
        console.error('Failed to read transaction log:', error);
        return [];
    }
}

const transactionLogger = {
    logTransaction,
    logOrderCreated,
    logPaymentCaptured,
    logShipmentCreated,
    logShipmentFailed,
    logRefundInitiated,
    logRefundSuccess,
    logRefundFailed,
    logOrderCancelled,
    logManualInterventionRequired,
    getRecentTransactions,
    getTransactionsByOrder,
    LogLevel,
    TransactionType
};

export default transactionLogger;
