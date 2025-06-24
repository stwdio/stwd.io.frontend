'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Building2, MapPin, Clock, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface Studio {
  id: number
  name: string
  description: string
  location: string
  hourly_rate: number
  verification_status: string
  claimed_by: number | null
  created_at: string
}

export default function ClaimStudioPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [studios, setStudios] = useState<Studio[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [claimingStudio, setClaimingStudio] = useState<Studio | null>(null)
  const [claimForm, setClaimForm] = useState({
    verification_message: '',
    contact_info: '',
    business_documents: ''
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.push('/auth/login')
      return
    }

    setUser(session.user)

    // Fetch profile
    const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single()

    if (!profileData) {
      router.push('/onboarding')
      return
    }

    setProfile(profileData)
    await fetchUnclaimedStudios()
  }

  const fetchUnclaimedStudios = async () => {
    try {
      const { data, error } = await supabase
        .from('studios')
        .select('*')
        .is('claimed_by', null)
        .eq('verification_status', 'unverified')
        .order('created_at', { ascending: false })

      if (error) throw error

      setStudios(data || [])
    } catch (error) {
      console.error('Error fetching studios:', error)
      toast.error('Failed to load studios')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudios = studios.filter(studio =>
    studio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    studio.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleClaimStudio = async () => {
    if (!claimingStudio || !profile) return

    try {
      const { error } = await supabase.rpc('claim_studio', {
        studio_id: claimingStudio.id,
        claimer_id: profile.id,
        verification_message: claimForm.verification_message,
        contact_info: claimForm.contact_info,
        business_documents: claimForm.business_documents
      })

      if (error) throw error

      toast.success('Studio claim submitted successfully! Our team will review your claim.')
      setClaimingStudio(null)
      setClaimForm({
        verification_message: '',
        contact_info: '',
        business_documents: ''
      })
      fetchUnclaimedStudios()
    } catch (error) {
      console.error('Error claiming studio:', error)
      toast.error('Failed to submit claim')
    }
  }

  const getVerificationBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'verified': 'default',
      'pending': 'secondary',
      'unverified': 'outline',
      'rejected': 'destructive'
    }
    
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading studios...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Claim Your Studio</h1>
        <p className="text-muted-foreground">
          Find and claim your studio to start receiving client inquiries. 
          Our team will verify your ownership before approving your claim.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Studios
          </CardTitle>
          <CardDescription>
            Search by studio name or location to find your studio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search">Studio Name or Location</Label>
            <Input
              id="search"
              placeholder="Enter studio name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Studios Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Studios</CardTitle>
          <CardDescription>
            {filteredStudios.length} unclaimed studio{filteredStudios.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudios.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Studio Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudios.map((studio) => (
                  <TableRow key={studio.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 opacity-50" />
                        <div>
                          <div className="font-medium">{studio.name}</div>
                          {studio.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {studio.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 opacity-50" />
                        {studio.location}
                      </div>
                    </TableCell>
                    <TableCell>${studio.hourly_rate}/hr</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 opacity-50" />
                        {new Date(studio.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getVerificationBadge(studio.verification_status)}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            onClick={() => setClaimingStudio(studio)}
                          >
                            Claim Studio
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Claim Studio: {studio.name}</DialogTitle>
                            <DialogDescription>
                              Provide verification details to claim this studio. Our team will review your submission.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="contact_info">Contact Information</Label>
                              <Input
                                id="contact_info"
                                placeholder="Phone number, email, or website"
                                value={claimForm.contact_info}
                                onChange={(e) => setClaimForm(prev => ({ 
                                  ...prev, 
                                  contact_info: e.target.value 
                                }))}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="verification_message">Verification Details</Label>
                              <Textarea
                                id="verification_message"
                                placeholder="Explain how you're connected to this studio (owner, manager, etc.) and provide any relevant details..."
                                value={claimForm.verification_message}
                                onChange={(e) => setClaimForm(prev => ({ 
                                  ...prev, 
                                  verification_message: e.target.value 
                                }))}
                                rows={4}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="business_documents">Business Documents (Optional)</Label>
                              <Input
                                id="business_documents"
                                placeholder="Links to business license, website, social media, etc."
                                value={claimForm.business_documents}
                                onChange={(e) => setClaimForm(prev => ({ 
                                  ...prev, 
                                  business_documents: e.target.value 
                                }))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Provide links to documents that verify your ownership or management of this studio
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button onClick={handleClaimStudio} className="flex-1">
                                <FileText className="h-4 w-4 mr-2" />
                                Submit Claim
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setClaimingStudio(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No studios found' : 'No unclaimed studios available'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or check the spelling'
                  : 'All studios have been claimed or are pending verification'
                }
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Don't See Your Studio?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you don't see your studio in the list above, you can create a new studio listing.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Create New Studio
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 