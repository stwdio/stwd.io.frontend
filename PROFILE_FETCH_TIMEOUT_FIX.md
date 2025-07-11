# Profile Fetch Timeout Fix - Implementation Overview

## Problem Summary
Users experienced a 10-second timeout with "Profile fetch timeout" error when refreshing the page while logged in. The app would hang with a loading spinner, then recover after the timeout, indicating the data was available but the fetch operation was stuck.

## Root Cause
The application was using a client-only Supabase authentication pattern in a Next.js App Router environment, causing a race condition between:
1. Client-side hydration
2. Auth cookie validation
3. Profile data fetching

The client attempted to fetch profile data before the Supabase client had properly synchronized its auth state from cookies, causing the query to hang indefinitely.

## Solution Architecture
Implemented the complete @supabase/ssr pattern with proper server-client separation:

### 1. Three Distinct Supabase Clients
- **Client Components**: `createClient()` in `lib/supabase/client.ts`
- **Server Components**: `createServerComponentClient()` in `lib/supabase/server.ts`
- **Server Actions**: `createServerActionClient()` in `lib/supabase/server.ts`

### 2. Middleware for Cookie Synchronization
- Created `updateSession()` in `lib/supabase/middleware.ts`
- Intercepts ALL requests to validate/refresh JWT tokens
- Ensures auth state is synchronized BEFORE page rendering

### 3. Server-Side Data Fetching
- Converted `app/layout.tsx` to async Server Component
- Fetches user and profile data server-side
- Passes data as props to AuthProvider

### 4. Refactored AuthContext
- Accepts `initialUser` and `initialProfile` props
- No async operations on mount
- Only listens for auth state CHANGES
- Removed ALL timeout workarounds (no Promise.race, no setTimeout)

## Files Modified

### `/lib/supabase/client.ts`
```typescript
// Removed singleton pattern
// Now creates fresh client instance each time
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `/lib/supabase/server.ts`
```typescript
// Added two server client functions
export async function createServerComponentClient() // Read-only
export async function createServerActionClient()    // Read/write cookies
```

### `/lib/supabase/middleware.ts`
```typescript
// Handles cookie refresh on every request
export async function updateSession(request: NextRequest)
```

### `/middleware.ts`
```typescript
// Root middleware that calls updateSession
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

### `/app/layout.tsx`
```typescript
// Now async Server Component
export default async function RootLayout() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    profile = data
  }

  return (
    <AuthProvider initialUser={user} initialProfile={profile}>
      {children}
    </AuthProvider>
  )
}
```

### `/lib/auth/auth-context.tsx`
```typescript
// Accepts server data as props
export function AuthProvider({ 
  children, 
  initialUser,    // From server
  initialProfile  // From server
}: AuthProviderProps) {
  // No useEffect fetching on mount
  // Only listens for auth state CHANGES
}
```

## How The Fix Works

1. **User refreshes page** → Browser sends request with auth cookies
2. **Middleware intercepts** → Validates/refreshes JWT if needed
3. **Root layout runs server-side** → Fetches user/profile with valid auth
4. **Data passed to client** → AuthProvider initialized with complete data
5. **Client hydrates** → No race condition, no hanging queries

## Key Benefits
- Eliminates race condition completely
- No more timeout workarounds needed
- Follows official Supabase Next.js patterns
- Better performance (server-side data fetching)
- More reliable auth state management

## Testing the Fix
1. Log in to the application
2. Navigate to any authenticated page
3. Refresh the page (F5)
4. Should load immediately without timeout
5. No console errors about "Profile fetch timeout"

## Migration Notes
- Ensure all environment variables are set
- No database changes required
- Compatible with existing RLS policies
- **NO backward compatibility** - all imports must be updated

## Import Changes Required
When implementing this fix, ALL imports must be updated:

### For Server Actions (use server directive)
```typescript
// OLD: import { createClient } from '@/lib/supabase/server'
// NEW:
import { createServerActionClient } from '@/lib/supabase/server'
const supabase = await createServerActionClient()
```

### For Server Components
```typescript
// OLD: import { createClient } from '@/lib/supabase/server'
// NEW:
import { createServerComponentClient } from '@/lib/supabase/server'
const supabase = await createServerComponentClient()
```

### For Client Components
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

**IMPORTANT**: The generic `createClient` export from server.ts has been REMOVED. You must use the specific function for your context.