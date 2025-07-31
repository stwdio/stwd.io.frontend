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
            // Check if there's already an enquiry conversation for this studio
            const { data: existingConversations } = await supabase
              .from('chat_participants')
              .select(`
                conversation_id,
                chat_conversations!inner(
                  id,
                  title,
                  is_group
                )
              `)
              .eq('user_id', user.id)
            
            let existingEnquiryId = null
            if (existingConversations) {
              const enquiryConversation = existingConversations.find(conv => {
                const c = conv.chat_conversations
                return c.is_group && 
                  c.title?.toLowerCase().includes('studio enquiry:') && 
                  c.title?.toLowerCase().includes(studio.name.toLowerCase())
              })
              
              if (enquiryConversation) {
                existingEnquiryId = enquiryConversation.conversation_id
                console.log(`Found existing enquiry for ${studio.name}, skipping creation`)
                continue // Skip creating a new conversation
              }
            }
            
            // Create a new conversation
            const { data: conversation, error: convError } = await supabase
              .from('chat_conversations')
              .insert({
                is_group: true,
                title: `Studio Enquiry: ${studio.name}`,
                created_by: user.id
              })
              .select()
              .single()
            
            if (convError) {
              console.error('Failed to create conversation:', convError)
              continue
            }
            
            // Verify creator was added as participant by trigger
            const { data: creatorParticipant } = await supabase
              .from('chat_participants')
              .select('*')
              .eq('conversation_id', conversation.id)
              .eq('user_id', user.id)
              .single()
            
            console.log('Creator participant check after conversation creation:', creatorParticipant)
            
            // If trigger didn't add creator, add them manually
            if (!creatorParticipant) {
              console.log('Trigger did not add creator, adding manually')
              const { error: addCreatorError } = await supabase
                .from('chat_participants')
                .insert({
                  conversation_id: conversation.id,
                  user_id: user.id
                })
              
              if (addCreatorError) {
                console.error('Failed to add creator as participant:', addCreatorError)
              }
            }
            
            // Get all studio team members
            const { data: studioMembers, error: membersError } = await supabase
              .from('studio_members')
              .select('user_id')
              .eq('studio_id', studio.id)
            
            if (membersError) {
              console.error('Failed to get studio members:', membersError)
            }
            
            // Add participants: studio team members and concierge
            // Note: creator should be automatically added by database trigger
            const participants = [
              { conversation_id: conversation.id, user_id: conciergeId } // Concierge
            ]
            
            // Add studio team members (avoiding duplicates)
            const addedUserIds = new Set([user.id, conciergeId]) // Track who's already added
            if (studioMembers) {
              studioMembers.forEach(member => {
                if (!addedUserIds.has(member.user_id)) {
                  participants.push({
                    conversation_id: conversation.id,
                    user_id: member.user_id
                  })
                  addedUserIds.add(member.user_id)
                }
              })
            }
            
            console.log('Adding participants:', participants)
            
            const { error: partError } = await supabase
              .from('chat_participants')
              .insert(participants)
            
            if (partError) {
              console.error('Failed to add participants:', partError)
              console.error('Participants details:', JSON.stringify(participants, null, 2))
              continue
            }
            
            // Double-check all participants were added
            const { data: allParticipants } = await supabase
              .from('chat_participants')
              .select('user_id')
              .eq('conversation_id', conversation.id)
            
            console.log('All participants after insert:', allParticipants)
            
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
            
            console.log('Attempting to send message with:', {
              conversation_id: conversation.id,
              sender_id: user.id,
              contentLength: messageContent.length
            })
            
            const { data: messageData, error: messageError } = await supabase
              .from('chat_messages')
              .insert({
                conversation_id: conversation.id,
                sender_id: user.id,
                content: messageContent
              })
              .select()
              .single()
            
            console.log('Message insert result:', { data: messageData, error: messageError })
            
            if (messageError) {
              console.error('Failed to send initial message:', messageError)
              console.error('Full error object:', JSON.stringify(messageError, null, 2))
              console.error('Message details:', {
                conversation_id: conversation.id,
                sender_id: user.id,
                contentLength: messageContent.length
              })
              
              // Check if user is a participant
              const { data: participantCheck } = await supabase
                .from('chat_participants')
                .select('*')
                .eq('conversation_id', conversation.id)
                .eq('user_id', user.id)
                .single()
              
              console.log('User participant check:', participantCheck)
            }
            
            // Send welcome message from concierge using RPC function
            const conciergeMessage = `
Hello ${profile.first_name || profile.username}! 👋

I'm the stwd.io Studio Concierge, and I'm here to help facilitate this enquiry with ${studio.name}.

The studio team has been notified and will respond to your enquiry soon. In the meantime, feel free to ask any questions or provide additional details about your project.

Best regards,
Studio Concierge
            `.trim()
            
            const { data: conciergeMessageId, error: conciergeMessageError } = await supabase
              .rpc('send_message_as_concierge', {
                p_conversation_id: conversation.id,
                p_content: conciergeMessage
              })
            
            if (conciergeMessageError) {
              console.error('Failed to send concierge message:', conciergeMessageError)
              console.error('Concierge message details:', {
                conversation_id: conversation.id,
                contentLength: conciergeMessage.length
              })
            }
          }
          
          // Get studio IDs before clearing basket
          const submittedStudioIds = studios.map(s => s.id)
          
          // Clear the basket after successful submission
          set({ studios: [], isOpen: false })
          
          // Notify components that inquiries were submitted
          get()._notifyInquirySubmitted(submittedStudioIds)
          
          toast.success(`Enquiries processed! Check your messages.`)
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