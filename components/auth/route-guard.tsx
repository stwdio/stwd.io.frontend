'use client'

import { useAuth, isPublicRoute, getDefaultDashboard } from '@/lib/auth/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 1. CRITICAL: Do nothing while auth operations are in progress.
    // This prevents any redirects during client-side state transitions.
    if (loading) {
      console.log('RouteGuard: Skipping evaluation, auth is loading')
      return
    }

    // 2. Logic can now run safely. On initial load, 'loading' is false
    // and 'user'/'profile' are already populated from the server.

    // User is not logged in and trying to access a protected route
    if (!user && !isPublicRoute(pathname)) {
      console.log('RouteGuard: No user, redirecting to login')
      router.replace('/auth/login')
      return
    }

    // User is logged in but has no role, redirect to onboarding
    if (user && !profile?.role && pathname !== '/onboarding') {
      console.log('RouteGuard: User without role, redirecting to onboarding')
      router.replace('/onboarding')
      return
    }

    // User is logged in with a role and tries to access onboarding
    if (user && profile?.role && pathname === '/onboarding') {
      console.log('RouteGuard: User with role on onboarding, redirecting to dashboard')
      router.replace(getDefaultDashboard(profile.role))
      return
    }

    // User trying to access auth pages when already logged in
    if (user && pathname.startsWith('/auth/') && pathname !== '/auth/callback') {
      console.log('RouteGuard: Authenticated user on auth page, redirecting')
      if (profile?.role) {
        router.replace(getDefaultDashboard(profile.role))
      } else {
        router.replace('/onboarding')
      }
      return
    }
  }, [user, profile?.role, loading, pathname, router])

  // 3. Display a full-screen loader ONLY during client-side state changes.
  // This will not show on the initial page load because data is pre-fetched.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  // 4. Render the children once the auth state is stable and confirmed.
  return <>{children}</>
}

// Loading component for consistent loading states
export function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  )
}

// Error component for auth errors
interface AuthErrorProps {
  error: string
  onRetry?: () => void
}

export function AuthError({ error, onRetry }: AuthErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <p className="text-red-500 mb-4">Authentication error: {error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}