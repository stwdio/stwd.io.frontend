# Chat System Backend State Documentation

## Overview
This document captures the complete backend state of the stwd.io chat system after successfully resolving all RLS recursion issues. Use this as a reference to restore the backend to a working state if needed.

## Database Tables

### 1. chat_conversations
```sql
CREATE TABLE chat_conversations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    is_group BOOLEAN DEFAULT false NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT
);
```

### 2. chat_participants
```sql
CREATE TABLE chat_participants (
    conversation_id BIGINT REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);
```

### 3. chat_messages
```sql
CREATE TABLE chat_messages (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    conversation_id BIGINT REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

## Core Functions

### 1. is_chat_participant - Master Permission Checker
```sql
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

### 2. create_chat_conversation - Safe Conversation Creation
```sql
CREATE OR REPLACE FUNCTION create_chat_conversation(
  p_is_group BOOLEAN DEFAULT false,
  p_title TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_group BOOLEAN,
  created_by UUID,
  title TEXT,
  uuid UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO chat_conversations (is_group, created_by, title)
  VALUES (p_is_group, auth.uid(), p_title)
  RETURNING 
    chat_conversations.id,
    chat_conversations.created_at,
    chat_conversations.updated_at,
    chat_conversations.is_group,
    chat_conversations.created_by,
    chat_conversations.title,
    chat_conversations.uuid;
END;
$$;
```

### 3. send_chat_message - Safe Message Sending
```sql
CREATE OR REPLACE FUNCTION send_chat_message(
  p_conversation_id BIGINT,
  p_content TEXT
)
RETURNS BIGINT  -- Returns the created message ID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_id UUID;
  v_message_id BIGINT;
BEGIN
  v_sender_id := auth.uid();
  
  -- Use our helper function for permission check
  IF NOT is_chat_participant(p_conversation_id, v_sender_id) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;
  
  INSERT INTO chat_messages (conversation_id, sender_id, content)
  VALUES (p_conversation_id, v_sender_id, p_content)
  RETURNING id INTO v_message_id;
  
  UPDATE chat_conversations 
  SET updated_at = NOW()
  WHERE id = p_conversation_id;
  
  RETURN v_message_id;
END;
$$;
```

### 4. get_studio_concierge_id - Get System Concierge User
```sql
CREATE OR REPLACE FUNCTION get_studio_concierge_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_concierge_id UUID;
BEGIN
  SELECT user_id INTO v_concierge_id
  FROM profiles
  WHERE username = 'studio_concierge'
  LIMIT 1;
  
  RETURN v_concierge_id;
END;
$$;
```

## RLS Policies (Hybrid Architecture)

### chat_conversations Policies
```sql
-- SELECT: Participants can view their conversations
CREATE POLICY "Participants can view their conversations"
ON public.chat_conversations
FOR SELECT USING (
  is_chat_participant(id, auth.uid())
);

-- INSERT: Authenticated users can create conversations
CREATE POLICY "Authenticated users can create conversations"
ON public.chat_conversations
FOR INSERT WITH CHECK (
  created_by = auth.uid()
);
```

### chat_participants Policies
```sql
-- SELECT: Participants can view other participants in their chats
CREATE POLICY "Participants can view other participants in their chats"
ON public.chat_participants
FOR SELECT USING (
  is_chat_participant(conversation_id, auth.uid())
);

-- INSERT: Conversation creators can add initial participants
CREATE POLICY "Conversation creators can add initial participants"
ON public.chat_participants
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = chat_participants.conversation_id 
    AND created_by = auth.uid()
  )
);
```

### chat_messages Policies
```sql
-- SELECT: Participants can view messages in their conversations
CREATE POLICY "Participants can view messages in their conversations"
ON public.chat_messages
FOR SELECT USING (
  is_chat_participant(conversation_id, auth.uid())
);

-- INSERT: Participants can send messages in their conversations
CREATE POLICY "Participants can send messages in their conversations"
ON public.chat_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  is_chat_participant(conversation_id, auth.uid())
);

-- DELETE: Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.chat_messages
FOR DELETE USING (
  sender_id = auth.uid()
);
```

## Database Triggers

### Auto-add Creator as Participant
```sql
CREATE OR REPLACE FUNCTION add_creator_as_participant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO chat_participants (conversation_id, user_id)
  VALUES (NEW.id, NEW.created_by)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_creator_to_conversation
AFTER INSERT ON chat_conversations
FOR EACH ROW
EXECUTE FUNCTION add_creator_as_participant();
```

## Function Permissions
```sql
-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_chat_participant TO authenticated;
GRANT EXECUTE ON FUNCTION create_chat_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION send_chat_message TO authenticated;
GRANT EXECUTE ON FUNCTION get_studio_concierge_id TO authenticated;
```

## Critical Implementation Notes

### 1. Always Use RPC Functions for Creation
**Never use direct inserts** for chat_conversations. Always use:
```typescript
await supabase.rpc('create_chat_conversation', {
  p_is_group: boolean,
  p_title: string | null
})
```

### 2. Frontend Files Updated
All conversation creation has been updated in:
- `/components/group-chat-basket-dialog.tsx`
- `/app/connect/chat/page.tsx` 
- `/lib/store/quote-basket.ts`
- `/components/connections/group-chat-basket.tsx`
- `/components/chat/draft-message-thread.tsx`

### 3. The Hybrid Architecture Pattern
- **RPC Functions**: Handle complex permission logic (is user a participant?)
- **RLS Policies**: Handle simple ownership rules (is this your message?)
- **No Self-References**: No policy queries its own table

### 4. Why This Works
1. `is_chat_participant()` uses SECURITY DEFINER to bypass RLS when checking membership
2. All policies delegate complex checks to this function
3. No circular dependencies exist
4. Frontend consistency ensured by using RPC functions

## Restoration Steps
If you need to restore this working state:

1. Drop all existing chat RLS policies
2. Create the helper function `is_chat_participant`
3. Create the RPC functions for conversation and message operations
4. Apply the simplified RLS policies
5. Ensure all frontend code uses RPC functions, not direct inserts

## Testing Checklist
- ✅ 1:1 chats work without recursion
- ✅ Group chats work without recursion
- ✅ Studio enquiry chats work with concierge
- ✅ Messages appear immediately after sending
- ✅ All chat types properly enforce participant access