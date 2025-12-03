import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'default-secret-key-change-me'
);

// Paths that do NOT require authentication
const publicPaths = ['/login', '/api/auth/login', '/_next', '/favicon.ico', '/public'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is public
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    // If no token, redirect to login
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Verify token
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.next();
    } catch (error) {
        // If token is invalid, redirect to login
        const loginUrl = new URL('/login', request.url);
        // Optional: Clear the invalid cookie
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('token');
        return response;
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
