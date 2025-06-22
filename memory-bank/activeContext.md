# Active Context: stwd.io Frontend

## Current Work Focus

### Memory Bank Initialization - December 2024
- **Status**: Just completed
- **Action**: Created comprehensive memory bank structure
- **Context**: Established foundation documentation for the stwd.io frontend project

### Project Status Overview
Based on the current file structure and git status, the project appears to be in active development with:
- Core application structure established
- Authentication system implemented
- Basic page routing set up
- UI component library integrated
- Supabase integration configured

## Recent Changes (From Git Status)

### Modified Files
1. **README.md**: Updated project documentation (now includes Admin user persona)
2. **lib/supabase.ts**: Changes to Supabase configuration

These modifications suggest recent work on:
- Added third user persona (Admin) to project scope
- Backend integration refinements
- Supabase client configuration updates
- Authentication system adjustments (Clerk + Supabase hybrid)

## Current Application State

### Implemented Features
Based on the file structure, the following appears to be implemented:

#### Authentication System
- OAuth callback handling (`auth/callback/route.ts`)
- Login page (`auth/login/page.tsx`)
- Auth dialog component (`components/auth-dialog.tsx`)

#### Core User Flows
- Landing page (`app/page.tsx`)
- Onboarding process (`app/onboarding/page.tsx`)
- Browse/discovery page (`app/browse/page.tsx`)
- User dashboard (`app/dashboard/page.tsx`)

#### Studio Management
- Individual studio pages (`app/studios/[id]/page.tsx`)
- Studio editing interface (`app/dashboard/studios/[id]/edit/page.tsx`)
- Studio form components (`components/studio-form.tsx`, `studio-form-dialog.tsx`)

#### UI Infrastructure
- Complete shadcn/ui component library
- Theme provider for dark/light mode
- Header and navigation components
- Booking widget component

### Database Setup
- SQL scripts for profiles table (`scripts/01-create-profiles-table.sql`)
- Supabase client configuration

## Next Immediate Priorities

### Development Workflow
1. **Commit Current Changes**: Address the modified files in git status
2. **Feature Completion**: Complete any in-progress features
3. **Testing**: Implement comprehensive testing strategy
4. **Deployment**: Set up production deployment pipeline

### Technical Debt Areas
- Error handling and validation
- Loading states and UX polish
- Mobile responsiveness verification
- Accessibility compliance
- Performance optimization

### Business Logic Implementation
- Studio discovery and filtering logic
- Booking system functionality
- User profile management
- Review and rating system
- Payment integration (future)

## Critical Development Rules

### **MANDATORY: Supabase Backend Integration**
🚨 **BEFORE ANY PROJECT ACTION**: Always use the Supabase MCP to thoroughly understand the stwd.io Supabase backend schema. The frontend you build must be fully compatible with its structure.

**Required Steps:**
1. Use Supabase MCP to list and understand all tables
2. Review the database schema and relationships
3. Understand the data types and constraints
4. Ensure frontend components align with backend data structure
5. Verify API compatibility before implementing features

## Active Decisions & Considerations

### Architecture Decisions
- **App Router**: Using Next.js 15.2.4 App Router for modern routing
- **Clerk**: Primary authentication provider for user management
- **Supabase**: Backend database and real-time features
- **shadcn/ui**: Component library for consistent UI
- **TypeScript**: Full type safety across the application

### User Experience Priorities
- **Mobile-First**: Ensuring great mobile experience
- **Performance**: Fast loading and responsive interactions
- **Accessibility**: Inclusive design for all users
- **Security**: Proper authentication and data protection

### Development Standards
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Component Architecture**: Reusable, composable components
- **State Management**: React state with Supabase for persistence
- **Error Handling**: Graceful error states and user feedback

## Questions & Blockers

### Technical Questions
- Payment provider selection and integration timeline
- Map integration approach (Google Maps vs alternatives)
- Image storage and optimization strategy
- Real-time features implementation priority

### Business Questions
- Studio onboarding process and verification
- Pricing model and commission structure
- Review system implementation details
- Geographic rollout strategy

## Communication Channels

### Development
- Git commits and pull requests for code changes
- Memory bank updates for architectural decisions
- Issue tracking for bugs and feature requests

### Stakeholder Updates
- Regular progress reports on feature completion
- User testing feedback integration
- Business metric tracking and optimization

---

**Note**: This active context should be updated regularly as work progresses. Key changes, decisions, and blockers should be documented here for continuity between development sessions. 