import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface StudioInteractionStatus {
  studioId: number
  hasInquiry: boolean
  hasConversation: boolean
  hasEnquiry: boolean
  conversationId?: number
  conversationUuid?: string
  enquiryConversationId?: number
  enquiryConversationUuid?: string
}

export function useStudioInteractionStatuses(studioIds: number[], userId: string | null) {
  return useQuery({
    queryKey: ['studio-interaction-statuses', studioIds, userId],
    queryFn: async () => {
      if (!userId || studioIds.length === 0) {
        return {} as Record<number, StudioInteractionStatus>
      }

      const supabase = createClient()
      
      // Get user profile first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      if (!profile) return {}

      // We no longer track inquiries through the old system, only through chat enquiries
      const inquiries = null

      // Fetch all studios to get owner information
      const { data: studios } = await supabase
        .from('studios')
        .select('id, name, owner_id')
        .in('id', studioIds)
      
      // Fetch all conversations for this user using the safe RPC
      const { data: conversationsData } = await supabase
        .rpc('get_user_conversations')
      
      // Transform the RPC data to match the expected format
      const userConversations = conversationsData?.map(conv => ({
        conversation_id: conv.id,
        chat_conversations: {
          id: conv.id,
          title: conv.title,
          is_group: conv.is_group
        }
      }))
      
      // Extract participants from the RPC data
      const conversationParticipants: Record<number, string[]> = {}
      if (conversationsData) {
        conversationsData.forEach(conv => {
          conversationParticipants[conv.id] = conv.chat_participants?.map(p => p.user_id) || []
        })
      }
      
      // Match conversations to studios
      const studioConversations: Record<number, {id: number, uuid: string}> = {}
      const studioEnquiries: Record<number, {id: number, uuid: string}> = {}
      
      if (conversationsData && studios) {
        conversationsData.forEach(conv => {
          const participants = conversationParticipants[conv.id] || []
          
          // Check each studio to see if this conversation matches
          studios.forEach(studio => {
            // Check if it's an enquiry conversation (group chat with studio name as title)
            const isEnquiry = conv.is_group && 
              conv.title?.toLowerCase() === studio.name.toLowerCase()
            
            if (isEnquiry && !studioEnquiries[studio.id]) {
              studioEnquiries[studio.id] = {id: conv.id, uuid: conv.uuid}
            }
            
            // Check if conversation title matches studio name (for direct chats)
            if (!studioConversations[studio.id]) {
              const titleMatch = conv.title?.toLowerCase() === studio.name.toLowerCase()
              
              if (titleMatch) {
                studioConversations[studio.id] = {id: conv.id, uuid: conv.uuid}
              }
            }
          })
        })
      }

      // Build the status map
      const statusMap: Record<number, StudioInteractionStatus> = {}
      
      studioIds.forEach(studioId => {
        const hasInquiry = inquiries?.some(inq => inq.studio_id === studioId) || false
        const conversation = studioConversations[studioId]
        const enquiryConversation = studioEnquiries[studioId]
        
        statusMap[studioId] = {
          studioId,
          hasInquiry,
          hasConversation: !!conversation,
          hasEnquiry: !!enquiryConversation,
          conversationId: conversation?.id,
          conversationUuid: conversation?.uuid,
          enquiryConversationId: enquiryConversation?.id,
          enquiryConversationUuid: enquiryConversation?.uuid
        }
      })

      return statusMap
    },
    enabled: !!userId && studioIds.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for a single studio
export function useStudioInteractionStatus(studioId: number, userId: string | null) {
  const { data, isLoading, error } = useStudioInteractionStatuses([studioId], userId)
  
  return {
    data: data?.[studioId],
    isLoading,
    error
  }
}