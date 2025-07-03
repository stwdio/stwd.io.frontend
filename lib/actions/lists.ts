'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Types for our list operations
export type List = {
  id: string
  owner_id: string
  name: string
  icon_emoji: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export type ListWithCount = List & {
  studio_count: number
}

export type CreateListData = {
  name: string
  iconEmoji: string
  isPublic: boolean
}

// Error types for better error handling
export type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
}

export type ListStudio = {
  id: number
  name: string
  description: string
  hourly_rate: number
  location: string
  average_rating?: number
  review_count?: number
  notes?: string
}

export type ListDetails = List & {
  studio_count: number
  studios: ListStudio[]
}

/**
 * Create a new list for the current user
 */
export async function createList(data: CreateListData): Promise<ActionResult<List>> {
  try {
    const supabase = await createClient()
    
    // Get current user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to create lists' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Create the list
    const { data: newList, error } = await supabase
      .from('lists')
      .insert({
        owner_id: profile.id,
        name: data.name.trim(),
        icon_emoji: data.iconEmoji,
        is_public: data.isPublic
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating list:', error)
      return { success: false, error: 'Failed to create list' }
    }

    revalidatePath('/lists')
    return { success: true, data: newList }
  } catch (error) {
    console.error('Unexpected error creating list:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * OPTIMIZED: Get list memberships for multiple studios in a single query
 * This replaces individual getStudioListMemberships calls to eliminate the N+1 query problem
 */
export async function getBatchStudioListMemberships(
  studioIds: string[]
): Promise<ActionResult<Record<string, {list_id: number, list_name: string, list_icon_emoji: string}[]>>> {
  try {
    const supabase = await createClient()
    
    // Get current user - RLS will handle authorization automatically
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Return empty result for non-authenticated users instead of error
      const emptyResult: Record<string, {list_id: number, list_name: string, list_icon_emoji: string}[]> = {}
      studioIds.forEach(id => emptyResult[id] = [])
      return { success: true, data: emptyResult }
    }

    // Get profile once
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      const emptyResult: Record<string, {list_id: number, list_name: string, list_icon_emoji: string}[]> = {}
      studioIds.forEach(id => emptyResult[id] = [])
      return { success: true, data: emptyResult }
    }

    // OPTIMIZED: Use new database function for better performance (fixed types)
    const { data, error } = await supabase.rpc('get_batch_studio_list_memberships_optimized', {
      studio_ids: studioIds.map(id => parseInt(id)),
      user_profile_id: profile.id
    })

    if (error) {
      console.error('Error fetching batch studio list memberships:', error)
      return { success: false, error: 'Failed to fetch list memberships' }
    }

    // OPTIMIZED: Process results from optimized database function
    const result: Record<string, {list_id: number, list_name: string, list_icon_emoji: string}[]> = {}
    
    // Initialize empty arrays for all studios
    studioIds.forEach(id => result[id] = [])
    
    // Populate with actual memberships (function returns flattened results)
    data?.forEach((item: any) => {
      const studioId = item.studio_id.toString()
      if (result[studioId]) {
        result[studioId].push({
          list_id: item.list_id,
          list_name: item.list_name,
          list_icon_emoji: item.list_icon_emoji
        })
      }
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Unexpected error fetching batch studio list memberships:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * OPTIMIZED: Lightweight add studio to list - removed redundant auth calls
 */
export async function addStudioToList(
  listId: string, 
  studioId: string, 
  notes?: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Call the database function directly - RLS policies handle authorization
    const { data, error } = await supabase.rpc('add_studio_to_list', {
      list_id_param: parseInt(listId),
      studio_id_param: parseInt(studioId),
      notes_param: notes || null
    })

    if (error) {
      console.error('Error adding studio to list:', error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'Failed to add studio to list' }
    }

    revalidatePath('/lists')
    revalidatePath(`/lists/${listId}`)
    revalidatePath('/browse')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error adding studio to list:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * OPTIMIZED: Lightweight remove studio from list - removed redundant auth calls
 */
export async function removeStudioFromList(
  listId: string, 
  studioId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Call the database function directly - RLS policies handle authorization  
    const { data, error } = await supabase.rpc('remove_studio_from_list', {
      list_id_param: parseInt(listId),
      studio_id_param: parseInt(studioId)
    })

    if (error) {
      console.error('Error removing studio from list:', error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'Failed to remove studio from list' }
    }

    revalidatePath('/lists')
    revalidatePath(`/lists/${listId}`)
    revalidatePath('/browse')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error removing studio from list:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get which lists contain a specific studio for the current user
 * DEPRECATED: Use getBatchStudioListMemberships for better performance
 */
export async function getStudioListMemberships(studioId: string): Promise<ActionResult<{list_id: number, list_name: string, list_icon_emoji: string}[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Call the database function
    const { data, error } = await supabase.rpc('get_studio_list_memberships', {
      studio_id_param: parseInt(studioId),
      user_profile_id: profile.id
    })

    if (error) {
      console.error('Error fetching studio list memberships:', error)
      return { success: false, error: 'Failed to fetch list memberships' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Unexpected error fetching studio list memberships:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Update an existing list
 */
export async function updateList(
  listId: string, 
  data: Partial<CreateListData>
): Promise<ActionResult<List>> {
  try {
    const supabase = await createClient()
    
    // Get current user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to update lists' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Build update object
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.iconEmoji !== undefined) updateData.icon_emoji = data.iconEmoji
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic
    updateData.updated_at = new Date().toISOString()

    // Update the list (RLS will ensure ownership)
    const { data: updatedList, error } = await supabase
      .from('lists')
      .update(updateData)
      .eq('id', parseInt(listId))
      .eq('owner_id', profile.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating list:', error)
      return { success: false, error: 'Failed to update list' }
    }

    if (!updatedList) {
      return { success: false, error: 'List not found or permission denied' }
    }

    revalidatePath('/lists')
    revalidatePath(`/lists/${listId}`)
    
    return { success: true, data: updatedList }
  } catch (error) {
    console.error('Unexpected error updating list:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get user's lists with studio counts
 */
export async function getUserLists(): Promise<ActionResult<ListWithCount[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to view lists' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Call the database function
    const { data, error } = await supabase.rpc('get_user_lists_with_counts', {
      user_profile_id: profile.id
    })

    if (error) {
      console.error('Error fetching user lists:', error)
      return { success: false, error: 'Failed to fetch lists' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Unexpected error fetching lists:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get a specific list with its studios
 */
export async function getListDetails(listId: string): Promise<ActionResult<ListDetails>> {
  try {
    const supabase = await createClient()
    
    // Get current user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to view lists' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Get the list details (RLS will ensure ownership)
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', parseInt(listId))
      .eq('owner_id', profile.id)
      .single()

    if (listError) {
      console.error('Error fetching list:', listError)
      return { success: false, error: 'List not found or permission denied' }
    }

    if (!list) {
      return { success: false, error: 'List not found' }
    }

    // Get studios in this list with their details
    const { data: listItems, error: studiosError } = await supabase
      .from('list_items')
      .select(`
        notes,
        studios (
          id,
          name,
          description,
          hourly_rate,
          location
        )
      `)
      .eq('list_id', parseInt(listId))

    if (studiosError) {
      console.error('Error fetching list studios:', studiosError)
      return { success: false, error: 'Failed to fetch studios' }
    }

    // Transform the data
    const studios: ListStudio[] = (listItems || []).map((item: any) => ({
      id: item.studios.id,
      name: item.studios.name,
      description: item.studios.description,
      hourly_rate: item.studios.hourly_rate,
      location: item.studios.location,
      average_rating: 0, // TODO: Calculate from reviews when rating system is implemented
      review_count: 0, // TODO: Calculate from reviews when rating system is implemented
      notes: item.notes
    }))

    const listDetails: ListDetails = {
      ...list,
      studio_count: studios.length,
      studios
    }

    return { success: true, data: listDetails }
  } catch (error) {
    console.error('Unexpected error fetching list details:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Add all studios from a list to quote basket (power feature)
 */
export async function addListToQuoteBasket(listId: string): Promise<ActionResult<{ added_count: number }>> {
  try {
    const supabase = await createClient()
    
    // Get current user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Call the database function
    const { data, error } = await supabase.rpc('get_list_studios_for_quote', {
      list_id_param: parseInt(listId),
      user_profile_id: profile.id
    })

    if (error) {
      console.error('Error adding list to quote basket:', error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'No new studios to add to quote basket' }
    }

    return { success: true, data: { added_count: data.length } }
  } catch (error) {
    console.error('Unexpected error adding list to quote basket:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Delete a list
 */
export async function deleteList(listId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Get current user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to delete lists' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Delete the list (RLS will ensure ownership, cascade will handle list_items)
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', parseInt(listId))
      .eq('owner_id', profile.id)

    if (error) {
      console.error('Error deleting list:', error)
      return { success: false, error: 'Failed to delete list' }
    }

    revalidatePath('/lists')
    redirect('/lists')
  } catch (error) {
    console.error('Unexpected error deleting list:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
} 