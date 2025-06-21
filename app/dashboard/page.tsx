"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Eye, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StudioForm } from "@/components/studio-form"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface Studio {
  id: number
  name: string
  description: string | null
  hourly_rate: number
  published: boolean
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [studios, setStudios] = useState<Studio[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.push("/")
      return
    }

    setUser(session.user)

    // Fetch profile
    const { data: profileData } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).single()

    if (!profileData || (profileData.role !== "owner" && profileData.role !== "admin")) {
      router.push("/")
      return
    }

    setProfile(profileData)
    fetchStudios(profileData.id)
  }

  const fetchStudios = async (profileId: number) => {
    const { data, error } = await supabase
      .from("studios")
      .select("*")
      .eq("owner_id", profileId)
      .order("created_at", { ascending: false })

    if (data) {
      setStudios(data)
    }
    setLoading(false)
  }

  const handleStudioSaved = () => {
    setFormOpen(false)
    setEditingStudio(null)
    if (profile) {
      fetchStudios(profile.id)
    }
  }

  const handleEdit = (studio: Studio) => {
    setEditingStudio(studio)
    setFormOpen(true)
  }

  const handleTogglePublished = async (studio: Studio) => {
    const { error } = await supabase.from("studios").update({ published: !studio.published }).eq("id", studio.id)

    if (!error && profile) {
      fetchStudios(profile.id)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Studio Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage your recording studios</p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStudio(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Studio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudio ? "Edit Studio" : "Add New Studio"}</DialogTitle>
            </DialogHeader>
            <StudioForm studio={editingStudio} onSaved={handleStudioSaved} ownerId={profile?.id} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Studios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studios.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studios.filter((s) => s.published).length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studios.filter((s) => !s.published).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Studios Table */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle>My Studios</CardTitle>
        </CardHeader>
        <CardContent>
          {studios.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studios.map((studio) => (
                  <TableRow key={studio.id}>
                    <TableCell className="font-medium">{studio.name}</TableCell>
                    <TableCell>${studio.hourly_rate}/hr</TableCell>
                    <TableCell>
                      <Badge
                        variant={studio.published ? "default" : "secondary"}
                        className={studio.published ? "bg-green-600" : ""}
                      >
                        {studio.published ? "Published" : "Draft"}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => router.push(`/studios/${studio.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(studio)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePublished(studio)}>
                            {studio.published ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No studios yet</p>
              <p className="text-gray-500 mb-6">Create your first studio to get started</p>
              <Button onClick={() => setFormOpen(true)}>
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
