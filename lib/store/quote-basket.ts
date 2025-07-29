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
        
        // Check if user already has a quote for this studio
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single()
          
          if (profile) {
            const { data: existingInquiry } = await supabase
              .from('inquiry_recipients')
              .select(`
                inquiry_id,
                inquiries!inner(creator_id)
              `)
              .eq('studio_id', studio.id)
              .eq('inquiries.creator_id', profile.id)
              .limit(1)
            
            if (existingInquiry && existingInquiry.length > 0) {
              toast.error(`You already have a quote request for ${studio.name}`)
              return
            }
          }
        }
        
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
            .select('id')
            .eq('user_id', user.id)
            .single()
          
          if (!profile) {
            toast.error('Profile not found')
            return false
          }
          
          // Check for existing quotes for these studios
          const studioIds = studios.map(s => s.id)
          const { data: existingInquiries } = await supabase
            .from('inquiry_recipients')
            .select(`
              studio_id,
              inquiries!inner(creator_id)
            `)
            .in('studio_id', studioIds)
            .eq('inquiries.creator_id', profile.id)
          
          let studiosToSubmit = studios
          
          if (existingInquiries && existingInquiries.length > 0) {
            const existingStudioIds = existingInquiries.map(i => i.studio_id)
            const existingStudioNames = studios
              .filter(s => existingStudioIds.includes(s.id))
              .map(s => s.name)
              .join(', ')
            
            toast.error(`You already have pending quotes for: ${existingStudioNames}`)
            
            // Remove studios with existing quotes from the basket
            studiosToSubmit = studios.filter(s => !existingStudioIds.includes(s.id))
            
            if (studiosToSubmit.length === 0) {
              return false
            }
            
            // Update studios to only include those without existing quotes
            set({ studios: studiosToSubmit })
          }
          
          // Create the inquiry
          const { data: inquiry, error: inquiryError } = await supabase
            .from('inquiries')
            .insert({
              creator_id: profile.id,
              project_type: inquiryData.project_type,
              genre: inquiryData.genre,
              budget_range: inquiryData.budget_range,
              preferred_dates: inquiryData.preferred_dates,
              location_preference: inquiryData.location_preference,
              custom_message: inquiryData.custom_message
            })
            .select()
            .single()
          
          if (inquiryError) throw inquiryError
          
          // Create inquiry recipients for each studio
          const recipients = studiosToSubmit.map(studio => ({
            inquiry_id: inquiry.id,
            studio_id: studio.id
          }))
          
          const { error: recipientsError } = await supabase
            .from('inquiry_recipients')
            .insert(recipients)
          
          if (recipientsError) throw recipientsError
          
          // Get studio IDs before clearing basket
          const submittedStudioIds = studiosToSubmit.map(s => s.id)
          
          // Clear the basket after successful submission
          set({ studios: [], isOpen: false })
          
          // Notify components that inquiries were submitted
          get()._notifyInquirySubmitted(submittedStudioIds)
          
          toast.success(`Inquiry sent to ${studiosToSubmit.length} studio${studiosToSubmit.length > 1 ? 's' : ''}!`)
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