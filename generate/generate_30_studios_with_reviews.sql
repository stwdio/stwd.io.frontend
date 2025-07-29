-- Studio Generation Script with Reviews for stwd.io
-- Run this in the Supabase SQL Editor to generate 30 studios with distributed ownership and reviews
-- Owner distribution: 10 studios to Luke (ID: 3), 10 to Chantal (ID: 4), 10 to Adam (ID: 5)

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

-- Generate 30 Studios with distributed ownership
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
-- Luke's Studios (10 studios - IDs will start from current max + 1)
(3, 'Sonic Sanctuary Studios', 
'State-of-the-art recording facility featuring world-class equipment and acoustics. Perfect for professional recording, mixing, and mastering. Our main live room accommodates full bands with isolation booths for vocals and instruments.',
350,
true,
true,
'{"microphones": ["Neumann U87", "AKG C414", "Shure SM57", "Royer R-121"], "preamps": ["Neve 1073", "API 512c", "Universal Audio 610"], "monitors": ["Yamaha NS-10M", "Genelec 1031A"], "console": "SSL AWS 948", "daw": "Pro Tools HDX", "outboard": ["1176 Compressor", "LA-2A", "Pultec EQP-1A"], "instruments": ["Steinway Grand Piano", "Vintage Fender Rhodes", "Hammond B3"]}',
'Nashville, TN',
'verified'),

(3, 'Reverb Room Recording',
'Vintage-inspired studio specializing in indie rock, alternative, and experimental music. Our analog workflow and classic gear create that warm, authentic sound that digital just can''t replicate.',
200,
true,
true,
'{"microphones": ["Coles 4038", "RCA 44", "Electro-Voice RE20"], "preamps": ["Chandler Limited TG2", "Great River MP-500NV"], "console": "Neve VR60", "tape": "Studer A827 24-track", "guitars": ["1959 Les Paul", "Fender Telecaster"], "amps": ["Marshall Plexi", "Fender Twin Reverb", "Vox AC30"]}',
'Austin, TX',
'verified'),

(3, 'Beat Lab Studios',
'Modern hip-hop and R&B production facility with cutting-edge digital tools and a massive sample library. Full MIDI setup with vintage synths and drum machines for that authentic boom-bap sound.',
180,
true,
true,
'{"daw": "Logic Pro X", "monitors": ["KRK V8", "Yamaha HS8"], "keyboards": ["Akai MPC 2000XL", "Roland Jupiter-8", "Moog Minimoog"], "mics": ["Sony C-37A", "Neumann TLM 103"], "software": ["Kontakt", "Omnisphere", "Serum"], "drums": "TR-808 & TR-909"}',
'Atlanta, GA',
'verified'),

(3, 'Whispering Pines Acoustic',
'Intimate acoustic recording space nestled in a converted barn. Perfect for singer-songwriters, folk artists, and acoustic ensembles. Natural reverb and organic acoustics.',
120,
true,
true,
'{"microphones": ["Neumann KM184", "AKG C12", "Coles 4038"], "preamps": ["Millennia HV-3D", "Grace M101"], "instruments": ["Martin D-28", "Gibson J-45", "Taylor 814ce"], "ambience": "Natural room acoustics", "specialty": "Acoustic guitar and vocal recording"}',
'Asheville, NC',
'verified'),

(3, 'Synthesis Station',
'Electronic music production paradise with an extensive modular synth setup and drum machines. Specializing in techno, house, ambient, and experimental electronic music.',
220,
true,
true,
'{"synthesizers": ["Moog Modular", "Buchla Music Easel", "Oberheim Matrix 1000"], "drum_machines": ["TR-909", "TR-808", "LinnDrum"], "sequencers": ["Elektron Octatrack", "Cirklon"], "effects": ["Eventide H9000", "Lexicon 480L"], "daw": "Ableton Live Suite"}',
'Berlin, Germany',
'verified'),

(3, 'Blue Note Recordings',
'Classic jazz recording studio with pristine acoustics and vintage equipment. Perfect for jazz ensembles, big bands, and acoustic performances. Live room accommodates up to 20 musicians.',
280,
true,
true,
'{"microphones": ["RCA 44", "Coles 4038", "Neumann M49"], "console": "Neve 8078", "tape": "Studer A80", "piano": "Steinway Model B", "drums": "Gretsch USA Custom", "upright_bass": "German carved bass", "horns": "Various vintage saxophones and trumpets"}',
'New York, NY',
'verified'),

(3, 'Distortion Den',
'Raw, unpolished studio perfect for punk, hardcore, and garage rock. Fast turnaround times and an aesthetic that captures the energy and attitude of underground music.',
90,
true,
true,
'{"microphones": ["SM57", "SM58", "Sennheiser MD421"], "amps": ["Marshall JCM800", "Orange OR120", "Ampeg SVT"], "drums": "Ludwig Classic Maple", "recording": "16-track analog", "vibe": "Authentic garage sound"}',
'Detroit, MI',
'verified'),

(3, 'Symphony Sound Studios',
'Grand recording hall designed for orchestral and large ensemble recordings. Exceptional acoustics and microphone arrays for capturing the full dynamic range of classical music.',
450,
true,
true,
'{"microphones": ["Schoeps CMIT 5U", "DPA 4006", "Neumann KM 140"], "hall": "Cathedral-like acoustics", "capacity": "80-piece orchestra", "mixing": "Euphonix System 5", "mastering": "TC Electronic System 6000"}',
'Vienna, Austria',
'verified'),

(3, 'Honky Tonk Studios',
'Traditional country music recording studio with authentic vintage gear and a relaxed atmosphere. Perfect for country, bluegrass, and Americana artists.',
160,
true,
true,
'{"guitars": ["Fender Telecaster", "Gibson SJ-200"], "amps": ["Fender Deluxe Reverb", "Vox AC15"], "steel_guitar": "Emmons Push-Pull", "fiddle": "Antique German violin", "banjo": "Gibson Mastertone", "bass": "Fender Precision"}',
'Nashville, TN',
'verified'),

(3, 'Global Groove Studios',
'Multicultural recording space with instruments and equipment from around the world. Specializing in world music, fusion, and cross-cultural collaborations.',
200,
true,
true,
'{"instruments": ["Gamelan ensemble", "Tabla set", "West African djembes", "Middle Eastern oud", "Indian sitar"], "microphones": ["AKG C414", "Shure Beta 52"], "specialties": "World music recording and production"}',
'Los Angeles, CA',
'verified'),

-- Chantal's Studios (10 studios)
(4, 'Voice Booth Pro',
'Professional podcast and voice-over recording studio with acoustically treated rooms and broadcast-quality equipment. Perfect for podcasters, audiobook narration, and commercial voice work.',
100,
true,
true,
'{"microphones": ["Electro-Voice RE20", "Shure SM7B", "Neumann TLM 103"], "interface": "RME Fireface 802", "software": "Hindenburg Pro", "treatment": "Professional acoustic treatment", "monitoring": "Sennheiser HD650"}',
'Portland, OR',
'verified'),

(4, 'Iron Temple Studios',
'Heavy metal and hardcore recording facility with high-gain amplifiers and crushing drum sounds. Built for bands that need that brutal, precise metal sound.',
250,
true,
true,
'{"amps": ["Peavey 5150", "Mesa Boogie Dual Rectifier", "Marshall JVM"], "drums": "Tama Starclassic", "microphones": ["Shure SM57", "AKG D112", "Sennheiser 421"], "di": "Radial JDI", "plugins": "Superior Drummer, Axe-FX"}',
'Phoenix, AZ',
'verified'),

(4, 'Irie Vibes Recording',
'Authentic reggae recording studio with vintage equipment and the right atmosphere for roots, dub, and dancehall music. One love, one sound.',
140,
true,
true,
'{"bass": "Ampeg SVT Classic", "drums": "Slingerland kit", "keyboards": ["Hammond B3", "Fender Rhodes"], "effects": ["Roland Space Echo", "Eventide H3000"], "atmosphere": "Rasta-inspired with natural lighting"}',
'Kingston, Jamaica',
'verified'),

(4, 'Chamber Music Hall',
'Intimate classical recording studio perfect for chamber music, solo piano, and small ensemble recordings. Exceptional acoustics in a beautiful, inspiring environment.',
300,
true,
true,
'{"piano": "Steinway Concert Grand", "strings": "Professional string quartet", "microphones": ["DPA 4006", "Schoeps CMC 6"], "acoustics": "Natural chamber hall reverb", "capacity": "8-10 musicians"}',
'Prague, Czech Republic',
'verified'),

(4, 'Ethereal Sound Lab',
'Experimental studio specializing in ambient, drone, and avant-garde music. Unique acoustic spaces and unconventional recording techniques for truly innovative sounds.',
180,
true,
true,
'{"spaces": ["Reverb chamber", "Anechoic room", "Echo tunnel"], "instruments": ["Prepared piano", "Crystal bowls", "Modular synthesizers"], "techniques": "Extended recording techniques", "effects": "Custom-built analog processors"}',
'Reykjavik, Iceland',
'verified'),

(4, 'Motown Magic Studios',
'Classic R&B and soul recording studio channeling the golden age of Motown. Vintage equipment and that unmistakable warm, punchy sound.',
220,
true,
true,
'{"console": "Neve 1073", "tape": "Studer A800", "instruments": ["Fender Rhodes", "Hammond B3", "Upright bass"], "microphones": ["Neumann U67", "Coles 4038"], "vibe": "Classic Motown sound"}',
'Detroit, MI',
'verified'),

(4, 'Mountain Music Studio',
'Traditional bluegrass recording studio in the heart of Appalachia. Authentic instruments and a rustic atmosphere perfect for old-time and traditional music.',
110,
true,
true,
'{"instruments": ["Gibson F5 Mandolin", "Martin D-28", "Deering Banjo", "Kay Upright Bass"], "microphones": ["Coles 4038", "Neumann KM84"], "setting": "Rustic mountain cabin", "specialty": "Traditional acoustic recording"}',
'Lexington, KY',
'verified'),

(4, 'Ritmo Recording',
'Vibrant Latin music studio specializing in salsa, bachata, reggaeton, and Latin pop. Authentic percussion and the rhythm section to make any track come alive.',
190,
true,
true,
'{"percussion": ["Timbales", "Congas", "Bongos", "Claves"], "brass": "Full Latin horn section", "piano": "Yamaha CP-70", "bass": "Fender Jazz Bass", "specialties": "Latin rhythm section recording"}',
'Miami, FL',
'verified'),

(4, 'Dreamy Pop Studios',
'Bright, airy studio perfect for indie pop, dream pop, and bedroom pop recordings. Vintage synths and reverb tanks create that ethereal, nostalgic sound.',
150,
true,
true,
'{"synthesizers": ["Juno-60", "Prophet-5", "DX7"], "effects": ["Spring reverb tank", "Chorus pedals", "Delay units"], "guitars": ["Jazzmaster", "Rickenbacker 12-string"], "atmosphere": "Dreamy and inspirational"}',
'Montreal, Canada',
'verified'),

(4, 'Cinematic Sound Studios',
'Professional film scoring and post-production facility with orchestral samples and surround sound capabilities. Perfect for film, TV, and game music composition.',
400,
true,
true,
'{"samples": ["Vienna Symphonic Library", "Spitfire Audio", "EastWest Quantum Leap"], "surround": "7.1 surround monitoring", "software": ["Logic Pro", "Cubase", "Pro Tools"], "midi": "Full 88-key controller setup"}',
'Hollywood, CA',
'verified'),

-- Adam's Studios (10 studios)
(5, 'Groove Central',
'Funk and disco recording studio with the tightest rhythm section in town. Get your groove on with vintage equipment and that pocket that just won''t quit.',
170,
true,
true,
'{"bass": "Fender Jazz Bass", "drums": "Vintage Ludwig", "keyboards": ["Clavinet", "Minimoog", "Fender Rhodes"], "guitar": "Fender Stratocaster", "vibe": "Classic 70s funk aesthetic"}',
'Minneapolis, MN',
'verified'),

(5, 'Songwriter''s Haven',
'Cozy, intimate studio designed specifically for singer-songwriters and solo artists. Comfortable environment with everything needed for professional acoustic recordings.',
130,
true,
true,
'{"guitar": "Martin D-28", "piano": "Upright piano", "microphones": ["Neumann TLM 103", "AKG C414"], "atmosphere": "Comfortable living room setting", "specialty": "Vocal and acoustic guitar recording"}',
'Boulder, CO',
'verified'),

(5, 'Echo Chamber Dub',
'Authentic dub recording studio with analog delays and spring reverbs. Create those deep, spacey dub mixes with vintage equipment and analog processing.',
160,
true,
true,
'{"delays": ["Roland Space Echo", "Watkins Copicat"], "reverb": "EMT 140 Plate", "console": "Soundcraft 200B", "effects": "Vintage analog outboard", "bass": "Ampeg SVT"}',
'London, UK',
'verified'),

(5, 'Kaleidoscope Studios',
'Far-out psychedelic recording studio with vintage effects and a trippy atmosphere. Perfect for psych rock, shoegaze, and experimental music.',
180,
true,
true,
'{"effects": ["Fuzz pedals", "Phaser", "Reverse reverb"], "instruments": ["Mellotron", "Vintage Rickenbacker"], "amps": ["Hiwatt", "Orange"], "atmosphere": "Colorful and mind-expanding"}',
'San Francisco, CA',
'verified'),

(5, 'Trap House Studios',
'Modern trap and hip-hop production studio with the latest software and hardware. 808s that hit hard and crystal-clear high-end for today''s rap and R&B.',
200,
true,
true,
'{"software": ["FL Studio", "Ableton Live"], "controllers": ["Akai MPC Live", "Native Instruments Maschine"], "monitors": ["Genelec 8040", "Yamaha NS-10"], "808": "TR-808 hardware", "processing": "UAD Apollo interface"}',
'Charlotte, NC',
'verified'),

(5, 'Grunge Garden Studios',
'Gritty alternative rock studio perfect for indie, grunge, and alternative music. Raw sound with the character and grit that defines the genre.',
140,
true,
true,
'{"amps": ["Fender Twin Reverb", "Marshall JCM900"], "pedals": ["Big Muff", "Boss DS-1"], "drums": "Pearl Export", "bass": "Rickenbacker 4003", "aesthetic": "Raw, unpolished alternative sound"}',
'Seattle, WA',
'verified'),

(5, 'Serenity Sound Studio',
'Peaceful recording studio specializing in new age, meditation, and healing music. Instruments from around the world in a tranquil, spiritual setting.',
120,
true,
true,
'{"instruments": ["Crystal bowls", "Tibetan singing bowls", "Native American flutes", "Hang drum"], "atmosphere": "Peaceful and meditative", "acoustics": "Natural reverb", "specialty": "Healing and meditation music"}',
'Sedona, AZ',
'verified'),

(5, 'Underground House Lab',
'Electronic dance music studio specializing in house, techno, and electronic production. Club-quality sound system and the tools to make people move.',
210,
true,
true,
'{"software": ["Ableton Live", "Logic Pro"], "synthesizers": ["TR-909", "TB-303", "Juno-106"], "monitors": ["Funktion-One", "KRK VXT8"], "club_system": "Full PA for club-level monitoring"}',
'Ibiza, Spain',
'verified'),

(5, 'Nylon String Studios',
'Specialized classical guitar recording studio with perfect acoustics for nylon-string instruments. Solo guitar, duets, and classical ensembles.',
140,
true,
true,
'{"guitars": ["Concert classical guitars", "Flamenco guitars"], "microphones": ["DPA 4006", "Neumann KM 184"], "acoustics": "Optimized for classical guitar", "specialty": "Classical and flamenco guitar recording"}',
'Seville, Spain',
'verified'),

(5, 'Time Machine Studios',
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
    
    -- For each new studio, assign 3-8 random amenities
    FOR studio_rec IN SELECT id FROM studios WHERE owner_id IN (3, 4, 5) LOOP
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

-- Now add reviews for all the studios
-- This creates reviews tied to the studios with NULL booking_id (standalone reviews)
INSERT INTO reviews (booking_id, rating, comment, created_at, updated_at)
VALUES 
-- Reviews for Luke's Studios (owner_id = 3)
-- Sonic Sanctuary Studios - Premium studio, mostly good reviews
(NULL, 5, 'Absolutely incredible studio! The SSL console sounds amazing and the acoustics are perfect. The team here really knows their stuff. Recorded our entire album here and couldn''t be happier.', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
(NULL, 4, 'Great facilities and professional setup. The main live room has excellent acoustics. Only minor complaint is the parking situation, but the quality makes up for it.', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
(NULL, 5, 'World-class recording experience. The Neumann mics and vintage outboard gear gave our tracks that professional polish we were looking for. Will definitely be back.', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
(NULL, 3, 'Good studio but quite expensive. The gear is top-notch but felt a bit rushed during our session. Maybe we needed to book more time.', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days'),

-- Reverb Room Recording - Indie rock, mixed reviews
(NULL, 5, 'Perfect for indie rock! The vintage gear and analog workflow created exactly the sound we wanted. The Neve console is magic. Highly recommend for any rock band.', NOW() - INTERVAL '67 days', NOW() - INTERVAL '67 days'),
(NULL, 2, 'The aesthetic is cool but some of the equipment feels outdated. Had issues with the tape machine during our session. Staff was helpful but it caused delays.', NOW() - INTERVAL '34 days', NOW() - INTERVAL '34 days'),
(NULL, 4, 'Love the vintage vibe and the sound quality is solid. Great for that warm, analog sound. The engineer was knowledgeable and helpful.', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
(NULL, 3, 'Decent studio for the price. The rooms are a bit small for a full band but the sound is good. Would work better for smaller projects.', NOW() - INTERVAL '56 days', NOW() - INTERVAL '56 days'),

-- Beat Lab Studios - Hip-hop, mostly positive
(NULL, 5, 'Best hip-hop studio in the city! The beats sound crisp and the MPC setup is perfect. Engineer really understood the vibe we were going for.', NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days'),
(NULL, 4, 'Great production setup with all the right software and hardware. The monitor speakers are fantastic. Only wish the booth was a bit bigger.', NOW() - INTERVAL '41 days', NOW() - INTERVAL '41 days'),
(NULL, 5, 'Incredible studio for hip-hop and R&B. The sample library is extensive and the mixing setup is perfect. Produced our entire EP here.', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
(NULL, 4, 'Professional setup with modern equipment. The 808s hit hard and the high-end is crystal clear. Good value for money.', NOW() - INTERVAL '62 days', NOW() - INTERVAL '62 days'),

-- Whispering Pines Acoustic - Acoustic, good but some concerns
(NULL, 4, 'Beautiful acoustic space with natural reverb. Perfect for singer-songwriter material. The converted barn setting is inspiring and unique.', NOW() - INTERVAL '73 days', NOW() - INTERVAL '73 days'),
(NULL, 3, 'Nice acoustic sound but the location is quite remote. The drive was longer than expected. Sound quality is good for acoustic instruments.', NOW() - INTERVAL '38 days', NOW() - INTERVAL '38 days'),
(NULL, 5, 'Magical atmosphere for acoustic recording. The natural acoustics of the barn are incredible. Our folk album sounds amazing. Highly recommend!', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
(NULL, 2, 'While the acoustic sound is good, the facilities are pretty basic. Limited amenities and the remote location makes it inconvenient.', NOW() - INTERVAL '51 days', NOW() - INTERVAL '51 days'),

-- Synthesis Station - Electronic, enthusiastic reviews
(NULL, 5, 'Electronic music paradise! The modular setup is incredible and the synth collection is mind-blowing. Perfect for experimental electronic music.', NOW() - INTERVAL '86 days', NOW() - INTERVAL '86 days'),
(NULL, 4, 'Amazing collection of synthesizers and drum machines. The Ableton Live setup is perfect for electronic production. Great creative environment.', NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days'),
(NULL, 5, 'Unreal electronic music studio. The Moog modular system is a dream to work with. Created some of our best tracks here.', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
(NULL, 4, 'Great for electronic music production. The synthesizer collection is extensive. Would have liked more studio time to explore all the gear.', NOW() - INTERVAL '59 days', NOW() - INTERVAL '59 days'),

-- Blue Note Recordings - Jazz, high quality
(NULL, 5, 'Classic jazz recording at its finest. The acoustics are perfect for large ensembles and the vintage equipment captures that authentic jazz sound.', NOW() - INTERVAL '91 days', NOW() - INTERVAL '91 days'),
(NULL, 4, 'Excellent jazz recording facility. The live room accommodates our 12-piece band perfectly. The Steinway piano sounds incredible.', NOW() - INTERVAL '33 days', NOW() - INTERVAL '33 days'),
(NULL, 5, 'Professional jazz recording experience. The vintage microphones and analog console create that classic Blue Note sound. Absolutely perfect.', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days'),
(NULL, 4, 'High-quality jazz studio with great acoustics. The only downside is the premium pricing, but you get what you pay for.', NOW() - INTERVAL '68 days', NOW() - INTERVAL '68 days'),

-- Distortion Den - Punk rock, mixed feelings
(NULL, 4, 'Perfect punk rock vibe! Raw and unpolished sound that captures the energy perfectly. Fast turnaround and affordable rates.', NOW() - INTERVAL '44 days', NOW() - INTERVAL '44 days'),
(NULL, 2, 'The aesthetic is cool but the equipment feels a bit worn. Had some technical issues during recording. Good for demo work but not final masters.', NOW() - INTERVAL '76 days', NOW() - INTERVAL '76 days'),
(NULL, 3, 'Good for punk and hardcore. The sound is appropriately raw but some of the gear needs maintenance. Staff attitude matches the punk vibe!', NOW() - INTERVAL '31 days', NOW() - INTERVAL '31 days'),
(NULL, 5, 'Exactly what we wanted for our punk album! The raw sound and garage aesthetic is perfect. No frills, just pure punk energy.', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),

-- Symphony Sound Studios - Orchestral, premium
(NULL, 5, 'Absolutely stunning orchestral recording space. The hall acoustics are incredible and the microphone arrays capture every nuance. Worth every penny.', NOW() - INTERVAL '95 days', NOW() - INTERVAL '95 days'),
(NULL, 4, 'Professional orchestral recording facility. The sound quality is exceptional but the booking process was quite lengthy. Results are worth it.', NOW() - INTERVAL '37 days', NOW() - INTERVAL '37 days'),
(NULL, 5, 'World-class orchestral recording. The acoustics rival famous concert halls. Our symphony recording sounds absolutely magnificent.', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
(NULL, 3, 'Great sound quality but very expensive. The facility is impressive but budget-conscious projects might struggle with the rates.', NOW() - INTERVAL '64 days', NOW() - INTERVAL '64 days'),

-- Honky Tonk Studios - Country, good vibes
(NULL, 4, 'Authentic country music studio with great vintage gear. The steel guitar sounds incredible and the atmosphere is perfect for country recording.', NOW() - INTERVAL '48 days', NOW() - INTERVAL '48 days'),
(NULL, 3, 'Good country recording setup but the rooms are a bit small. The vintage equipment sounds great but some pieces need calibration.', NOW() - INTERVAL '82 days', NOW() - INTERVAL '82 days'),
(NULL, 5, 'Perfect for country and bluegrass! The authentic vintage gear and relaxed atmosphere helped us create our best album yet.', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
(NULL, 4, 'Great country music facility. The Telecaster and steel guitar sound amazing. Would recommend for any country or Americana project.', NOW() - INTERVAL '58 days', NOW() - INTERVAL '58 days'),

-- Global Groove Studios - World music, unique
(NULL, 5, 'Incredible world music studio! The instrument collection is amazing and the multicultural approach is refreshing. Perfect for fusion projects.', NOW() - INTERVAL '71 days', NOW() - INTERVAL '71 days'),
(NULL, 4, 'Unique studio with instruments from around the world. Great for experimental and world music. The gamelan ensemble is particularly impressive.', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
(NULL, 3, 'Interesting concept but some of the world instruments need maintenance. The variety is impressive but quality varies by instrument.', NOW() - INTERVAL '87 days', NOW() - INTERVAL '87 days'),
(NULL, 4, 'Great for world music recording. The cultural diversity of instruments opens up creative possibilities. Professional recording quality.', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days'),

-- Reviews for Chantal's Studios (owner_id = 4)
-- Voice Booth Pro - Podcast/voice, practical
(NULL, 4, 'Perfect for podcast recording. The acoustic treatment is excellent and the broadcast-quality equipment produces professional results.', NOW() - INTERVAL '52 days', NOW() - INTERVAL '52 days'),
(NULL, 3, 'Good for voice-over work but the booking system is a bit clunky. Sound quality is solid for podcast and narration projects.', NOW() - INTERVAL '79 days', NOW() - INTERVAL '79 days'),
(NULL, 5, 'Excellent podcast studio! The acoustics are perfect for voice work and the equipment is professional grade. Great for audiobook recording.', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
(NULL, 4, 'Professional voice recording facility. The sound isolation is excellent and the monitoring setup is comfortable for long sessions.', NOW() - INTERVAL '61 days', NOW() - INTERVAL '61 days'),

-- Iron Temple Studios - Metal, intense
(NULL, 5, 'Brutal metal recording! The high-gain amps and crushing drum sounds are perfect for extreme metal. The engineer really gets the genre.', NOW() - INTERVAL '42 days', NOW() - INTERVAL '42 days'),
(NULL, 4, 'Great metal recording facility. The Peavey 5150 sounds incredible and the drum room has that tight, aggressive sound we wanted.', NOW() - INTERVAL '75 days', NOW() - INTERVAL '75 days'),
(NULL, 3, 'Good for metal but the rooms are quite loud. The sound is heavy and aggressive as expected. Would recommend ear protection even in control room.', NOW() - INTERVAL '36 days', NOW() - INTERVAL '36 days'),
(NULL, 5, 'Perfect for heavy metal and hardcore. The equipment is dialed in for extreme music and the final mix sounds absolutely crushing.', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'),

-- Irie Vibes Recording - Reggae, laid back
(NULL, 4, 'Authentic reggae studio with great vintage equipment. The atmosphere is perfect and the basslines sound incredible through the SVT.', NOW() - INTERVAL '66 days', NOW() - INTERVAL '66 days'),
(NULL, 3, 'Good reggae recording setup but the pace is very laid back. If you''re in a hurry, this might not be the place. Great sound though.', NOW() - INTERVAL '89 days', NOW() - INTERVAL '89 days'),
(NULL, 5, 'Perfect reggae recording experience! The vintage equipment and Rasta-inspired atmosphere created the perfect vibe for our album.', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'),
(NULL, 4, 'Great for reggae and dub music. The Space Echo sounds amazing and the whole vibe is very authentic. One love!', NOW() - INTERVAL '57 days', NOW() - INTERVAL '57 days'),

-- Chamber Music Hall - Classical chamber, refined
(NULL, 5, 'Exquisite chamber music recording space. The Steinway Concert Grand is magnificent and the acoustics are perfect for intimate classical music.', NOW() - INTERVAL '93 days', NOW() - INTERVAL '93 days'),
(NULL, 4, 'Beautiful classical recording facility. The string quartet sounds incredible in this space. Professional recording quality throughout.', NOW() - INTERVAL '39 days', NOW() - INTERVAL '39 days'),
(NULL, 5, 'Perfect for chamber music and solo piano. The natural acoustics and beautiful setting inspire great performances. Highly recommended.', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
(NULL, 3, 'Good classical recording but very formal atmosphere. The sound quality is excellent but the environment can feel a bit stiff.', NOW() - INTERVAL '70 days', NOW() - INTERVAL '70 days'),

-- Ethereal Sound Lab - Experimental, weird
(NULL, 4, 'Fascinating experimental studio! The unique spaces and unconventional techniques opened up creative possibilities we never imagined.', NOW() - INTERVAL '84 days', NOW() - INTERVAL '84 days'),
(NULL, 2, 'Very experimental but maybe too weird for practical recording. The reverb chamber is cool but the setup is confusing.', NOW() - INTERVAL '77 days', NOW() - INTERVAL '77 days'),
(NULL, 5, 'Incredible experimental studio for ambient and drone music. The prepared piano and crystal bowls create otherworldly sounds.', NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days'),
(NULL, 3, 'Interesting for experimental music but not suitable for conventional recording. The unique spaces are cool but hard to work with.', NOW() - INTERVAL '63 days', NOW() - INTERVAL '63 days'),

-- Motown Magic Studios - R&B soul, nostalgic
(NULL, 5, 'Classic Motown sound at its finest! The vintage equipment and warm, punchy sound transported us back to the golden age of soul.', NOW() - INTERVAL '46 days', NOW() - INTERVAL '46 days'),
(NULL, 4, 'Great R&B recording facility. The Fender Rhodes sounds incredible and the overall vibe is very authentic. Professional results.', NOW() - INTERVAL '81 days', NOW() - INTERVAL '81 days'),
(NULL, 5, 'Perfect for soul and R&B music. The vintage gear and classic sound helped us create our best tracks. Pure Motown magic!', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days'),
(NULL, 4, 'Excellent soul recording studio. The Hammond B3 is particularly impressive. Great for capturing that classic R&B sound.', NOW() - INTERVAL '69 days', NOW() - INTERVAL '69 days'),

-- Mountain Music Studio - Bluegrass, rustic
(NULL, 4, 'Authentic bluegrass recording in a beautiful mountain setting. The acoustic instruments sound incredible and the atmosphere is perfect.', NOW() - INTERVAL '54 days', NOW() - INTERVAL '54 days'),
(NULL, 3, 'Good bluegrass studio but very rustic. The mountain location is beautiful but facilities are basic. Sound quality is solid for acoustic music.', NOW() - INTERVAL '88 days', NOW() - INTERVAL '88 days'),
(NULL, 5, 'Perfect for traditional bluegrass and old-time music. The authentic instruments and mountain cabin setting create the perfect atmosphere.', NOW() - INTERVAL '32 days', NOW() - INTERVAL '32 days'),
(NULL, 2, 'While the acoustic sound is good, the facilities are too basic. Limited amenities and the rustic approach goes too far.', NOW() - INTERVAL '74 days', NOW() - INTERVAL '74 days'),

-- Ritmo Recording - Latin, energetic
(NULL, 5, 'Incredible Latin music studio! The percussion section is amazing and the horn arrangements sound fantastic. Perfect for salsa and Latin pop.', NOW() - INTERVAL '49 days', NOW() - INTERVAL '49 days'),
(NULL, 4, 'Great Latin recording facility. The rhythm section is tight and the brass section sounds incredible. Professional Latin music production.', NOW() - INTERVAL '78 days', NOW() - INTERVAL '78 days'),
(NULL, 4, 'Perfect for Latin music recording. The congas and timbales sound amazing and the overall energy is infectious. ¡Muy bueno!', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
(NULL, 3, 'Good for Latin music but the sessions can get quite loud and energetic. Great musicians but might be overwhelming for some.', NOW() - INTERVAL '65 days', NOW() - INTERVAL '65 days'),

-- Dreamy Pop Studios - Indie pop, atmospheric
(NULL, 4, 'Perfect indie pop studio! The vintage synths and reverb tanks create that dreamy, nostalgic sound we were looking for.', NOW() - INTERVAL '53 days', NOW() - INTERVAL '53 days'),
(NULL, 3, 'Good for indie pop but the aesthetic sometimes overshadows the technical aspects. The Juno-60 sounds great though.', NOW() - INTERVAL '85 days', NOW() - INTERVAL '85 days'),
(NULL, 5, 'Incredible dream pop recording experience! The atmosphere is inspiring and the vintage equipment creates that perfect ethereal sound.', NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days'),
(NULL, 4, 'Great for indie pop and bedroom pop. The spring reverb and chorus pedals create that perfect dreamy atmosphere.', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),

-- Cinematic Sound Studios - Film scoring, professional
(NULL, 5, 'Professional film scoring facility with incredible orchestral samples and surround sound. Perfect for cinematic music production.', NOW() - INTERVAL '96 days', NOW() - INTERVAL '96 days'),
(NULL, 4, 'Great for film and game music. The Vienna Symphonic Library sounds incredible and the surround monitoring is professional grade.', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
(NULL, 5, 'Perfect for cinematic music production. The orchestral samples and surround sound capabilities are exactly what we needed for our film score.', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
(NULL, 4, 'Professional film scoring studio. The sample libraries are extensive and the surround sound setup is impressive. Great for media music.', NOW() - INTERVAL '72 days', NOW() - INTERVAL '72 days'),

-- Reviews for Adam's Studios (owner_id = 5)
-- Groove Central - Funk, tight
(NULL, 5, 'Funk perfection! The rhythm section is incredibly tight and the vintage equipment captures that classic 70s funk sound perfectly.', NOW() - INTERVAL '47 days', NOW() - INTERVAL '47 days'),
(NULL, 4, 'Great funk recording studio. The bass guitar sounds incredible and the overall groove is infectious. Perfect for funk and disco.', NOW() - INTERVAL '83 days', NOW() - INTERVAL '83 days'),
(NULL, 4, 'Perfect for funk recording. The clavinet and minimoog sound amazing and the rhythm section is incredibly tight.', NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days'),
(NULL, 3, 'Good funk studio but the sessions can be intense. The musicians are great but the perfectionist approach can be stressful.', NOW() - INTERVAL '67 days', NOW() - INTERVAL '67 days'),

-- Songwriter's Haven - Singer-songwriter, cozy
(NULL, 4, 'Perfect intimate studio for singer-songwriters. The cozy atmosphere and acoustic setup make it easy to capture authentic performances.', NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days'),
(NULL, 3, 'Good for solo work but the space is quite small. The acoustic sound is nice but limited for full band recordings.', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days'),
(NULL, 5, 'Incredible singer-songwriter studio! The comfortable environment and acoustic setup helped me record my most personal songs.', NOW() - INTERVAL '33 days', NOW() - INTERVAL '33 days'),
(NULL, 4, 'Great for acoustic recordings. The Martin D-28 sounds beautiful and the overall atmosphere is very comfortable and inspiring.', NOW() - INTERVAL '62 days', NOW() - INTERVAL '62 days'),

-- Echo Chamber Dub - Dub, spacey
(NULL, 4, 'Authentic dub recording with incredible analog delays and reverbs. The Space Echo and plate reverb create that deep, spacey dub sound.', NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),
(NULL, 3, 'Good for dub but the equipment is showing its age. The analog delays sound great but some units need maintenance.', NOW() - INTERVAL '86 days', NOW() - INTERVAL '86 days'),
(NULL, 5, 'Perfect dub studio! The analog processing and vintage equipment create those deep, echoing dub mixes we were looking for.', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'),
(NULL, 4, 'Great for dub and reggae production. The vintage delays and analog console create that authentic dub sound.', NOW() - INTERVAL '59 days', NOW() - INTERVAL '59 days'),

-- Kaleidoscope Studios - Psychedelic, trippy
(NULL, 4, 'Far-out psychedelic studio! The vintage effects and trippy atmosphere are perfect for psych rock and experimental music.', NOW() - INTERVAL '51 days', NOW() - INTERVAL '51 days'),
(NULL, 2, 'The psychedelic aesthetic is cool but can be distracting. Some of the effects pedals are unreliable. More style than substance.', NOW() - INTERVAL '78 days', NOW() - INTERVAL '78 days'),
(NULL, 5, 'Incredible psychedelic recording experience! The vintage effects and colorful atmosphere inspired our most creative album yet.', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
(NULL, 3, 'Good for psychedelic music but the trippy decor can be overwhelming. The Mellotron sounds amazing though.', NOW() - INTERVAL '66 days', NOW() - INTERVAL '66 days'),

-- Trap House Studios - Trap, modern
(NULL, 5, 'Modern trap production at its finest! The 808s hit incredibly hard and the high-end is crystal clear. Perfect for contemporary hip-hop.', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
(NULL, 4, 'Great trap recording studio. The UAD Apollo interface sounds incredible and the monitoring setup is perfect for modern rap production.', NOW() - INTERVAL '80 days', NOW() - INTERVAL '80 days'),
(NULL, 4, 'Perfect for trap and modern hip-hop. The FL Studio setup is professional and the beats sound current and competitive.', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
(NULL, 3, 'Good trap studio but quite expensive for the level of service. The sound quality is solid but expected more for the price.', NOW() - INTERVAL '73 days', NOW() - INTERVAL '73 days'),

-- Grunge Garden Studios - Alternative, raw
(NULL, 4, 'Perfect grunge studio! The raw, unpolished sound captures the essence of alternative rock perfectly. Great for indie and grunge bands.', NOW() - INTERVAL '48 days', NOW() - INTERVAL '48 days'),
(NULL, 3, 'Good for alternative rock but the raw approach isn''t for everyone. The sound is appropriately gritty but lacks polish.', NOW() - INTERVAL '84 days', NOW() - INTERVAL '84 days'),
(NULL, 5, 'Incredible alternative rock studio! The raw sound and Seattle vibe helped us create our most authentic grunge album.', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
(NULL, 2, 'Too raw and unpolished for our taste. The grunge aesthetic is cool but the technical quality suffers. Good for demos only.', NOW() - INTERVAL '71 days', NOW() - INTERVAL '71 days'),

-- Serenity Sound Studio - New Age, peaceful
(NULL, 4, 'Peaceful new age recording studio. The healing instruments and tranquil atmosphere create the perfect environment for meditation music.', NOW() - INTERVAL '56 days', NOW() - INTERVAL '56 days'),
(NULL, 3, 'Good for meditation music but maybe too peaceful for some genres. The crystal bowls sound amazing but the vibe is very specific.', NOW() - INTERVAL '91 days', NOW() - INTERVAL '91 days'),
(NULL, 5, 'Perfect for new age and healing music. The spiritual atmosphere and unique instruments create truly transcendent recordings.', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
(NULL, 4, 'Great for meditation and ambient music. The Tibetan singing bowls and peaceful setting are incredibly inspiring.', NOW() - INTERVAL '68 days', NOW() - INTERVAL '68 days'),

-- Underground House Lab - House music, clubby
(NULL, 5, 'Incredible house music studio! The club-quality sound system and electronic setup are perfect for dance music production.', NOW() - INTERVAL '43 days', NOW() - INTERVAL '43 days'),
(NULL, 4, 'Great for house and techno production. The Funktion-One monitors sound incredible and the club atmosphere is inspiring.', NOW() - INTERVAL '79 days', NOW() - INTERVAL '79 days'),
(NULL, 4, 'Perfect for electronic dance music. The TR-909 and TB-303 sound amazing and the club-level monitoring is professional.', NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days'),
(NULL, 3, 'Good for house music but the club atmosphere can be distracting during detailed production work. Great for creative sessions though.', NOW() - INTERVAL '64 days', NOW() - INTERVAL '64 days'),

-- Nylon String Studios - Classical guitar, specialized
(NULL, 4, 'Specialized classical guitar studio with perfect acoustics. The nylon-string guitars sound incredible and the recording quality is exceptional.', NOW() - INTERVAL '57 days', NOW() - INTERVAL '57 days'),
(NULL, 3, 'Good for classical guitar but very specialized. Limited to acoustic guitar recording. The sound quality is good but scope is narrow.', NOW() - INTERVAL '87 days', NOW() - INTERVAL '87 days'),
(NULL, 5, 'Perfect for classical and flamenco guitar recording. The acoustics are optimized for nylon strings and the guitars are exceptional.', NOW() - INTERVAL '31 days', NOW() - INTERVAL '31 days'),
(NULL, 4, 'Great classical guitar recording facility. The Spanish guitars sound beautiful and the acoustic treatment is perfect for solo guitar.', NOW() - INTERVAL '69 days', NOW() - INTERVAL '69 days'),

-- Time Machine Studios - Vintage, nostalgic
(NULL, 5, 'Incredible vintage recording experience! The all-analog signal path and vintage equipment create that classic golden age sound.', NOW() - INTERVAL '92 days', NOW() - INTERVAL '92 days'),
(NULL, 4, 'Great vintage studio with authentic analog equipment. The Studer tape machine and vintage console sound amazing.', NOW() - INTERVAL '38 days', NOW() - INTERVAL '38 days'),
(NULL, 5, 'Perfect vintage recording studio! The all-analog approach and vintage equipment captured the classic sound we were looking for.', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),
(NULL, 3, 'Good vintage sound but the all-analog approach can be limiting. The equipment is authentic but workflow is slower than modern studios.', NOW() - INTERVAL '65 days', NOW() - INTERVAL '65 days');

-- Display summary statistics
SELECT 
    'New Studios Created' as metric,
    COUNT(*) as count
FROM studios 
WHERE owner_id IN (3, 4, 5)

UNION ALL

SELECT 
    'Total Reviews Added' as metric,
    COUNT(*) as count
FROM reviews
WHERE created_at >= NOW() - INTERVAL '100 days'

UNION ALL

SELECT 
    'Luke''s Studios' as metric,
    COUNT(*) as count
FROM studios 
WHERE owner_id = 3

UNION ALL

SELECT 
    'Chantal''s Studios' as metric,
    COUNT(*) as count
FROM studios 
WHERE owner_id = 4

UNION ALL

SELECT 
    'Adam''s Studios' as metric,
    COUNT(*) as count
FROM studios 
WHERE owner_id = 5

UNION ALL

SELECT 
    'Average Rating' as metric,
    ROUND(AVG(rating), 2) as count
FROM reviews
WHERE created_at >= NOW() - INTERVAL '100 days';

-- Final summary
SELECT 
    'Summary: Created 30 studios (10 each for Luke, Chantal, Adam) with reviews and amenities' as result;