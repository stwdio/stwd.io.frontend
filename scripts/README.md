# Avatar Upload Script

This script uploads avatars for all users with @example.com email addresses in the Supabase database.

## Prerequisites

1. Get your Supabase service role key from the Supabase dashboard:
   - Go to: https://supabase.com/dashboard/project/esdkzwbmiyhwosyjybzq/settings/api
   - Copy the `service_role` key (not the `anon` key)

2. Set the environment variable:
   ```bash
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   ```

## Installation

```bash
cd scripts
npm install
```

## Usage

```bash
npm run upload-avatars
```

Or directly:

```bash
node upload-avatars.js
```

## How it works

1. Fetches all users with @example.com emails from the database
2. Reads all available avatar images from `/avatars` directory
3. For each user without an avatar:
   - Assigns an avatar cyclically from the available images
   - Uploads the avatar to Supabase Storage in the format: `{user_id}/avatar_{timestamp}.jpg`
   - Updates the user's `avatar_url` in the profiles table

## Features

- **Re-runnable**: Skips users who already have avatars
- **Error handling**: Continues processing even if individual uploads fail
- **Progress tracking**: Shows detailed progress and summary statistics
- **Rate limiting protection**: Adds small delays between uploads

## Avatar URL Format

Avatars are stored with the following URL pattern:
```
https://esdkzwbmiyhwosyjybzq.supabase.co/storage/v1/object/public/avatars/{user_id}/avatar_{timestamp}.jpg
```

This matches the existing pattern used by user @lhk.