# Implementation Plan: The stwd.io Realtime Notification System

### Objective
To design and build a complete notification and "message seen" system powered by Supabase Realtime, ensuring users are instantly informed of key events like new messages, follows, and connection requests.

---

### **Phase 1: The Foundation - "Seen By" Status (Read Receipts)**

**Goal:** To implement the core mechanism for tracking when a message has been seen. This phase is a **critical prerequisite** for the intelligent notification logic in Phase 2.

*   **User Story:** "As a user in a busy group chat, I want to see the actual profile pictures of my collaborators who have read my latest message, so I know exactly who is up to date at a glance."
*   **Current State Assessment:** The `chat_messages` table has no seen tracking. The chat UI in `/components/chat/message-thread.tsx` already uses Supabase Realtime for new messages but lacks read receipt functionality.
*   **Required High-Level Changes:**
    1.  **"Seen By" Tracking (Backend):** 
        - Create new table `message_seen_by` with columns: `message_id` (BIGINT), `user_id` (UUID), `seen_at` (TIMESTAMPTZ)
        - Add composite primary key on `(message_id, user_id)`
        - Enable RLS following the hybrid pattern from chat system
        - Create SECURITY DEFINER function `mark_message_as_seen()` to handle insertions
    2.  **Automatic "Seen" Trigger (Frontend):** 
        - Implement Intersection Observer in message components
        - Batch seen updates using debouncing to minimize database calls
        - Only mark messages as seen when visible for >500ms
    3.  **Realtime Avatar Updates:**
        - Subscribe to `message_seen_by` table for INSERT events
        - Filter subscription by conversation messages only
        - Update avatar cluster in real-time as users view messages

---

### **Phase 2: Backend Logic - Realtime-Enabled Notification Generation**

**Goal:** To build the backend engine that automatically creates notifications as database events, which the Realtime server will then broadcast.

*   **User Story:** "As the platform, when a user receives a new message they haven't seen, I need to create a notification record in the database instantly so the Realtime service can pick it up and alert them."
*   **Current State Assessment:** The `notifications` table exists but lacks triggers. No connection between chat activity and notification generation.
*   **Required High-Level Changes:**
    1.  **Implement as Postgres Functions & Triggers:**
        ```sql
        -- Function to check if user has seen message
        CREATE OR REPLACE FUNCTION is_message_seen(p_message_id BIGINT, p_user_id UUID)
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM message_seen_by 
            WHERE message_id = p_message_id AND user_id = p_user_id
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        ```
    2.  **New Message Trigger:**
        ```sql
        CREATE OR REPLACE FUNCTION notify_new_message()
        RETURNS TRIGGER AS $$
        DECLARE
          participant RECORD;
        BEGIN
          -- Get all participants except sender
          FOR participant IN 
            SELECT user_id FROM chat_participants 
            WHERE conversation_id = NEW.conversation_id 
            AND user_id != NEW.sender_id
          LOOP
            -- Only create notification if not already seen
            IF NOT is_message_seen(NEW.id, participant.user_id) THEN
              INSERT INTO notifications (user_id, item_type, item_id, is_read)
              VALUES (participant.user_id, 'message', NEW.id, false);
            END IF;
          END LOOP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        CREATE TRIGGER on_new_message_notify
        AFTER INSERT ON chat_messages
        FOR EACH ROW EXECUTE FUNCTION notify_new_message();
        ```
    3.  **Connection Request Trigger:**
        ```sql
        CREATE OR REPLACE FUNCTION notify_connection_request()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.status = 'pending' THEN
            INSERT INTO notifications (user_id, item_type, item_id, is_read)
            VALUES (NEW.receiver_id, 'connection_request', NEW.id, false);
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        CREATE TRIGGER on_connection_request_notify
        AFTER INSERT ON connections
        FOR EACH ROW EXECUTE FUNCTION notify_connection_request();
        ```
    4.  **Smart Notification Cleanup:**
        - When a message is marked as seen, delete any unread notification for that message
        - Implement via trigger on `message_seen_by` table

---

### **Phase 3: The User Experience - The Realtime Notification UI**

**Goal:** To build the complete frontend UI that **subscribes to and reacts to** live notification events from Supabase Realtime.

*   **User Story:** "As a user, I want the notification bell in the header to light up with a new count the *instant* a new message arrives, without me having to refresh the page."
*   **Current State Assessment:** The nav components have no notification features. No global state management for realtime data.
*   **Required High-Level Changes:**
    1.  **Global Realtime Subscription Architecture:**
        ```typescript
        // Create a notification store using Zustand
        interface NotificationStore {
          notifications: Notification[]
          unreadCount: number
          subscribe: () => void
          unsubscribe: () => void
          markAsRead: (id: number) => void
        }

        // Root layout establishes user-specific channel
        useEffect(() => {
          const channel = supabase
            .channel(`notifications:${userId}`)
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`
            }, handleNewNotification)
            .on('postgres_changes', {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`
            }, handleNotificationUpdate)
            .subscribe()
        }, [userId])
        ```
    2.  **Notification Bell Component:**
        ```typescript
        // Real-time reactive bell in nav-user.tsx
        export function NotificationBell() {
          const { unreadCount } = useNotificationStore()
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <IconBell />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <NotificationPanel />
            </DropdownMenu>
          )
        }
        ```
    3.  **Notification Panel with Live Updates:**
        - Panel content sourced from Zustand store (always current)
        - Each notification shows sender avatar, preview text, and timestamp
        - Unread notifications have blue dot indicator
        - Click handlers navigate to relevant content
    4.  **Optimistic Updates:**
        - When marking as read, immediately update UI
        - Background sync with database
        - Rollback on error with toast notification
    5.  **Performance Optimizations:**
        - Virtual scrolling for notification list
        - Lazy load older notifications on scroll
        - Batch mark-as-read operations
        - Cleanup subscriptions on unmount

---

### **Technical Architecture Benefits:**

1. **Zero Polling:** No periodic fetching - all updates pushed via WebSocket
2. **Instant Updates:** <100ms latency from database event to UI update
3. **Scalable:** Supabase Realtime handles millions of concurrent connections
4. **Efficient:** Only relevant events sent to each user's channel
5. **Resilient:** Automatic reconnection and missed event recovery

### **Security Considerations:**

1. **Channel Security:** Each user can only subscribe to their own notification channel
2. **RLS Integration:** Notification table RLS ensures users only see their notifications
3. **Trigger Security:** All trigger functions use SECURITY DEFINER with explicit search_path
4. **Input Validation:** Sanitize notification content to prevent XSS

### **Implementation Priority:**

1. Phase 1 first - establishes the "seen" foundation
2. Phase 2 triggers depend on Phase 1 data
3. Phase 3 can begin UI prototyping in parallel with Phase 2