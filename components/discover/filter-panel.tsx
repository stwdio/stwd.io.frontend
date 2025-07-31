'use client'

import { useState, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { IconSearch } from "@tabler/icons-react"
// Price tier imports removed for healthier discovery experience
import { useAmenities, useAvailableGear } from "@/lib/hooks/queries/studios"

interface FilterState {
  location: string
  selectedAmenities: string[]
  selectedGear: string[]
  selectedRoles: string[]
}

interface FilterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onApply: () => void
  type: 'studios' | 'people'
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export function FilterPanel({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
  type,
  searchQuery = '',
  onSearchChange
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)
  const [amenitySearch, setAmenitySearch] = useState('')
  const [gearSearch, setGearSearch] = useState('')
  const [skillSearch, setSkillSearch] = useState('')

  // Fetch amenities and gear for studios
  const { data: amenities = [], isLoading: amenitiesLoading } = useAmenities()
  const { data: availableGear = [], isLoading: gearLoading } = useAvailableGear()

  // Filter amenities based on search
  const filteredAmenities = useMemo(() => {
    if (!amenitySearch) return amenities || []
    return (amenities || []).filter(amenity =>
      amenity.name.toLowerCase().includes(amenitySearch.toLowerCase())
    )
  }, [amenities, amenitySearch])

  // Filter gear based on search
  const filteredGear = useMemo(() => {
    if (!gearSearch) return availableGear
    return availableGear.filter(gear =>
      gear.item.toLowerCase().includes(gearSearch.toLowerCase()) ||
      gear.category.toLowerCase().includes(gearSearch.toLowerCase())
    )
  }, [availableGear, gearSearch])

  // Group gear by category
  const gearByCategory = useMemo(() => {
    const grouped: Record<string, string[]> = {}
    filteredGear.forEach(gear => {
      if (!grouped[gear.category]) {
        grouped[gear.category] = []
      }
      if (!grouped[gear.category].includes(gear.item)) {
        grouped[gear.category].push(gear.item)
      }
    })
    return grouped
  }, [filteredGear])

  const handleApply = () => {
    onFiltersChange(localFilters)
    onApply()
    onOpenChange(false)
  }

  const handleClear = () => {
    const clearedFilters: FilterState = {
      location: '',
      selectedAmenities: [],
      selectedGear: [],
      selectedRoles: []
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const activeFilterCount = [
    localFilters.location,
    localFilters.selectedAmenities.length,
    localFilters.selectedGear.length,
    localFilters.selectedRoles.length
  ].filter(Boolean).length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Filter {type === 'studios' ? 'Studios' : 'People'}</SheetTitle>
          <SheetDescription>
            Refine your search with filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        {/* Search Bar - only visible on mobile */}
        {onSearchChange && (
          <div className="lg:hidden mt-6">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder={type === 'studios' ? "Find Studios..." : "Find People..."}
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-200px)] mt-6">
          <div className="space-y-6 pr-4">
            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Search by city, state, or country..."
                value={localFilters.location}
                onChange={(e) => setLocalFilters({...localFilters, location: e.target.value})}
              />
            </div>

            {type === 'studios' ? (
              <>
                {/* Price filters removed for healthier discovery experience */}

                {/* Amenities Filter */}
                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="relative">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search amenities..."
                      value={amenitySearch}
                      onChange={(e) => setAmenitySearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <ScrollArea className="h-48 border rounded-md p-2">
                    {amenitiesLoading ? (
                      <p className="text-sm text-muted-foreground">Loading amenities...</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredAmenities.map((amenity) => (
                          <div key={amenity.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`amenity-${amenity.id}`}
                              checked={localFilters.selectedAmenities.includes(amenity.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setLocalFilters({
                                    ...localFilters,
                                    selectedAmenities: [...localFilters.selectedAmenities, amenity.name]
                                  })
                                } else {
                                  setLocalFilters({
                                    ...localFilters,
                                    selectedAmenities: localFilters.selectedAmenities.filter(a => a !== amenity.name)
                                  })
                                }
                              }}
                            />
                            <Label htmlFor={`amenity-${amenity.id}`} className="cursor-pointer">
                              {amenity.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Equipment/Gear Filter */}
                <div className="space-y-2">
                  <Label>Equipment</Label>
                  <div className="relative">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search equipment..."
                      value={gearSearch}
                      onChange={(e) => setGearSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <ScrollArea className="h-48 border rounded-md p-2">
                    {gearLoading ? (
                      <p className="text-sm text-muted-foreground">Loading equipment...</p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(gearByCategory).map(([category, items]) => (
                          <div key={category}>
                            <h4 className="font-medium text-sm mb-2">{category}</h4>
                            <div className="space-y-2 pl-4">
                              {items.map((item) => (
                                <div key={item} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`gear-${item}`}
                                    checked={localFilters.selectedGear.includes(item)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setLocalFilters({
                                          ...localFilters,
                                          selectedGear: [...localFilters.selectedGear, item]
                                        })
                                      } else {
                                        setLocalFilters({
                                          ...localFilters,
                                          selectedGear: localFilters.selectedGear.filter(g => g !== item)
                                        })
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`gear-${item}`} className="cursor-pointer text-sm">
                                    {item}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </>
            ) : (
              <>
                {/* People-specific filters */}
                <div className="space-y-2">
                  <Label>Professional Role</Label>
                  <div className="space-y-2">
                    {[
                      { slug: 'musician', name: 'Musician' },
                      { slug: 'podcaster', name: 'Podcaster' },
                      { slug: 'voice-actor', name: 'Voice Actor' },
                      { slug: 'engineer', name: 'Engineer' },
                      { slug: 'producer', name: 'Producer' },
                      { slug: 'a-and-r', name: 'A&R' },
                      { slug: 'manager', name: 'Manager' },
                      { slug: 'studio-owner', name: 'Studio Owner' }
                    ].map((role) => (
                      <div key={role.slug} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.slug}`}
                          checked={localFilters.selectedRoles.includes(role.slug)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setLocalFilters({
                                ...localFilters,
                                selectedRoles: [...localFilters.selectedRoles, role.slug]
                              })
                            } else {
                              setLocalFilters({
                                ...localFilters,
                                selectedRoles: localFilters.selectedRoles.filter(r => r !== role.slug)
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`role-${role.slug}`} className="cursor-pointer">
                          {role.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="relative">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Skills filtering coming soon...
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}