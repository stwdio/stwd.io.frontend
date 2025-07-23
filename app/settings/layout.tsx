import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { SettingsNav } from '@/components/settings/settings-nav'
import { UnifiedLayout } from '@/components/layouts/unified-layout'

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
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
    <UnifiedLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and profile settings
          </p>
        </div>
        
        <div className="flex gap-8">
          <aside className="w-64 shrink-0">
            <SettingsNav />
          </aside>
          
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </UnifiedLayout>
  )
}