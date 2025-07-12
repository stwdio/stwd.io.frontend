'use client'

import { QueryClient } from '@tanstack/react-query'

// Create a single QueryClient instance for the entire app
let browserQueryClient: QueryClient | undefined = undefined

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Optimize for your 19-table schema with complex relationships
        staleTime: 2 * 60 * 1000, // 2 minutes - good for list data
        gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection
        refetchOnWindowFocus: false, // Reduce unnecessary API calls
        refetchOnReconnect: true,    // Sync data when coming back online
        retry: (failureCount, error) => {
          // Don't retry RLS (Row Level Security) errors - they won't succeed
          const errorMessage = error?.message?.toLowerCase() || ''
          if (
            errorMessage.includes('row level security') ||
            errorMessage.includes('rls') ||
            errorMessage.includes('insufficient_privilege') ||
            errorMessage.includes('permission denied')
          ) {
            return false
          }
          
          // Don't retry 400-level errors except for timeouts
          if (error && 'status' in error) {
            const status = (error as any).status
            if (status >= 400 && status < 500 && status !== 408) {
              return false
            }
          }
          
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Optimize for your server actions integration
        retry: (failureCount, error) => {
          // Same RLS error handling for mutations
          const errorMessage = error?.message?.toLowerCase() || ''
          if (
            errorMessage.includes('row level security') ||
            errorMessage.includes('rls') ||
            errorMessage.includes('insufficient_privilege') ||
            errorMessage.includes('permission denied')
          ) {
            return false
          }
          
          // Don't retry mutations as much - they might have side effects
          return failureCount < 1
        },
        onError: (error) => {
          // Log mutation errors for debugging
          console.error('Mutation error:', error)
        }
      },
    },
  })
}

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export { getQueryClient }

// Export specific configurations for different data types
export const CACHE_TIMES = {
  // Critical user data - cache longer, update in background
  user_profile: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
  },
  
  // Studio data - moderate caching for discovery
  studios: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  },
  
  // Real-time data - short cache times
  messages: {
    staleTime: 30 * 1000,     // 30 seconds
    gcTime: 5 * 60 * 1000,    // 5 minutes
  },
  
  // Static reference data - cache longer
  amenities: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
  },
  
  // Booking data - short cache due to availability changes
  bookings: {
    staleTime: 1 * 60 * 1000,  // 1 minute
    gcTime: 5 * 60 * 1000,     // 5 minutes
  }
} as const