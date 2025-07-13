# Implementation Plan: Rich User Profiles

### Objective
Create comprehensive public user profiles that serve as professional hubs for industry networking and discovery.

### User Story / Business Goal
As an audio engineer, I want my stwd.io profile to be my professional hub, allowing me to write a bio, link to my Discogs page to show my work, and connect my social media so potential clients can vet me.

### Current State Assessment
No public user profiles currently exist. The profiles table has basic fields (names, avatar_url, username) but lacks professional information. Profile data is only visible in account settings. No mechanism exists for portfolio links or social media connections.

### Required High-Level Changes
1. **Database Schema**: Add bio, social_links, and portfolio_links JSONB columns to profiles table
2. **Public Profile Pages**: Create new route /u/[username] for public user profiles
3. **Profile Display Components**: Build profile layout with sections for bio, roles, portfolio, social links
4. **Edit Profile UI**: Add new settings section for editing professional profile information
5. **Social Media Integration**: Support linking Instagram, X, Spotify, SoundCloud, and Discogs
6. **Portfolio Section**: Display work samples and links to external portfolios
7. **Gigs Section**: For musicians, add upcoming performances/gigs display
8. **SEO Optimization**: Implement proper meta tags for profile discoverability
9. **Guest Access**: Ensure profiles are viewable by unauthenticated users

### Success Criteria
- [ ] Profiles table has new columns: bio TEXT, social_links JSONB, portfolio_links JSONB
- [ ] Public profiles accessible at /u/[username] for all users (including guests)
- [ ] Profile page displays: avatar, name, username, professional roles, bio
- [ ] Social media links section shows connected platforms with clickable icons
- [ ] Portfolio section displays links to Spotify, SoundCloud, Discogs, etc.
- [ ] Musicians can add and display upcoming gigs/performances
- [ ] Edit profile interface in settings allows updating all professional information
- [ ] Social links are validated for correct platform URLs
- [ ] Profiles are mobile-responsive with proper layout adjustments
- [ ] Profile pages have proper SEO meta tags (title, description, og:image)
- [ ] Loading states and error handling for profile not found scenarios