import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Creates a Supabase client for Next.js middleware.
 * This is the MOST CRITICAL piece for fixing the refresh bug.
 * 
 * HOW IT FIXES THE BUG:
 * 1. Intercepts EVERY request (including page refreshes)
 * 2. Reads auth cookies and validates/refreshes JWT if needed
 * 3. Updates cookies BEFORE the page renders
 * 4. Ensures server and client have synchronized auth state
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on both request and response
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from both request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // This will refresh the session if expired - fixing the core issue
  const { error } = await supabase.auth.getUser()
  
  // Only log unexpected errors, not missing sessions (which are normal for logged-out users)
  if (error && error.message !== 'Auth session missing!') {
    console.error('Middleware auth error:', error)
  }

  return response
}
