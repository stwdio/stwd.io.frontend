import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface StudioInteractionStatus {
  studioId: number
  hasInquiry: boolean
  hasConversation: boolean
  conversationId?: number
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

      // Fetch all inquiries for these studios in one query
      const { data: inquiries } = await supabase
        .from('inquiry_recipients')
        .select(`
          studio_id,
          inquiry_id,
          inquiries!inner(creator_id)
        `)
        .in('studio_id', studioIds)
        .eq('inquiries.creator_id', profile.id)

      // Fetch all conversations for this user
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id, studio_id')
        .in('studio_id', studioIds)
        .eq('customer_id', profile.id)

      // Build the status map
      const statusMap: Record<number, StudioInteractionStatus> = {}
      
      studioIds.forEach(studioId => {
        const hasInquiry = inquiries?.some(inq => inq.studio_id === studioId) || false
        const conversation = conversations?.find(conv => conv.studio_id === studioId)
        
        statusMap[studioId] = {
          studioId,
          hasInquiry,
          hasConversation: !!conversation,
          conversationId: conversation?.id
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