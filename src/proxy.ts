import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedPaths = ['/dashboard', '/stock'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  if (isProtected) {
    const auth = request.cookies.get('auth-token');
    if (!auth || auth.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/stock/:path*'],
};