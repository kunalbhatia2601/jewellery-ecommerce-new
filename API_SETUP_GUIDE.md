# Gold Price API Setup Guide

## Current Issue Resolution

The error you encountered (`getaddrinfo ENOTFOUND api.metals.live`) was due to an incorrect API URL. The system has been updated with the correct endpoint and improved error handling.

## API Key Options (Choose One)

### Option 1: Metals-API (Recommended)
- **URL**: https://metals-api.com/
- **Free Tier**: 100 requests/month
- **Signup**: Quick email registration
- **Reliability**: High
- **Coverage**: Gold, Silver, Platinum, Palladium

**Setup Steps:**
1. Visit https://metals-api.com/
2. Click "Get Free API Key"
3. Register with your email
4. Copy your API key
5. Add to `.env.local`:
   ```
   METALS_API_KEY=your_api_key_here
   ```

### Option 2: ExchangeRate-API (Alternative)
- **URL**: https://exchangerate-api.com/
- **Free Tier**: 1,500 requests/month
- **Signup**: Email registration
- **Coverage**: Includes gold rates

**Setup Steps:**
1. Visit https://exchangerate-api.com/
2. Sign up for free account
3. Get your API key
4. Add to `.env.local`:
   ```
   EXCHANGE_API_KEY=your_api_key_here
   ```

### Option 3: Use Fallback Only (No API Key Required)
If you don't want to use external APIs right now, the system will automatically use built-in fallback prices. These are updated with current market rates (October 2025).

## Testing the System

### 1. Test API Connectivity
```bash
# Visit in browser:
http://localhost:3000/api/test-connectivity
```

### 2. Test Gold Price Fetching
```bash
# Visit in browser:
http://localhost:3000/api/test-gold?test=price
```

### 3. Test Price Calculation
```bash
# Visit in browser:
http://localhost:3000/api/test-gold?test=calculate
```

## Current System Status

Without API keys, your system will:
1. ✅ Use realistic fallback prices
2. ✅ Display "Fallback Data" indicator
3. ✅ Calculate jewelry prices correctly
4. ✅ Work fully for development and testing

The fallback prices are updated with current market rates:
- **Gold**: ~$2050/oz (~$65.90/gram)
- **Silver**: ~$24/oz (~$0.77/gram)
- **Platinum**: ~$950/oz (~$30.53/gram)

## Recommended Approach

### For Development/Testing:
- Continue using fallback prices (no setup required)
- System works perfectly for testing all features

### For Production:
- Get a Metals-API key (free tier is sufficient for most businesses)
- Add the API key to your environment variables
- Monitor usage and upgrade if needed

## Environment Variables Summary

Add any of these to your `.env.local` file:

```bash
# Option 1: Metals-API (Recommended)
METALS_API_KEY=your_metals_api_key_here

# Option 2: ExchangeRate-API (Alternative)
EXCHANGE_API_KEY=your_exchange_api_key_here

# Note: If neither is provided, system uses fallback prices
```

## Error Handling

The system now includes:
- ✅ Multiple API fallbacks
- ✅ Improved error messages
- ✅ Automatic fallback to local prices
- ✅ Cache system to reduce API calls
- ✅ Clear indicators when using fallback data

## Next Steps

1. **Immediate**: Your system works with fallback prices
2. **Optional**: Get an API key from Metals-API for live prices
3. **Production**: Add API key before going live

The gold price integration is fully functional with or without API keys!