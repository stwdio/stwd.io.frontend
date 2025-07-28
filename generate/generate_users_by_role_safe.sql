-- User Generation Script for stwd.io (Safe Version)
-- This script generates 50 diverse professional profiles with rich bios and professional links
-- Handles existing users gracefully
-- Categories: Musicians (20), Engineers (8), Podcasters (5), Voice Actors (3), A&Rs (4), Managers (5), Studio Owners (5)

-- Function to safely create or get user
CREATE OR REPLACE FUNCTION create_or_get_user(
    email_param text,
    username_param text,
    first_name_param text,
    last_name_param text,
    bio_param text,
    social_links_param jsonb,
    portfolio_links_param jsonb,
    website_param text,
    skills_param text[],
    role_slug_param text
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    user_id_var uuid;
    profile_id_var bigint;
    role_id_var int;
BEGIN
    -- Get role id
    SELECT id INTO role_id_var FROM roles WHERE slug = role_slug_param;
    
    -- Check if user exists by email
    SELECT id INTO user_id_var FROM auth.users WHERE email = email_param;
    
    -- If user doesn't exist, create it
    IF user_id_var IS NULL THEN
        user_id_var := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (user_id_var, email_param, crypt('1&Ey@&4%4*092', gen_salt('bf')), now(), now(), now())
        ON CONFLICT (email) DO NOTHING
        RETURNING id INTO user_id_var;
        
        -- If insert failed due to race condition, get the existing user
        IF user_id_var IS NULL THEN
            SELECT id INTO user_id_var FROM auth.users WHERE email = email_param;
        END IF;
    END IF;
    
    -- Check if profile exists
    SELECT id INTO profile_id_var FROM profiles WHERE user_id = user_id_var OR username = username_param;
    
    -- If profile doesn't exist, create it
    IF profile_id_var IS NULL THEN
        INSERT INTO profiles (user_id, username, first_name, last_name, bio, system_role, social_links, portfolio_links, website, skills)
        VALUES (user_id_var, username_param, first_name_param, last_name_param, bio_param, 'user', 
                social_links_param, portfolio_links_param, website_param, skills_param)
        ON CONFLICT (user_id) DO UPDATE SET
            username = EXCLUDED.username,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            bio = EXCLUDED.bio,
            social_links = EXCLUDED.social_links,
            portfolio_links = EXCLUDED.portfolio_links,
            website = EXCLUDED.website,
            skills = EXCLUDED.skills
        RETURNING id INTO profile_id_var;
        
        -- Add role
        INSERT INTO profile_roles (profile_id, role_id) 
        VALUES (profile_id_var, role_id_var)
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN user_id_var;
END;
$$;

-- Generate users using the safe function
DO $$
DECLARE
    user_id_var uuid;
BEGIN
    -- Musicians (20 profiles)
    
    -- Musician 1: Rising Indie Artist
    user_id_var := create_or_get_user(
        'maya.rivers@example.com',
        'maya_rivers',
        'Maya',
        'Rivers',
        'London-based singer-songwriter crafting indie-folk with a 70s vibe. Currently writing my debut EP and looking for a mixing engineer who loves analog warmth. My sound blends Joni Mitchell storytelling with modern production.',
        '{"twitter": "@maya_rivers", "instagram": "@mayariversmusic", "tiktok": "@maya_rivers"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/maya_rivers", "soundcloud": "https://soundcloud.com/maya-rivers", "bandcamp": "https://mayarivers.bandcamp.com"}'::jsonb,
        'https://mayarivers.com',
        ARRAY['Vocals', 'Acoustic Guitar', 'Songwriting', 'Folk', 'Indie'],
        'musician'
    );
    
    -- Musician 2: Electronic Producer
    user_id_var := create_or_get_user(
        'alex.neon@example.com',
        'neon_alex',
        'Alex',
        'Chen',
        'Electronic music producer specializing in future bass and synthwave. 10M+ streams on Spotify. Always experimenting with new sounds and looking for vocalists to collaborate with. Let''s create something unique together!',
        '{"twitter": "@neon_alex", "instagram": "@neonalexmusic", "youtube": "youtube.com/neonalexmusic"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/neon_alex", "beatport": "https://beatport.com/artist/neon-alex", "apple_music": "https://music.apple.com/artist/neon-alex"}'::jsonb,
        'https://neonalexmusic.com',
        ARRAY['Electronic Production', 'Ableton Live', 'Sound Design', 'Mixing', 'Future Bass', 'Synthwave'],
        'musician'
    );
    
    -- Musician 3: Jazz Quartet Leader
    user_id_var := create_or_get_user(
        'marcus.blue@example.com',
        'marcus_blue_quartet',
        'Marcus',
        'Blue',
        'Jazz saxophonist and composer leading the Marcus Blue Quartet. Graduate of Berklee College of Music. We''re booking studio time for our third album - need a room that can capture the live energy of our performances.',
        '{"twitter": "@marcusbluemusic", "instagram": "@marcusbluequartet", "facebook": "facebook.com/marcusbluequartet"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/marcus_blue", "allmusic": "https://allmusic.com/artist/marcus-blue", "jazz_corner": "https://jazzcorner.com/marcus-blue"}'::jsonb,
        'https://marcusblue.jazz',
        ARRAY['Saxophone', 'Jazz Composition', 'Arranging', 'Bandleader', 'Improvisation'],
        'musician'
    );
    
    -- Musician 4: Hip-Hop Artist
    user_id_var := create_or_get_user(
        'jayden.frost@example.com',
        'frost_official',
        'Jayden',
        'Frost',
        'Independent hip-hop artist from Atlanta. My latest single hit 2M streams in the first month. Building my own label and looking for studios with that classic MPC vibe. Real music, real stories.',
        '{"twitter": "@frost_official", "instagram": "@frostmusic", "tiktok": "@jayden_frost"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/frost", "youtube": "youtube.com/frostofficial", "worldstar": "worldstarhiphop.com/frost"}'::jsonb,
        'https://frostofficial.com',
        ARRAY['Rap', 'Hip-Hop Production', 'Lyrics', 'Freestyle', 'Performance'],
        'musician'
    );
    
    -- Musician 5: Classical Pianist
    user_id_var := create_or_get_user(
        'sophia.winters@example.com',
        'sophia_winters_piano',
        'Sophia',
        'Winters',
        'Concert pianist specializing in contemporary classical music. Recording my interpretations of Philip Glass and Max Richter. Need a studio with a properly maintained grand piano and excellent room acoustics.',
        '{"twitter": "@sophiawinterspiano", "instagram": "@sophia.winters.piano", "facebook": "facebook.com/sophiawinterspianist"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/sophia_winters", "apple_music": "https://music.apple.com/artist/sophia-winters", "classical_archives": "https://classicalarchives.com/sophia-winters"}'::jsonb,
        'https://sophiawinters.com',
        ARRAY['Classical Piano', 'Contemporary Classical', 'Music Theory', 'Performance', 'Recording'],
        'musician'
    );
    
    -- Musician 6: Rock Band Frontman
    user_id_var := create_or_get_user(
        'jake.thunder@example.com',
        'thundercats_band',
        'Jake',
        'Thunder',
        'Lead vocalist and guitarist for Thundercats. We''re a 4-piece rock band bringing back the raw energy of 90s grunge with a modern twist. Currently touring and need studios in multiple cities for our next album.',
        '{"twitter": "@thundercatsband", "instagram": "@thundercats_official", "tiktok": "@thundercatsrock"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/thundercats", "bandcamp": "https://thundercats.bandcamp.com", "youtube": "youtube.com/thundercatsband"}'::jsonb,
        'https://thundercatsband.com',
        ARRAY['Rock Vocals', 'Electric Guitar', 'Songwriting', 'Live Performance', 'Grunge'],
        'musician'
    );
    
    -- Musician 7: R&B Singer
    user_id_var := create_or_get_user(
        'aaliyah.rose@example.com',
        'aaliyah_rose',
        'Aaliyah',
        'Rose',
        'R&B/Soul singer-songwriter from Chicago. My music blends classic soul with modern trap-soul production. Looking for studios with vintage Neve preamps to capture that warm vocal tone I''m after.',
        '{"twitter": "@aaliyahrose", "instagram": "@aaliyahrosemusic", "tiktok": "@aaliyah.rose"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/aaliyah_rose", "soundcloud": "https://soundcloud.com/aaliyah-rose", "tidal": "https://tidal.com/artist/aaliyah-rose"}'::jsonb,
        'https://aaliyahrose.com',
        ARRAY['R&B Vocals', 'Soul', 'Songwriting', 'Harmonies', 'Trap-Soul'],
        'musician'
    );
    
    -- Musician 8: Country Singer
    user_id_var := create_or_get_user(
        'tyler.brooks@example.com',
        'tyler_brooks_music',
        'Tyler',
        'Brooks',
        'Nashville-based country artist blending traditional storytelling with modern production. Winner of CMA''s New Artist Showcase 2023. Recording my major label debut and need the best studios Music City has to offer.',
        '{"twitter": "@tylerbrooksmusic", "instagram": "@tyler_brooks_country", "facebook": "facebook.com/tylerbrooksofficial"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/tyler_brooks", "apple_music": "https://music.apple.com/artist/tyler-brooks", "pandora": "https://pandora.com/artist/tyler-brooks"}'::jsonb,
        'https://tylerbrooksmusic.com',
        ARRAY['Country Vocals', 'Acoustic Guitar', 'Songwriting', 'Nashville Sound', 'Live Performance'],
        'musician'
    );
    
    -- Musician 9: EDM DJ/Producer
    user_id_var := create_or_get_user(
        'luna.electric@example.com',
        'luna_electric',
        'Luna',
        'Martinez',
        'EDM producer and DJ specializing in progressive house and techno. Resident DJ at Output NYC. My tracks have been played at Tomorrowland and Ultra. Always pushing sonic boundaries.',
        '{"twitter": "@luna_electric", "instagram": "@lunaelectricmusic", "twitch": "twitch.tv/luna_electric"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/luna_electric", "beatport": "https://beatport.com/artist/luna-electric", "mixcloud": "https://mixcloud.com/luna_electric"}'::jsonb,
        'https://lunaelectric.com',
        ARRAY['EDM Production', 'DJing', 'Ableton Live', 'Progressive House', 'Techno', 'Live Performance'],
        'musician'
    );
    
    -- Musician 10: Folk Band
    user_id_var := create_or_get_user(
        'willow.creek@example.com',
        'willow_creek_collective',
        'Emma',
        'Hartley',
        'Lead singer of Willow Creek Collective, a 6-piece folk ensemble. We blend traditional Appalachian music with contemporary indie-folk. NPR Tiny Desk Contest finalists 2023. Seeking studios with live room capabilities.',
        '{"twitter": "@willowcreekcoll", "instagram": "@willowcreekcollective", "facebook": "facebook.com/willowcreekmusic"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/willow_creek", "bandcamp": "https://willowcreek.bandcamp.com", "npr_music": "https://npr.org/artists/willow-creek"}'::jsonb,
        'https://willowcreekcollective.com',
        ARRAY['Folk Vocals', 'Banjo', 'Harmonies', 'Appalachian Music', 'Indie Folk'],
        'musician'
    );
    
    -- Musician 11: Metal Guitarist
    user_id_var := create_or_get_user(
        'axel.storm@example.com',
        'axel_storm',
        'Axel',
        'Storm',
        'Progressive metal guitarist and composer. Session player for major metal acts. My signature 8-string guitar sound requires studios that understand heavy music production. Endorsed by ESP Guitars.',
        '{"twitter": "@axelstormguitar", "instagram": "@axel_storm_official", "youtube": "youtube.com/axelstorm"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/axel_storm", "metal_archives": "https://metal-archives.com/axel_storm", "ultimate_guitar": "https://ultimate-guitar.com/axel_storm"}'::jsonb,
        'https://axelstorm.com',
        ARRAY['Metal Guitar', '8-String Guitar', 'Progressive Metal', 'Composition', 'Production'],
        'musician'
    );
    
    -- Musician 12: Pop Artist
    user_id_var := create_or_get_user(
        'zara.sky@example.com',
        'zara_sky',
        'Zara',
        'Sky',
        'Pop artist and songwriter signed to Atlantic Records. My debut single went platinum in 6 countries. Working on my sophomore album with a more mature, experimental sound. Actively seeking a producer for my next project.',
        '{"twitter": "@zarasky", "instagram": "@zaraskymusic", "tiktok": "@zara_sky_official"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/zara_sky", "apple_music": "https://music.apple.com/artist/zara-sky", "youtube": "youtube.com/zarasky"}'::jsonb,
        'https://zarasky.com',
        ARRAY['Pop Vocals', 'Songwriting', 'Dance', 'Performance', 'Top 40'],
        'musician'
    );
    
    -- Musician 13: Reggae Artist
    user_id_var := create_or_get_user(
        'jah.blessing@example.com',
        'jah_blessing',
        'Marcus',
        'Campbell',
        'Roots reggae artist spreading positive vibrations from Kingston to the world. Collaborated with members of The Wailers. Need studios that understand the importance of deep bass and authentic reggae rhythm.',
        '{"twitter": "@jahblessing", "instagram": "@jah_blessing_music", "facebook": "facebook.com/jahblessingofficial"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/jah_blessing", "youtube": "youtube.com/jahblessing", "reggaeville": "https://reggaeville.com/artist/jah-blessing"}'::jsonb,
        'https://jahblessing.com',
        ARRAY['Reggae Vocals', 'Conscious Lyrics', 'Rastafarian Music', 'Dub', 'Live Performance'],
        'musician'
    );
    
    -- Musician 14: Ambient/Experimental
    user_id_var := create_or_get_user(
        'echo.void@example.com',
        'echo_void',
        'River',
        'Chen',
        'Experimental ambient artist creating immersive soundscapes. My work has been featured in meditation apps and art installations worldwide. Looking for studios with unique acoustic spaces and high-end reverb units.',
        '{"twitter": "@echo_void", "instagram": "@echovoidmusic", "bandcamp": "echovoid"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/echo_void", "bandcamp": "https://echovoid.bandcamp.com", "soundcloud": "https://soundcloud.com/echo-void"}'::jsonb,
        'https://echovoid.space',
        ARRAY['Ambient Music', 'Sound Design', 'Field Recording', 'Modular Synthesis', 'Experimental'],
        'musician'
    );
    
    -- Musician 15: Latin Music Artist
    user_id_var := create_or_get_user(
        'carlos.fuego@example.com',
        'carlos_fuego',
        'Carlos',
        'Rodriguez',
        'Latin music artist blending reggaeton with traditional salsa. Billboard Latin Music Award nominee. My music celebrates our culture while pushing the genre forward. Need studios experienced with Latin percussion.',
        '{"twitter": "@carlosfuego", "instagram": "@carlos_fuego_music", "tiktok": "@carlosfuego"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/carlos_fuego", "apple_music": "https://music.apple.com/artist/carlos-fuego", "deezer": "https://deezer.com/artist/carlos_fuego"}'::jsonb,
        'https://carlosfuego.com',
        ARRAY['Latin Vocals', 'Reggaeton', 'Salsa', 'Spanish Lyrics', 'Latin Percussion'],
        'musician'
    );
    
    -- Musician 16: Gospel Choir Director
    user_id_var := create_or_get_user(
        'grace.harmony@example.com',
        'grace_harmony_choir',
        'Grace',
        'Johnson',
        'Director of the 40-voice Grace & Harmony Gospel Choir. We''ve performed at the White House and recorded with Kirk Franklin. Looking for studios that can handle large ensemble recordings with pristine acoustics.',
        '{"twitter": "@graceharmony", "instagram": "@graceharmonychoir", "facebook": "facebook.com/graceharmonygospel"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/grace_harmony", "youtube": "youtube.com/graceharmonychoir", "gospel_channel": "https://gospelchannel.com/grace-harmony"}'::jsonb,
        'https://graceharmonychoir.org',
        ARRAY['Gospel Music', 'Choir Direction', 'Vocal Arrangement', 'Piano', 'Worship Leading'],
        'musician'
    );
    
    -- Musician 17: Trap Producer
    user_id_var := create_or_get_user(
        'metro.wave@example.com',
        'metro_wave',
        'DeAndre',
        'Williams',
        'Trap producer with placements on Billboard Hot 100. My beats have been used by major artists in the game. Studio must have proper monitoring for those 808s. Let''s cook up some heat!',
        '{"twitter": "@metrowave", "instagram": "@metro_wave_beats", "youtube": "youtube.com/metrowave"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/metro_wave", "beatstars": "https://beatstars.com/metrowave", "youtube": "youtube.com/metrowavebeats"}'::jsonb,
        'https://metrowavebeats.com',
        ARRAY['Trap Production', 'Beat Making', 'FL Studio', '808s', 'Hip-Hop'],
        'musician'
    );
    
    -- Musician 18: Singer-Songwriter
    user_id_var := create_or_get_user(
        'lily.moon@example.com',
        'lily_moon_music',
        'Lily',
        'Moon',
        'Indie singer-songwriter from Portland. My confessional lyrics and ethereal melodies have been compared to Phoebe Bridgers meets Sufjan Stevens. Recording my third album, need intimate studio spaces.',
        '{"twitter": "@lilymoonmusic", "instagram": "@lily_moon_songs", "tiktok": "@lily.moon"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/lily_moon", "bandcamp": "https://lilymoon.bandcamp.com", "patreon": "https://patreon.com/lilymoon"}'::jsonb,
        'https://lilymoonmusic.com',
        ARRAY['Indie Folk', 'Songwriting', 'Acoustic Guitar', 'Piano', 'Ethereal Vocals'],
        'musician'
    );
    
    -- Musician 19: Funk Band Leader
    user_id_var := create_or_get_user(
        'groove.master@example.com',
        'groove_dynasty',
        'Jerome',
        'Parker',
        'Bass player and leader of Groove Dynasty, keeping the funk alive in 2024. We''re a 9-piece funk band with a full horn section. Need studios that can handle our high-energy sessions and capture that pocket!',
        '{"twitter": "@groovedynasty", "instagram": "@groove_dynasty_band", "facebook": "facebook.com/groovedynasty"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/groove_dynasty", "youtube": "youtube.com/groovedynasty", "funkbase": "https://funkbase.com/groove-dynasty"}'::jsonb,
        'https://groovedynasty.com',
        ARRAY['Funk Bass', 'Band Leadership', 'Arrangement', 'Groove', 'Live Recording'],
        'musician'
    );
    
    -- Musician 20: World Music Artist
    user_id_var := create_or_get_user(
        'amara.roots@example.com',
        'amara_roots',
        'Amara',
        'Diallo',
        'World music artist fusing West African traditions with contemporary sounds. My kora playing has been featured on Grammy-winning albums. Seeking studios that appreciate and can capture traditional instruments.',
        '{"twitter": "@amararoots", "instagram": "@amara_roots_music", "facebook": "facebook.com/amararootsmusic"}'::jsonb,
        '{"spotify": "https://open.spotify.com/artist/amara_roots", "youtube": "youtube.com/amararoots", "world_music_network": "https://wmn.com/amara-roots"}'::jsonb,
        'https://amararoots.com',
        ARRAY['Kora', 'West African Music', 'World Fusion', 'Traditional Instruments', 'Vocals'],
        'musician'
    );
    
    -- Engineers (8 profiles)
    
    -- Engineer 1: Mixing Specialist
    user_id_var := create_or_get_user(
        'david.mix@example.com',
        'david_sterling_mix',
        'David',
        'Sterling',
        'Grammy-nominated mixing engineer with 15 years experience. Specialized in rock, indie, and alternative. Mixed albums that have gone gold and platinum. Your vision, professionally realized. Currently looking for new artists to work with.',
        '{"twitter": "@davidsterlingmix", "instagram": "@sterling_mix", "linkedin": "linkedin.com/in/davidsterling"}'::jsonb,
        '{"allmusic": "https://allmusic.com/david-sterling", "discogs": "https://discogs.com/david-sterling", "credits": "https://mixwiththeasters.com/sterling"}'::jsonb,
        'https://sterlingmix.com',
        ARRAY['Mixing', 'Pro Tools', 'Rock', 'Indie', 'Alternative', 'Analog Gear'],
        'engineer'
    );
    
    -- Engineer 2: Mastering Engineer
    user_id_var := create_or_get_user(
        'sarah.masters@example.com',
        'sarah_blackwood_mastering',
        'Sarah',
        'Blackwood',
        'Head Engineer at Crystal Clear Mastering. I specialize in bringing clarity and punch to your mixes while maintaining dynamic range. Worked with major labels and indie artists alike. Let''s make your music shine!',
        '{"twitter": "@sarahmastering", "instagram": "@blackwood_mastering", "linkedin": "linkedin.com/in/sarahblackwood"}'::jsonb,
        '{"discogs": "https://discogs.com/sarah-blackwood", "soundbetter": "https://soundbetter.com/sarah-blackwood", "credits": "https://allmusic.com/sarah-blackwood-mastering"}'::jsonb,
        'https://blackwoodmastering.com',
        ARRAY['Mastering', 'iZotope RX', 'Wavelab', 'Analog Mastering', 'Stem Mastering'],
        'engineer'
    );
    
    -- Engineer 3: Hip-Hop Engineer
    user_id_var := create_or_get_user(
        'tony.beats@example.com',
        'tony_cruz_engineer',
        'Tony',
        'Cruz',
        'Hip-hop recording and mixing engineer. Worked with platinum artists and underground legends. Expert in vocal production, auto-tune, and getting that radio-ready sound. Hit me up, let''s create classics!',
        '{"twitter": "@tonycruzeng", "instagram": "@tony_cruz_studio", "youtube": "youtube.com/tonycruzengineering"}'::jsonb,
        '{"soundcloud": "https://soundcloud.com/tony-cruz-eng", "credits": "https://genius.com/tony-cruz", "worldstar": "worldstarhiphop.com/tony-cruz"}'::jsonb,
        'https://tonycruzengineering.com',
        ARRAY['Hip-Hop Engineering', 'Vocal Production', 'Auto-Tune', 'Pro Tools', 'Beat Mixing'],
        'engineer'
    );
    
    -- Engineer 4: Live Sound Engineer
    user_id_var := create_or_get_user(
        'mike.live@example.com',
        'mike_dawson_live',
        'Mike',
        'Dawson',
        'FOH engineer with 20+ years touring experience. Worked major festivals including Coachella, Glastonbury, and Lollapalooza. Also do studio work specializing in capturing live energy in recordings.',
        '{"twitter": "@mikedawsonlive", "instagram": "@dawson_sound", "facebook": "facebook.com/mikedawsonaudio"}'::jsonb,
        '{"linkedin": "linkedin.com/in/mikedawson", "tour_history": "https://tourhistory.com/mike-dawson", "live_credits": "https://livesoundint.com/dawson"}'::jsonb,
        'https://dawsonsound.com',
        ARRAY['Live Sound', 'FOH Mixing', 'System Design', 'Festival Sound', 'Studio Recording'],
        'engineer'
    );
    
    -- Engineer 5: Electronic Music Specialist
    user_id_var := create_or_get_user(
        'alex.synth@example.com',
        'alex_nova_engineering',
        'Alex',
        'Nova',
        'Electronic music production specialist and mix engineer. Expert in Ableton Live, modular synthesis, and creative sound design. If it bleeps, bloops, or drops bass, I''m your engineer.',
        '{"twitter": "@alexnovaeng", "instagram": "@nova_engineering", "twitch": "twitch.tv/alexnova"}'::jsonb,
        '{"soundcloud": "https://soundcloud.com/alex-nova", "beatport": "https://beatport.com/alex-nova", "mixmag": "https://mixmag.net/alex-nova"}'::jsonb,
        'https://novaengineering.com',
        ARRAY['Electronic Production', 'Ableton Live', 'Sound Design', 'Modular Synthesis', 'EDM Mixing'],
        'engineer'
    );
    
    -- Engineer 6: Classical Recording Engineer
    user_id_var := create_or_get_user(
        'helena.classical@example.com',
        'helena_bergmann',
        'Helena',
        'Bergmann',
        'Classical and acoustic music recording engineer. Trained at Abbey Road Institute. Specialized in orchestral, chamber music, and solo piano recordings. Capturing the natural beauty of acoustic instruments.',
        '{"twitter": "@helenabergmann", "instagram": "@bergmann_recording", "linkedin": "linkedin.com/in/helenabergmann"}'::jsonb,
        '{"gramophone": "https://gramophone.co.uk/helena-bergmann", "classical_recordings": "https://classicalrecordings.com/bergmann", "deutsche_grammophon": "https://dg.com/helena-bergmann"}'::jsonb,
        'https://bergmannrecording.com',
        ARRAY['Classical Recording', 'Orchestral', 'Acoustic Music', 'Room Acoustics', 'Stereo Techniques'],
        'engineer'
    );
    
    -- Engineer 7: Podcast Engineer
    user_id_var := create_or_get_user(
        'jordan.podcast@example.com',
        'jordan_voice_pro',
        'Jordan',
        'Taylor',
        'Podcast production specialist. I help podcasters achieve broadcast-quality sound. Services include recording, editing, mixing, and mastering. Worked with top 10 podcasts on Apple Podcasts.',
        '{"twitter": "@jordanvoicepro", "instagram": "@jordan_podcast_pro", "linkedin": "linkedin.com/in/jordantaylor"}'::jsonb,
        '{"podcast_credits": "https://podcastcredits.com/jordan-taylor", "soundcloud": "https://soundcloud.com/jordan-voice", "portfolio": "https://jordanvoice.com/portfolio"}'::jsonb,
        'https://jordanvoicepro.com',
        ARRAY['Podcast Production', 'Voice Processing', 'Audio Restoration', 'Hindenburg Pro', 'Remote Recording'],
        'engineer'
    );
    
    -- Engineer 8: Vintage Gear Specialist
    user_id_var := create_or_get_user(
        'rick.vintage@example.com',
        'rick_analog',
        'Rick',
        'Thompson',
        'Recording engineer specializing in vintage analog gear. Owner of Sunset Sound Studios. If you want that warm, classic sound from the 60s and 70s, I''ve got the gear and know-how to get you there.',
        '{"twitter": "@rickanalog", "instagram": "@rick_sunset_sound", "facebook": "facebook.com/rickthomsponeng"}'::jsonb,
        '{"discogs": "https://discogs.com/rick-thompson", "tape_op": "https://tapeop.com/rick-thompson", "vintage_king": "https://vintageking.com/rick-thompson"}'::jsonb,
        'https://sunsetsoundstudios.com',
        ARRAY['Analog Recording', 'Vintage Gear', 'Tape Machines', 'Neve Console', 'Classic Rock'],
        'engineer'
    );
    
    -- Podcasters (5 profiles)
    
    -- Podcaster 1: True Crime
    user_id_var := create_or_get_user(
        'jessica.crime@example.com',
        'jessica_investigates',
        'Jessica',
        'Martinez',
        'Host of "Cold Cases Revisited" - Top 5 True Crime podcast. Former investigative journalist diving deep into unsolved mysteries. Looking for quiet studios with excellent sound isolation for narrative recording.',
        '{"twitter": "@jessinvestigates", "instagram": "@coldcasesrevisited", "tiktok": "@jessica_crime"}'::jsonb,
        '{"apple_podcasts": "https://podcasts.apple.com/cold-cases", "spotify": "https://open.spotify.com/show/cold-cases", "patreon": "https://patreon.com/coldcases"}'::jsonb,
        'https://coldcasesrevisited.com',
        ARRAY['Podcast Hosting', 'Investigative Journalism', 'Audio Storytelling', 'Interview Skills', 'Research'],
        'podcaster'
    );
    
    -- Podcaster 2: Comedy
    user_id_var := create_or_get_user(
        'brad.laughs@example.com',
        'brad_and_chad_show',
        'Brad',
        'Wilson',
        'Co-host of "Brad & Chad''s Excellent Podcast" - comedy duo discussing pop culture with celebrity guests. 2M+ downloads per month. Need studios with multiple mic setups for our chaotic energy!',
        '{"twitter": "@bradandchad", "instagram": "@excellentpodcast", "youtube": "youtube.com/bradandchad"}'::jsonb,
        '{"apple_podcasts": "https://podcasts.apple.com/brad-chad", "spotify": "https://open.spotify.com/show/brad-chad", "youtube": "youtube.com/bradchadpodcast"}'::jsonb,
        'https://bradandchad.com',
        ARRAY['Comedy', 'Podcast Hosting', 'Improv', 'Entertainment', 'Live Shows'],
        'podcaster'
    );
    
    -- Podcaster 3: Business/Tech
    user_id_var := create_or_get_user(
        'rachel.tech@example.com',
        'rachel_decodes',
        'Rachel',
        'Kim',
        'Host of "Decoding Success" - interviewing tech founders and venture capitalists. Stanford MBA exploring the intersection of technology and business. Professional setup required for high-profile guests.',
        '{"twitter": "@racheldecodes", "instagram": "@decodingsuccesspod", "linkedin": "linkedin.com/in/rachelkim"}'::jsonb,
        '{"apple_podcasts": "https://podcasts.apple.com/decoding-success", "spotify": "https://open.spotify.com/show/decoding", "substack": "https://decodingsuccess.substack.com"}'::jsonb,
        'https://decodingsuccess.com',
        ARRAY['Business Podcasting', 'Tech Interviews', 'Startup Ecosystem', 'Professional Audio', 'Content Strategy'],
        'podcaster'
    );
    
    -- Podcaster 4: Health & Wellness
    user_id_var := create_or_get_user(
        'dr.wellness@example.com',
        'dr_sarah_wellness',
        'Dr. Sarah',
        'Chen',
        'Physician and host of "The Wellness Revolution" podcast. Breaking down complex health topics for everyday people. Need quiet, comfortable studios for long-form conversations about mental and physical health.',
        '{"twitter": "@drwellness", "instagram": "@wellnessrevolutionpod", "facebook": "facebook.com/drwellness"}'::jsonb,
        '{"apple_podcasts": "https://podcasts.apple.com/wellness-revolution", "spotify": "https://open.spotify.com/show/wellness", "website": "https://wellnessrevolution.com"}'::jsonb,
        'https://drsarahchen.com',
        ARRAY['Health Communication', 'Medical Expertise', 'Podcast Hosting', 'Educational Content', 'Wellness'],
        'podcaster'
    );
    
    -- Podcaster 5: History/Education
    user_id_var := create_or_get_user(
        'prof.history@example.com',
        'forgotten_histories',
        'Professor James',
        'Morrison',
        'History professor and host of "Forgotten Histories" - bringing untold stories to life. Winner of multiple podcast awards. Recording audiobook version of my bestseller, need professional narration booth.',
        '{"twitter": "@forgottenhistpod", "instagram": "@forgotten_histories", "facebook": "facebook.com/forgottenhistories"}'::jsonb,
        '{"apple_podcasts": "https://podcasts.apple.com/forgotten-histories", "spotify": "https://open.spotify.com/show/forgotten", "goodreads": "https://goodreads.com/james-morrison"}'::jsonb,
        'https://forgottenhistories.com',
        ARRAY['Historical Research', 'Educational Content', 'Storytelling', 'Academic', 'Audiobook Narration'],
        'podcaster'
    );
    
    -- Voice Actors (3 profiles)
    
    -- Voice Actor 1: Animation/Gaming
    user_id_var := create_or_get_user(
        'sam.voices@example.com',
        'sam_vo_pro',
        'Sam',
        'Rodriguez',
        'Professional voice actor for animation and video games. Credits include major AAA games and Netflix animated series. Home studio available but need professional spaces for ensemble sessions and motion capture.',
        '{"twitter": "@samvopro", "instagram": "@sam_voice_actor", "linkedin": "linkedin.com/in/samrodriguezvo"}'::jsonb,
        '{"imdb": "https://imdb.com/sam-rodriguez", "behind_the_voice": "https://behindthevoiceactors.com/sam-rodriguez", "voices": "https://voices.com/samrodriguez"}'::jsonb,
        'https://samrodriguezvo.com',
        ARRAY['Voice Acting', 'Animation', 'Video Games', 'Character Voices', 'Motion Capture'],
        'voice-actor'
    );
    
    -- Voice Actor 2: Commercial/Corporate
    user_id_var := create_or_get_user(
        'lisa.commercial@example.com',
        'lisa_voice_talent',
        'Lisa',
        'Anderson',
        'Versatile voice talent specializing in commercials, corporate narration, and e-learning. Clients include Fortune 500 companies. Quick turnaround, professional quality. ISDN/Source Connect equipped.',
        '{"twitter": "@lisavoicetalent", "instagram": "@lisa_vo", "linkedin": "linkedin.com/in/lisaandersonvo"}'::jsonb,
        '{"voice123": "https://voice123.com/lisaanderson", "bodalgo": "https://bodalgo.com/lisa-anderson", "demos": "https://lisavo.com/demos"}'::jsonb,
        'https://lisavoicetalent.com',
        ARRAY['Commercial VO', 'Corporate Narration', 'E-Learning', 'IVR', 'Source Connect'],
        'voice-actor'
    );
    
    -- Voice Actor 3: Audiobook Narrator
    user_id_var := create_or_get_user(
        'david.narrator@example.com',
        'david_audiobooks',
        'David',
        'Mitchell',
        'Award-winning audiobook narrator with over 200 titles. Specializing in fiction, mystery, and non-fiction. Audie Award nominee. Need long-form recording booths with excellent ergonomics for 6+ hour sessions.',
        '{"twitter": "@davidaudiobooks", "instagram": "@mitchell_narrates", "facebook": "facebook.com/davidmitchellnarrator"}'::jsonb,
        '{"audible": "https://audible.com/search?narrator=David+Mitchell", "audiofile": "https://audiofilemagazine.com/david-mitchell", "penguin": "https://penguinrandomhouse.com/mitchell"}'::jsonb,
        'https://davidmitchellnarrates.com',
        ARRAY['Audiobook Narration', 'Long-form Recording', 'Character Differentiation', 'Accents', 'Stamina'],
        'voice-actor'
    );
    
    -- A&Rs (4 profiles)
    
    -- A&R 1: Major Label Scout
    user_id_var := create_or_get_user(
        'marcus.scout@example.com',
        'marcus_ar_atlantic',
        'Marcus',
        'Washington',
        'A&R at Atlantic Records, East Coast division. Scouting for the next generation of hip-hop and R&B talent. Previously discovered 3 platinum artists. Always listening, always searching. Hit me with heat only.',
        '{"twitter": "@marcusar", "instagram": "@marcus_atlantic_ar", "linkedin": "linkedin.com/in/marcuswashington"}'::jsonb,
        '{"label": "https://atlanticrecords.com", "credits": "https://musicbiz.com/marcus-washington", "hitquarters": "https://hitquarters.com/marcus"}'::jsonb,
        '',
        ARRAY['A&R', 'Talent Scouting', 'Artist Development', 'Hip-Hop', 'R&B', 'Deal Making'],
        'ar'
    );
    
    -- A&R 2: Indie Label Owner
    user_id_var := create_or_get_user(
        'nina.indie@example.com',
        'nina_bloom_records',
        'Nina',
        'Patel',
        'Founder and A&R Director at Bloom Records. We champion innovative indie artists who push boundaries. Not looking for copycats - show me something I''ve never heard before. Based in Brooklyn.',
        '{"twitter": "@ninabloomrec", "instagram": "@bloom_records", "bandcamp": "bloomrecords"}'::jsonb,
        '{"label": "https://bloomrecords.com", "pitchfork": "https://pitchfork.com/labels/bloom", "resident_advisor": "https://ra.co/labels/bloom"}'::jsonb,
        'https://bloomrecords.com',
        ARRAY['Indie A&R', 'Label Management', 'Artist Development', 'Alternative Music', 'Creative Direction'],
        'ar'
    );
    
    -- A&R 3: Electronic Music Specialist
    user_id_var := create_or_get_user(
        'kai.electronic@example.com',
        'kai_voltage_music',
        'Kai',
        'Schmidt',
        'A&R for Voltage Music Group, focusing on electronic and dance music. Former DJ with ear for club hits. If it makes the crowd move, I want to hear it. Regularly at ADE, Miami Music Week, and major festivals.',
        '{"twitter": "@kaivoltage", "instagram": "@voltage_ar", "soundcloud": "kai-voltage"}'::jsonb,
        '{"label": "https://voltagemusic.com", "beatport": "https://beatport.com/label/voltage", "dj_mag": "https://djmag.com/kai-schmidt"}'::jsonb,
        '',
        ARRAY['Electronic A&R', 'Dance Music', 'Festival Circuit', 'DJ Culture', 'International Markets'],
        'ar'
    );
    
    -- A&R 4: Publishing Scout
    user_id_var := create_or_get_user(
        'emma.publishing@example.com',
        'emma_songs_ar',
        'Emma',
        'Collins',
        'A&R at Universal Music Publishing. Looking for songwriters and producers creating tomorrow''s hits. Sync opportunities available for the right material. Quality over quantity - memorable melodies win.',
        '{"twitter": "@emmaumpg", "instagram": "@emma_music_pub", "linkedin": "linkedin.com/in/emmacollins"}'::jsonb,
        '{"publisher": "https://umusicpub.com", "bmi": "https://bmi.com/emma-collins", "music_week": "https://musicweek.com/emma-collins"}'::jsonb,
        '',
        ARRAY['Publishing A&R', 'Songwriting', 'Sync Licensing', 'Copyright', 'Catalog Development'],
        'ar'
    );
    
    -- Managers (5 profiles)
    
    -- Manager 1: Established Artist Manager
    user_id_var := create_or_get_user(
        'robert.mgmt@example.com',
        'robert_sterling_mgmt',
        'Robert',
        'Sterling',
        'Artist manager with 20+ years experience. Currently managing 5 Grammy-nominated artists. We focus on long-term career development, not quick wins. Selective about new clients - excellence only.',
        '{"twitter": "@robertmgmt", "instagram": "@sterling_management", "linkedin": "linkedin.com/in/robertsterlingmgmt"}'::jsonb,
        '{"company": "https://sterlingmgmt.com", "billboard": "https://billboard.com/sterling-management", "variety": "https://variety.com/robert-sterling"}'::jsonb,
        'https://sterlingmanagement.com',
        ARRAY['Artist Management', 'Career Development', 'Tour Planning', 'Deal Negotiation', 'Brand Partnerships'],
        'manager'
    );
    
    -- Manager 2: Rising Star Manager
    user_id_var := create_or_get_user(
        'jasmine.rising@example.com',
        'jasmine_artist_dev',
        'Jasmine',
        'Taylor',
        'Boutique artist manager specializing in developing emerging talent. I work closely with just 3 artists at a time, ensuring personalized attention. Currently managing rising pop star Zara Sky.',
        '{"twitter": "@jasminetaylor", "instagram": "@jasmine_mgmt", "tiktok": "@jasmine.management"}'::jsonb,
        '{"clients": "https://jasminemgmt.com/roster", "forbes": "https://forbes.com/30under30/jasmine-taylor", "musically": "https://musically.com/jasmine"}'::jsonb,
        'https://jasminetaylormanagement.com',
        ARRAY['Artist Development', 'Social Media Strategy', 'Brand Building', 'Pop Music', 'Youth Market'],
        'manager'
    );
    
    -- Manager 3: Hip-Hop Manager
    user_id_var := create_or_get_user(
        'dwayne.hiphop@example.com',
        'dwayne_empire_mgmt',
        'Dwayne',
        'Jackson',
        'CEO of Empire Artist Management. Specializing in hip-hop artists and culture. Built multiple artists from SoundCloud to stadiums. It''s not just music, it''s a movement. Real recognize real.',
        '{"twitter": "@dwayneempire", "instagram": "@empire_mgmt", "clubhouse": "@dwayne_jackson"}'::jsonb,
        '{"company": "https://empiremgmt.com", "complex": "https://complex.com/dwayne-jackson", "xxl": "https://xxlmag.com/empire-management"}'::jsonb,
        'https://empireartistmanagement.com',
        ARRAY['Hip-Hop Management', 'Culture Marketing', 'Street Teams', 'Label Relations', 'Urban Markets'],
        'manager'
    );
    
    -- Manager 4: Band Manager
    user_id_var := create_or_get_user(
        'pete.bands@example.com',
        'pete_rock_mgmt',
        'Pete',
        'Morrison',
        'Veteran band manager with 25 years in rock and alternative. Currently managing Thundercats and two other touring rock bands. Expertise in tour logistics, merchandising, and keeping bands together.',
        '{"twitter": "@petemorrisonmgmt", "instagram": "@pete_band_mgmt", "facebook": "facebook.com/morrisonmanagement"}'::jsonb,
        '{"company": "https://morrisonmgmt.com", "pollstar": "https://pollstar.com/pete-morrison", "kerrang": "https://kerrang.com/morrison-management"}'::jsonb,
        'https://morrisonrockmanagement.com',
        ARRAY['Band Management', 'Tour Management', 'Merchandising', 'Rock Music', 'Festival Booking'],
        'manager'
    );
    
    -- Manager 5: International Manager
    user_id_var := create_or_get_user(
        'yuki.global@example.com',
        'yuki_global_artists',
        'Yuki',
        'Tanaka',
        'International artist manager bridging East and West. Specializing in breaking Asian artists in Western markets and vice versa. Fluent in 5 languages. Your gateway to global success.',
        '{"twitter": "@yukiglobal", "instagram": "@global_artists_mgmt", "weibo": "weibo.com/yukitanaka"}'::jsonb,
        '{"company": "https://globalartistsmgmt.com", "billboard_japan": "https://billboard-japan.com/yuki", "music_business": "https://musicbusiness.world/yuki-tanaka"}'::jsonb,
        'https://yukitanakamanagement.com',
        ARRAY['International Markets', 'Cross-Cultural', 'Tour Routing', 'Distribution Deals', 'Language Skills'],
        'manager'
    );
    
    -- Studio Owners (5 profiles)
    
    -- Studio Owner 1: Premium Studio Complex
    user_id_var := create_or_get_user(
        'james.studios@example.com',
        'james_platinum_sound',
        'James',
        'Cooper',
        'Owner of Platinum Sound Studios - a 5-room complex in Los Angeles. SSL and Neve equipped rooms. We''ve hosted everyone from indie artists to Grammy winners. Your music deserves the best.',
        '{"twitter": "@platinumsoundla", "instagram": "@platinum_studios_la", "facebook": "facebook.com/platinumsoundstudios"}'::jsonb,
        '{"studio": "https://platinumsoundla.com", "gear": "https://platinumsoundla.com/gear", "credits": "https://platinumsoundla.com/credits"}'::jsonb,
        'https://platinumsoundstudios.com',
        ARRAY['Studio Management', 'Business Operations', 'Client Relations', 'Equipment Maintenance', 'Marketing'],
        'studio-owner'
    );
    
    -- Studio Owner 2: Boutique Studio
    user_id_var := create_or_get_user(
        'maria.boutique@example.com',
        'maria_velvet_room',
        'Maria',
        'Gonzalez',
        'Owner of The Velvet Room - Nashville''s premier boutique studio. Specialized in singer-songwriters and intimate sessions. Vintage gear meets modern workflow. Where magic happens.',
        '{"twitter": "@velvetroomnash", "instagram": "@the_velvet_room_studio", "facebook": "facebook.com/velvetroomstudio"}'::jsonb,
        '{"studio": "https://velvetroomnashville.com", "nashville_scene": "https://nashvillescene.com/velvet-room", "gear_list": "https://velvetroomnashville.com/equipment"}'::jsonb,
        'https://thevelvetroom.studio',
        ARRAY['Boutique Studio', 'Acoustic Design', 'Vintage Equipment', 'Singer-Songwriter', 'Nashville Scene'],
        'studio-owner'
    );
    
    -- Studio Owner 3: Urban Studio
    user_id_var := create_or_get_user(
        'malik.urban@example.com',
        'malik_diamond_studios',
        'Malik',
        'Thompson',
        'Owner of Diamond Studios Atlanta. The go-to spot for hip-hop and trap music. State-of-the-art equipment, vibe on 100. Where your favorite rapper recorded their hit. Let''s make history.',
        '{"twitter": "@diamondatl", "instagram": "@diamond_studios_atl", "youtube": "youtube.com/diamondstudios"}'::jsonb,
        '{"studio": "https://diamondstudiosatl.com", "complex": "https://complex.com/diamond-studios", "hiphopdx": "https://hiphopdx.com/diamond-atlanta"}'::jsonb,
        'https://diamondstudiosatlanta.com',
        ARRAY['Hip-Hop Studios', 'Trap Music', 'Urban Culture', 'Atlanta Scene', 'Artist Relations'],
        'studio-owner'
    );
    
    -- Studio Owner 4: Historic Studio
    user_id_var := create_or_get_user(
        'william.historic@example.com',
        'william_abbey_studios',
        'William',
        'Chambers',
        'Owner of Abbey Road Studios NYC (not affiliated with London). Restored 1960s recording studio with original analog equipment. If these walls could talk... Come record where legends were made.',
        '{"twitter": "@abbeyroadnyc", "instagram": "@abbey_road_nyc", "facebook": "facebook.com/abbeyroadstudiosnyc"}'::jsonb,
        '{"studio": "https://abbeyroadnyc.com", "vintage_king": "https://vintageking.com/abbey-road-nyc", "tape_op": "https://tapeop.com/abbey-road-nyc"}'::jsonb,
        'https://abbeyroadstudiosnyc.com',
        ARRAY['Historic Studios', 'Analog Recording', 'Vintage Gear', 'Studio Tours', 'Music History'],
        'studio-owner'
    );
    
    -- Studio Owner 5: Modern Tech Studio
    user_id_var := create_or_get_user(
        'tech.studio@example.com',
        'alex_future_sound',
        'Alex',
        'Park',
        'Owner of Future Sound Labs - Silicon Valley''s most advanced recording facility. Dolby Atmos certified, VR recording capabilities, AI-assisted mixing. Where technology meets creativity.',
        '{"twitter": "@futuresoundlabs", "instagram": "@future_sound_labs", "linkedin": "linkedin.com/company/futuresoundlabs"}'::jsonb,
        '{"studio": "https://futuresoundlabs.com", "tech_crunch": "https://techcrunch.com/future-sound", "pro_sound": "https://prosoundnetwork.com/future-labs"}'::jsonb,
        'https://futuresoundlabs.io',
        ARRAY['Modern Studios', 'Dolby Atmos', 'VR Audio', 'AI Technology', 'Innovation'],
        'studio-owner'
    );
    
END $$;

-- Drop the function after use
DROP FUNCTION IF EXISTS create_or_get_user;

-- Output success message
SELECT 'Successfully generated 50 professional profiles across all roles!' as status;