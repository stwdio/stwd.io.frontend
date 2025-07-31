'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { IconFilter, IconSearch } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { BrowseStudiosContent } from '@/components/browse-studios-content'
import { ProfilesGrid } from '@/components/discover/profiles-grid'
import { FilterPanel } from '@/components/discover/filter-panel'

type DiscoverView = 'studios' | 'people'
type PeopleSubView = 'all' | 'artists' | 'engineers' | 'industry'

export function DiscoverPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Determine initial view from URL
  const getInitialView = (): { view: DiscoverView; subView?: PeopleSubView } => {
    if (pathname.includes('/people')) {
      const subView = pathname.includes('/artists') ? 'artists' :
                     pathname.includes('/engineers') ? 'engineers' :
                     pathname.includes('/industry') ? 'industry' : 'all'
      return { view: 'people', subView }
    }
    if (pathname.includes('/studios')) {
      return { view: 'studios' }
    }
    return { view: 'studios' } // default to studios
  }

  const initial = getInitialView()
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const activeView = initial.view
  const peopleSubView = initial.subView || 'all'
  
  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    priceRange: [
      parseInt(searchParams.get('minPrice') || '0'),
      parseInt(searchParams.get('maxPrice') || '1000')
    ] as [number, number],
    selectedPriceTiers: searchParams.get('tiers') ? searchParams.get('tiers')!.split(',').map(Number) : [],
    selectedAmenities: searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : [],
    selectedGear: searchParams.get('gear') ? searchParams.get('gear')!.split(',') : [],
    selectedRoles: searchParams.get('roles') ? searchParams.get('roles')!.split(',') : []
  })
  
  // Calculate active filter count
  const activeFilters = [
    filters.location,
    filters.selectedPriceTiers.length,
    filters.selectedAmenities.length,
    filters.selectedGear.length,
    filters.selectedRoles.length,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000
  ].filter(Boolean).length

  // Update URL with current filters and search
  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    
    if (searchQuery) {
      params.set('q', searchQuery)
    }
    
    if (filters.location) {
      params.set('location', filters.location)
    }
    
    if (filters.priceRange[0] > 0) {
      params.set('minPrice', filters.priceRange[0].toString())
    }
    
    if (filters.priceRange[1] < 1000) {
      params.set('maxPrice', filters.priceRange[1].toString())
    }
    
    if (filters.selectedPriceTiers.length > 0) {
      params.set('tiers', filters.selectedPriceTiers.join(','))
    }
    
    if (filters.selectedAmenities.length > 0) {
      params.set('amenities', filters.selectedAmenities.join(','))
    }
    
    if (filters.selectedGear.length > 0) {
      params.set('gear', filters.selectedGear.join(','))
    }
    
    if (filters.selectedRoles.length > 0) {
      params.set('roles', filters.selectedRoles.join(','))
    }
    
    const url = `${pathname}${params.toString() ? '?' + params.toString() : ''}`
    router.replace(url, { scroll: false })
  }, [searchQuery, filters, pathname, router])

  // Update URL when filters or search change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [updateURL])

  // Debounce search query for API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery) 
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])


  // Navigation actions (search and filter)
  const navActions = (
    <div className="flex gap-3 items-center">
      {/* Search bar - only visible on desktop */}
      <div className="hidden lg:block relative">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder={activeView === 'studios' ? "Find Studios..." : "Find People..."}
          className="pl-10 w-[280px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Filter button - always visible */}
      <Button 
        variant="default" 
        size="icon"
        onClick={() => setFilterPanelOpen(true)}
        className="relative"
      >
        <IconFilter className="h-4 w-4" />
        {activeFilters > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
          >
            {activeFilters}
          </Badge>
        )}
      </Button>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Secondary navigation and actions bar */}
      <div className="flex-shrink-0 bg-background">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between py-4 lg:py-2">
            {/* Page title on mobile */}
            <div className="lg:hidden">
              <h2 className="text-3xl font-bold">DISCOVER</h2>
              <h3 className="text-xl font-medium uppercase text-muted-foreground">
                {activeView === 'studios' ? 'Studios' : 'People'}
              </h3>
            </div>
            
            {/* Empty div for desktop to push nav actions to the right */}
            <div className="hidden lg:block" />
            
            {/* Navigation actions */}
            <div className="flex items-center gap-3">
              {navActions}
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden rounded-t-xl">
        <div className="h-full overflow-auto">
        <div className="w-full">
        {activeView === 'studios' ? (
          <BrowseStudiosContent 
            filters={filters}
            searchQuery={debouncedSearchQuery}
          />
        ) : (
          <ProfilesGrid 
            category={peopleSubView}
            searchQuery={debouncedSearchQuery}
            roleFilters={filters.selectedRoles}
          />
        )}

        {/* Filter Panel */}
        <FilterPanel
          open={filterPanelOpen}
          onOpenChange={setFilterPanelOpen}
          filters={filters}
          onFiltersChange={setFilters}
          onApply={() => {
            setFilterPanelOpen(false)
          }}
          type={activeView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        </div>
        </div>
      </div>
    </div>
  )
}