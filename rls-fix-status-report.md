# RLS Fix Status Report - Remaining Recursion Issue

## Current Status
Despite implementing the "definitive" RLS refactor, we are still encountering:
```
code: "42P17"
message: 'infinite recursion detected in policy for relation "chat_participants"'
```

## What Was Attempted

### 1. Complete RLS Policy Purge and Rebuild
Following the implementation plan in `/implementation-plans/to-do/01_chat_rls_refactor.md`, we:

1. **Purged all existing policies** using:
```sql
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
```

2. **Implemented new "non-recursive" policies** designed to use `chat_participants` as the source of truth:

```sql
-- === POLICIES FOR: chat_participants (The Source of Truth) ===
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
CREATE POLICY "Users can view conversations they participate in"
ON public.chat_conversations
FOR SELECT USING (
  id IN (
    SELECT conversation_id
    FROM public.chat_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create conversations"
ON public.chat_conversations
FOR INSERT WITH CHECK (
  created_by = auth.uid()
);

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
CREATE POLICY "Participants can view messages in their conversations"
ON public.chat_messages
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id
    FROM public.chat_participants
    WHERE user_id = auth.uid()
  )
);

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

CREATE POLICY "Users can delete their own messages"
ON public.chat_messages
FOR DELETE USING (
  sender_id = auth.uid()
);
```

## The Problem: Why It's Still Failing

The error specifically mentions `"chat_participants"`, and looking at the SELECT policy for this table:

```sql
CREATE POLICY "Participants can view other participants in their chats"
ON public.chat_participants
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id
    FROM public.chat_participants  -- THIS IS THE PROBLEM!
    WHERE user_id = auth.uid()
  )
);
```

**THE ISSUE**: The SELECT policy on `chat_participants` references itself (`FROM public.chat_participants`), creating a circular dependency. When PostgreSQL tries to evaluate whether a user can SELECT from `chat_participants`, it needs to... SELECT from `chat_participants`, causing infinite recursion.

## Why the "Definitive" Solution Failed

The implementation plan claimed `chat_participants` would be the "source of truth" with "self-contained policies", but the SELECT policy is NOT self-contained - it queries its own table in a subquery, which PostgreSQL's RLS engine cannot handle without recursion.

## What Needs to Be Fixed

The `chat_participants` SELECT policy must be rewritten to avoid querying itself. Possible approaches:

1. **Use a simple condition without subqueries**:
```sql
-- Only see participants in conversations where you are also a participant
CREATE POLICY "Participants can view other participants in their chats"
ON public.chat_participants
FOR SELECT USING (
  user_id = auth.uid()  -- This would only show your own participation records
);
```

2. **Use EXISTS with a different approach**:
```sql
-- This still has issues but shows the concept
CREATE POLICY "Participants can view other participants in their chats"
ON public.chat_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = chat_participants.conversation_id
    AND (
      created_by = auth.uid() OR
      -- Need another way to check participation without querying chat_participants
    )
  )
);
```

3. **Use a database function with SECURITY DEFINER**:
```sql
CREATE OR REPLACE FUNCTION can_view_participants(p_conversation_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM chat_participants
    WHERE conversation_id = p_conversation_id
    AND user_id = auth.uid()
  );
END;
$$;

CREATE POLICY "Participants can view other participants in their chats"
ON public.chat_participants
FOR SELECT USING (
  can_view_participants(conversation_id)
);
```

## Existing RPC Functions

We also have these RPC functions already created as workarounds:
- `create_chat_conversation()` - Creates conversations bypassing RLS
- `send_chat_message()` - Sends messages bypassing RLS

## Recommendation for AI IDE

The current implementation has a fundamental flaw in the `chat_participants` SELECT policy. The policy must be rewritten to avoid self-referential queries. The "source of truth" concept is correct, but the implementation violates the principle by having the source of truth query itself.

Please redesign the `chat_participants` policies to be truly self-contained, or implement a different architecture that avoids any table needing to query itself in its RLS policies.