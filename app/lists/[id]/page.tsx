import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Users, Star, MapPin, Quote, Trash2, Plus } from 'lucide-react'
import { getListDetails, removeStudioFromList, addListToQuoteBasket } from '@/lib/actions/lists'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StudioImage } from '@/components/studio-image-placeholder'
import { StudioCardActions } from '@/components/studio-card-actions'
import { StudioListMembershipIndicators } from '@/components/studio-list-membership-indicators'

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

// Component for the "Add List to Quote" button
function AddListToQuoteButton({ listId, studioCount }: { listId: string, studioCount: number }) {
  const handleAddToQuote = async () => {
    'use server'
    const result = await addListToQuoteBasket(listId)
    // Note: In a real app, we'd handle the response with toast notifications
    // For now, this will leverage the existing quote basket system
  }

  if (studioCount === 0) return null

  return (
    <form action={handleAddToQuote}>
      <Button type="submit" size="lg" className="gap-2">
        <Quote className="h-4 w-4" />
        Add List to Quote ({studioCount} studios)
      </Button>
    </form>
  )
}

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
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg h-full flex flex-col">
      <div className="aspect-video relative overflow-hidden">
        <StudioImage 
          src={null} 
          alt={`${studio.name} studio`} 
          className="w-full h-full object-cover" 
          fill 
        />
      </div>
      
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Header with title and price */}
        <div className="flex justify-between items-start mb-2">
          <Link href={`/studios/${studio.id}`}>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors cursor-pointer line-clamp-1">
              {studio.name}
            </h3>
          </Link>
          <div className="text-right shrink-0 ml-2">
            <div className="font-bold text-lg">${studio.hourly_rate}</div>
            <div className="text-xs text-muted-foreground">per hour</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1 shrink-0" />
          <span className="truncate">{studio.location}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex gap-1 mr-2">
            {renderStars(Math.round(studio.average_rating || 0))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({studio.review_count || 0} reviews)
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 flex-1 line-clamp-2">
          {studio.description}
        </p>

        {/* Notes if any */}
        {studio.notes && (
          <div className="mb-3 p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">My notes:</p>
            <p className="text-sm">{studio.notes}</p>
          </div>
        )}

        {/* Other list memberships */}
        <StudioListMembershipIndicators 
          studioId={studio.id.toString()} 
          className="mb-3"
          maxVisible={2}
        />

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link href={`/studios/${studio.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          <RemoveStudioButton listId={listId} studioId={studio.id} />
        </div>
      </CardContent>
    </Card>
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

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{list.icon_emoji}</span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{list.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <span>{list.studio_count} studio{list.studio_count !== 1 ? 's' : ''}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(list.created_at).toLocaleDateString()}</span>
                </div>
                {list.is_public && (
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <AddListToQuoteButton listId={listId} studioCount={list.studio_count} />
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
            <h2 className="text-xl font-semibold">Studios in this list</h2>
            <Link href="/browse">
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

          {/* Power feature callout */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
              <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
                <Quote className="h-5 w-5 text-primary" />
                Power Feature
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Save time by requesting quotes from all studios in this list at once! 
                We'll automatically check for duplicates and only add new inquiries.
              </p>
              <AddListToQuoteButton listId={listId} studioCount={list.studio_count} />
            </div>
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