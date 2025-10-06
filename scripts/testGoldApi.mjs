// Test script for Gold Price API
// Run with: node scripts/testGoldApi.js

import { fetchLiveGoldPrice, calculateJewelryPrice } from '../lib/goldPrice.js';

async function testGoldPriceAPI() {
    console.log('🧪 Testing Gold Price API...\n');
    
    try {
        // Test 1: Fetch live gold price
        console.log('📊 Fetching live gold prices...');
        const goldData = await fetchLiveGoldPrice('USD');
        
        if (goldData.success) {
            console.log('✅ Gold price fetch successful!');
            console.log(`💰 Gold price: $${goldData.perGram.gold.toFixed(2)}/gram`);
            console.log(`⏰ Last updated: ${goldData.lastUpdated}`);
            console.log(`🔄 Using fallback: ${goldData.fallback ? 'Yes' : 'No'}\n`);
        } else {
            console.log('❌ Gold price fetch failed');
            return;
        }

        // Test 2: Calculate jewelry price
        console.log('🧮 Testing jewelry price calculation...');
        const calculation = await calculateJewelryPrice({
            goldWeight: 5.5, // 5.5 grams
            goldPurity: 22,  // 22K gold
            makingChargePercent: 15,
            gstPercent: 3,
            currency: 'USD'
        });

        if (calculation.success) {
            console.log('✅ Price calculation successful!');
            console.log(`📏 Gold weight: ${calculation.breakdown.goldWeight}g`);
            console.log(`🏆 Gold purity: ${calculation.breakdown.goldPurity}K`);
            console.log(`💎 Pure gold value: $${calculation.breakdown.pureGoldValue}`);
            console.log(`🔨 Making charges: $${calculation.breakdown.makingCharges}`);
            console.log(`💰 Final price: $${calculation.breakdown.finalPrice}`);
        } else {
            console.log('❌ Price calculation failed:', calculation.error);
        }

    } catch (error) {
        console.error('🚨 Test failed:', error.message);
    }
}

// Run the test
testGoldPriceAPI();