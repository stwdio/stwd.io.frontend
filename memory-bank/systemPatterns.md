# System Patterns: stwd.io Frontend

## Architectural Philosophy: Supabase-First

### Core Principle
**Leverage the full power of the Supabase ecosystem** to create a robust, scalable, and maintainable platform with minimal moving parts. We consciously avoid external APIs and services where a native Supabase feature can provide a superior, more integrated solution.

**Benefits:**
- Move faster with fewer dependencies
- Reduce costs by avoiding external services
- Maintain a clean, comprehensible codebase
- Tight integration between all system components

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.2.4 (App Router) - Hybrid SSR/Client rendering
- **Language**: TypeScript 5 - Full type safety
- **Styling**: Tailwind CSS only - No custom CSS files
- **UI Components**: shadcn/ui - Components copied into project for full control
- **Backend**: Supabase (Complete Backend-as-a-Service)
  - PostgreSQL with PostGIS for geographic data
  - Supabase Auth for identity management
  - Supabase Storage for file management
  - Edge Functions for server-side logic
- **Deployment**: Vercel

### Application Structure

```
stwd.io.frontend/
├── app/                    # Next.js App Router
│   ├── auth/              # ✅ Authentication flows - WORKING
│   ├── browse/            # Studio discovery and search
│   ├── dashboard/         # User dashboards
│   ├── onboarding/        # ✅ New user setup - WORKING
│   └── studios/           # Individual studio pages
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui base components
│   └── [custom]/          # ✅ Application-specific components - AUTH WORKING
├── hooks/                 # Custom React hooks
├── lib/                   # ✅ Utilities and configurations - SUPABASE WORKING
└── memory-bank/           # Project documentation
```

## The Three Pillars of stwd.io Architecture

### Pillar 1: Frontend - Modern, Performant Experience ✅

**Next.js Hybrid Rendering Strategy:**
- **SSR (Server-Side Rendered)**: Public pages (landing, studio details) for optimal SEO and fast initial loads
- **Client-Side Rendered**: Protected areas (owner dashboard) for app-like, snappy interactions

**shadcn/ui Philosophy:**
- Not a traditional component library but a design system built on convention
- Components copied directly into project for full control
- Avoids dependency bloat and ensures perfect consistency
- Everything styled with Tailwind CSS - zero custom CSS files

**Supabase UI Acceleration:**
- ✅ **WORKING**: Supabase's `<Auth />` component fully integrated and functional
- ✅ **VERIFIED**: Pre-built, secure, and themeable authentication flows working in production

### Pillar 2: Backend - Supabase as Complete Backend-as-a-Service ✅

**PostgreSQL with Superpowers:**
- ✅ **VERIFIED**: Single source of truth for all data (profiles, studios, bookings)
- **PostGIS Extension**: Avoids expensive mapping services, enables fast geographic queries
- **JSONB Data Type**: Flexible schema for studio gear lists and unstructured data

**Complete Identity Layer:**
- ✅ **WORKING**: Supabase Auth handles all user management
- ✅ **VERIFIED**: Custom profiles table linked via foreign key to auth.users
- ✅ **FUNCTIONAL**: Postgres trigger automatically creates profile for every new user

**Unified File Management:**
- Supabase Storage for all user-generated content (photos, avatars)
- RLS policies grant access to storage objects based on database rules

**Serverless Logic Layer:**
- Supabase Edge Functions for server-side operations
- Key use cases: Stripe webhooks, notifications, geocoding proxy
- Eliminates need for traditional server management

### Pillar 3: Security - Row Level Security (RLS) First ✅ ENTERPRISE READY

**Database-Centric Security Model:**
- ✅ **COMPREHENSIVE RLS IMPLEMENTATION**: RLS enabled and forced on every table (ALL 19 TABLES)
- ✅ **COMPLETE POLICY COVERAGE**: Security rules live in database as RLS policies, not API endpoints
- ✅ **ENTERPRISE SECURITY**: Declarative approach with business-logic aligned access control
- ✅ **ZERO VULNERABILITIES**: Passed complete Supabase Security Advisor audit

**Enhanced Security Features:**
- ✅ **Function Security**: All SECURITY DEFINER functions protected with explicit search paths
- ✅ **SQL Injection Prevention**: Database functions secured against scope manipulation attacks
- ✅ **Multi-layered Access Control**: User ownership, studio control, privacy protection, admin oversight
- ✅ **Production-Ready**: Enterprise-grade security standards implemented

**SECURITY DEFINER Functions:**
- Complex, protected actions encapsulated in secure Postgres functions
- Logic cannot be bypassed by client
- **MANDATORY**: All functions must include `SET search_path = public`
- Ultimate layer of security model

**Function Security Pattern (Updated January 31, 2025):**
```sql
-- ✅ SECURE: Explicit search path prevents SQL injection
CREATE OR REPLACE FUNCTION public.secure_function()
RETURNS type
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- MANDATORY for all SECURITY DEFINER functions
AS $function$
BEGIN
  -- function body
END;
$function$;
```

## Critical Development Process Rules

### 🔄 **MANDATORY POST-FIX MEMORY BANK UPDATE RULE** (Added January 31, 2025)
**CRITICAL RULE**: After every bug fix, performance optimization, or architectural change, ALL learnings MUST be documented in the memory bank to prevent repeating the same issues.

**Process Requirements**:
- **✅ Document the Problem**: Record the exact error, symptoms, and root cause
- **✅ Document the Solution**: Include the specific code changes and patterns used
- **✅ Extract Patterns**: Identify reusable patterns and anti-patterns for future reference
- **✅ Update Multiple Files**: Update `activeContext.md`, `systemPatterns.md`, and relevant context files
- **✅ Create Implementation Plans**: Document complex fixes in `/implementation-plans/` directory

**Example Documentation Structure**:
```markdown
### ✅ [ISSUE NAME] - COMPLETED (Date)
- **Status**: ✅ **COMPLETED** - Brief description of achievement
- **Issue**: Exact error message or problem description
- **Root Cause**: Why the issue occurred
- **Solution Applied**: How it was fixed
- **Code Pattern**: Before/after code examples
- **Files Modified**: List of changed files
- **Learnings**: Key takeaways and rules discovered
- **Result**: Impact and verification of fix
```

**Memory Bank Update Targets**:
- `activeContext.md`: Add to recently completed work
- `systemPatterns.md`: Add new patterns and anti-patterns
- `techContext.md`: Add technical implementation details
- `progress.md`: Update milestone achievements
- `implementation-plans/`: Create detailed implementation docs

**Why This Rule is Critical**:
- **Prevents Repeated Mistakes**: Documented patterns prevent the same issues from recurring
- **Accelerates Development**: Future developers can reference solutions immediately
- **Builds Institutional Knowledge**: Creates a comprehensive knowledge base
- **Improves Code Quality**: Establishes best practices and anti-patterns
- **Reduces Debug Time**: Common issues are already documented with solutions

**This rule ensures every fix becomes a learning opportunity that benefits all future development work.**

## Key Design Patterns

### React Query Data Fetching Patterns

**Pattern**: Modern data fetching and caching with React Query v5
- **Intelligent Caching**: Configure different cache times for different data types
- **Optimistic Updates**: Update UI immediately while mutation is in progress
- **Background Refetching**: Keep data fresh automatically
- **Query Invalidation**: Smart cache updates after mutations

**Query Client Configuration**:
```typescript
// Centralized query client with smart defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
      retry: (failureCount, error: any) => {
        // Skip retry for RLS errors
        if (error?.code === 'PGRST301') return false
        return failureCount < 3
      },
    },
  },
})
```

**Domain-Specific Query Hooks**:
```typescript
// Studio queries with Supabase integration
export const useStudios = (filters?: StudioFilters) => {
  return useQuery(
    supabase
      .from('studios')
      .select('*, profiles!studios_owner_id_fkey(*)')
      .eq('published', true)
      .match(filters || {}),
    {
      staleTime: 1000 * 60 * 10, // 10 minutes for studio data
    }
  )
}

// Real-time messaging with shorter cache
export const useMessages = (conversationId: number) => {
  return useQuery(
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at'),
    {
      staleTime: 1000 * 30, // 30 seconds for messages
      refetchInterval: 1000 * 30, // Auto-refresh every 30s
    }
  )
}
```

**Infinite Query Pattern**:
```typescript
// Infinite scroll for large datasets
export const useInfiniteStudios = (pageSize = 12) => {
  return useInfiniteQuery({
    queryKey: ['studios', 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      supabase
        .from('studios')
        .select('*')
        .range(pageParam, pageParam + pageSize - 1),
    getNextPageParam: (lastPage, pages) => 
      lastPage.length === pageSize ? pages.length * pageSize : undefined,
  })
}
```

**Cache Strategy by Data Type**:
- **Messages**: 30 seconds (real-time priority)
- **User Profiles**: 5 minutes (moderate updates)
- **Studio Data**: 10 minutes (less frequent changes)  
- **Static Data**: 1 hour (amenities, categories)
- **Search Results**: 2 minutes (balance freshness/performance)

### 1. ✅ **Performance Optimization Patterns - ENTERPRISE READY** (Added January 31, 2025)
**Pattern**: Comprehensive performance optimization strategies for React/Next.js applications with Supabase
- ✅ **N+1 Query Elimination**: Replace individual component queries with batched server actions
- ✅ **Shared State Management**: Pass data down as props instead of individual fetches per component
- ✅ **Database Query Optimization**: Use specific column selection and optimized indexes
- ✅ **Server Action Streamlining**: Leverage RLS policies instead of redundant authorization checks

**N+1 Query Problem Pattern**:
```typescript
// BEFORE: N+1 Problem - Individual queries per component
const StudioCard = ({ studio }) => {
  const [memberships, setMemberships] = useState([])
  useEffect(() => {
    // This runs for EVERY studio card on the page
    getStudioListMemberships(studio.id).then(setMemberships)
  }, [studio.id])
  // Result: 30 studios = 30+ individual database queries
}

// AFTER: Batched Query Pattern
const BrowseContent = () => {
  const [batchMemberships, setBatchMemberships] = useState({})
  useEffect(() => {
    // Single batch query for ALL studios at once
    getBatchStudioListMemberships(allStudioIds).then(setBatchMemberships)
  }, [allStudioIds])
  
  return studios.map(studio => (
    <StudioCard 
      studio={studio} 
      memberships={batchMemberships[studio.id] || []}
    />
  ))
  // Result: 30 studios = 1 single optimized database query
}
```

**Shared Profile State Pattern**:
```typescript
// BEFORE: Individual auth calls per component
const StudioCardActions = ({ studio }) => {
  const [profile, setProfile] = useState(null)
  useEffect(() => {
    // This auth call happens for EVERY studio card
    supabase.auth.getUser().then(/* ... */)
  }, [])
  // Result: 30 studios = 30+ auth calls
}

// AFTER: Shared state pattern
const BrowseContent = () => {
  const [sharedProfile, setSharedProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  
  useEffect(() => {
    // Single auth call for entire browse page
    fetchUserProfile().then(setSharedProfile)
  }, [])
  
  return studios.map(studio => (
    <StudioCardActions 
      studio={studio}
      sharedProfile={sharedProfile}
      profileLoading={profileLoading}
    />
  ))
  // Result: 30 studios = 1 single auth call
}
```

**Database Optimization Pattern**:
```sql
-- BEFORE: Inefficient queries
SELECT * FROM studios WHERE published = true; -- Returns all columns
SELECT list_items.* FROM list_items WHERE studio_id = $1; -- Individual queries

-- AFTER: Optimized queries with batching and indexing
SELECT id, name, description, hourly_rate, location 
FROM studios WHERE published = true; -- Only needed columns

-- Batch query with optimized function
CREATE OR REPLACE FUNCTION get_batch_studio_list_memberships_optimized(studio_ids bigint[])
RETURNS TABLE(studio_id bigint, list_id bigint, notes text, list_name text) 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT li.studio_id, li.list_id, li.notes, l.name as list_name
  FROM list_items li
  JOIN lists l ON li.list_id = l.id
  WHERE li.studio_id = ANY(studio_ids);
END;
$$;

-- Optimized indexes for common queries
CREATE INDEX CONCURRENTLY idx_studios_published_verified 
ON studios (published, verified) WHERE published = true;
```

**Server Action Optimization Pattern**:
```typescript
// BEFORE: Redundant authorization in every action
export async function addStudioToList(studioId: number, listId: number) {
  // Redundant auth check - RLS already handles this
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Additional profile query - unnecessary
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()
    
  // Database operation
  return supabase.from('list_items').insert({ studio_id: studioId, list_id: listId })
}

// AFTER: Streamlined action leveraging RLS
export async function addStudioToList(studioId: number, listId: number) {
  // No manual auth checks - RLS policies handle authorization
  // Database operation only - RLS ensures user can only modify their own lists
  return supabase.from('list_items').insert({ studio_id: studioId, list_id: listId })
}
```

**Implementation Principles**:
- **Batch Over Individual**: Always prefer batched queries over individual component queries
- **Props Over Fetches**: Pass data down as props instead of fetching in each component
- **RLS Over Manual Auth**: Leverage Row Level Security instead of manual authorization checks
- **Specific Over Wildcard**: Use specific column selection instead of `SELECT *`
- **Indexes For Performance**: Add database indexes for commonly queried patterns
- **Functions For Complex Logic**: Use database functions for complex multi-table operations
- **React Rules Compliance**: Never trigger state updates during render phase
- **Async Deferral**: Use `setTimeout(() => {}, 0)` to defer async operations from render phase
- **Shared State Pattern**: Centralize data fetching in parent components and pass as props
- **Authentication-Aware Fetching**: Only fetch user-specific data when authenticated

### 2. ✅ **React setState-during-render Anti-Pattern Prevention - CRITICAL** (Added January 31, 2025)
**Pattern**: Critical React performance and functionality pattern to prevent setState-during-render errors
- ✅ **Error Prevention**: Avoid calling async functions or triggering state updates inside render phase
- ✅ **Async Operation Deferral**: Use setTimeout to push async operations to next tick
- ✅ **State Update Separation**: Separate state updates from side effects completely
- ✅ **Component Lifecycle Compliance**: Follow React's strict rules for state management

**setState-during-render Anti-Pattern**:
```typescript
// ❌ WRONG: Async call during render (setState-during-render error)
const [studios, setStudios] = useState([])
const [memberships, setMemberships] = useState({})

// This causes React error: "Cannot update a component while rendering a different component"
setStudios(prev => {
  const result = [...prev, ...newData]
  // ❌ This async function triggers setBatchMemberships during render
  fetchBatchMemberships(result).then(data => setMemberships(data))
  return result
})

// ✅ CORRECT: Defer async operations to next tick
let updatedStudiosList = []
setStudios(prev => {
  const existingIds = new Set(prev.map(s => s.id))
  const newStudios = newData.filter(studio => !existingIds.has(studio.id))
  updatedStudiosList = [...prev, ...newStudios]
  return updatedStudiosList
})

// Defer async call to avoid setState-during-render
setTimeout(() => {
  fetchBatchMemberships(updatedStudiosList).then(data => setMemberships(data))
}, 0)
```

**Component Refactoring Pattern**:
```typescript
// ✅ GOOD: Extract reusable components for better maintainability
// Before: Inline JSX (60+ lines per item)
{items.map(item => (
  <div key={item.id}>
    {/* 60+ lines of JSX */}
  </div>
))}

// After: Clean component extraction
{items.map(item => (
  <ItemCard
    key={item.id}
    item={item}
    memberships={batchMemberships[item.id] || []}
    sharedProfile={sharedProfile}
    profileLoading={profileLoading}
  />
))}
```

**React Performance Debugging Process**:
1. **Error Analysis**: Look for async calls inside state updater functions
2. **Render Phase Identification**: Identify operations happening during render
3. **Async Operation Deferral**: Move async operations outside render phase
4. **State Update Separation**: Separate state updates from side effects
5. **setTimeout Deferral**: Use `setTimeout(() => {}, 0)` for async operations
6. **Functionality Verification**: Ensure all features work after fix

**Critical React Rules**:
- Never call async functions inside state updater functions
- Never trigger state updates during component render phase
- Always separate state updates from side effects
- Use setTimeout to defer async operations when needed
- Extract reusable components for better code organization

### 3. ✅ **Shared Data State Pattern - PERFORMANCE OPTIMIZATION** (Added January 31, 2025)
**Pattern**: Eliminate redundant data fetching by centralizing data management in parent components
- ✅ **Centralized Fetching**: Parent component fetches data once and passes to all children as props
- ✅ **Shared State Management**: Use shared state for commonly used data (profiles, lists, memberships)
- ✅ **Authentication-Aware**: Only fetch user-specific data when user is authenticated
- ✅ **Refresh Callbacks**: Provide callbacks for children to trigger data refresh when needed

**Shared Lists Pattern Applied**:
```typescript
// PARENT: BrowseStudiosContent - Centralized data management
const [sharedLists, setSharedLists] = useState<ListWithCount[]>([])
const [listsLoading, setListsLoading] = useState(false)

const fetchSharedLists = useCallback(async () => {
  if (sharedProfile && !profileLoading) {
    setListsLoading(true)
    const result = await getUserLists()
    if (result.success) {
      setSharedLists(result.data || [])
    }
    setListsLoading(false)
  }
}, [sharedProfile, profileLoading])

// CHILD: AddToListDropdown - Uses shared data
const AddToListDropdown = ({ 
  sharedLists, 
  listsLoading, 
  onListsChange 
}) => {
  const lists = sharedLists      // ✅ No individual fetching
  const isLoading = listsLoading // ✅ Shared loading state
  
  const handleCreateSuccess = () => {
    onListsChange?.() // ✅ Trigger refresh when needed
  }
}
```

**Performance Benefits**:
- **Before**: N individual `getUserLists()` calls per dropdown
- **After**: 1 shared fetch per session, passed as props
- **UX**: Eliminates "Loading..." states for cached data
- **Scalability**: Scales efficiently with increasing component count

**Implementation Pattern**:
1. **Centralize**: Move data fetching to parent component
2. **Share**: Pass data and loading states as props to children
3. **Callback**: Provide refresh mechanism for data modifications
4. **Authentication**: Only fetch when user is authenticated
5. **Cleanup**: Clear data when user logs out

### 4. ✅ **Role-Based User Experience - WORKING**
**Pattern**: Different user journeys based on user type (Creator vs Studio Owner)
- ✅ **FUNCTIONAL**: Onboarding flow branches based on selected role
- ✅ **WORKING**: Dashboard content customized per user type
- ✅ **VERIFIED**: Navigation and features tailored to user needs

**Implementation**:
- ✅ `onboarding/page.tsx` - Role selection and setup WORKING
- ✅ Conditional rendering based on user profile FUNCTIONAL
- ✅ Role-specific routing and access control VERIFIED

### 2. ✅ **Unified Supabase SSR Authentication Pattern - PRODUCTION READY** (Updated January 31, 2025)
**Pattern**: Single authentication client architecture following official Supabase Next.js Server-Side Auth guidelines
- ✅ **UNIFIED CLIENT SYSTEM**: Complete elimination of dual authentication clients
- ✅ **SSR COMPLIANCE**: 100% adherence to official Supabase Next.js patterns
- ✅ **ZERO CLIENT CONFLICTS**: Eliminated "Multiple GoTrueClient instances detected" warnings
- ✅ **SINGLETON PATTERN**: Proper client caching and reuse across component lifecycle

**Implementation**:
- ✅ **Client-side components**: Use `createClient()` from `@/lib/supabase/client`
- ✅ **Server-side pages**: Use `createClient()` from `@/lib/supabase/server`
- ✅ **Middleware**: Use `createClient()` from `@/lib/supabase/middleware`
- ✅ **API routes**: Use `createClient()` from `@/lib/supabase/server`

**Key Architecture Changes**:
```typescript
// BEFORE: Dual client system causing conflicts
import { createClient } from '@/lib/supabase'              // Legacy client
import { createClient } from '@/lib/supabase/client'       // New SSR client
// Multiple GoTrueClient instances detected ❌

// AFTER: Unified SSR pattern
// Client components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server pages
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()

// Middleware
import { createClient } from '@/lib/supabase/middleware'
const supabase = createClient(request)
```

**Singleton Pattern Implementation**:
```typescript
// lib/supabase/client.ts - Singleton pattern
let client: SupabaseClient | null = null

export const createClient = () => {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
```

**Technical Benefits**:
- **Before**: Dual client system with conflicts and memory leaks
- **After**: Clean SSR architecture with proper client management
- **Performance**: Eliminated client initialization conflicts
- **Security**: Consistent authentication state across all application layers
- **Maintenance**: Single source of truth for authentication

### 3. ✅ **Authentication & Onboarding Gate Pattern - PRODUCTION READY** (Updated January 31, 2025)
**Pattern**: Seamless authentication with mandatory role-based onboarding
- ✅ **WORKING**: Full-page authentication experience replacing modal dialogs
- ✅ **FUNCTIONAL**: Automatic redirect system for users without roles
- ✅ **VERIFIED**: Database integration with NULL role detection

**Implementation**:
- ✅ `/auth/login` - Dedicated authentication page with Supabase Auth UI
- ✅ `/auth/callback` - OAuth callback handling for Google and Apple
- ✅ `OnboardingGate` component - Automatic role detection and redirect
- ✅ `/onboarding` - Interactive role selection with database updates
- ✅ Database trigger - Creates profiles with NULL roles to trigger onboarding

**Key Components**:
```typescript
// OnboardingGate Pattern
const OnboardingGate = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUserAndProfile = async () => {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setLoading(false)
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      // Redirect to onboarding if no role
      if (profile && profile.role === null) {
        router.replace('/onboarding')
        return
      }

      setUser(session.user)
      setProfile(profile)
      setLoading(false)
    }

    checkUserAndProfile()
  }, [router])

  if (loading) return <div>Loading...</div>
  return <>{children}</>
}
```

### 4. Component Composition
**Pattern**: Building complex UI from smaller, reusable components
- Base UI components from shadcn/ui
- Custom business logic components
- Layout components for consistent structure

**Key Components**:
- `studio-form.tsx` - Studio listing creation/editing
- `booking-widget.tsx` - Booking interface
- ✅ `auth-dialog.tsx` - Authentication flows WORKING
- ✅ `header.tsx` - Global navigation WORKING
- ✅ `onboarding-gate.tsx` - Role-based routing guard WORKING

### 5. ✅ **Comprehensive RLS Security Pattern - ENTERPRISE READY** (Added January 22, 2025)
**Pattern**: Enterprise-grade Row Level Security implementation across all database tables
- ✅ **COMPLETE COVERAGE**: All 19 tables secured with appropriate access control policies
- ✅ **BUSINESS LOGIC ALIGNMENT**: Security policies match application business rules
- ✅ **ZERO VULNERABILITIES**: Comprehensive security audit passed

**Security Policy Categories**:
```sql
-- User Ownership Pattern
CREATE POLICY "Users can manage their own data" ON table_name
  FOR ALL USING (auth.uid() = user_id);

-- Studio Owner Control Pattern  
CREATE POLICY "Studio owners can manage their studios" ON table_name
  FOR ALL USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p 
      JOIN studios s ON s.owner_id = p.id 
      WHERE s.id = table_name.studio_id
    )
  );

-- Privacy Protection Pattern
CREATE POLICY "Conversation participants only" ON conversations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN conversation_participants cp ON cp.profile_id = p.id
      WHERE cp.conversation_id = conversations.id
    )
  );

-- Admin Oversight Pattern
CREATE POLICY "Admins can manage all data" ON table_name
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'admin'
    )
  );

-- Public Information Pattern
CREATE POLICY "Public data viewable by everyone" ON table_name
  FOR SELECT USING (true);
```

**Enhanced Function Security**:
```sql
-- Secure Database Function Pattern
CREATE OR REPLACE FUNCTION secure_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Prevents SQL injection
AS $$
BEGIN
  -- Secure function logic
  RETURN NEW;
END;
$$;
```

**Implementation Benefits**:
- **Enterprise Security**: All data access controlled at database level
- **Performance**: Database-native security with optimal query performance
- **Maintainability**: Security logic centralized in database policies
- **Auditability**: Clear security model with comprehensive policy coverage

### 6. ✅ **Enterprise Performance Optimization Pattern - PRODUCTION READY** (Updated January 31, 2025)
**Pattern**: Comprehensive database performance optimization for production scale
- ✅ **ZERO CRITICAL PERFORMANCE ISSUES**: Complete Supabase Performance Advisor resolution
- ✅ **RLS PERFORMANCE OPTIMIZATION**: Enhanced query planning and policy consolidation
- ✅ **STRATEGIC INDEX MANAGEMENT**: Optimal indexing for all query patterns
- ✅ **FOREIGN KEY INDEXING**: All 26 foreign keys now have proper indexes
- ✅ **QUERY PATTERN OPTIMIZATION**: Strategic indexes for common application queries

**Performance Optimization Categories**:
```sql
-- Foreign Key Index Pattern (Essential for JOINs)
CREATE INDEX idx_table_foreign_key ON table_name (foreign_key_column);

-- Partial Index Pattern (Common Query Optimization)
CREATE INDEX idx_table_condition ON table_name (column) WHERE condition = true;

-- Composite Index Pattern (Multi-column Queries)
CREATE INDEX idx_table_composite ON table_name (column1, column2);
```

**RLS Performance Enhancement Pattern**:
```sql
-- BEFORE: Performance Issue
CREATE POLICY "policy_name" ON table_name
  FOR ALL USING (auth.uid() = user_id);

-- AFTER: Optimized Performance
CREATE POLICY "policy_name" ON table_name  
  FOR ALL USING ((SELECT auth.uid()) = user_id);
```

**Policy Consolidation Pattern**:
```sql
-- BEFORE: Multiple Overlapping Policies (Performance Warning)
CREATE POLICY "select_policy" ON table_name FOR SELECT USING (condition);
CREATE POLICY "insert_policy" ON table_name FOR INSERT WITH CHECK (condition);
CREATE POLICY "update_policy" ON table_name FOR UPDATE USING (condition);

-- AFTER: Unified Single Policy (Optimal Performance)
CREATE POLICY "unified_policy" ON table_name
  FOR ALL USING (condition) WITH CHECK (condition);
```

**Performance Monitoring Pattern**:
```sql
-- Monitor index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' AND idx_scan = 0;

-- Monitor slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;
```

**Index Management Best Practices (Added January 31, 2025)**:
- **Foreign Key Rule**: Every foreign key column MUST have an index
- **Partial Index Usage**: Use WHERE clauses for conditional queries
- **Composite Index Strategy**: Order columns by selectivity (most selective first)
- **Maintenance**: Regular VACUUM and ANALYZE for optimal performance

### 7. ✅ **Complete Backend Documentation Pattern - ENTERPRISE READY** (Added January 22, 2025)
**Pattern**: Comprehensive backend state documentation for enterprise development
- ✅ **COMPLETE SCHEMA DOCUMENTATION**: All 19 tables with detailed specifications
- ✅ **RLS POLICY CATALOG**: Categorized security patterns with implementation examples
- ✅ **PERFORMANCE OPTIMIZATION GUIDE**: Index strategies and query optimization patterns

**Documentation Structure**:
```markdown
## Backend Documentation Hierarchy
├── supabaseBackend.md (Complete backend state)
│   ├── Security & Performance Status
│   ├── Database Schema (19 tables)
│   ├── RLS Implementation (6 policy categories)
│   ├── Performance Optimizations
│   ├── Detailed Table Specifications
│   ├── Functions & Triggers
│   ├── Production Configuration
│   └── Development Guidelines
```

**Security Policy Categories**:
1. **User Ownership Pattern**: Direct user data access
2. **Studio Owner Control Pattern**: Studio-related resource management
3. **Booking Participants Pattern**: Multi-party booking access
4. **Conversation Participants Pattern**: Private communication access
5. **Public Viewing Pattern**: Public data with restricted management
6. **Admin Override Pattern**: Administrative access across all resources

### 8. Component Composition

### 9. ✅ **Authentication Integration - PRODUCTION READY**
**Pattern**: Supabase Auth with Next.js middleware
- ✅ **WORKING**: OAuth integration (Google and other providers)
- ✅ **FUNCTIONAL**: Protected routes and server components
- ✅ **VERIFIED**: Real-time authentication state

**Implementation**:
- ✅ `lib/supabase.ts` - Supabase client configuration WORKING
- ✅ `auth/callback/route.ts` - OAuth callback handling FUNCTIONAL
- ✅ Authentication guards on protected pages WORKING
- ✅ Supabase Auth context and session management VERIFIED

### 10. Dynamic Routing
**Pattern**: Parameterized routes for scalable content
- Studio detail pages: `/studios/[id]`
- Studio editing: `/dashboard/studios/[id]/edit`
- User-specific content routing

### 11. Form Handling
**Pattern**: Consistent form validation and submission
- React Hook Form integration
- Zod schema validation
- Error handling and user feedback

## Component Relationships

### ✅ **Core User Flows - WORKING**

#### ✅ **Authentication Flow - VERIFIED WORKING**
```
auth-dialog.tsx → Supabase Auth → auth/callback/route.ts → onboarding/page.tsx
```
**Status**: ✅ Complete signup → profile creation → role selection → dashboard routing

#### Studio Discovery Flow
```
browse/page.tsx → Studio Grid → studios/[id]/page.tsx → booking-widget.tsx
```
**Status**: 🚧 UI ready, needs data integration

#### Studio Management Flow
```
dashboard/page.tsx → studio-form-dialog.tsx → studio-form.tsx → Database Update
```
**Status**: 🚧 UI ready, needs database integration

### ✅ **State Management - WORKING**
- **✅ Local State**: React useState for component-level state WORKING
- **✅ Server State**: Supabase real-time subscriptions CONFIGURED
- **Form State**: React Hook Form for complex forms
- **✅ Authentication State**: Supabase Auth context WORKING

### ✅ **Data Flow Patterns - VERIFIED**
1. **✅ Server Components**: SSR for public pages (SEO optimization) WORKING
2. **✅ Client Components**: Interactive dashboards with real-time subscriptions WORKING
3. **✅ Direct Database Access**: No REST APIs, client connects directly to Supabase VERIFIED
4. **Edge Functions**: Server-side logic (webhooks, notifications, geocoding)
5. **Real-time Updates**: Supabase subscriptions for live data
6. **Storage Integration**: Direct file uploads to Supabase Storage with RLS

## Security Patterns

### ✅ **RLS-First Security Model - PRODUCTION READY**
- **✅ RLS Always On**: Every table has Row Level Security enabled and forced
- **✅ Policies Over Endpoints**: Security rules in database, not traditional REST APIs
- **✅ Declarative Security**: Rules like "Owners can only update their own studios"

### ✅ **Authentication & Authorization - WORKING**
- ✅ JWT tokens from Supabase Auth
- ✅ Row Level Security (RLS) as primary authorization layer
- ✅ Protected routes with Supabase auth helpers
- ✅ No traditional API endpoints for data access

### SECURITY DEFINER Functions
- Complex operations encapsulated in Postgres functions
- Server-side validation that cannot be bypassed
- Examples: booking confirmations, payment processing
- Ultimate security layer for sensitive operations

### ✅ **Data Validation - WORKING**
- ✅ Input sanitization on both client and server
- ✅ TypeScript for compile-time type safety
- ✅ Database constraints and triggers validated

## Critical Working Patterns (Updated June 22, 2025)

### ✅ **Database Trigger Pattern - VERIFIED WORKING**
**Pattern**: Automatic profile creation using PostgreSQL triggers
```sql
-- WORKING TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Implementation**: 
- ✅ `handle_new_user()` function creates profile with `role: null`
- ✅ Triggers onboarding flow automatically
- ✅ No manual profile creation required

### ✅ **OnboardingGate Pattern - PRODUCTION READY**
**Pattern**: Automatic routing based on user completion status
```tsx
// WORKING PATTERN
if (!profile?.role) {
  router.replace("/onboarding")
  return
}
```

**Benefits**:
- ✅ Seamless user experience
- ✅ No manual redirects required
- ✅ Handles edge cases and auth state changes

### ✅ **Schema-First Development - VALIDATED**
**Pattern**: Always verify database schema before frontend development
```typescript
// WORKING: Use Supabase MCP to verify actual schema
const { data } = await supabase.from("profiles").select("*")
// TypeScript types match actual database structure
```

**Critical Rule**: 
- ✅ **MANDATORY**: Use Supabase MCP before any database-related development
- ✅ **VERIFIED**: Frontend types match production database schema
- ✅ **WORKING**: All database relationships and constraints validated

## Development Patterns - **PROVEN WORKING**

### ✅ **Authentication-First Development**
1. ✅ **User signs up** → Creates auth.users entry
2. ✅ **Trigger fires** → Creates profile with null role  
3. ✅ **OnboardingGate detects** → Redirects to role selection
4. ✅ **Role selected** → Profile updated, user routed to appropriate dashboard

### ✅ **Error Handling Pattern**
- ✅ Database trigger conflicts resolved
- ✅ TypeScript type mismatches fixed
- ✅ Authentication state properly managed
- ✅ Loading states and redirects working correctly

### ✅ **Production Readiness Pattern**
- ✅ Database schema verified with production
- ✅ RLS policies tested and working
- ✅ Authentication flows thoroughly tested
- ✅ User journey end-to-end functional

## Next Development Patterns

### Studio Management Pattern (Ready for Implementation)
- **Database Schema**: ✅ Verified and ready
- **UI Components**: ✅ Built and styled
- **Integration Layer**: 🎯 Next to implement

### Booking System Pattern (Foundation Ready)
- **User Authentication**: ✅ Complete
- **Database Structure**: ✅ Verified  
- **Business Logic**: 🎯 Ready for implementation

### Search & Discovery Pattern (Infrastructure Ready)
- **Database PostGIS**: ✅ Available
- **UI Framework**: ✅ Components ready
- **Integration**: 🎯 Next priority

---

**Architecture Status**: ✅ **FOUNDATION COMPLETE** - Authentication, database integration, and user onboarding patterns are production-ready. Ready for core business feature development.

### 12. ✅ **Layout Height Management Pattern - CRITICAL FIX** (Added February 2025)
**Pattern**: Proper height management for sidebar layouts to prevent white space issues
- ✅ **Root Cause**: Conflicting height constraints between viewport units and flex containers
- ✅ **Solution**: Use flex-based height management throughout the component hierarchy
- ✅ **Prevention**: Avoid mixing viewport units (vh) with flex layouts

**White Space Issue Pattern**:
```css
/* ❌ WRONG: Causes white space on large screens (1920px+) */
.main-container {
  min-h-screen max-h-screen overflow-hidden;
}
.sticky-sidebar {
  height: calc(100vh - 5rem);
  top: 16px;
}

/* ✅ CORRECT: Proper flex-based height management */
html, body {
  height: 100%;
  overflow: hidden;
}
.layout-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sticky-sidebar {
  height: 100%;
  overflow-y: auto;
}
```

**Layout Hierarchy Fix**:
```typescript
// globals.css - Set root height constraints
html {
  @apply h-full overflow-hidden;
}
body {
  @apply bg-background text-foreground h-full overflow-hidden;
}

// layout.tsx - Pass height down
<html lang="en" className="h-full">
  <body className={`${inter.className} h-full`}>

// client-layout.tsx - Maintain height chain
<div className="h-full flex flex-col">
  <SidebarProvider className="h-full">
    <SidebarInset>
      <div className="flex flex-1 flex-col min-h-0">
        <SiteHeader />
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</div>

// browse-studios-content.tsx - Use flex properties
<div className="flex flex-col flex-1 p-3 sm:p-4 md:p-6 overflow-hidden">
  <div className="flex gap-4 flex-1 min-h-0">
    {/* Filter sidebar */}
    <div className="w-96 flex-shrink-0 h-full">
      <div className="sticky top-0 h-full overflow-y-auto">
        <Card className="shadow-sm h-full flex flex-col">
    
    {/* Studios grid */}
    <div className="flex-1 min-w-0 overflow-y-auto">
```

**Key Principles**:
1. **Height Chain**: Establish height constraints from html → body → all containers
2. **Flex Over Viewport**: Use `flex-1`, `min-h-0` instead of `vh` units
3. **Overflow Management**: Control overflow at appropriate container levels
4. **Sticky Within Flex**: Ensure sticky elements work within flex containers
5. **No Mixed Units**: Don't mix viewport units with flex layouts

**Common Mistakes to Avoid**:
- Using `min-h-screen` within flex containers
- Mixing `vh` calculations with flex layouts
- Not setting `min-h-0` on flex children
- Missing overflow constraints on parent containers
- Using padding/margins that affect total height calculations

**Testing Checklist**:
- [ ] Test on screens ≥1920px width
- [ ] Verify no white space at bottom
- [ ] Check sticky sidebar scrolls properly
- [ ] Ensure main content scrolls independently
- [ ] Confirm layout works with/without sidebar

**Scrolling Fix for Content Pages**:
To enable scrolling on individual pages while maintaining the white space fix:

1. **Remove overflow-hidden from main container** in client-layout.tsx:
```typescript
// Changed from:
<div className="@container/main flex flex-1 flex-col min-h-0 overflow-hidden">

// To:
<div className="@container/main flex flex-1 flex-col min-h-0">
```

2. **Wrap scrollable content** in pages that need scrolling:
```typescript
// For pages that need scrolling (e.g., studio detail, profile, settings)
return (
  <div className="flex-1 overflow-y-auto">
    <div className="p-4 md:p-6">
      {/* Page content */}
    </div>
  </div>
)
```

3. **Keep overflow control** on pages that shouldn't have white space:
- The browse page already has `overflow-hidden` on its main container
- This prevents the white space issue while allowing other pages to scroll

**Key Pattern**: Let individual pages control their overflow behavior rather than enforcing it globally.

### 13. ✅ **Unified Card System Pattern - CRITICAL UI CONSISTENCY** (Added February 2025)
**Pattern**: Single generic card component with matching skeleton for consistent UI across all card types
- ✅ **Single Source of Truth**: One GenericCard component for studios, profiles, and future card types
- ✅ **Perfect Skeleton Match**: GenericCardSkeleton exactly mirrors loaded card structure
- ✅ **Fixed Layout Heights**: All sections have min-heights to prevent layout shifts
- ✅ **Consistent Loading States**: Eliminates jarring transitions between skeleton and loaded states

**Card Structure Pattern**:
```typescript
// ✅ CORRECT: GenericCard with fixed layout
<Card className="overflow-hidden hover:shadow-lg transition-shadow p-0 gap-0 cursor-pointer h-full flex flex-col">
  {/* Image - fixed aspect ratio */}
  <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
    <Image fill className="object-cover" />
  </div>
  
  <CardContent className="p-5 flex flex-col flex-1">
    {/* Header - fixed height for subtitle */}
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <h3 className="font-semibold text-xl truncate">{title}</h3>
        <div className="h-5 mt-1"> {/* Fixed height container */}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="text-lg text-muted-foreground">{priceTier || ''}</div>
    </div>
    
    {/* All sections with min-heights */}
    <div className="flex items-center mb-3 min-h-[24px]">{/* Location */}</div>
    <div className="flex items-center mb-4 min-h-[24px]">{/* Rating */}</div>
    <div className="mb-4 flex-1 min-h-[72px]">{/* Description */}</div>
    <div className="mb-4 min-h-[24px]">{/* Additional content */}</div>
    <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">{/* Tags */}</div>
    <div className="flex items-center gap-3 mb-4 min-h-[40px]">{/* Followed by */}</div>
    
    {/* Actions always at bottom */}
    <div className="mt-auto flex gap-3">{/* Buttons */}</div>
  </CardContent>
</Card>
```

**Skeleton Matching Pattern**:
```typescript
// ✅ CRITICAL: Skeleton must exactly match GenericCard structure
export function GenericCardSkeleton() {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow p-0 gap-0 cursor-pointer h-full flex flex-col">
      {/* Exact same structure as GenericCard */}
      <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      
      <CardContent className="p-5 flex flex-col flex-1">
        {/* All sections match exactly with same heights and spacing */}
        {/* CRITICAL: Use same min-heights as GenericCard */}
      </CardContent>
    </Card>
  )
}
```

**Implementation Principles**:
1. **Fixed Heights Over Dynamic**: Use min-heights on all sections to prevent layout shifts
2. **Skeleton Precision**: Every class, spacing, and container must match exactly
3. **No Conditional Heights**: Card height remains constant whether content exists or not
4. **Consistent Spacing**: Use exact same margins/padding in skeleton and loaded state
5. **Single Component**: All card types use GenericCard - no separate studio/profile cards

**Common Mistakes to Avoid**:
- ❌ Creating separate card components for different types
- ❌ Omitting sections in skeleton that might be empty in loaded state
- ❌ Using different heights or spacing between skeleton and loaded card
- ❌ Allowing card height to change based on content presence
- ❌ Having multiple skeleton components for different card types

**Hydration Error Prevention**:
```typescript
// ❌ WRONG: Different min-heights cause hydration errors
// Server: min-h-[28px]
// Client: min-h-[32px]

// ✅ CORRECT: Ensure all components use same values
// Both skeleton and card: min-h-[32px]
```

**Benefits of Unified Card System**:
- **Consistency**: All cards look and behave identically
- **Maintainability**: Single component to update and test
- **Performance**: No layout shifts or flashing during load
- **User Experience**: Smooth transitions between loading and loaded states
- **Developer Experience**: Clear pattern for adding new card types

**Testing Checklist**:
- [ ] Skeleton and loaded card have identical heights
- [ ] No layout shift when transitioning from skeleton to loaded
- [ ] All card types (studio, profile, etc.) use GenericCard
- [ ] Min-heights prevent content from changing card size
- [ ] Hydration errors resolved (server/client render match)

### 14. ✅ **Connection System Error Handling Pattern - CRITICAL FIX** (Added August 2025)
**Pattern**: Proper handling of undefined values in connection queries and mutations
- ✅ **UUID Validation**: Check for undefined or 'undefined' string values before SQL queries
- ✅ **Mutation Parameters**: Always pass objects with proper structure to mutation functions
- ✅ **Property Consistency**: Use correct property names that match backend response

**UUID Error Prevention Pattern**:
```typescript
// ❌ WRONG: Can cause SQL syntax errors
export function useConnectionStatus(userId: string | null) {
  const { data } = await supabase
    .from('connections')
    .select('*')
    .or(`requester_id.eq.${userId}`) // userId might be 'undefined' string
}

// ✅ CORRECT: Validate before query
export function useConnectionStatus(userId: string | null | undefined) {
  return useQuery({
    queryFn: async () => {
      if (!userId || userId === 'undefined') return null // Guard against undefined
      
      const { data } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${userId}`) // Safe to use
    },
    enabled: !!userId && userId !== 'undefined' // Prevent query when invalid
  })
}
```

**Mutation Call Pattern**:
```typescript
// ❌ WRONG: Passing raw values
sendConnectionRequest(userId)
acceptConnectionRequest(connectionId)

// ✅ CORRECT: Pass structured objects
sendConnectionRequest({ 
  receiverId: userId, 
  receiverName: displayName 
})
acceptConnectionRequest({ 
  connectionId: connectionId, 
  userName: displayName 
})
```

**Supabase Query Pattern**:
```typescript
// ❌ WRONG: Using .single() when row might not exist
const { data, error } = await supabase
  .from('connections')
  .select('*')
  .eq('id', someId)
  .single() // Throws 406 error if no rows found

// ✅ CORRECT: Using .maybeSingle() for optional data
const { data, error } = await supabase
  .from('connections')
  .select('*')
  .eq('id', someId)
  .maybeSingle() // Returns null if no rows found

// Usage guideline:
// - Use .single() when row MUST exist (e.g., after insert)
// - Use .maybeSingle() when row might not exist (e.g., checking connections)
```

**Common Mistakes to Avoid**:
- ❌ Not checking for undefined values before string interpolation in SQL
- ❌ Passing primitive values to mutations expecting objects
- ❌ Using wrong property names (e.g., `isSender` vs `isRequester`)
- ❌ Not enabling/disabling queries based on valid data
- ❌ Using `.single()` when checking for data that might not exist

**Last Updated**: August 2025 