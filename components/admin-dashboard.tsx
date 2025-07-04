'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  IconDots, 
  IconEdit, 
  IconTrash, 
  IconCheck, 
  IconX, 
  IconEye,
  IconPlus,
  IconBuilding
} from '@tabler/icons-react'

interface Studio {
  id: number
  name: string
  description: string
  location: string
  verification_status: string
  claimed_by: number | null
  owner_id: number | null
  verification_documents: any
  created_at: string
  published: boolean
  profiles?: {
    first_name: string
    last_name: string
    username: string
  }
  hourly_rate?: number
  photo_urls?: string[]
}

interface Profile {
  id: number
  username: string
  first_name: string
  last_name: string
  role: string
  created_at: string
}

export function AdminDashboard() {
  const [allStudios, setAllStudios] = useState<Studio[]>([])
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null)
  const [studioFormOpen, setStudioFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studioToDelete, setStudioToDelete] = useState<Studio | null>(null)
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('')
  const [studioForm, setStudioForm] = useState({
    name: '',
    description: '',
    location: '',
    hourly_rate: '',
    verification_status: 'unverified'
  })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch all studios with their owners
      const { data: studios } = await supabase
        .from('studios')
        .select(`
          *,
          profiles:owner_id (
            first_name,
            last_name,
            username
          )
        `)
        .order('created_at', { ascending: false })

      // Fetch all users
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setAllStudios(studios || [])
      setAllUsers(users || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleEditStudio = (studio: Studio) => {
    setEditingStudio(studio)
    setStudioForm({
      name: studio.name,
      description: studio.description,
      location: studio.location,
      hourly_rate: studio.hourly_rate?.toString() || '',
      verification_status: studio.verification_status
    })
    setStudioFormOpen(true)
  }

  const handleUpdateStudio = async () => {
    if (!editingStudio) return

    try {
      const { error } = await supabase
        .from('studios')
        .update({
          name: studioForm.name,
          description: studioForm.description,
          location: studioForm.location,
          hourly_rate: studioForm.hourly_rate ? parseInt(studioForm.hourly_rate) : null,
          verification_status: studioForm.verification_status
        })
        .eq('id', editingStudio.id)

      if (error) throw error

      toast.success('Studio updated successfully')
      setStudioFormOpen(false)
      setEditingStudio(null)
      fetchData()
    } catch (error) {
      console.error('Error updating studio:', error)
      toast.error('Failed to update studio')
    }
  }

  const handleDeleteStudio = async () => {
    if (!studioToDelete || deleteConfirmationName !== studioToDelete.name) {
      return
    }

    try {
      const { data, error } = await supabase.rpc('delete_studio_safely', {
        studio_id_param: studioToDelete.id
      })

      if (error) throw error

      if (data.success) {
        const stats = data.cleanup_stats
        toast.success(
          `Studio deleted successfully! Cleaned up ${stats.conversations_deleted} conversations, ${stats.bookings_deleted} bookings, and ${stats.messages_deleted} messages.`
        )
        setDeleteDialogOpen(false)
        setStudioToDelete(null)
        setDeleteConfirmationName('')
        fetchData()
      } else {
        throw new Error(data.error || 'Failed to delete studio')
      }
    } catch (error: any) {
      console.error('Error deleting studio:', error)
      toast.error(`Failed to delete studio: ${error.message}`)
    }
  }

  const handleTogglePublished = async (studioId: number, currentPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('studios')
        .update({ published: !currentPublished })
        .eq('id', studioId)

      if (error) throw error

      toast.success(`Studio ${!currentPublished ? 'published' : 'unpublished'} successfully`)
      fetchData()
    } catch (error) {
      console.error('Error toggling published status:', error)
      toast.error('Failed to update published status')
    }
  }

  const handleToggleVerification = async (studioId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'verified' ? 'unverified' : 'verified'
    
    try {
      const { error } = await supabase
        .from('studios')
        .update({ verification_status: newStatus })
        .eq('id', studioId)

      if (error) throw error

      toast.success(`Studio ${newStatus === 'verified' ? 'verified' : 'unverified'} successfully`)
      fetchData()
    } catch (error) {
      console.error('Error toggling verification:', error)
      toast.error('Failed to update verification status')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>
      case 'pending_claim_verification':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Claim</Badge>
      case 'pending_new_studio_approval':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Pending Approval</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">Unverified</Badge>
    }
  }

  const getOwnerName = (studio: Studio) => {
    if (!studio.profiles) return 'No Owner'
    const { first_name, last_name, username } = studio.profiles
    if (first_name && last_name) return `${first_name} ${last_name}`
    return username || 'Unknown'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all studios and platform oversight
          </p>
        </div>
        <Button onClick={() => window.open('/dashboard/studios/new', '_blank')}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add Studio
        </Button>
      </div>

      <Tabs defaultValue="studios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="studios">All Studios ({allStudios.length})</TabsTrigger>
          <TabsTrigger value="users">All Users ({allUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="studios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBuilding className="h-5 w-5" />
                All Studios
              </CardTitle>
              <CardDescription>
                View and manage all studios on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Studio</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Rate/Hour</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allStudios.map((studio) => (
                    <TableRow key={studio.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{studio.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {studio.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getOwnerName(studio)}</TableCell>
                      <TableCell>{studio.location}</TableCell>
                      <TableCell>{getStatusBadge(studio.verification_status)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={studio.published}
                          onCheckedChange={() => handleTogglePublished(studio.id, studio.published)}
                        />
                      </TableCell>
                      <TableCell>
                        {studio.hourly_rate ? `$${studio.hourly_rate}` : 'Not set'}
                      </TableCell>
                      <TableCell>
                        {new Date(studio.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <IconDots className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/studios/${studio.id}`, '_blank')}>
                              <IconEye className="mr-2 h-4 w-4" />
                              View Studio
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditStudio(studio)}>
                              <IconEdit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleVerification(studio.id, studio.verification_status)}
                            >
                              {studio.verification_status === 'verified' ? (
                                <>
                                  <IconX className="mr-2 h-4 w-4" />
                                  Unverify
                                </>
                              ) : (
                                <>
                                  <IconCheck className="mr-2 h-4 w-4" />
                                  Verify
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setStudioToDelete(studio)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-red-600"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage all platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user.username
                          }
                        </div>
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role || 'creator'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Studio Dialog */}
      <Dialog open={studioFormOpen} onOpenChange={setStudioFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Studio</DialogTitle>
            <DialogDescription>
              Update studio information and settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Studio Name</Label>
              <Input
                id="name"
                value={studioForm.name}
                onChange={(e) => setStudioForm({ ...studioForm, name: e.target.value })}
                placeholder="Enter studio name"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={studioForm.description}
                onChange={(e) => setStudioForm({ ...studioForm, description: e.target.value })}
                placeholder="Enter studio description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={studioForm.location}
                onChange={(e) => setStudioForm({ ...studioForm, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            
            <div>
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                value={studioForm.hourly_rate}
                onChange={(e) => setStudioForm({ ...studioForm, hourly_rate: e.target.value })}
                placeholder="Enter hourly rate"
              />
            </div>
            
            <div>
              <Label htmlFor="verification_status">Verification Status</Label>
              <Select
                value={studioForm.verification_status}
                onValueChange={(value) => setStudioForm({ ...studioForm, verification_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending_claim_verification">Pending Claim</SelectItem>
                  <SelectItem value="pending_new_studio_approval">Pending Approval</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setStudioFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStudio}>
              Update Studio
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Studio</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the studio and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-800">
                <strong>Warning:</strong> This process is irreversible. All studio data, bookings, and inquiries will be permanently deleted.
              </div>
            </div>
            
            <div>
              <Label htmlFor="studio-name-confirmation">
                Type the studio name "{studioToDelete?.name}" to confirm deletion:
              </Label>
              <Input
                id="studio-name-confirmation"
                value={deleteConfirmationName}
                onChange={(e) => setDeleteConfirmationName(e.target.value)}
                placeholder={studioToDelete?.name}
                className="mt-2"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false)
                setStudioToDelete(null)
                setDeleteConfirmationName('')
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteStudio}
              disabled={deleteConfirmationName !== studioToDelete?.name}
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Delete Studio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 