// middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  
  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  
  // Optional: Check user role for protected routes
  if (req.nextUrl.pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
}

// Configure which routes to apply this middleware to
export const config = {
  matcher: ['/protected/:path*', '/admin/:path*'], // Adjust based on your routes
};