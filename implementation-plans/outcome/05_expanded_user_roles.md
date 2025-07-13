# Expanded User Roles - Technical Overview

## Feature Summary
The Expanded User Roles system replaces the simple creator/owner binary with a professional, multi-role system. Users can now identify with multiple professional roles simultaneously, reflecting the reality of industry professionals who wear many hats.

## User Stories Implemented

### 1. Multi-Role Identity
**As a** musician who also manages other artists  
**I want to** select multiple professional roles  
**So that** my profile accurately reflects all my industry activities

**Implementation:**
- Many-to-many relationship via profile_roles table
- 7 professional roles available
- Checkbox-based selection interface

### 2. Role-Based Discovery
**As a** band looking for a producer  
**I want to** browse users by their professional roles  
**So that** I can find the right collaborators

**Implementation:**
- Dedicated discovery pages per role category
- Filterable user listings
- Role badges on profile cards

### 3. Flexible Onboarding
**As a** new user with diverse skills  
**I want to** select all applicable roles during signup  
**So that** I'm properly represented from the start

**Implementation:**
- Multi-select onboarding interface
- Icons for visual role recognition
- Smart routing based on selections

## Technical Architecture

### Database Schema
```sql
-- Professional roles table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert professional roles
INSERT INTO roles (name, slug, description) VALUES
  ('Musician', 'musician', 'Musicians, artists, and performers'),
  ('Podcaster', 'podcaster', 'Podcast creators and hosts'),
  ('Voice Actor', 'voice-actor', 'Voice over artists and narrators'),
  ('A&R', 'a-and-r', 'Artist and repertoire professionals'),
  ('Audio Engineer', 'engineer', 'Recording, mixing, and mastering engineers'),
  ('Manager', 'manager', 'Artist and talent managers'),
  ('Studio Owner', 'studio-owner', 'Recording studio owners and operators');

-- Junction table for many-to-many
CREATE TABLE profile_roles (
  profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
  role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (profile_id, role_id)
);

-- Rename old role field to avoid confusion
ALTER TABLE profiles 
RENAME COLUMN role TO system_role;
```

### Role Icons Mapping
```typescript
const roleIcons = {
  'musician': Music,
  'podcaster': Mic,
  'voice-actor': Radio,
  'a-and-r': Briefcase,
  'engineer': Wrench,
  'manager': Users,
  'studio-owner': Building,
} as const
```

### TypeScript Types
```typescript
interface Role {
  id: number
  name: string
  slug: string
  description?: string
}

interface ProfileRole {
  profile_id: number
  role_id: number
  role?: Role
}

interface Profile {
  id: number
  system_role: 'user' | 'admin' | null  // Renamed from 'role'
  profile_roles: ProfileRole[]
  // ... other fields
}
```

## User Journey

### 1. New User Onboarding
- User completes authentication
- Lands on `/onboarding` page
- Sees grid of 7 role options with icons
- Checkboxes allow multiple selections
- Must select at least one role
- Submit → Routes to appropriate dashboard

### 2. Onboarding Interface
```
Select Your Professional Roles
(Choose all that apply)

□ 🎵 Musician          □ 🎙️ Podcaster
  Musicians, artists,    Podcast creators
  and performers        and hosts

□ 📻 Voice Actor       □ 💼 A&R
  Voice over artists    Artist and repertoire
  and narrators         professionals

□ 🔧 Audio Engineer    □ 👥 Manager
  Recording, mixing,    Artist and talent
  mastering engineers   managers

□ 🏢 Studio Owner
  Recording studio
  owners and operators

[Continue →]
```

### 3. Profile Settings Management
- Settings → Professional Profile
- Same checkbox interface
- Add/remove roles anytime
- Changes reflected immediately
- No limit on role count

### 4. Discovery by Role
- Navigation shows role categories
- Artists → Musicians, Podcasters, Voice Actors
- Engineers → Audio Engineers only
- Industry → A&R, Managers
- Each page filtered by role

## Implementation Details

### Onboarding Component
```tsx
// app/onboarding/page.tsx
export default function OnboardingPage() {
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  
  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }
  
  const handleSubmit = async () => {
    // Save role selections
    for (const roleId of selectedRoles) {
      await supabase
        .from('profile_roles')
        .insert({
          profile_id: profile.id,
          role_id: roleId
        })
    }
    
    // Route based on selections
    const hasStudioOwner = selectedRoles.includes(
      roles.find(r => r.slug === 'studio-owner')?.id
    )
    router.push(hasStudioOwner ? '/dashboard/owner' : '/dashboard')
  }
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {roles.map(role => {
        const Icon = roleIcons[role.slug]
        const isSelected = selectedRoles.includes(role.id)
        
        return (
          <label
            key={role.id}
            className={cn(
              "border rounded-lg p-4 cursor-pointer",
              isSelected && "border-primary bg-primary/5"
            )}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleRoleToggle(role.id)}
              className="sr-only"
            />
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 mt-1" />
              <div>
                <h3 className="font-medium">{role.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
```

### Role-Based Discovery
```tsx
// app/browse/artists/page.tsx
const fetchArtists = async () => {
  const { data } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_roles!inner(
        role:roles!inner(*)
      )
    `)
    .in('profile_roles.role.slug', ['musician', 'podcaster', 'voice-actor'])
  
  // Deduplicate profiles with multiple artist roles
  const uniqueProfiles = deduplicateByField(data, 'id')
  return uniqueProfiles
}
```

### Authentication Context
```tsx
// lib/auth/auth-context.tsx
interface AuthContextType {
  user: User | null
  profile: Profile | null
  professionalRoles: ProfileRole[]  // New field
  loading: boolean
}

// Fetch professional roles with profile
const { data: profileData } = await supabase
  .from('profiles')
  .select(`
    *,
    profile_roles(
      role:roles(*)
    )
  `)
  .eq('user_id', user.id)
  .single()
```

## Migration Strategy

### Phase 1: Add New System
1. Create roles and profile_roles tables
2. Rename profiles.role to system_role
3. Deploy new schema

### Phase 2: Data Migration
```sql
-- Migrate existing roles to new system
INSERT INTO profile_roles (profile_id, role_id)
SELECT 
  p.id,
  CASE 
    WHEN p.system_role = 'creator' THEN 
      (SELECT id FROM roles WHERE slug = 'musician')
    WHEN p.system_role = 'owner' THEN 
      (SELECT id FROM roles WHERE slug = 'studio-owner')
  END
FROM profiles p
WHERE p.system_role IS NOT NULL;
```

### Phase 3: Update Application
1. Update all role references
2. Deploy new onboarding
3. Update navigation logic
4. Add discovery pages

## Component Updates Required

### Before → After
```typescript
// Before
if (profile?.role === 'creator') { }
if (profile?.role === 'owner') { }

// After  
if (profile?.system_role === 'user') { }
if (professionalRoles.some(r => r.role.slug === 'studio-owner')) { }
```

### Affected Components
- `app-sidebar.tsx` - Navigation logic
- `route-guard.tsx` - Onboarding redirect
- `studio-card-actions.tsx` - UI permissions
- `owner-dashboard.tsx` - Access control
- 15+ other components

## Missing Features & Future Enhancements

### Currently Missing
1. **Role Verification**
   - No verification of professional claims
   - Anyone can select any role

2. **Role-Specific Features**
   - Same features regardless of roles
   - No specialized tools per role

3. **Role Hierarchy**
   - All roles treated equally
   - No primary/secondary distinction

### Recommended Additions
1. **Verified Badges**
   - Professional verification process
   - Verified engineer certification
   - Studio owner proof

2. **Role-Specific Dashboards**
   - Musician: Gig calendar
   - Engineer: Project portfolio
   - Manager: Client roster

3. **Role Permissions**
   - Engineers can offer services
   - Managers can book for clients
   - A&R can scout talent

4. **Role Analytics**
   - Most common role combinations
   - Role-based user behavior
   - Conversion by role type

## Performance Considerations

### Query Optimization
```sql
-- Index for role-based queries
CREATE INDEX idx_profile_roles_lookup 
ON profile_roles(role_id, profile_id);

-- Index for profile role fetching
CREATE INDEX idx_profile_roles_profile 
ON profile_roles(profile_id);
```

### Caching Strategy
- Roles list: Static, permanent cache
- User roles: Cache with profile
- Discovery queries: 5-minute cache

## Testing Scenarios

### Manual Testing
1. Onboard with single role → Verify routing
2. Onboard with multiple → Verify all saved
3. Edit roles in settings → Verify updates
4. Browse by role → Verify filtering

### Automated Testing
```typescript
describe('Professional Roles', () => {
  it('requires at least one role selection', async () => {
    await page.goto('/onboarding')
    await page.click('button:has-text("Continue")')
    await expect(page.locator('text=Select at least one role')).toBeVisible()
  })
  
  it('saves multiple role selections', async () => {
    await page.click('text=Musician')
    await page.click('text=Audio Engineer')
    await page.click('button:has-text("Continue")')
    
    const roles = await getUserRoles(userId)
    expect(roles).toHaveLength(2)
    expect(roles.map(r => r.slug)).toContain('musician')
    expect(roles.map(r => r.slug)).toContain('engineer')
  })
})
```

## Implementation Status
✅ **COMPLETED** - July 13, 2025

The expanded user roles system is fully implemented with multi-role support, discovery pages, and seamless migration from the old binary system. Users can now express their full professional identity within the platform.