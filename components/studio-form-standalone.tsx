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
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Studio {
  id: number
  name: string
  description: string | null
  hourly_rate: number
  published: boolean
  gear: any
  location?: string
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const { toast } = useToast()

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
            verification_status: 'pending'
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
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Studio Basics Card */}
          <Card className="h-fit">
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
                  rows={6}
                  className="text-base resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  You can use JSON format for structured data or plain text for a simple list.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Studio Photos Card */}
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Studio Photos</CardTitle>
                  <CardDescription>Showcase your studio with high-quality images</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload Studio Photos</h3>
                <p className="text-muted-foreground mb-6">Drag and drop your images here, or click to browse</p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload">
                  <Button variant="outline" size="lg" asChild className="cursor-pointer">
                    <span>Choose Files</span>
                  </Button>
                </Label>
              </div>

              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    Uploaded Photos
                    <Badge variant="secondary">{uploadedImages.length}</Badge>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
                          <StudioImage
                            src={image}
                            alt={`Studio image ${index + 1}`}
                            fill
                            width={300}
                            height={225}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Amenities & Settings */}
        <div className="space-y-8">
          
          {/* Amenities Card */}
          <Card className="h-fit">
            <CardHeader className="pb-6">
              <CardTitle>Studio Amenities</CardTitle>
              <CardDescription>Select all amenities available at your studio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
          <Card className="h-fit">
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