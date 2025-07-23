import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { BackButton } from '@/components/back-button'
import { CreateStudioForm } from '@/components/forms/create-studio-form'

export default async function NewStudioPage() {
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
  
  if (!profile || !['owner', 'admin'].includes(profile.system_role || '')) {
    redirect('/chat')
  }

  return (
    <div className="container max-w-4xl py-8">
      <BackButton href="/workspace" label="Back to Workspace" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Studio</h1>
        <p className="text-muted-foreground mt-2">
          Add a new studio to your portfolio
        </p>
      </div>
      
      <CreateStudioForm userId={user.id} />
    </div>
  )
}