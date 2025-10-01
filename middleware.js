import { NextResponse } from 'next/server';

export async function middleware(request) {
    // Temporarily allow all traffic
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*']
};