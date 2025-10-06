import { NextResponse } from 'next/server';
import { fetchLiveGoldPrice, calculateJewelryPrice } from '@/lib/goldPrice';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get('test') || 'price';

  try {
    if (test === 'price') {
      // Test gold price fetching
      const goldData = await fetchLiveGoldPrice('INR');
      
      return NextResponse.json({
        success: true,
        test: 'Gold Price API',
        data: goldData,
        status: goldData.success ? 'Working' : 'Failed'
      });
    }
    
    if (test === 'calculate') {
      // Test jewelry price calculation
      const calculation = await calculateJewelryPrice({
        goldWeight: 5.5,
        goldPurity: 22,
        makingChargePercent: 15,
        gstPercent: 3,
        currency: 'INR'
      });

      return NextResponse.json({
        success: true,
        test: 'Jewelry Price Calculation',
        data: calculation,
        status: calculation.success ? 'Working' : 'Failed'
      });
    }

    return NextResponse.json({
      success: true,
      availableTests: [
        'price - Test gold price fetching',
        'calculate - Test jewelry price calculation'
      ],
      usage: '/api/test-gold?test=price or /api/test-gold?test=calculate'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}