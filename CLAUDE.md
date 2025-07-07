# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production version
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint checks

### Database Commands
- Use Supabase Dashboard or CLI for database management
- Schema changes should be made via migrations in Supabase

## Architecture Overview

### Supabase-First Architecture
This project follows a "Supabase-First" philosophy - leveraging the complete Supabase ecosystem as the backend-as-a-service. Key principle: avoid external APIs where Supabase provides a superior, integrated solution.

### Technology Stack
- **Framework**: Next.js 15 with App Router (SSR for public pages, client-side for dashboards)
- **Database**: PostgreSQL with PostGIS extension for geographic queries
- **Authentication**: Unified Supabase SSR authentication (single client pattern)
- **UI**: shadcn/ui components (copied into project) with Tailwind CSS
- **Security**: Row Level Security (RLS) enabled on all 19 tables
- **Package Manager**: pnpm

### Application Structure
```
app/                    # Next.js App Router pages
├── auth/              # Authentication flows (/login, /callback)
├── browse/            # Studio discovery
├── dashboard/         # User dashboards
├── onboarding/        # Role-based user setup
└── studios/           # Studio detail pages

components/            # Reusable UI components
├── ui/               # shadcn/ui base components
└── [custom]/         # Application-specific components

lib/                   # Utilities and configurations
├── supabase/         # Database client configuration
│   ├── client.ts     # Client-side Supabase client
│   ├── server.ts     # Server-side Supabase client
│   └── middleware.ts # Middleware Supabase client
└── utils.ts          # Helper functions

memory-bank/          # Project documentation and patterns
```

## Critical Development Patterns

### 1. Authentication System
- **Unified SSR Pattern**: Use appropriate Supabase client for context (client/server/middleware)
- **Automatic Profile Creation**: Database trigger creates profile with `role: null` on signup
- **Onboarding Gate**: Components check for null role and redirect to `/onboarding`
- **Role-Based Access**: Different dashboards for 'creator' vs 'owner' roles

### 2. Database Integration
- **Direct Database Access**: No REST APIs - client connects directly to Supabase
- **RLS Security**: All security handled at database level via Row Level Security policies
- **PostGIS Integration**: Use PostGIS for geographic queries instead of external mapping APIs
- **JSONB Data**: Flexible data like studio gear stored as JSONB

### 3. Performance Optimization
- **Batch Queries**: Use `rpc()` calls for complex multi-table operations
- **Shared State**: Pass user profile and auth state as props to avoid repeated queries
- **N+1 Prevention**: Batch data fetching in parent components, pass as props to children
- **Database Functions**: Use SECURITY DEFINER functions for complex operations

### 4. Component Patterns
- **shadcn/ui**: Copy components directly into project for full control
- **Client vs Server**: Use 'use client' directive for interactive components
- **Loading States**: Always handle loading and error states
- **Shared Props**: Pass common data (profile, auth state) down as props

## Security Guidelines

### Row Level Security (RLS)
- All tables have RLS enabled and forced
- Security policies handle authorization, not application code
- Database functions use `SECURITY DEFINER` with explicit `search_path`
- Common patterns: user ownership, studio owner control, conversation participants

### Authentication Security
- No manual auth checks in server actions - RLS handles authorization
- Use Supabase Auth helpers for protected routes
- Session management handled by Supabase middleware

## Development Workflow

### Adding New Features
1. **Schema First**: Verify database schema matches requirements
2. **RLS Policies**: Ensure appropriate security policies exist
3. **TypeScript Types**: Update types to match database schema
4. **Component Integration**: Build UI components following established patterns
5. **Performance**: Consider batch operations and shared state patterns

### Database Changes
- Use Supabase Dashboard or CLI for schema changes
- Test RLS policies thoroughly
- Update TypeScript types after schema changes
- Consider performance implications of new queries

### Authentication Flow
1. User signs up → Creates auth.users entry
2. Database trigger → Creates profile with null role
3. OnboardingGate → Detects null role, redirects to onboarding
4. Role selection → Updates profile, routes to appropriate dashboard

## Common Pitfalls to Avoid

### React Performance Issues
- Never call async functions inside state updater functions
- Use `setTimeout(() => {}, 0)` to defer async operations from render phase
- Avoid triggering state updates during component render

### Database Performance
- Always use batch queries for multiple records
- Leverage RLS instead of manual authorization checks
- Use specific column selection instead of `SELECT *`
- Add indexes for commonly queried patterns

### Authentication Issues
- Don't create multiple Supabase clients - use the appropriate singleton
- Always handle authentication state loading
- Use shared authentication state to avoid repeated queries

## Business Context

### Application Overview
stwd.io is a global online marketplace that connects musicians, podcasters, bands, and producers with professional recording studios. The platform positions itself as "Airbnb meets Google Maps for the creative industry" - providing a centralized, transparent, and streamlined solution that replaces the fragmented process of finding and booking recording studios.

### Core Value Proposition
The platform eliminates the pain points of traditional studio discovery by providing a unified solution that serves both sides of the marketplace:
- **For Creators**: Frictionless discovery and booking with advanced filtering, transparent pricing, and secure booking platform
- **For Studio Owners**: All-in-one business management tool that serves as an active revenue-generating engine rather than passive directory listing
- **For Platform Admins**: Comprehensive oversight tools for marketplace integrity, quality control, and dispute resolution

### Primary User Types
- **Creators**: Musicians, podcasters, bands, and producers seeking professional recording spaces
- **Studio Owners**: Professional recording studios listing their space, equipment, and services
- **Platform Admins**: Platform operators managing listings, disputes, and marketplace integrity

### Core Features
The application handles studio discovery with location-based search, booking management with real-time availability, integrated messaging between users, and comprehensive user management. Key focus areas include geographic search capabilities using PostGIS, real-time communication, and a robust review system for informed decision-making.

### Success Metrics
- User acquisition and retention rates
- Booking conversion rates and revenue growth
- Studio owner satisfaction and platform engagement
- Review quality and marketplace trust indicators