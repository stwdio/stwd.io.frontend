import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Studio {
  id: number
  name: string
  description: string
  location: string
  hourly_rate: number
  price_tier?: number
  verification_status: string
  photo_urls?: string[]
}

interface InquiryData {
  project_type: string
  genre?: string
  budget_range?: string
  preferred_dates?: string
  location_preference?: string
  custom_message?: string
}

interface QuoteBasketStore {
  studios: Studio[]
  isOpen: boolean
  addStudio: (studio: Studio) => Promise<void>
  removeStudio: (studioId: number) => void
  clearBasket: () => void
  toggleBasket: () => void
  submitInquiry: (inquiryData: InquiryData) => Promise<boolean>
  isStudioInBasket: (studioId: number) => boolean
  onInquirySubmitted: (callback: (studioIds: number[]) => void) => () => void
  _notifyInquirySubmitted: (studioIds: number[]) => void
  _inquiryCallbacks: Set<(studioIds: number[]) => void>
}

export const useQuoteBasket = create<QuoteBasketStore>()(
  persist(
    (set, get) => ({
      studios: [],
      isOpen: false,
      _inquiryCallbacks: new Set(),
      
      addStudio: async (studio: Studio) => {
        const { studios } = get()
        
        // Check if studio is already in basket
        if (studios.find(s => s.id === studio.id)) {
          toast.info('Studio is already in your quote basket')
          return
        }
        
        // Only allow verified studios
        if (studio.verification_status !== 'verified') {
          toast.error('Only verified studios can be added to quote basket')
          return
        }
        
        // We no longer check for existing inquiries since we're using chat-based enquiries
        
        set({ studios: [...studios, studio] })
        toast.success(`${studio.name} added to quote basket`)
      },
      
      removeStudio: (studioId: number) => {
        const { studios } = get()
        const studio = studios.find(s => s.id === studioId)
        
        set({ studios: studios.filter(s => s.id !== studioId) })
        
        if (studio) {
          toast.success(`${studio.name} removed from quote basket`)
        }
      },
      
      clearBasket: () => {
        set({ studios: [], isOpen: false })
        toast.success('Quote basket cleared')
      },
      
      toggleBasket: () => {
        set(state => ({ isOpen: !state.isOpen }))
      },
      
      isStudioInBasket: (studioId: number) => {
        const { studios } = get()
        return studios.some(s => s.id === studioId)
      },
      
      submitInquiry: async (inquiryData: InquiryData) => {
        const { studios } = get()
        
        if (studios.length === 0) {
          toast.error('Please add at least one studio to your quote basket')
          return false
        }
        
        try {
          // Get current user's profile
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            toast.error('Please log in to submit an inquiry')
            return false
          }
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
          
          if (!profile) {
            toast.error('Profile not found')
            return false
          }
          
          // Get the studio concierge user ID
          const { data: conciergeId, error: conciergeError } = await supabase
            .rpc('get_studio_concierge_id')
          
          if (conciergeError || !conciergeId) {
            console.error('Failed to get concierge user:', conciergeError)
            toast.error('Failed to connect with Studio Concierge')
            return false
          }
          
          // For each studio, create a group chat enquiry
          for (const studio of studios) {
            // Create a new conversation with type 'enquiry'
            const { data: conversation, error: convError } = await supabase
              .from('conversations')
              .insert({
                type: 'enquiry',
                name: `Studio Enquiry: ${studio.name}`,
                created_by: user.id
              })
              .select()
              .single()
            
            if (convError) {
              console.error('Failed to create conversation:', convError)
              continue
            }
            
            // Get all studio team members
            const { data: studioMembers, error: membersError } = await supabase
              .from('studio_members')
              .select('user_id')
              .eq('studio_id', studio.id)
            
            if (membersError) {
              console.error('Failed to get studio members:', membersError)
            }
            
            // Add participants: creator, studio team members, and concierge
            const participants = [
              { conversation_id: conversation.id, user_id: user.id }, // Creator
              { conversation_id: conversation.id, user_id: conciergeId } // Concierge
            ]
            
            // Add studio team members
            if (studioMembers) {
              studioMembers.forEach(member => {
                participants.push({
                  conversation_id: conversation.id,
                  user_id: member.user_id
                })
              })
            }
            
            const { error: partError } = await supabase
              .from('conversation_participants')
              .insert(participants)
            
            if (partError) {
              console.error('Failed to add participants:', partError)
              continue
            }
            
            // Send initial message from creator with inquiry details
            const messageContent = `
🎵 **New Studio Enquiry**

**Project Type:** ${inquiryData.project_type}
${inquiryData.genre ? `**Genre:** ${inquiryData.genre}` : ''}
${inquiryData.budget_range ? `**Budget Range:** ${inquiryData.budget_range}` : ''}
${inquiryData.preferred_dates ? `**Preferred Dates:** ${inquiryData.preferred_dates}` : ''}
${inquiryData.location_preference ? `**Location Preference:** ${inquiryData.location_preference}` : ''}

${inquiryData.custom_message ? `**Message:**\n${inquiryData.custom_message}` : ''}

---
*This is an official studio enquiry facilitated by stwd.io Studio Concierge.*
            `.trim()
            
            const { error: messageError } = await supabase
              .from('messages')
              .insert({
                conversation_id: conversation.id,
                sender_id: user.id,
                content: messageContent
              })
            
            if (messageError) {
              console.error('Failed to send initial message:', messageError)
            }
            
            // Send welcome message from concierge
            const conciergeMessage = `
Hello ${profile.first_name || profile.username}! 👋

I'm the stwd.io Studio Concierge, and I'm here to help facilitate this enquiry with ${studio.name}.

The studio team has been notified and will respond to your enquiry soon. In the meantime, feel free to ask any questions or provide additional details about your project.

Best regards,
Studio Concierge
            `.trim()
            
            const { error: conciergeMessageError } = await supabase
              .from('messages')
              .insert({
                conversation_id: conversation.id,
                sender_id: conciergeId,
                content: conciergeMessage
              })
            
            if (conciergeMessageError) {
              console.error('Failed to send concierge message:', conciergeMessageError)
            }
          }
          
          // Get studio IDs before clearing basket
          const submittedStudioIds = studios.map(s => s.id)
          
          // Clear the basket after successful submission
          set({ studios: [], isOpen: false })
          
          // Notify components that inquiries were submitted
          get()._notifyInquirySubmitted(submittedStudioIds)
          
          toast.success(`Enquiry sent to ${studios.length} studio${studios.length > 1 ? 's' : ''}! Check your messages.`)
          return true
          
        } catch (error) {
          console.error('Error submitting inquiry:', error)
          toast.error('Failed to submit inquiry. Please try again.')
          return false
        }
      },
      
      onInquirySubmitted: (callback: (studioIds: number[]) => void) => {
        const { _inquiryCallbacks } = get()
        _inquiryCallbacks.add(callback)
        
        // Return cleanup function
        return () => {
          _inquiryCallbacks.delete(callback)
        }
      },
      
      _notifyInquirySubmitted: (studioIds: number[]) => {
        const { _inquiryCallbacks } = get()
        _inquiryCallbacks.forEach(callback => callback(studioIds))
      }
    }),
    {
      name: 'quote-basket-storage',
      partialize: (state) => ({ studios: state.studios }) // Only persist studios, not UI state
    }
  )
) 