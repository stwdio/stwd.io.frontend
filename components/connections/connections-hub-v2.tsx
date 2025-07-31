'use client'

import { useState, useCallback, useEffect } from 'react'
import { ProfileCard } from '@/components/cards/profile-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, Filter, Search } from 'lucide-react'
import { IconFilter, IconSearch } from '@tabler/icons-react'
import { useMyConnections, usePendingRequests, useSentRequests } from '@/lib/hooks/queries/connections'
import { useAcceptConnectionRequest, useDeclineConnectionRequest, useCancelConnectionRequest } from '@/lib/hooks/mutations/connections'
import { GenericCardSkeleton } from '@/components/skeletons/generic-card-skeleton'
import { useGroupChatBasket } from '@/lib/store/group-chat-basket'
import { useRouter } from 'next/navigation'
import { ConnectionsFilterPanel } from './connections-filter-panel'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileCardCustomActionsProps {
  profile: Profile
  isInBasket: boolean
  onToggleGroupChat: () => void
}

function ProfileCardCustomActions({ profile, isInBasket, onToggleGroupChat }: ProfileCardCustomActionsProps) {
  const router = useRouter()
  
  return (
    <div className="flex gap-2 w-full">
      <Button
        size="sm"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          router.push(`/connect/chat?user=${profile.username}`)
        }}
        className="flex-1 text-xs"
        variant="outline"
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        Message
      </Button>
      
      <Button
        size="sm"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggleGroupChat()
        }}
        className={`flex-1 text-xs ${
          isInBasket ? 'bg-gray-600 hover:bg-gray-700' : 'bg-black hover:bg-gray-800'
        } text-white`}
      >
        <Users className="h-4 w-4 mr-1" />
        {isInBasket ? 'Added' : 'Group Chat'}
      </Button>
    </div>
  )
}

function ReceivedRequestActions({ requestId }: { requestId: number }) {
  const { mutate: acceptRequest, isPending: isAccepting } = useAcceptConnectionRequest()
  const { mutate: declineRequest, isPending: isDeclining } = useDeclineConnectionRequest()
  
  return (
    <div className="flex gap-2 w-full">
      <Button
        size="sm"
        className="flex-1 text-xs"
        variant="default"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          acceptRequest(requestId)
        }}
        disabled={isAccepting || isDeclining}
      >
        {isAccepting ? 'Accepting...' : 'Accept'}
      </Button>
      <Button
        size="sm"
        className="flex-1 text-xs"
        variant="outline"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          declineRequest(requestId)
        }}
        disabled={isAccepting || isDeclining}
      >
        {isDeclining ? 'Declining...' : 'Decline'}
      </Button>
    </div>
  )
}

function SentRequestActions({ requestId }: { requestId: number }) {
  const { mutate: cancelRequest, isPending: isCanceling } = useCancelConnectionRequest()
  
  return (
    <div className="flex gap-2 w-full justify-center">
      <Button
        size="sm"
        className="text-xs"
        variant="outline"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          cancelRequest(requestId)
        }}
        disabled={isCanceling}
      >
        {isCanceling ? 'Canceling...' : 'Cancel Request'}
      </Button>
    </div>
  )
}

export function ConnectionsHubV2() {
  const { data: connections, isLoading: connectionsLoading } = useMyConnections()
  const { data: pendingRequests } = usePendingRequests()
  const { data: sentRequests } = useSentRequests()
  const { addUser, removeUser, isUserInBasket } = useGroupChatBasket()
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'connected' | 'sent' | 'received'>('all')

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleGroupChatToggle = useCallback((userId: string) => {
    if (isUserInBasket(userId)) {
      removeUser(userId)
    } else {
      addUser(userId)
    }
  }, [addUser, removeUser, isUserInBasket])

  // Filter connections based on search and filter type
  const filteredConnections = connections?.filter(connection => {
    // Search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      const fullName = `${connection.first_name || ''} ${connection.last_name || ''}`.toLowerCase()
      const username = (connection.username || '').toLowerCase()
      if (!fullName.includes(query) && !username.includes(query)) {
        return false
      }
    }
    
    return true
  }) || []

  // Calculate active filter count
  const activeFilters = filterType !== 'all' ? 1 : 0

  if (connectionsLoading) {
    return (
      <div className="w-full">
        {/* Search and Filter Bar Skeleton */}
        <div className="w-full px-4 sm:px-6 py-4 border-b">
          <div className="flex gap-3 items-center justify-end">
            <div className="h-9 w-[280px] bg-muted animate-pulse rounded-md" />
            <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
        
        <div className="w-full px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-6">
            {[...Array(10)].map((_, i) => (
              <GenericCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="w-full">
        {/* Search and Filter Bar */}
        <div className="w-full px-4 sm:px-6 py-4 border-b">
          <div className="flex gap-3 items-center justify-end">
            {/* Search bar */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search connections..."
                className="pl-10 w-[280px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter button */}
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
        </div>
        
        <div className="w-full px-4 sm:px-6 py-6">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your professional network by connecting with other users
            </p>
            <Button onClick={() => window.location.href = '/discover/people'}>
              Discover People
            </Button>
          </div>
        </div>
        
        {/* Filter Panel */}
        <ConnectionsFilterPanel
          open={filterPanelOpen}
          onOpenChange={setFilterPanelOpen}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          receivedCount={pendingRequests?.length || 0}
          sentCount={sentRequests?.length || 0}
        />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Search and Filter Bar */}
      <div className="w-full px-4 sm:px-6 py-4 border-b">
        <div className="flex gap-3 items-center justify-end">
          {/* Search bar */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search connections..."
              className="pl-10 w-[280px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filter button */}
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
      </div>

      <div className="w-full px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-6">
          {filterType === 'received' && pendingRequests ? (
            // Show received pending requests
            pendingRequests.map((request) => (
              <ProfileCard
                key={request.requester?.user_id || request.id}
                profile={request.requester!}
                linkToProfile={true}
                hideFollowButton={true}
                customActions={
                  <ReceivedRequestActions requestId={request.id} />
                }
              />
            ))
          ) : filterType === 'sent' && sentRequests ? (
            // Show sent pending requests
            sentRequests.map((request) => (
              <ProfileCard
                key={request.receiver?.user_id || request.id}
                profile={request.receiver!}
                linkToProfile={true}
                hideFollowButton={true}
                customActions={
                  <SentRequestActions requestId={request.id} />
                }
              />
            ))
          ) : filterType === 'connected' || filterType === 'all' ? (
            // Show connected users
            filteredConnections.map((connection) => (
              <ProfileCard
                key={connection.user_id}
                profile={connection}
                linkToProfile={true}
                hideFollowButton={true}
                customActions={
                  <ProfileCardCustomActions
                    profile={connection}
                    isInBasket={isUserInBasket(connection.user_id)}
                    onToggleGroupChat={() => handleGroupChatToggle(connection.user_id)}
                  />
                }
              />
            ))
          ) : null}
        </div>
      </div>
      
      {/* Filter Panel */}
      <ConnectionsFilterPanel
        open={filterPanelOpen}
        onOpenChange={setFilterPanelOpen}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        pendingCount={pendingRequests?.length || 0}
      />
    </div>
  )
}