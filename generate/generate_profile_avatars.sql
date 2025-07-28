-- Profile Avatar Generation Script for stwd.io
-- This script updates all profiles with realistic avatar URLs
-- Using UI Avatars service for consistent, professional-looking avatars

UPDATE profiles
SET avatar_url = CONCAT(
    'https://ui-avatars.com/api/?',
    'name=', REPLACE(CONCAT(COALESCE(first_name, ''), '+', COALESCE(last_name, '')), ' ', '+'),
    '&size=400',
    '&background=', 
    CASE 
        -- Different background colors based on role
        WHEN EXISTS (
            SELECT 1 FROM profile_roles pr 
            JOIN roles r ON pr.role_id = r.id 
            WHERE pr.profile_id = profiles.id AND r.slug = 'musician'
        ) THEN '6366f1'  -- Indigo for musicians
        WHEN EXISTS (
            SELECT 1 FROM profile_roles pr 
            JOIN roles r ON pr.role_id = r.id 
            WHERE pr.profile_id = profiles.id AND r.slug = 'engineer'
        ) THEN '10b981'  -- Emerald for engineers
        WHEN EXISTS (
            SELECT 1 FROM profile_roles pr 
            JOIN roles r ON pr.role_id = r.id 
            WHERE pr.profile_id = profiles.id AND r.slug = 'podcaster'
        ) THEN 'f59e0b'  -- Amber for podcasters
        WHEN EXISTS (
            SELECT 1 FROM profile_roles pr 
            JOIN roles r ON pr.role_id = r.id 
            WHERE pr.profile_id = profiles.id AND r.slug = 'voice-actor'
        ) THEN '8b5cf6'  -- Violet for voice actors
        WHEN EXISTS (
            SELECT 1 FROM profile_roles pr 
            JOIN roles r ON pr.role_id = r.id 
            WHERE pr.profile_id = profiles.id AND r.slug = 'ar'
        ) THEN 'ef4444'  -- Red for A&Rs
        WHEN EXISTS (
            SELECT 1 FROM profile_roles pr 
            JOIN roles r ON pr.role_id = r.id 
            WHERE pr.profile_id = profiles.id AND r.slug = 'manager'
        ) THEN '3b82f6'  -- Blue for managers
        WHEN EXISTS (
            SELECT 1 FROM profile_roles pr 
            JOIN roles r ON pr.role_id = r.id 
            WHERE pr.profile_id = profiles.id AND r.slug = 'studio-owner'
        ) THEN '14b8a6'  -- Teal for studio owners
        ELSE '6b7280'  -- Gray default
    END,
    '&color=ffffff',
    '&bold=true',
    '&format=svg'
)
WHERE avatar_url IS NULL OR avatar_url = '';

-- For some key profiles, let's use more distinctive avatars
UPDATE profiles
SET avatar_url = CASE username
    -- Featured artists with custom gradient backgrounds
    WHEN 'zara_sky' THEN 'https://ui-avatars.com/api/?name=Zara+Sky&size=400&background=ec4899&color=ffffff&bold=true'
    WHEN 'maya_rivers' THEN 'https://ui-avatars.com/api/?name=Maya+Rivers&size=400&background=0891b2&color=ffffff&bold=true'
    WHEN 'frost_official' THEN 'https://ui-avatars.com/api/?name=Jayden+Frost&size=400&background=1f2937&color=ffffff&bold=true'
    WHEN 'luna_electric' THEN 'https://ui-avatars.com/api/?name=Luna+Martinez&size=400&background=7c3aed&color=ffffff&bold=true'
    WHEN 'thundercats_band' THEN 'https://ui-avatars.com/api/?name=Jake+Thunder&size=400&background=dc2626&color=ffffff&bold=true'
    
    -- Premium studio owners with gold backgrounds
    WHEN 'james_platinum_sound' THEN 'https://ui-avatars.com/api/?name=James+Cooper&size=400&background=facc15&color=1f2937&bold=true'
    WHEN 'rick_analog' THEN 'https://ui-avatars.com/api/?name=Rick+Thompson&size=400&background=f59e0b&color=1f2937&bold=true'
    
    -- Top engineers with metallic backgrounds
    WHEN 'david_sterling_mix' THEN 'https://ui-avatars.com/api/?name=David+Sterling&size=400&background=64748b&color=ffffff&bold=true'
    WHEN 'sarah_blackwood_mastering' THEN 'https://ui-avatars.com/api/?name=Sarah+Blackwood&size=400&background=71717a&color=ffffff&bold=true'
    
    ELSE avatar_url
END
WHERE username IN (
    'zara_sky', 'maya_rivers', 'frost_official', 'luna_electric', 'thundercats_band',
    'james_platinum_sound', 'rick_analog', 'david_sterling_mix', 'sarah_blackwood_mastering'
);

-- Output avatar update statistics
WITH avatar_stats AS (
    SELECT 
        COUNT(*) as total_profiles,
        COUNT(avatar_url) as profiles_with_avatars,
        COUNT(DISTINCT 
            CASE 
                WHEN avatar_url LIKE '%background=6366f1%' THEN 'musician'
                WHEN avatar_url LIKE '%background=10b981%' THEN 'engineer'
                WHEN avatar_url LIKE '%background=f59e0b%' THEN 'podcaster'
                WHEN avatar_url LIKE '%background=8b5cf6%' THEN 'voice-actor'
                WHEN avatar_url LIKE '%background=ef4444%' THEN 'ar'
                WHEN avatar_url LIKE '%background=3b82f6%' THEN 'manager'
                WHEN avatar_url LIKE '%background=14b8a6%' THEN 'studio-owner'
                ELSE 'other'
            END
        ) as unique_avatar_types
    FROM profiles
)
SELECT 
    'Profile avatars generated successfully!' as status,
    total_profiles,
    profiles_with_avatars,
    unique_avatar_types
FROM avatar_stats;