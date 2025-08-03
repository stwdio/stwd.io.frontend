'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { IconFilter, IconSearch } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { BrowseStudiosContent } from '@/components/browse-studios-content'
import { ProfilesGrid } from '@/components/discover/profiles-grid'
import { FilterPanel } from '@/components/discover/filter-panel'
import { trackEvent } from '@/lib/analytics/ga-events'

type DiscoverView = 'studios' | 'people'
type PeopleSubView = 'all' | 'artists' | 'engineers' | 'industry'

export function DiscoverContent() {
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
    return { view: 'studios' }
  }

  const initial = getInitialView()
  const [activeView, setActiveView] = useState<DiscoverView>(initial.view)
  const [peopleSubView, setPeopleSubView] = useState<PeopleSubView>(initial.subView || 'all')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  
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
    selectedGear: searchParams.get('gear') ? searchParams.get('gear')!.split(',') : []
  })
  
  // Calculate active filter count
  const activeFilters = [
    filters.location,
    filters.selectedPriceTiers.length,
    filters.selectedAmenities.length,
    filters.selectedGear.length,
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
    
    const url = `${pathname}${params.toString() ? '?' + params.toString() : ''}`
    router.replace(url, { scroll: false })
  }, [searchQuery, filters, pathname, router])

  // Update URL when filters or search change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL()
    }, 500) // Debounce to avoid too many URL updates

    return () => clearTimeout(timeoutId)
  }, [updateURL])

  // Debounce search query for API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      // Track search when user stops typing
      if (searchQuery) {
        trackEvent.searchPerformed(searchQuery)
      }
    }, 300) // 300ms debounce for search

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleViewChange = (view: DiscoverView) => {
    setActiveView(view)
    if (view === 'studios') {
      router.push('/discover')
    } else {
      router.push('/discover/people')
    }
  }

  const handlePeopleSubViewChange = (subView: PeopleSubView) => {
    setPeopleSubView(subView)
    // Track filter application
    trackEvent.filterApply('people_type', subView)
    if (subView === 'all') {
      router.push('/discover/people')
    } else {
      router.push(`/discover/people/${subView}`)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Combined Navigation and Search Bar */}
      <div className="flex-shrink-0 bg-background border-b">
        <div className="px-4 sm:px-6 py-3 space-y-3">
          <div className="flex items-center justify-between gap-4">
            {/* View Toggle on the left */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-base">
                <button
                  onClick={() => handleViewChange('studios')}
                  className={cn(
                    "font-medium transition-all",
                    activeView === 'studios' 
                      ? "text-foreground border-b-2 border-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  STUDIOS
                </button>
                <span className="text-muted-foreground">|</span>
                <button
                  onClick={() => handleViewChange('people')}
                  className={cn(
                    "font-medium transition-all",
                    activeView === 'people' 
                      ? "text-foreground border-b-2 border-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  PEOPLE
                </button>
                
                {/* People sub-navigation - directly after PEOPLE */}
                {activeView === 'people' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground ml-3">
                  <button
                    onClick={() => handlePeopleSubViewChange('all')}
                    className={cn(
                      "transition-all hover:text-foreground",
                      peopleSubView === 'all' && "text-foreground font-medium"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handlePeopleSubViewChange('artists')}
                    className={cn(
                      "transition-all hover:text-foreground",
                      peopleSubView === 'artists' && "text-foreground font-medium"
                    )}
                  >
                    Artists
                  </button>
                  <button
                    onClick={() => handlePeopleSubViewChange('engineers')}
                    className={cn(
                      "transition-all hover:text-foreground",
                      peopleSubView === 'engineers' && "text-foreground font-medium"
                    )}
                  >
                    Engineers
                  </button>
                  <button
                    onClick={() => handlePeopleSubViewChange('industry')}
                    className={cn(
                      "transition-all hover:text-foreground",
                      peopleSubView === 'industry' && "text-foreground font-medium"
                    )}
                  >
                    Industry
                  </button>
                  </div>
                )}
                
                <span className="text-muted-foreground mx-3">|</span>
                <a
                  href="/connect/chat"
                  className="font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                  CHAT
                </a>
              </div>
            
            {/* Search bar and filter button on the right */}
            <div className="flex gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder={activeView === 'studios' ? "Search studios..." : "Search people..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFilterPanelOpen(true)}
                className="relative"
              >
                <IconFilter className="h-4 w-4" />
                {activeFilters > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
          
          {/* People sub-navigation on mobile - separate row */}
          {activeView === 'people' && (
            <div className="flex sm:hidden items-center gap-3 text-sm overflow-x-auto">
              <button
                onClick={() => handlePeopleSubViewChange('all')}
                className={cn(
                  "transition-all hover:text-foreground whitespace-nowrap",
                  peopleSubView === 'all' && "text-foreground font-medium"
                )}
              >
                All
              </button>
              <button
                onClick={() => handlePeopleSubViewChange('artists')}
                className={cn(
                  "transition-all hover:text-foreground whitespace-nowrap",
                  peopleSubView === 'artists' && "text-foreground font-medium"
                )}
              >
                Artists
              </button>
              <button
                onClick={() => handlePeopleSubViewChange('engineers')}
                className={cn(
                  "transition-all hover:text-foreground whitespace-nowrap",
                  peopleSubView === 'engineers' && "text-foreground font-medium"
                )}
              >
                Engineers
              </button>
              <button
                onClick={() => handlePeopleSubViewChange('industry')}
                className={cn(
                  "transition-all hover:text-foreground whitespace-nowrap",
                  peopleSubView === 'industry' && "text-foreground font-medium"
                )}
              >
                Industry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeView === 'studios' ? (
          <BrowseStudiosContent 
            filters={filters}
            searchQuery={debouncedSearchQuery}
          />
        ) : (
          <ProfilesGrid 
            category={peopleSubView}
            searchQuery={debouncedSearchQuery}
          />
        )}
      </div>


      {/* Filter Panel */}
      <FilterPanel
        open={filterPanelOpen}
        onOpenChange={setFilterPanelOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={() => {
          // Close the panel when filters are applied
          setFilterPanelOpen(false)
        }}
        type={activeView}
      />
    </div>
  )
}