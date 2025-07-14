# Implementation Plan: Navigation Refactor

### Objective
Restructure the main navigation around a central "Discover" concept to support browsing different types of industry professionals beyond just studios.

### User Story / Business Goal
As a studio owner looking for talent, I want to navigate to a dedicated 'Engineers' section to browse and discover freelance engineers, not just look at other studios.

### Current State Assessment
Current navigation uses a sidebar with "Browse Studios" as the primary discovery mechanism. The app is studio-centric with no support for discovering other types of professionals. Navigation is role-based but limited to creator vs owner distinctions.

### Required High-Level Changes
1. **Navigation Structure**: Keep the sidebar navigation and rename "Browse Studios" to just "Studios", then add new navigation items for Artists, Engineers, and Industry professionals
2. **New Discovery Pages**: Create page templates for Artists, Engineers, and Industry professionals
3. **Category-Specific Filters**: Implement unique filter sets for each discovery category
4. **URL Structure**: Establish new routes like /browse/artists, /browse/engineers, /browse/industry (keeping consistent with existing /browse pattern)
5. **Sidebar Organization**: Add the new browse categories below the Studios item in the sidebar
6. **Search Integration**: Update global search to work across all discovery categories
7. **Navigation State**: Implement proper active states for current discovery section
8. **Responsive Design**: Maintain consistent behavior across desktop and mobile viewports

### Success Criteria
- [ ] "Browse Studios" renamed to "Studios" in sidebar navigation
- [ ] New sidebar items added: Artists, Engineers, Industry (in that order below Studios)
- [ ] Each discovery category has its own dedicated page
- [ ] Studios page maintains existing filters: Amenities, Price Tier, Location
- [ ] Artists page has filters: Role (Musician, etc.), Genre, Location
- [ ] Engineers page has filters: Specialty (Mixing, Mastering), DAW Proficiency, Location
- [ ] Industry page has filters: Role (A&R, Manager), Location
- [ ] Navigation maintains responsive design on mobile devices
- [ ] Sidebar collapses into hamburger menu on mobile (existing behavior)
- [ ] Active discovery section is visually highlighted in sidebar
- [ ] All discovery pages follow consistent layout patterns similar to existing browse page
- [ ] Search functionality updated to search across all categories