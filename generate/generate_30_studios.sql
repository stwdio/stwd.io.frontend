-- Studio Generation Script for stwd.io
-- Run this in the Supabase SQL Editor to generate 30 studios
-- Owner will be profile ID 6 (Luke Halley)

-- First, let's create some amenities if they don't exist
INSERT INTO amenities (name) VALUES 
('Wi-Fi'),
('Parking'),
('Air Conditioning'),
('Sound Isolation'),
('24/7 Access'),
('Lounge Area'),
('Kitchen'),
('Bathroom'),
('Storage Space'),
('Equipment Rental'),
('Engineer Included'),
('Mixing Console'),
('Pro Tools'),
('Logic Pro'),
('Ableton Live'),
('Vintage Microphones'),
('Guitar Amps'),
('Piano/Keyboard'),
('Drum Kit'),
('Bass Amps')
ON CONFLICT (name) DO NOTHING;

-- Generate 30 Studios with comprehensive metadata
INSERT INTO studios (
    owner_id,
    name,
    description,
    hourly_rate,
    published,
    verified,
    gear,
    location,
    verification_status
) VALUES 
-- Studio 1: Premium Recording Studio
(6, 'Sonic Sanctuary Studios', 
'State-of-the-art recording facility featuring world-class equipment and acoustics. Perfect for professional recording, mixing, and mastering. Our main live room accommodates full bands with isolation booths for vocals and instruments.',
350,
true,
true,
'{"microphones": ["Neumann U87", "AKG C414", "Shure SM57", "Royer R-121"], "preamps": ["Neve 1073", "API 512c", "Universal Audio 610"], "monitors": ["Yamaha NS-10M", "Genelec 1031A"], "console": "SSL AWS 948", "daw": "Pro Tools HDX", "outboard": ["1176 Compressor", "LA-2A", "Pultec EQP-1A"], "instruments": ["Steinway Grand Piano", "Vintage Fender Rhodes", "Hammond B3"]}',
'Nashville, TN',
'verified'),

-- Studio 2: Indie Rock Haven
(6, 'Reverb Room Recording',
'Vintage-inspired studio specializing in indie rock, alternative, and experimental music. Our analog workflow and classic gear create that warm, authentic sound that digital just can''t replicate.',
200,
true,
true,
'{"microphones": ["Coles 4038", "RCA 44", "Electro-Voice RE20"], "preamps": ["Chandler Limited TG2", "Great River MP-500NV"], "console": "Neve VR60", "tape": "Studer A827 24-track", "guitars": ["1959 Les Paul", "Fender Telecaster"], "amps": ["Marshall Plexi", "Fender Twin Reverb", "Vox AC30"]}',
'Austin, TX',
'verified'),

-- Studio 3: Hip-Hop Production Suite
(6, 'Beat Lab Studios',
'Modern hip-hop and R&B production facility with cutting-edge digital tools and a massive sample library. Full MIDI setup with vintage synths and drum machines for that authentic boom-bap sound.',
180,
true,
true,
'{"daw": "Logic Pro X", "monitors": ["KRK V8", "Yamaha HS8"], "keyboards": ["Akai MPC 2000XL", "Roland Jupiter-8", "Moog Minimoog"], "mics": ["Sony C-37A", "Neumann TLM 103"], "software": ["Kontakt", "Omnisphere", "Serum"], "drums": "TR-808 & TR-909"}',
'Atlanta, GA',
'verified'),

-- Studio 4: Acoustic Folk Studio
(6, 'Whispering Pines Acoustic',
'Intimate acoustic recording space nestled in a converted barn. Perfect for singer-songwriters, folk artists, and acoustic ensembles. Natural reverb and organic acoustics.',
120,
true,
true,
'{"microphones": ["Neumann KM184", "AKG C12", "Coles 4038"], "preamps": ["Millennia HV-3D", "Grace M101"], "instruments": ["Martin D-28", "Gibson J-45", "Taylor 814ce"], "ambience": "Natural room acoustics", "specialty": "Acoustic guitar and vocal recording"}',
'Asheville, NC',
'verified'),

-- Studio 5: Electronic Music Lab
(6, 'Synthesis Station',
'Electronic music production paradise with an extensive modular synth setup and drum machines. Specializing in techno, house, ambient, and experimental electronic music.',
220,
true,
true,
'{"synthesizers": ["Moog Modular", "Buchla Music Easel", "Oberheim Matrix 1000"], "drum_machines": ["TR-909", "TR-808", "LinnDrum"], "sequencers": ["Elektron Octatrack", "Cirklon"], "effects": ["Eventide H9000", "Lexicon 480L"], "daw": "Ableton Live Suite"}',
'Berlin, Germany',
'verified'),

-- Studio 6: Jazz Recording Haven
(6, 'Blue Note Recordings',
'Classic jazz recording studio with pristine acoustics and vintage equipment. Perfect for jazz ensembles, big bands, and acoustic performances. Live room accommodates up to 20 musicians.',
280,
true,
true,
'{"microphones": ["RCA 44", "Coles 4038", "Neumann M49"], "console": "Neve 8078", "tape": "Studer A80", "piano": "Steinway Model B", "drums": "Gretsch USA Custom", "upright_bass": "German carved bass", "horns": "Various vintage saxophones and trumpets"}',
'New York, NY',
'verified'),

-- Studio 7: Punk Rock Garage
(6, 'Distortion Den',
'Raw, unpolished studio perfect for punk, hardcore, and garage rock. Fast turnaround times and an aesthetic that captures the energy and attitude of underground music.',
90,
true,
true,
'{"microphones": ["SM57", "SM58", "Sennheiser MD421"], "amps": ["Marshall JCM800", "Orange OR120", "Ampeg SVT"], "drums": "Ludwig Classic Maple", "recording": "16-track analog", "vibe": "Authentic garage sound"}',
'Detroit, MI',
'verified'),

-- Studio 8: Orchestral Recording Hall
(6, 'Symphony Sound Studios',
'Grand recording hall designed for orchestral and large ensemble recordings. Exceptional acoustics and microphone arrays for capturing the full dynamic range of classical music.',
450,
true,
true,
'{"microphones": ["Schoeps CMIT 5U", "DPA 4006", "Neumann KM 140"], "hall": "Cathedral-like acoustics", "capacity": "80-piece orchestra", "mixing": "Euphonix System 5", "mastering": "TC Electronic System 6000"}',
'Vienna, Austria',
'verified'),

-- Studio 9: Country Music Studio
(6, 'Honky Tonk Studios',
'Traditional country music recording studio with authentic vintage gear and a relaxed atmosphere. Perfect for country, bluegrass, and Americana artists.',
160,
true,
true,
'{"guitars": ["Fender Telecaster", "Gibson SJ-200"], "amps": ["Fender Deluxe Reverb", "Vox AC15"], "steel_guitar": "Emmons Push-Pull", "fiddle": "Antique German violin", "banjo": "Gibson Mastertone", "bass": "Fender Precision"}',
'Nashville, TN',
'verified'),

-- Studio 10: World Music Studio
(6, 'Global Groove Studios',
'Multicultural recording space with instruments and equipment from around the world. Specializing in world music, fusion, and cross-cultural collaborations.',
200,
true,
true,
'{"instruments": ["Gamelan ensemble", "Tabla set", "West African djembes", "Middle Eastern oud", "Indian sitar"], "microphones": ["AKG C414", "Shure Beta 52"], "specialties": "World music recording and production"}',
'Los Angeles, CA',
'verified'),

-- Studio 11: Podcast Production Studio
(6, 'Voice Booth Pro',
'Professional podcast and voice-over recording studio with acoustically treated rooms and broadcast-quality equipment. Perfect for podcasters, audiobook narration, and commercial voice work.',
100,
true,
true,
'{"microphones": ["Electro-Voice RE20", "Shure SM7B", "Neumann TLM 103"], "interface": "RME Fireface 802", "software": "Hindenburg Pro", "treatment": "Professional acoustic treatment", "monitoring": "Sennheiser HD650"}',
'Portland, OR',
'verified'),

-- Studio 12: Metal Recording Studio
(6, 'Iron Temple Studios',
'Heavy metal and hardcore recording facility with high-gain amplifiers and crushing drum sounds. Built for bands that need that brutal, precise metal sound.',
250,
true,
true,
'{"amps": ["Peavey 5150", "Mesa Boogie Dual Rectifier", "Marshall JVM"], "drums": "Tama Starclassic", "microphones": ["Shure SM57", "AKG D112", "Sennheiser 421"], "di": "Radial JDI", "plugins": "Superior Drummer, Axe-FX"}',
'Phoenix, AZ',
'verified'),

-- Studio 13: Reggae Studio
(6, 'Irie Vibes Recording',
'Authentic reggae recording studio with vintage equipment and the right atmosphere for roots, dub, and dancehall music. One love, one sound.',
140,
true,
true,
'{"bass": "Ampeg SVT Classic", "drums": "Slingerland kit", "keyboards": ["Hammond B3", "Fender Rhodes"], "effects": ["Roland Space Echo", "Eventide H3000"], "atmosphere": "Rasta-inspired with natural lighting"}',
'Kingston, Jamaica',
'verified'),

-- Studio 14: Classical Chamber Studio
(6, 'Chamber Music Hall',
'Intimate classical recording studio perfect for chamber music, solo piano, and small ensemble recordings. Exceptional acoustics in a beautiful, inspiring environment.',
300,
true,
true,
'{"piano": "Steinway Concert Grand", "strings": "Professional string quartet", "microphones": ["DPA 4006", "Schoeps CMC 6"], "acoustics": "Natural chamber hall reverb", "capacity": "8-10 musicians"}',
'Prague, Czech Republic',
'verified'),

-- Studio 15: Ambient/Experimental Studio
(6, 'Ethereal Sound Lab',
'Experimental studio specializing in ambient, drone, and avant-garde music. Unique acoustic spaces and unconventional recording techniques for truly innovative sounds.',
180,
true,
true,
'{"spaces": ["Reverb chamber", "Anechoic room", "Echo tunnel"], "instruments": ["Prepared piano", "Crystal bowls", "Modular synthesizers"], "techniques": "Extended recording techniques", "effects": "Custom-built analog processors"}',
'Reykjavik, Iceland',
'verified'),

-- Studio 16: R&B Soul Studio
(6, 'Motown Magic Studios',
'Classic R&B and soul recording studio channeling the golden age of Motown. Vintage equipment and that unmistakable warm, punchy sound.',
220,
true,
true,
'{"console": "Neve 1073", "tape": "Studer A800", "instruments": ["Fender Rhodes", "Hammond B3", "Upright bass"], "microphones": ["Neumann U67", "Coles 4038"], "vibe": "Classic Motown sound"}',
'Detroit, MI',
'verified'),

-- Studio 17: Bluegrass Studio
(6, 'Mountain Music Studio',
'Traditional bluegrass recording studio in the heart of Appalachia. Authentic instruments and a rustic atmosphere perfect for old-time and traditional music.',
110,
true,
true,
'{"instruments": ["Gibson F5 Mandolin", "Martin D-28", "Deering Banjo", "Kay Upright Bass"], "microphones": ["Coles 4038", "Neumann KM84"], "setting": "Rustic mountain cabin", "specialty": "Traditional acoustic recording"}',
'Lexington, KY',
'verified'),

-- Studio 18: Latin Music Studio
(6, 'Ritmo Recording',
'Vibrant Latin music studio specializing in salsa, bachata, reggaeton, and Latin pop. Authentic percussion and the rhythm section to make any track come alive.',
190,
true,
true,
'{"percussion": ["Timbales", "Congas", "Bongos", "Claves"], "brass": "Full Latin horn section", "piano": "Yamaha CP-70", "bass": "Fender Jazz Bass", "specialties": "Latin rhythm section recording"}',
'Miami, FL',
'verified'),

-- Studio 19: Indie Pop Studio
(6, 'Dreamy Pop Studios',
'Bright, airy studio perfect for indie pop, dream pop, and bedroom pop recordings. Vintage synths and reverb tanks create that ethereal, nostalgic sound.',
150,
true,
true,
'{"synthesizers": ["Juno-60", "Prophet-5", "DX7"], "effects": ["Spring reverb tank", "Chorus pedals", "Delay units"], "guitars": ["Jazzmaster", "Rickenbacker 12-string"], "atmosphere": "Dreamy and inspirational"}',
'Montreal, Canada',
'verified'),

-- Studio 20: Film Scoring Studio
(6, 'Cinematic Sound Studios',
'Professional film scoring and post-production facility with orchestral samples and surround sound capabilities. Perfect for film, TV, and game music composition.',
400,
true,
true,
'{"samples": ["Vienna Symphonic Library", "Spitfire Audio", "EastWest Quantum Leap"], "surround": "7.1 surround monitoring", "software": ["Logic Pro", "Cubase", "Pro Tools"], "midi": "Full 88-key controller setup"}',
'Hollywood, CA',
'verified'),

-- Studio 21: Funk Studio
(6, 'Groove Central',
'Funk and disco recording studio with the tightest rhythm section in town. Get your groove on with vintage equipment and that pocket that just won''t quit.',
170,
true,
true,
'{"bass": "Fender Jazz Bass", "drums": "Vintage Ludwig", "keyboards": ["Clavinet", "Minimoog", "Fender Rhodes"], "guitar": "Fender Stratocaster", "vibe": "Classic 70s funk aesthetic"}',
'Minneapolis, MN',
'verified'),

-- Studio 22: Singer-Songwriter Studio
(6, 'Songwriter''s Haven',
'Cozy, intimate studio designed specifically for singer-songwriters and solo artists. Comfortable environment with everything needed for professional acoustic recordings.',
130,
true,
true,
'{"guitar": "Martin D-28", "piano": "Upright piano", "microphones": ["Neumann TLM 103", "AKG C414"], "atmosphere": "Comfortable living room setting", "specialty": "Vocal and acoustic guitar recording"}',
'Boulder, CO',
'verified'),

-- Studio 23: Dub Studio
(6, 'Echo Chamber Dub',
'Authentic dub recording studio with analog delays and spring reverbs. Create those deep, spacey dub mixes with vintage equipment and analog processing.',
160,
true,
true,
'{"delays": ["Roland Space Echo", "Watkins Copicat"], "reverb": "EMT 140 Plate", "console": "Soundcraft 200B", "effects": "Vintage analog outboard", "bass": "Ampeg SVT"}',
'London, UK',
'verified'),

-- Studio 24: Psychedelic Studio
(6, 'Kaleidoscope Studios',
'Far-out psychedelic recording studio with vintage effects and a trippy atmosphere. Perfect for psych rock, shoegaze, and experimental music.',
180,
true,
true,
'{"effects": ["Fuzz pedals", "Phaser", "Reverse reverb"], "instruments": ["Mellotron", "Vintage Rickenbacker"], "amps": ["Hiwatt", "Orange"], "atmosphere": "Colorful and mind-expanding"}',
'San Francisco, CA',
'verified'),

-- Studio 25: Trap Production Studio
(6, 'Trap House Studios',
'Modern trap and hip-hop production studio with the latest software and hardware. 808s that hit hard and crystal-clear high-end for today''s rap and R&B.',
200,
true,
true,
'{"software": ["FL Studio", "Ableton Live"], "controllers": ["Akai MPC Live", "Native Instruments Maschine"], "monitors": ["Genelec 8040", "Yamaha NS-10"], "808": "TR-808 hardware", "processing": "UAD Apollo interface"}',
'Charlotte, NC',
'verified'),

-- Studio 26: Alternative Rock Studio
(6, 'Grunge Garden Studios',
'Gritty alternative rock studio perfect for indie, grunge, and alternative music. Raw sound with the character and grit that defines the genre.',
140,
true,
true,
'{"amps": ["Fender Twin Reverb", "Marshall JCM900"], "pedals": ["Big Muff", "Boss DS-1"], "drums": "Pearl Export", "bass": "Rickenbacker 4003", "aesthetic": "Raw, unpolished alternative sound"}',
'Seattle, WA',
'verified'),

-- Studio 27: New Age/Meditation Studio
(6, 'Serenity Sound Studio',
'Peaceful recording studio specializing in new age, meditation, and healing music. Instruments from around the world in a tranquil, spiritual setting.',
120,
true,
true,
'{"instruments": ["Crystal bowls", "Tibetan singing bowls", "Native American flutes", "Hang drum"], "atmosphere": "Peaceful and meditative", "acoustics": "Natural reverb", "specialty": "Healing and meditation music"}',
'Sedona, AZ',
'verified'),

-- Studio 28: House Music Studio
(6, 'Underground House Lab',
'Electronic dance music studio specializing in house, techno, and electronic production. Club-quality sound system and the tools to make people move.',
210,
true,
true,
'{"software": ["Ableton Live", "Logic Pro"], "synthesizers": ["TR-909", "TB-303", "Juno-106"], "monitors": ["Funktion-One", "KRK VXT8"], "club_system": "Full PA for club-level monitoring"}',
'Ibiza, Spain',
'verified'),

-- Studio 29: Classical Guitar Studio
(6, 'Nylon String Studios',
'Specialized classical guitar recording studio with perfect acoustics for nylon-string instruments. Solo guitar, duets, and classical ensembles.',
140,
true,
true,
'{"guitars": ["Concert classical guitars", "Flamenco guitars"], "microphones": ["DPA 4006", "Neumann KM 184"], "acoustics": "Optimized for classical guitar", "specialty": "Classical and flamenco guitar recording"}',
'Seville, Spain',
'verified'),

-- Studio 30: Vintage Recording Studio
(6, 'Time Machine Studios',
'All-analog vintage recording studio with equipment from the golden age of recording. Tape machines, tube preamps, and that classic vintage sound.',
320,
true,
true,
'{"tape": "Studer A80 24-track", "console": "API 1608", "preamps": ["Neve 1073", "API 512c"], "compressors": ["1176", "LA-2A"], "microphones": ["Neumann U47", "RCA 44"], "philosophy": "All-analog signal path"}',
'Abbey Road, London',
'verified');

-- Now let's add some studio amenities associations
-- Get the amenity IDs first, then associate random amenities with studios

DO $$
DECLARE
    studio_rec RECORD;
    amenity_rec RECORD;
    amenity_ids INTEGER[];
    selected_amenities INTEGER[];
    i INTEGER;
    num_amenities INTEGER;
BEGIN
    -- Get all amenity IDs
    SELECT ARRAY(SELECT id FROM amenities ORDER BY id) INTO amenity_ids;
    
    -- For each studio, assign 3-8 random amenities
    FOR studio_rec IN SELECT id FROM studios WHERE owner_id = 6 LOOP
        -- Randomly select 3-8 amenities
        num_amenities := 3 + floor(random() * 6);
        selected_amenities := '{}';
        
        -- Pick random amenities
        FOR i IN 1..num_amenities LOOP
            selected_amenities := array_append(selected_amenities, 
                amenity_ids[1 + floor(random() * array_length(amenity_ids, 1))]);
        END LOOP;
        
        -- Remove duplicates
        selected_amenities := ARRAY(SELECT DISTINCT unnest(selected_amenities));
        
        -- Insert studio amenities
        FOR i IN 1..array_length(selected_amenities, 1) LOOP
            INSERT INTO studio_amenities (studio_id, amenity_id) 
            VALUES (studio_rec.id, selected_amenities[i])
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Final summary
SELECT 
    COUNT(*) as total_studios_created,
    AVG(hourly_rate) as average_hourly_rate,
    MIN(hourly_rate) as min_rate,
    MAX(hourly_rate) as max_rate
FROM studios 
WHERE owner_id = 6; 