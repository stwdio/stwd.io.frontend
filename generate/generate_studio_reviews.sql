-- Studio Reviews Generation Script for stwd.io
-- Run this in the Supabase SQL Editor to generate reviews for all studios
-- This script creates a realistic mix of good, bad, and okay reviews

-- IMPORTANT NOTE: The current reviews table is designed to be tied to bookings via booking_id.
-- Since we don't have bookings yet, this script creates standalone reviews with NULL booking_id.
-- This works because booking_id is nullable in the current schema.

-- For a proper production implementation, consider adding a studio_id field to the reviews table
-- or creating a separate standalone_reviews table for reviews not tied to bookings.

-- Insert reviews directly with realistic content and timestamps
INSERT INTO reviews (booking_id, rating, comment, created_at, updated_at)
VALUES 
-- Reviews spread over the last 3 months with realistic timestamps
-- Sonic Sanctuary Studios (ID: 9) - Premium studio, mostly good reviews
(NULL, 5, 'Absolutely incredible studio! The SSL console sounds amazing and the acoustics are perfect. The team here really knows their stuff. Recorded our entire album here and couldn''t be happier.', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
(NULL, 4, 'Great facilities and professional setup. The main live room has excellent acoustics. Only minor complaint is the parking situation, but the quality makes up for it.', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
(NULL, 5, 'World-class recording experience. The Neumann mics and vintage outboard gear gave our tracks that professional polish we were looking for. Will definitely be back.', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
(NULL, 3, 'Good studio but quite expensive. The gear is top-notch but felt a bit rushed during our session. Maybe we needed to book more time.', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days'),

-- Reverb Room Recording (ID: 10) - Indie rock, mixed reviews
(NULL, 5, 'Perfect for indie rock! The vintage gear and analog workflow created exactly the sound we wanted. The Neve console is magic. Highly recommend for any rock band.', NOW() - INTERVAL '67 days', NOW() - INTERVAL '67 days'),
(NULL, 2, 'The aesthetic is cool but some of the equipment feels outdated. Had issues with the tape machine during our session. Staff was helpful but it caused delays.', NOW() - INTERVAL '34 days', NOW() - INTERVAL '34 days'),
(NULL, 4, 'Love the vintage vibe and the sound quality is solid. Great for that warm, analog sound. The engineer was knowledgeable and helpful.', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
(NULL, 3, 'Decent studio for the price. The rooms are a bit small for a full band but the sound is good. Would work better for smaller projects.', NOW() - INTERVAL '56 days', NOW() - INTERVAL '56 days'),

-- Beat Lab Studios (ID: 11) - Hip-hop, mostly positive
(NULL, 5, 'Best hip-hop studio in the city! The beats sound crisp and the MPC setup is perfect. Engineer really understood the vibe we were going for.', NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days'),
(NULL, 4, 'Great production setup with all the right software and hardware. The monitor speakers are fantastic. Only wish the booth was a bit bigger.', NOW() - INTERVAL '41 days', NOW() - INTERVAL '41 days'),
(NULL, 5, 'Incredible studio for hip-hop and R&B. The sample library is extensive and the mixing setup is perfect. Produced our entire EP here.', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
(NULL, 4, 'Professional setup with modern equipment. The 808s hit hard and the high-end is crystal clear. Good value for money.', NOW() - INTERVAL '62 days', NOW() - INTERVAL '62 days'),

-- Whispering Pines Acoustic (ID: 12) - Acoustic, good but some concerns
(NULL, 4, 'Beautiful acoustic space with natural reverb. Perfect for singer-songwriter material. The converted barn setting is inspiring and unique.', NOW() - INTERVAL '73 days', NOW() - INTERVAL '73 days'),
(NULL, 3, 'Nice acoustic sound but the location is quite remote. The drive was longer than expected. Sound quality is good for acoustic instruments.', NOW() - INTERVAL '38 days', NOW() - INTERVAL '38 days'),
(NULL, 5, 'Magical atmosphere for acoustic recording. The natural acoustics of the barn are incredible. Our folk album sounds amazing. Highly recommend!', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
(NULL, 2, 'While the acoustic sound is good, the facilities are pretty basic. Limited amenities and the remote location makes it inconvenient.', NOW() - INTERVAL '51 days', NOW() - INTERVAL '51 days'),

-- Synthesis Station (ID: 13) - Electronic, enthusiastic reviews
(NULL, 5, 'Electronic music paradise! The modular setup is incredible and the synth collection is mind-blowing. Perfect for experimental electronic music.', NOW() - INTERVAL '86 days', NOW() - INTERVAL '86 days'),
(NULL, 4, 'Amazing collection of synthesizers and drum machines. The Ableton Live setup is perfect for electronic production. Great creative environment.', NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days'),
(NULL, 5, 'Unreal electronic music studio. The Moog modular system is a dream to work with. Created some of our best tracks here.', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
(NULL, 4, 'Great for electronic music production. The synthesizer collection is extensive. Would have liked more studio time to explore all the gear.', NOW() - INTERVAL '59 days', NOW() - INTERVAL '59 days'),

-- Blue Note Recordings (ID: 14) - Jazz, high quality
(NULL, 5, 'Classic jazz recording at its finest. The acoustics are perfect for large ensembles and the vintage equipment captures that authentic jazz sound.', NOW() - INTERVAL '91 days', NOW() - INTERVAL '91 days'),
(NULL, 4, 'Excellent jazz recording facility. The live room accommodates our 12-piece band perfectly. The Steinway piano sounds incredible.', NOW() - INTERVAL '33 days', NOW() - INTERVAL '33 days'),
(NULL, 5, 'Professional jazz recording experience. The vintage microphones and analog console create that classic Blue Note sound. Absolutely perfect.', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days'),
(NULL, 4, 'High-quality jazz studio with great acoustics. The only downside is the premium pricing, but you get what you pay for.', NOW() - INTERVAL '68 days', NOW() - INTERVAL '68 days'),

-- Distortion Den (ID: 15) - Punk rock, mixed feelings
(NULL, 4, 'Perfect punk rock vibe! Raw and unpolished sound that captures the energy perfectly. Fast turnaround and affordable rates.', NOW() - INTERVAL '44 days', NOW() - INTERVAL '44 days'),
(NULL, 2, 'The aesthetic is cool but the equipment feels a bit worn. Had some technical issues during recording. Good for demo work but not final masters.', NOW() - INTERVAL '76 days', NOW() - INTERVAL '76 days'),
(NULL, 3, 'Good for punk and hardcore. The sound is appropriately raw but some of the gear needs maintenance. Staff attitude matches the punk vibe!', NOW() - INTERVAL '31 days', NOW() - INTERVAL '31 days'),
(NULL, 5, 'Exactly what we wanted for our punk album! The raw sound and garage aesthetic is perfect. No frills, just pure punk energy.', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),

-- Symphony Sound Studios (ID: 16) - Orchestral, premium
(NULL, 5, 'Absolutely stunning orchestral recording space. The hall acoustics are incredible and the microphone arrays capture every nuance. Worth every penny.', NOW() - INTERVAL '95 days', NOW() - INTERVAL '95 days'),
(NULL, 4, 'Professional orchestral recording facility. The sound quality is exceptional but the booking process was quite lengthy. Results are worth it.', NOW() - INTERVAL '37 days', NOW() - INTERVAL '37 days'),
(NULL, 5, 'World-class orchestral recording. The acoustics rival famous concert halls. Our symphony recording sounds absolutely magnificent.', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
(NULL, 3, 'Great sound quality but very expensive. The facility is impressive but budget-conscious projects might struggle with the rates.', NOW() - INTERVAL '64 days', NOW() - INTERVAL '64 days'),

-- Continue with remaining studios...
-- Honky Tonk Studios (ID: 17) - Country, good vibes
(NULL, 4, 'Authentic country music studio with great vintage gear. The steel guitar sounds incredible and the atmosphere is perfect for country recording.', NOW() - INTERVAL '48 days', NOW() - INTERVAL '48 days'),
(NULL, 3, 'Good country recording setup but the rooms are a bit small. The vintage equipment sounds great but some pieces need calibration.', NOW() - INTERVAL '82 days', NOW() - INTERVAL '82 days'),
(NULL, 5, 'Perfect for country and bluegrass! The authentic vintage gear and relaxed atmosphere helped us create our best album yet.', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
(NULL, 4, 'Great country music facility. The Telecaster and steel guitar sound amazing. Would recommend for any country or Americana project.', NOW() - INTERVAL '58 days', NOW() - INTERVAL '58 days'),

-- Global Groove Studios (ID: 18) - World music, unique
(NULL, 5, 'Incredible world music studio! The instrument collection is amazing and the multicultural approach is refreshing. Perfect for fusion projects.', NOW() - INTERVAL '71 days', NOW() - INTERVAL '71 days'),
(NULL, 4, 'Unique studio with instruments from around the world. Great for experimental and world music. The gamelan ensemble is particularly impressive.', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
(NULL, 3, 'Interesting concept but some of the world instruments need maintenance. The variety is impressive but quality varies by instrument.', NOW() - INTERVAL '87 days', NOW() - INTERVAL '87 days'),
(NULL, 4, 'Great for world music recording. The cultural diversity of instruments opens up creative possibilities. Professional recording quality.', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days'),

-- Voice Booth Pro (ID: 19) - Podcast/voice, practical
(NULL, 4, 'Perfect for podcast recording. The acoustic treatment is excellent and the broadcast-quality equipment produces professional results.', NOW() - INTERVAL '52 days', NOW() - INTERVAL '52 days'),
(NULL, 3, 'Good for voice-over work but the booking system is a bit clunky. Sound quality is solid for podcast and narration projects.', NOW() - INTERVAL '79 days', NOW() - INTERVAL '79 days'),
(NULL, 5, 'Excellent podcast studio! The acoustics are perfect for voice work and the equipment is professional grade. Great for audiobook recording.', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
(NULL, 4, 'Professional voice recording facility. The sound isolation is excellent and the monitoring setup is comfortable for long sessions.', NOW() - INTERVAL '61 days', NOW() - INTERVAL '61 days'),

-- Iron Temple Studios (ID: 20) - Metal, intense
(NULL, 5, 'Brutal metal recording! The high-gain amps and crushing drum sounds are perfect for extreme metal. The engineer really gets the genre.', NOW() - INTERVAL '42 days', NOW() - INTERVAL '42 days'),
(NULL, 4, 'Great metal recording facility. The Peavey 5150 sounds incredible and the drum room has that tight, aggressive sound we wanted.', NOW() - INTERVAL '75 days', NOW() - INTERVAL '75 days'),
(NULL, 3, 'Good for metal but the rooms are quite loud. The sound is heavy and aggressive as expected. Would recommend ear protection even in control room.', NOW() - INTERVAL '36 days', NOW() - INTERVAL '36 days'),
(NULL, 5, 'Perfect for heavy metal and hardcore. The equipment is dialed in for extreme music and the final mix sounds absolutely crushing.', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'),

-- Continue with more studios...
-- Irie Vibes Recording (ID: 21) - Reggae, laid back
(NULL, 4, 'Authentic reggae studio with great vintage equipment. The atmosphere is perfect and the basslines sound incredible through the SVT.', NOW() - INTERVAL '66 days', NOW() - INTERVAL '66 days'),
(NULL, 3, 'Good reggae recording setup but the pace is very laid back. If you''re in a hurry, this might not be the place. Great sound though.', NOW() - INTERVAL '89 days', NOW() - INTERVAL '89 days'),
(NULL, 5, 'Perfect reggae recording experience! The vintage equipment and Rasta-inspired atmosphere created the perfect vibe for our album.', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'),
(NULL, 4, 'Great for reggae and dub music. The Space Echo sounds amazing and the whole vibe is very authentic. One love!', NOW() - INTERVAL '57 days', NOW() - INTERVAL '57 days'),

-- Chamber Music Hall (ID: 22) - Classical chamber, refined
(NULL, 5, 'Exquisite chamber music recording space. The Steinway Concert Grand is magnificent and the acoustics are perfect for intimate classical music.', NOW() - INTERVAL '93 days', NOW() - INTERVAL '93 days'),
(NULL, 4, 'Beautiful classical recording facility. The string quartet sounds incredible in this space. Professional recording quality throughout.', NOW() - INTERVAL '39 days', NOW() - INTERVAL '39 days'),
(NULL, 5, 'Perfect for chamber music and solo piano. The natural acoustics and beautiful setting inspire great performances. Highly recommended.', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
(NULL, 3, 'Good classical recording but very formal atmosphere. The sound quality is excellent but the environment can feel a bit stiff.', NOW() - INTERVAL '70 days', NOW() - INTERVAL '70 days'),

-- Ethereal Sound Lab (ID: 23) - Experimental, weird
(NULL, 4, 'Fascinating experimental studio! The unique spaces and unconventional techniques opened up creative possibilities we never imagined.', NOW() - INTERVAL '84 days', NOW() - INTERVAL '84 days'),
(NULL, 2, 'Very experimental but maybe too weird for practical recording. The reverb chamber is cool but the setup is confusing.', NOW() - INTERVAL '77 days', NOW() - INTERVAL '77 days'),
(NULL, 5, 'Incredible experimental studio for ambient and drone music. The prepared piano and crystal bowls create otherworldly sounds.', NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days'),
(NULL, 3, 'Interesting for experimental music but not suitable for conventional recording. The unique spaces are cool but hard to work with.', NOW() - INTERVAL '63 days', NOW() - INTERVAL '63 days'),

-- Motown Magic Studios (ID: 24) - R&B soul, nostalgic
(NULL, 5, 'Classic Motown sound at its finest! The vintage equipment and warm, punchy sound transported us back to the golden age of soul.', NOW() - INTERVAL '46 days', NOW() - INTERVAL '46 days'),
(NULL, 4, 'Great R&B recording facility. The Fender Rhodes sounds incredible and the overall vibe is very authentic. Professional results.', NOW() - INTERVAL '81 days', NOW() - INTERVAL '81 days'),
(NULL, 5, 'Perfect for soul and R&B music. The vintage gear and classic sound helped us create our best tracks. Pure Motown magic!', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days'),
(NULL, 4, 'Excellent soul recording studio. The Hammond B3 is particularly impressive. Great for capturing that classic R&B sound.', NOW() - INTERVAL '69 days', NOW() - INTERVAL '69 days'),

-- Mountain Music Studio (ID: 25) - Bluegrass, rustic
(NULL, 4, 'Authentic bluegrass recording in a beautiful mountain setting. The acoustic instruments sound incredible and the atmosphere is perfect.', NOW() - INTERVAL '54 days', NOW() - INTERVAL '54 days'),
(NULL, 3, 'Good bluegrass studio but very rustic. The mountain location is beautiful but facilities are basic. Sound quality is solid for acoustic music.', NOW() - INTERVAL '88 days', NOW() - INTERVAL '88 days'),
(NULL, 5, 'Perfect for traditional bluegrass and old-time music. The authentic instruments and mountain cabin setting create the perfect atmosphere.', NOW() - INTERVAL '32 days', NOW() - INTERVAL '32 days'),
(NULL, 2, 'While the acoustic sound is good, the facilities are too basic. Limited amenities and the rustic approach goes too far.', NOW() - INTERVAL '74 days', NOW() - INTERVAL '74 days'),

-- Ritmo Recording (ID: 26) - Latin, energetic
(NULL, 5, 'Incredible Latin music studio! The percussion section is amazing and the horn arrangements sound fantastic. Perfect for salsa and Latin pop.', NOW() - INTERVAL '49 days', NOW() - INTERVAL '49 days'),
(NULL, 4, 'Great Latin recording facility. The rhythm section is tight and the brass section sounds incredible. Professional Latin music production.', NOW() - INTERVAL '78 days', NOW() - INTERVAL '78 days'),
(NULL, 4, 'Perfect for Latin music recording. The congas and timbales sound amazing and the overall energy is infectious. ¡Muy bueno!', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
(NULL, 3, 'Good for Latin music but the sessions can get quite loud and energetic. Great musicians but might be overwhelming for some.', NOW() - INTERVAL '65 days', NOW() - INTERVAL '65 days'),

-- Dreamy Pop Studios (ID: 27) - Indie pop, atmospheric
(NULL, 4, 'Perfect indie pop studio! The vintage synths and reverb tanks create that dreamy, nostalgic sound we were looking for.', NOW() - INTERVAL '53 days', NOW() - INTERVAL '53 days'),
(NULL, 3, 'Good for indie pop but the aesthetic sometimes overshadows the technical aspects. The Juno-60 sounds great though.', NOW() - INTERVAL '85 days', NOW() - INTERVAL '85 days'),
(NULL, 5, 'Incredible dream pop recording experience! The atmosphere is inspiring and the vintage equipment creates that perfect ethereal sound.', NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days'),
(NULL, 4, 'Great for indie pop and bedroom pop. The spring reverb and chorus pedals create that perfect dreamy atmosphere.', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),

-- Cinematic Sound Studios (ID: 28) - Film scoring, professional
(NULL, 5, 'Professional film scoring facility with incredible orchestral samples and surround sound. Perfect for cinematic music production.', NOW() - INTERVAL '96 days', NOW() - INTERVAL '96 days'),
(NULL, 4, 'Great for film and game music. The Vienna Symphonic Library sounds incredible and the surround monitoring is professional grade.', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
(NULL, 5, 'Perfect for cinematic music production. The orchestral samples and surround sound capabilities are exactly what we needed for our film score.', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
(NULL, 4, 'Professional film scoring studio. The sample libraries are extensive and the surround sound setup is impressive. Great for media music.', NOW() - INTERVAL '72 days', NOW() - INTERVAL '72 days'),

-- Final studios...
-- Groove Central (ID: 29) - Funk, tight
(NULL, 5, 'Funk perfection! The rhythm section is incredibly tight and the vintage equipment captures that classic 70s funk sound perfectly.', NOW() - INTERVAL '47 days', NOW() - INTERVAL '47 days'),
(NULL, 4, 'Great funk recording studio. The bass guitar sounds incredible and the overall groove is infectious. Perfect for funk and disco.', NOW() - INTERVAL '83 days', NOW() - INTERVAL '83 days'),
(NULL, 4, 'Perfect for funk recording. The clavinet and minimoog sound amazing and the rhythm section is incredibly tight.', NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days'),
(NULL, 3, 'Good funk studio but the sessions can be intense. The musicians are great but the perfectionist approach can be stressful.', NOW() - INTERVAL '67 days', NOW() - INTERVAL '67 days'),

-- Songwriter's Haven (ID: 30) - Singer-songwriter, cozy
(NULL, 4, 'Perfect intimate studio for singer-songwriters. The cozy atmosphere and acoustic setup make it easy to capture authentic performances.', NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days'),
(NULL, 3, 'Good for solo work but the space is quite small. The acoustic sound is nice but limited for full band recordings.', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days'),
(NULL, 5, 'Incredible singer-songwriter studio! The comfortable environment and acoustic setup helped me record my most personal songs.', NOW() - INTERVAL '33 days', NOW() - INTERVAL '33 days'),
(NULL, 4, 'Great for acoustic recordings. The Martin D-28 sounds beautiful and the overall atmosphere is very comfortable and inspiring.', NOW() - INTERVAL '62 days', NOW() - INTERVAL '62 days'),

-- Echo Chamber Dub (ID: 31) - Dub, spacey
(NULL, 4, 'Authentic dub recording with incredible analog delays and reverbs. The Space Echo and plate reverb create that deep, spacey dub sound.', NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),
(NULL, 3, 'Good for dub but the equipment is showing its age. The analog delays sound great but some units need maintenance.', NOW() - INTERVAL '86 days', NOW() - INTERVAL '86 days'),
(NULL, 5, 'Perfect dub studio! The analog processing and vintage equipment create those deep, echoing dub mixes we were looking for.', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'),
(NULL, 4, 'Great for dub and reggae production. The vintage delays and analog console create that authentic dub sound.', NOW() - INTERVAL '59 days', NOW() - INTERVAL '59 days'),

-- Kaleidoscope Studios (ID: 32) - Psychedelic, trippy
(NULL, 4, 'Far-out psychedelic studio! The vintage effects and trippy atmosphere are perfect for psych rock and experimental music.', NOW() - INTERVAL '51 days', NOW() - INTERVAL '51 days'),
(NULL, 2, 'The psychedelic aesthetic is cool but can be distracting. Some of the effects pedals are unreliable. More style than substance.', NOW() - INTERVAL '78 days', NOW() - INTERVAL '78 days'),
(NULL, 5, 'Incredible psychedelic recording experience! The vintage effects and colorful atmosphere inspired our most creative album yet.', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
(NULL, 3, 'Good for psychedelic music but the trippy decor can be overwhelming. The Mellotron sounds amazing though.', NOW() - INTERVAL '66 days', NOW() - INTERVAL '66 days'),

-- Trap House Studios (ID: 33) - Trap, modern
(NULL, 5, 'Modern trap production at its finest! The 808s hit incredibly hard and the high-end is crystal clear. Perfect for contemporary hip-hop.', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
(NULL, 4, 'Great trap recording studio. The UAD Apollo interface sounds incredible and the monitoring setup is perfect for modern rap production.', NOW() - INTERVAL '80 days', NOW() - INTERVAL '80 days'),
(NULL, 4, 'Perfect for trap and modern hip-hop. The FL Studio setup is professional and the beats sound current and competitive.', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
(NULL, 3, 'Good trap studio but quite expensive for the level of service. The sound quality is solid but expected more for the price.', NOW() - INTERVAL '73 days', NOW() - INTERVAL '73 days'),

-- Grunge Garden Studios (ID: 34) - Alternative, raw
(NULL, 4, 'Perfect grunge studio! The raw, unpolished sound captures the essence of alternative rock perfectly. Great for indie and grunge bands.', NOW() - INTERVAL '48 days', NOW() - INTERVAL '48 days'),
(NULL, 3, 'Good for alternative rock but the raw approach isn''t for everyone. The sound is appropriately gritty but lacks polish.', NOW() - INTERVAL '84 days', NOW() - INTERVAL '84 days'),
(NULL, 5, 'Incredible alternative rock studio! The raw sound and Seattle vibe helped us create our most authentic grunge album.', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
(NULL, 2, 'Too raw and unpolished for our taste. The grunge aesthetic is cool but the technical quality suffers. Good for demos only.', NOW() - INTERVAL '71 days', NOW() - INTERVAL '71 days'),

-- Serenity Sound Studio (ID: 35) - New Age, peaceful
(NULL, 4, 'Peaceful new age recording studio. The healing instruments and tranquil atmosphere create the perfect environment for meditation music.', NOW() - INTERVAL '56 days', NOW() - INTERVAL '56 days'),
(NULL, 3, 'Good for meditation music but maybe too peaceful for some genres. The crystal bowls sound amazing but the vibe is very specific.', NOW() - INTERVAL '91 days', NOW() - INTERVAL '91 days'),
(NULL, 5, 'Perfect for new age and healing music. The spiritual atmosphere and unique instruments create truly transcendent recordings.', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
(NULL, 4, 'Great for meditation and ambient music. The Tibetan singing bowls and peaceful setting are incredibly inspiring.', NOW() - INTERVAL '68 days', NOW() - INTERVAL '68 days'),

-- Underground House Lab (ID: 36) - House music, clubby
(NULL, 5, 'Incredible house music studio! The club-quality sound system and electronic setup are perfect for dance music production.', NOW() - INTERVAL '43 days', NOW() - INTERVAL '43 days'),
(NULL, 4, 'Great for house and techno production. The Funktion-One monitors sound incredible and the club atmosphere is inspiring.', NOW() - INTERVAL '79 days', NOW() - INTERVAL '79 days'),
(NULL, 4, 'Perfect for electronic dance music. The TR-909 and TB-303 sound amazing and the club-level monitoring is professional.', NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days'),
(NULL, 3, 'Good for house music but the club atmosphere can be distracting during detailed production work. Great for creative sessions though.', NOW() - INTERVAL '64 days', NOW() - INTERVAL '64 days'),

-- Nylon String Studios (ID: 37) - Classical guitar, specialized
(NULL, 4, 'Specialized classical guitar studio with perfect acoustics. The nylon-string guitars sound incredible and the recording quality is exceptional.', NOW() - INTERVAL '57 days', NOW() - INTERVAL '57 days'),
(NULL, 3, 'Good for classical guitar but very specialized. Limited to acoustic guitar recording. The sound quality is good but scope is narrow.', NOW() - INTERVAL '87 days', NOW() - INTERVAL '87 days'),
(NULL, 5, 'Perfect for classical and flamenco guitar recording. The acoustics are optimized for nylon strings and the guitars are exceptional.', NOW() - INTERVAL '31 days', NOW() - INTERVAL '31 days'),
(NULL, 4, 'Great classical guitar recording facility. The Spanish guitars sound beautiful and the acoustic treatment is perfect for solo guitar.', NOW() - INTERVAL '69 days', NOW() - INTERVAL '69 days'),

-- Time Machine Studios (ID: 38) - Vintage, nostalgic
(NULL, 5, 'Incredible vintage recording experience! The all-analog signal path and vintage equipment create that classic golden age sound.', NOW() - INTERVAL '92 days', NOW() - INTERVAL '92 days'),
(NULL, 4, 'Great vintage studio with authentic analog equipment. The Studer tape machine and vintage console sound amazing.', NOW() - INTERVAL '38 days', NOW() - INTERVAL '38 days'),
(NULL, 5, 'Perfect vintage recording studio! The all-analog approach and vintage equipment captured the classic sound we were looking for.', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),
(NULL, 3, 'Good vintage sound but the all-analog approach can be limiting. The equipment is authentic but workflow is slower than modern studios.', NOW() - INTERVAL '65 days', NOW() - INTERVAL '65 days');

-- Display summary statistics
SELECT 
    COUNT(*) as total_reviews,
    ROUND(AVG(rating), 2) as average_rating,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_reviews,
    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_reviews,
    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_reviews,
    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_reviews,
    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_reviews
FROM reviews;

-- Note: This creates standalone reviews without direct studio association
-- Since the current schema doesn't support direct studio-review relationships,
-- you'll need to track which reviews belong to which studios manually
-- or consider adding a studio_id column to the reviews table for proper relationships. 