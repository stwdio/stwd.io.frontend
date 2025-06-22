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
│   ├── auth/              # Authentication flows
│   ├── browse/            # Studio discovery and search
│   ├── dashboard/         # User dashboards
│   ├── onboarding/        # New user setup
│   └── studios/           # Individual studio pages
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui base components
│   └── [custom]/          # Application-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
└── memory-bank/           # Project documentation
```

## The Three Pillars of stwd.io Architecture

### Pillar 1: Frontend - Modern, Performant Experience

**Next.js Hybrid Rendering Strategy:**
- **SSR (Server-Side Rendered)**: Public pages (landing, studio details) for optimal SEO and fast initial loads
- **Client-Side Rendered**: Protected areas (owner dashboard) for app-like, snappy interactions

**shadcn/ui Philosophy:**
- Not a traditional component library but a design system built on convention
- Components copied directly into project for full control
- Avoids dependency bloat and ensures perfect consistency
- Everything styled with Tailwind CSS - zero custom CSS files

**Supabase UI Acceleration:**
- Use Supabase's own UI components where appropriate (e.g., `<Auth />` component)
- Pre-built, secure, and themeable authentication flows

### Pillar 2: Backend - Supabase as Complete Backend-as-a-Service

**PostgreSQL with Superpowers:**
- Single source of truth for all data (profiles, studios, bookings)
- **PostGIS Extension**: Avoids expensive mapping services, enables fast geographic queries
- **JSONB Data Type**: Flexible schema for studio gear lists and unstructured data

**Complete Identity Layer:**
- Supabase Auth handles all user management
- Custom profiles table linked via foreign key to auth.users
- Postgres trigger automatically creates profile for every new user

**Unified File Management:**
- Supabase Storage for all user-generated content (photos, avatars)
- RLS policies grant access to storage objects based on database rules

**Serverless Logic Layer:**
- Supabase Edge Functions for server-side operations
- Key use cases: Stripe webhooks, notifications, geocoding proxy
- Eliminates need for traditional server management

### Pillar 3: Security - Row Level Security (RLS) First

**Database-Centric Security Model:**
- RLS enabled and forced on every table
- Security rules live in database as RLS policies, not API endpoints
- Declarative approach: "Owners can only update their own studios"

**SECURITY DEFINER Functions:**
- Complex, protected actions encapsulated in Postgres functions
- Logic cannot be bypassed by client
- Ultimate layer of security model

## Key Design Patterns

### 1. Role-Based User Experience
**Pattern**: Different user journeys based on user type (Creator vs Studio Owner)
- Onboarding flow branches based on selected role
- Dashboard content customized per user type
- Navigation and features tailored to user needs

**Implementation**:
- `onboarding/page.tsx` - Role selection and setup
- Conditional rendering based on user profile
- Role-specific routing and access control

### 2. Component Composition
**Pattern**: Building complex UI from smaller, reusable components
- Base UI components from shadcn/ui
- Custom business logic components
- Layout components for consistent structure

**Key Components**:
- `studio-form.tsx` - Studio listing creation/editing
- `booking-widget.tsx` - Booking interface
- `auth-dialog.tsx` - Authentication flows
- `header.tsx` - Global navigation

### 3. Authentication Integration
**Pattern**: Supabase Auth with Next.js middleware
- OAuth integration (Google and other providers)
- Protected routes and server components
- Real-time authentication state

**Implementation**:
- `lib/supabase.ts` - Supabase client configuration
- `auth/callback/route.ts` - OAuth callback handling
- Authentication guards on protected pages
- Supabase Auth context and session management

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

### Core User Flows

#### Authentication Flow
```
auth-dialog.tsx → Supabase Auth → auth/callback/route.ts → onboarding/page.tsx
```

#### Studio Discovery Flow
```
browse/page.tsx → Studio Grid → studios/[id]/page.tsx → booking-widget.tsx
```

#### Studio Management Flow
```
dashboard/page.tsx → studio-form-dialog.tsx → studio-form.tsx → Database Update
```

### State Management
- **Local State**: React useState for component-level state
- **Server State**: Supabase real-time subscriptions
- **Form State**: React Hook Form for complex forms
- **Authentication State**: Supabase Auth context

### Data Flow Patterns
1. **Server Components**: SSR for public pages (SEO optimization)
2. **Client Components**: Interactive dashboards with real-time subscriptions
3. **Direct Database Access**: No REST APIs, client connects directly to Supabase
4. **Edge Functions**: Server-side logic (webhooks, notifications, geocoding)
5. **Real-time Updates**: Supabase subscriptions for live data
6. **Storage Integration**: Direct file uploads to Supabase Storage with RLS

## Security Patterns

### RLS-First Security Model
- **RLS Always On**: Every table has Row Level Security enabled and forced
- **Policies Over Endpoints**: Security rules in database, not traditional REST APIs
- **Declarative Security**: Rules like "Owners can only update their own studios"

### Authentication & Authorization
- JWT tokens from Supabase Auth
- Row Level Security (RLS) as primary authorization layer
- Protected routes with Supabase auth helpers
- No traditional API endpoints for data access

### SECURITY DEFINER Functions
- Complex operations encapsulated in Postgres functions
- Server-side validation that cannot be bypassed
- Examples: booking confirmations, payment processing
- Ultimate security layer for sensitive operations

### Data Validation
- Input sanitization on both client and server
- TypeScript for compile-time type safety
- Zod schemas for runtime validation
- Supabase database constraints and triggers

## Performance Patterns

### Optimization Strategies
- **Static Generation**: For marketing pages and public content
- **Dynamic Rendering**: For user-specific content
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Caching**: Supabase query caching and Next.js cache

### Loading States
- Skeleton components for perceived performance
- Progressive loading for complex interfaces
- Error boundaries for graceful failure handling

## Development Patterns

### File Organization
- Feature-based component organization
- Shared utilities in `lib/`
- Custom hooks in `hooks/`
- Type definitions co-located with components

### Styling Approach
- Utility-first with Tailwind CSS
- Component variants with class-variance-authority
- Consistent design system through shadcn/ui
- Responsive design patterns

### Error Handling
- Try-catch blocks for async operations
- Error boundaries for React component errors
- User-friendly error messages
- Logging for debugging and monitoring 