# System Patterns: stwd.io Frontend

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Deployment**: Vercel (assumed based on Next.js choice)

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
**Pattern**: Clerk Authentication with Next.js middleware
- OAuth integration (Google and other providers)
- Protected routes and server components
- Real-time authentication state

**Implementation**:
- Clerk NextJS integration for authentication
- `auth/callback/route.ts` - OAuth callback handling
- Authentication guards on protected pages
- User session management

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
auth-dialog.tsx → Clerk Auth → auth/callback/route.ts → onboarding/page.tsx
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
- **Authentication State**: Clerk authentication context

### Data Flow Patterns
1. **Server Components**: For initial data fetching and SEO
2. **Client Components**: For interactive features and real-time updates
3. **API Routes**: For server-side operations and webhooks
4. **Real-time Updates**: Supabase subscriptions for live data

## Security Patterns

### Authentication & Authorization
- JWT tokens from Clerk Authentication
- Row Level Security (RLS) on Supabase database
- Protected API routes with Clerk middleware
- Client-side route guards with Clerk components

### Data Validation
- Input sanitization on both client and server
- TypeScript for compile-time type safety
- Zod schemas for runtime validation
- Supabase database constraints

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