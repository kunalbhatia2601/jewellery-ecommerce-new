# Gold Price Integration Documentation

## Overview

This documentation covers the comprehensive gold price integration system implemented in the jewelry e-commerce platform. The system provides real-time gold pricing, dynamic product pricing, and administrative tools for price management.

## Features

### 🌟 Core Features
- **Live Gold Prices**: Real-time precious metal prices from international markets
- **Dynamic Product Pricing**: Automatic price calculation based on gold rates
- **Multi-Currency Support**: USD, INR, EUR, GBP pricing
- **Admin Dashboard**: Complete price management interface
- **Price History**: Track price changes over time
- **Fallback System**: Ensures availability even when API is down

### 📊 Supported Metals
- Gold (XAU)
- Silver (XAG)
- Platinum (XPT)
- Palladium (XPD)

## API Configuration

### Environment Variables
```env
# Add to your .env.local file
METALS_API_KEY=your_metals_api_key_here
```

### Get Your API Key
1. Sign up at [Metals-API.com](https://metals-api.com/)
2. Get your free API key (100 requests/month)
3. For production, upgrade to a paid plan

## System Architecture

### Core Files

#### 1. **lib/goldPrice.js**
Main utility for gold price operations:
- `fetchLiveGoldPrice(currency)` - Fetch live rates
- `calculateJewelryPrice(params)` - Calculate jewelry pricing
- `getCachedGoldPrice()` - Get cached data
- `clearPriceCache()` - Clear cache

#### 2. **app/api/gold-price/route.js**
API endpoints for gold price operations:
- `GET /api/gold-price` - Get current gold prices
- `POST /api/gold-price` - Calculate jewelry pricing

#### 3. **models/Product.js**
Enhanced product schema with dynamic pricing:
```javascript
{
  goldWeight: Number,        // Weight in grams
  goldPurity: Number,        // 10K, 14K, 18K, 22K, 24K
  makingChargePercent: Number, // Making charge percentage
  isDynamicPricing: Boolean,   // Enable dynamic pricing
  stoneValue: Number,          // Diamond/stone value
  pricingMethod: String,       // 'fixed' or 'dynamic'
  lastPriceUpdate: Date,       // Last price update
  priceHistory: Array          // Historical price data
}
```

## Usage Examples

### 1. Fetch Live Gold Price
```javascript
import { fetchLiveGoldPrice } from '@/lib/goldPrice';

const goldData = await fetchLiveGoldPrice('USD');
console.log(`Gold: $${goldData.perGram.gold}/gram`);
```

### 2. Calculate Jewelry Price
```javascript
import { calculateJewelryPrice } from '@/lib/goldPrice';

const calculation = await calculateJewelryPrice({
  goldWeight: 5.5,              // 5.5 grams
  goldPurity: 22,               // 22K gold
  makingChargePercent: 15,      // 15% making charge
  gstPercent: 3,                // 3% GST
  currency: 'USD'
});

console.log(`Final Price: $${calculation.breakdown.finalPrice}`);
```

### 3. API Endpoints Usage
```javascript
// Get live gold prices
const response = await fetch('/api/gold-price?currency=USD&cache=true');
const data = await response.json();

// Calculate jewelry price
const calculation = await fetch('/api/gold-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    goldWeight: 5.5,
    goldPurity: 22,
    makingChargePercent: 15,
    gstPercent: 3,
    currency: 'USD'
  })
});
```

## Admin Interface

### Gold Price Dashboard
- **Location**: `/admin/gold-prices`
- **Features**:
  - Live precious metal prices
  - Currency conversion
  - Auto-refresh every 5 minutes
  - Price change indicators
  - Fallback status display

### Dynamic Product Creation
- **Enhanced Product Form**: Supports both fixed and dynamic pricing
- **Gold Specifications**: Weight, purity, making charges
- **Real-time Calculation**: Instant price updates
- **Stone Value**: Additional value for diamonds/stones

### Bulk Price Updates
- **API Endpoint**: `/api/admin/products/update-prices`
- **Features**:
  - Update all dynamic products
  - Update specific products
  - Price change tracking
  - Error handling

## Price Calculation Formula

### Basic Formula
```
Pure Gold Value = Gold Weight × Gold Price per Gram × Purity Multiplier
Making Charges = Pure Gold Value × Making Charge Percentage
Subtotal = Pure Gold Value + Making Charges
GST Amount = Subtotal × GST Percentage
Final Price = Subtotal + GST Amount + Stone Value
```

### Example Calculation
```
Gold Weight: 5.5g
Gold Purity: 22K (91.7% pure)
Gold Price: $65/gram
Making Charge: 15%
GST: 3%
Stone Value: $50

Pure Gold Value = 5.5 × $65 × 0.917 = $327.58
Making Charges = $327.58 × 0.15 = $49.14
Subtotal = $327.58 + $49.14 = $376.72
GST = $376.72 × 0.03 = $11.30
Final Price = $376.72 + $11.30 + $50 = $438.02
```

## Components

### 1. GoldPriceDashboard
```jsx
import GoldPriceDashboard from '@/app/components/GoldPriceDashboard';

<GoldPriceDashboard />
```

### 2. JewelryPriceCalculator
```jsx
import JewelryPriceCalculator from '@/app/components/JewelryPriceCalculator';

<JewelryPriceCalculator 
  onPriceCalculated={(data) => console.log(data)} 
/>
```

## Error Handling

### API Fallback System
- **Primary**: Metals-API.com
- **Fallback**: Hardcoded prices when API fails
- **Caching**: 5-minute cache to reduce API calls
- **Indicators**: Clear fallback status display

### Error Scenarios
1. **API Key Missing**: Uses fallback prices
2. **API Rate Limit**: Uses cached data
3. **Network Issues**: Falls back to local prices
4. **Invalid Parameters**: Returns validation errors

## Testing

### Test Endpoints
```bash
# Test gold price fetching
GET /api/test-gold?test=price

# Test jewelry calculation
GET /api/test-gold?test=calculate

# Test admin product price updates
POST /api/admin/products/update-prices
```

### Test Data
Use the following test parameters:
- Gold Weight: 5.5 grams
- Gold Purity: 22K
- Making Charge: 15%
- GST: 3%
- Stone Value: $50

## Performance Optimization

### Caching Strategy
- **In-Memory Cache**: 5-minute price cache
- **API Rate Limiting**: Prevents excessive API calls
- **Database Optimization**: Indexed queries for products
- **Client-Side Caching**: Browser caching for static data

### Best Practices
1. **Debounce Calculations**: Prevent excessive calculations
2. **Lazy Loading**: Load components on demand
3. **Error Boundaries**: Graceful error handling
4. **Loading States**: User-friendly loading indicators

## Security

### Admin Protection
- **JWT Authentication**: Secure admin routes
- **Role-Based Access**: Admin-only endpoints
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent API abuse

### Data Privacy
- **No Sensitive Data**: No personal financial data stored
- **Secure Transmission**: HTTPS for all communications
- **Environment Variables**: Secure API key storage

## Deployment

### Environment Setup
1. Add `METALS_API_KEY` to production environment
2. Configure fallback prices for your region
3. Set up monitoring for API health
4. Configure caching strategy

### Production Considerations
- **API Limits**: Monitor usage against plan limits
- **Fallback Updates**: Regularly update fallback prices
- **Performance Monitoring**: Track API response times
- **Error Alerting**: Set up alerts for API failures

## Maintenance

### Regular Tasks
1. **Update Fallback Prices**: Monthly price updates
2. **Monitor API Usage**: Track against limits
3. **Review Price History**: Analyze pricing trends
4. **Update Exchange Rates**: For multi-currency support

### Troubleshooting
- **API Issues**: Check API key and limits
- **Calculation Errors**: Verify input parameters
- **Cache Issues**: Clear cache if needed
- **Performance**: Monitor response times

## Support

### Common Issues
1. **Prices Not Updating**: Check API key and network
2. **Incorrect Calculations**: Verify parameters
3. **Cache Problems**: Clear cache and refresh
4. **Admin Access**: Verify authentication

### Documentation Links
- [Metals-API Documentation](https://metals-api.com/documentation)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [MongoDB Schema Design](https://mongoosejs.com/docs/guide.html)

---

*This system provides a robust, scalable solution for dynamic jewelry pricing based on real-time precious metal rates. The fallback system ensures reliability, while the admin interface provides complete control over pricing strategies.*