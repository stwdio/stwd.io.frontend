import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in Client Components.
 * This client automatically handles cookie-based auth state.
 * 
 * Key differences from old implementation:
 * - Uses the same cookie mechanism as server clients
 * - Properly syncs with server-side auth state
 * - No race conditions on page refresh
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
