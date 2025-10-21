# 🔧 Fixed: Shiprocket Array Response Format

## Issue Identified

Shiprocket API returns data in **two different formats**:

### Format 1: Object (Working ✅)
```json
{
  "1006100965": {
    "tracking_data": { ... }
  }
}
```

### Format 2: Array of Objects (Broken ❌)
```json
[
  {
    "1009745485": {
      "tracking_data": { ... }
    }
  }
]
```

**Problem**: The sync endpoint was only handling Format 1, causing Format 2 to fail with 404.

---

## Root Cause

When using **Shiprocket Order ID** endpoint:
```
GET /courier/track?order_id=1009745485
```

Shiprocket returns an **array** `[{...}]` instead of object `{...}`.

When using **Shipment ID** endpoint:
```
GET /courier/track/shipment/1006100965
```

Shiprocket returns an **object** `{...}`.

---

## The Fix

### 1. Handle Array Wrapper
```javascript
// STEP 1: Check if response is wrapped in array
let rawData = trackingData;

if (Array.isArray(rawData) && rawData.length > 0) {
    console.log('⚠️ Response is wrapped in array, extracting first element...');
    rawData = rawData[0]; // Extract from array ✅
}
```

### 2. Enhanced Parsing Logic
```javascript
// STEP 2: Parse nested structure
if (rawData.tracking_data) {
    // Direct format
    tracking = rawData.tracking_data;
} else if (rawData[shiprocketOrderId]) {
    // Nested with Shiprocket Order ID
    tracking = rawData[shiprocketOrderId].tracking_data;
} else if (rawData[shipmentId]) {
    // Nested with Shipment ID
    tracking = rawData[shipmentId].tracking_data;
}
// ... fallback logic
```

### 3. Handle "No Activities" Error
```javascript
// Don't fail on non-critical errors
if (tracking.error && !tracking.error.includes('cancelled')) {
    console.log('ℹ️ Non-critical error, continuing with available data...');
}

// Check for zero status codes
if (!statusCode || statusCode === 0) {
    return {
        success: false,
        message: 'No tracking updates available yet',
        hint: 'Shipment may be newly created. Please try again in a few minutes.'
    };
}
```

### 4. Better User Feedback
```javascript
// Admin panel now shows helpful messages
if (res.ok && !data.success) {
    alert(`ℹ️ No updates available
    
Current Status: ${data.data.currentStatus}

${data.data.shiprocketMessage}

${data.data.hint || ''}`);
}
```

---

## What Now Works

### Scenario 1: Cancelled Shipment ✅
```
Shiprocket Response:
{
  "1006100965": {
    "tracking_data": {
      "shipment_status": 8,
      "error": "Ohh! This AWB has been cancelled."
    }
  }
}

Result:
✅ Status updated to "cancelled"
✅ Error message saved
✅ Admin panel shows "Cancelled"
```

### Scenario 2: New Shipment (No Activities) ✅
```
Shiprocket Response:
[
  {
    "1009745485": {
      "tracking_data": {
        "shipment_status": 0,
        "error": "Aahh! There is no activities found in our DB..."
      }
    }
  }
]

Result:
ℹ️ No updates available yet
💡 Hint: "Shipment may be newly created. Please try again in a few minutes."
✅ No error thrown, user gets helpful message
```

### Scenario 3: Tracking Updates Available ✅
```
Shiprocket Response:
{
  "tracking_data": {
    "shipment_status": 6,
    "current_status": "Shipped",
    "awb_code": "ABC123",
    "scans": [...]
  }
}

Result:
✅ Status updated to "shipped"
✅ Tracking history updated
✅ AWB code saved
```

---

## Response Format Variations

The sync now handles **all** these variations:

### Direct Format
```json
{ "tracking_data": {...} }
```

### Nested with Shipment ID
```json
{ "1006100965": { "tracking_data": {...} } }
```

### Nested with Order ID
```json
{ "1009745485": { "tracking_data": {...} } }
```

### Array Wrapped (NEW ✅)
```json
[{ "1009745485": { "tracking_data": {...} } }]
```

---

## Enhanced Logging

You'll now see clearer logs:

### For Array Response:
```
📦 Shiprocket tracking data: [{...}]
⚠️ Response is wrapped in array, extracting first element...
✅ Using nested format with Shiprocket Order ID: 1009745485
⚠️ Shiprocket error: Aahh! There is no activities found...
ℹ️ Non-critical error, continuing with available data...
📊 Status Info: { statusCode: 0, ... }
⚠️ No valid status code found in tracking data
```

### For Cancelled Shipment:
```
📦 Shiprocket tracking data: {...}
✅ Using nested format with Shipment ID: 1006100965
⚠️ Shiprocket error: Ohh! This AWB has been cancelled.
📋 Detected cancelled shipment, updating order status...
✅ Status updated: processing → cancelled
```

---

## Error Types & Handling

### Critical Errors (Updates Status)
- ✅ `"cancelled"` in error message → Status: cancelled
- ✅ `shipment_status === 8` → Status: cancelled

### Non-Critical Errors (Info Only)
- ℹ️ `"no activities found"` → Show helpful message
- ℹ️ `statusCode === 0` → Show "try again later"
- ℹ️ Other errors → Continue processing with available data

---

## User Experience

### Before (Broken):
```
Admin clicks "Sync Status"
↓
❌ Error 404: No tracking data
↓
No status update
User confused
```

### After (Fixed):
```
Admin clicks "Sync Status"
↓
API detects array format
↓
Extracts data successfully
↓
Checks status code
↓
Options:
  - Status 8? → ✅ Update to "cancelled"
  - Status 0? → ℹ️ Show "try again later"
  - Valid status? → ✅ Update with new status
↓
User sees helpful feedback
```

---

## Files Modified

1. ✅ `/app/api/admin/orders/[orderId]/sync-tracking/route.js`
   - Added array unwrapping logic
   - Enhanced nested object parsing
   - Better error differentiation
   - Status code validation

2. ✅ `/app/admin/orders/page.js`
   - Handle `success: false` responses
   - Show helpful messages for new shipments
   - Better user feedback

---

## Testing Both Formats

### Test Format 1 (Object):
```bash
# Shipment ID endpoint
curl 'https://apiv2.shiprocket.in/v1/external/courier/track/shipment/1006100965'

Response: { "1006100965": { "tracking_data": {...} } }
✅ Works
```

### Test Format 2 (Array):
```bash
# Order ID endpoint  
curl 'https://apiv2.shiprocket.in/v1/external/courier/track?order_id=1009745485'

Response: [{ "1009745485": { "tracking_data": {...} } }]
✅ Now works!
```

---

## Summary

**Problem**: Shiprocket returns array format for Order ID queries, causing sync to fail.

**Solution**: 
- ✅ Detect and unwrap array responses
- ✅ Parse both object and array formats
- ✅ Differentiate critical vs non-critical errors
- ✅ Provide helpful feedback for new shipments

**Result**: Manual sync now works for **all** Shiprocket response formats!

---

**Status**: ✅ Fixed & Deployed  
**Date**: October 22, 2025  
**Tested**: Both formats working
