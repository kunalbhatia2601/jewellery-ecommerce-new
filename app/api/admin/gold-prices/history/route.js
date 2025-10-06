import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // For now, we'll return mock historical data
    // In a real implementation, you would store historical prices in the database
    const mockHistoricalData = generateMockHistoricalData();

    return NextResponse.json({
      success: true,
      data: mockHistoricalData,
      message: 'Historical gold price data retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

function generateMockHistoricalData() {
  const now = new Date();
  const data = [];
  
  // Generate data for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Base price around 6000 INR per gram with some variation
    const basePrice = 6000;
    const variation = Math.sin(i * 0.1) * 200 + Math.random() * 100 - 50;
    const price = basePrice + variation;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
      change: i > 0 ? Math.round((Math.random() * 6 - 3) * 100) / 100 : 0,
      volume: Math.round(Math.random() * 1000 + 500)
    });
  }
  
  return {
    period: '30 days',
    currency: 'INR',
    unit: 'per gram',
    prices: data,
    summary: {
      current: data[data.length - 1].price,
      highest: Math.max(...data.map(d => d.price)),
      lowest: Math.min(...data.map(d => d.price)),
      average: data.reduce((sum, d) => sum + d.price, 0) / data.length,
      totalChange: data[data.length - 1].price - data[0].price,
      totalChangePercent: ((data[data.length - 1].price - data[0].price) / data[0].price * 100)
    }
  };
}