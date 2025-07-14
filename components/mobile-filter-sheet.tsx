"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, RotateCcw, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

interface Amenity {
  id: string
  name: string
}

interface GearItem {
  category: string
  item: string
}

interface FilterState {
  location: string
  priceRange: [number, number]
  selectedAmenities: string[]
  selectedGear: string[]
  amenitySearch: string
  gearSearch: string
}

interface MobileFilterSheetProps {
  filters: FilterState
  amenities: Amenity[]
  availableGear: GearItem[]
  onFilterChange: (filters: Partial<FilterState>) => void
  onSearchFilters: () => void
  onClearFilters: () => void
  isLoading?: boolean
  gearLoading?: boolean
  gearError?: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileFilterSheet({
  filters,
  amenities,
  availableGear,
  onFilterChange,
  onSearchFilters,
  onClearFilters,
  isLoading = false,
  gearLoading = false,
  gearError = null,
  open,
  onOpenChange
}: MobileFilterSheetProps) {
  const filteredAmenities = React.useMemo(() => {
    if (!filters.amenitySearch.trim()) return amenities
    return amenities.filter(amenity => 
      amenity.name.toLowerCase().includes(filters.amenitySearch.toLowerCase())
    )
  }, [amenities, filters.amenitySearch])

  const filteredGear = React.useMemo(() => {
    if (!filters.gearSearch.trim()) return availableGear
    return availableGear.filter(gear => 
      gear.item.toLowerCase().includes(filters.gearSearch.toLowerCase()) ||
      gear.category.toLowerCase().includes(filters.gearSearch.toLowerCase())
    )
  }, [availableGear, filters.gearSearch])

  // Group gear by category for better organization
  const groupedGear = React.useMemo(() => {
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

  const handleApplyFilters = () => {
    onSearchFilters()
    onOpenChange(false)
  }

  const handleClearFilters = () => {
    onClearFilters()
    // Don't close sheet on clear - let user see the cleared state
  }

  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (filters.location.trim()) count++
    count += filters.selectedAmenities.length
    count += filters.selectedGear.length
    return count
  }, [filters])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:w-80 p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Find the perfect studio for your project
                </SheetDescription>
              </div>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-6 pb-6">
              {/* Location Filter */}
              <div className="space-y-3">
                <Label htmlFor="location-mobile">Location</Label>
                <Input
                  id="location-mobile"
                  placeholder="City, state, or country"
                  value={filters.location}
                  onChange={(e) => onFilterChange({ location: e.target.value })}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Price Range Filter */}
              <div className="space-y-4">
                <Label>Price Range (per hour)</Label>
                <div className="px-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => onFilterChange({ priceRange: value as [number, number] })}
                    max={500}
                    min={0}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Amenities Filter */}
              <div className="space-y-4">
                <Label>Amenities</Label>
                
                {/* Amenities Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search amenities..."
                    value={filters.amenitySearch}
                    onChange={(e) => onFilterChange({ amenitySearch: e.target.value })}
                    className="pl-8"
                  />
                </div>

                {/* Amenities List */}
                <div className="space-y-3 max-h-48 overflow-y-auto rounded-md border border-input p-3">
                  {filteredAmenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity.id}-mobile`}
                        checked={filters.selectedAmenities.includes(amenity.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onFilterChange({
                              selectedAmenities: [...filters.selectedAmenities, amenity.name]
                            })
                          } else {
                            onFilterChange({
                              selectedAmenities: filters.selectedAmenities.filter(name => name !== amenity.name)
                            })
                          }
                        }}
                      />
                      <label 
                        htmlFor={`amenity-${amenity.id}-mobile`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {amenity.name}
                      </label>
                    </div>
                  ))}
                  {filteredAmenities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No amenities found
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Gear Filter */}
              <div className="space-y-4">
                <Label>Equipment & Gear</Label>
                
                {/* Gear Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search gear..."
                    value={filters.gearSearch}
                    onChange={(e) => onFilterChange({ gearSearch: e.target.value })}
                    className="pl-8"
                  />
                </div>

                {/* Gear List by Category */}
                <div className="space-y-4 max-h-56 overflow-y-auto rounded-md border border-input p-3">
                  {Object.entries(groupedGear).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {category}
                      </Label>
                      <div className="space-y-2 ml-2">
                        {items.map((item) => (
                          <div key={`${category}-${item}`} className="flex items-center space-x-2">
                            <Checkbox
                              id={`gear-${category}-${item}-mobile`}
                              checked={filters.selectedGear.includes(item)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  onFilterChange({
                                    selectedGear: [...filters.selectedGear, item]
                                  })
                                } else {
                                  onFilterChange({
                                    selectedGear: filters.selectedGear.filter(g => g !== item)
                                  })
                                }
                              }}
                            />
                            <label 
                              htmlFor={`gear-${category}-${item}-mobile`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {item}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {Object.keys(groupedGear).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {gearLoading ? "Loading gear..." : 
                       gearError ? "Error loading gear" :
                       filters.gearSearch ? `No gear found matching "${filters.gearSearch}"` : 
                       "No gear available"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="border-t p-4 space-y-3 shrink-0 bg-background">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleClearFilters}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button 
                className="flex-1"
                onClick={handleApplyFilters}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 