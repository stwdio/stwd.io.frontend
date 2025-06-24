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
- ❌ **MISSING** - Customer inquiry tracking at `/dashboard/my-inquiries`

**Frontend User Flow**:
- Protected route showing all user's inquiries
- Table view with studio recipients and their status
- Links to conversation threads when studios respond

---

### Phase 3: Studio Owner Journey & Admin Oversight
**Goal**: Complete "supply-side" experience with verification flows and admin gatekeeping

#### Task 3.1: Create Studio Owner Dashboard Enhancement

**Current State Check**:
- ✅ **EXISTS** - Studio owner dashboard at `/dashboard` with studios management
- ❌ **MISSING** - "Incoming Leads" tab for inquiry management

**Frontend User Flow**: 
Add "Incoming Leads" tab to existing dashboard showing:
- Inquiries where user's studios are recipients
- Status tracking and response capabilities
- Link to conversation system

#### Task 3.2: Implement Studio Claiming Flow (Flow A)

**Current State Check**:
- ❌ **MISSING** - "Claim this Studio" functionality on studio pages
- ✅ **EXISTS** - File upload capabilities in existing studio forms

**Frontend User Flow**:
```typescript
// Enhance app/studios/[id]/page.tsx
// Add "Claim this Studio" button for unclaimed studios (verification_status = 'unclaimed')
// Document upload form with verification requirements
```

**Backend Mechanics**:
```sql
-- Create SECURITY DEFINER function for studio claiming
CREATE OR REPLACE FUNCTION claim_studio(
  studio_id_param BIGINT,
  verification_docs JSONB
) RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Verify studio is unclaimed
  -- Update verification_status to 'pending_claim_verification'
  -- Set claimed_by to current user's profile
  -- Store verification documents
END;
$$;
```

**Admin Workflow**:
- "Pending Studio Claims" table populated automatically
- Admin review interface with document viewer
- "Approve" → status: 'verified' + ownership transfer
- "Reject" → status: 'rejected' + clear claimed_by

#### Task 3.3: Implement New Studio Creation Flow (Flow B)

**Current State Check**:
- ✅ **EXISTS** - Studio creation UI in dashboard (`StudioFormDialog`)
- ❌ **NEEDS REFACTOR** - No verification workflow integration

**Frontend User Flow**:
- Existing "Add New Studio" form enhanced with verification workflow
- On submission: status = 'pending_new_studio_approval'
- Owner sees "Pending Approval" badge with tooltip

**Admin Workflow**:
- "New Studio Submissions" table populated automatically
- Admin review interface
- "Approve" → status: 'verified' + published: true
- "Reject" → status: 'rejected'

#### Task 3.4: Implement Admin Direct Management

**Current State Check**:
- ✅ **EXISTS** - RLS policies allowing admin override
- ❌ **MISSING** - Admin editing interface

**Frontend User Flow**:
- "All Studios" table with "Edit" and "Delete" buttons per row
- "Edit" opens existing studio form pre-filled with data
- Admin can override any studio details regardless of status

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
- [ ] Quote basket functionality working end-to-end
- [ ] Universal inquiry form creates proper database records
- [ ] Customer inquiry dashboard shows all pending/active inquiries
- [ ] Zero performance regressions

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