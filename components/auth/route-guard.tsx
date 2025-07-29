'use client'

import { useAuth, isPublicRoute } from '@/lib/auth/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { MinimalAuthLoading } from '@/components/skeletons'

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, profile, professionalRoles, loading } = useAuth()
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

    // User is logged in but has no professional roles, redirect to onboarding
    if (user && profile && professionalRoles.length === 0 && pathname !== '/onboarding') {
      console.log('RouteGuard: User without professional roles, redirecting to onboarding')
      router.replace('/onboarding')
      return
    }

    // User is logged in with professional roles and tries to access onboarding
    if (user && profile && professionalRoles.length > 0 && pathname === '/onboarding') {
      console.log('RouteGuard: User with professional roles on onboarding, redirecting to appropriate page')
      // Determine dashboard based on whether they own studios
      const isStudioOwner = professionalRoles.some(pr => pr.role?.slug === 'studio-owner')
      router.replace(isStudioOwner ? '/workspace' : '/discover/studios')
      return
    }

    // User trying to access auth pages when already logged in
    if (user && pathname.startsWith('/auth/') && pathname !== '/auth/callback') {
      console.log('RouteGuard: Authenticated user on auth page, redirecting')
      if (professionalRoles.length > 0) {
        const isStudioOwner = professionalRoles.some(pr => pr.role?.slug === 'studio-owner')
        router.replace(isStudioOwner ? '/workspace' : '/discover/studios')
      } else {
        router.replace('/onboarding')
      }
      return
    }
  }, [user, profile, professionalRoles, loading, pathname, router])

  // 3. Display a minimal loader ONLY during client-side state changes.
  // This will not show on the initial page load because data is pre-fetched.
  if (loading) {
    return <MinimalAuthLoading />
  }

  // 4. Render the children once the auth state is stable and confirmed.
  return <>{children}</>
}

// Loading component for consistent loading states
export function AuthLoadingSpinner() {
  return <MinimalAuthLoading />
}

// Error component for auth errors
interface AuthErrorProps {
  error: string
  onRetry?: () => void
}

export function AuthError({ error, onRetry }: AuthErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Authentication Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}