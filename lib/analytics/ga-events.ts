'use client'

import { sendGAEvent } from '@next/third-parties/google'

export const trackEvent = {
  // User Authentication Events
  login: (method: 'google' | 'email') => {
    sendGAEvent({ event: 'login', value: method })
  },
  signup: (method: 'google' | 'email') => {
    sendGAEvent({ event: 'sign_up', value: method })
  },
  logout: () => {
    sendGAEvent({ event: 'logout' })
  },

  // Profile Events
  profileView: (username: string) => {
    sendGAEvent({ event: 'profile_view', value: username })
  },
  profileEdit: () => {
    sendGAEvent({ event: 'profile_edit' })
  },

  // Studio Events
  studioView: (studioSlug: string) => {
    sendGAEvent({ event: 'studio_view', value: studioSlug })
  },
  studioEnquiry: (studioSlug: string) => {
    sendGAEvent({ event: 'studio_enquiry', value: studioSlug })
  },
  studioSearch: (filters: Record<string, any>) => {
    sendGAEvent({ 
      event: 'studio_search', 
      value: JSON.stringify(filters) 
    })
  },

  // Connection Events
  connectionRequest: (toUsername: string) => {
    sendGAEvent({ event: 'connection_request_sent', value: toUsername })
  },
  connectionAccept: (fromUsername: string) => {
    sendGAEvent({ event: 'connection_request_accepted', value: fromUsername })
  },
  connectionDecline: (fromUsername: string) => {
    sendGAEvent({ event: 'connection_request_declined', value: fromUsername })
  },

  // Chat Events
  messageStart: (conversationType: 'direct' | 'group' | 'enquiry') => {
    sendGAEvent({ event: 'chat_started', value: conversationType })
  },
  messageSent: (conversationType: 'direct' | 'group' | 'enquiry') => {
    sendGAEvent({ event: 'message_sent', value: conversationType })
  },

  // Discovery Events
  filterApply: (filterType: string, filterValue: string) => {
    sendGAEvent({ 
      event: 'filter_applied', 
      value: `${filterType}:${filterValue}` 
    })
  },
  searchPerformed: (searchQuery: string) => {
    sendGAEvent({ event: 'search_performed', value: searchQuery })
  },

  // Onboarding Events
  onboardingStart: () => {
    sendGAEvent({ event: 'onboarding_started' })
  },
  onboardingComplete: (userRole: string) => {
    sendGAEvent({ event: 'onboarding_completed', value: userRole })
  },
  roleSelected: (role: string) => {
    sendGAEvent({ event: 'role_selected', value: role })
  }
}