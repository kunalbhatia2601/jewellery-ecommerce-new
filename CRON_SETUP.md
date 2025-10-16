# Product Price Update Cron Job

Automatically updates product prices every 10 minutes based on live gold and silver market rates.

## 📋 Overview

This cron job:
- ✅ Fetches live gold & silver prices from IBJA (bullions.co.in)
- ✅ Updates all products with dynamic pricing enabled
- ✅ Recalculates MRP and selling prices based on metal weights
- ✅ Maintains discount percentages
- ✅ Logs all price changes
- ✅ Runs every 10 minutes

## 🚀 Setup Options

### Option 1: Vercel Cron (Recommended for Vercel deployments)

The project includes `vercel.json` with cron configuration.

**Steps:**
1. Deploy to Vercel
2. Add environment variable:
   ```bash
   CRON_SECRET=your-secret-key-here
   ```
3. Vercel will automatically run the cron job every 10 minutes

**How it works:**
- Vercel calls `/api/cron/update-prices` every 10 minutes
- Schedule: `*/10 * * * *` (every 10 minutes)

### Option 2: External Cron Service (cron-job.org, EasyCron, etc.)

Use an external service to call your API endpoint.

**Steps:**
1. Sign up for a cron service (e.g., cron-job.org)
2. Create a new cron job:
   - **URL:** `https://yourdomain.com/api/cron/update-prices`
   - **Schedule:** Every 10 minutes
   - **Method:** GET
   - **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`
3. Add to `.env.local`:
   ```bash
   CRON_SECRET=your-secret-key-here
   ```

### Option 3: System Cron (Linux/macOS servers)

For self-hosted deployments.

**Steps:**

1. Make the script executable:
   ```bash
   chmod +x scripts/cron-update-prices.mjs
   ```

2. Test the script:
   ```bash
   node scripts/cron-update-prices.mjs
   ```

3. Add to crontab:
   ```bash
   crontab -e
   ```

4. Add this line (replace with your project path):
   ```bash
   */10 * * * * cd /path/to/jewellery-ecommerce && node scripts/cron-update-prices.mjs >> logs/cron.log 2>&1
   ```

5. Create logs directory:
   ```bash
   mkdir -p logs
   ```

### Option 4: PM2 with node-cron (Node.js servers)

For Node.js deployments with PM2.

**Steps:**

1. Install dependencies:
   ```bash
   npm install node-cron
   ```

2. Create a cron server file `server/cron-server.js`:
   ```javascript
   const cron = require('node-cron');
   const fetch = require('node-fetch');

   // Run every 10 minutes
   cron.schedule('*/10 * * * *', async () => {
     try {
       console.log('Running price update cron job...');
       const response = await fetch('http://localhost:3000/api/cron/update-prices', {
         headers: {
           'Authorization': `Bearer ${process.env.CRON_SECRET}`
         }
       });
       const result = await response.json();
       console.log('Price update result:', result);
     } catch (error) {
       console.error('Cron job error:', error);
     }
   });

   console.log('Cron scheduler started');
   ```

3. Start with PM2:
   ```bash
   pm2 start server/cron-server.js --name price-cron
   pm2 save
   ```

## 🔒 Security

The cron endpoint is protected by a secret token.

**Setup:**

1. Generate a secure random string:
   ```bash
   openssl rand -base64 32
   ```

2. Add to `.env.local`:
   ```bash
   CRON_SECRET=your-generated-secret-here
   ```

3. When calling the endpoint, include the header:
   ```
   Authorization: Bearer your-generated-secret-here
   ```

**Note:** Without the correct secret, the endpoint returns `401 Unauthorized`.

## 📊 API Endpoint

**URL:** `/api/cron/update-prices`

**Methods:** GET, POST

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response:**
```json
{
  "success": true,
  "message": "Cron job completed: Updated 7 products, 0 errors",
  "updated": 7,
  "errors": 0,
  "totalProducts": 7,
  "timestamp": "2025-10-16T10:30:00.000Z",
  "currentPrices": {
    "gold": 7250.50,
    "silver": 96.25
  },
  "updates": [
    {
      "productId": "...",
      "name": "Classic Gold Earrings",
      "metalType": "gold",
      "oldMRP": 73000,
      "newMRP": 73500,
      "oldSellingPrice": 73000,
      "newSellingPrice": 73500,
      "mrpChange": 500,
      "sellingPriceChange": 500
    }
  ]
}
```

## 🧪 Testing

### Test Manually

Call the endpoint directly:

```bash
# Using curl
curl -X GET https://yourdomain.com/api/cron/update-prices \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Using the script
node scripts/cron-update-prices.mjs
```

### Test in Browser

1. Go to: `http://localhost:3000/api/cron/update-prices`
2. You should see a response (or 401 if CRON_SECRET is required)

### Check Logs

Monitor the cron job execution:

```bash
# System cron logs
tail -f logs/cron.log

# Vercel logs
vercel logs --follow

# PM2 logs
pm2 logs price-cron
```

## 📝 Environment Variables

Add these to `.env.local`:

```bash
# Required for price fetching
MONGODB_URI=your-mongodb-connection-string
GEMINI_API_KEY=your-gemini-api-key

# Optional for cron security
CRON_SECRET=your-secret-key

# Optional for script
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 🔍 Monitoring

### Check Which Products Have Dynamic Pricing

```javascript
// In MongoDB or via API
db.products.find({ 
  $or: [
    { pricingMethod: 'dynamic' },
    { isDynamicPricing: true }
  ]
})
```

### Enable Dynamic Pricing for Products

From the admin panel:
1. Go to `/admin/products`
2. Edit a product
3. Select "Dynamic Pricing" method
4. Enter metal weight, purity, and making charges
5. Save

## ⏱️ Cron Schedule Reference

```
*/10 * * * *  - Every 10 minutes
*/15 * * * *  - Every 15 minutes
*/30 * * * *  - Every 30 minutes
0 * * * *     - Every hour
0 */2 * * *   - Every 2 hours
0 0 * * *     - Daily at midnight
```

## 🐛 Troubleshooting

### Cron not running?
- Check cron secret is correctly set
- Verify cron service is active
- Check server logs for errors

### Prices not updating?
- Ensure products have `isDynamicPricing: true`
- Check metal weights are > 0
- Verify gold/silver prices are being fetched

### 401 Unauthorized?
- Check `CRON_SECRET` matches in both .env and cron service
- Ensure Authorization header is included

## 📞 Support

For issues or questions, check:
- Application logs
- Vercel deployment logs
- Cron service execution logs
