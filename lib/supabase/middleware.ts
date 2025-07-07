import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Only refresh session, do not redirect
  // Client-side RouteGuard will handle authentication redirects
  // This prevents middleware/client redirect conflicts that cause infinite loading

  try {
    // This call refreshes the session and updates cookies
    // We don't need the user data here - just the session refresh
    await supabase.auth.getSession()
  } catch (error) {
    // If session refresh fails, let the request continue
    // Client-side auth will handle the authentication state
    console.error('Session refresh failed in middleware:', error)
  }

  // IMPORTANT: Always return supabaseResponse to maintain session cookies
  // No redirects in middleware - eliminates infinite redirect loops
  return supabaseResponse
}
