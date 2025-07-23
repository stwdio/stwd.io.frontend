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
  const studioId = params.studio as string | undefined
  const userId = params.user as string | undefined
  const conversationId = params.conversation as string | undefined
  
  let targetUserId: string | undefined
  let initialConversationId: number | undefined
  
  // If conversation ID is provided directly, use it
  if (conversationId) {
    initialConversationId = parseInt(conversationId)
  } 
  // If studio parameter is provided, get the studio owner
  else if (studioId) {
    const { data: studio, error } = await supabase
      .from('studios')
      .select('owner_id')
      .eq('id', parseInt(studioId))
      .single()
    
    if (error) {
      console.error('Error fetching studio:', error)
    } else if (studio) {
      targetUserId = studio.owner_id
    }
  } else if (userId) {
    targetUserId = userId
  }
  
  // If we have a target user, find or prepare a conversation
  if (targetUserId && targetUserId !== user.id) {
    // For now, skip looking for existing conversation to avoid complexity
    // This will create a new draft conversation each time
    initialConversationId = undefined
  }

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
        ),
        chat_messages(
          id,
          content,
          created_at,
          sender_id
        )
      `)
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching conversations:', error)
    }
    
    // If we have conversations, fetch the profiles for participants
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
      
      // Create a map for quick lookup
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
      
      // Attach profiles to participants
      conversations = data.map(conv => ({
        ...conv,
        chat_participants: conv.chat_participants.map(p => ({
          ...p,
          profiles: profileMap.get(p.user_id) || null
        }))
      }))
    } else {
      conversations = []
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
    />
  )
}