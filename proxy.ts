import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'default-secret-key-change-me'
);

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/dashboard',
    '/pos',
    '/products',
    '/members',
    '/reports',
    '/settings',
    '/sales-history',
    '/receipt'
];

// Routes restricted to ADMIN only
const ADMIN_ROUTES = [
    '/products',
    '/members',
    '/reports',
    '/settings',
    '/sales-history'
];

export async function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Exclude Auth API from protection
    if (pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // Routes that require authentication
    // Match explicit protected routes OR any API route (except auth)
    const isProtectedRoute =
        PROTECTED_ROUTES.some(route => pathname.startsWith(route)) ||
        (pathname.startsWith('/api') && !pathname.startsWith('/api/auth'));

    // 1. Handle Unauthorized Access
    if (isProtectedRoute && !token) {
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 2. Redirect to dashboard if accessing login page while already authenticated
    if (pathname === '/login' && token) {
        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch (error) {
            const response = NextResponse.next();
            response.cookies.delete('token');
            return response;
        }
    }

    // 3. Verify Token & Check Roles
    if (isProtectedRoute && token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            const userRole = payload.role as string;

            // Check Admin Routes
            const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
            if (isAdminRoute && userRole !== 'ADMIN') {
                if (pathname.startsWith('/api')) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }

            return NextResponse.next();

        } catch (error) {
            console.error('Proxy Auth Error:', error);
            if (pathname.startsWith('/api')) {
                return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
            }
            const loginUrl = new URL('/login', request.url);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
