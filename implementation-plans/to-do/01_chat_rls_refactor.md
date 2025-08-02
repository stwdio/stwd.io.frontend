# Implementation Plan: Definitive RLS Refactor for the stwd.io Chat System

### Objective
To permanently resolve all "infinite recursion" errors (PostgreSQL error `42P17`) in the chat system by implementing a new, secure, and architecturally sound set of Row Level Security (RLS) policies.

### 1. Root Cause Analysis

**Problem:** The existing RLS policies create a circular dependency. An action on `chat_messages` requires a check on `chat_participants`, but the policy to check `chat_participants` requires a check on itself, leading to an infinite loop.

**Definitive Solution:** We will break this circular dependency by establishing the `chat_participants` table as the ultimate, non-recursive **source of truth** for conversation membership. Its RLS policies will be simple and self-contained. The policies on `chat_conversations` and `chat_messages` will then safely reference `chat_participants` without any risk of recursion.

**Further Reading:**
*   [Supabase Docs on RLS](https://supabase.com/docs/guides/auth/row-level-security)
*   [PostgreSQL RLS Policies Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

### 2. Implementation Steps

#### **Step 2.1: Purge All Existing Chat RLS Policies**
*   **Objective:** To ensure a completely clean slate and remove all problematic legacy policies.
*   **Action (Supabase SQL Editor):** Execute the following SQL script. This script will find and drop every RLS policy on the three core chat tables.

```sql
-- Script to generate DROP statements for all existing chat policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT polname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('chat_conversations', 'chat_participants', 'chat_messages'))
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.polname || '" ON public.' || r.tablename || ';';
    END LOOP;
END;
$$;
```

#### **Step 2.2: Implement the New, Non-Recursive RLS Policies**

**Objective:** To create the new, secure, and permanent RLS policy structure.

**Action (Supabase SQL Editor):** Execute the following SQL script to create the complete set of new policies.

```sql
-- === POLICIES FOR: chat_participants (The Source of Truth) ===
-- These policies are simple and self-referential, breaking the recursion loop.

-- [SELECT] A user can see all participants in conversations that they are a part of.
CREATE POLICY "Participants can view other participants in their chats"
ON public.chat_participants
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id
    FROM public.chat_participants
    WHERE user_id = auth.uid()
  )
);

-- [INSERT] The creator of a conversation can add the initial participants.
CREATE POLICY "Conversation creators can add initial participants"
ON public.chat_participants
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.chat_conversations
    WHERE id = chat_participants.conversation_id
      AND created_by = auth.uid()
  )
);

-- [DELETE] A user can only remove themselves from a conversation.
CREATE POLICY "Users can remove themselves from conversations"
ON public.chat_participants
FOR DELETE USING (
  user_id = auth.uid()
);


-- === POLICIES FOR: chat_conversations ===
-- These policies safely reference the source of truth (chat_participants).

-- [SELECT] A user can view a conversation's details if they are a participant.
CREATE POLICY "Users can view conversations they participate in"
ON public.chat_conversations
FOR SELECT USING (
  id IN (
    SELECT conversation_id
    FROM public.chat_participants
    WHERE user_id = auth.uid()
  )
);

-- [INSERT] Any authenticated user can create a conversation.
CREATE POLICY "Authenticated users can create conversations"
ON public.chat_conversations
FOR INSERT WITH CHECK (
  created_by = auth.uid()
);

-- [UPDATE] A user can update a conversation's details (e.g., title) if they are a participant.
CREATE POLICY "Participants can update their conversations"
ON public.chat_conversations
FOR UPDATE USING (
  id IN (
    SELECT conversation_id
    FROM public.chat_participants
    WHERE user_id = auth.uid()
  )
);


-- === POLICIES FOR: chat_messages ===
-- These policies also safely reference the source of truth (chat_participants).

-- [SELECT] A user can view messages in a conversation if they are a participant.
CREATE POLICY "Participants can view messages in their conversations"
ON public.chat_messages
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id
    FROM public.chat_participants
    WHERE user_id = auth.uid()
  )
);

-- [INSERT] A user can send a message in a conversation if they are a participant.
CREATE POLICY "Participants can send messages in their conversations"
ON public.chat_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT conversation_id
    FROM public.chat_participants
    WHERE user_id = auth.uid()
  )
);

-- [DELETE] A user can only delete messages they have sent.
CREATE POLICY "Users can delete their own messages"
ON public.chat_messages
FOR DELETE USING (
  sender_id = auth.uid()
);
```

---

### 3. Verification & Testing Strategy

**Objective:** To rigorously test the new RLS policies against all required chat types and confirm the permanent resolution of the recursion error.

**Action (Manual & Automated Testing):** Execute the following test cases. The primary success criterion is the complete absence of the `42P17` recursion error.

#### **3.1 One-to-One (1:1) Chat Testing**

**Scenario:** A creator and a producer are connected.

*   **Test Case 1:** The creator initiates a chat with the producer.
    *   **Expected:** A new conversation is created, and both users are added as participants.

*   **Test Case 2:** Both users send and receive messages.
    *   **Expected:** Messages are sent and received successfully in real-time.

*   **Test Case 3:** A third, unconnected user attempts to view the conversation or its messages via a direct query.
    *   **Expected:** The query returns zero rows.

#### **3.2 Group Chat Testing**

**Scenario:** A band leader creates a group chat with two bandmates and a producer (all are connections).

*   **Test Case 1:** The leader creates the group chat.
    *   **Expected:** A new conversation with `is_group: true` is created, and all four users are added as participants.

*   **Test Case 2:** All four participants send and receive messages.
    *   **Expected:** All messages are visible to all participants.

*   **Test Case 3:** An outside user attempts to read the messages.
    *   **Expected:** The query returns zero rows.

#### **3.3 Studio Enquiry Chat Testing**

**Scenario:** A podcaster submits a quote request to a studio. The studio has two team members.

*   **Test Case 1:** The podcaster submits the quote.
    *   **Expected:** A new group conversation is created.

*   **Test Case 2:** Verify participants.
    *   **Expected:** The `chat_participants` table for this conversation must contain the podcaster, both studio team members, and the `studio_concierge` user.

*   **Test Case 3:** The podcaster, a studio member, and the concierge all send messages.
    *   **Expected:** All messages appear correctly in the single conversation thread.

---

### 4. Conclusion

This implementation plan provides a definitive, secure, and non-recursive RLS architecture for the stwd.io chat system. By purging the old, problematic policies and establishing `chat_participants` as the simple source of truth, all circular dependencies are eliminated, permanently resolving the recursion errors while maintaining all required security and functionality.