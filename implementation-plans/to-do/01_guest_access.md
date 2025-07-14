# Implementation Plan: Guest Access

### Objective
Enable unauthenticated users to browse all public content while prompting for signup only when attempting protected actions.

### User Story / Business Goal
As a curious visitor, I want to browse all public content, including studio and user profiles, without creating an account. I should only be prompted to sign up when I try an action that requires an account.

### Current State Assessment
The site currently requires authentication for most pages. The RouteGuard component redirects unauthenticated users to /auth/login for protected routes. Only the landing page (/) and auth pages are publicly accessible. The browse page (/browse) and studio pages (/studios/[id]) are protected by authentication.

### Required High-Level Changes
1. **Remove Authentication Requirements**: Update RouteGuard to allow guest access to /browse, /studios/*, and future /u/* profile pages
2. **Conditional UI Elements**: Show/hide interactive elements based on authentication status (e.g., "Save to List" button, "Send Message" button)
3. **Authentication Prompts**: Implement modal dialogs that appear when guests attempt protected actions
4. **RLS Policy Updates**: Ensure database policies allow SELECT operations for anonymous users on public data
5. **Navigation Updates**: Display appropriate CTAs in navigation for guest vs. authenticated users

### Success Criteria
- [ ] Guests can browse all studios without logging in
- [ ] Guests can view individual studio pages with all public information
- [ ] Guests can use filters and search functionality on the browse page
- [ ] Guests can view user profiles at /u/[username] (once implemented)
- [ ] Authentication modal appears when guests click protected actions (e.g., "Save to List", "Contact Studio")
- [ ] Navigation shows "Sign Up" and "Log In" buttons for guests
- [ ] No errors in console related to authentication when browsing as guest
- [ ] RLS policies allow anonymous read access to studios, profiles, reviews, and amenities tables
- [ ] Protected actions are visually distinct (e.g., different styling or icons indicating login required)