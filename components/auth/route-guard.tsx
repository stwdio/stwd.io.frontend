'use client'

import { useAuth, isPublicRoute, getDefaultDashboard } from '@/lib/auth/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, profile, loading, error } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't do anything while auth is loading
    if (loading) return

    // Clear, single decision tree - prevents infinite loops
    
    // Case 1: No user and trying to access protected route
    if (!user && !isPublicRoute(pathname)) {
      console.log('Redirecting to login: no user, protected route')
      router.replace('/auth/login')
      return
    }
    
    // Case 2: User exists but no role and not on onboarding
    if (user && !profile?.role && pathname !== '/onboarding') {
      console.log('Redirecting to onboarding: user without role')
      router.replace('/onboarding')
      return
    }
    
    // Case 3: User with role trying to access onboarding
    if (user && profile?.role && pathname === '/onboarding') {
      console.log('Redirecting to dashboard: user with role on onboarding')
      router.replace(getDefaultDashboard(profile.role))
      return
    }

    // Case 4: User trying to access auth pages when already logged in
    if (user && pathname.startsWith('/auth/') && pathname !== '/auth/callback') {
      console.log('Redirecting authenticated user away from auth pages')
      if (profile?.role) {
        router.replace(getDefaultDashboard(profile.role))
      } else {
        router.replace('/onboarding')
      }
      return
    }

  }, [user, profile?.role, loading, pathname, router])

  // Show loading during auth loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  // Show error state if there's an auth error
  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-500 mb-4">Authentication error: {error}</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Render children once auth state is resolved
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