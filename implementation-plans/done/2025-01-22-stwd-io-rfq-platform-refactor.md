# Implementation Plan: stwd.io RFQ Platform Refactor

## Date Created
2025-01-22

## Overview
Comprehensive end-to-end implementation plan to refactor stwd.io from a direct booking platform to a sophisticated Request for Quote (RFQ) and lead-generation platform. This plan pivots the platform to focus on verified connections and communication facilitation rather than payment processing.

## Memory Bank Context
- **Central Memory Bank Read**: 2025-01-22 - Complete project context understood
- **Current State**: Enterprise-ready authentication, security, and studio management system
- **Database Schema**: 19-table Supabase schema with comprehensive RLS and performance optimization
- **Security Status**: Zero vulnerabilities, production-ready
- **Architecture**: Supabase-first with Next.js 15, TypeScript, shadcn/ui

## Cross-Project Impacts
This is a single-project implementation focused on the stwd.io frontend application with heavy Supabase backend integration.

---

## Core Philosophy & Strategic Direction

### ✅ **Check, Then Build Mandate**
For every feature, the implementation will:
1. **Assess existing functionality** using database inspection and codebase analysis
2. **Compare against new RFQ requirements** from user stories
3. **Refactor or build** only what's necessary to meet the new specifications

### 🎯 **Facilitator, Not Processor**
- **Primary Function**: Verified connection facilitation and lead generation
- **Payment Philosophy**: Studios handle their own invoicing and payments off-platform
- **Value Proposition**: Quality studios + efficient inquiry system + verified trust

---

## Implementation Phases

### Phase 1: Foundational Backend & Admin Tooling
**Goal**: Establish trust foundation through verification systems and admin command center

#### Task 1.1: Refactor Studios Table for Advanced Verification

**Current State Check**:
```sql
-- Current studios table columns verified:
-- id, owner_id, name, description, hourly_rate, published, verified, gear, created_at, updated_at, location
```

**Status**: ❌ **MISSING** - verification_status, claimed_by, verification_documents columns do not exist

**Backend Mechanics (Supabase Migration)**:
```sql
-- Migration: Add verification workflow columns to studios table
ALTER TABLE public.studios 
ADD COLUMN verification_status TEXT 
CHECK (verification_status IN ('unclaimed', 'pending_claim_verification', 'pending_new_studio_approval', 'verified', 'rejected'))
DEFAULT 'unclaimed';

ALTER TABLE public.studios 
ADD COLUMN claimed_by BIGINT REFERENCES public.profiles(id);

ALTER TABLE public.studios 
ADD COLUMN verification_documents JSONB;

-- Update existing studios to 'unclaimed' status
UPDATE public.studios SET verification_status = 'unclaimed' WHERE verification_status IS NULL;

-- Create index for verification queries
CREATE INDEX idx_studios_verification_status ON public.studios(verification_status);
```

**RLS Policy Updates**:
```sql
-- Update existing studios RLS policy to handle verification status
-- Admins can see all studios regardless of status
-- Owners can see their own studios regardless of status  
-- Public can only see 'verified' studios
```

#### Task 1.2: Implement Admin Dashboard & Core Views

**Current State Check**: 
- ❌ **MISSING** - No admin dashboard at `/admin` route
- ✅ **EXISTS** - Role-based authentication with 'admin' role in profiles table
- ✅ **EXISTS** - RLS policies with admin override patterns

**Frontend User Flow**:
```typescript
// Create new protected route: app/admin/page.tsx
// Security: Restrict access to users with role = 'admin' via RLS and client-side checks
```

**Admin Dashboard Layout**:
1. **Pending Studio Claims** table (`verification_status = 'pending_claim_verification'`)
2. **New Studio Submissions** table (`verification_status = 'pending_new_studio_approval'`)  
3. **All Studios** table (with verification status badges)
4. **All Users** table (with role management)

**Backend Mechanics**: 
- All data fetching governed by existing RLS policies with `is_admin()` function
- Real-time subscriptions for instant updates on new claims/submissions

---

### Phase 2: The Customer Inquiry Flow (RFQ System)
**Goal**: Implement complete "demand-side" experience with quote basket and universal inquiry

#### Task 2.1: Create RFQ Database Schema

**Current State Check**:
```sql
-- Verified: inquiries, inquiry_recipients tables DO NOT exist
```

**Status**: ❌ **MISSING** - Complete RFQ system needs to be built

**Backend Mechanics (Supabase Migration)**:
```sql
-- Create inquiries table
CREATE TABLE public.inquiries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  creator_id BIGINT REFERENCES public.profiles(id) NOT NULL,
  project_type TEXT NOT NULL, -- 'record', 'mix', 'master', 'rehearsal', 'other'
  genre TEXT,
  budget_range TEXT, -- '$', '$$', '$$$', '$$$$'
  preferred_dates TEXT, -- Free text for now
  location_preference TEXT,
  custom_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inquiry_recipients table (many-to-many between inquiries and studios)
CREATE TABLE public.inquiry_recipients (
  inquiry_id BIGINT REFERENCES public.inquiries(id) ON DELETE CASCADE,
  studio_id BIGINT REFERENCES public.studios(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'viewed', 'responded', 'declined')) DEFAULT 'pending',
  response_message TEXT,
  quote_amount NUMERIC,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (inquiry_id, studio_id)
);

-- RLS Policies
-- inquiries: Users can see their own inquiries
-- inquiry_recipients: Inquiry creators and studio owners can see relevant records
```

#### Task 2.2: Implement Quote Basket UI & State Management

**Current State Check**:
- ✅ **EXISTS** - Studio cards in browse page (`app/browse/page.tsx`)
- ❌ **MISSING** - Quote basket functionality and state management

**Frontend User Flow**:
1. **Studio Cards Enhancement**: Add "Add to Quote" button using Zustand state store
2. **Header Quote Basket**: Shopping cart icon with count badge, opens Dialog
3. **Universal Inquiry Form**: Single form capturing all inquiry details
4. **Submission Flow**: Creates one inquiry + multiple inquiry_recipients

**State Management**:
```typescript
// Create store/quote-basket.ts using Zustand
interface QuoteBasketStore {
  studios: Studio[]
  addStudio: (studio: Studio) => void
  removeStudio: (studioId: number) => void
  clearBasket: () => void
  submitInquiry: (inquiryData: InquiryData) => Promise<void>
}
```

#### Task 2.3: Implement Customer Inquiry Dashboard

**Current State Check**:
- ✅ **COMPLETED** - Creator inquiry tracking at `/dashboard/creator`

**Frontend User Flow**:
- Protected route showing all user's inquiries
- Table view with studio recipients and their status
- Links to conversation threads when studios respond

---

### Phase 3: Studio Owner Journey & Admin Oversight
**Status**: ✅ **COMPLETED**

### 3.1 Studio Owner Dashboard Enhancement ✅
- **Enhanced dashboard with tabbed interface**:
  - "Incoming Leads" tab (primary focus)
  - "My Studios" tab (existing functionality)
  - "Analytics" tab (charts and metrics)
- **Incoming Leads Dashboard component** (`components/incoming-leads-dashboard.tsx`):
  - Three sub-tabs: New Inquiries, Responded, All Leads
  - Rich inquiry cards with project details, client info, budget, dates
  - Inline response system with quote amount and message
  - Status management (pending, responded, declined)
  - Real-time lead counting and filtering

### 3.2 Studio Claiming Flow ✅
- **New claim studio page** (`/claim-studio`):
  - Search functionality by studio name and location
  - Display unclaimed studios with verification status
  - Claim submission form with verification details
  - Business document links for verification
  - Integration with existing `claim_studio()` function
- **Header navigation enhancement**:
  - Added "Claim Studio" link for owners and admins
  - Conditional display based on user role

### 3.3 Admin Dashboard Direct Management ✅
- **Enhanced admin dashboard** (`components/admin-dashboard.tsx`):
  - Studio edit dialog with full CRUD operations
  - Direct verification status management
  - Studio deletion capabilities
  - Dropdown action menus with multiple options
  - Rate and description editing
  - Public page preview links
- **Admin controls**:
  - Toggle verification status (verified/unverified)
  - Edit studio details directly
  - Delete studios with confirmation
  - View public studio pages

### 3.4 New Studio Creation Workflow ✅
- **Updated studio form** (`components/studio-form.tsx`):
  - Verification workflow implementation
  - Admin studios auto-verified and published
  - Non-admin studios require approval (`pending_new_studio_approval`)
  - Different success messages based on user role
  - Automatic publishing control based on verification

### 3.5 Studio Owner Experience Enhancements ✅
- **Dashboard analytics updates**:
  - Changed "Total Bookings" to "Total Inquiries"
  - Added "Response Rate" metric
  - Updated chart title to "Inquiry Performance"
- **Lead management workflow**:
  - Visual lead cards with project type badges
  - Client information display
  - Budget range and date preferences
  - Custom message handling
  - Quote response system with optional pricing

**Technical Implementation:**
- Enhanced RLS policies for inquiry management
- Real-time lead fetching and updates
- Comprehensive admin oversight capabilities
- Streamlined studio claiming and verification process
- Role-based feature access and workflows

---

### Phase 4: Closing the Loop - Real-time Conversation System
**Goal**: Enable direct, live communication between clients and studio owners

#### Task 4.1: Integrate Inquiries with Messaging System

**Current State Check**:
- ✅ **EXISTS** - Complete messaging system (`conversations`, `messages`, `conversation_participants`)
- ❌ **MISSING** - Integration with inquiry workflow

**Backend Logic**:
```sql
-- Function: Create conversation on first studio response to inquiry
CREATE OR REPLACE FUNCTION create_inquiry_conversation(
  inquiry_id_param BIGINT,
  studio_id_param BIGINT,
  initial_message TEXT
) RETURNS BIGINT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  conversation_id_result BIGINT;
  creator_profile_id BIGINT;
  owner_profile_id BIGINT;
BEGIN
  -- Get inquiry creator and studio owner profile IDs
  -- Check if conversation already exists
  -- If not, create conversation and add participants
  -- Insert initial message
  -- Update inquiry_recipients status to 'responded'
  RETURN conversation_id_result;
END;
$$;
```

#### Task 4.2: Implement Unified Conversation Interface

**Current State Check**:
- ❌ **MISSING** - Conversation UI at `/dashboard/messages/[conversation_id]`

**Frontend User Flow**:
- Real-time chat interface using Supabase Realtime
- Message history with timestamps
- Typing indicators and read receipts
- File/image sharing capability

**Realtime Integration**:
```typescript
// Real-time message subscription
useEffect(() => {
  const channel = supabase
    .channel('conversation_messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, handleNewMessage)
    .subscribe()
  
  return () => supabase.removeChannel(channel)
}, [conversationId])
```

---

## Completion Criteria

### Phase 1 Success Metrics:
- [x] Admin dashboard accessible only to admin role users
- [x] Studios table includes verification workflow columns
- [x] All verification states properly handled in UI
- [x] Zero security vulnerabilities maintained

### Phase 2 Success Metrics:
- [x] Quote basket functionality working end-to-end
- [x] Universal inquiry form creates proper database records
- [x] Customer inquiry dashboard shows all pending/active inquiries
- [x] Zero performance regressions

### Phase 3 Success Metrics:
- [ ] Studio claiming workflow fully functional
- [ ] New studio approval process working
- [ ] Admin can edit/delete any studio regardless of status
- [ ] Studio owners see incoming inquiries

### Phase 4 Success Metrics:
- [ ] Real-time messaging working between customers and studio owners
- [ ] Conversations linked to specific inquiries
- [ ] Message history persisted and searchable
- [ ] Mobile-responsive chat interface

## Testing Strategy

### Database Testing:
- RLS policy verification for all new tables
- State transition testing for verification workflow
- Performance testing for inquiry/conversation queries

### Frontend Testing:
- Role-based access control for admin routes
- Quote basket state management across page refreshes
- Real-time message delivery and display
- Mobile responsiveness for all new interfaces

### Integration Testing:
- Complete user journey from browse → quote basket → inquiry → conversation
- Admin workflow from verification review → approval → studio activation
- Cross-browser compatibility for real-time features

## Risk Mitigation

### High-Risk Areas:
1. **Real-time messaging reliability** - Implement fallback polling mechanism
2. **Admin verification workflow** - Extensive testing with multiple verification scenarios
3. **RLS policy complexity** - Thorough security testing with different user roles

### Rollout Strategy:
- **Phase 1**: Admin-only rollout for verification workflow testing
- **Phase 2**: Limited beta with select customers for RFQ system
- **Phase 3**: Gradual studio owner onboarding with existing verified studios
- **Phase 4**: Full platform rollout with messaging system

## Progress Log
- **2025-01-22**: Plan created, awaiting development kickoff
- **2025-01-22**: ✅ **Phase 1 COMPLETE** - Foundational Backend & Admin Tooling
  - Database schema updated with verification columns
  - RLS policies implemented for verification workflow
  - Admin dashboard created with all required functionality
  - Studio claiming function implemented
- **2025-01-22**: ✅ **Phase 2 COMPLETE** - The Customer Inquiry Flow (RFQ System)
  - RFQ database schema created (inquiries + inquiry_recipients tables)
  - Quote basket UI with Zustand state management implemented
  - Universal inquiry form with project details capture
  - Customer inquiry dashboard with response tracking 
- **2025-01-22**: ✅ **Phase 3 COMPLETE** - Studio Owner Journey & Admin Oversight
  - Enhanced dashboard with tabbed interface and incoming leads management
  - Studio claiming flow with search and verification document submission
  - Admin dashboard direct management with full CRUD operations
  - New studio creation workflow with verification requirements
- **2025-01-22**: ✅ **Phase 4 COMPLETE** - Real-time Conversation System
  - Enhanced database schema for conversations with inquiry context
  - Real-time chat interface with conversation list and message bubbles
  - Automatic conversation creation when studio owners respond to inquiries
  - Quote messaging system with dedicated UI and read receipts
  - Messages page with split-panel layout and real-time updates