import { NextResponse } from 'next/server';

/**
 * Test free APIs for gold prices
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const testApi = searchParams.get('api') || 'all';

  const results = {};

  // Test CoinGecko API (Free, no API key required)
  if (testApi === 'all' || testApi === 'coingecko') {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=gold&vs_currencies=usd,eur,gbp,inr&include_24hr_change=true');
      const data = await response.json();
      
      results.coingecko = {
        success: response.ok,
        status: response.status,
        data: data,
        available: !!data.gold,
        goldPriceUSD: data.gold?.usd,
        note: 'CoinGecko provides precious metals data for free'
      };
    } catch (error) {
      results.coingecko = {
        success: false,
        error: error.message
      };
    }
  }

  // Test Coinbase API (Free public rates)
  if (testApi === 'all' || testApi === 'coinbase') {
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD');
      const data = await response.json();
      
      results.coinbase = {
        success: response.ok,
        status: response.status,
        available: !!data.data,
        note: 'Coinbase exchange rates - can be used for currency conversion'
      };
    } catch (error) {
      results.coinbase = {
        success: false,
        error: error.message
      };
    }
  }

  // Test Alpha Vantage (Free tier available)
  if (testApi === 'all' || testApi === 'alphavantage') {
    try {
      // Note: This would need an API key, but has a free tier
      results.alphavantage = {
        success: false,
        note: 'Alpha Vantage has a free tier with API key - 5 requests per minute',
        signup: 'https://www.alphavantage.co/support/#api-key'
      };
    } catch (error) {
      results.alphavantage = {
        success: false,
        error: error.message
      };
    }
  }

  // Test a simple financial data aggregator
  if (testApi === 'all' || testApi === 'financial') {
    try {
      // This is a hypothetical free API - replace with actual working one
      results.financial = {
        success: false,
        note: 'Looking for reliable free financial APIs...'
      };
    } catch (error) {
      results.financial = {
        success: false,
        error: error.message
      };
    }
  }

  return NextResponse.json({
    message: 'Free API Testing Results',
    timestamp: new Date().toISOString(),
    results: results,
    recommendations: {
      best: 'CoinGecko - Free, no API key, includes precious metals',
      backup: 'Coinbase - Free exchange rates for currency conversion',
      premium: 'Alpha Vantage - Free tier with API key'
    }
  });
}