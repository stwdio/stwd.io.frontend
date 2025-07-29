import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createServerActionClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next')
  const code = searchParams.get('code')

  if (token_hash && type) {
    const supabase = await createServerActionClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // Check if user needs onboarding
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('system_role')
          .eq('user_id', user.id)
          .single()
        
        if (!profile?.system_role) {
          redirect('/onboarding')
        }
      }
      
      // Redirect to specified URL or default to chat for logged-in users
      redirect(next || '/chat')
    }
  }

  if (code) {
    const supabase = await createServerActionClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user needs onboarding
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('system_role')
          .eq('user_id', user.id)
          .single()
        
        if (!profile?.system_role) {
          redirect('/onboarding')
        }
      }
      
      // Redirect to chat for logged-in users
      redirect('/chat')
    }
  }

  // redirect the user to an error page with instructions
  redirect('/auth/login?message=Could not authenticate user')
} 