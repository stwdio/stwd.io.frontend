import { ProfileContent } from './profile-content'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Role = Database['public']['Tables']['roles']['Row']

interface ProfileWithLayoutProps {
  profile: Profile & {
    profile_roles: { role: Role }[]
  }
}

export function ProfileWithLayout({ profile }: ProfileWithLayoutProps) {
  return <ProfileContent profile={profile} />
}