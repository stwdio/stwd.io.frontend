'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { IconFilter, IconSearch } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { BrowseStudiosContent } from '@/components/browse-studios-content-simple'
import { ProfilesGrid } from '@/components/discover/profiles-grid'
import { FilterPanel } from '@/components/discover/filter-panel'

type DiscoverView = 'studios' | 'people'
type PeopleSubView = 'all' | 'artists' | 'engineers' | 'industry'

export function DiscoverContent() {
  const router = useRouter()
  const pathname = usePathname()
  
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
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [filters, setFilters] = useState({
    location: '',
    priceRange: [0, 1000] as [number, number],
    selectedPriceTiers: [] as number[],
    selectedAmenities: [] as string[],
    selectedGear: [] as string[]
  })
  
  // Calculate active filter count
  const activeFilters = [
    filters.location,
    filters.selectedPriceTiers.length,
    filters.selectedAmenities.length,
    filters.selectedGear.length,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000
  ].filter(Boolean).length

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
    if (subView === 'all') {
      router.push('/discover/people')
    } else {
      router.push(`/discover/people/${subView}`)
    }
  }

  return (
    <div className="bg-background">
      {/* Page Header */}
      <div className="bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Large DISCOVER title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            DISCOVER
          </h1>
          
          {/* View Toggle */}
          <div className="flex items-center gap-6 text-lg sm:text-xl">
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
          </div>
          
          {/* People sub-navigation */}
          {activeView === 'people' && (
            <div className="flex items-center gap-4 mt-4 text-sm">
              <button
                onClick={() => handlePeopleSubViewChange('all')}
                className={cn(
                  "font-medium transition-all",
                  peopleSubView === 'all' 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              <button
                onClick={() => handlePeopleSubViewChange('artists')}
                className={cn(
                  "font-medium transition-all",
                  peopleSubView === 'artists' 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Artists
              </button>
              <button
                onClick={() => handlePeopleSubViewChange('engineers')}
                className={cn(
                  "font-medium transition-all",
                  peopleSubView === 'engineers' 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Engineers
              </button>
              <button
                onClick={() => handlePeopleSubViewChange('industry')}
                className={cn(
                  "font-medium transition-all",
                  peopleSubView === 'industry' 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Industry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar and Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search bar and filter button aligned to the right */}
        <div className="flex justify-end gap-2 mb-6">
          <div className="relative w-full max-w-md">
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

        {/* Content Area */}
        {activeView === 'studios' ? (
          <div className="studios-grid-wrapper">
            <BrowseStudiosContent />
          </div>
        ) : (
          <ProfilesGrid 
            subView={peopleSubView}
            searchQuery={searchQuery}
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
          // Filters will be applied automatically through state
          console.log('Filters applied:', filters)
        }}
        type={activeView}
      />
    </div>
  )
}