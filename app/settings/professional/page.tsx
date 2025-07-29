import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfessionalSettingsForm } from '@/components/settings/professional-settings-form'

export default async function ProfessionalSettingsPage() {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Professional Profile</CardTitle>
          <CardDescription>
            Customize your public profile to showcase your work and connect with others
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ProfessionalSettingsForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  )
}