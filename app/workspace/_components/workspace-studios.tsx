import { createServerComponentClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, BarChart3, MapPin } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getPriceTierSymbol } from '@/lib/constants/currencies'

interface WorkspaceStudiosProps {
  userId: string
}

export async function WorkspaceStudios({ userId }: WorkspaceStudiosProps) {
  const supabase = await createServerComponentClient()
  
  // Get user's studios
  const { data: studios } = await supabase
    .from('studios')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">My Studios</h2>
          <p className="text-muted-foreground">
            Manage your studio listings and view performance
          </p>
        </div>
        <Button asChild>
          <Link href="/workspace/studios/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Studio
          </Link>
        </Button>
      </div>
      
      {studios && studios.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => (
            <Card key={studio.id}>
              <CardHeader>
                <CardTitle className="line-clamp-1">{studio.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {studio.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{getPriceTierSymbol(studio.price_tier || 1)}</span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs",
                    studio.published 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-700"
                  )}>
                    {studio.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/workspace/studios/${studio.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/workspace/studios/${studio.id}/analytics`}>
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analytics
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any studios yet
            </p>
            <Button asChild>
              <Link href="/workspace/studios/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Studio
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}