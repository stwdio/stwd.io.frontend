'use client'

import { 
  useInsertMutation, 
  useUpdateMutation, 
  useDeleteMutation,
  useUpsertMutation 
} from '@supabase-cache-helpers/postgrest-react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database, TablesInsert, TablesUpdate } from '@/lib/types/database'

const getSupabaseClient = () => createClient()

/**
 * Hook for creating a new studio
 * Automatically updates the studios cache
 */
export function useCreateStudio() {
  return useInsertMutation(
    getSupabaseClient().from('studios'),
    ['id'], // Primary key for cache updates
    null,   // No specific columns to revalidate
    {
      onSuccess: (data) => {
        console.log('Studio created successfully:', data)
      },
      onError: (error) => {
        console.error('Failed to create studio:', error)
      },
      // Automatically revalidates all studio-related queries
      revalidateTables: [
        { table: 'studios' },
        { table: 'studio_amenities' }
      ]
    }
  )
}

/**
 * Hook for updating a studio
 * Automatically updates cache for this specific studio
 */
export function useUpdateStudio() {
  return useUpdateMutation(
    getSupabaseClient().from('studios'),
    ['id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Studio updated successfully:', data)
      },
      onError: (error) => {
        console.error('Failed to update studio:', error)
      }
    }
  )
}

/**
 * Hook for deleting a studio safely
 * Uses your existing database function for safe deletion
 */
export function useDeleteStudio() {
  return useDeleteMutation(
    getSupabaseClient().from('studios'),
    ['id'],
    '*',
    {
      onSuccess: (data: any) => {
        console.log('Studio deleted successfully:', data)
      },
      onError: (error: any) => {
        console.error('Failed to delete studio:', error)
      },
      // Revalidate related tables after deletion
      revalidateTables: [
        { table: 'studios' },
        { table: 'bookings' },
        { table: 'reviews' },
        { table: 'list_items' }
      ]
    }
  )
}

/**
 * Hook for adding studios to lists
 * Uses your existing database function
 */
export function useAddStudioToList() {
  return useInsertMutation(
    getSupabaseClient().from('list_items'),
    ['list_id', 'studio_id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Studio added to list:', data)
      },
      onError: (error) => {
        console.error('Failed to add studio to list:', error)
      },
      // Update list-related caches
      revalidateTables: [
        { table: 'lists' },
        { table: 'list_items' }
      ]
    }
  )
}

/**
 * Hook for removing studios from lists
 */
export function useRemoveStudioFromList() {
  return useDeleteMutation(
    getSupabaseClient().from('list_items'),
    ['list_id', 'studio_id'],
    '*',
    {
      onSuccess: (data: any) => {
        console.log('Studio removed from list:', data)
      },
      revalidateTables: [
        { table: 'lists' },
        { table: 'list_items' }
      ]
    }
  )
}

/**
 * Hook for creating studio reviews
 * Automatically updates studio cache with new review
 */
export function useCreateReview() {
  return useInsertMutation(
    getSupabaseClient().from('reviews'),
    ['id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Review created successfully:', data)
      },
      onError: (error) => {
        console.error('Failed to create review:', error)
      },
      // Update studio and booking caches
      revalidateTables: [
        { table: 'reviews' },
        { table: 'studios' },
        { table: 'bookings' }
      ]
    }
  )
}

/**
 * Hook for updating studio amenities
 * Batch operation for managing studio amenities
 */
export function useUpdateStudioAmenities() {
  return useUpsertMutation(
    getSupabaseClient().from('studio_amenities'),
    ['studio_id', 'amenity_id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Studio amenities updated:', data)
      },
      revalidateTables: [
        { table: 'studio_amenities' },
        { table: 'studios' }
      ]
    }
  )
}

/**
 * Hook for creating pricing rules
 */
export function useCreatePricingRule() {
  return useInsertMutation(
    getSupabaseClient().from('pricing_rules'),
    ['id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Pricing rule created:', data)
      },
      revalidateTables: [
        { table: 'pricing_rules' },
        { table: 'studios' }
      ]
    }
  )
}

/**
 * Hook for updating pricing rules
 */
export function useUpdatePricingRule() {
  return useUpdateMutation(
    getSupabaseClient().from('pricing_rules'),
    ['id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Pricing rule updated:', data)
      }
    }
  )
}

/**
 * Hook for creating add-on services
 */
export function useCreateAddOnService() {
  return useInsertMutation(
    getSupabaseClient().from('add_on_services'),
    ['id'],
    null,
    {
      onSuccess: (data) => {
        console.log('Add-on service created:', data)
      },
      revalidateTables: [
        { table: 'add_on_services' },
        { table: 'studios' }
      ]
    }
  )
}

/**
 * Hook for studio claiming
 * Uses your existing database function
 */
export function useClaimStudio() {
  // Note: This will need to be implemented with a custom mutation
  // since it uses your RPC function rather than direct table operations
  // For now, returning a placeholder that can be replaced with the actual implementation
  return {
    mutate: async (data: { studio_id: number; verification_docs: any }) => {
      const client = getSupabaseClient()
      return await client.rpc('claim_studio', {
        studio_id_param: data.studio_id,
        verification_docs: data.verification_docs
      })
    }
  }
}