import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Users, Star, MapPin, Quote, Trash2, Plus } from 'lucide-react'
import { getListDetails, removeStudioFromList } from '@/lib/actions/lists'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StudioImage } from '@/components/studio-image-placeholder'
import { StudioCardActions } from '@/components/studio-card-actions'
import { StudioListMembershipIndicators } from '@/components/studio-list-membership-indicators'
import { StudioCard } from '@/components/studio-card'
import { AddListToQuoteButton } from '@/components/add-list-to-quote-button'

interface Props {
  params: Promise<{
    id: string
  }>
}

async function getUserProfile() {
  const supabase = await createClient()
  
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
    redirect('/onboarding')
  }

  return profile
}

// This function is no longer needed as we're using the imported component directly

// Component for removing a studio from the list
function RemoveStudioButton({ listId, studioId }: { listId: string, studioId: number }) {
  const handleRemove = async () => {
    'use server'
    await removeStudioFromList(listId, studioId.toString())
  }

  return (
    <form action={handleRemove}>
      <Button 
        type="submit" 
        variant="outline" 
        size="sm" 
        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-3 w-3" />
        Remove
      </Button>
    </form>
  )
}

// Studio card component optimized for list view
function ListStudioCard({ studio, listId }: { studio: any, listId: string }) {
  const customActions = (
    <div className="flex gap-2">
      <Link href={`/studios/${studio.id}`} className="flex-1">
        <Button variant="outline" size="sm" className="w-full">
          View Details
        </Button>
      </Link>
      <RemoveStudioButton listId={listId} studioId={studio.id} />
    </div>
  )

  return (
    <StudioCard
      studio={{
        ...studio,
        verification_status: studio.verification_status || 'unverified'
      }}
      showAmenities={false}
      showNotes={true}
      linkToStudio={false}
      customActions={customActions}
      className="group transition-all duration-200"
    />
  )
}

function ListDetailContent({ listId, list }: { listId: string, list: any }) {

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/lists">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Lists
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{list.icon_emoji}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{list.name}</h1>
              <div className="flex flex-col gap-2 mt-2 text-muted-foreground md:flex-row md:items-center md:gap-4">
                <span className="text-sm md:text-base">{list.studio_count} studio{list.studio_count !== 1 ? 's' : ''}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-sm md:text-base">
                    <span className="hidden md:inline">Created </span>
                    {new Date(list.created_at).toLocaleDateString()}
                  </span>
                </div>
                {list.is_public && (
                  <Badge variant="secondary" className="w-fit">
                    <Users className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Public</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Add to Quote button */}
          <div className="hidden md:flex flex-shrink-0">
            <AddListToQuoteButton studios={list.studios} />
          </div>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Studios */}
      {list.studios.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No studios in this list yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start adding studios to your list by browsing our catalog and clicking "Add to List".
          </p>
          <Link href="/browse">
            <Button>
              Browse Studios
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            {/* Mobile: Both buttons */}
            <div className="md:hidden flex items-center justify-between w-full gap-3">
              <div className="flex-1">
                <AddListToQuoteButton studios={list.studios} />
              </div>
              <Link href="/browse">
                <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                  <Plus className="h-4 w-4" />
                  <span className="hidden xs:inline">Add More</span>
                  <span className="xs:hidden">+</span>
                </Button>
              </Link>
            </div>
            
            {/* Desktop: Add More Studios button */}
            <Link href="/browse" className="hidden md:block">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add More Studios
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.studios.map((studio: any) => (
              <ListStudioCard 
                key={studio.id} 
                studio={studio} 
                listId={listId}
              />
            ))}
          </div>

        </>
      )}
    </div>
  )
}

export default async function ListDetailPage({ params }: Props) {
  const { id } = await params
  const listResult = await getListDetails(id)

  if (!listResult.success) {
    if (listResult.error?.includes('not found') || listResult.error?.includes('permission denied')) {
      notFound()
    }
    
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load list</p>
        <p className="text-sm text-red-500">{listResult.error}</p>
      </div>
    )
  }

  const list = listResult.data!

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-8 bg-muted animate-pulse rounded-md w-24"></div>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted animate-pulse rounded-md"></div>
              <div>
                <div className="h-8 bg-muted animate-pulse rounded-md w-48 mb-2"></div>
                <div className="h-4 bg-muted animate-pulse rounded-md w-64"></div>
              </div>
            </div>
            <div className="h-10 bg-muted animate-pulse rounded-md w-48"></div>
          </div>
        </div>

        <div className="h-px bg-muted mb-8"></div>

        {/* Studios grid skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    }>
      <ListDetailContent listId={id} list={list} />
    </Suspense>
  )
} 