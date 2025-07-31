import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface StudioInteractionStatus {
  studioId: number
  hasInquiry: boolean
  hasConversation: boolean
  hasEnquiry: boolean
  conversationId?: number
  enquiryConversationId?: number
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
      
      // Fetch all conversations for this user
      const { data: userConversations } = await supabase
        .from('chat_participants')
        .select(`
          conversation_id,
          chat_conversations!inner(
            id,
            title,
            is_group
          )
        `)
        .eq('user_id', userId)
      
      // For each conversation, get all participants
      const conversationParticipants: Record<number, string[]> = {}
      if (userConversations) {
        const conversationIds = userConversations.map(uc => uc.conversation_id)
        
        const { data: allParticipants } = await supabase
          .from('chat_participants')
          .select('conversation_id, user_id')
          .in('conversation_id', conversationIds)
        
        if (allParticipants) {
          allParticipants.forEach(p => {
            if (!conversationParticipants[p.conversation_id]) {
              conversationParticipants[p.conversation_id] = []
            }
            conversationParticipants[p.conversation_id].push(p.user_id)
          })
        }
      }
      
      // Match conversations to studios
      const studioConversations: Record<number, number> = {}
      const studioEnquiries: Record<number, number> = {}
      
      if (userConversations && studios) {
        userConversations.forEach(item => {
          const conv = item.chat_conversations
          const participants = conversationParticipants[conv.id] || []
          
          // Check each studio to see if this conversation matches
          studios.forEach(studio => {
            // Check if it's an enquiry conversation (group chat with specific title format)
            const isEnquiry = conv.is_group && 
              conv.title?.toLowerCase().includes('studio enquiry:') && 
              conv.title?.toLowerCase().includes(studio.name.toLowerCase())
            
            if (isEnquiry && !studioEnquiries[studio.id]) {
              studioEnquiries[studio.id] = conv.id
            }
            
            // Check if conversation title matches studio name (for direct chats)
            if (!studioConversations[studio.id]) {
              const titleMatch = conv.title?.toLowerCase() === studio.name.toLowerCase()
              
              if (titleMatch) {
                studioConversations[studio.id] = conv.id
              }
            }
          })
        })
      }

      // Build the status map
      const statusMap: Record<number, StudioInteractionStatus> = {}
      
      studioIds.forEach(studioId => {
        const hasInquiry = inquiries?.some(inq => inq.studio_id === studioId) || false
        const conversationId = studioConversations[studioId]
        const enquiryConversationId = studioEnquiries[studioId]
        
        statusMap[studioId] = {
          studioId,
          hasInquiry,
          hasConversation: !!conversationId,
          hasEnquiry: !!enquiryConversationId,
          conversationId,
          enquiryConversationId
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