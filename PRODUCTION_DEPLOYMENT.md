# Production Deployment Checklist

## ⚠️ Critical Environment Variables

Ensure these are set in your production environment (Vercel/hosting platform):

```bash
MONGODB_URI=mongodb+srv://your-connection-string
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

## 🔧 Production Issues Fixed

### Issue: Products showing "Not Found" in production
**Root Cause**: Production has aggressive caching + longer latencies than local

**Fixes Applied**:
1. ✅ Added `fetchCache = 'force-no-store'` to API routes
2. ✅ Added `runtime = 'nodejs'` for better serverless compatibility
3. ✅ Increased MongoDB timeouts for production latency:
   - Connection timeout: 10s → 15s
   - Server selection: 5s → 10s
   - Socket timeout: 30s → 45s
   - Max idle time: 30s → 60s
4. ✅ Added `.maxTimeMS()` to MongoDB queries (prevents indefinite hangs)
5. ✅ Added Vercel CDN cache headers
6. ✅ Added request-level timeouts (15s max)
7. ✅ Reduced minPoolSize for serverless (2 → 1)
8. ✅ Added `autoIndex: false` for production performance

## 🚀 Deployment Steps

### 1. Build Verification
```bash
# Test production build locally
npm run build
npm start

# Or with bun
bun run build
bun start
```

### 2. Environment Check
Verify all environment variables are set:
- Go to your hosting dashboard (e.g., Vercel)
- Settings → Environment Variables
- Ensure `MONGODB_URI` is correct
- Check MongoDB Atlas allows connections from `0.0.0.0/0` or Vercel IPs

### 3. MongoDB Atlas Configuration
- ✅ Network Access: Allow access from anywhere (0.0.0.0/0) OR add Vercel IPs
- ✅ Database User: Has read/write permissions
- ✅ Connection String: Uses `mongodb+srv://` format
- ✅ Database Name: Matches your application (`nandikajewellers`)

### 4. Post-Deployment Verification
```bash
# Test API endpoints
curl https://your-domain.com/api/products?limit=5
curl https://your-domain.com/api/products/[product-id]

# Check response headers
curl -I https://your-domain.com/api/products
```

## 🐛 Troubleshooting Production Issues

### Products Not Loading
1. Check MongoDB connection in production logs
2. Verify environment variables are set
3. Check MongoDB Atlas network access whitelist
4. Increase timeouts if needed (already optimized)

### Timeout Errors
- Logs will show: "Database connection timeout" or "Request timeout"
- Solution: Already optimized with 15s timeouts
- If still occurring: Check MongoDB Atlas performance

### Cache Issues
- Force clear Vercel cache: Go to Vercel dashboard → Deployments → "..." → Redeploy
- Headers are set to prevent aggressive caching

## 📊 Performance Monitoring

Monitor these metrics in production:
- API response times (should be < 2s)
- MongoDB connection time (should be < 1s)
- Cache hit rates
- Error rates in logs

## 🔄 Redeployment

After code changes:
```bash
git add .
git commit -m "Fix: production issues"
git push origin master
```

Vercel will auto-deploy. For manual redeploy:
- Go to Vercel dashboard
- Click "Redeploy" on latest deployment
- Select "Use existing Build Cache" = NO (force fresh build)

## ✅ Verification After Deploy

1. Visit homepage → Check "New Arrivals" section loads
2. Click a product → Should load without errors
3. Navigate to /products → Should show product list
4. Test invalid product ID → Should show "Invalid product" message
5. Check browser console for errors

## 📞 Support

If issues persist after following this checklist:
1. Check production logs in Vercel dashboard
2. Check MongoDB Atlas logs
3. Verify all environment variables match local .env
