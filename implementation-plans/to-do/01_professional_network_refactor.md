# Implementation Plan: Professional Network Refactor

### Objective
To refactor the stwd.io platform based on the findings of the February 2025 Audit Report. This plan will guide the development of a two-way professional connection system, a studio organization model, and a concierge-led enquiry process.

---

### **Phase 1: Foundational Backend Refactor (Using Supabase MCP)**

**Goal:** Re-architect the core database structures for the new user relationship and studio ownership models using the Supabase web interface.

*   **Task 1.1: Implement the Private "Connection" System (Backend)**
    *   **User Story:** "As a professional, I want to build a trusted network by sending connection requests to other users, which they must accept, so that all my interactions are with people I have a mutual professional relationship with."
    *   **Current State:** Not Present.
    *   **Implementation Steps (Supabase MCP):**
        1.  Navigate to the **Table Editor** in the Supabase MCP.
        2.  Create a new table named `connections`.
        3.  Define the columns:
            - `id` (Type: `BIGINT`, Primary Key, Generated Always as Identity)
            - `requester_id` (Type: `UUID`, Foreign Key to `auth.users.id`)
            - `receiver_id` (Type: `UUID`, Foreign Key to `auth.users.id`)
            - `status` (Type: `TEXT`, with a check constraint for values: `'pending'`, `'accepted'`, `'declined'`)
            - `created_at` (Type: `TIMESTAMPTZ`, Default: `now()`)
            - `updated_at` (Type: `TIMESTAMPTZ`, Default: `now()`)
        4.  Add a unique constraint on the combination of `requester_id` and `receiver_id`.
        5.  Navigate to the **RLS Policy Editor** for the `connections` table:
            - Enable RLS
            - Create SELECT policy: Users can view connections where they are either requester or receiver
            - Create INSERT policy: Users can only create requests from their own user_id
            - Create UPDATE policy: Only receivers can update status of requests sent to them
            - Create DELETE policy: Either party can delete a connection

*   **Task 1.2: Implement the Studio "Organization" Model (Backend)**
    *   **User Story:** "As a studio owner, I need to grant my studio manager and head engineer access to our studio's profile and incoming leads on stwd.io, so they can help me run the business."
    *   **Current State:** Not Present.
    *   **Implementation Steps (Supabase MCP):**
        1.  Using the **Table Editor**, create a new table named `studio_members`.
        2.  Define its columns:
            - `studio_id` (Type: `BIGINT`, Foreign Key to `studios.id`)
            - `user_id` (Type: `UUID`, Foreign Key to `auth.users.id`)
            - `role` (Type: `TEXT`, with check constraint for values: `'owner'`, `'manager'`, `'engineer'`)
            - `created_at` (Type: `TIMESTAMPTZ`, Default: `now()`)
            - `created_by` (Type: `UUID`, Foreign Key to `auth.users.id`)
        3.  Make the combination of `studio_id` and `user_id` the primary key.
        4.  Navigate to the **SQL Editor** and run this migration to populate existing data:
            ```
            INSERT INTO studio_members (studio_id, user_id, role, created_by)
            SELECT id, owner_id, 'owner', owner_id
            FROM studios
            WHERE owner_id IS NOT NULL;
            ```
        5.  Update RLS policies on `studios` table to check `studio_members` instead of `owner_id`.

---

### **Phase 2: UI & Discovery Model Refactor (Frontend)**

**Goal:** Refactor the existing UI to reflect the new social and business models, and build the shell for the new Connections page.

*   **Task 2.1: Remove Follower/Following Counts**
    *   **User Story:** "As a platform, we want to promote a healthier social environment by removing public follower counts, encouraging users to connect based on professional merit rather than chasing vanity metrics."
    *   **Current State:** Partially Present - counts are displayed.
    *   **Implementation Steps (Frontend):**
        1.  Open `/components/social/followers-list.tsx`:
            - Remove the `totalCount` state variable
            - Remove the count display in the CardTitle (line ~201)
            - Remove the "View all X followers" button text, make it just "View all"
        2.  Open `/components/social/following-list.tsx`:
            - Remove the `totalCount` state variable
            - Remove the count display in the CardTitle (line ~202)
            - Remove the "View all X follows" button text
        3.  Remove the `useFollowerCount` and `useFollowingCount` hooks from `/lib/hooks/queries/social.ts` as they're no longer needed.

*   **Task 2.2: Remove Price Display from Discovery**
    *   **User Story:** "As a creator, I want the discovery process to be focused on the quality and creative fit of a studio, not just its price, so I can make a more informed choice for my project."
    *   **Current State:** Not Present - prices are prominently displayed.
    *   **Implementation Steps (Frontend):**
        1.  In `/components/cards/studio-card.tsx`:
            - Remove the `priceTier` prop passed to GenericCard (line ~165)
            - Remove imports for `getPriceTierSymbol` and price-related types
        2.  In `/components/cards/generic-card.tsx`:
            - Remove the price tier display section from the card
            - Remove the `priceTier` prop from the component interface
        3.  In `/components/discover/filter-panel.tsx`:
            - Remove the entire "Price Tier" filter section (lines ~193-216)
            - Remove price-related state variables and filter logic
        4.  In `/components/studio-detail-content.tsx`:
            - Remove the price tier display next to the studio name (line ~142)

*   **Task 2.3: Create the Connections Page**
    *   **User Story:** "As a user, I need a single, dedicated page (`/connections`) to manage my professional network, replacing the old quotes page."
    *   **Current State:** Not Present - only `/connect` redirect exists.
    *   **Implementation Steps (Frontend):**
        1.  Delete the redirect file at `/app/(discover)/connect/page.tsx`
        2.  Move `/app/(discover)/connect/quotes/*` to a temporary location for reference
        3.  Create `/app/(discover)/connections/page.tsx` with proper authentication
        4.  Create `/components/connections/connections-hub.tsx` with three tabs:
            - "My Connections" - Grid of accepted connections using ProfileCard
            - "Pending Requests" - List of incoming requests with Accept/Decline buttons
            - "Sent Requests" - List of outgoing requests with Cancel option
        5.  Update navigation in `/components/site-header.tsx` to point to `/connections` instead of `/connect`

---

### **Phase 3: The Full Connection & Communication Flow**

**Goal:** Build the complete user flows for connecting with users, managing requests, and implementing the new gated communication rules.

*   **Task 3.1: Build Connection Request System**
    *   **User Story:** "As an engineer, I want to send a connection request to a studio owner I'd like to work with. On my connections page, I need to see if they've accepted my request yet."
    *   **Current State:** Not Present - only follow system exists.
    *   **Implementation Steps (Frontend):**
        1.  Create new hooks in `/lib/hooks/mutations/connections.ts`:
            - `useSendConnectionRequest()`
            - `useAcceptConnectionRequest()`
            - `useDeclineConnectionRequest()`
            - `useCancelConnectionRequest()`
        2.  Create query hooks in `/lib/hooks/queries/connections.ts`:
            - `useConnectionStatus(userId)` - Check connection status between two users
            - `useMyConnections()` - Get all accepted connections
            - `usePendingRequests()` - Get incoming requests
            - `useSentRequests()` - Get outgoing requests
        3.  In `/app/(discover)/profiles/[username]/_components/profile-content.tsx`:
            - Replace the Follow button logic with Connection button
            - Show different states: "Connect", "Pending", "Connected", "Accept Request"
        4.  In `/components/cards/profile-card.tsx`:
            - Update the secondary action to use connection status instead of follow status

*   **Task 3.2: Implement Gated 1-on-1 Chat**
    *   **User Story:** "As a user, I want my inbox to be protected. I need to ensure that I only receive messages from people I have accepted as a connection, preventing unsolicited spam."
    *   **Current State:** Not Present - anyone can message anyone.
    *   **Implementation Steps (Frontend & MCP):**
        1.  **Frontend Updates:**
            - In `/app/(discover)/profiles/[username]/_components/profile-content.tsx`:
                - Modify `handleMessage` function to check connection status first
                - Disable Message button if not connected
                - Show tooltip: "You must be connected to message this user"
            - In `/components/cards/profile-card.tsx`:
                - Apply same message button restrictions
        2.  **Backend (Supabase MCP):**
            - Navigate to **SQL Editor** and create a function to check connections:
                ```
                CREATE OR REPLACE FUNCTION check_connection_exists(user1 UUID, user2 UUID)
                RETURNS BOOLEAN AS $$
                BEGIN
                  RETURN EXISTS (
                    SELECT 1 FROM connections
                    WHERE status = 'accepted'
                    AND ((requester_id = user1 AND receiver_id = user2)
                    OR (requester_id = user2 AND receiver_id = user1))
                  );
                END;
                $$ LANGUAGE plpgsql SECURITY DEFINER;
                ```
            - In **RLS Policy Editor** for `chat_messages`:
                - Modify INSERT policy to include connection check for user-to-user messages

*   **Task 3.3: Implement Group Chat Creation**
    *   **User Story:** "As a musician, I want to quickly create a group chat with my manager and a producer I'm connected with to discuss a new track."
    *   **Current State:** Partially Present - backend supports it, no UI.
    *   **Implementation Steps (Frontend):**
        1.  Create `/components/connections/group-chat-basket.tsx`:
            - Floating button showing selected users count
            - Drawer/modal showing selected connections
            - "Create Group Chat" action button
        2.  In `/components/connections/connections-hub.tsx`:
            - Add checkbox mode for the "My Connections" tab
            - Show "Select for Group Chat" toggle button
            - When in selection mode, show checkboxes on ProfileCards
        3.  Create `/lib/hooks/mutations/group-chat.ts`:
            - `useCreateGroupChat()` - Creates conversation with multiple participants
        4.  Implement the flow:
            - User selects multiple connections
            - Clicks "Create Group Chat" 
            - System creates chat_conversation with is_group=true
            - Adds all selected users as participants
            - Redirects to `/connect/chat?conversation={id}`

---

### **Phase 4: The Concierge-Led Enquiry System**

**Goal:** Integrate the quote submission process with the chat system and introduce the Concierge role.

*   **Task 4.1: Create Concierge User**
    *   **User Story:** "As a platform, we want a dedicated concierge user to facilitate all formal studio enquiries."
    *   **Current State:** Not Present - no concierge role exists.
    *   **Implementation Steps (Supabase MCP):**
        1.  Navigate to **Authentication** > **Users** in Supabase MCP
        2.  Create a new user with email `concierge@stwd.io`
        3.  Navigate to **Table Editor** > `profiles`
        4.  Find the concierge user's profile and update:
            - `username`: `studio_concierge`
            - `first_name`: `Studio`
            - `last_name`: `Concierge`
            - `system_role`: `admin`
        5.  Note the concierge's `user_id` for use in code

*   **Task 4.2: Refactor Quote Basket to Create Enquiry Chats**
    *   **User Story:** "As a creator submitting a formal quote request, I expect a dedicated space for this business transaction, with the studio team and a stwd.io concierge present to help."
    *   **Current State:** Not Present - quotes go to separate inquiries system.
    *   **Implementation Steps (Frontend):**
        1.  In `/lib/store/quote-basket.ts`, refactor `submitInquiry`:
            - Remove all code that inserts into `inquiries` table
            - For each studio in basket:
                - Create a group conversation
                - Fetch studio members from `studio_members` table
                - Add creator, all studio members, and concierge as participants
                - Format quote details into a structured first message
                - Insert as first message with special `message_type: 'enquiry'`
        2.  Create `/components/chat/enquiry-message.tsx`:
            - Special formatting for enquiry messages
            - Shows project type, budget, dates, and custom message
            - Highlighted styling to differentiate from regular messages
        3.  Update `/components/stwd-message-display.tsx`:
            - Add case for `message_type === 'enquiry'`
            - Render EnquiryMessage component
        4.  After successful submission:
            - Clear quote basket
            - Redirect to `/connect/chat` to see new conversations

*   **Task 4.3: Update Studio Team Access**
    *   **User Story:** "As a studio engineer, I need to see and respond to enquiries sent to my studio."
    *   **Current State:** Not Present - only owners see studio data.
    *   **Implementation Steps (Frontend & MCP):**
        1.  **Backend (Supabase MCP):**
            - Update RLS policies on `chat_conversations` table:
                - Studio members can view conversations where their studio is involved
            - Update RLS policies on `chat_messages`:
                - Studio members can send messages in studio conversations
        2.  **Frontend Updates:**
            - In `/app/workspace/page.tsx`:
                - Update queries to use `studio_members` instead of direct ownership
                - Show all studios where user is a member
            - Create studio member management UI:
                - Add "Team" tab to studio management
                - List current members with roles
                - "Add Member" button with role selection
                - Remove member functionality (owners only)

---

### **Phase 5: Testing & Migration**

**Goal:** Ensure smooth transition and data integrity.

*   **Task 5.1: Data Migration & Cleanup**
    *   **Implementation Steps:**
        1.  Migrate existing quote/inquiry data to the new chat-based system (optional)
        2.  Update all components to use new connection system instead of follows
        3.  Deprecate old tables: `inquiries`, `inquiry_recipients`
        4.  Remove unused components and hooks related to the old follow system

*   **Task 5.2: Testing Checklist**
    *   **Test Scenarios:**
        1.  Connection request flow (send, accept, decline)
        2.  Message button disabled for non-connections
        3.  Group chat creation with connections only
        4.  Quote basket creates enquiry chats with all parties
        5.  Studio team members can access studio conversations
        6.  Price information removed from discovery
        7.  No follower/following counts displayed

---

### **Success Criteria**

1. Users can only message other users if they have an accepted connection
2. Studios can be messaged by anyone (unchanged)
3. Quote submissions create group chats with creator, studio team, and concierge
4. Price information is not displayed during discovery
5. Studios support multiple team members with role-based access
6. The platform has both public follows (existing) and private connections (new)
7. No follower/following counts are displayed anywhere in the UI