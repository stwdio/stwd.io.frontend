import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { ChatWithLayout } from '@/components/chat/chat-with-layout'

interface ChatPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const supabase = await createServerComponentClient()
  const params = await searchParams
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (!profile) {
    redirect('/auth/login')
  }

  // Check for studio, user, or conversation query parameters
  const studioParam = params.studio as string | undefined
  const userParam = params.user as string | undefined
  const conversationId = params.conversation as string | undefined
  
  let targetUserId: string | undefined
  let initialConversationId: number | undefined
  let studioId: string | undefined
  let studioInfo: { id: number; name: string; slug: string } | undefined
  
  // If conversation ID is provided directly, use it
  if (conversationId) {
    initialConversationId = parseInt(conversationId)
  } 
  // If studio parameter is provided, get the studio owner
  else if (studioParam) {
    // Check if studioParam is numeric (old ID format) or slug
    const isNumeric = /^\d+$/.test(studioParam)
    
    const query = supabase
      .from('studios')
      .select('id, name, slug, owner_id')
      .single()
    
    const { data: studio, error } = isNumeric 
      ? await query.eq('id', parseInt(studioParam))
      : await query.eq('slug', studioParam)
    
    if (error) {
      console.error('Error fetching studio:', error)
    } else if (studio) {
      targetUserId = studio.owner_id
      studioId = studio.id.toString()
      studioInfo = {
        id: studio.id,
        name: studio.name,
        slug: studio.slug
      }
    }
  } else if (userParam) {
    // Check if userParam is a UUID (old format) or username
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userParam)
    
    if (isUuid) {
      targetUserId = userParam
    } else {
      // Look up user by username
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', userParam)
        .single()
      
      if (targetProfile) {
        targetUserId = targetProfile.user_id
      }
    }
  }
  
  
  // We'll check for existing conversations after fetching them below

  // Fetch user's conversations with a simpler query
  const { data: userParticipations } = await supabase
    .from('chat_participants')
    .select('conversation_id')
    .eq('user_id', user.id)
  
  const conversationIds = userParticipations?.map(p => p.conversation_id) || []
  
  let conversations = []
  if (conversationIds.length > 0) {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        chat_participants!inner(
          user_id
        )
      `)
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching conversations:', error)
    }
    
    // If we have conversations, fetch the profiles for participants and latest messages
    if (data && data.length > 0) {
      // Get all unique user IDs from participants
      const allUserIds = new Set<string>()
      data.forEach(conv => {
        conv.chat_participants.forEach(p => allUserIds.add(p.user_id))
      })
      
      // Fetch all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', Array.from(allUserIds))
      
      // Fetch the latest message for each conversation
      const { data: latestMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .in('conversation_id', data.map(c => c.id))
        .order('created_at', { ascending: false })
      
      // Group messages by conversation and get the latest one
      const messagesByConversation = new Map()
      latestMessages?.forEach(msg => {
        if (!messagesByConversation.has(msg.conversation_id)) {
          messagesByConversation.set(msg.conversation_id, [])
        }
        messagesByConversation.get(msg.conversation_id).push(msg)
      })
      
      // Create a map for quick lookup
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
      
      // Attach profiles to participants and add latest message
      conversations = data.map(conv => ({
        ...conv,
        chat_participants: conv.chat_participants.map(p => ({
          ...p,
          profiles: profileMap.get(p.user_id) || null
        })),
        chat_messages: messagesByConversation.get(conv.id) || []
      }))
    } else {
      conversations = []
    }
  }
  
  // If we have a target user and no conversation ID was provided, check if we already have a conversation
  if (targetUserId && !initialConversationId && conversations.length > 0) {
    // For studio enquiries, look for a conversation with the studio title
    if (studioInfo) {
      const existingStudioConversation = conversations.find(conv => 
        conv.title === studioInfo.name && 
        conv.chat_participants.some(p => p.user_id === targetUserId)
      )
      if (existingStudioConversation) {
        initialConversationId = existingStudioConversation.id
        targetUserId = undefined // Clear target user since we found a conversation
      }
    } else {
      // For direct messages, look for a conversation with just the two users
      const existingDirectConversation = conversations.find(conv => {
        const participantIds = conv.chat_participants.map(p => p.user_id)
        return participantIds.length === 2 && 
               participantIds.includes(user.id) && 
               participantIds.includes(targetUserId) &&
               !conv.title // No title means it's a direct message
      })
      if (existingDirectConversation) {
        initialConversationId = existingDirectConversation.id
        targetUserId = undefined // Clear target user since we found a conversation
      }
    }
  }

  return (
    <ChatWithLayout 
      userId={user.id}
      profile={profile}
      initialConversations={conversations || []}
      initialSelectedConversationId={initialConversationId}
      targetUserId={targetUserId}
      studioId={studioId}
      studioInfo={studioInfo}
    />
  )
}