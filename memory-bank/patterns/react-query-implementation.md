# React Query Implementation Patterns

## Overview

This codebase uses React Query (TanStack Query v5) with the `@supabase-cache-helpers/postgrest-react-query` library for optimized Supabase integration. The implementation follows a pattern of centralized query configuration with domain-specific hooks.

## Core Setup

### Query Client Configuration (`lib/react-query/client.ts`)

The query client is configured with:
- **Singleton Pattern**: Different instances for server/client to prevent hydration issues
- **Smart Retry Logic**: Automatically skips RLS (Row Level Security) errors that won't succeed
- **Optimized Cache Times**: Different stale/garbage collection times for different data types
- **Error Handling**: Built-in error logging for mutations

```typescript
// Key configurations:
- staleTime: 2 minutes (default for list data)
- gcTime: 10 minutes (garbage collection)
- refetchOnWindowFocus: false (reduces unnecessary API calls)
- refetchOnReconnect: true (syncs data when coming back online)
```

### Provider Setup (`lib/react-query/provider.tsx`)

- Client-side component that wraps the app
- Includes React Query DevTools for development
- Uses the singleton query client from `client.ts`

### Cache Time Presets

Predefined cache configurations for different data types:
- **user_profile**: 5 min stale, 30 min GC (critical user data)
- **studios**: 2 min stale, 10 min GC (discovery data)
- **messages**: 30 sec stale, 5 min GC (real-time data)
- **amenities**: 15 min stale, 1 hour GC (static reference data)
- **bookings**: 1 min stale, 5 min GC (availability-sensitive)

## Query Hooks Pattern

### 1. Supabase Cache Helpers Integration

The codebase uses `@supabase-cache-helpers/postgrest-react-query` for most queries, which provides:
- Automatic cache key generation based on Supabase queries
- Optimistic updates support
- Real-time subscriptions integration

Example from `studios.ts`:
```typescript
export function useStudios() {
  return useQuery(
    getSupabaseClient()
      .from('studios')
      .select(`...`)
      .eq('published', true),
    {
      ...CACHE_TIMES.studios,
    }
  )
}
```

### 2. Standard React Query for Complex Operations

For operations not directly supported by cache helpers (like custom RPC calls or complex data transformations), standard React Query is used:

```typescript
export function useAvailableGear() {
  return useReactQuery({
    queryKey: ['gear', 'available'],
    queryFn: async () => {
      // Custom data fetching and transformation logic
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  })
}
```

### 3. Infinite Queries for Pagination

The `useStudiosInfinite` hook demonstrates infinite scrolling pattern:
- Manual query key construction for complex filters
- Custom `getNextPageParam` logic
- Integration with Supabase's range queries
- Support for dynamic filtering (location, price, amenities, gear)

### 4. Real-time Subscriptions

The messaging queries show real-time integration:
```typescript
export function useMessageSubscription(conversationId: number | null) {
  const { status } = useSubscription(
    getSupabaseClient(),
    `messages:conversation_id=eq.${conversationId}`,
    {
      event: '*',
      table: 'messages',
      schema: 'public',
    }
  )
}
```

## Key Implementation Patterns

### 1. Consistent Client Usage
All hooks use a centralized `getSupabaseClient()` function to ensure the same client instance is used.

### 2. Enabled Conditions
Queries are disabled when required parameters are missing:
```typescript
enabled: !!studioId, // Only run query if studioId exists
```

### 3. Relationship Loading
Complex queries load related data in a single request:
```typescript
.select(`
  *,
  amenities!studio_amenities(id, name),
  reviews(*),
  owner:profiles(*)
`)
```

### 4. RPC Function Integration
Database functions are called through React Query for caching benefits:
```typescript
useQuery(
  getSupabaseClient().rpc('get_batch_studio_list_memberships_optimized', {
    studio_ids: studioIds,
    user_profile_id: userProfileId!
  })
)
```

### 5. Error Boundary Compatibility
The retry logic prevents infinite retry loops for permission errors, making it safe to use with error boundaries.

## Domain-Specific Hooks

### Studios (`lib/hooks/queries/studios.ts`)
- `useStudios()` - All published studios
- `useStudio(id)` - Single studio details
- `useStudiosInfinite(filters)` - Paginated browsing with filters
- `useMyStudios(ownerId)` - Owner's studios
- `useAmenities()` - Reference data
- `useAvailableGear()` - Dynamic gear extraction from JSONB

### Messaging (`lib/hooks/queries/messaging.ts`)
- `useUserConversations(userId)` - User's conversations
- `useConversationMessages(conversationId)` - Messages in a conversation
- `useMessageSubscription(conversationId)` - Real-time updates
- `useUnreadMessageCount(userId)` - Notification badges

### Auth (`lib/hooks/queries/auth.ts`)
- `useProfile(userId)` - Current user profile
- `useProfileById(profileId)` - Other user profiles
- `useMyProfileId()` - Current user's profile ID
- `useIsAdmin()` - Admin status check
- `useUserLists(userId)` - User's saved lists
- `useUserBookings(userId)` - User's bookings
- `useUserNotifications(userId)` - Notifications with real-time updates

## Best Practices Observed

1. **No Direct Mutations**: The codebase doesn't use `useMutation` - likely handling updates through server actions or direct Supabase client calls
2. **Optimistic Updates**: While not implemented, the cache helpers support this pattern
3. **Prefetching**: Not currently used but could be added for route transitions
4. **Cache Invalidation**: Currently relying on stale times rather than manual invalidation

## Integration with App Architecture

1. **Provider Hierarchy**: ReactQueryProvider wraps AuthProvider to ensure queries have access to auth state
2. **Server-Side Data**: Initial auth data is fetched server-side and passed to providers
3. **RLS Integration**: Queries don't need auth checks - RLS handles permissions at the database level
4. **Type Safety**: All queries use TypeScript types generated from the database schema

## Performance Optimizations

1. **Batch Queries**: Uses RPC functions for N+1 query prevention
2. **Selective Fetching**: Only fetches needed columns
3. **Disabled Queries**: Prevents unnecessary requests when data isn't needed
4. **Cache Sharing**: Related queries can share cached data through cache helpers

## Potential Improvements

1. **Mutation Hooks**: Could add `useMutation` wrappers for consistent error handling
2. **Prefetching**: Could prefetch data on hover/route changes
3. **Cache Invalidation**: Could add targeted invalidation after mutations
4. **Optimistic Updates**: Could implement for better UX on slow connections
5. **Query Composition**: Could create higher-level hooks that combine multiple queries