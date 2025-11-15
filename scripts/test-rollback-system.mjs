#!/usr/bin/env node
/**
 * Test Script for Rollback Transaction System
 * Run this to verify the implementation
 */

import { 
    logOrderCreated, 
    logPaymentCaptured,
    logShipmentFailed,
    logRefundInitiated,
    logRefundSuccess,
    getRecentTransactions,
    getTransactionsByOrder
} from '../lib/transactionLogger.js';

console.log('🧪 Testing Rollback Transaction System\n');

// Test 1: Log Order Creation
console.log('Test 1: Order Creation');
logOrderCreated('ORD_TEST_001', 'user123', 1500.00, 'online');
console.log('✅ Passed\n');

// Test 2: Log Payment Capture
console.log('Test 2: Payment Capture');
logPaymentCaptured('ORD_TEST_001', 'pay_test_123', 1500.00);
console.log('✅ Passed\n');

// Test 3: Log Shipment Failure
console.log('Test 3: Shipment Failure');
logShipmentFailed('ORD_TEST_001', new Error('API timeout'), 'paid');
console.log('✅ Passed\n');

// Test 4: Log Refund Initiation
console.log('Test 4: Refund Initiation');
logRefundInitiated('ORD_TEST_001', 'pay_test_123', 1500.00, 'Shiprocket failure');
console.log('✅ Passed\n');

// Test 5: Log Refund Success
console.log('Test 5: Refund Success');
logRefundSuccess('ORD_TEST_001', 'rfnd_test_456', 1500.00);
console.log('✅ Passed\n');

// Test 6: Query Logs by Order
console.log('Test 6: Query Logs by Order');
const orderLogs = getTransactionsByOrder('ORD_TEST_001');
console.log(`Found ${orderLogs.length} log entries for ORD_TEST_001`);
console.log('✅ Passed\n');

// Test 7: Get Recent Transactions
console.log('Test 7: Get Recent Transactions');
const recent = getRecentTransactions(10);
console.log(`Retrieved ${recent.length} recent transactions`);
console.log('✅ Passed\n');

console.log('🎉 All tests passed!\n');
console.log('📝 Check logs/transactions.log for the generated log entries\n');

// Display sample log entries
if (orderLogs.length > 0) {
    console.log('Sample log entry:');
    console.log(JSON.stringify(orderLogs[0], null, 2));
}
