'use client'

import { useQuery, useSubscription } from '@supabase-cache-helpers/postgrest-react-query'
import { createClient } from '@/lib/supabase/client'
import { CACHE_TIMES } from '@/lib/react-query/client'
import type { Database } from '@/lib/types/database'

const getSupabaseClient = () => createClient<Database>()

/**
 * Hook for fetching user's conversations
 * Used in messaging dashboard
 */
export function useUserConversations(userProfileId: number | null) {
  return useQuery(
    getSupabaseClient()
      .from('conversations')
      .select(`
        *,
        studio:studios(
          id,
          name,
          photo_urls
        ),
        customer:profiles!conversations_customer_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        ),
        studio_owner:profiles!conversations_studio_owner_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        ),
        messages(
          id,
          content,
          created_at,
          message_type,
          read_at,
          sender:profiles(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .or(`customer_id.eq.${userProfileId},studio_owner_id.eq.${userProfileId}`)
      .order('last_message_at', { ascending: false }),
    {
      ...CACHE_TIMES.messages,
      enabled: !!userProfileId,
    }
  )
}

/**
 * Hook for fetching messages in a conversation
 * Uses your optimized database function
 */
export function useConversationMessages(conversationId: number | null) {
  return useQuery(
    getSupabaseClient().rpc('get_conversation_messages', {
      conversation_id_param: conversationId!
    }),
    {
      ...CACHE_TIMES.messages,
      enabled: !!conversationId,
    }
  )
}

/**
 * Hook for real-time message updates
 * Automatically updates cache when new messages arrive
 */
export function useMessageSubscription(conversationId: number | null) {
  const { status } = useSubscription(
    getSupabaseClient(),
    `messages:conversation_id=eq.${conversationId}`,
    {
      event: '*',
      table: 'messages',
      schema: 'public',
      filter: `conversation_id=eq.${conversationId}`
    },
    ['id'],
    {
      enabled: !!conversationId,
      callback: (payload) => {
        console.log('Real-time message update:', payload)
      }
    }
  )

  return { status }
}

/**
 * Hook for conversation participant real-time updates
 * Handles typing indicators, online status, etc.
 */
export function useConversationSubscription(conversationId: number | null) {
  const { status } = useSubscription(
    getSupabaseClient(),
    `conversations:id=eq.${conversationId}`,
    {
      event: 'UPDATE',
      table: 'conversations',
      schema: 'public',
      filter: `id=eq.${conversationId}`
    },
    ['id'],
    {
      enabled: !!conversationId,
      callback: (payload) => {
        console.log('Conversation updated:', payload)
      }
    }
  )

  return { status }
}

/**
 * Hook for fetching a single conversation
 * Used for conversation detail views
 */
export function useConversation(conversationId: number | null) {
  return useQuery(
    getSupabaseClient()
      .from('conversations')
      .select(`
        *,
        studio:studios(
          id,
          name,
          description,
          location,
          photo_urls,
          hourly_rate
        ),
        customer:profiles!conversations_customer_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        ),
        studio_owner:profiles!conversations_studio_owner_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        ),
        inquiry:inquiries(
          id,
          project_type,
          genre,
          budget_range,
          preferred_dates,
          custom_message
        )
      `)
      .eq('id', conversationId!)
      .single(),
    {
      ...CACHE_TIMES.messages,
      enabled: !!conversationId,
    }
  )
}

/**
 * Hook for getting unread message count
 * Used for notification badges
 */
export function useUnreadMessageCount(userProfileId: number | null) {
  return useQuery(
    getSupabaseClient()
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .is('read_at', null)
      .neq('sender_id', userProfileId!) // Don't count own messages
      .in('conversation_id', 
        // Subquery to get user's conversation IDs
        getSupabaseClient()
          .from('conversation_participants')
          .select('conversation_id')
          .eq('profile_id', userProfileId!)
      ),
    {
      staleTime: 30 * 1000,     // 30 seconds
      gcTime: 5 * 60 * 1000,    // 5 minutes
      enabled: !!userProfileId,
    }
  )
}

/**
 * Hook for fetching inquiry recipients
 * Used to show studio responses to inquiries
 */
export function useInquiryRecipients(inquiryId: number | null) {
  return useQuery(
    getSupabaseClient()
      .from('inquiry_recipients')
      .select(`
        *,
        studio:studios(
          id,
          name,
          location,
          photo_urls,
          hourly_rate,
          verified
        )
      `)
      .eq('inquiry_id', inquiryId!)
      .order('created_at', { ascending: false }),
    {
      ...CACHE_TIMES.messages,
      enabled: !!inquiryId,
    }
  )
}

/**
 * Hook for fetching studio inquiries
 * Uses your optimized database function
 */
export function useStudioInquiries(studioIds: number[]) {
  return useQuery(
    getSupabaseClient().rpc('get_studio_inquiries', {
      studio_ids: studioIds
    }),
    {
      ...CACHE_TIMES.messages,
      enabled: studioIds.length > 0,
    }
  )
}