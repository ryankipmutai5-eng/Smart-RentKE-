import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://smart-rent-ke.vercel.app'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Only allow specific origin (no wildcard)
  const origin = request.headers.get('origin')
  if (origin === ALLOWED_ORIGIN) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Don't leak server version in headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: '/:path*',
}