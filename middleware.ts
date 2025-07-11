import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * This middleware runs on EVERY request to your app.
 * It's the secret sauce that keeps auth state synchronized.
 * 
 * THE FIX IN ACTION:
 * 1. User refreshes page -> Browser sends request with auth cookies
 * 2. This middleware intercepts request BEFORE any rendering
 * 3. Calls updateSession which validates/refreshes JWT
 * 4. Updates cookies if needed (e.g., token was about to expire)
 * 5. Request continues with fresh, valid auth state
 * 6. Server components read the updated cookies
 * 7. No race condition, no hanging queries!
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 