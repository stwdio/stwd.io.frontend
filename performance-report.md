# Studio Detail Page Performance Analysis Report

## Executive Summary

This report analyzes the performance bottleneck when navigating from the `/browse` page to a studio detail page (e.g., `/studios/time-machine-studios`). The investigation reveals multiple sequential data fetches creating a "waterfall effect" that significantly delays page rendering.

## Part 1: The Initial User Action

### The Link Component

**Location**: `components/studio-card.tsx:209-213`

```typescript
<Link
  href={`/studios/${studio.slug || studio.id}`}
  className={cn(linkToStudio && "cursor-pointer")}
  prefetch={false}
>
```

**Evidence**: The studio card uses Next.js `<Link>` component for navigation. The entire card is wrapped in this Link when `linkToStudio` prop is true (default), making the full card clickable.

## Part 2: The Data Fetching Process for the Detail Page

### Page Component Analysis

**Location**: `app/studios/[slug]/page.tsx`

**Component Type**: **Server Component** (no `'use client'` directive)

### Data Fetching Function

The page makes **4 sequential database queries**:

#### Query 1: Slug Resolution (Conditional)
```typescript
// Lines 48-52
const { data: studioWithSlug } = await supabase
  .from("studios")
  .select("slug")
  .eq("id", parseInt(params.slug))
  .single()
```

#### Query 2: Studio Details
```typescript
// Lines 61-65
const { data: studio } = await supabase
  .from("studios")
  .select("*")
  .eq("slug", params.slug)
  .single()
```

#### Query 3: Amenities
```typescript
// Lines 74-79
const { data: amenitiesData } = await supabase
  .from("studio_amenities")
  .select(`
    amenities (name)
  `)
  .eq("studio_id", studio.id)
```

#### Query 4: Reviews (via helper function)
```typescript
// Line 81
const { reviews, averageRating } = await getStudioReviews(studio.id)

// Helper function (lines 27-42)
const { data: reviews } = await supabase
  .from("reviews")
  .select(`
    *,
    profiles (
      name,
      avatar_url
    )
  `)
  .eq("reviewed_entity_id", studioId)
  .eq("reviewed_entity_type", "studio")
  .order("created_at", { ascending: false })
```

### Data Waterfall Analysis

**Critical Issue**: All queries execute sequentially with blocking `await` calls:

1. **Slug resolution** (if numeric ID) → ~100ms
2. **Studio details** → ~100ms (waits for #1)
3. **Amenities** → ~100ms (waits for #2 to get studio.id)
4. **Reviews** → ~100ms (waits for #2 to get studio.id)

**Total time**: ~300-400ms sequential vs ~100-200ms if parallelized

## Part 3: The Rendering Process

### Component Structure

```
app/studios/[slug]/page.tsx (Server Component)
└── StudioDetailContent (Client Component)
    ├── Studio Header & Images
    ├── Studio Information
    ├── Amenities Display
    ├── StudioDetailActions (Client Component)
    │   └── Fetches additional user data client-side
    └── StudioReviews (Client Component)
```

### Client-Side Data Fetching

**StudioDetailActions** makes 2 additional sequential queries client-side:

1. **User Profile Query**:
```typescript
const { data: profileData } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id)
  .single()
```

2. **Inquiry Status Check**:
```typescript
const { data: inquiryCheck } = await supabase
  .from('inquiry_recipients')
  .select(`
    inquiry_id,
    inquiries!inner(creator_id)
  `)
  .eq('studio_id', studio.id)
  .eq('inquiries.creator_id', profileData.id)
  .limit(1)
```

## Part 4: Final Summary & Hypothesis

### Timeline of Events

1. **User clicks studio card** → Next.js navigation initiated
2. **Server receives request** → Server Component begins execution
3. **Server fetches data sequentially**:
   - Conditional slug resolution (~100ms)
   - Studio details (~100ms)
   - Amenities (~100ms)
   - Reviews (~100ms)
4. **Server renders HTML** → Sends to client
5. **Client hydrates React** → Page becomes interactive
6. **StudioDetailActions mounts** → Initiates client-side fetches:
   - User authentication check
   - Profile fetch (~100ms)
   - Inquiry status check (~100ms)
7. **Final UI renders** → All interactive elements visible

### Primary Hypothesis

**The page load delay is caused by two compounding factors:**

1. **Server-side data waterfall**: Sequential queries (300-400ms) instead of parallel execution
2. **Client-side data fetching**: Additional 200ms+ for user-specific data after initial page load

### Recommended Optimizations

1. **Parallelize server queries**:
```typescript
const [amenitiesResult, reviewsData] = await Promise.all([
  supabase.from("studio_amenities").select(`amenities (name)`).eq("studio_id", studio.id),
  getStudioReviews(studio.id)
])
```

2. **Pre-fetch user data server-side**: Pass user profile as props to avoid client-side fetching

3. **Implement progressive enhancement**: Show UI immediately, enhance with user-specific features

4. **Add prefetching**: Enable Link prefetch for predictable navigation patterns

These optimizations could reduce total load time from ~600ms to ~200ms, providing a 3x performance improvement.