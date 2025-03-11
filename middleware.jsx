// middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET 
  });

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Optional: role-based authorization
  if (token.role !== 'admin' && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    // Add other protected routes here
  ],
};