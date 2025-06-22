"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
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

interface StudioFormProps {
  studio?: Studio | null
  onSaved: () => void
  ownerId: number
}

export function StudioForm({ studio, onSaved, ownerId }: StudioFormProps) {
  const [loading, setLoading] = useState(false)
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hourly_rate: 0,
    published: false,
  })

  // Gear state
  const [gear, setGear] = useState<Record<string, string[]>>({
    microphones: [],
    instruments: [],
    software: [],
    hardware: [],
  })

  const [newGearItem, setNewGearItem] = useState("")
  const [activeGearCategory, setActiveGearCategory] = useState("microphones")

  useEffect(() => {
    fetchAmenities()
    if (studio) {
      setFormData({
        name: studio.name,
        description: studio.description || "",
        hourly_rate: studio.hourly_rate,
        published: studio.published,
      })
      if (studio.gear) {
        setGear(studio.gear)
      }
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

  const addGearItem = () => {
    if (newGearItem.trim()) {
      setGear((prev) => ({
        ...prev,
        [activeGearCategory]: [...prev[activeGearCategory], newGearItem.trim()],
      }))
      setNewGearItem("")
    }
  }

  const removeGearItem = (category: string, index: number) => {
    setGear((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      let studioData

      if (studio) {
        // Update existing studio
        const { data, error } = await supabase
          .from("studios")
          .update({
            ...formData,
            gear,
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
            ...formData,
            owner_id: ownerId,
            gear,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="gear">Gear</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Studio Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => handleInputChange("hourly_rate", Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => handleInputChange("published", checked)}
            />
            <Label htmlFor="published">Publish Immediately</Label>
          </div>
        </TabsContent>

        <TabsContent value="amenities" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="gear" className="space-y-4">
          <div className="grid gap-6">
            {Object.entries(gear).map(([category, items]) => (
              <Card key={category} className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="capitalize text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeGearItem(category, index)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Add ${category.slice(0, -1)}`}
                      value={activeGearCategory === category ? newGearItem : ""}
                      onChange={(e) => {
                        setActiveGearCategory(category)
                        setNewGearItem(e.target.value)
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          setActiveGearCategory(category)
                          addGearItem()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveGearCategory(category)
                        addGearItem()
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : studio ? "Update Studio" : "Create Studio"}
        </Button>
      </div>
    </form>
  )
}
