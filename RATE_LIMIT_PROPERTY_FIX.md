# Rate Limit Property Names Fix

## Issue
Rate limit error messages showed "undefined seconds" because the routes were checking for incorrect property names from the `rateLimit()` function.

**Error Example:**
```json
{
  "error": "Too many login attempts. Please try again in undefined seconds.",
  "retryAfter": 900
}
```

## Root Cause
The `rateLimit()` function in `lib/rateLimit.js` returns:
```javascript
{
    success: boolean,      // Whether request is allowed
    remaining: number,     // Requests remaining
    resetTime: number,     // Timestamp when limit resets
    retryAfter: number     // Seconds until retry (already calculated)
}
```

However, the route handlers were checking for:
- `rateLimitResult.allowed` (should be `success`)
- `rateLimitResult.waitTime` (should be `retryAfter`)

## Files Fixed

### 1. `/app/api/auth/login/route.js`
**Before:**
```javascript
if (!rateLimitResult.allowed) {
    return NextResponse.json({
        error: `Too many login attempts. Please try again in ${rateLimitResult.waitTime} seconds.`,
        retryAfter: rateLimitResult.retryAfter
    }, { status: 429 });
}
```

**After:**
```javascript
if (!rateLimitResult.success) {
    return NextResponse.json({
        error: `Too many login attempts. Please try again in ${rateLimitResult.retryAfter} seconds.`,
        retryAfter: rateLimitResult.retryAfter
    }, { status: 429 });
}
```

### 2. `/app/api/auth/register/route.js`
**Before:**
```javascript
if (!rateLimitResult.allowed) {
    return NextResponse.json({
        error: `Too many registration attempts. Please try again in ${Math.ceil(rateLimitResult.waitTime / 60)} minutes.`,
        retryAfter: rateLimitResult.retryAfter
    }, { status: 429 });
}
```

**After:**
```javascript
if (!rateLimitResult.success) {
    return NextResponse.json({
        error: `Too many registration attempts. Please try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`,
        retryAfter: rateLimitResult.retryAfter
    }, { status: 429 });
}
```

### 3. `/app/api/payment/create/route.js`
**Before:**
```javascript
if (!rateLimitResult.allowed) {
    return NextResponse.json({
        error: `Too many payment requests. Please try again in ${Math.ceil(rateLimitResult.waitTime / 60)} minutes.`,
        retryAfter: rateLimitResult.retryAfter
    }, { status: 429 });
}
```

**After:**
```javascript
if (!rateLimitResult.success) {
    return NextResponse.json({
        error: `Too many payment requests. Please try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`,
        retryAfter: rateLimitResult.retryAfter
    }, { status: 429 });
}
```

### 4. `/app/api/payment/verify/route.js`
**Before:**
```javascript
if (!rateLimitResult.allowed) {
    return NextResponse.json({
        error: `Too many verification attempts. Please try again in ${Math.ceil(rateLimitResult.waitTime / 60)} minutes.`,
        retryAfter: rateLimitResult.retryAfter
    }, { status: 429 });
}
```

**After:**
```javascript
if (!rateLimitResult.success) {
    return NextResponse.json({
        error: `Too many verification attempts. Please try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`,
        retryAfter: rateLimitResult.retryAfter
    }, { status: 429 });
}
```

## Changes Made

### Property Name Updates
1. **`allowed` → `success`**: Changed condition check from `.allowed` to `.success`
2. **`waitTime` → `retryAfter`**: Changed error message interpolation from `waitTime` to `retryAfter`

### Error Messages Now Display Correctly
- **Login**: "Too many login attempts. Please try again in 900 seconds."
- **Register**: "Too many registration attempts. Please try again in 60 minutes."
- **Payment Create**: "Too many payment requests. Please try again in 10 minutes."
- **Payment Verify**: "Too many verification attempts. Please try again in 5 minutes."

## Rate Limit Return Object Reference

```javascript
// From lib/rateLimit.js
export function rateLimit(identifier, limit = 10, windowMs = 60000) {
    // ... implementation ...
    
    return {
        success: boolean,       // true if request allowed, false if rate limited
        remaining: number,      // Number of requests remaining in window
        resetTime: number,      // Timestamp (ms) when the window resets
        retryAfter: number      // Seconds until next request allowed
    };
}
```

## Rate Limit Configurations

From `RATE_LIMITS` constant in `lib/rateLimit.js`:

| Endpoint | Limit | Window | Description |
|----------|-------|--------|-------------|
| LOGIN | 5 requests | 15 minutes | Prevent brute force attacks |
| REGISTER | 3 requests | 1 hour | Prevent spam registrations |
| PAYMENT_CREATE | 10 requests | 10 minutes | Prevent payment abuse |
| PAYMENT_VERIFY | 20 requests | 10 minutes | Allow retries for verification |
| API_DEFAULT | 100 requests | 1 minute | General API protection |
| API_STRICT | 30 requests | 1 minute | Strict API protection |
| ADMIN | 200 requests | 1 minute | Higher limit for admin users |

## Testing

After the fix, rate limit errors now display correctly:

```json
{
  "error": "Too many login attempts. Please try again in 900 seconds.",
  "retryAfter": 900
}
```

The error message now properly shows the wait time instead of "undefined seconds".

## Impact

- ✅ **Login**: Rate limit errors now show correct wait time
- ✅ **Register**: Rate limit errors now show correct wait time in minutes
- ✅ **Payment Create**: Rate limit errors now show correct wait time in minutes
- ✅ **Payment Verify**: Rate limit errors now show correct wait time in minutes
- ✅ All rate limiting functionality works as expected
- ✅ User experience improved with clear error messages

## Prevention

To prevent similar issues in the future:

1. **Use TypeScript**: Type checking would catch property name mismatches
2. **JSDoc Comments**: Keep JSDoc comments up-to-date with return types
3. **Consistent Naming**: Use consistent property names across the codebase
4. **Unit Tests**: Add tests for rate limiting to catch regressions

## Related Files

- `lib/rateLimit.js` - Rate limiting utility (source of truth)
- `app/api/auth/login/route.js` - Login endpoint ✅ Fixed
- `app/api/auth/register/route.js` - Register endpoint ✅ Fixed
- `app/api/payment/create/route.js` - Payment creation endpoint ✅ Fixed
- `app/api/payment/verify/route.js` - Payment verification endpoint ✅ Fixed
