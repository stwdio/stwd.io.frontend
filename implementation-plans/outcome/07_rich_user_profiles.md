# Rich User Profiles - Technical Overview

## Feature Summary
Rich User Profiles transform basic user accounts into comprehensive professional showcases. Users can now create detailed profiles with bios, skills, portfolio links, and social media connections, establishing their professional identity and enabling meaningful connections within the creative community.

## User Stories Implemented

### 1. Professional Identity Showcase
**As a** creative professional  
**I want to** create a comprehensive profile that showcases my work and experience  
**So that** potential collaborators can understand my capabilities

**Implementation:**
- Rich text bio with 500 character limit
- Skills tags (up to 20)
- Portfolio links (SoundCloud, Spotify, etc.)
- Social media integration
- Professional website link

### 2. Public Profile Pages
**As a** user browsing for collaborators  
**I want to** view detailed profiles of other professionals  
**So that** I can make informed decisions about who to work with

**Implementation:**
- SEO-optimized public profile URLs
- Clean username-based routing
- Structured data for search engines
- Professional layout with all details

### 3. Skills-Based Discovery
**As a** studio owner looking for an engineer  
**I want to** search professionals by their skills  
**So that** I can find the right expertise for my needs

**Implementation:**
- Searchable skills array
- Tag-based UI for easy scanning
- Skills displayed on profile cards
- Future: Skills-based filtering

## Technical Architecture

### Database Schema
```sql
-- Extended profile fields
ALTER TABLE profiles
ADD COLUMN bio TEXT,
ADD COLUMN website TEXT,
ADD COLUMN skills TEXT[] DEFAULT '{}',
ADD COLUMN social_links JSONB DEFAULT '{}',
ADD COLUMN portfolio_links JSONB DEFAULT '{}';

-- Set defaults for existing records
UPDATE profiles
SET 
  bio = '',
  skills = '{}',
  social_links = '{}',
  portfolio_links = '{}'
WHERE bio IS NULL;
```

### Data Structure
```typescript
interface Profile {
  id: number
  username: string
  first_name: string
  last_name: string
  bio: string | null
  website: string | null
  skills: string[]
  social_links: {
    twitter?: string
    instagram?: string
    linkedin?: string
    facebook?: string
  }
  portfolio_links: {
    soundcloud?: string
    spotify?: string
    apple_music?: string
    youtube?: string
    bandcamp?: string
    custom?: { title: string; url: string }[]
  }
}
```

### Routes
```
app/
├── profiles/[username]/         # Public profile pages
│   └── page.tsx
└── profile/settings/
    └── professional/           # Profile editor
        └── page.tsx
```

## User Journey

### 1. Profile Creation Flow
- User completes basic registration
- Navigates to Settings → Professional Profile
- Adds bio describing their background
- Tags relevant skills (mixing, mastering, vocals, etc.)
- Links social media accounts
- Adds portfolio/work samples
- Saves and views public profile

### 2. Profile Editor Interface
```
Professional Profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bio
┌─────────────────────────────────┐
│ Tell us about yourself...       │
│                                 │
│                                 │
└─────────────────────────────────┘
Characters: 125/500

Skills (up to 20)
[Mixing] [Mastering] [+ Add skill]

Website
[https://mywebsite.com         ]

Social Media
Twitter:    [@username        ]
Instagram:  [@username        ]
LinkedIn:   [/in/username     ]

Portfolio Links
SoundCloud: [soundcloud.com/username]
Spotify:    [Artist profile URL     ]

[Save Changes]
```

### 3. Public Profile View
- Clean URL: `/profiles/johnsmith`
- Professional header with name and roles
- Bio section with full text
- Skills displayed as tags
- Social links as icons
- Portfolio section with platform logos
- Contact button (requires auth)

### 4. Discovery Integration
- Profile cards show bio preview
- Skills visible on browse pages
- Quick preview on hover
- Full profile on click

## Implementation Details

### Profile Editor Component
```tsx
// app/profile/settings/professional/page.tsx
export default function ProfessionalProfilePage() {
  const [formData, setFormData] = useState({
    bio: '',
    website: '',
    skills: [],
    social_links: {},
    portfolio_links: {}
  })

  const handleAddSkill = (skill: string) => {
    if (formData.skills.length < 20) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
  }

  const handleRemoveSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        bio: formData.bio,
        website: formData.website,
        skills: formData.skills,
        social_links: formData.social_links,
        portfolio_links: formData.portfolio_links,
      })
      .eq('user_id', user?.id)

    if (!error) {
      toast.success('Profile updated successfully')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Professional Profile</h1>
      
      <div className="space-y-6">
        {/* Bio Section */}
        <div>
          <Label>Bio</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Tell us about yourself..."
            maxLength={500}
            rows={4}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {formData.bio.length}/500 characters
          </p>
        </div>

        {/* Skills Section */}
        <div>
          <Label>Skills (up to 20)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => handleRemoveSkill(index)}
                />
              </Badge>
            ))}
            {formData.skills.length < 20 && (
              <AddSkillDialog onAdd={handleAddSkill} />
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Twitter"
            placeholder="@username"
            value={formData.social_links.twitter || ''}
            onChange={(e) => setFormData({
              ...formData,
              social_links: {...formData.social_links, twitter: e.target.value}
            })}
          />
          {/* More social inputs... */}
        </div>

        <Button onClick={handleSubmit}>Save Changes</Button>
      </div>
    </div>
  )
}
```

### Public Profile Page
```tsx
// app/profiles/[username]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const profile = await getProfileByUsername(params.username)
  
  return {
    title: `${profile.first_name} ${profile.last_name} | stwd.io`,
    description: profile.bio || `Professional profile of ${profile.first_name}`,
    openGraph: {
      title: `${profile.first_name} ${profile.last_name}`,
      description: profile.bio,
      type: 'profile',
      url: `https://stwd.io/profiles/${profile.username}`,
    }
  }
}

export default async function PublicProfilePage({ params }) {
  const supabase = createServerComponentClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_roles(
        role:roles(*)
      )
    `)
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  return (
    <div className="container max-w-4xl mx-auto py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {profile.first_name} {profile.last_name}
        </h1>
        <div className="flex gap-2 mt-2">
          {profile.profile_roles.map(({ role }) => (
            <Badge key={role.id}>{role.name}</Badge>
          ))}
        </div>
      </div>

      {/* Bio Section */}
      {profile.bio && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-2">About</h2>
            <p className="text-muted-foreground">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills Section */}
      {profile.skills?.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="font-semibold mb-3">Portfolio</h2>
          <div className="space-y-2">
            {profile.portfolio_links?.soundcloud && (
              <Link
                href={profile.portfolio_links.soundcloud}
                className="flex items-center gap-2 hover:underline"
              >
                <Music className="h-4 w-4" />
                SoundCloud
              </Link>
            )}
            {/* More portfolio links... */}
          </div>
        </CardContent>
      </Card>

      {/* Contact Button */}
      <GuestAwareContactButton profileId={profile.id} />
    </div>
  )
}
```

### Skills Management
```tsx
// Add skill dialog component
function AddSkillDialog({ onAdd }) {
  const [skill, setSkill] = useState('')
  
  const commonSkills = [
    'Mixing', 'Mastering', 'Recording', 'Production',
    'Vocals', 'Guitar', 'Piano', 'Drums',
    'Composition', 'Arrangement', 'Sound Design'
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-3 w-3 mr-1" />
          Add skill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Skill</DialogTitle>
        </DialogHeader>
        
        <Input
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Enter a skill..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && skill) {
              onAdd(skill)
              setSkill('')
            }
          }}
        />
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Common skills:
          </p>
          <div className="flex flex-wrap gap-2">
            {commonSkills.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  onAdd(s)
                  setSkill('')
                }}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

## Social Media Integration

### Platform Icons
```tsx
const socialIcons = {
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
}

const portfolioIcons = {
  soundcloud: Music,
  spotify: Music2,
  apple_music: Apple,
  youtube: Youtube,
  bandcamp: Disc,
}
```

### URL Validation
```typescript
const validateSocialUrl = (platform: string, url: string): boolean => {
  const patterns = {
    twitter: /^@?[\w]{1,15}$/,
    instagram: /^@?[\w.]{1,30}$/,
    linkedin: /^\/in\/[\w-]+$/,
    soundcloud: /^https?:\/\/(www\.)?soundcloud\.com\/[\w-]+$/,
    spotify: /^https?:\/\/open\.spotify\.com\/artist\/[\w]+$/,
  }
  
  return patterns[platform]?.test(url) || false
}
```

## Missing Features & Future Enhancements

### Currently Missing
1. **Media Uploads**
   - No profile photos
   - No banner images
   - No audio samples

2. **Verification**
   - No verified badge system
   - No credential verification
   - No platform verification

3. **Analytics**
   - No profile view counts
   - No engagement metrics
   - No visitor tracking

### Recommended Additions
1. **Rich Media Gallery**
   ```tsx
   <MediaGallery>
     <AudioSample src="/samples/track1.mp3" />
     <VideoEmbed url="youtube.com/watch?v=..." />
     <ImageGallery images={portfolio.images} />
   </MediaGallery>
   ```

2. **Professional Verification**
   - Industry credentials
   - Certification badges
   - Platform achievements

3. **Collaboration History**
   - Past projects
   - Client testimonials
   - Peer endorsements

4. **Availability Calendar**
   - Show when available
   - Booking integration
   - Time zone support

## SEO Optimization

### Structured Data
```tsx
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: `${profile.first_name} ${profile.last_name}`,
  url: `https://stwd.io/profiles/${profile.username}`,
  description: profile.bio,
  jobTitle: profile.profile_roles.map(r => r.role.name).join(', '),
  knowsAbout: profile.skills,
  sameAs: Object.values(profile.social_links).filter(Boolean),
}
```

### Meta Tags
- Open Graph profile type
- Twitter Card with summary
- Canonical URLs
- Schema.org Person markup

## Performance Considerations

### Optimizations
- Lazy load social icons
- Debounced skill search
- Optimistic UI updates
- Profile data caching

### Image Handling (Future)
```typescript
// Future implementation
const profileImageSizes = {
  thumbnail: { width: 64, height: 64 },
  card: { width: 200, height: 200 },
  full: { width: 400, height: 400 },
}
```

## Privacy & Security

### Profile Visibility
- All profiles are public
- Contact requires authentication
- No private profile option (yet)
- Skills and bio always visible

### Data Validation
- XSS prevention on all text inputs
- URL validation for links
- Skill name sanitization
- Bio content filtering

## Testing Scenarios

### Manual Testing
1. Create comprehensive profile → Verify all fields save
2. Add 20 skills → Verify limit enforcement
3. View public profile → Verify SEO tags
4. Test all social links → Verify formatting

### Automated Testing
```typescript
describe('Rich User Profiles', () => {
  it('enforces skill limit', async () => {
    const profile = await createProfile()
    const skills = Array(20).fill('skill')
    
    await updateProfile(profile.id, { skills })
    
    const addButton = page.locator('text=Add skill')
    await expect(addButton).not.toBeVisible()
  })
  
  it('generates correct public URL', async () => {
    const profile = await createProfile({ username: 'johndoe' })
    await page.goto(`/profiles/${profile.username}`)
    
    await expect(page).toHaveURL('/profiles/johndoe')
    await expect(page.locator('h1')).toContainText('John Doe')
  })
  
  it('validates social media URLs', async () => {
    await page.fill('[name="twitter"]', 'not-a-valid-handle!')
    await expect(page.locator('text=Invalid Twitter handle')).toBeVisible()
  })
})
```

## Analytics Events

### Track User Behavior
- Profile completion percentage
- Most common skills added
- Social link click-through rates
- Profile view duration

### Conversion Metrics
- Guest → Contact attempt
- Profile view → Message sent
- Skills match → Collaboration

## Implementation Status
✅ **COMPLETED** - July 13, 2025

Rich User Profiles are fully implemented, transforming stwd.io from a simple directory into a professional networking platform. Users can now create comprehensive profiles that showcase their skills, experience, and work, enabling meaningful connections within the creative community.