# Implementation Plan: The stwd.io Notification System

### Objective
To design and build a complete notification and "message seen" system that informs users of key events like new messages, follows, and connection requests, thereby increasing platform engagement and responsiveness.

---

### **Phase 1: The Foundation - "Seen By" Avatars (Read Receipts)**

**Goal:** To implement a rich, intuitive mechanism for tracking and displaying when a message has been seen by participants in a conversation, using user avatars for visual confirmation. This is the foundational layer upon which the notification logic will be built.

*   **User Story:** "As a user in a busy group chat, I want to see the actual profile pictures of my collaborators who have read my latest message, so I know exactly who is up to date at a glance."
*   **Current State Assessment:** The `chat_messages` table currently has no mechanism to track seen status. The frontend chat view does not display any read receipts. The chat system uses RPC functions with proper RLS policies to avoid recursion issues as documented in `/docs/chat-rls-recursion-solution.md`.
*   **Required High-Level Changes:**
    1.  **"Seen By" Tracking (Backend):** The system must be able to track, on a per-message basis, every individual user who has viewed that message. A new join table, `message_seen_by` (`message_id`, `user_id`, `seen_at`), will be required to store this information efficiently.
    2.  **Automatic "Seen" Trigger (Frontend):** A message should be automatically marked as "seen" by a user as soon as it becomes visible on their screen within the chat interface. This can be achieved using an `Intersection Observer` on the message component.
    3.  **Visual Indicator in Chat (Frontend):**
        *   Below each message bubble that the current user has sent, a small cluster of circular avatars must appear.
        *   Each avatar in the cluster represents a participant (other than the current user) who has seen that specific message.
        *   As more participants view the message, their avatars should be added to the cluster in real-time, as shown in the reference image.
        *   This provides immediate, rich visual feedback on who has read the message.

---

### **Phase 2: Backend Logic - Notification Generation**

**Goal:** To build the backend engine that automatically creates notifications for key events, but only when necessary (e.g., for messages that haven't been seen).

*   **User Story:** "As a studio owner, if a potential client sends me a new message in an enquiry chat while I'm away from my computer, I need the system to create a notification for me so I don't miss the lead."
*   **Current State Assessment:** A `notifications` table exists with columns (`id`, `user_id`, `item_type`, `item_id`, `is_read`, `created_at`) but is currently unused. There are no triggers on the `chat_messages` or `connections` tables to generate notifications. The platform does not have a follows table but uses `connections` table with status field for connection requests.
*   **Required High-Level Changes:**
    1.  **New Message Notifications:**
        *   When a new message is sent, the system must automatically generate a notification for **every participant in that chat except the sender**.
        *   **Crucial Logic:** A notification for a message should *not* be created for a user if they currently have that specific chat window open (and the message is therefore "seen" instantly). The system must use the new "Seen By" data from Phase 1 to avoid notifying users of messages they are actively reading.
    2.  **New Connection Request Notifications:**
        *   When a user sends a connection request (status='pending' in connections table), the system must generate a single notification for the user who **received** the request.
    3.  **Connection Accepted Notifications:**
        *   When a connection request is accepted (status changes to 'accepted'), notify the original requester.

---

### **Phase 3: The User Experience - Notification UI & Interaction**

**Goal:** To build the complete frontend user interface that allows users to see, manage, and interact with their notifications.

*   **User Story:** "As a user, I want to see a clear indicator in the site header when I have unread notifications. I need to be able to click on it to see a list of my recent activity and navigate directly to the relevant conversation or profile with a single click."
*   **Current State Assessment:** The main user navigation (`/components/nav-user.tsx`) currently has no notification element. There is no UI for displaying a list of notifications. The navigation uses a sidebar pattern with dropdown menus for user actions.
*   **Required High-Level Changes:**
    1.  **The Notification Bell:**
        *   A new `Bell` icon must be added to the user navigation component, positioned appropriately within the sidebar menu structure.
        *   This bell icon must display a small, red badge with a count of **unread notifications**. This count must update in real-time using Supabase realtime subscriptions.
    2.  **The Notification Panel:**
        *   Clicking the bell icon must open a dropdown panel similar to the existing user dropdown.
        *   This panel will display a list of the user's most recent notifications, with unread ones styled differently (e.g., with a blue dot).
        *   If there are no unread notifications, the panel should display a friendly message like, "You're all caught up."
    3.  **Interaction & Navigation:**
        *   Clicking on a specific notification in the panel must do two things simultaneously:
            a.  **Navigate the user directly** to the relevant content (e.g., the specific chat where the new message was posted, or the profile of the user who sent a connection request).
            b.  **Mark that notification as "read,"** which should cause the unread count in the header to decrease in real-time.

---

### **Technical Implementation Notes:**

1. **Database Design Considerations:**
   - The `message_seen_by` table should include proper indexes on `(message_id, user_id)` for performance
   - Consider adding a composite index on `notifications(user_id, is_read, created_at)` for efficient querying
   - All new tables must have RLS policies enabled following the hybrid pattern documented in the chat system

2. **RPC Function Requirements:**
   - Create `mark_message_as_seen(p_message_id, p_user_id)` function with SECURITY DEFINER
   - Create `get_unread_notification_count()` function that returns count for current user
   - Follow the pattern established in chat system to avoid RLS recursion

3. **Frontend Performance:**
   - Use React.memo for avatar clusters to prevent unnecessary re-renders
   - Implement virtual scrolling for notification panel if count exceeds 50 items
   - Batch "seen" updates to reduce database calls when scrolling through messages

4. **Real-time Subscriptions:**
   - Subscribe to `message_seen_by` table for live avatar updates
   - Subscribe to `notifications` table for live notification count updates
   - Use proper cleanup in useEffect to prevent memory leaks

5. **Security Considerations:**
   - Ensure users can only mark messages as "seen" in conversations they're participants of
   - Validate that notification recipients are valid users before insertion
   - Follow existing RLS patterns to maintain security while avoiding recursion