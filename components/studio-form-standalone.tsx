"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Upload, MapPin, DollarSign, Building, Camera, Settings, Eye } from "lucide-react"
import { StudioImage } from "@/components/studio-image-placeholder"
import { StudioPhotoUploader } from "@/components/studio-photo-uploader"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Studio {
  id: number
  name: string
  description: string | null
  hourly_rate: number
  published: boolean
  gear: any
  location?: string
  photo_urls?: string[]
}

interface Amenity {
  id: number
  name: string
}

interface StudioFormStandaloneProps {
  studio?: Studio | null
  onSaved: () => void
  ownerId: number
  showActions?: boolean
}

export function StudioFormStandalone({ studio, onSaved, ownerId, showActions = true }: StudioFormStandaloneProps) {
  const [loading, setLoading] = useState(false)
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])
  const { toast } = useToast()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
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
        location: studio.location || "",
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
      setSelectedAmenities(data.map((item: any) => item.amenity_id))
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

  const handlePhotosUpdate = (newPhotoUrls: string[]) => {
    // Update the local studio state with new photo URLs
    // This will be automatically handled by the StudioPhotoUploader component
    // No additional action needed here as the component handles server updates
  }



  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Studio name is required")
      }
      if (!formData.description.trim()) {
        throw new Error("Studio description is required")
      }
      if (!formData.location.trim()) {
        throw new Error("Studio location is required")
      }
      if (formData.hourly_rate <= 0) {
        throw new Error("Hourly rate must be greater than 0")
      }

      let gearData
      try {
        gearData = formData.gear ? JSON.parse(formData.gear) : null
      } catch {
        gearData = { description: formData.gear }
      }

      let studioData: any

      if (studio) {
        // Update existing studio
        const { data, error } = await supabase
          .from("studios")
          .update({
            name: formData.name.trim(),
            description: formData.description.trim(),
            location: formData.location.trim(),
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
            name: formData.name.trim(),
            description: formData.description.trim(),
            location: formData.location.trim(),
            hourly_rate: formData.hourly_rate,
            published: formData.published,
            gear: gearData,
            owner_id: ownerId,
            verification_status: 'pending_new_studio_approval'
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
    <div className="w-full space-y-8">
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8 min-h-[calc(100vh-12rem)]">
        
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          
          {/* Studio Basics Card */}
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Studio Information</CardTitle>
                  <CardDescription>Basic details about your recording studio</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Studio Name */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-medium">Studio Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your studio name"
                  className="h-12 text-base"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your studio's unique features, atmosphere, and what makes it special..."
                  rows={4}
                  className="text-base resize-none"
                  required
                />
              </div>

              {/* Location and Price Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-base font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, State"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="hourly_rate" className="text-base font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Hourly Rate
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-base">$</span>
                    <Input
                      id="hourly_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.hourly_rate}
                      onChange={(e) => handleInputChange("hourly_rate", Number.parseFloat(e.target.value) || 0)}
                      className="pl-10 h-12 text-base"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment & Gear Card */}
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Equipment & Gear</CardTitle>
                  <CardDescription>List your key equipment and studio specifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="gear" className="text-base font-medium">Key Equipment</Label>
                <Textarea
                  id="gear"
                  value={formData.gear}
                  onChange={(e) => handleInputChange("gear", e.target.value)}
                  placeholder="List your key equipment and gear (e.g., microphones, monitors, mixing consoles, instruments)..."
                  rows={8}
                  className="text-base resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  You can use JSON format for structured data or plain text for a simple list.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Studio Photos Section - Only available in edit mode */}
          {studio && (
            <div className="flex-1">
              <StudioPhotoUploader 
                studioId={studio.id}
                photoUrls={studio.photo_urls || []}
                onPhotosUpdate={handlePhotosUpdate}
                maxPhotos={10}
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* Right Column - Amenities & Settings */}
        <div className="space-y-8 flex flex-col">
          
          {/* Amenities Card */}
          <Card className="flex-1">
            <CardHeader className="pb-6">
              <CardTitle>Studio Amenities</CardTitle>
              <CardDescription>Select all amenities available at your studio</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={amenity.id.toString()}
                      checked={selectedAmenities.includes(amenity.id)}
                      onCheckedChange={(checked: boolean) => handleAmenityChange(amenity.id, checked)}
                      className="h-5 w-5"
                    />
                    <Label 
                      htmlFor={amenity.id.toString()} 
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {amenity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Publication Settings Card */}
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Publication Settings</CardTitle>
                  <CardDescription>Control your studio's visibility</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4 p-4 rounded-lg border bg-muted/30">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked: boolean) => handleInputChange("published", checked)}
                  className="mt-1"
                />
                <div className="space-y-2">
                  <Label htmlFor="published" className="text-base font-medium cursor-pointer">
                    Publish Studio
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    When published, your studio will be visible to everyone on stwd.io. Note: Your studio must be verified by an admin before it becomes publicly visible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips & Guidelines Card - New addition to fill space */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">✨ Studio Listing Tips</CardTitle>
              <CardDescription>Maximize your studio's appeal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">Use high-quality photos showing different angles of your studio</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">Include detailed equipment specifications in your gear list</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">Write a compelling description highlighting your studio's unique features</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">Research competitive pricing in your area for accurate rates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card - Additional content */}
          {(formData.name || formData.description || selectedAmenities.length > 0) && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">📊 Listing Preview</CardTitle>
                <CardDescription>How your studio appears to potential clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.name && (
                  <div>
                    <Label className="text-xs text-muted-foreground">STUDIO NAME</Label>
                    <p className="font-medium truncate">{formData.name}</p>
                  </div>
                )}
                {formData.location && (
                  <div>
                    <Label className="text-xs text-muted-foreground">LOCATION</Label>
                    <p className="text-sm">{formData.location}</p>
                  </div>
                )}
                {formData.hourly_rate > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">HOURLY RATE</Label>
                    <p className="text-sm font-medium">${formData.hourly_rate}/hour</p>
                  </div>
                )}
                {selectedAmenities.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">AMENITIES</Label>
                    <p className="text-sm">{selectedAmenities.length} selected</p>
                  </div>
                )}
                {studio?.photo_urls && studio.photo_urls.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">PHOTOS</Label>
                    <p className="text-sm">{studio.photo_urls.length} uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button variant="outline" size="lg" onClick={onSaved} disabled={loading}>
            Cancel
          </Button>
          <Button size="lg" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : studio ? "Update Studio" : "Create Studio"}
          </Button>
        </div>
      )}
    </div>
  )
} 