"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, MoreHorizontal, ArrowUp, ArrowDown, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { StudioFormDialog } from "@/components/studio-form-dialog"
import { supabase } from "@/lib/supabase"
import { generateIdenticon } from "@/lib/identicon"
import { useRouter } from "next/navigation"

interface Studio {
  id: number
  name: string
  description: string | null
  hourly_rate: number
  published: boolean
  created_at: string
}

interface Booking {
  id: number
  start_time: string
  studio_name: string
  creator_name: string
  creator_id: string
}

const chartData = [
  { day: "Mon", bookings: 4 },
  { day: "Tue", bookings: 3 },
  { day: "Wed", bookings: 7 },
  { day: "Thu", bookings: 5 },
  { day: "Fri", bookings: 8 },
  { day: "Sat", bookings: 6 },
  { day: "Sun", bookings: 2 },
]

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "hsl(var(--primary))",
  },
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [studios, setStudios] = useState<Studio[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
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
    await Promise.all([fetchStudios(profileData.id), fetchUpcomingBookings(profileData.id)])
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

  const fetchUpcomingBookings = async (profileId: number) => {
    // Mock data for upcoming bookings
    const mockBookings: Booking[] = [
      {
        id: 1,
        start_time: "2024-01-15T14:00:00Z",
        studio_name: "Studio A",
        creator_name: "John Doe",
        creator_id: "user1",
      },
      {
        id: 2,
        start_time: "2024-01-16T10:00:00Z",
        studio_name: "Studio B",
        creator_name: "Jane Smith",
        creator_id: "user2",
      },
      {
        id: 3,
        start_time: "2024-01-17T16:00:00Z",
        studio_name: "Studio A",
        creator_name: "Mike Johnson",
        creator_id: "user3",
      },
    ]
    setUpcomingBookings(mockBookings)
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

  const handleDelete = async (studioId: number) => {
    const { error } = await supabase.from("studios").delete().eq("id", studioId)
    if (!error && profile) {
      fetchStudios(profile.id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStudio(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Studio
            </Button>
          </DialogTrigger>
          <StudioFormDialog studio={editingStudio} onSaved={handleStudioSaved} ownerId={profile?.id} />
        </Dialog>
      </div>

      {/* Analytics Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,850</div>
            <CardDescription className="flex items-center text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +15.2% from last month
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <CardDescription className="flex items-center text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +8.1% from last month
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profile Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2k</div>
            <CardDescription className="flex items-center text-red-600">
              <ArrowDown className="h-3 w-3 mr-1" />
              -2.4% from last month
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <CardDescription className="flex items-center text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +12.5% from last month
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Studios Table */}
          <Card>
            <CardHeader>
              <CardTitle>My Studios</CardTitle>
            </CardHeader>
            <CardContent>
              {studios.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Studio Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studios.map((studio) => (
                      <TableRow key={studio.id}>
                        <TableCell className="font-medium">{studio.name}</TableCell>
                        <TableCell>
                          <Badge variant={studio.published ? "default" : "secondary"}>
                            {studio.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>${studio.hourly_rate}/hr</TableCell>
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
                              <DropdownMenuItem onClick={() => handleDelete(studio.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
                  <p className="text-muted-foreground text-lg mb-4">No Studios Yet</p>
                  <p className="text-muted-foreground mb-6">Create Your First Studio To Get Started</p>
                  <Button onClick={() => setFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Studio
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Performance</CardTitle>
              <CardDescription>Daily bookings over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="bookings" fill="var(--color-bookings)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actionable Items */}
        <div className="space-y-8">
          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={generateIdenticon(booking.creator_id) || "/placeholder.svg"} />
                        <AvatarFallback>{booking.creator_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{booking.creator_name}</p>
                        <p className="text-xs text-muted-foreground">{booking.studio_name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(booking.start_time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming bookings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
