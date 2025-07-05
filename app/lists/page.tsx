import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Users, ChevronRight } from 'lucide-react'
import { getUserLists } from '@/lib/actions/lists'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CreateListButton from '@/components/create-list-button'

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

function ListsContent({ lists }: { lists: any[] }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-2 mb-6 md:gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Lists</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Organize your favorite studios into custom collections
          </p>
        </div>
        <div className="flex-shrink-0 mt-1 md:mt-0">
          <CreateListButton />
        </div>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No lists yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first list to start organizing studios. Perfect for different projects, 
            genres, or recording needs.
          </p>
          <CreateListButton variant="default" />
        </div>
      ) : (
        <div className="grid gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Link key={list.id} href={`/lists/${list.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
                {/* Mobile Compact Layout */}
                <div className="md:hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Icon and Title Section */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg">{list.icon_emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {list.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span>
                              <span className="font-medium text-foreground">{list.studio_count}</span>{' '}
                              studio{list.studio_count !== 1 ? 's' : ''}
                            </span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              <span>{new Date(list.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions Section */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {list.is_public && (
                          <Badge variant="secondary" className="h-5 text-xs px-1.5">
                            <Users className="h-2.5 w-2.5 mr-1" />
                            <span className="hidden xs:inline">Public</span>
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Desktop Layout (unchanged) */}
                <div className="hidden md:block">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-2xl">{list.icon_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {list.name}
                        </h3>
                      </div>
                      {list.is_public && (
                        <Badge variant="secondary" className="shrink-0">
                          <Users className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {list.studio_count}
                        </span>
                        <span>
                          studio{list.studio_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs md:text-sm">
                          {new Date(list.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full group-hover:bg-primary/10 transition-colors"
                      >
                        View List →
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default async function ListsPage() {
  const profile = await getUserProfile()
  const listsResult = await getUserLists()

  if (!listsResult.success) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load your lists</p>
        <p className="text-sm text-red-500">{listsResult.error}</p>
      </div>
    )
  }

  const lists = listsResult.data || []

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 bg-muted animate-pulse rounded-md w-48 mb-2"></div>
            <div className="h-4 bg-muted animate-pulse rounded-md w-64"></div>
          </div>
          <div className="h-10 bg-muted animate-pulse rounded-md w-32"></div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    }>
      <ListsContent lists={lists} />
    </Suspense>
  )
} 