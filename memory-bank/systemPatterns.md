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

### Pillar 3: Security - Row Level Security (RLS) First ✅

**Database-Centric Security Model:**
- ✅ **CONFIGURED**: RLS enabled and forced on every table
- ✅ **WORKING**: Security rules live in database as RLS policies, not API endpoints
- ✅ **VERIFIED**: Declarative approach: "Owners can only update their own studios"

**SECURITY DEFINER Functions:**
- Complex, protected actions encapsulated in Postgres functions
- Logic cannot be bypassed by client
- Ultimate layer of security model

## Key Design Patterns

### 1. ✅ **Role-Based User Experience - WORKING**
**Pattern**: Different user journeys based on user type (Creator vs Studio Owner)
- ✅ **FUNCTIONAL**: Onboarding flow branches based on selected role
- ✅ **WORKING**: Dashboard content customized per user type
- ✅ **VERIFIED**: Navigation and features tailored to user needs

**Implementation**:
- ✅ `onboarding/page.tsx` - Role selection and setup WORKING
- ✅ Conditional rendering based on user profile FUNCTIONAL
- ✅ Role-specific routing and access control VERIFIED

### 2. Component Composition
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

### 3. ✅ **Authentication Integration - PRODUCTION READY**
**Pattern**: Supabase Auth with Next.js middleware
- ✅ **WORKING**: OAuth integration (Google and other providers)
- ✅ **FUNCTIONAL**: Protected routes and server components
- ✅ **VERIFIED**: Real-time authentication state

**Implementation**:
- ✅ `lib/supabase.ts` - Supabase client configuration WORKING
- ✅ `auth/callback/route.ts` - OAuth callback handling FUNCTIONAL
- ✅ Authentication guards on protected pages WORKING
- ✅ Supabase Auth context and session management VERIFIED

### 4. Dynamic Routing
**Pattern**: Parameterized routes for scalable content
- Studio detail pages: `/studios/[id]`
- Studio editing: `/dashboard/studios/[id]/edit`
- User-specific content routing

### 5. Form Handling
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

**Last Updated**: June 22, 2025 