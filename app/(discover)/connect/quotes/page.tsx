import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { QuotesHub } from '@/components/quotes/quotes-hub'

interface QuotesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const supabase = await createServerComponentClient()
  const params = await searchParams
  
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

  const selectedQuoteId = params.quote as string | undefined
  
  let quotes = []
  
  console.log('Profile:', profile)
  console.log('Profile system_role:', profile.system_role)
  
  // For creators: get their sent inquiries
  if (profile.system_role === 'user') {
    const { data, error } = await supabase
      .from('inquiry_recipients')
      .select(`
        inquiry_id,
        studio_id,
        created_at,
        status,
        response_message,
        quote_amount,
        responded_at,
        inquiry:inquiries!inner (
          id,
          project_type,
          budget_range,
          custom_message
        ),
        studio:studios!inner (
          id,
          name,
          location,
          photo_urls
        )
      `)
      .eq('inquiry.creator_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching quotes:', error)
    }

    if (!error && data) {
      quotes = data.map(item => ({
        id: `${item.inquiry_id}-${item.studio_id}`,
        created_at: item.created_at,
        status: item.status as 'pending' | 'responded' | 'declined',
        project_type: item.inquiry.project_type,
        budget_range: item.inquiry.budget_range,
        custom_message: item.inquiry.custom_message,
        studio: item.studio,
        response: item.response_message ? {
          id: `${item.inquiry_id}-${item.studio_id}`,
          price: item.quote_amount,
          message: item.response_message,
          created_at: item.responded_at || item.created_at
        } : undefined,
        conversation_id: undefined // TODO: Add conversation lookup
      }))
    }
  }
  // For studio owners: get received inquiries
  else if (profile.system_role === 'owner') {
    const { data: studioData } = await supabase
      .from('studios')
      .select('id')
      .eq('owner_id', profile.user_id)
      .single()

    if (studioData) {
      const { data, error } = await supabase
        .from('inquiry_recipients')
        .select(`
          inquiry_id,
          studio_id,
          created_at,
          status,
          response_message,
          quote_amount,
          responded_at,
          inquiry:inquiries!inner (
            id,
            project_type,
            budget_range,
            custom_message,
            creator:profiles!inquiries_creator_id_fkey (
              id,
              first_name,
              last_name,
              username,
              avatar_url
            )
          )
        `)
        .eq('studio_id', studioData.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching quotes for owner:', error)
      }

      if (!error && data) {
        // Map to quote format for consistency
        quotes = data.map(item => ({
          id: `${item.inquiry_id}-${item.studio_id}`,
          created_at: item.created_at,
          status: item.status as 'pending' | 'responded' | 'declined',
          project_type: item.inquiry.project_type,
          budget_range: item.inquiry.budget_range,
          custom_message: item.inquiry.custom_message,
          studio: {
            id: studioData.id,
            name: item.inquiry.creator.first_name + ' ' + item.inquiry.creator.last_name,
            location: '', // Creator location not stored
            photo_urls: item.inquiry.creator.avatar_url ? [item.inquiry.creator.avatar_url] : []
          },
          response: item.response_message ? {
            id: `${item.inquiry_id}-${item.studio_id}`,
            price: item.quote_amount,
            message: item.response_message,
            created_at: item.responded_at || item.created_at
          } : undefined,
          conversation_id: undefined // TODO: Add conversation lookup for owners
        }))
      }
    }
  }

  return (
    <QuotesHub 
      userId={user.id}
      profile={profile}
      initialQuotes={quotes || []}
      initialSelectedQuoteId={selectedQuoteId}
    />
  )
}