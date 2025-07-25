-- User Generation Script with Rich Profiles for stwd.io
-- Creates 25 users for each of 6 roles (150 total users) with complete profile data
-- Roles: Musician, Podcaster, Voice Actor, A&R, Engineer, Manager

-- First, let's create the users in auth.users and profiles
DO $$
DECLARE
    new_user_id uuid;
    role_record RECORD;
    user_counter INTEGER;
    first_names TEXT[] := ARRAY['James', 'Sarah', 'Michael', 'Emma', 'David', 'Jessica', 'Ryan', 'Ashley', 'John', 'Amanda', 
                                'Christopher', 'Emily', 'Matthew', 'Taylor', 'Joshua', 'Madison', 'Daniel', 'Hannah', 'Andrew', 'Samantha',
                                'Joseph', 'Alexis', 'Nicholas', 'Rachel', 'Tyler', 'Olivia', 'Brandon', 'Megan', 'Jacob', 'Lauren',
                                'Ethan', 'Victoria', 'Alexander', 'Alyssa', 'Noah', 'Jasmine', 'Mason', 'Brittany', 'William', 'Danielle',
                                'Anthony', 'Rebecca', 'Steven', 'Melissa', 'Mark', 'Michelle', 'Kevin', 'Jennifer', 'Brian', 'Elizabeth'];
    last_names TEXT[] := ARRAY['Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez',
                               'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez',
                               'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall', 'Young',
                               'Allen', 'Sanchez', 'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill',
                               'Ramirez', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker'];
    cities TEXT[] := ARRAY['Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 
                          'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver',
                          'Boston', 'Nashville', 'Portland', 'Las Vegas', 'Detroit', 'Memphis', 'Baltimore', 'Milwaukee', 'Atlanta'];
    
    -- Musician-specific data
    musician_skills TEXT[] := ARRAY['Guitar', 'Piano', 'Drums', 'Bass', 'Vocals', 'Saxophone', 'Violin', 'Trumpet', 'Cello', 'Flute',
                                   'Synthesizer', 'Keyboard', 'Harmonica', 'Accordion', 'Mandolin', 'Banjo', 'Ukulele', 'DJ', 'Beatmaking', 'Music Production'];
    genres TEXT[] := ARRAY['Rock', 'Pop', 'Jazz', 'Blues', 'Country', 'Hip Hop', 'R&B', 'Electronic', 'Classical', 'Folk', 
                          'Metal', 'Indie', 'Alternative', 'Reggae', 'Soul', 'Funk', 'Latin', 'World', 'Experimental', 'Ambient'];
    
    -- Podcaster-specific data
    podcast_topics TEXT[] := ARRAY['Technology', 'Business', 'Comedy', 'News & Politics', 'Sports', 'Health & Fitness', 'Education',
                                  'Arts', 'Society & Culture', 'Science', 'History', 'True Crime', 'Music', 'TV & Film', 'Fiction'];
    podcast_skills TEXT[] := ARRAY['Interviewing', 'Audio Editing', 'Storytelling', 'Research', 'Content Writing', 'Social Media Marketing',
                                  'Sound Design', 'Public Speaking', 'Journalism', 'Comedy Writing'];
    
    -- Voice Actor-specific data
    voice_styles TEXT[] := ARRAY['Commercial', 'Narration', 'Character', 'Animation', 'Video Game', 'Audiobook', 'Documentary',
                                'E-Learning', 'IVR', 'Promo', 'Trailer', 'Corporate', 'Medical', 'Technical', 'Dramatic'];
    voice_skills TEXT[] := ARRAY['Voice Acting', 'Accent Work', 'Character Voices', 'Impersonation', 'Singing', 'Voice Over',
                                'Audio Production', 'Script Reading', 'Vocal Control', 'Breath Control'];
    
    -- A&R-specific data
    ar_skills TEXT[] := ARRAY['Talent Scouting', 'Artist Development', 'Contract Negotiation', 'Music Industry Knowledge', 'Networking',
                             'Project Management', 'Marketing Strategy', 'A&R Administration', 'Music Production', 'Business Development'];
    record_labels TEXT[] := ARRAY['Universal Music', 'Sony Music', 'Warner Music', 'Atlantic Records', 'Capitol Records', 'Columbia Records',
                                 'RCA Records', 'Interscope', 'Def Jam', 'Republic Records', 'Island Records', 'Epic Records'];
    
    -- Engineer-specific data
    engineer_skills TEXT[] := ARRAY['Pro Tools', 'Logic Pro', 'Ableton Live', 'Mixing', 'Mastering', 'Recording', 'Sound Design',
                                   'Audio Restoration', 'Live Sound', 'Acoustics', 'Signal Processing', 'Microphone Techniques',
                                   'Studio Maintenance', 'Analog Equipment', 'Digital Audio'];
    engineer_certs TEXT[] := ARRAY['Pro Tools Certified', 'Apple Certified Pro', 'AES Member', 'Grammy Recording Academy Member'];
    
    -- Manager-specific data
    manager_skills TEXT[] := ARRAY['Artist Management', 'Tour Management', 'Business Management', 'Marketing', 'Branding', 'Negotiation',
                                  'Financial Planning', 'Strategic Planning', 'Public Relations', 'Social Media Strategy'];
    manager_experience TEXT[] := ARRAY['5+ years managing emerging artists', '10+ years in music industry', 'Former label executive',
                                      'Tour management experience', 'International artist management', 'Multi-platinum artist experience'];
    
    current_email_index INTEGER := 1;
    
BEGIN
    -- Loop through each role (excluding studio-owner which has ID 7)
    FOR role_record IN 
        SELECT id, name, slug FROM roles 
        WHERE slug IN ('musician', 'podcaster', 'voice-actor', 'a-and-r', 'engineer', 'manager')
        ORDER BY id
    LOOP
        -- Create 25 users for each role
        FOR user_counter IN 1..25 LOOP
            -- Generate unique email
            new_user_id := gen_random_uuid();
            
            -- Create auth user (using raw SQL since we can't directly insert into auth.users)
            -- In production, this would be done through Supabase Auth API
            -- For this script, we'll just create profiles with user_ids
            
            -- Insert into profiles
            INSERT INTO profiles (
                user_id,
                system_role,
                first_name,
                last_name,
                username,
                bio,
                avatar_url,
                website,
                skills,
                social_links,
                portfolio_links,
                created_at,
                updated_at
            ) VALUES (
                new_user_id,
                'user', -- All are regular users, not admins
                first_names[1 + (current_email_index % array_length(first_names, 1))],
                last_names[1 + (current_email_index % array_length(last_names, 1))],
                lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || 
                    '_' || lower(last_names[1 + (current_email_index % array_length(last_names, 1))]) || 
                    '_' || current_email_index,
                CASE role_record.slug
                    WHEN 'musician' THEN 
                        'Professional ' || genres[1 + (current_email_index % array_length(genres, 1))] || 
                        ' musician with ' || (5 + (current_email_index % 20)) || 
                        ' years of experience. Specializing in ' || 
                        musician_skills[1 + (current_email_index % array_length(musician_skills, 1))] || 
                        ' and ' || musician_skills[1 + ((current_email_index + 3) % array_length(musician_skills, 1))] || 
                        '. Looking for professional studios to record my next album. Have performed at major venues and festivals.'
                    WHEN 'podcaster' THEN 
                        'Host of popular ' || podcast_topics[1 + (current_email_index % array_length(podcast_topics, 1))] || 
                        ' podcast with ' || (1000 + (current_email_index * 100)) || '+ downloads per episode. ' ||
                        (3 + (current_email_index % 5)) || ' years of podcasting experience. Expert in ' ||
                        podcast_skills[1 + (current_email_index % array_length(podcast_skills, 1))] || 
                        '. Seeking professional recording spaces for high-quality audio production.'
                    WHEN 'voice-actor' THEN 
                        'Professional voice actor specializing in ' || 
                        voice_styles[1 + (current_email_index % array_length(voice_styles, 1))] || 
                        ' and ' || voice_styles[1 + ((current_email_index + 2) % array_length(voice_styles, 1))] || 
                        '. ' || (5 + (current_email_index % 15)) || ' years in the industry. ' ||
                        'Skills include ' || voice_skills[1 + (current_email_index % array_length(voice_skills, 1))] || 
                        ' and ' || voice_skills[1 + ((current_email_index + 1) % array_length(voice_skills, 1))] || 
                        '. Home studio available but seeking professional spaces for high-end projects.'
                    WHEN 'a-and-r' THEN 
                        'A&R Representative at ' || record_labels[1 + (current_email_index % array_length(record_labels, 1))] || 
                        ' with ' || (3 + (current_email_index % 12)) || ' years of experience. ' ||
                        'Discovered and developed ' || (5 + (current_email_index % 20)) || ' successful artists. ' ||
                        'Expertise in ' || ar_skills[1 + (current_email_index % array_length(ar_skills, 1))] || 
                        ' and ' || ar_skills[1 + ((current_email_index + 2) % array_length(ar_skills, 1))] || 
                        '. Always scouting for new talent and professional recording environments.'
                    WHEN 'engineer' THEN 
                        'Audio Engineer with ' || (5 + (current_email_index % 20)) || ' years of experience. ' ||
                        engineer_certs[1 + (current_email_index % array_length(engineer_certs, 1))] || '. ' ||
                        'Specializing in ' || engineer_skills[1 + (current_email_index % array_length(engineer_skills, 1))] || 
                        ', ' || engineer_skills[1 + ((current_email_index + 1) % array_length(engineer_skills, 1))] || 
                        ', and ' || engineer_skills[1 + ((current_email_index + 2) % array_length(engineer_skills, 1))] || 
                        '. Worked on ' || (20 + (current_email_index * 5)) || '+ professional projects across various genres.'
                    WHEN 'manager' THEN 
                        'Artist Manager with ' || manager_experience[1 + (current_email_index % array_length(manager_experience, 1))] || 
                        '. Currently managing ' || (2 + (current_email_index % 8)) || ' artists. ' ||
                        'Expertise in ' || manager_skills[1 + (current_email_index % array_length(manager_skills, 1))] || 
                        ', ' || manager_skills[1 + ((current_email_index + 1) % array_length(manager_skills, 1))] || 
                        ', and ' || manager_skills[1 + ((current_email_index + 2) % array_length(manager_skills, 1))] || 
                        '. Seeking quality studios for client recording sessions and projects.'
                END,
                'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new_user_id::text,
                CASE role_record.slug
                    WHEN 'musician' THEN 'https://www.' || lower(replace(first_names[1 + (current_email_index % array_length(first_names, 1))], ' ', '')) || 'music.com'
                    WHEN 'podcaster' THEN 'https://www.' || lower(replace(podcast_topics[1 + (current_email_index % array_length(podcast_topics, 1))], ' ', '')) || 'podcast.com'
                    WHEN 'voice-actor' THEN 'https://www.' || lower(replace(first_names[1 + (current_email_index % array_length(first_names, 1))], ' ', '')) || 'voice.com'
                    WHEN 'a-and-r' THEN 'https://www.' || lower(replace(record_labels[1 + (current_email_index % array_length(record_labels, 1))], ' ', '')) || '.com/ar'
                    WHEN 'engineer' THEN 'https://www.' || lower(replace(first_names[1 + (current_email_index % array_length(first_names, 1))], ' ', '')) || 'audio.com'
                    WHEN 'manager' THEN 'https://www.' || lower(replace(first_names[1 + (current_email_index % array_length(first_names, 1))], ' ', '')) || 'management.com'
                END,
                CASE role_record.slug
                    WHEN 'musician' THEN 
                        ARRAY[
                            musician_skills[1 + (current_email_index % array_length(musician_skills, 1))],
                            musician_skills[1 + ((current_email_index + 3) % array_length(musician_skills, 1))],
                            musician_skills[1 + ((current_email_index + 5) % array_length(musician_skills, 1))],
                            genres[1 + (current_email_index % array_length(genres, 1))],
                            genres[1 + ((current_email_index + 2) % array_length(genres, 1))]
                        ]
                    WHEN 'podcaster' THEN 
                        ARRAY[
                            podcast_skills[1 + (current_email_index % array_length(podcast_skills, 1))],
                            podcast_skills[1 + ((current_email_index + 2) % array_length(podcast_skills, 1))],
                            podcast_skills[1 + ((current_email_index + 4) % array_length(podcast_skills, 1))],
                            podcast_topics[1 + (current_email_index % array_length(podcast_topics, 1))]
                        ]
                    WHEN 'voice-actor' THEN 
                        ARRAY[
                            voice_skills[1 + (current_email_index % array_length(voice_skills, 1))],
                            voice_skills[1 + ((current_email_index + 1) % array_length(voice_skills, 1))],
                            voice_skills[1 + ((current_email_index + 3) % array_length(voice_skills, 1))],
                            voice_styles[1 + (current_email_index % array_length(voice_styles, 1))],
                            voice_styles[1 + ((current_email_index + 2) % array_length(voice_styles, 1))]
                        ]
                    WHEN 'a-and-r' THEN 
                        ARRAY[
                            ar_skills[1 + (current_email_index % array_length(ar_skills, 1))],
                            ar_skills[1 + ((current_email_index + 2) % array_length(ar_skills, 1))],
                            ar_skills[1 + ((current_email_index + 4) % array_length(ar_skills, 1))],
                            'Music Industry',
                            'Talent Development'
                        ]
                    WHEN 'engineer' THEN 
                        ARRAY[
                            engineer_skills[1 + (current_email_index % array_length(engineer_skills, 1))],
                            engineer_skills[1 + ((current_email_index + 1) % array_length(engineer_skills, 1))],
                            engineer_skills[1 + ((current_email_index + 2) % array_length(engineer_skills, 1))],
                            engineer_skills[1 + ((current_email_index + 4) % array_length(engineer_skills, 1))],
                            engineer_skills[1 + ((current_email_index + 5) % array_length(engineer_skills, 1))]
                        ]
                    WHEN 'manager' THEN 
                        ARRAY[
                            manager_skills[1 + (current_email_index % array_length(manager_skills, 1))],
                            manager_skills[1 + ((current_email_index + 1) % array_length(manager_skills, 1))],
                            manager_skills[1 + ((current_email_index + 2) % array_length(manager_skills, 1))],
                            manager_skills[1 + ((current_email_index + 3) % array_length(manager_skills, 1))],
                            'Music Business'
                        ]
                END,
                jsonb_build_object(
                    'instagram', 'https://instagram.com/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '_' || role_record.slug,
                    'twitter', 'https://twitter.com/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '_' || role_record.slug,
                    'linkedin', 'https://linkedin.com/in/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '-' || lower(last_names[1 + (current_email_index % array_length(last_names, 1))]),
                    'facebook', CASE WHEN current_email_index % 3 = 0 THEN 'https://facebook.com/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '.' || lower(last_names[1 + (current_email_index % array_length(last_names, 1))]) ELSE NULL END,
                    'youtube', CASE WHEN role_record.slug IN ('musician', 'podcaster') THEN 'https://youtube.com/@' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || role_record.slug ELSE NULL END,
                    'tiktok', CASE WHEN current_email_index % 2 = 0 THEN 'https://tiktok.com/@' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '_' || role_record.slug ELSE NULL END
                ),
                CASE role_record.slug
                    WHEN 'musician' THEN 
                        jsonb_build_object(
                            'spotify', 'https://open.spotify.com/artist/' || substr(md5(new_user_id::text), 1, 22),
                            'soundcloud', 'https://soundcloud.com/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '-music',
                            'bandcamp', CASE WHEN current_email_index % 2 = 0 THEN 'https://' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '.bandcamp.com' ELSE NULL END,
                            'apple_music', 'https://music.apple.com/artist/' || substr(md5(new_user_id::text || 'apple'), 1, 10)
                        )
                    WHEN 'podcaster' THEN 
                        jsonb_build_object(
                            'apple_podcasts', 'https://podcasts.apple.com/podcast/id' || (1000000 + current_email_index * 1000),
                            'spotify_podcasts', 'https://open.spotify.com/show/' || substr(md5(new_user_id::text || 'podcast'), 1, 22),
                            'podcast_website', 'https://www.' || lower(replace(podcast_topics[1 + (current_email_index % array_length(podcast_topics, 1))], ' ', '')) || 'show.com',
                            'rss_feed', 'https://feeds.' || lower(replace(podcast_topics[1 + (current_email_index % array_length(podcast_topics, 1))], ' ', '')) || 'show.com/rss'
                        )
                    WHEN 'voice-actor' THEN 
                        jsonb_build_object(
                            'demo_reel', 'https://demos.' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || 'voice.com/commercial',
                            'voices_com', 'https://voices.com/actors/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '-' || lower(last_names[1 + (current_email_index % array_length(last_names, 1))]),
                            'casting_networks', 'https://castingnetworks.com/talent/' || substr(md5(new_user_id::text || 'casting'), 1, 8),
                            'imdb', CASE WHEN current_email_index % 3 = 0 THEN 'https://imdb.com/name/nm' || (1000000 + current_email_index * 100) ELSE NULL END
                        )
                    WHEN 'a-and-r' THEN 
                        jsonb_build_object(
                            'label_profile', 'https://' || lower(replace(record_labels[1 + (current_email_index % array_length(record_labels, 1))], ' ', '')) || '.com/team/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]),
                            'music_business_worldwide', CASE WHEN current_email_index % 4 = 0 THEN 'https://musicbusinessworldwide.com/profile/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '-' || lower(last_names[1 + (current_email_index % array_length(last_names, 1))]) ELSE NULL END,
                            'hitquarters', 'https://hitquarters.com/ar/' || substr(md5(new_user_id::text || 'hq'), 1, 6)
                        )
                    WHEN 'engineer' THEN 
                        jsonb_build_object(
                            'allmusic_credits', 'https://allmusic.com/artist/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '-' || lower(last_names[1 + (current_email_index % array_length(last_names, 1))]) || '-mn' || (1000000 + current_email_index),
                            'gearspace', 'https://gearspace.com/member/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '_engineer',
                            'mix_with_the_masters', CASE WHEN current_email_index % 5 = 0 THEN 'https://mixwiththemasters.com/instructors/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '-' || lower(last_names[1 + (current_email_index % array_length(last_names, 1))]) ELSE NULL END,
                            'credits', 'https://credits.' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || 'audio.com'
                        )
                    WHEN 'manager' THEN 
                        jsonb_build_object(
                            'management_company', 'https://www.' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || 'management.com',
                            'music_managers_forum', 'https://mmf.com/members/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '-' || lower(last_names[1 + (current_email_index % array_length(last_names, 1))]),
                            'billboard_profile', CASE WHEN current_email_index % 3 = 0 THEN 'https://billboard.com/pro/managers/' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || '-' || lower(last_names[1 + (current_email_index % array_length(last_names, 1))]) ELSE NULL END,
                            'artist_roster', 'https://www.' || lower(first_names[1 + (current_email_index % array_length(first_names, 1))]) || 'management.com/roster'
                        )
                END,
                NOW() - INTERVAL '1 day' * (1 + (current_email_index % 365)),
                NOW() - INTERVAL '1 day' * (1 + (current_email_index % 365))
            );
            
            -- Get the profile ID we just created
            INSERT INTO profile_roles (profile_id, role_id)
            SELECT p.id, role_record.id
            FROM profiles p
            WHERE p.user_id = new_user_id;
            
            current_email_index := current_email_index + 1;
        END LOOP;
    END LOOP;
END $$;

-- Add some favorite studios for variety (each user favorites 2-5 random studios)
DO $$
DECLARE
    profile_rec RECORD;
    studio_rec RECORD;
    num_favorites INTEGER;
    studio_count INTEGER;
BEGIN
    -- Get total number of studios
    SELECT COUNT(*) INTO studio_count FROM studios WHERE published = true;
    
    -- For each newly created profile
    FOR profile_rec IN 
        SELECT p.id 
        FROM profiles p
        JOIN profile_roles pr ON p.id = pr.profile_id
        JOIN roles r ON pr.role_id = r.id
        WHERE r.slug IN ('musician', 'podcaster', 'voice-actor', 'a-and-r', 'engineer', 'manager')
        AND p.created_at >= NOW() - INTERVAL '1 year'
    LOOP
        -- Random number of favorites between 2 and 5
        num_favorites := 2 + floor(random() * 4);
        
        -- Add random favorite studios
        INSERT INTO profile_studio_favorites (profile_id, studio_id)
        SELECT profile_rec.id, s.id
        FROM studios s
        WHERE s.published = true
        ORDER BY RANDOM()
        LIMIT num_favorites
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Display summary statistics
WITH role_counts AS (
    SELECT 
        r.name as role_name,
        COUNT(DISTINCT pr.profile_id) as user_count
    FROM roles r
    JOIN profile_roles pr ON r.id = pr.role_id
    JOIN profiles p ON pr.profile_id = p.id
    WHERE r.slug IN ('musician', 'podcaster', 'voice-actor', 'a-and-r', 'engineer', 'manager')
    AND p.created_at >= NOW() - INTERVAL '1 year'
    GROUP BY r.name
    ORDER BY r.name
)
SELECT 
    role_name,
    user_count
FROM role_counts

UNION ALL

SELECT 
    'TOTAL USERS CREATED' as role_name,
    SUM(user_count) as user_count
FROM role_counts

UNION ALL

SELECT 
    'Total Profiles with Favorites' as role_name,
    COUNT(DISTINCT profile_id) as user_count
FROM profile_studio_favorites
WHERE created_at >= NOW() - INTERVAL '1 year';

-- Final summary
SELECT 
    'Summary: Created 150 users (25 each for Musician, Podcaster, Voice Actor, A&R, Engineer, Manager) with rich profiles and metadata' as result;