'use client'

import { useState, useCallback, useEffect } from 'react'
import { ProfileCard } from '@/components/cards/profile-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
    <TooltipProvider>
      <div className="flex gap-1 w-full">
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Accept connection request</p>
          </TooltipContent>
        </Tooltip>
        
        <Button
          size="sm"
          className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white border-red-600"
          variant="destructive"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            declineRequest(requestId)
          }}
          disabled={isAccepting || isDeclining}
        >
          {isDeclining ? 'Rejecting...' : 'Reject'}
        </Button>
      </div>
    </TooltipProvider>
  )
}

function SentRequestActions({ requestId }: { requestId: number }) {
  const { mutate: cancelRequest, isPending: isCanceling } = useCancelConnectionRequest()
  
  return (
    <TooltipProvider>
      <div className="flex gap-2 w-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-1">
              <Button
                size="sm"
                className="w-full text-xs"
                variant="outline"
                disabled={true}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connection request pending</p>
          </TooltipContent>
        </Tooltip>
        
        <Button
          size="sm"
          className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white border-red-600"
          variant="destructive"
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
    </TooltipProvider>
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
  
  // Create maps for quick lookup of pending states
  const sentRequestsMap = new Map(sentRequests?.map(req => [req.receiver?.user_id, req]) || [])
  const receivedRequestsMap = new Map(pendingRequests?.map(req => [req.requester?.user_id, req]) || [])

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

  // Get all unique users (connections + pending)
  const allUsers = [...(connections || [])]
  
  // Add sent request recipients if showing all
  if (filterType === 'all') {
    sentRequests?.forEach(req => {
      if (req.receiver && !allUsers.find(u => u.user_id === req.receiver!.user_id)) {
        allUsers.push(req.receiver)
      }
    })
    
    // Add received request senders if showing all
    pendingRequests?.forEach(req => {
      if (req.requester && !allUsers.find(u => u.user_id === req.requester!.user_id)) {
        allUsers.push(req.requester)
      }
    })
  }
  
  // Filter users based on search and filter type
  const filteredUsers = allUsers.filter(user => {
    // Search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase()
      const username = (user.username || '').toLowerCase()
      if (!fullName.includes(query) && !username.includes(query)) {
        return false
      }
    }
    
    return true
  })

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
          ) : filterType === 'connected' ? (
            // Show only connected users
            filteredUsers
              .filter(user => connections?.some(c => c.user_id === user.user_id))
              .map((user) => (
                <ProfileCard
                  key={user.user_id}
                  profile={user}
                  linkToProfile={true}
                  hideFollowButton={true}
                  customActions={
                    <ProfileCardCustomActions
                      profile={user}
                      isInBasket={isUserInBasket(user.user_id)}
                      onToggleGroupChat={() => handleGroupChatToggle(user.user_id)}
                    />
                  }
                />
              ))
          ) : filterType === 'all' ? (
            // Show all users with appropriate actions based on status
            filteredUsers.map((user) => {
              const isConnected = connections?.some(c => c.user_id === user.user_id)
              const sentRequest = sentRequestsMap.get(user.user_id)
              const receivedRequest = receivedRequestsMap.get(user.user_id)
              
              let customActions
              let statusBadge = null
              
              if (receivedRequest) {
                customActions = <ReceivedRequestActions requestId={receivedRequest.id} />
                statusBadge = { label: 'Pending', variant: 'secondary' as const }
              } else if (sentRequest) {
                customActions = <SentRequestActions requestId={sentRequest.id} />
                statusBadge = { label: 'Requested', variant: 'outline' as const }
              } else if (isConnected) {
                customActions = (
                  <ProfileCardCustomActions
                    profile={user}
                    isInBasket={isUserInBasket(user.user_id)}
                    onToggleGroupChat={() => handleGroupChatToggle(user.user_id)}
                  />
                )
              } else {
                // This shouldn't happen in the current logic
                customActions = null
              }
              
              return (
                <ProfileCard
                  key={user.user_id}
                  profile={user}
                  linkToProfile={true}
                  hideFollowButton={true}
                  customActions={customActions}
                  statusBadge={statusBadge}
                />
              )
            })
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