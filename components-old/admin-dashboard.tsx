'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface Studio {
  id: number
  name: string
  description: string
  location: string
  verification_status: string
  claimed_by: number | null
  verification_documents: any
  created_at: string
  profiles?: {
    first_name: string
    last_name: string
    username: string
  }
  hourly_rate?: number
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
  const [pendingClaims, setPendingClaims] = useState<Studio[]>([])
  const [newSubmissions, setNewSubmissions] = useState<Studio[]>([])
  const [allStudios, setAllStudios] = useState<Studio[]>([])
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null)
  const [studioFormOpen, setStudioFormOpen] = useState(false)
  const [studioForm, setStudioForm] = useState({
    name: '',
    description: '',
    location: '',
    hourly_rate: '',
    verification_status: 'unverified'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch pending claims
      const { data: claims } = await supabase
        .from('studios')
        .select(`
          *,
          profiles:claimed_by (
            first_name,
            last_name,
            username
          )
        `)
        .eq('verification_status', 'pending_claim_verification')

      // Fetch new submissions
      const { data: submissions } = await supabase
        .from('studios')
        .select(`
          *,
          profiles:owner_id (
            first_name,
            last_name,
            username
          )
        `)
        .eq('verification_status', 'pending_new_studio_approval')

      // Fetch all studios
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

      setPendingClaims(claims || [])
      setNewSubmissions(submissions || [])
      setAllStudios(studios || [])
      setAllUsers(users || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveStudioClaim = async (studioId: number) => {
    try {
      const studio = pendingClaims.find(s => s.id === studioId)
      if (!studio || !studio.claimed_by) return

      const { error } = await supabase
        .from('studios')
        .update({
          verification_status: 'verified',
          owner_id: studio.claimed_by,
          published: true
        })
        .eq('id', studioId)

      if (error) throw error

      toast.success('Studio claim approved successfully')
      fetchData()
    } catch (error) {
      console.error('Error approving claim:', error)
      toast.error('Failed to approve studio claim')
    }
  }

  const handleRejectStudioClaim = async (studioId: number) => {
    try {
      const { error } = await supabase
        .from('studios')
        .update({
          verification_status: 'rejected',
          claimed_by: null,
          verification_documents: null
        })
        .eq('id', studioId)

      if (error) throw error

      toast.success('Studio claim rejected')
      fetchData()
    } catch (error) {
      console.error('Error rejecting claim:', error)
      toast.error('Failed to reject studio claim')
    }
  }

  const handleApproveNewStudio = async (studioId: number) => {
    try {
      const { error } = await supabase
        .from('studios')
        .update({
          verification_status: 'verified',
          published: true
        })
        .eq('id', studioId)

      if (error) throw error

      toast.success('New studio approved successfully')
      fetchData()
    } catch (error) {
      console.error('Error approving studio:', error)
      toast.error('Failed to approve new studio')
    }
  }

  const handleRejectNewStudio = async (studioId: number) => {
    try {
      const { error } = await supabase
        .from('studios')
        .update({
          verification_status: 'rejected'
        })
        .eq('id', studioId)

      if (error) throw error

      toast.success('New studio rejected')
      fetchData()
    } catch (error) {
      console.error('Error rejecting studio:', error)
      toast.error('Failed to reject new studio')
    }
  }

  const handleEditStudio = (studio: Studio) => {
    setEditingStudio(studio)
    setStudioForm({
      name: studio.name,
      description: studio.description || '',
      location: studio.location,
      hourly_rate: studio.hourly_rate?.toString() || '',
      verification_status: studio.verification_status
    })
    setStudioFormOpen(true)
  }

  const handleUpdateStudio = async () => {
    if (!editingStudio) return

    try {
      const updateData: any = {
        name: studioForm.name,
        description: studioForm.description,
        location: studioForm.location,
        verification_status: studioForm.verification_status
      }

      if (studioForm.hourly_rate) {
        updateData.hourly_rate = parseFloat(studioForm.hourly_rate)
      }

      const { error } = await supabase
        .from('studios')
        .update(updateData)
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

  const handleDeleteStudio = async (studioId: number) => {
    if (!confirm('Are you sure you want to delete this studio? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('studios')
        .delete()
        .eq('id', studioId)

      if (error) throw error

      toast.success('Studio deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Error deleting studio:', error)
      toast.error('Failed to delete studio')
    }
  }

  const handleToggleVerification = async (studioId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'verified' ? 'unverified' : 'verified'
      
      const { error } = await supabase
        .from('studios')
        .update({ 
          verification_status: newStatus,
          published: newStatus === 'verified'
        })
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
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'verified': 'default',
      'pending_claim_verification': 'secondary',
      'pending_new_studio_approval': 'secondary',
      'rejected': 'destructive',
      'unclaimed': 'outline'
    }
    
    return <Badge variant={variants[status] || 'outline'}>{status.replace(/_/g, ' ')}</Badge>
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <>
      <Tabs defaultValue="pending-claims" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending-claims">
            Pending Claims ({pendingClaims.length})
          </TabsTrigger>
          <TabsTrigger value="new-submissions">
            New Submissions ({newSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="all-studios">
            All Studios ({allStudios.length})
          </TabsTrigger>
          <TabsTrigger value="all-users">
            All Users ({allUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending-claims">
          <Card>
            <CardHeader>
              <CardTitle>Pending Studio Claims</CardTitle>
              <CardDescription>
                Studios that existing users are trying to claim ownership of
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Studio Name</TableHead>
                    <TableHead>Claimed By</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Claim Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingClaims.map((studio) => (
                    <TableRow key={studio.id}>
                      <TableCell className="font-medium">{studio.name}</TableCell>
                      <TableCell>
                        {studio.profiles ? 
                          `${studio.profiles.first_name} ${studio.profiles.last_name} (@${studio.profiles.username})` :
                          'Unknown'
                        }
                      </TableCell>
                      <TableCell>{studio.location}</TableCell>
                      <TableCell>{new Date(studio.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveStudioClaim(studio.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectStudioClaim(studio.id)}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingClaims.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No pending studio claims
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-submissions">
          <Card>
            <CardHeader>
              <CardTitle>New Studio Submissions</CardTitle>
              <CardDescription>
                New studios submitted by users awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Studio Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newSubmissions.map((studio) => (
                    <TableRow key={studio.id}>
                      <TableCell className="font-medium">{studio.name}</TableCell>
                      <TableCell>
                        {studio.profiles ? 
                          `${studio.profiles.first_name} ${studio.profiles.last_name} (@${studio.profiles.username})` :
                          'Unknown'
                        }
                      </TableCell>
                      <TableCell>{studio.location}</TableCell>
                      <TableCell>{new Date(studio.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveNewStudio(studio.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectNewStudio(studio.id)}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {newSubmissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No new studio submissions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-studios">
          <Card>
            <CardHeader>
              <CardTitle>All Studios</CardTitle>
              <CardDescription>
                Complete list of all studios with direct management capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allStudios.map((studio) => (
                    <TableRow key={studio.id}>
                      <TableCell className="font-medium">{studio.name}</TableCell>
                      <TableCell>
                        {studio.profiles ? 
                          `${studio.profiles.first_name} ${studio.profiles.last_name}` :
                          'Unowned'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(studio.verification_status)}</TableCell>
                      <TableCell>{studio.location}</TableCell>
                      <TableCell>
                        {studio.hourly_rate ? `$${studio.hourly_rate}/hr` : 'Not set'}
                      </TableCell>
                      <TableCell>{new Date(studio.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditStudio(studio)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Studio
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleVerification(studio.id, studio.verification_status)}
                            >
                              {studio.verification_status === 'verified' ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Mark Unverified
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark Verified
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => window.open(`/studios/${studio.id}`, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Public Page
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteStudio(studio.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Studio
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

        <TabsContent value="all-users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Complete list of all platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">@{user.username}</TableCell>
                      <TableCell>
                        {user.first_name && user.last_name ? 
                          `${user.first_name} ${user.last_name}` : 
                          'No name set'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Studio Edit Dialog */}
      <Dialog open={studioFormOpen} onOpenChange={setStudioFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStudio ? 'Edit Studio' : 'Create Studio'}
            </DialogTitle>
            <DialogDescription>
              Update studio information and verification status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studio_name">Studio Name</Label>
              <Input
                id="studio_name"
                value={studioForm.name}
                onChange={(e) => setStudioForm(prev => ({ 
                  ...prev, 
                  name: e.target.value 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studio_location">Location</Label>
              <Input
                id="studio_location"
                value={studioForm.location}
                onChange={(e) => setStudioForm(prev => ({ 
                  ...prev, 
                  location: e.target.value 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studio_rate">Hourly Rate ($)</Label>
              <Input
                id="studio_rate"
                type="number"
                value={studioForm.hourly_rate}
                onChange={(e) => setStudioForm(prev => ({ 
                  ...prev, 
                  hourly_rate: e.target.value 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studio_description">Description</Label>
              <Textarea
                id="studio_description"
                value={studioForm.description}
                onChange={(e) => setStudioForm(prev => ({ 
                  ...prev, 
                  description: e.target.value 
                }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification_status">Verification Status</Label>
              <Select 
                value={studioForm.verification_status} 
                onValueChange={(value) => setStudioForm(prev => ({ 
                  ...prev, 
                  verification_status: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="pending_claim_verification">Pending Claim Verification</SelectItem>
                  <SelectItem value="pending_new_studio_approval">Pending New Studio Approval</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateStudio} className="flex-1">
                Update Studio
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStudioFormOpen(false)
                  setEditingStudio(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 