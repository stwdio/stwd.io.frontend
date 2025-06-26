"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Edit, Eye, Trash2, MoreHorizontal, Info, Building2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Studio {
  id: number
  name: string
  description: string | null
  hourly_rate: number
  published: boolean
  created_at: string
  gear: any
  verification_status: string
  location: string
}

export default function MyStudiosPage() {
  const [studios, setStudios] = useState<Studio[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (!profileData || (profileData.role !== 'owner' && profileData.role !== 'admin')) {
        router.push('/dashboard')
        return
      }

      setProfile(profileData)
      await fetchStudios(profileData.id)
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudios = async (profileId: number) => {
    const { data, error } = await supabase
      .from('studios')
      .select('*')
      .eq('owner_id', profileId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching studios:', error)
      toast({
        title: "Error",
        description: "Failed to load studios",
        variant: "destructive",
      })
      return
    }

    setStudios(data || [])
  }

  const handleEdit = (studio: Studio) => {
    router.push(`/dashboard/studios/${studio.id}/edit`)
  }

  const handleDelete = async (studioId: number) => {
    if (!confirm('Are you sure you want to delete this studio? This action cannot be undone.')) {
      return
    }

    const { error } = await supabase
      .from('studios')
      .delete()
      .eq('id', studioId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete studio",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Studio deleted successfully",
    })

    setStudios(studios.filter(s => s.id !== studioId))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading studios...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Building2 className="h-8 w-8 mr-3" />
              My Studios
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your recording studios and track their performance
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/studios/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Studio
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Studios</CardTitle>
        </CardHeader>
        <CardContent>
          {studios.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Studio Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studios.map((studio) => {
                  const isVerified = studio.verification_status === 'verified'
                  const canPublish = isVerified
                  
                  return (
                    <TableRow key={studio.id}>
                      <TableCell className="font-medium">{studio.name}</TableCell>
                      <TableCell>{studio.location || 'Not specified'}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <Badge variant={studio.published && canPublish ? "default" : "secondary"}>
                                  {studio.published && canPublish ? "Published" : "Draft"}
                                </Badge>
                                {!canPublish && studio.published && (
                                  <Info className="h-4 w-4 text-amber-500" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {!canPublish ? 
                                "Studio must be verified by an admin before it can be published" : 
                                studio.published ? "Studio is live and visible to customers" : "Studio is saved as draft"
                              }
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <Badge variant={isVerified ? "default" : "secondary"}>
                                  {isVerified ? "Verified" : "Pending"}
                                </Badge>
                                {!isVerified && (
                                  <Info className="h-4 w-4 text-amber-500" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isVerified ? 
                                "Studio has been verified by an admin and can be published" : 
                                "Studio needs to be verified by an admin before it can be published"
                              }
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>${studio.hourly_rate}/hr</TableCell>
                      <TableCell>{formatDate(studio.created_at)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(studio)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/studios/${studio.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Public Page
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(studio.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Studios Yet</h3>
              <p className="text-muted-foreground mb-6">Create your first studio to get started</p>
              <Button onClick={() => router.push('/dashboard/studios/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Studio
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 