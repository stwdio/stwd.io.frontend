# Implementation Plan: Unified "Discover Hub" Refactor

## Objective
To refactor the stwd.io application from a sidebar-based layout to a minimalist, header-navigated experience centered around a new unified "Discover" page, transforming the platform from a utility-focused tool to a content-first professional network for the audio creation industry.

## Strategic Context
This refactor represents a fundamental shift in the platform's identity:
- **From**: A utility for finding and booking studios (tool-based with sidebars)
- **To**: The central professional network for the audio creation industry (content-first, discovery-focused)
- **Core Experience**: A single, powerful Discover page for finding both Studios and People
- **Navigation Philosophy**: Minimalist header with user profile dropdown for personal features

## 1. Core Layout & Navigation Refactor

### Objective
Remove the main sidebar and establish a new minimalist header as the sole primary navigation element, consolidating all personal links into the user profile dropdown.

### High-Level Implementation Steps

#### 1.1 Remove Sidebar System
- Delete `/components/app-sidebar.tsx` and all related sidebar components
- Remove sidebar imports and providers from `/components/client-layout.tsx`
- Update the layout to use full-width content area without sidebar insets
- Remove all sidebar-related state management and context

#### 1.2 Create New Minimalist Header
- Refactor `/components/site-header.tsx` to match the new design:
  - Logo on the left (linked to home/discover)
  - User profile section on the right with avatar, name, and role badge
  - Clean, minimal styling without traditional menu items
- Implement responsive behavior with compact display on mobile

#### 1.3 Implement User Profile Dropdown
- Create a new dropdown menu triggered by clicking the user avatar/name
- Include links in alphabetical order:
  - Dashboard (visible only to studio owners)
  - Lists
  - Messages
  - Profile (link to public profile)
  - Settings
  - Sign Out
- Use shadcn/ui DropdownMenu components for consistency
- Ensure proper mobile touch interactions

## 2. The New Unified "Discover" Page

### Objective
Create the new discovery hub at the `/discover` route, which will serve as the application's primary page and main entry point.

### High-Level Implementation Steps

#### 2.1 Route Structure Setup
- Move existing `/browse` page to `/discover`
- Create new route structure:
  - `/discover` (default: studios view)
  - `/discover/studios` (explicit studios view)
  - `/discover/people` (people view landing)
  - `/discover/people/artists`
  - `/discover/people/engineers`
  - `/discover/people/industry`
- Set up redirects from old `/browse/*` routes to new structure

#### 2.2 Build Page Layout
- Create large "DISCOVER" title at the top of the page
- Implement "STUDIOS | PEOPLE" sub-navigation toggle below the title
- Style the active toggle with visual indicators (underline, bold, etc.)
- Center the content area for optimal viewing (no sidebar offset)

#### 2.3 Implement View Switching Logic
- Use client-side state to manage active view (studios/people)
- Implement smooth transitions between views without full page reload
- Update URL to reflect current view for shareability
- Preserve filter state when switching between views

#### 2.4 Search Bar Implementation
- Position search bar above the content grid, aligned to the right
- Ensure the search bar's right edge aligns with the grid's right edge
- Implement context-aware search (studios vs people)
- Add placeholder text that changes based on active view

## 3. Generic Card Component & Studio/People Cards

### Objective
Create a flexible, reusable card component that can display both studios and people, maintaining consistency across the platform.

### High-Level Implementation Steps

#### 3.1 Create Generic DiscoveryCard Component
- Extract common card layout and structure from StudioCard
- Create flexible props interface to handle both studio and person data
- Implement shared features:
  - Image/avatar display
  - Title/name section
  - Location information
  - Rating/reputation display
  - Action buttons area
  - Social proof section

#### 3.2 Adapt StudioCard Using Generic Component
- Refactor existing StudioCard to use the new DiscoveryCard base
- Add "Followed by..." section with mock data:
  - Display 3-4 user avatars in a stacked layout
  - Show "+X others" for additional followers
  - Use placeholder avatars until social system is implemented
- Update action buttons:
  - Replace "Contact" with "Message" button
  - Add "Quote" button for studio-specific actions
- Maintain all existing features (amenities, pricing, etc.)

#### 3.3 Create ProfileCard for People
- Implement ProfileCard using the DiscoveryCard base
- Display user information:
  - Avatar and name
  - Professional role badge
  - Location
  - Bio excerpt
  - Skills/expertise tags
- Add appropriate action buttons:
  - "Message" for communication
  - "View Profile" for detailed view
- Include social proof elements (placeholder for now)

## 4. Filter System Redesign

### Objective
Replace the sidebar filters with a floating action button (FAB) that opens a unified filter panel, with context-aware filters for studios vs people.

### High-Level Implementation Steps

#### 4.1 Create Floating Filter Button
- Implement FAB component positioned in bottom-right corner
- Add badge indicator showing active filter count
- Ensure proper z-index layering above content
- Implement smooth show/hide animations on scroll

#### 4.2 Build Unified Filter Panel
- Create filter panel using Sheet or Dialog component
- Implement two filter configurations:
  - **Studios**: Location, price tiers, amenities, equipment
  - **People**: Location, roles, skills, experience level
- Share common filters (location) between both views
- Add "Clear all" and "Apply" actions

#### 4.3 Filter State Management
- Implement context-aware filter state
- Preserve filters when switching between studios/people
- Update URL parameters for shareable filtered views
- Ensure filters persist during navigation

## 5. Data Integration & Performance

### Objective
Ensure efficient data fetching and maintain performance while supporting the new unified discovery experience.

### High-Level Implementation Steps

#### 5.1 Unified Data Fetching Strategy
- Keep React Query for client-side data management
- Implement parallel fetching for initial page load
- Use Suspense boundaries for loading states where appropriate
- Cache studio and people data separately

#### 5.2 Mock Social Data Integration
- Create mock data service for "Followed by..." information
- Structure: `{ studioId: string, followers: User[] }`
- Return 3-5 random user objects per studio
- Prepare data structure for future social system integration

#### 5.3 Performance Optimizations
- Implement virtual scrolling for large result sets
- Use intersection observer for lazy loading images
- Optimize card rendering with React.memo
- Batch API requests where possible

## 6. Responsive Design & Mobile Experience

### Objective
Ensure the new design works seamlessly across all device sizes with special attention to mobile usability.

### High-Level Implementation Steps

#### 6.1 Responsive Grid Layout
- Implement responsive grid for cards:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3-4 columns (depending on screen size)
- Ensure proper spacing and margins at all sizes

#### 6.2 Mobile Header Optimization
- Create compact header for mobile:
  - Smaller logo
  - Condensed user profile display
  - Accessible dropdown trigger
- Ensure touch-friendly tap targets

#### 6.3 Mobile-First Interactions
- Optimize filter panel for mobile screens
- Implement swipe gestures where appropriate
- Ensure search bar is easily accessible
- Test all interactions on touch devices

## 7. Migration & Cleanup

### Objective
Clean up old code and ensure smooth transition to the new architecture.

### High-Level Implementation Steps

#### 7.1 Remove Deprecated Components
- Delete sidebar-related components and styles
- Remove old filter components
- Clean up unused navigation code
- Update component imports throughout the app

#### 7.2 Update Existing Pages
- Update all pages that referenced the sidebar
- Fix layout issues from sidebar removal
- Update navigation links to use new structure
- Ensure authentication flows work with new header

#### 7.3 Testing & Validation
- Test all user flows with new navigation
- Verify authentication and protected routes
- Ensure deep linking works with new URL structure
- Validate responsive behavior across devices

## Implementation Order

1. **Phase 1**: Header and navigation refactor (remove sidebar, create new header with dropdown)
2. **Phase 2**: Create basic Discover page structure with view toggle
3. **Phase 3**: Implement generic card component and adapt existing cards
4. **Phase 4**: Build floating filter system
5. **Phase 5**: Add search functionality and performance optimizations
6. **Phase 6**: Polish responsive design and mobile experience
7. **Phase 7**: Clean up old code and complete migration

## Success Criteria

- Sidebar completely removed with all functionality preserved
- Single Discover page serves as the main hub for all discovery
- Seamless switching between Studios and People views
- All user features accessible via profile dropdown
- Consistent card design across studios and people
- Floating filter button works on all screen sizes
- No regression in existing functionality
- Improved performance with lazy loading and optimizations
- Clean, minimal header design without traditional menus
- Mock social proof data displayed in studio cards