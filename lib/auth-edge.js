import { jwtVerify } from 'jose';

/**
 * Edge Runtime Compatible Authentication Utilities
 * 
 * This file contains ONLY Edge runtime compatible code for use in middleware.js
 * No MongoDB or Node.js-specific imports are allowed here.
 */

/**
 * Verify JWT token (Edge runtime compatible)
 * Used ONLY in middleware.js which runs in Edge runtime
 * Uses 'jose' library which is Edge runtime compatible
 */
export async function verifyTokenEdge(token) {
    try {
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return null;
        }
        
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        console.error('Token verification failed (Edge):', error.message);
        return null;
    }
}
