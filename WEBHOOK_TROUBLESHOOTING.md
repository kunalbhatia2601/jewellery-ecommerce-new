# 🔧 Shiprocket Webhook Troubleshooting Guide

## Issue: Order Status Not Updating After Manual Cancellation

### Problem
When you cancel a shipment manually from the Shiprocket dashboard, the order status in your database remains as "processing" instead of updating to "cancelled".

### Root Cause
Shiprocket webhooks **may not always trigger** for manual actions performed in their dashboard, such as:
- Manual shipment cancellation
- Manual courier changes
- Manual status updates

### Solution: Manual Status Sync

We've implemented a **manual sync feature** that fetches the latest status directly from Shiprocket API.

---

## 🚀 How to Use Manual Sync

### Option 1: Admin Dashboard Button (Recommended)

1. **Navigate to Admin Orders Page**
   ```
   /admin/orders
   ```

2. **Find the Order** that needs status update

3. **Click "🔄 Sync Status" Button**
   - Located in the Actions column
   - Only visible for orders with shipments

4. **Confirmation Dialog**
   - Shows current vs. new status
   - Displays Shiprocket status label

5. **Status Updated!**
   - Order status automatically refreshed
   - Tracking history updated
   - All fields synced from Shiprocket

### Option 2: Direct API Call

**Endpoint**: `POST /api/admin/orders/{orderId}/sync-tracking`

**Authentication**: Admin JWT token (cookie-based)

**Example**:
```javascript
const response = await fetch('/api/admin/orders/507f1f77bcf86cd799439011/sync-tracking', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
console.log(result);
```

**Response**:
```json
{
  "success": true,
  "message": "Tracking synced successfully",
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-123456",
    "previousStatus": "processing",
    "newStatus": "cancelled",
    "statusCode": 8,
    "statusLabel": "Cancelled",
    "tracking": {
      // Full Shiprocket tracking data
    }
  }
}
```

---

## 📊 Status Code Mapping

The manual sync uses the same status mapping as webhooks:

| Code | Shiprocket Status | Order Status | Shipping Status |
|------|------------------|--------------|-----------------|
| 1 | New | processing | processing |
| 2 | Pickup Scheduled | processing | processing |
| 3 | AWB Assigned | processing | processing |
| 6 | Shipped | shipped | shipped |
| 7 | Delivered | delivered | delivered |
| **8** | **Cancelled** | **cancelled** | **cancelled** |
| 9 | RTO Initiated | cancelled | cancelled |
| 10 | RTO Delivered | cancelled | cancelled |
| 11 | Lost | cancelled | cancelled |
| 12 | Damaged | cancelled | cancelled |
| 18 | In Transit | shipped | shipped |
| 19 | Out for Delivery | shipped | shipped |
| 21 | Unsuccessfully Delivered | cancelled | cancelled |

---

## 🔍 When to Use Manual Sync

### Use Manual Sync When:

✅ **Manual Shiprocket Actions**
- Cancelled shipment from Shiprocket dashboard
- Changed courier manually
- Updated status directly in Shiprocket

✅ **Webhook Issues**
- Webhook didn't trigger (network issues)
- Shiprocket webhook configuration changed
- Missed webhook events

✅ **Status Mismatch**
- Database shows "processing" but Shiprocket shows "cancelled"
- Tracking info out of sync
- Missing tracking history

✅ **Debugging**
- Testing webhook functionality
- Verifying Shiprocket integration
- Troubleshooting status issues

### Don't Use Manual Sync When:

❌ **Normal Operations**
- Automatic webhooks are working
- Status updates happening automatically
- Real-time tracking working

❌ **Shipment Not Created Yet**
- Order has no shipmentId or AWB code
- Payment not completed
- Shipment creation in progress

---

## 🛡️ Why Webhooks Don't Always Trigger

### Common Reasons:

1. **Manual Dashboard Actions**
   - Shiprocket may not send webhooks for manual changes
   - Design decision by Shiprocket
   - Not a bug in your system

2. **Webhook Configuration**
   - Webhook URL not configured properly
   - Wrong events subscribed
   - Authentication header missing

3. **Network Issues**
   - Your server was down temporarily
   - Firewall blocked webhook
   - SSL/TLS certificate issues

4. **Shiprocket Rate Limiting**
   - Too many webhooks in short time
   - Throttling by Shiprocket
   - Retry logic not working

5. **Event Not Subscribed**
   - "Cancelled" event not enabled in Shiprocket
   - Limited event subscriptions in plan
   - Need to enable specific events

---

## ✅ How to Fix Webhook Issues

### Step 1: Verify Webhook Configuration in Shiprocket

1. **Login to Shiprocket Dashboard**
2. **Navigate to Settings → Webhooks**
3. **Check Webhook URLs**:
   ```
   Order Tracking: https://www.nandikajewellers.in/api/webhooks/order-updates
   Return Tracking: https://www.nandikajewellers.in/api/webhooks/reverse-pickup
   ```

4. **Verify Authentication**:
   - Header: `anx-api-key`
   - Value: `{Your SHIPROCKET_WEBHOOK_SECRET}`

5. **Enable All Events**:
   - ✅ Shipment Created
   - ✅ Pickup Scheduled
   - ✅ AWB Assigned
   - ✅ In Transit
   - ✅ Out for Delivery
   - ✅ Delivered
   - ✅ **Cancelled** ← Make sure this is enabled!
   - ✅ RTO/Failed Deliveries

### Step 2: Test Webhook Endpoint

**Method 1: Health Check**
```bash
curl https://www.nandikajewellers.in/api/webhooks/order-updates
```

**Expected Response**:
```json
{
  "status": "active",
  "webhook": "order-tracking",
  "description": "Handles shipment tracking updates for orders",
  "timestamp": "2025-10-21T12:00:00.000Z"
}
```

**Method 2: Test with Sample Data**
```bash
curl -X POST https://www.nandikajewellers.in/api/webhooks/order-updates \
  -H "Content-Type: application/json" \
  -H "anx-api-key: YOUR_SECRET" \
  -d '{
    "awb": "TEST123456",
    "shipment_status_id": 8,
    "shipment_status": "Cancelled"
  }'
```

### Step 3: Monitor Webhook Logs

Check your application logs for webhook receipts:

```bash
# Look for these log messages:
📦 Tracking Webhook - Request URL: ...
📦 Tracking webhook received: {...}
✅ Webhook API key verified
📊 Status Update for Order ...
✅ Order ... updated - Status: Cancelled (8)
```

### Step 4: Enable Additional Logging

The webhook now includes enhanced logging. Check your server logs after making changes in Shiprocket:

```
📊 Status Update for Order ORD-123456:
   Current Status: processing → cancelled
   Shipping Status: processing → cancelled
   Status Code: 8 (Cancelled)
```

---

## 🔄 Workflow After Cancellation

### Automatic (If Webhook Works):
```
1. Cancel in Shiprocket Dashboard
   ↓
2. Shiprocket sends webhook to /api/webhooks/order-updates
   ↓
3. Webhook updates order status: processing → cancelled
   ↓
4. User sees "Cancelled" status immediately
```

### Manual (If Webhook Doesn't Fire):
```
1. Cancel in Shiprocket Dashboard
   ↓
2. Status remains "processing" in your database
   ↓
3. Admin clicks "🔄 Sync Status" button
   ↓
4. System fetches status from Shiprocket API
   ↓
5. Order status updated: processing → cancelled
   ↓
6. User sees "Cancelled" status
```

---

## 🚨 Important Notes

### Security
- Manual sync requires **admin authentication**
- Only admins can trigger manual sync
- Webhook uses `anx-api-key` header verification
- All API calls are logged

### Rate Limiting
- Shiprocket API has rate limits
- Manual sync uses Shiprocket API quota
- Use sparingly - not for bulk operations
- Webhooks are preferred (no API calls)

### Data Consistency
- Manual sync **replaces** tracking history
- Uses latest data from Shiprocket
- Overwrites local changes
- Always trust Shiprocket as source of truth

### Inventory Management
- Cancelled orders **do not** auto-restore inventory
- Manual inventory restoration needed
- Consider adding auto-restore logic
- Check order items before restocking

---

## 📋 Checklist for Cancelled Orders

When you manually cancel a shipment:

- [ ] Cancel shipment in Shiprocket dashboard
- [ ] Wait 30 seconds for webhook to trigger
- [ ] Check order status in admin panel
- [ ] If still "processing", click "🔄 Sync Status"
- [ ] Verify status changed to "cancelled"
- [ ] Check user-facing order page
- [ ] Manually restore inventory if needed
- [ ] Notify customer (if applicable)
- [ ] Document reason for cancellation

---

## 🎯 Best Practices

### For Admins:

1. **Always Check Webhook First**
   - Wait 30-60 seconds after Shiprocket action
   - Check if status auto-updated
   - Only use manual sync if needed

2. **Use Manual Sync Sparingly**
   - Not for regular operations
   - Only for troubleshooting
   - Fix webhook issues instead

3. **Monitor Webhook Health**
   - Regularly check webhook logs
   - Ensure webhooks are triggering
   - Fix configuration issues promptly

4. **Document Issues**
   - Note when manual sync was needed
   - Track webhook failure patterns
   - Report to Shiprocket if persistent

### For Developers:

1. **Monitor Webhook Logs**
   - Check webhook receipt logs daily
   - Alert on webhook failures
   - Set up monitoring/alerting

2. **Test Webhook Changes**
   - Test in staging before production
   - Verify all status codes work
   - Check webhook signature verification

3. **Keep Status Mapping Updated**
   - Shiprocket may add new status codes
   - Update mapping when needed
   - Document status code changes

4. **Implement Retry Logic** (Future Enhancement)
   - Auto-retry failed webhooks
   - Queue webhook processing
   - Handle duplicate webhooks

---

## 🆘 Troubleshooting Common Issues

### Issue 1: "Order has no shipment information to sync"

**Cause**: Order doesn't have shipmentId or AWB code

**Solution**: 
- Check if shipment was created
- Verify payment was completed
- Check shipment automation logs
- May need to create shipment manually

### Issue 2: "Failed to authenticate with Shiprocket"

**Cause**: Invalid Shiprocket credentials

**Solution**:
- Verify `SHIPROCKET_EMAIL` in environment variables
- Verify `SHIPROCKET_PASSWORD` in environment variables
- Check Shiprocket account is active
- Try logging into Shiprocket dashboard manually

### Issue 3: "No tracking data available from Shiprocket"

**Cause**: Shipment ID/AWB not found in Shiprocket

**Solution**:
- Verify shipment exists in Shiprocket
- Check if shipment was deleted
- AWB code may be invalid
- Shipment may be too old (archived)

### Issue 4: Manual sync works but webhooks don't

**Cause**: Webhook configuration issue

**Solution**:
- Check webhook URL in Shiprocket dashboard
- Verify `anx-api-key` header is correct
- Ensure webhook secret matches environment variable
- Enable all relevant events in Shiprocket
- Check if your server is publicly accessible

### Issue 5: Status updates but tracking history missing

**Cause**: Shiprocket not returning scan data

**Solution**:
- Check Shiprocket API response
- Scans may not be available yet
- Courier may not provide detailed tracking
- Try manual sync again later

---

## 📚 Related Documentation

- [Complete Workflow Analysis](/COMPLETE_WORKFLOW_ANALYSIS.md)
- [Webhook Implementation](/app/api/webhooks/order-updates/route.js)
- [Manual Sync API](/app/api/admin/orders/[orderId]/sync-tracking/route.js)
- [Admin Orders Page](/app/admin/orders/page.js)

---

## 💡 Future Improvements

### Planned Enhancements:

1. **Auto-Sync Scheduled Task**
   - Cron job to sync all pending orders
   - Runs every hour
   - Catches missed webhooks automatically

2. **Webhook Retry Queue**
   - Store failed webhooks in database
   - Retry processing automatically
   - Alert admins on persistent failures

3. **Bulk Sync Operation**
   - Sync multiple orders at once
   - Useful after Shiprocket downtime
   - Rate-limited to avoid API quota

4. **Real-time Webhook Status**
   - Dashboard showing webhook health
   - Last webhook received timestamp
   - Failed webhook count

5. **Auto-Inventory Restoration**
   - Automatically restore stock on cancellation
   - Configurable via settings
   - With admin notification

---

## 🎉 Summary

The manual sync feature provides a **reliable fallback** when webhooks don't trigger automatically. While webhooks are preferred for real-time updates, manual sync ensures you can always get the latest status from Shiprocket with just one click.

**Key Takeaway**: If you cancel a shipment in Shiprocket and the status doesn't update automatically, just click the **"🔄 Sync Status"** button in the admin panel!

---

**Last Updated**: October 21, 2025  
**Status**: ✅ Implemented & Working  
**Tested**: Pending deployment
