# Implementation Plan: Social Follow System

### Objective
Implement the foundational social networking feature allowing users to follow each other and build professional networks.

### User Story / Business Goal
As an A&R, I want to 'follow' promising artists and producers so I can easily track their activity and new work.

### Current State Assessment
No social features currently exist in the platform. The database has no follow relationships or social graph structure. User profiles exist but lack any networking capabilities or social proof metrics.

### Required High-Level Changes
1. **Database Schema**: Create follows table with follower/following relationships
2. **Counter Columns**: Add followers_count and following_count to profiles table
3. **Database Triggers**: Implement automatic counter updates on follow/unfollow actions
4. **Follow UI Component**: Create follow/unfollow button with proper state management
5. **Profile Integration**: Display follower/following counts prominently on profiles
6. **Follow Lists**: Create pages to view a user's followers and following lists
7. **Authentication Checks**: Ensure only logged-in users can follow others
8. **RLS Policies**: Implement security policies for follow operations
9. **Optimistic Updates**: Implement instant UI feedback for follow actions

### Success Criteria
- [ ] New follows table with follower_id and following_id columns (both reference profiles.id)
- [ ] Unique constraint prevents duplicate follow relationships
- [ ] Profiles table has followers_count and following_count INTEGER columns
- [ ] Postgres trigger automatically increments/decrements counters on follow/unfollow
- [ ] Follow button appears on all user profiles (except own profile)
- [ ] Follow button shows current state (Following/Follow) with appropriate styling
- [ ] Follower/following counts display on profile pages with proper formatting
- [ ] Guest users see follow button but get auth prompt when clicked
- [ ] Authenticated users can follow/unfollow with instant UI feedback
- [ ] RLS policies ensure users can only manage their own follows
- [ ] Follow lists are viewable at /u/[username]/followers and /u/[username]/following
- [ ] No privacy settings - all follows are public (Twitter-like model)