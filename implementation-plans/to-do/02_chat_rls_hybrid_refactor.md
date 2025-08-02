# Implementation Plan: Definitive Hybrid RLS & RPC Refactor for the stwd.io Chat System

### Objective
To permanently resolve all "infinite recursion" errors by implementing a robust Hybrid architecture. This plan moves all complex permission logic into `SECURITY DEFINER` RPC functions and simplifies RLS policies to eliminate all circular dependencies.

### 1. Root Cause Analysis

**Problem:** The previous pure RLS approach failed because the `SELECT` policy on `chat_participants` needed to query itself to determine a user's membership in a conversation, creating an inescapable recursion loop.

**Definitive Solution:** We will create a clear separation of concerns. **RPC functions will determine *if* a user is a participant**, and **RLS policies will enforce simple ownership rules**. This is the standard, secure pattern for complex permissions in Supabase.

**Further Reading:**
*   [Supabase Docs on SECURITY DEFINER Functions](https://supabase.com/docs/guides/database/functions#security-definer)

---

### 2. Implementation Steps

#### **Step 2.1: Purge All Existing Chat RLS Policies & Create Helper Function**
*   **Objective:** To ensure a completely clean slate and create a reusable function for checking chat membership.
*   **Action (Supabase SQL Editor):** Execute the following SQL script.

```sql
-- Purge all previous policies to start fresh
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('chat_conversations', 'chat_participants', 'chat_messages'))
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename || ';';
    END LOOP;
END;
$$;

-- Create the MASTER helper function to check participation.
-- This is the heart of the new architecture. It bypasses RLS to safely check the source of truth.
CREATE OR REPLACE FUNCTION is_chat_participant(p_conversation_id BIGINT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM chat_participants
    WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id
  );
END;
$$;
```

#### **Step 2.2: Implement the New, Simplified RLS Policies**

**Objective:** To create the new, non-recursive RLS policy structure that relies on the helper function.

**Action (Supabase SQL Editor):** Execute the following SQL script.

```sql
-- === POLICIES FOR: chat_conversations ===

CREATE POLICY "Participants can view their conversations"
ON public.chat_conversations
FOR SELECT USING (
  -- Use the secure function to check for participation. No recursion.
  is_chat_participant(id, auth.uid())
);

CREATE POLICY "Authenticated users can create conversations"
ON public.chat_conversations
FOR INSERT WITH CHECK (
  created_by = auth.uid()
);

-- === POLICIES FOR: chat_participants ===

CREATE POLICY "Participants can view other participants in their chats"
ON public.chat_participants
FOR SELECT USING (
  -- Use the secure function to check for participation. No recursion.
  is_chat_participant(conversation_id, auth.uid())
);

CREATE POLICY "Conversation creators can add initial participants"
ON public.chat_participants
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = chat_participants.conversation_id AND created_by = auth.uid()
  )
);

-- === POLICIES FOR: chat_messages ===

CREATE POLICY "Participants can view messages in their conversations"
ON public.chat_messages
FOR SELECT USING (
  -- Use the secure function to check for participation. No recursion.
  is_chat_participant(conversation_id, auth.uid())
);

CREATE POLICY "Participants can send messages in their conversations"
ON public.chat_messages
FOR INSERT WITH CHECK (
  -- Check ownership AND participation.
  sender_id = auth.uid() AND
  is_chat_participant(conversation_id, auth.uid())
);

CREATE POLICY "Users can delete their own messages"
ON public.chat_messages
FOR DELETE USING (
  -- Simple, non-recursive ownership check.
  sender_id = auth.uid()
);
```

#### **Step 2.3: Deprecate Frontend Fallbacks**

**Objective:** To simplify the frontend code by removing the complex and unnecessary RPC fallback logic.

**Action (Frontend Codebase):**
1. Locate the `sendMessage` function and similar logic throughout the application.
2. Remove the try/catch blocks that attempt to call an RPC function first and then fall back to a direct insert.
3. The new logic should be a single, direct Supabase client call:

```typescript
// The new, simplified message sending logic
const sendMessage = async (content: string) => {
  const { error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: content
    });
  
  if (error) {
    // This will now only catch legitimate errors (e.g., network issues, RLS violations),
    // NOT recursion errors.
    console.error('Failed to send message:', error);
  }
}
```

---

### 3. Verification & Testing Strategy

**Objective:** To rigorously test the new Hybrid RLS & RPC architecture and confirm the permanent resolution of all recursion errors.

**Action:** Execute the exact same test plan as the previous attempt. The critical difference is that all tests should now pass without any `42P17` errors.

#### **3.1 One-to-One (1:1) Chat Testing**

**Test:** A connected user initiates a chat and sends a message.

**Expected:** The message is sent instantly via a direct insert call, which passes the new, simple RLS policy. No recursion errors.

#### **3.2 Group Chat Testing**

**Test:** A user creates a group chat and sends the first message.

**Expected:** The insert into `chat_messages` passes the RLS check by calling `is_chat_participant()`, which safely confirms their membership. No recursion errors.

#### **3.3 Studio Enquiry Chat Testing**

**Test:** A quote submission triggers the creation of a new enquiry chat. Any participant sends a message.

**Expected:** The message is sent successfully. The RLS policy correctly uses `is_chat_participant()` to verify membership for the creator, a studio member, or the concierge. No recursion errors.

---

### 4. Conclusion

This Hybrid RLS & RPC architecture is the definitive solution. By encapsulating the complex membership check within a `SECURITY DEFINER` function, we break the circular dependency at its root. The RLS policies are now simple, declarative, and non-recursive, while the core security logic is centralized and protected. This resolves the recursion errors permanently and aligns with Supabase best practices for building complex, secure applications.