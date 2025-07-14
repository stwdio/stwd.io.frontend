# Guest Access Implementation - Technical Overview

## Feature Summary
Guest Access enables unauthenticated users to browse the platform's public content while providing seamless authentication prompts for protected actions. This creates an open discovery experience that converts visitors into registered users.

## User Stories Implemented

### 1. Guest Browsing
**As a** potential user visiting stwd.io for the first time  
**I want to** browse studios and user profiles without creating an account  
**So that** I can evaluate the platform before committing to registration

**Implementation:**
- Public routes defined in `lib/auth/auth-context.tsx`: `/browse`, `/studios/*`, `/profiles/*`
- RouteGuard component allows unauthenticated access to these routes
- Server-side rendering ensures SEO optimization for public pages

### 2. Protected Action Prompts
**As a** guest user browsing studios  
**I want to** see what actions are available but be prompted to sign in when I try to use them  
**So that** I understand the platform's capabilities without confusion

**Implementation:**
- `AuthModal` component provides sign in/sign up options
- `useAuthModal` hook enables any component to trigger authentication
- Modal integrated into root `ClientLayout` for app-wide availability

### 3. Smart Return Navigation
**As a** guest who decides to sign up after browsing  
**I want to** return to the exact page I was viewing after authentication  
**So that** I can continue my journey without disruption

**Implementation:**
- Current path stored in localStorage before redirect
- Callback URL includes return path
- Post-authentication redirect to original context

## Technical Architecture

### Components
```
components/
├── auth/
│   ├── auth-modal.tsx         # Modal UI for authentication prompts
│   └── route-guard.tsx         # Route protection logic
├── studio-card-actions.tsx     # Studio card with guest-aware actions
└── studio-detail-client.tsx    # Studio detail with guest-aware actions
```

### State Management
```typescript
// Global auth modal state
const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  openAuthModal: () => set({ isOpen: true }),
  closeAuthModal: () => set({ isOpen: false }),
}))
```

### Route Protection
```typescript
export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/callback',
    '/auth/signup', 
    '/browse',
    '/studios',
    '/profiles',
  ]
  // Route matching logic
}
```

## User Journey

### 1. Initial Landing
- Guest lands on homepage → Can navigate to "Browse Studios"
- No authentication required → Full access to browse functionality
- Sidebar shows "Sign In" and "Sign Up" buttons

### 2. Studio Discovery
- Browse page loads with all published studios
- Can filter by location, price, amenities
- Can click to view individual studio details
- Studio cards show three action buttons (disabled state for guests)

### 3. Protected Action Attempt
- Guest clicks "Contact Studio" → AuthModal appears
- Modal title: "Sign in to contact studios"
- Options: Sign In or Sign Up
- Clear value proposition messaging

### 4. Authentication Flow
- Guest chooses Sign In/Sign Up → Redirected to `/auth/login`
- Current path saved to localStorage
- After successful auth → Returns to original studio page
- Can now perform the protected action

## Database & Security

### RLS Policies
```sql
-- Studios SELECT policy allows public access
CREATE POLICY "Studios viewable by all" ON studios
  FOR SELECT USING (published = true);

-- Profiles SELECT policy allows public access  
CREATE POLICY "Profiles viewable by all" ON profiles
  FOR SELECT USING (true);
```

### Guest Access Matrix
| Feature | Guest Access | Authenticated Required |
|---------|--------------|----------------------|
| Browse Studios | ✅ Full | - |
| View Studio Details | ✅ Full | - |
| View User Profiles | ✅ Full | - |
| Contact Studio | ❌ Prompt | ✅ |
| Add to Quote | ❌ Prompt | ✅ |
| Create Lists | ❌ Prompt | ✅ |

## Code Examples

### Guest-Aware Component
```tsx
// studio-card-actions.tsx
if (!user) {
  return (
    <>
      <Button onClick={() => openAuthModal()} variant="outline">
        <IconList className="h-4 w-4 mr-2" />
        List
      </Button>
      <Button onClick={() => openAuthModal()}>
        <IconShoppingCart className="h-4 w-4 mr-2" />
        Add to Quote
      </Button>
    </>
  )
}
```

### Smart Redirect
```tsx
// auth-modal.tsx
const handleAuthRedirect = (type: 'signin' | 'signup') => {
  localStorage.setItem('redirectAfterAuth', window.location.pathname)
  window.location.href = `/auth/login?redirect=${window.location.pathname}`
}
```

## Missing Features & Future Enhancements

### Currently Missing
1. **Guest Analytics Tracking**
   - No tracking of guest behavior before conversion
   - No A/B testing on auth modal messaging

2. **Progressive Disclosure**
   - Could show limited results and prompt for more
   - No "teaser" content for premium features

3. **Social Proof in Auth Modal**
   - No user count or success stories
   - No testimonials in sign-up prompt

### Recommended Additions
1. **Guest Favorites**
   - Allow guests to save studios temporarily
   - Convert to permanent on registration

2. **Email Capture**
   - Lightweight email capture before full registration
   - Newsletter signup for guests

3. **Limited Trial Features**
   - Allow one free message before registration
   - Time-limited guest access to certain features

## Performance Considerations

### Optimizations Implemented
- Server-side rendering for SEO
- Lazy loading of auth modal component
- Minimal JavaScript for guest pages

### Metrics to Track
- Guest → Registered conversion rate
- Time spent browsing before registration
- Most common trigger for auth modal
- Drop-off rate at auth modal

## Testing Scenarios

### Manual Testing
1. Visit site as guest → Verify browse access
2. Click protected action → Verify modal appears
3. Sign in → Verify return to original page
4. Sign out → Verify guest UI returns

### Automated Testing
```typescript
describe('Guest Access', () => {
  it('allows browsing without authentication', async () => {
    await page.goto('/browse')
    await expect(page).toHaveURL('/browse')
    await expect(page.locator('text=Sign In')).toBeVisible()
  })
  
  it('prompts for auth on protected actions', async () => {
    await page.goto('/browse')
    await page.click('text=Contact Studio')
    await expect(page.locator('text=Sign in to contact studios')).toBeVisible()
  })
})
```

## Implementation Status
✅ **COMPLETED** - July 13, 2025

All core guest access features are implemented and functional. The system provides a seamless experience for discovering content while encouraging registration at natural interaction points.