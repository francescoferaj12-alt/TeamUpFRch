import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/profil', '/dashboard', '/candidatures', '/messages', '/onboarding']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!PROTECTED.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Supabase stores the session in a cookie named sb-<project-ref>-auth-token
  const projectRef = 'iupcllegqqpmhxadcxqd'
  const authCookie =
    request.cookies.get(`sb-${projectRef}-auth-token`) ||
    request.cookies.get(`sb-${projectRef}-auth-token.0`)

  if (!authCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/profil/:path*', '/dashboard/:path*', '/candidatures/:path*', '/messages/:path*', '/onboarding/:path*']
}
