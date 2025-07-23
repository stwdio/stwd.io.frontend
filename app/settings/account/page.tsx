import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountSettingsForm } from '@/components/settings/account-settings-form'

export default async function AccountSettingsPage() {
  const supabase = await createServerComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your email, password, and account security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSettingsForm user={user} />
        </CardContent>
      </Card>
    </div>
  )
}