"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Studio {
  id: number
  name: string
  description: string | null
  hourly_rate: number
  published: boolean
  gear: any
}

interface Amenity {
  id: number
  name: string
}

interface StudioFormDialogProps {
  studio?: Studio | null
  onSaved: () => void
  ownerId: number
}

export function StudioFormDialog({ studio, onSaved, ownerId }: StudioFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hourly_rate: 0,
    published: false,
    gear: "",
  })

  useEffect(() => {
    fetchAmenities()
    if (studio) {
      setFormData({
        name: studio.name,
        description: studio.description || "",
        hourly_rate: studio.hourly_rate,
        published: studio.published,
        gear: studio.gear ? JSON.stringify(studio.gear, null, 2) : "",
      })
      fetchStudioAmenities(studio.id)
    }
  }, [studio])

  const fetchAmenities = async () => {
    const { data } = await supabase.from("amenities").select("*").order("name")
    if (data) {
      setAmenities(data)
    }
  }

  const fetchStudioAmenities = async (studioId: number) => {
    const { data } = await supabase.from("studio_amenities").select("amenity_id").eq("studio_id", studioId)
    if (data) {
      setSelectedAmenities(data.map((item) => item.amenity_id))
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityChange = (amenityId: number, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenityId])
    } else {
      setSelectedAmenities(selectedAmenities.filter((id) => id !== amenityId))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Mock image upload - in real implementation, upload to storage
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setUploadedImages([...uploadedImages, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Verify authentication before submission
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("Authentication required. Please log in again.")
      }

      // Verify profile exists
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

      if (!profileData) {
        throw new Error("Profile not found. Please complete your profile setup.")
      }

      // Ensure ownerId matches the authenticated user's profile
      if (ownerId !== profileData.id) {
        throw new Error("Authorization error: You can only create studios for your own profile.")
      }

      let gearData
      try {
        gearData = formData.gear ? JSON.parse(formData.gear) : null
      } catch {
        gearData = { description: formData.gear }
      }

      let studioData

      if (studio) {
        // Update existing studio
        const { data, error } = await supabase
          .from("studios")
          .update({
            name: formData.name,
            description: formData.description,
            hourly_rate: formData.hourly_rate,
            published: formData.published,
            gear: gearData,
          })
          .eq("id", studio.id)
          .select()
          .single()

        if (error) throw error
        studioData = data
      } else {
        // Create new studio
        const { data, error } = await supabase
          .from("studios")
          .insert({
            name: formData.name,
            description: formData.description,
            hourly_rate: formData.hourly_rate,
            published: formData.published,
            gear: gearData,
            owner_id: ownerId,
          })
          .select()
          .single()

        if (error) throw error
        studioData = data
      }

      // Update amenities
      if (studioData) {
        // Delete existing amenities
        await supabase.from("studio_amenities").delete().eq("studio_id", studioData.id)

        // Insert new amenities
        if (selectedAmenities.length > 0) {
          const amenityInserts = selectedAmenities.map((amenityId) => ({
            studio_id: studioData.id,
            amenity_id: amenityId,
          }))

          await supabase.from("studio_amenities").insert(amenityInserts)
        }
      }

      toast({
        title: "Success",
        description: studio ? "Studio updated successfully!" : "Studio created successfully!",
      })

      onSaved()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{studio ? `Edit ${studio.name}` : "Add New Studio"}</DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="details">Details & Amenities</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Studio Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter studio name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Studio Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your studio..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Default Hourly Rate</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => handleInputChange("hourly_rate", Number.parseFloat(e.target.value) || 0)}
                  className="pl-8"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity.id.toString()}
                      checked={selectedAmenities.includes(amenity.id)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked as boolean)}
                    />
                    <Label htmlFor={amenity.id.toString()} className="text-sm">
                      {amenity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Key Equipment</h3>
              <Textarea
                value={formData.gear}
                onChange={(e) => handleInputChange("gear", e.target.value)}
                placeholder="List your key equipment and gear..."
                rows={6}
              />
              <p className="text-sm text-muted-foreground mt-2">
                You can use JSON format for structured data or plain text for a simple list.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Studio Photos</CardTitle>
              <CardDescription>Upload images of your studio. You can drag and drop to reorder.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">Drag and drop your images here, or click to browse</p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload">
                  <Button variant="outline" asChild>
                    <span>Choose Files</span>
                  </Button>
                </Label>
              </div>

              {/* Uploaded Images Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Studio image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publish" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publication Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => handleInputChange("published", checked)}
                />
                <Label htmlFor="published">Publish Studio</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When published, your studio will be visible to everyone on stwd.io.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="ghost" onClick={onSaved}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
