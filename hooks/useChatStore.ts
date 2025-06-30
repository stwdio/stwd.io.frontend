import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface Profile {
  id: number
  first_name: string
  last_name: string
  username: string
  user_id: string
  avatar_url?: string
}

export interface Conversation {
  id: number
  inquiry_id: number
  customer_id: number
  studio_owner_id: number
  studio_id: number
  status: string
  last_message_at: string
  created_at: string
  inquiries: {
    project_type: string
    genre: string
    budget_range: string
    preferred_dates: string
    location_preference: string
    custom_message: string
  }
  studios: {
    name: string
    location: string
    hourly_rate: number
  }
  customer_profile: Profile
  studio_owner_profile: Profile
  unread_count: number
  last_message_content: string
  last_message?: {
    id: number
    content: string
    sender_id: number
    created_at: string
    message_type: string
  }
}

export interface Message {
  id: number
  content: string
  message_type: string
  quote_amount: number | null
  created_at: string
  sender_profile: Profile
  conversation_id: number
  sender_id: number
  read_at?: string | null
}

interface ChatState {
  // State
  conversations: Conversation[]
  selectedConversation: Conversation | null
  messages: Message[]
  currentProfileId: number | null
  loading: boolean
  sending: boolean
  
  // Subscription management
  activeChannels: Map<string, any>
  
  // Actions
  setConversations: (conversations: Conversation[]) => void
  setSelectedConversation: (conversation: Conversation | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setCurrentProfileId: (profileId: number | null) => void
  setLoading: (loading: boolean) => void
  setSending: (sending: boolean) => void
  
  // API Methods
  fetchCurrentProfile: () => Promise<void>
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId: number) => Promise<void>
  sendMessage: (content: string, conversationId: number) => Promise<void>
  setupRealtimeSubscription: () => () => void
  setupMessageSubscription: (conversationId: number) => () => void
  cleanupAllSubscriptions: () => void
  
  // Enhanced methods
  markConversationAsRead: (conversationId: number) => Promise<void>
  getUnreadCount: (conversationId: number) => number
  updateLastActivity: (conversationId: number) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial State
  conversations: [],
  selectedConversation: null,
  messages: [],
  currentProfileId: null,
  loading: true,
  sending: false,
  activeChannels: new Map(),

  // Setters
  setConversations: (conversations) => set({ conversations }),
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set(state => ({
    messages: [...state.messages, message]
  })),
  setCurrentProfileId: (profileId) => set({ currentProfileId: profileId }),
  setLoading: (loading) => set({ loading }),
  setSending: (sending) => set({ sending }),

  // Fetch current user profile
  fetchCurrentProfile: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        set({ loading: false })
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (profile) {
        set({ currentProfileId: profile.id })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      set({ loading: false })
    }
  },

  // Fetch conversations with enhanced unread counts
  fetchConversations: async () => {
    const { currentProfileId } = get()
    if (!currentProfileId) return

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          customer_profile:profiles!conversations_customer_id_fkey(id, first_name, last_name, username, avatar_url),
          studio_owner_profile:profiles!conversations_studio_owner_id_fkey(id, first_name, last_name, username, avatar_url),
          studios(id, name, location, hourly_rate),
          inquiries(id, project_type, genre, budget_range, preferred_dates, location_preference, custom_message)
        `)
        .or(`customer_id.eq.${currentProfileId},studio_owner_id.eq.${currentProfileId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (error) throw error

      // Process conversations to add last message info and unread counts
      const processedConversations = await Promise.all(
        (data || []).map(async (conversation) => {
          // Get the actual last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, message_type, quote_amount, sender_id, created_at')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Get unread count (messages where sender is not current user and not read)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .neq('sender_id', currentProfileId)
            .is('read_at', null)
          
          return {
            ...conversation,
            last_message_content: lastMessage?.content || '',
            last_message: lastMessage,
            unread_count: unreadCount || 0
          }
        })
      )

      set({ conversations: processedConversations })
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to load conversations')
    }
  },

  // Fetch messages for a conversation using RPC
  fetchMessages: async (conversationId: number) => {
    try {
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        conversation_id_param: conversationId
      })

      if (error) {
        console.error('Supabase RPC error:', error)
        throw error
      }
      
      // Transform the data from RPC function format to our Message interface
      const transformedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        message_type: msg.message_type,
        quote_amount: msg.quote_amount,
        created_at: msg.created_at,
        sender_id: msg.sender_profile.id,
        conversation_id: conversationId,
        sender_profile: {
          id: msg.sender_profile.id,
          first_name: msg.sender_profile.first_name,
          last_name: msg.sender_profile.last_name,
          username: msg.sender_profile.username,
          user_id: '', // Not provided by RPC
          avatar_url: msg.sender_profile.avatar_url
        },
        read_at: msg.read_at
      }))

      // Clear existing messages and set new ones
      set({ messages: transformedMessages })
      
      // Mark conversation as read using RPC
      await get().markConversationAsRead(conversationId)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
      set({ messages: [] })
    }
  },

  // Send a message using RPC function
  sendMessage: async (content: string, conversationId: number) => {
    const { sending } = get()
    if (sending) return

    set({ sending: true })
    try {
      // Use the send_message RPC function
      const { error } = await supabase.rpc('send_message', {
        conversation_id_param: conversationId,
        content_param: content.trim(),
        message_type_param: 'text',
        quote_amount_param: null,
        file_url_param: null,
        file_name_param: null,
        file_size_param: null
      })

      if (error) throw error

      // The real-time subscription will handle adding the message to the UI
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      throw error // Re-throw to handle in UI
    } finally {
      set({ sending: false })
    }
  },

  // Setup realtime subscription for conversations only
  setupRealtimeSubscription: () => {
    const { currentProfileId, activeChannels } = get()
    if (!currentProfileId) return () => {}

    // Clean up existing conversations channel
    const existingChannel = activeChannels.get('conversations')
    if (existingChannel) {
      supabase.removeChannel(existingChannel)
      activeChannels.delete('conversations')
    }

    const channelName = `user_conversations_${currentProfileId}_${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `or(customer_id.eq.${currentProfileId},studio_owner_id.eq.${currentProfileId})`
      }, () => {
        get().fetchConversations()
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        get().fetchConversations()
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Conversations subscription active')
        }
      })

    // Store the channel for cleanup
    set(state => ({
      activeChannels: new Map(state.activeChannels).set('conversations', channel)
    }))

    return () => {
      supabase.removeChannel(channel)
      get().activeChannels.delete('conversations')
    }
  },

  // Enhanced message subscription for real-time updates in specific conversation
  setupMessageSubscription: (conversationId: number) => {
    const { currentProfileId, activeChannels } = get()
    
    const channelKey = `messages_${conversationId}`
    
    // Clean up existing message channel for this conversation
    const existingChannel = activeChannels.get(channelKey)
    if (existingChannel) {
      supabase.removeChannel(existingChannel)
      activeChannels.delete(channelKey)
    }
    
    const channelName = `conversation_messages_${conversationId}_${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        const newMessage = payload.new as any
        
        // Fetch the complete message with sender profile using RPC
        const { data: messagesData, error } = await supabase.rpc('get_conversation_messages', {
          conversation_id_param: conversationId
        })

        if (!error && messagesData) {
          // Find the new message in the result
          const messageWithProfile = messagesData.find((msg: any) => msg.id === newMessage.id)
          if (messageWithProfile) {
            // Transform and add the new message to state
            const transformedMessage: Message = {
              id: messageWithProfile.id,
              content: messageWithProfile.content,
              message_type: messageWithProfile.message_type,
              quote_amount: messageWithProfile.quote_amount,
              created_at: messageWithProfile.created_at,
              sender_id: messageWithProfile.sender_profile.id,
              conversation_id: conversationId,
              sender_profile: {
                id: messageWithProfile.sender_profile.id,
                first_name: messageWithProfile.sender_profile.first_name,
                last_name: messageWithProfile.sender_profile.last_name,
                username: messageWithProfile.sender_profile.username,
                user_id: '',
                avatar_url: messageWithProfile.sender_profile.avatar_url
              },
              read_at: messageWithProfile.read_at
            }
            
            // Only add if it's not from the current user (to avoid duplicates)
            if (messageWithProfile.sender_profile.id !== currentProfileId) {
              get().addMessage(transformedMessage)
            }
            
            // Update conversation last activity
            get().updateLastActivity(conversationId)
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Message subscription active for conversation ${conversationId}`)
        }
      })

    // Store the channel for cleanup
    set(state => ({
      activeChannels: new Map(state.activeChannels).set(channelKey, channel)
    }))

    return () => {
      supabase.removeChannel(channel)
      get().activeChannels.delete(channelKey)
    }
  },

  // Clean up all active subscriptions
  cleanupAllSubscriptions: () => {
    const { activeChannels } = get()
    
    activeChannels.forEach((channel) => {
      supabase.removeChannel(channel)
    })
    
    set({ activeChannels: new Map() })
  },

  // Mark conversation as read using RPC
  markConversationAsRead: async (conversationId: number) => {
    try {
      const { error } = await supabase.rpc('mark_messages_read', {
        conversation_id_param: conversationId
      })

      if (error) throw error

      // Update local state to reset unread count
      set(state => ({
        conversations: state.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      }))
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  },

  // Get unread count for a conversation
  getUnreadCount: (conversationId: number) => {
    const conversation = get().conversations.find(c => c.id === conversationId)
    return conversation?.unread_count || 0
  },

  // Update last activity for a conversation
  updateLastActivity: (conversationId: number) => {
    set(state => {
      const conversations = [...state.conversations]
      const index = conversations.findIndex(c => c.id === conversationId)
      
      if (index > 0) {
        const [conversation] = conversations.splice(index, 1)
        conversations.unshift({
          ...conversation,
          last_message_at: new Date().toISOString()
        })
      }
      
      return { conversations }
    })
  }
}))

// Helper functions
async function getUnreadCountForConversation(conversationId: string, currentProfileId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentProfileId)
      .is('read_at', null)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

async function getLastMessage(conversationId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, content, sender_id, created_at, message_type')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('Error getting last message:', error)
    return null
  }
} 