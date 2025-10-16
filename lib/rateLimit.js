/**
 * Rate Limiting Utility
 * Implements in-memory rate limiting to prevent abuse
 * For production, consider using Redis for distributed rate limiting
 */

// In-memory store for rate limiting
const rateLimitStore = new Map();

// Cleanup old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now - data.resetTime > 0) {
            rateLimitStore.delete(key);
        }
    }
}, 10 * 60 * 1000);

/**
 * Rate limit middleware
 * @param {string} identifier - Unique identifier (e.g., IP address, user ID)
 * @param {number} limit - Maximum number of requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} - { success: boolean, remaining: number, resetTime: number }
 */
export function rateLimit(identifier, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const key = `ratelimit:${identifier}`;
    
    // Get or create rate limit data for this identifier
    let data = rateLimitStore.get(key);
    
    if (!data || now > data.resetTime) {
        // Create new rate limit window
        data = {
            count: 0,
            resetTime: now + windowMs
        };
    }
    
    // Increment request count
    data.count++;
    rateLimitStore.set(key, data);
    
    // Check if limit exceeded
    const success = data.count <= limit;
    const remaining = Math.max(0, limit - data.count);
    
    return {
        success,
        remaining,
        resetTime: data.resetTime,
        retryAfter: Math.ceil((data.resetTime - now) / 1000)
    };
}

/**
 * Get client IP address from request
 * Handles various proxy headers
 * @param {Request} request - Next.js request object
 * @returns {string} - Client IP address
 */
export function getClientIP(request) {
    // Try various headers that might contain the real IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // x-forwarded-for can contain multiple IPs, get the first one
        return forwardedFor.split(',')[0].trim();
    }
    
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP.trim();
    }
    
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
        return cfConnectingIP.trim();
    }
    
    // Fallback to a default if no IP found
    return 'unknown';
}

/**
 * Create a rate limit check function for specific route
 * @param {number} limit - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} - Rate limit check function
 */
export function createRateLimiter(limit = 10, windowMs = 60000) {
    return (identifier) => rateLimit(identifier, limit, windowMs);
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    // Authentication endpoints
    LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 },
    REGISTER: { limit: 3, windowMs: 60 * 60 * 1000 },
    
    // Payment endpoints
    PAYMENT_CREATE: { limit: 10, windowMs: 10 * 60 * 1000 },
    PAYMENT_VERIFY: { limit: 20, windowMs: 10 * 60 * 1000 },
    
    // API endpoints
    API_DEFAULT: { limit: 100, windowMs: 60 * 1000 },
    API_STRICT: { limit: 30, windowMs: 60 * 1000 },
    
    // Admin endpoints
    ADMIN: { limit: 200, windowMs: 60 * 1000 },
};

/**
 * Helper to create rate limit response
 * @param {Object} result - Rate limit result
 * @returns {Response} - Next.js response
 */
export function createRateLimitResponse(result) {
    return new Response(
        JSON.stringify({
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
            retryAfter: result.retryAfter
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': result.retryAfter.toString(),
                'X-RateLimit-Limit': '10',
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
            }
        }
    );
}

/**
 * Clear rate limit for an identifier
 * @param {string} identifier - Unique identifier to clear
 */
export function clearRateLimit(identifier) {
    const key = `ratelimit:${identifier}`;
    rateLimitStore.delete(key);
}

/**
 * Get current rate limit status for an identifier
 * @param {string} identifier - Unique identifier
 * @returns {Object|null} - Current rate limit data or null
 */
export function getRateLimitStatus(identifier) {
    const key = `ratelimit:${identifier}`;
    const data = rateLimitStore.get(key);
    
    if (!data) {
        return null;
    }
    
    const now = Date.now();
    if (now > data.resetTime) {
        rateLimitStore.delete(key);
        return null;
    }
    
    return {
        count: data.count,
        resetTime: data.resetTime,
        resetIn: Math.ceil((data.resetTime - now) / 1000)
    };
}
