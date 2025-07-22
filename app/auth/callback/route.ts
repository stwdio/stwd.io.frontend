import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createServerActionClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/discover'
  const code = searchParams.get('code')

  if (token_hash && type) {
    const supabase = await createServerActionClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // redirect user to specified redirect URL or browse page
      redirect(next)
    }
  }

  if (code) {
    const supabase = await createServerActionClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // redirect user to discover page - OnboardingGate will handle routing
      redirect('/discover')
    }
  }

  // redirect the user to an error page with instructions
  redirect('/auth/login?message=Could not authenticate user')
} 