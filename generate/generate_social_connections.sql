-- Social Connections Generation Script for stwd.io
-- This script creates interconnected follow relationships between the 50 profiles
-- Creating realistic professional networks and discovery scenarios

DO $$
DECLARE
    -- User IDs for key relationships
    maya_rivers_id uuid;
    david_sterling_id uuid;
    jasmine_taylor_id uuid;
    zara_sky_id uuid;
    marcus_ar_id uuid;
    thundercats_id uuid;
    pete_morrison_id uuid;
    sarah_blackwood_id uuid;
    rick_analog_id uuid;
    james_platinum_id uuid;
    alex_neon_id uuid;
    tony_cruz_id uuid;
    luna_electric_id uuid;
    frost_id uuid;
    aaliyah_rose_id uuid;
    
    -- Studio IDs
    platinum_sound_id bigint;
    crystal_clear_id bigint;
    sunset_sound_id bigint;
    
BEGIN
    -- Get user IDs for key profiles
    SELECT user_id INTO maya_rivers_id FROM profiles WHERE username = 'maya_rivers';
    SELECT user_id INTO david_sterling_id FROM profiles WHERE username = 'david_sterling_mix';
    SELECT user_id INTO jasmine_taylor_id FROM profiles WHERE username = 'jasmine_artist_dev';
    SELECT user_id INTO zara_sky_id FROM profiles WHERE username = 'zara_sky';
    SELECT user_id INTO marcus_ar_id FROM profiles WHERE username = 'marcus_ar_atlantic';
    SELECT user_id INTO thundercats_id FROM profiles WHERE username = 'thundercats_band';
    SELECT user_id INTO pete_morrison_id FROM profiles WHERE username = 'pete_rock_mgmt';
    SELECT user_id INTO sarah_blackwood_id FROM profiles WHERE username = 'sarah_blackwood_mastering';
    SELECT user_id INTO rick_analog_id FROM profiles WHERE username = 'rick_analog';
    SELECT user_id INTO james_platinum_id FROM profiles WHERE username = 'james_platinum_sound';
    SELECT user_id INTO alex_neon_id FROM profiles WHERE username = 'neon_alex';
    SELECT user_id INTO tony_cruz_id FROM profiles WHERE username = 'tony_cruz_engineer';
    SELECT user_id INTO luna_electric_id FROM profiles WHERE username = 'luna_electric';
    SELECT user_id INTO frost_id FROM profiles WHERE username = 'frost_official';
    SELECT user_id INTO aaliyah_rose_id FROM profiles WHERE username = 'aaliyah_rose';
    
    -- Get studio IDs (assuming they exist)
    SELECT id INTO platinum_sound_id FROM studios WHERE name LIKE '%Platinum Sound%' LIMIT 1;
    SELECT id INTO crystal_clear_id FROM studios WHERE name LIKE '%Crystal Clear%' LIMIT 1;
    SELECT id INTO sunset_sound_id FROM studios WHERE name LIKE '%Sunset Sound%' LIMIT 1;
    
    -- SCENARIO 1: The Rising Artist's Team
    -- Jasmine (manager) follows Zara Sky (her client)
    IF jasmine_taylor_id IS NOT NULL AND zara_sky_id IS NOT NULL THEN
        INSERT INTO social_connections (follower_id, following_user_id) 
        VALUES (jasmine_taylor_id, zara_sky_id) ON CONFLICT DO NOTHING;
        
        -- Zara follows her manager back
        INSERT INTO social_connections (follower_id, following_user_id) 
        VALUES (zara_sky_id, jasmine_taylor_id) ON CONFLICT DO NOTHING;
    END IF;
    
    -- Marcus (A&R) is scouting Zara Sky
    IF marcus_ar_id IS NOT NULL AND zara_sky_id IS NOT NULL THEN
        INSERT INTO social_connections (follower_id, following_user_id) 
        VALUES (marcus_ar_id, zara_sky_id) ON CONFLICT DO NOTHING;
    END IF;
    
    -- SCENARIO 2: The Studio Crew
    -- Sarah (mastering engineer) owns Crystal Clear, she follows her own studio
    IF sarah_blackwood_id IS NOT NULL AND crystal_clear_id IS NOT NULL THEN
        INSERT INTO social_connections (follower_id, following_studio_id) 
        VALUES (sarah_blackwood_id, crystal_clear_id) ON CONFLICT DO NOTHING;
    END IF;
    
    -- Rick (engineer) owns Sunset Sound, follows his studio
    IF rick_analog_id IS NOT NULL AND sunset_sound_id IS NOT NULL THEN
        INSERT INTO social_connections (follower_id, following_studio_id) 
        VALUES (rick_analog_id, sunset_sound_id) ON CONFLICT DO NOTHING;
    END IF;
    
    -- James (studio owner) follows top engineers
    IF james_platinum_id IS NOT NULL THEN
        INSERT INTO social_connections (follower_id, following_user_id) 
        VALUES 
            (james_platinum_id, david_sterling_id),
            (james_platinum_id, sarah_blackwood_id),
            (james_platinum_id, rick_analog_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- SCENARIO 3: The Search for Collaboration
    -- Maya Rivers (seeking mixing engineer) is followed by David Sterling
    IF david_sterling_id IS NOT NULL AND maya_rivers_id IS NOT NULL THEN
        INSERT INTO social_connections (follower_id, following_user_id) 
        VALUES (david_sterling_id, maya_rivers_id) ON CONFLICT DO NOTHING;
    END IF;
    
    -- SCENARIO 4: Band and Management
    -- Pete Morrison manages Thundercats
    IF pete_morrison_id IS NOT NULL AND thundercats_id IS NOT NULL THEN
        INSERT INTO social_connections (follower_id, following_user_id) 
        VALUES (pete_morrison_id, thundercats_id) ON CONFLICT DO NOTHING;
        
        INSERT INTO social_connections (follower_id, following_user_id) 
        VALUES (thundercats_id, pete_morrison_id) ON CONFLICT DO NOTHING;
    END IF;
    
    -- SCENARIO 5: Electronic Music Community
    -- Electronic artists follow each other
    IF alex_neon_id IS NOT NULL AND luna_electric_id IS NOT NULL THEN
        INSERT INTO social_connections (follower_id, following_user_id) 
        VALUES 
            (alex_neon_id, luna_electric_id),
            (luna_electric_id, alex_neon_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- SCENARIO 6: Hip-Hop Network
    -- Tony Cruz (engineer) follows potential clients
    IF tony_cruz_id IS NOT NULL THEN
        INSERT INTO social_connections (follower_id, following_user_id) 
        VALUES 
            (tony_cruz_id, frost_id),
            (tony_cruz_id, aaliyah_rose_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- GENERAL CONNECTIONS: Musicians following studios they admire
    INSERT INTO social_connections (follower_id, following_studio_id)
    SELECT p.user_id, s.id
    FROM profiles p
    CROSS JOIN studios s
    WHERE p.username IN ('maya_rivers', 'neon_alex', 'thundercats_band', 'frost_official', 'zara_sky')
    AND s.id IN (SELECT id FROM studios WHERE verified = true LIMIT 5)
    ON CONFLICT DO NOTHING;
    
    -- Engineers following multiple studios for work opportunities
    INSERT INTO social_connections (follower_id, following_studio_id)
    SELECT p.user_id, s.id
    FROM profiles p
    CROSS JOIN studios s
    WHERE p.username IN ('david_sterling_mix', 'tony_cruz_engineer', 'alex_nova_engineering')
    AND s.id IN (SELECT id FROM studios WHERE hourly_rate > 200 LIMIT 3)
    ON CONFLICT DO NOTHING;
    
    -- A&Rs following promising artists
    INSERT INTO social_connections (follower_id, following_user_id)
    SELECT ar.user_id, artist.user_id
    FROM profiles ar
    CROSS JOIN profiles artist
    JOIN profile_roles pr_ar ON ar.id = pr_ar.profile_id
    JOIN roles r_ar ON pr_ar.role_id = r_ar.id AND r_ar.slug = 'ar'
    JOIN profile_roles pr_artist ON artist.id = pr_artist.profile_id
    JOIN roles r_artist ON pr_artist.role_id = r_artist.id AND r_artist.slug = 'musician'
    WHERE artist.username IN ('maya_rivers', 'luna_electric', 'aaliyah_rose', 'lily_moon_music', 'amara_roots')
    ON CONFLICT DO NOTHING;
    
    -- Musicians following other musicians for inspiration
    INSERT INTO social_connections (follower_id, following_user_id)
    VALUES
        -- Indie artists follow each other
        ((SELECT user_id FROM profiles WHERE username = 'maya_rivers'), 
         (SELECT user_id FROM profiles WHERE username = 'lily_moon_music')),
        ((SELECT user_id FROM profiles WHERE username = 'lily_moon_music'), 
         (SELECT user_id FROM profiles WHERE username = 'maya_rivers')),
        
        -- Hip-hop artists network
        ((SELECT user_id FROM profiles WHERE username = 'frost_official'), 
         (SELECT user_id FROM profiles WHERE username = 'metro_wave')),
        ((SELECT user_id FROM profiles WHERE username = 'metro_wave'), 
         (SELECT user_id FROM profiles WHERE username = 'frost_official')),
        
        -- Electronic producers connect
        ((SELECT user_id FROM profiles WHERE username = 'echo_void'), 
         (SELECT user_id FROM profiles WHERE username = 'luna_electric')),
        
        -- R&B and soul connection
        ((SELECT user_id FROM profiles WHERE username = 'aaliyah_rose'), 
         (SELECT user_id FROM profiles WHERE username = 'grace_harmony_choir')),
        
        -- World music appreciation
        ((SELECT user_id FROM profiles WHERE username = 'willow_creek_collective'), 
         (SELECT user_id FROM profiles WHERE username = 'amara_roots'))
    ON CONFLICT DO NOTHING;
    
    -- Managers following their competition and potential clients
    INSERT INTO social_connections (follower_id, following_user_id)
    SELECT m1.user_id, m2.user_id
    FROM profiles m1
    CROSS JOIN profiles m2
    JOIN profile_roles pr1 ON m1.id = pr1.profile_id
    JOIN roles r1 ON pr1.role_id = r1.id AND r1.slug = 'manager'
    JOIN profile_roles pr2 ON m2.id = pr2.profile_id
    JOIN roles r2 ON pr2.role_id = r2.id AND r2.slug = 'manager'
    WHERE m1.id != m2.id
    AND m1.username IN ('robert_sterling_mgmt', 'jasmine_artist_dev')
    ON CONFLICT DO NOTHING;
    
    -- Podcasters following studios suitable for recording
    INSERT INTO social_connections (follower_id, following_studio_id)
    SELECT p.user_id, s.id
    FROM profiles p
    JOIN profile_roles pr ON p.id = pr.profile_id
    JOIN roles r ON pr.role_id = r.id AND r.slug = 'podcaster'
    CROSS JOIN studios s
    WHERE s.description LIKE '%podcast%' OR s.description LIKE '%voice%' OR s.description LIKE '%quiet%'
    LIMIT 15
    ON CONFLICT DO NOTHING;
    
    -- Voice actors following podcast hosts for potential work
    INSERT INTO social_connections (follower_id, following_user_id)
    SELECT va.user_id, pod.user_id
    FROM profiles va
    JOIN profile_roles pr_va ON va.id = pr_va.profile_id
    JOIN roles r_va ON pr_va.role_id = r_va.id AND r_va.slug = 'voice-actor'
    CROSS JOIN profiles pod
    JOIN profile_roles pr_pod ON pod.id = pr_pod.profile_id
    JOIN roles r_pod ON pr_pod.role_id = r_pod.id AND r_pod.slug = 'podcaster'
    ON CONFLICT DO NOTHING;
    
    -- Studio owners following each other for industry insights
    INSERT INTO social_connections (follower_id, following_user_id)
    SELECT DISTINCT s1.user_id, s2.user_id
    FROM profiles s1
    JOIN profile_roles pr1 ON s1.id = pr1.profile_id
    JOIN roles r1 ON pr1.role_id = r1.id AND r1.slug = 'studio-owner'
    CROSS JOIN profiles s2
    JOIN profile_roles pr2 ON s2.id = pr2.profile_id
    JOIN roles r2 ON pr2.role_id = r2.id AND r2.slug = 'studio-owner'
    WHERE s1.id != s2.id
    LIMIT 10
    ON CONFLICT DO NOTHING;
    
END $$;

-- Create some follow counts to make profiles look more realistic
-- Add random follow relationships to create organic-looking follower counts
INSERT INTO social_connections (follower_id, following_user_id)
SELECT 
    p1.user_id as follower_id,
    p2.user_id as following_id
FROM 
    profiles p1
    CROSS JOIN profiles p2
WHERE 
    p1.user_id != p2.user_id
    AND p1.user_id IN (
        SELECT user_id 
        FROM profiles 
        ORDER BY random() 
        LIMIT 30
    )
    AND p2.user_id IN (
        SELECT user_id 
        FROM profiles 
        WHERE username IN (
            'zara_sky', 'maya_rivers', 'luna_electric', 'frost_official',
            'thundercats_band', 'aaliyah_rose', 'james_platinum_sound',
            'sarah_blackwood_mastering', 'marcus_ar_atlantic'
        )
    )
    AND random() < 0.7  -- 70% chance of following
ON CONFLICT DO NOTHING;

-- Output connection statistics
WITH stats AS (
    SELECT 
        COUNT(*) as total_connections,
        COUNT(DISTINCT follower_id) as unique_followers,
        COUNT(CASE WHEN following_user_id IS NOT NULL THEN 1 END) as user_follows,
        COUNT(CASE WHEN following_studio_id IS NOT NULL THEN 1 END) as studio_follows
    FROM social_connections
)
SELECT 
    'Social connections created successfully!' as status,
    total_connections,
    unique_followers,
    user_follows,
    studio_follows
FROM stats;