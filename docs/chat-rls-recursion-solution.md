# Chat System RLS Recursion - Complete Solution Documentation

## Problem Overview

The stwd.io chat system experienced persistent "infinite recursion" errors (PostgreSQL error code `42P17`) when implementing Row Level Security (RLS) policies. This document captures the complete journey to resolution and serves as a reference for similar issues.

## The Recursion Problem

### Error Manifestation
```
code: "42P17"
message: "infinite recursion detected in policy for relation 'chat_participants'"
```

### Root Cause
The recursion occurred because RLS policies created circular dependencies:

1. To check if a user can SELECT from `chat_participants`, the policy needed to verify they were a participant
2. To verify they were a participant, it needed to SELECT from `chat_participants`
3. This created an infinite loop

Example of the problematic policy:
```sql
-- THIS CAUSES RECURSION!
CREATE POLICY "Participants can view other participants in their chats"
ON public.chat_participants
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id
    FROM public.chat_participants  -- Self-reference causes recursion
    WHERE user_id = auth.uid()
  )
);
```

## Failed Attempts

### Attempt 1: Pure RLS Approach
**Theory**: Use `chat_participants` as a "source of truth" with self-contained policies.

**Why it failed**: The SELECT policy still referenced itself, maintaining the circular dependency.

### Attempt 2: RPC Workarounds in Frontend
**Theory**: Use SECURITY DEFINER functions as fallbacks when direct queries fail.

**Why it was insufficient**: 
- Complex frontend logic with try/catch fallbacks
- Inconsistent behavior
- Poor user experience
- Didn't solve the root cause

## The Definitive Solution: Hybrid RLS & RPC Architecture

### Core Principle
Separate complex permission logic from simple ownership rules:
- **RPC Functions**: Handle complex, multi-table permission checks
- **RLS Policies**: Enforce simple, non-recursive rules

### Implementation

#### 1. Master Helper Function
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

This function:
- Uses `SECURITY DEFINER` to bypass RLS when checking membership
- Provides a single source of truth for participant verification
- Breaks the circular dependency chain

#### 2. Simplified RLS Policies
All policies now delegate complex checks to the helper function:

```sql
-- chat_conversations policies
CREATE POLICY "Participants can view their conversations"
ON public.chat_conversations
FOR SELECT USING (
  is_chat_participant(id, auth.uid())  -- No recursion!
);

-- chat_participants policies
CREATE POLICY "Participants can view other participants in their chats"
ON public.chat_participants
FOR SELECT USING (
  is_chat_participant(conversation_id, auth.uid())  -- No recursion!
);

-- chat_messages policies
CREATE POLICY "Participants can view messages in their conversations"
ON public.chat_messages
FOR SELECT USING (
  is_chat_participant(conversation_id, auth.uid())  -- No recursion!
);
```

#### 3. Message Sending Function
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

## Additional Issues Resolved

### Frontend Integration Bug
**Problem**: Messages weren't appearing after sending, requiring page refresh.

**Cause**: The `send_chat_message` function returned VOID, but frontend expected a message ID.

**Solution**: Modified the function to return BIGINT (the created message ID).

**Frontend code expectation**:
```typescript
const { data: messageId, error } = await supabase
  .rpc('send_chat_message', {
    p_conversation_id: conversation.id,
    p_content: message.trim()
  })

// Frontend then fetches the message using the returned ID
const { data: newMessage } = await supabase
  .from('chat_messages')
  .select('*')
  .eq('id', messageId)  // This was null when function returned VOID
  .single()
```

## Key Learnings

1. **RLS Policies Cannot Self-Reference**: Any policy that queries its own table creates recursion.

2. **SECURITY DEFINER Functions Are Essential**: They provide a controlled way to bypass RLS for complex permission checks.

3. **Separation of Concerns**: 
   - RPC functions handle "can user do X?" questions
   - RLS policies handle "does user own Y?" questions

4. **Return Types Matter**: Ensure RPC functions return expected values for frontend integration.

5. **Test with Clean Data**: Failed attempts often leave orphaned records that can mask the real issues.

## Architecture Benefits

1. **No Recursion Possible**: Helper functions break all circular dependencies
2. **Performance Optimized**: Single function call instead of complex policy chains
3. **Security Maintained**: SECURITY DEFINER with explicit search_path
4. **Simplified Frontend**: Direct Supabase calls work without fallbacks
5. **Maintainable**: Clear separation between permission logic and data access

## Testing Checklist

- [ ] 1:1 chats between connected users
- [ ] Group chats with multiple participants
- [ ] Studio enquiry chats with concierge
- [ ] Message sending appears immediately
- [ ] No recursion errors in any scenario
- [ ] Non-participants cannot access conversations

## Migration Summary

If you encounter similar RLS recursion issues:

1. **Identify Self-References**: Look for policies that query their own table
2. **Create Helper Functions**: Use SECURITY DEFINER functions for complex checks
3. **Simplify Policies**: Make RLS policies simple and delegated
4. **Test Return Types**: Ensure RPC functions return expected values
5. **Clean Test Data**: Remove failed attempts before testing

This hybrid approach is the industry-standard solution for complex permission systems in PostgreSQL/Supabase applications.