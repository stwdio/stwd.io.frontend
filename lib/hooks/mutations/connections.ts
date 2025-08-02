'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useSendConnectionRequest() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ receiverId, receiverName }: { receiverId: string; receiverName?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if connection already exists
      const { data: existing } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`requester_id.eq.${receiverId},receiver_id.eq.${receiverId}`)
        .single()

      if (existing) {
        throw new Error('Connection request already exists')
      }

      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return { ...data, receiverName }
    },
    onSuccess: (data) => {
      const name = data.receiverName || 'User'
      toast.success(`Connection Request Sent To ${name}`)
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['connection-status'] })
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] })
    },
    onError: (error) => {
      if (error.message.includes('already exists')) {
        toast.error('Connection Request Already Sent')
      } else {
        toast.error('Failed To Send Connection Request')
      }
    }
  })
}

export function useAcceptConnectionRequest() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ connectionId, userName }: { connectionId: string; userName?: string }) => {
      const { data, error } = await supabase
        .from('connections')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)
        .select()
        .single()

      if (error) throw error
      return { ...data, userName }
    },
    onSuccess: (data) => {
      const name = data.userName || 'User'
      toast.success(`Connected With ${name}`)
      queryClient.invalidateQueries({ queryKey: ['connection-status'] })
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
      queryClient.invalidateQueries({ queryKey: ['my-connections'] })
    },
    onError: () => {
      toast.error('Failed To Accept Connection Request')
    }
  })
}

export function useDeclineConnectionRequest() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ connectionId, userName }: { connectionId: string; userName?: string }) => {
      const { data, error } = await supabase
        .from('connections')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)
        .select()
        .single()

      if (error) throw error
      return { ...data, userName }
    },
    onSuccess: (data) => {
      const name = data.userName || 'User'
      toast.success(`Declined Connection From ${name}`)
      queryClient.invalidateQueries({ queryKey: ['connection-status'] })
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
    },
    onError: () => {
      toast.error('Failed To Decline Connection Request')
    }
  })
}

export function useCancelConnectionRequest() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ connectionId, userName }: { connectionId: string; userName?: string }) => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId)

      if (error) throw error
      return { userName }
    },
    onSuccess: (data) => {
      const name = data?.userName || 'User'
      toast.success(`Cancelled Connection Request To ${name}`)
      queryClient.invalidateQueries({ queryKey: ['connection-status'] })
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] })
    },
    onError: () => {
      toast.error('Failed To Cancel Connection Request')
    }
  })
}