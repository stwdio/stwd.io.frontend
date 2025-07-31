import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { ChatHub } from '@/components/chat/chat-hub'
import { Suspense } from 'react'
import { ChatHubSkeleton } from '@/components/chat/chat-hub-skeleton'

interface ChatPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined }
}

async function ChatPageContent({ searchParams }: ChatPageProps) {
  // Handle both async and sync searchParams
  const params = searchParams ? (searchParams instanceof Promise ? await searchParams : searchParams) : {}
  console.log('Raw search params:', params)
  const targetUsername = params?.user as string | undefined
  const conversationId = params?.conversation as string | undefined
  const studioId = params?.studio as string | undefined
  console.log('Chat page loaded with target username:', targetUsername, 'conversation:', conversationId, 'studio:', studioId)
  
  const supabase = await createServerComponentClient()
  
  // User is already validated in parent
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()
    
  if (!profile) {
    redirect('/auth/login')
  }

  // If username is provided, get the target user's ID
  let targetUserId: string | undefined
  let selectedConversationId: number | undefined
  let isConnected = false
  
  // If studio is provided, check for existing enquiry conversation
  if (studioId) {
    console.log('Looking up studio enquiry for:', studioId)
    
    // First get the studio details
    const { data: studioData } = await supabase
      .from('studios')
      .select('id, name, owner_id')
      .eq('slug', studioId)
      .single()
    
    if (studioData) {
      // Check if there's already a group enquiry conversation for this studio
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
      
      if (existingConversations) {
        // Look for an enquiry conversation with this studio
        const enquiryConversation = existingConversations.find(conv => {
          const c = conv.chat_conversations
          return c.is_group && 
            c.title?.toLowerCase().includes('studio enquiry:') && 
            c.title?.toLowerCase().includes(studioData.name.toLowerCase())
        })
        
        if (enquiryConversation) {
          // Redirect to existing enquiry conversation
          console.log('Found existing enquiry conversation:', enquiryConversation.conversation_id)
          selectedConversationId = enquiryConversation.conversation_id
        } else {
          // Create a new enquiry conversation
          console.log('Creating new studio enquiry conversation')
          
          // Get concierge user ID
          const { data: conciergeId } = await supabase.rpc('get_studio_concierge_id')
          
          if (conciergeId) {
            // Create group conversation
            const { data: newConversation } = await supabase
              .from('chat_conversations')
              .insert({
                is_group: true,
                title: `Studio Enquiry: ${studioData.name}`,
                created_by: user.id
              })
              .select()
              .single()
            
            if (newConversation) {
              // Get studio team members
              const { data: studioMembers } = await supabase
                .from('studio_members')
                .select('user_id')
                .eq('studio_id', studioData.id)
              
              // Add participants (creator is added automatically by trigger)
              const participants = [
                { conversation_id: newConversation.id, user_id: conciergeId }
              ]
              
              // Add studio team members
              const addedUserIds = new Set([user.id, conciergeId])
              if (studioMembers) {
                studioMembers.forEach(member => {
                  if (!addedUserIds.has(member.user_id)) {
                    participants.push({
                      conversation_id: newConversation.id,
                      user_id: member.user_id
                    })
                    addedUserIds.add(member.user_id)
                  }
                })
              }
              
              await supabase
                .from('chat_participants')
                .insert(participants)
              
              // Send welcome message from concierge
              const conciergeMessage = `Hello! 👋

I'm the stwd.io Studio Concierge, and I'm here to help facilitate your enquiry with ${studioData.name}.

Feel free to ask any questions about the studio, discuss your project needs, or share any specific requirements you have.

The studio team has been notified and will respond soon.

Best regards,
Studio Concierge`
              
              await supabase
                .from('chat_messages')
                .insert({
                  conversation_id: newConversation.id,
                  sender_id: conciergeId,
                  content: conciergeMessage
                })
              
              selectedConversationId = newConversation.id
            }
          }
        }
      }
    }
  } else if (targetUsername) {
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('username', targetUsername)
      .single()
    
    console.log('Target profile lookup result:', targetProfile)
    console.log('Target profile lookup error:', profileError)
    targetUserId = targetProfile?.user_id
    
    // Check if users are connected
    if (targetUserId) {
      console.log('Checking connection between:', user.id, 'and', targetUserId)
      const { data: connection, error: connError } = await supabase
        .from('connections')
        .select('status')
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .maybeSingle()
      
      console.log('Connection check result:', connection)
      console.log('Connection check error:', connError)
      isConnected = !!connection
    }
    
    // Check if there's an existing conversation with this user (only if connected)
    if (targetUserId && isConnected) {
      // Find conversations where both users are participants
      const { data: myConversations } = await supabase
        .from('chat_participants')
        .select('conversation_id')
        .eq('user_id', user.id)
      
      if (myConversations && myConversations.length > 0) {
        const conversationIds = myConversations.map(c => c.conversation_id)
        
        // Check which of these conversations also has the target user
        const { data: targetConversations } = await supabase
          .from('chat_participants')
          .select('conversation_id')
          .eq('user_id', targetUserId)
          .in('conversation_id', conversationIds)
        
        if (targetConversations && targetConversations.length > 0) {
          // For 1-on-1 chats, find the conversation with exactly 2 participants
          for (const conv of targetConversations) {
            const { count } = await supabase
              .from('chat_participants')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.conversation_id)
            
            if (count === 2) {
              selectedConversationId = conv.conversation_id
              console.log('Found existing conversation:', conv.conversation_id)
              break
            }
          }
        }
      }
    }
  }

  // Fetch initial conversations with participants and last message
  // First get all conversation IDs where the user is a participant
  const { data: userConversations, error: participantsError } = await supabase
    .from('chat_participants')
    .select('conversation_id')
    .eq('user_id', user.id)
  
  console.log('Fetching conversations for user:', user.id)
  console.log('User conversations query result:', userConversations)
  console.log('User conversations error:', participantsError)
  
  const conversationIds = userConversations?.map(uc => uc.conversation_id) || []
  console.log('User conversations:', conversationIds)
  
  // Then fetch those conversations with all participants and messages
  let conversations = []
  if (conversationIds.length > 0) {
    const { data, error: convsError } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        chat_participants (
          user_id,
          conversation_id
        ),
        chat_messages (
          id,
          content,
          created_at,
          sender_id
        )
      `)
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })
    
    console.log('Conversations query result:', data)
    console.log('Conversations query error:', convsError)
    
    if (data) {
      // Now fetch profiles for all participants
      const allParticipantIds = new Set<string>()
      data.forEach(conv => {
        conv.chat_participants?.forEach((p: any) => allParticipantIds.add(p.user_id))
      })
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', Array.from(allParticipantIds))
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
      
      // Map profiles to participants
      conversations = data.map(conv => ({
        ...conv,
        chat_participants: conv.chat_participants?.map((p: any) => ({
          ...p,
          profiles: profileMap.get(p.user_id) || null
        })) || []
      }))
    }
  } else {
    console.log('No conversation IDs found, skipping conversation fetch')
  }
  
  console.log('Found conversations:', conversations.length)
  console.log('Selected conversation ID:', selectedConversationId)
  console.log('Target user ID:', targetUserId)
  console.log('Is connected:', isConnected)

  // If conversation ID is provided, use it
  if (conversationId) {
    selectedConversationId = parseInt(conversationId)
  }
  
  // Don't redirect server-side - let the client handle it to show skeleton
  const shouldRedirectToFirstConversation = !targetUsername && !conversationId && !studioId && conversations.length > 0

  return (
    <ChatHub 
      userId={user.id}
      profile={profile}
      initialConversations={conversations || []}
      targetUserId={isConnected && !selectedConversationId ? targetUserId : undefined}
      initialSelectedConversationId={selectedConversationId}
      shouldRedirectToFirst={shouldRedirectToFirstConversation}
      studioId={studioId}
    />
  )
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  // Do minimal auth check here
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Show skeleton immediately while heavy data loads
  return (
    <Suspense fallback={<ChatHubSkeleton />}>
      <ChatPageContent searchParams={searchParams} />
    </Suspense>
  )
}