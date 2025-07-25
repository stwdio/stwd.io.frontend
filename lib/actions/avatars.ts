'use server'

import { revalidatePath } from 'next/cache'
import { createServerActionClient } from '@/lib/supabase/server'

export type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Upload a new avatar image for the current user
 */
export async function uploadAvatar(file: File): Promise<ActionResult<string>> {
  try {
    const supabase = await createServerActionClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to upload an avatar' }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.' }
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 5MB' }
    }

    // Get current profile to check for existing avatar
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .single()

    // Delete existing avatar if present
    if (profile?.avatar_url) {
      // Extract the file path from the URL
      const urlParts = profile.avatar_url.split('/storage/v1/object/public/avatars/')
      if (urlParts.length > 1) {
        const oldFilePath = urlParts[1]
        await supabase.storage
          .from('avatars')
          .remove([oldFilePath])
      }
    }

    // Generate filename with timestamp to avoid conflicts
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${user.id}/avatar_${Date.now()}.${fileExtension}`

    // Upload new avatar
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true // Overwrite if exists
      })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return { success: false, error: 'Failed to upload avatar' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      
      // Clean up uploaded file if database update fails
      await supabase.storage
        .from('avatars')
        .remove([fileName])
      
      return { success: false, error: 'Failed to update profile' }
    }

    // Revalidate paths where avatar is displayed
    revalidatePath('/settings/profile')
    revalidatePath('/profiles')
    revalidatePath('/')
    
    return { success: true, data: publicUrl }
  } catch (error) {
    console.error('Unexpected error uploading avatar:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Delete the current user's avatar
 */
export async function deleteAvatar(): Promise<ActionResult<void>> {
  try {
    const supabase = await createServerActionClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to delete your avatar' }
    }

    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .single()

    if (!profile?.avatar_url) {
      return { success: false, error: 'No avatar to delete' }
    }

    // Extract the file path from the URL
    const urlParts = profile.avatar_url.split('/storage/v1/object/public/avatars/')
    if (urlParts.length > 1) {
      const filePath = urlParts[1]
      
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (deleteError) {
        console.error('Error deleting avatar from storage:', deleteError)
        // Continue anyway to clear the URL from the database
      }
    }

    // Clear avatar URL from profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return { success: false, error: 'Failed to update profile' }
    }

    // Revalidate paths
    revalidatePath('/settings/profile')
    revalidatePath('/profiles')
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting avatar:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}