import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/student', '/teacher', '/admin']
const AUTH_ONLY = ['/login', '/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const pathname = request.nextUrl.pathname

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL('/student/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
