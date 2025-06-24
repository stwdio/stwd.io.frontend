'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
              Complete list of all studios with their verification status
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
                    <TableCell>{new Date(studio.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
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
  )
} 