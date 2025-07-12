'use client'

import { useInsertMutation, useUpdateMutation } from '@supabase-cache-helpers/postgrest-react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database, TablesInsert } from '@/lib/types/database'

const getSupabaseClient = () => createClient<Database>()

/**
 * Hook for sending messages
 * Uses your existing database function for enhanced functionality
 */
export function useSendMessage() {
  // Custom hook since we're using the RPC function
  return {
    mutate: async (data: {
      conversation_id: number
      content: string
      message_type?: string
      quote_amount?: number
      file_url?: string
      file_name?: string
      file_size?: number
    }) => {
      const client = getSupabaseClient()
      
      try {
        const { data: result, error } = await client.rpc('send_message', {
          conversation_id_param: data.conversation_id,
          content_param: data.content,
          message_type_param: data.message_type || 'text',
          quote_amount_param: data.quote_amount,
          file_url_param: data.file_url,
          file_name_param: data.file_name,
          file_size_param: data.file_size
        })

        if (error) throw error
        
        console.log('Message sent successfully:', result)
        return result
      } catch (error) {
        console.error('Failed to send message:', error)
        throw error
      }
    }
  }
}

/**
 * Hook for marking messages as read
 * Uses your existing database function
 */
export function useMarkMessagesRead() {
  return {
    mutate: async (conversationId: number) => {
      const client = getSupabaseClient()
      
      try {
        const { error } = await client.rpc('mark_messages_read', {
          conversation_id_param: conversationId
        })

        if (error) throw error
        
        console.log('Messages marked as read')
      } catch (error) {
        console.error('Failed to mark messages as read:', error)
        throw error
      }
    }
  }
}

/**
 * Hook for creating conversations from inquiries
 * Uses your existing database function
 */
export function useCreateConversationFromInquiry() {
  return {
    mutate: async (data: {
      inquiry_id: number
      studio_id: number
      initial_message?: string
    }) => {
      const client = getSupabaseClient()
      
      try {
        const { data: conversationId, error } = await client.rpc('create_conversation_from_inquiry', {
          inquiry_id_param: data.inquiry_id,
          studio_id_param: data.studio_id,
          initial_message: data.initial_message
        })

        if (error) throw error
        
        console.log('Conversation created from inquiry:', conversationId)
        return conversationId
      } catch (error) {
        console.error('Failed to create conversation from inquiry:', error)
        throw error
      }
    }
  }
}

/**
 * Hook for creating direct conversations
 * For direct studio contact
 */
export function useCreateConversation() {
  return useInsertMutation(
    getSupabaseClient().from('conversations'),
    ['id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Conversation created:', data)
      },
      onError: (error) => {
        console.error('Failed to create conversation:', error)
      },
      revalidateTables: [
        { table: 'conversations' },
        { table: 'conversation_participants' }
      ]
    }
  )
}

/**
 * Hook for updating conversation status
 * (active, archived, closed)
 */
export function useUpdateConversation() {
  return useUpdateMutation(
    getSupabaseClient().from('conversations'),
    ['id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Conversation updated:', data)
      },
      onError: (error) => {
        console.error('Failed to update conversation:', error)
      }
    }
  )
}

/**
 * Hook for creating inquiries
 */
export function useCreateInquiry() {
  return useInsertMutation(
    getSupabaseClient().from('inquiries'),
    ['id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Inquiry created:', data)
      },
      onError: (error) => {
        console.error('Failed to create inquiry:', error)
      },
      revalidateTables: [
        { table: 'inquiries' },
        { table: 'inquiry_recipients' }
      ]
    }
  )
}

/**
 * Hook for responding to inquiries
 * Uses your existing database function
 */
export function useRespondToInquiry() {
  return {
    mutate: async (data: {
      inquiry_id: number
      studio_id: number
      response_message: string
      quote_amount?: number
    }) => {
      const client = getSupabaseClient()
      
      try {
        const { data: conversationId, error } = await client.rpc('handle_inquiry_response', {
          inquiry_id_param: data.inquiry_id,
          studio_id_param: data.studio_id,
          response_message_param: data.response_message,
          quote_amount_param: data.quote_amount
        })

        if (error) throw error
        
        console.log('Inquiry response created, conversation ID:', conversationId)
        return conversationId
      } catch (error) {
        console.error('Failed to respond to inquiry:', error)
        throw error
      }
    }
  }
}

/**
 * Hook for updating inquiry recipient status
 */
export function useUpdateInquiryRecipient() {
  return useUpdateMutation(
    getSupabaseClient().from('inquiry_recipients'),
    ['inquiry_id', 'studio_id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Inquiry recipient updated:', data)
      },
      revalidateTables: [
        { table: 'inquiry_recipients' },
        { table: 'inquiries' }
      ]
    }
  )
}

/**
 * Hook for updating notification read status
 */
export function useMarkNotificationRead() {
  return useUpdateMutation(
    getSupabaseClient().from('notifications'),
    ['id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Notification marked as read:', data)
      }
    }
  )
}

/**
 * Hook for bulk marking notifications as read
 */
export function useMarkAllNotificationsRead() {
  return {
    mutate: async (userProfileId: number) => {
      const client = getSupabaseClient()
      
      try {
        const { error } = await client
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userProfileId)
          .eq('is_read', false)

        if (error) throw error
        
        console.log('All notifications marked as read')
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error)
        throw error
      }
    }
  }
}