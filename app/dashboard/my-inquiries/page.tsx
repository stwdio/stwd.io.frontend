import { MyInquiriesDashboard } from '@/components-old/my-inquiries-dashboard'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function MyInquiriesPage() {
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Inquiries</h1>
        <p className="text-muted-foreground">
          Track your studio inquiries and responses
        </p>
      </div>
      
      <MyInquiriesDashboard />
    </div>
  )
} 