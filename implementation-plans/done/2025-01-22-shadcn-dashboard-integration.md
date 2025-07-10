# Implementation Plan: Complete STWD.io UI Overhaul with Shadcn Template

## Date Created
2025-01-22

## Overview
Complete replacement of existing STWD.io frontend UI with shadcn dashboard template. This is a **total UI overhaul** - completely removing current header-based navigation and replacing with sidebar-based dashboard experience.

## Memory Bank Context
- Central Memory Bank Read: 2025-01-22 - Understood existing auth system, role-based access, and core functionality
- Project Memory Bank Read: STWD.io Frontend - All current features identified for migration
- Cross-project Impacts: Frontend-only changes, no backend modifications needed

## Implementation Strategy
**COMPLETE COPY AND PASTE APPROACH**: 
1. Copy entire `/my-app` structure to replace current app
2. Integrate existing Supabase authentication and functionality
3. Implement role-based sidebar navigation
4. Migrate all existing features to new UI structure

## User Requirements Summary
- ✅ Complete UI replacement - "NUKE IT - I NEVER WANT TO SEE IT AGAIN"
- ✅ Sidebar-only navigation (no header)
- ✅ Light theme from template (adopt all styling)
- ✅ Role-based sidebar with different items per role
- ✅ Browse Studios as default main content for all users
- ✅ Separate filters panel (not in main sidebar)
- ✅ Keep existing dashboard analytics/charts
- ✅ All roles maintain existing functionality
- ✅ Mobile navigation from template

## Implementation Phases

### Phase 1: Complete Template Copy ✅
- [ ] Copy entire my-app structure to root
- [ ] Replace current app directory completely
- [ ] Update package.json dependencies
- [ ] Copy all template components and utilities

### Phase 2: Authentication Integration
- [ ] Integrate Supabase authentication system
- [ ] Implement OnboardingGate component
- [ ] Add role-based routing logic
- [ ] Connect user profile data to sidebar

### Phase 3: Role-Based Navigation
- [ ] Create role-based sidebar navigation
- [ ] Implement Creator vs Studio Owner menu items
- [ ] Add settings access for all roles
- [ ] Move dashboard access to user menu area

### Phase 4: Browse Studios Integration
- [ ] Integrate existing Browse Studios functionality
- [ ] Create separate filters panel
- [ ] Make Browse Studios the default main content
- [ ] Preserve all existing search and filter features

### Phase 5: Dashboard Content Migration
- [ ] Migrate Studio Owner dashboard functionality
- [ ] Preserve existing analytics and charts
- [ ] Add booking management features
- [ ] Maintain all CRUD operations

### Phase 6: Settings & Profile Integration
- [ ] Migrate settings pages to new layout
- [ ] Integrate profile management
- [ ] Add user avatar and profile in sidebar footer
- [ ] Maintain all existing settings functionality

### Phase 7: Feature Completeness
- [ ] Migrate messaging system
- [ ] Add quote basket functionality
- [ ] Preserve all booking flows
- [ ] Maintain studio management features

### Phase 8: Testing & Polish
- [ ] Test all role-based flows
- [ ] Verify mobile responsiveness
- [ ] Ensure all existing functionality works
- [ ] Final styling and polish

## Dependencies
- Existing Supabase authentication system
- Current database schema and RLS policies
- Existing component functionality

## Risks and Mitigation
- **Risk**: Breaking existing functionality during migration
- **Mitigation**: Systematic migration of each feature with testing

## Testing Strategy
- Test all user roles (Creator, Studio Owner, Admin)
- Verify all existing features work in new UI
- Test mobile responsiveness
- Validate authentication flows

## Completion Criteria
- Complete UI replacement with shadcn template
- All existing functionality preserved
- Role-based navigation working
- Browse Studios as default content
- Mobile navigation functional
- Light theme consistently applied

## Progress Log
- 2025-01-22: Plan created, ready to begin implementation 