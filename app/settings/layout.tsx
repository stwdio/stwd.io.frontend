import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { MainSectionNavigation } from '@/components/navigation/main-section-navigation'
import { SettingsPageContent } from '@/components/settings/settings-page-content'
import { ReactNode } from 'react'

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createServerComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main navigation header */}
      <MainSectionNavigation />
      
      {/* Dynamic content area with mobile support */}
      <div className="flex-1 overflow-hidden">
        <SettingsPageContent>
          {children}
        </SettingsPageContent>
      </div>
    </div>
  )
}