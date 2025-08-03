# Active Context: stwd.io Frontend

## Current Work Session
**Date**: February 2025
**Focus**: Chat System RLS Refactor

### Current Work: Connection and Chat System Bug Fixes (August 2025)

#### Connection Request Fixes:
- **Fixed Connection Query Logic**: Corrected SQL queries in connection hooks that were preventing proper connection creation
  - Fixed `useSendConnectionRequest` to check for connections between specific users, not any connection involving either user
  - Fixed `useConnectionStatus` with similar correction
- **Fixed Empty State Display**: Updated ConnectionsHubV2 to check for pending requests before showing "No connections yet"
- **Recipients Can Now See Requests**: Connection requests now properly display on the recipient's side

#### Chat System Fixes:
- **Fixed React Import Error**: Added React import to message-thread.tsx to fix runtime error
- **Fixed TypeScript Errors**: Properly typed RPC function returns in chat page for `create_chat_conversation`
- **Maintained RLS Architecture**: All fixes maintain the hybrid RPC + RLS architecture documented in chat system docs

### Previous Work: Chat System Complete - All Issues Resolved (February 2025)

#### Chat RLS Hybrid Architecture - FULLY IMPLEMENTED:
- **✅ All Chat Types Working**: 1:1 chats, group chats, and studio enquiries all functioning
- **✅ Root Cause Fixed**: Eliminated RLS recursion by implementing hybrid RPC + RLS architecture
- **✅ Consistent Frontend**: All conversation creation uses RPC functions
  
#### Final Implementation:
1. **Helper Function**: `is_chat_participant()` - SECURITY DEFINER function for membership checks
2. **RPC Functions**:
   - `create_chat_conversation()` - Returns conversation with ID and UUID
   - `send_chat_message()` - Returns created message ID
   - `get_studio_concierge_id()` - Gets system concierge user
3. **Simplified RLS Policies**: 7 total policies with no self-references
4. **Frontend Consistency**: Updated 5 files to use RPC functions:
   - `/components/group-chat-basket-dialog.tsx`
   - `/app/connect/chat/page.tsx`
   - `/lib/store/quote-basket.ts`
   - `/components/connections/group-chat-basket.tsx`
   - `/components/chat/draft-message-thread.tsx`

#### Documentation Created:
- `/docs/chat-rls-recursion-solution.md` - Complete problem/solution guide
- `/docs/chat-backend-state.md` - Full backend state for restoration

### Previous Work: People Discovery Filtering (February 2025)

#### People Section Updates:
- **Filtered User Types**: Updated people discovery to exclude specific user types
  - Excludes users with `system_role` of 'owner' or 'admin'
  - Excludes the concierge user (identified by username 'studio_concierge')
  - Excludes users with the 'studio-owner' professional role
- **Query Updates**: Modified `useProfilesInfinite` hook with two-stage filtering:
  1. Database-level filtering for system roles and concierge username
  2. Client-side filtering to remove users with studio-owner professional role
- **Purpose**: Ensures the people section only shows creators and industry professionals,
  not studio owners, admins, or the platform concierge

### Previous Work: Chat Interface Improvements (February 2025)

#### Chat Display Updates:
- **Enquiry Chat Headers**: Reverted to show studio names with studio images
  - Shows "Grunge Garden Studios" with studio logo instead of participant names
  - Fixed studio image loading by extracting studio name from "Studio Enquiry: X" format
  - Added studio's main image (first in photo_urls) as avatar

#### Message Display Enhancements:
- **Sender Names**: Added bold sender names above each message
- **Profile Links**: Made sender names clickable to navigate to profiles
- **Special Users**: Studio Concierge displays as "Concierge"

#### Mobile UX Fixes:
- **No Auto-Select on Mobile**: Desktop auto-selects first chat, mobile shows conversation list
- **Mobile Detection**: Added responsive behavior using 768px (md) breakpoint
- **Back Button**: Integrated into message thread header on mobile (removed duplicate header)
- **Sticky Headers**: Made chat header sticky with z-index to stay visible during scroll
- **Improved Scrolling**: Fixed ScrollArea overflow and ensured proper message scrolling
- **Auto-Scroll**: Added initial scroll to bottom and maintained smooth scroll on new messages

## Recent Completions

### ✅ Settings Navigation Refactor - COMPLETED (February 2025)
- **Status**: COMPLETED
- **Goal**: Integrate settings pages into the unified navigation system used by /discover and /connect sections

#### Implementation Details:
1. **Updated MainSectionNavigation Component**:
   - Added dynamic SETTINGS link that appears only when in settings section
   - Shows "DISCOVER | CONNECT | SETTINGS" when in settings
   - Shows "DISCOVER | CONNECT" when outside settings
   - Added sub-navigation for settings: "ACCOUNT | PROFILE | PROFESSIONAL"

2. **Refactored Settings Layout**:
   - Removed UnifiedLayout wrapper
   - Added MainSectionNavigation component
   - Created SettingsPageContent wrapper for mobile support
   - Maintains consistent structure with discover/connect sections

3. **Mobile Support**:
   - Created SettingsPageContent component with mobile headers
   - Shows "SETTINGS" title with current subsection on mobile
   - Consistent with discover/connect mobile patterns

4. **Navigation Flow**:
   - /settings redirects to /settings/account
   - /connect redirects to /connect/chat
   - /discover redirects to /discover/studios
   - All main sections have proper default routes

#### Files Modified:
- `/components/navigation/main-section-navigation.tsx` - Added settings support
- `/app/settings/layout.tsx` - Refactored to use unified navigation
- `/components/settings/settings-page-content.tsx` - Created for mobile support
- `/app/connect/page.tsx` - Created redirect page

#### Bug Fixes Applied:
1. **Removed Duplicate Headers**:
   - Removed mobile "CONNECT" header from ChatHub component
   - Fixed duplicate navigation headers appearing in connect pages

2. **Fixed SiteHeader Display**:
   - Updated ClientLayout to hide SiteHeader on pages with their own navigation
   - Settings, discover, connect, and profiles pages no longer show "stwd.io" header

3. **Improved Settings Layout**:
   - Removed width constraints from settings content
   - Added proper padding and centering for settings cards
   - Settings content now uses full available space below navigation

#### Final Implementation:
- **Main Navigation**: Always shows "DISCOVER | CONNECT" with dynamic "| SETTINGS" when in settings
- **Sub Navigation**: Shows relevant sub-links based on current section
- **Profile Dropdown**: Large avatar (72px) with name and role badge on desktop
- **Hydration Fix**: Sub-navigation hidden on redirect paths to prevent mismatches

#### Files Modified:
- `/components/navigation/main-section-navigation.tsx` - Added settings support with main nav
- `/components/navigation/user-profile-dropdown.tsx` - Created large profile dropdown component
- `/app/settings/layout.tsx` - Refactored to use unified navigation
- `/components/settings/settings-page-content.tsx` - Created for mobile support
- `/app/connect/page.tsx` - Created redirect page
- `/components/chat/chat-hub.tsx` - Removed duplicate mobile header
- `/components/client-layout.tsx` - Hide SiteHeader on pages with navigation
- `/app/settings/*/page.tsx` - Updated all settings pages for consistent layout

## Recent Completions

### ✅ Professional Network Refactor - COMPLETED (February 2025)
- **Status**: ✅ **COMPLETED** - Transformed platform from marketplace to professional network
- **Major Achievement**: Successfully implemented all 13 tasks from the implementation plan

#### Phase 1: Backend Changes ✅
- Created `connections` table with pending/accepted/rejected states
- Created `studio_members` table for team-based studio management
- Updated studios RLS policies to support team member access
- Migrated existing studio owners to studio_members table

#### Phase 2: Frontend UI Updates ✅
- Removed all follower/following counts from UI
- Removed price displays from discovery (studio cards, filter panel, detail pages)
- Created `/connections` page with three tabs:
  - My Connections (accepted connections)
  - Pending Requests (incoming connection requests)
  - Sent Requests (outgoing connection requests)
- Implemented group chat selection mode for connections

#### Phase 3: Communication Updates ✅
- Built complete connection request system:
  - Send connection requests
  - Accept/decline incoming requests
  - Cancel sent requests
  - Connection status checking
- Implemented gated 1-on-1 chat (connections required)
- Message buttons disabled with tooltip when not connected
- Created group chat functionality from connections page

#### Phase 4: Concierge & Enquiry System ✅
- Created Concierge database functions and profile setup
- Refactored quote basket to create group chats instead of inquiries:
  - Each studio enquiry creates a group chat
  - Participants: creator, all studio team members, studio concierge
  - Initial message contains all enquiry details
  - Concierge sends welcome message
- Updated workspace access to support studio team members
- Modified studio queries to show studios where user is owner OR team member

#### Key Technical Implementations
- **Connection System**: Two-way professional connections (like LinkedIn) alongside existing one-way follows
- **Studio Teams**: Multi-member studios with role-based access (owner, member, admin)
- **Gated Messaging**: Users must be connected to send 1-on-1 messages
- **Enquiry Chats**: Formal studio enquiries now happen via group chats with concierge facilitation
- **Price-Free Discovery**: All pricing information removed from browsing experience

#### Files Created/Modified
- Backend migrations via Supabase MCP
- `/components/connections/` - Connection hub and related components
- `/lib/hooks/queries/connections.ts` - Connection query hooks
- `/lib/hooks/mutations/connections.ts` - Connection mutation hooks
- `/app/(discover)/connections/page.tsx` - Connections page
- `/lib/store/quote-basket.ts` - Refactored for chat-based enquiries
- Profile and card components updated for connection support
- Workspace components updated for team access

#### Next Steps (Manual Tasks)
1. Create Concierge auth user via Supabase Dashboard (email: concierge@stwd.io)
2. Test all new features thoroughly
3. Consider data migration strategy for existing inquiries
4. Create team management UI for studios (add/remove members)

### Previous Completions (Maintained for Context)

### ✅ Mobile Sidebar Navigation Implementation - COMPLETED (February 2025)
[Previous completion details maintained...]

### ✅ Chat-Centric MVP Refactor - COMPLETED (January 31, 2025)
[Previous completion details maintained...]

[Additional previous completions maintained in original format...]

## Memory Bank Status
- Updated with professional network refactor completion
- All implementation phases documented
- Technical patterns and decisions recorded
- Next steps clearly outlined

## Platform State
The stwd.io platform has successfully transitioned from a marketplace model with basic social features to a professional network with:
- Meaningful two-way connections
- Team-based studio management
- Gated professional communication
- Concierge-facilitated enquiries
- Price-free discovery experience