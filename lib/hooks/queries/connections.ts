'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useConnectionStatus(userId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['connection-status', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null
        }
        console.error('Error checking connection status:', error)
        return null
      }

      return {
        ...data,
        isRequester: data.requester_id === user.id,
        isReceiver: data.receiver_id === user.id
      }
    },
    enabled: !!userId
  })
}

export function useMyConnections() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['my-connections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get all accepted connections where user is either requester or receiver
      const { data: connections, error } = await supabase
        .from('connections')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

      if (error) {
        console.error('Error fetching connections:', error)
        return []
      }

      // Get the user IDs of connected users
      const connectedUserIds = connections.map(conn => 
        conn.requester_id === user.id ? conn.receiver_id : conn.requester_id
      )

      if (connectedUserIds.length === 0) return []

      // Fetch profile data for connected users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', connectedUserIds)

      if (profilesError) {
        console.error('Error fetching connected profiles:', profilesError)
        return []
      }

      return profiles
    }
  })
}

export function usePendingRequests() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['pending-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get pending requests where user is the receiver
      const { data: requests, error } = await supabase
        .from('connections')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching pending requests:', error)
        return []
      }
      
      // Get requester profiles
      if (requests && requests.length > 0) {
        const requesterIds = requests.map(r => r.requester_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, first_name, last_name, avatar_url')
          .in('user_id', requesterIds)
        
        // Map profiles to requests
        return requests.map(request => ({
          ...request,
          requester: profiles?.find(p => p.user_id === request.requester_id)
        }))
      }

      return requests || []
    }
  })
}

export function useSentRequests() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['sent-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get sent requests where user is the requester
      const { data: requests, error } = await supabase
        .from('connections')
        .select('*')
        .eq('requester_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching sent requests:', error)
        return []
      }

      // Get receiver profiles
      if (requests && requests.length > 0) {
        const receiverIds = requests.map(r => r.receiver_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, first_name, last_name, avatar_url')
          .in('user_id', receiverIds)
        
        // Map profiles to requests
        return requests.map(request => ({
          ...request,
          receiver: profiles?.find(p => p.user_id === request.receiver_id)
        }))
      }

      return requests || []
    }
  })
}