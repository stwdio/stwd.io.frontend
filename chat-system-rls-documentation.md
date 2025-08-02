# stwd.io Chat System RLS Documentation

## Executive Summary

This document provides comprehensive documentation of the stwd.io chat system for AI analysis to resolve persistent Row Level Security (RLS) recursion issues. The platform implements a sophisticated multi-type chat system with complex participant management that has encountered recurring "infinite recursion detected in policy" errors.

## Platform Overview

### Business Context
- **Platform**: stwd.io - Professional network for musicians and recording studios
- **Core Function**: Connects creators (musicians, podcasters, bands) with professional recording studios
- **Architecture**: Next.js 15 frontend with Supabase backend (PostgreSQL + RLS)

### Technology Stack
- **Frontend**: Next.js 15 App Router, TypeScript, React 19
- **Backend**: Supabase (PostgreSQL with Row Level Security)
- **Database**: PostgreSQL with PostGIS extension
- **Real-time**: Supabase Realtime subscriptions
- **Authentication**: Supabase Auth with SSR

## Database Schema

### Chat Tables Structure

```sql
-- Main conversation table
chat_conversations (
    id BIGINT PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_group BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    title TEXT -- Used for studio enquiry names
)

-- Participants junction table
chat_participants (
    conversation_id BIGINT REFERENCES chat_conversations(id),
    user_id UUID NOT NULL,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (user_id) REFERENCES profiles(user_id)
)

-- Messages table
chat_messages (
    id BIGINT PRIMARY KEY,
    conversation_id BIGINT REFERENCES chat_conversations(id),
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
)
```

### Related Tables

```sql
-- User profiles
profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT UNIQUE,
    display_name TEXT,
    role TEXT, -- 'creator' or 'owner'
    system_role TEXT, -- 'admin', 'owner', null
    professional_role TEXT -- Various professional roles
)

-- Studio team members
studio_members (
    id BIGINT PRIMARY KEY,
    studio_id BIGINT REFERENCES studios(id),
    user_id UUID REFERENCES profiles(user_id),
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT now()
)

-- User connections (for gated 1:1 chat)
connections (
    id BIGINT PRIMARY KEY,
    requester_id UUID REFERENCES profiles(user_id),
    requestee_id UUID REFERENCES profiles(user_id),
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMPTZ DEFAULT now()
)
```

## Chat Types and Requirements

### 1. One-to-One (1:1) Chat

**Purpose**: Direct messaging between two connected users

**Creation Requirements**:
- Users must have an accepted connection (via `connections` table)
- Either user can initiate the conversation
- Automatically creates conversation with `is_group: false`

**Participants**:
- Exactly 2 participants: conversation creator and target user
- Both added to `chat_participants` table
- Database trigger automatically adds creator as participant

**Access Control**:
- Both participants can view all messages
- Both participants can send messages
- Only participants can access the conversation

**User Story**:
```
As a musician (creator role),
I want to message a producer I'm connected with,
So that we can discuss potential collaboration privately.
```

### 2. Group Chat

**Purpose**: Multi-person conversations for collaboration

**Creation Requirements**:
- Any authenticated user can create a group chat
- Creator selects 2-5 other users from their connections
- Creates conversation with `is_group: true`

**Participants**:
- 2-6 total participants (including creator)
- Creator automatically added as participant
- Selected users added to `chat_participants`
- All participants have equal permissions

**Access Control**:
- All participants can view all messages
- All participants can send messages
- Only participants can access the conversation

**User Story**:
```
As a band leader,
I want to create a group chat with my bandmates and our producer,
So that we can coordinate our recording session together.
```

### 3. Studio Enquiry Chat

**Purpose**: Formal studio booking enquiries with concierge facilitation

**Creation Requirements**:
- User adds studios to "quote basket"
- Submits enquiry with project details
- System creates separate group chat for each studio
- Conversation title set to studio name

**Participants**:
- **Enquirer**: The user who submitted the enquiry (creator)
- **Studio Team**: All members of the studio (from `studio_members` table)
- **Concierge**: System user that facilitates enquiries (username: 'studio_concierge')

**Special Behavior**:
- Initial message contains formatted enquiry details
- Concierge automatically sends welcome message
- All studio team members can respond
- Prevents duplicate enquiries to same studio

**Access Control**:
- All participants can view all messages
- All participants can send messages (except concierge uses special RPC)
- Only participants can access the conversation

**User Story**:
```
As a podcaster looking for a recording studio,
I want to send enquiries to multiple studios with my project details,
So that studio teams can respond with availability and pricing,
With the platform concierge helping facilitate the conversation.
```

## Current RLS Policies

### chat_conversations Policies

```sql
-- SELECT: View created or participated conversations
((created_by = auth.uid()) OR (EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.conversation_id = chat_conversations.id 
    AND chat_participants.user_id = auth.uid()
)))

-- INSERT: Authenticated users can create conversations
(auth.uid() IS NOT NULL)

-- UPDATE: Update conversations you participate in
(id IN (
    SELECT conversation_id FROM chat_participants
    WHERE user_id = auth.uid()
))
```

### chat_messages Policies

```sql
-- SELECT: View messages in conversations
(EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.conversation_id = chat_messages.conversation_id 
    AND chat_participants.user_id = auth.uid()
))

-- INSERT: Send messages to your conversations
((sender_id = auth.uid()) AND (EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.conversation_id = chat_messages.conversation_id 
    AND chat_participants.user_id = auth.uid()
)))

-- DELETE: Delete own messages
(sender_id = auth.uid())
```

### chat_participants Policies

```sql
-- SELECT: View participants in your conversations (DUPLICATE POLICIES)
-- Policy 1: Uses custom function
is_user_participant(auth.uid(), conversation_id)

-- Policy 2: Uses EXISTS check
(EXISTS (
    SELECT 1 FROM chat_participants cp2
    WHERE cp2.conversation_id = chat_participants.conversation_id 
    AND cp2.user_id = auth.uid()
    LIMIT 1
))

-- INSERT: Add participants (DUPLICATE POLICIES)
-- Both policies have similar logic for adding participants
((user_id = auth.uid()) OR (EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = chat_participants.conversation_id 
    AND c.created_by = auth.uid()
)))

-- DELETE: Remove yourself from conversations (DUPLICATE POLICIES)
(user_id = auth.uid())

-- UPDATE: Update self
(user_id = auth.uid())
```

## The RLS Recursion Problem

### Error Description
```
Error: infinite recursion detected in policy for relation "chat_participants"
Code: 42P17
```

### When It Occurs
1. When creating a new conversation and adding participants
2. When sending the first message to a new conversation
3. Intermittently when checking participant status

### Root Cause Analysis

The recursion occurs due to circular dependencies in RLS policies:

1. **chat_messages INSERT policy** checks if user is participant:
   - Queries `chat_participants` to verify user participation
   
2. **chat_participants SELECT policy** checks if user can view participants:
   - References `chat_participants` again to verify user is in conversation
   
3. **Circular Reference Created**:
   - To insert message → must check participants
   - To check participants → must select from participants
   - To select participants → must verify user is participant
   - Creates infinite loop

### Current Workarounds

1. **RPC Functions** (Partially Implemented):
   ```sql
   -- create_chat_conversation: Creates conversation with SECURITY DEFINER
   -- send_chat_message: Sends messages with SECURITY DEFINER
   ```

2. **Frontend Fallbacks**:
   - Try RPC function first
   - Fall back to direct insert if RPC fails
   - Catch recursion errors and display helpful messages

3. **Database Triggers**:
   - Automatically add creator as participant on conversation creation
   - Reduces need for manual participant insertion

### Why Workarounds Are Insufficient

1. **Inconsistent Behavior**: Sometimes works, sometimes fails
2. **Performance Impact**: Multiple retry attempts slow down chat
3. **User Experience**: Users see errors when trying to message
4. **Maintenance Burden**: Complex fallback logic throughout codebase

## Frontend Implementation

### Key Components

```typescript
// ChatHub: Main chat interface
components/chat/chat-hub.tsx
- Manages conversation list and active conversation
- Handles real-time subscriptions
- Coordinates between mobile/desktop views

// MessageThread: Individual conversation view  
components/chat/message-thread.tsx
- Displays messages with sender info
- Handles message sending with RPC fallback
- Real-time message updates

// DraftMessageThread: New conversation creation
components/chat/draft-message-thread.tsx
- Creates conversation on first message
- Implements RPC fallback pattern
- Shows recursion error with migration script

// GroupChatBasket: Group chat creation
lib/store/group-chat-basket.ts
- Manages selected users for group chat
- Persists selection in localStorage
- Limits to 5 additional participants

// QuoteBasket: Studio enquiry system
lib/store/quote-basket.ts
- Manages studio selection
- Creates enquiry chats with concierge
- Formats initial enquiry message
```

### Message Sending Flow

```typescript
// Typical send message implementation
const sendMessage = async (content: string) => {
  try {
    // Try RPC function first (avoids RLS recursion)
    const { error: rpcError } = await supabase
      .rpc('send_chat_message', {
        p_conversation_id: conversationId,
        p_content: content
      })
    
    if (rpcError) {
      // Fallback to direct insert
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: content
        })
      
      if (error?.code === '42P17') {
        // Handle recursion error
        console.error('RLS Recursion Error')
      }
    }
  } catch (error) {
    // Error handling
  }
}
```

## Security Requirements

### Authentication
- All chat operations require authenticated user
- User ID from `auth.uid()` used throughout
- No manual user ID passing to prevent spoofing

### Authorization Rules
1. **Conversation Access**: Only participants can view conversations
2. **Message Access**: Only participants can view messages
3. **Message Sending**: Only participants can send messages
4. **Participant Viewing**: Only participants can see who's in conversation
5. **Conversation Creation**: Any authenticated user can create
6. **Participant Addition**: Only creator can add initial participants

### Data Isolation
- Users cannot see conversations they're not part of
- No data leakage between conversations
- Participant list hidden from non-participants

## Performance Considerations

### Current Issues
1. **Multiple Queries**: Checking participation requires multiple DB calls
2. **Policy Evaluation**: Complex policies slow down operations
3. **Fallback Overhead**: RPC fallback pattern adds latency

### Optimization Needs
1. Simplify policy chains to reduce recursion risk
2. Minimize cross-table policy dependencies
3. Optimize participant checking logic
4. Consider materialized views for participant status

## Business Impact

### User Experience Issues
- Users encounter errors when trying to send messages
- Inconsistent behavior confuses users
- Delays in message sending frustrate users

### Platform Growth Impact
- Chat is core feature for professional networking
- Errors damage platform credibility
- Prevents smooth studio enquiry process

### Technical Debt
- Complex workarounds throughout codebase
- Difficult to maintain and debug
- Blocks new chat features

## Summary

The stwd.io chat system implements three distinct chat types (1:1, group, enquiry) with sophisticated participant management. However, RLS policies create circular dependencies causing "infinite recursion" errors. Current workarounds using RPC functions and fallbacks provide partial relief but don't solve the core issue. A comprehensive RLS policy redesign is needed to eliminate recursion while maintaining security requirements.