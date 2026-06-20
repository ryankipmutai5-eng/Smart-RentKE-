import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from './lib/auth/session'

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Security Headers
  const response = NextResponse.next()
  const origin = request.headers.get('origin')
  if (origin && (ALLOWED_ORIGIN === '*' || origin === ALLOWED_ORIGIN)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // 2. Auth Protection for API routes (except auth and webhooks)
  if (pathname.startsWith('/api/') && 
      !pathname.startsWith('/api/auth/') && 
      !pathname.startsWith('/api/webhooks/')) {
    
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Attach session data to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant-id', session.tenant_id)
    requestHeaders.set('x-user-id', session.user_id)
    requestHeaders.set('x-user-role', session.role)

    // Re-create the response with headers for the next step (route handler)
    const nextResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Copy security headers to the new response
    response.headers.forEach((value, key) => {
      nextResponse.headers.set(key, value)
    })
    
    return nextResponse
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
