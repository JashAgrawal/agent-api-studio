import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path is the login page or an API route
  const isLoginPage = path === '/login';
  const isApiRoute = path.startsWith('/api/');
  const isPublicAsset = 
    path.startsWith('/_next') || 
    path.startsWith('/favicon.ico') ||
    path.startsWith('/images/');

  // Get the authentication cookie
  const authCookie = request.cookies.get('auth-token')?.value;
  const isAuthenticated = authCookie === process.env.APP_SECRET_KEY;

  // If the user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isLoginPage && !isApiRoute && !isPublicAsset) {
    // Redirect to the login page
    const url = new URL('/login', request.url);
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and trying to access the login page
  if (isAuthenticated && isLoginPage) {
    // Redirect to the home page
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes that handle authentication)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
