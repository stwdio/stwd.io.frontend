'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Types for studio operations
export type Studio = {
  id: number
  name: string
  description: string | null
  hourly_rate: number
  published: boolean
  gear: any
  location: string | null
  photo_urls: string[]
  owner_id: number
  created_at: string
  updated_at: string
}

export type CreateDraftStudioData = {
  name: string
  location: string
  description?: string
  hourly_rate?: number
}

export type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a draft studio record to enable image uploads
 * This is Step 1 of the two-step studio creation process
 */
export async function createDraftStudio(data: CreateDraftStudioData): Promise<ActionResult<Studio>> {
  try {
    const supabase = await createClient()
    
    // Get current user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to create a studio' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Check if user has permission to create studios
    if (profile.role !== 'owner' && profile.role !== 'admin') {
      return { success: false, error: 'You must be a studio owner to create studios' }
    }

    // Create draft studio with minimal required data
    const { data: newStudio, error } = await supabase
      .from('studios')
      .insert({
        owner_id: profile.id,
        name: data.name.trim(),
        location: data.location.trim(),
        description: data.description?.trim() || null,
        hourly_rate: data.hourly_rate || 50, // Default rate
        published: false, // Draft state
        photo_urls: [], // Empty array for photos
        verification_status: 'pending_new_studio_approval'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating draft studio:', error)
      return { success: false, error: 'Failed to create studio draft' }
    }

    revalidatePath('/profile/dashboard')
    return { success: true, data: newStudio }
  } catch (error) {
    console.error('Unexpected error creating draft studio:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Upload an image to Supabase Storage and add URL to studio's photo_urls
 */
export async function uploadStudioImage(
  studioId: number,
  fileName: string,
  fileBuffer: ArrayBuffer
): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient()
    
    // Get current user and verify ownership
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to upload images' }
    }

    // Verify studio ownership
    const { data: studio, error: studioError } = await supabase
      .from('studios')
      .select('id, owner_id, photo_urls, profiles!studios_owner_id_fkey(user_id)')
      .eq('id', studioId)
      .single()

    if (studioError || !studio) {
      return { success: false, error: 'Studio not found' }
    }

    // Check ownership (including admin override)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const studioOwner = Array.isArray(studio.profiles) ? studio.profiles[0] : studio.profiles
    const isOwner = studioOwner?.user_id === user.id
    const isAdmin = profile?.role === 'admin'

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'You can only upload images to your own studios' }
    }

    // Check photo limit (max 10 images)
    if (studio.photo_urls && studio.photo_urls.length >= 10) {
      return { success: false, error: 'Maximum 10 images allowed per studio' }
    }

    // Generate unique file path: studios/{studio_id}/{timestamp}_{filename}
    const timestamp = Date.now()
    const filePath = `studios/${studioId}/${timestamp}_${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('studio-photos')
      .upload(filePath, fileBuffer, {
        contentType: 'image/webp',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return { success: false, error: 'Failed to upload image' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('studio-photos')
      .getPublicUrl(filePath)

    // Add URL to studio's photo_urls array
    const updatedPhotoUrls = [...(studio.photo_urls || []), publicUrl]

    const { error: updateError } = await supabase
      .from('studios')
      .update({ photo_urls: updatedPhotoUrls })
      .eq('id', studioId)

    if (updateError) {
      console.error('Error updating studio photo_urls:', updateError)
      
      // Clean up uploaded file if database update fails
      await supabase.storage
        .from('studio-photos')
        .remove([filePath])
      
      return { success: false, error: 'Failed to save image reference' }
    }

    revalidatePath(`/dashboard/studios/${studioId}/edit`)
    revalidatePath('/profile/dashboard')
    revalidatePath('/browse')
    
    return { success: true, data: publicUrl }
  } catch (error) {
    console.error('Unexpected error uploading studio image:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Delete an image from Supabase Storage and remove URL from studio's photo_urls
 */
export async function deleteStudioImage(
  studioId: number,
  imageUrl: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Get current user and verify ownership
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to delete images' }
    }

    // Verify studio ownership and get current photo_urls
    const { data: studio, error: studioError } = await supabase
      .from('studios')
      .select('id, owner_id, photo_urls, profiles!studios_owner_id_fkey(user_id)')
      .eq('id', studioId)
      .single()

    if (studioError || !studio) {
      return { success: false, error: 'Studio not found' }
    }

    // Check ownership (including admin override)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const studioOwner = Array.isArray(studio.profiles) ? studio.profiles[0] : studio.profiles
    const isOwner = studioOwner?.user_id === user.id
    const isAdmin = profile?.role === 'admin'

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'You can only delete images from your own studios' }
    }

    // Check if URL exists in photo_urls
    if (!studio.photo_urls || !studio.photo_urls.includes(imageUrl)) {
      return { success: false, error: 'Image not found in studio photos' }
    }

    // Extract file path from URL for storage deletion
    // URL format: https://{project}.supabase.co/storage/v1/object/public/studio-photos/{filePath}
    const urlParts = imageUrl.split('/studio-photos/')
    if (urlParts.length !== 2) {
      return { success: false, error: 'Invalid image URL format' }
    }
    const filePath = urlParts[1]

    // Remove URL from photo_urls array
    const updatedPhotoUrls = studio.photo_urls.filter((url: string) => url !== imageUrl)

    const { error: updateError } = await supabase
      .from('studios')
      .update({ photo_urls: updatedPhotoUrls })
      .eq('id', studioId)

    if (updateError) {
      console.error('Error updating studio photo_urls:', updateError)
      return { success: false, error: 'Failed to update studio photos' }
    }

    // Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from('studio-photos')
      .remove([filePath])

    if (deleteError) {
      console.error('Error deleting image from storage:', deleteError)
      // Note: We don't return error here since database was already updated
      // The cleanup job will handle orphaned storage files
    }

    revalidatePath(`/dashboard/studios/${studioId}/edit`)
    revalidatePath('/profile/dashboard')
    revalidatePath('/browse')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting studio image:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get studio details including photos for editing
 */
export async function getStudioForEdit(studioId: number): Promise<ActionResult<Studio>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in' }
    }

    // Get studio with ownership verification
    const { data: studio, error } = await supabase
      .from('studios')
      .select(`
        id,
        name,
        description,
        hourly_rate,
        published,
        gear,
        location,
        photo_urls,
        owner_id,
        created_at,
        updated_at,
        profiles!studios_owner_id_fkey(user_id, role)
      `)
      .eq('id', studioId)
      .single()

    if (error || !studio) {
      return { success: false, error: 'Studio not found' }
    }

    // Check ownership (including admin override)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const studioOwner = Array.isArray(studio.profiles) ? studio.profiles[0] : studio.profiles
    const isOwner = studioOwner?.user_id === user.id
    const isAdmin = profile?.role === 'admin'

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'You can only edit your own studios' }
    }

    return { success: true, data: studio }
  } catch (error) {
    console.error('Unexpected error getting studio for edit:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
} 