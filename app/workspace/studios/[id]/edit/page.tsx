import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { BackButton } from '@/components/back-button'
import { EditStudioForm } from '@/components/forms/edit-studio-form'

interface EditStudioPageProps {
  params: {
    id: string
  }
}

export default async function EditStudioPage({ params }: EditStudioPageProps) {
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
  
  // Fetch the studio
  const { data: studio, error } = await supabase
    .from('studios')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error || !studio) {
    redirect('/workspace')
  }
  
  // Check if user owns this studio or is admin
  if (studio.owner_id !== user.id && profile.system_role !== 'admin') {
    redirect('/workspace')
  }

  return (
    <div className="container max-w-4xl py-8">
      <BackButton href="/workspace" label="Back to Workspace" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Studio</h1>
        <p className="text-muted-foreground mt-2">
          Update your studio information
        </p>
      </div>
      
      <EditStudioForm studio={studio} userId={user.id} />
    </div>
  )
}