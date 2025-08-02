#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase configuration
const SUPABASE_URL = 'https://esdkzwbmiyhwosyjybzq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZGt6d2JtaXlod29zeWp5YnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NjUwMDUsImV4cCI6MjA2NzU0MTAwNX0.Wl-c2xSI3cZj5-ShPomgUiYa195BaGLB8y9t8opYPrY'

// You'll need to get the service role key from Supabase dashboard
// Set it as an environment variable: SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.error('Get it from: https://supabase.com/dashboard/project/esdkzwbmiyhwosyjybzq/settings/api')
  process.exit(1)
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Paths
const AVATARS_DIR = path.join(__dirname, '..', 'avatars')
const BUCKET_NAME = 'avatars'

async function getExampleComUsers() {
  console.log('Fetching users with @example.com emails...')
  
  const userIds = [
    '31fffefa-bbf5-4c01-8a08-b58df77774e1',
    'e63f7837-b06e-4d0f-990b-b43f5774d053',
    '75216229-b632-412a-9b4d-07a9d43cb5a8',
    '90981483-5474-4cb1-a8fc-95579de3f962',
    '16942694-c244-4135-ad73-135fe8e1c92f',
    '2df6eeda-730f-4beb-bc7f-65b52bef4984',
    'a6725670-1330-494d-96b6-5654672192eb',
    '6cdd1a3d-1ca5-49eb-b071-496dddfcb0d3',
    '7519fdcc-4034-4caf-bc57-81661a7691d9',
    'fca8e881-d411-44a8-8b60-99090125f32d',
    '1eb6274d-488f-4f7d-ac74-9ee56fe28c6f',
    'c0df75b6-c28c-45a1-8a31-050afd5aec44',
    '87b02bb1-2376-441c-b4e3-1fa7be252450',
    'e9e01efc-e39f-4206-94d3-c0deae56c1a3',
    'ea2fe2a5-70fa-4f42-aee2-5c69ffc4005b',
    'b3b90c3e-eddc-48a2-8273-488425668330',
    '388b329b-895a-467f-ad7e-7da69aa9ff64',
    'd1f99a44-22d1-454a-95fa-a16e7c4aa89f',
    '4a1b3148-e494-4141-b86c-ef505f4dca8c',
    'bdb8a2b2-313c-4695-b893-68b5a5e0d030',
    '2cc11aa2-82af-43d6-bd0d-bd9477a48411',
    '5725ebf9-db75-41b2-9370-1339d2802691',
    'd1e22198-ae93-48f2-bc0d-a8a5d18ab011',
    '92ca2f9c-ef3f-45f4-ba49-85dddd8468eb',
    '1ea6aac5-64d8-42cb-be12-eaeca0c4be6b',
    '36201fb3-d6da-4516-b753-8c3cf9972c1b',
    '91b5934a-9984-4b9e-a227-afba0409c648',
    'c3e95951-74a9-4ac0-8333-cbc446144af2',
    '26af1d79-3c02-422e-abdb-80a20bfcbfec',
    '879b7286-a3e4-4501-9d02-46a42ada16d7',
    '7238dc77-6a1d-42f7-8fde-1b35b2aba3e1',
    '83cb1734-c9de-4fa1-a8c8-473cdf507307',
    'df899f86-e774-415b-aa9a-1ccee73041b7',
    '193ea139-d6db-4f2f-b989-32fe391beb36',
    'bb79c003-6b13-4e49-a426-739474e26fc1',
    '8b0b8039-33e0-4109-beba-00eb88144599',
    'ae5e91cc-ac61-41e3-a441-65650d4ea196',
    'b00f6214-4848-4681-9514-5e24deeddb21',
    '3754aa9a-861c-4686-8978-0aa33f9bca03',
    'a2e374a0-825f-4160-bcda-46c5b76f06e8',
    '4fc30ebc-8f42-435e-9fe3-a2bcabc8b6e8',
    '9419c692-da34-4d08-baa5-b32645a10370',
    '1a1c049c-dbd5-437e-95cd-4a153782c4d0',
    '3ec3e3de-6166-40c2-ad34-afdf2a672851',
    'dccfbf6a-62f3-4c25-8494-7366bee466bb',
    'fe8a9928-d9ca-4209-afe5-c1d28c932529',
    '8fb19623-709e-4d13-8426-ac55a0bdaa47',
    'f5f45610-25e1-49a4-9021-92c9e4d969f6',
    '88a17676-33a0-48a9-b46a-9afd1e0ba4b2',
    '225a4c42-3f5f-48b5-b7db-2e2de20ad1f1'
  ]

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, user_id, avatar_url, first_name, last_name')
    .in('user_id', userIds)

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return users || []
}

async function getAvailableAvatars() {
  console.log('Reading available avatars...')
  const files = await fs.readdir(AVATARS_DIR)
  return files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
}

async function uploadAvatar(userId, avatarFile) {
  const filePath = path.join(AVATARS_DIR, avatarFile)
  const fileBuffer = await fs.readFile(filePath)
  const timestamp = Date.now()
  const fileName = `avatar_${timestamp}.jpg`
  const storagePath = `${userId}/${fileName}`

  console.log(`Uploading avatar for user ${userId}: ${avatarFile} -> ${storagePath}`)

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    })

  if (error) {
    console.error(`Error uploading avatar for ${userId}:`, error)
    return null
  }

  // Construct the public URL
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`
  return publicUrl
}

async function updateUserAvatar(userId, avatarUrl) {
  console.log(`Updating avatar URL for user ${userId}`)
  
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('user_id', userId)

  if (error) {
    console.error(`Error updating avatar for user ${userId}:`, error)
    return false
  }

  return true
}

async function main() {
  try {
    console.log('Starting avatar upload process...\n')

    // Get users and avatars
    const users = await getExampleComUsers()
    const avatars = await getAvailableAvatars()

    console.log(`Found ${users.length} users with @example.com emails`)
    console.log(`Found ${avatars.length} available avatars\n`)

    if (users.length === 0) {
      console.log('No users found to update')
      return
    }

    if (avatars.length === 0) {
      console.log('No avatars found in avatars directory')
      return
    }

    // Process each user
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      
      // Skip if user already has an avatar (unless it's a ui-avatars.com URL)
      if (user.avatar_url && !user.avatar_url.startsWith('https://ui-avatars.com')) {
        console.log(`Skipping user ${user.user_id} - already has avatar`)
        skipCount++
        continue
      }

      // Log if replacing ui-avatars.com URL
      if (user.avatar_url && user.avatar_url.startsWith('https://ui-avatars.com')) {
        console.log(`Replacing ui-avatars.com URL for user ${user.user_id}`)
      }

      // Assign avatar cyclically
      const avatarIndex = i % avatars.length
      const avatarFile = avatars[avatarIndex]

      // Upload avatar
      const avatarUrl = await uploadAvatar(user.user_id, avatarFile)
      
      if (avatarUrl) {
        // Update database
        const updated = await updateUserAvatar(user.user_id, avatarUrl)
        
        if (updated) {
          console.log(`✓ Successfully set avatar for user ${user.user_id}`)
          successCount++
        } else {
          errorCount++
        }
      } else {
        errorCount++
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n=== Summary ===')
    console.log(`Total users processed: ${users.length}`)
    console.log(`Successful updates: ${successCount}`)
    console.log(`Skipped (already have avatar): ${skipCount}`)
    console.log(`Errors: ${errorCount}`)
    
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()