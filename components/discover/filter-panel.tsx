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
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { IconX, IconSearch } from "@tabler/icons-react"
import { PRICE_TIERS } from "@/lib/constants/currencies"
import { useAmenities, useAvailableGear } from "@/lib/hooks/queries/studios"

interface FilterState {
  location: string
  priceRange: [number, number]
  selectedPriceTiers: number[]
  selectedAmenities: string[]
  selectedGear: string[]
}

interface FilterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onApply: () => void
  type: 'studios' | 'people'
}

export function FilterPanel({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
  type
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
    if (!amenitySearch) return amenities
    return amenities.filter(amenity =>
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
      priceRange: [0, 1000],
      selectedPriceTiers: [],
      selectedAmenities: [],
      selectedGear: []
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const activeFilterCount = [
    localFilters.location,
    localFilters.selectedPriceTiers.length,
    localFilters.selectedAmenities.length,
    localFilters.selectedGear.length,
    localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 1000
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
                {/* Price Range Filter */}
                <div className="space-y-2">
                  <Label>Daily Rate Range</Label>
                  <div className="px-2 pb-2">
                    <Slider
                      min={0}
                      max={1000}
                      step={50}
                      value={localFilters.priceRange}
                      onValueChange={(value) => 
                        setLocalFilters({...localFilters, priceRange: value as [number, number]})
                      }
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>${localFilters.priceRange[0]}</span>
                      <span>${localFilters.priceRange[1]}+</span>
                    </div>
                  </div>
                </div>

                {/* Price Tier Filter */}
                <div className="space-y-2">
                  <Label>Price Tiers</Label>
                  <div className="space-y-2">
                    {Object.entries(PRICE_TIERS).map(([value, tier]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tier-${value}`}
                          checked={localFilters.selectedPriceTiers.includes(Number(value))}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setLocalFilters({
                                ...localFilters,
                                selectedPriceTiers: [...localFilters.selectedPriceTiers, Number(value)]
                              })
                            } else {
                              setLocalFilters({
                                ...localFilters,
                                selectedPriceTiers: localFilters.selectedPriceTiers.filter(t => t !== Number(value))
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`tier-${value}`} className="cursor-pointer">
                          {tier.symbol} {tier.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

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

                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <p className="text-sm text-muted-foreground">
                    Experience filtering coming soon...
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