'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ProfileCard } from '@/components/cards/profile-card'
import { ConnectionRequestCard } from './connection-request-card'
import { useMyConnections, usePendingRequests, useSentRequests } from '@/lib/hooks/queries/connections'
import { GenericCardSkeleton } from '@/components/skeletons/generic-card-skeleton'
import { Users, UserPlus, Send } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { GroupChatBasket } from './group-chat-basket'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ConnectionsHub() {
  const [activeTab, setActiveTab] = useState('connections')
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Query hooks
  const { data: connections, isLoading: connectionsLoading } = useMyConnections()
  const { data: pendingRequests, isLoading: pendingLoading } = usePendingRequests()
  const { data: sentRequests, isLoading: sentLoading } = useSentRequests()

  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleClearSelection = () => {
    setSelectedUsers([])
    setIsSelectMode(false)
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Professional Network</h1>
        <p className="text-muted-foreground">
          Manage your connections and build meaningful professional relationships
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Connections
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Pending
            {pendingRequests && pendingRequests.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-2">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {activeTab === 'connections' && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {connections?.length || 0} connections
              </p>
              <Button
                variant={isSelectMode ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setIsSelectMode(!isSelectMode)
                  if (!isSelectMode) {
                    setSelectedUsers([])
                  }
                }}
              >
                {isSelectMode ? 'Cancel Selection' : 'Select for Group Chat'}
              </Button>
            </div>
          )}

          {connectionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <GenericCardSkeleton key={i} />
              ))}
            </div>
          ) : connections && connections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {connections.map((connection) => (
                <div key={connection.user_id} className="relative">
                  {isSelectMode && (
                    <div className="absolute top-4 left-4 z-10">
                      <Checkbox
                        checked={selectedUsers.includes(connection.user_id)}
                        onCheckedChange={() => handleUserSelect(connection.user_id)}
                      />
                    </div>
                  )}
                  <ProfileCard
                    profile={connection}
                    linkToProfile={!isSelectMode}
                    hideFollowButton={true}
                    className={isSelectMode && selectedUsers.includes(connection.user_id) ? 'ring-2 ring-primary' : ''}
                  />
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg h-24 animate-pulse" />
              ))}
            </div>
          ) : pendingRequests && pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <ConnectionRequestCard
                  key={request.id}
                  request={request}
                  type="incoming"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
              <p className="text-muted-foreground">
                When someone sends you a connection request, it will appear here
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg h-24 animate-pulse" />
              ))}
            </div>
          ) : sentRequests && sentRequests.length > 0 ? (
            <div className="space-y-4">
              {sentRequests.map((request) => (
                <ConnectionRequestCard
                  key={request.id}
                  request={request}
                  type="outgoing"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sent requests</h3>
              <p className="text-muted-foreground">
                Connection requests you&apos;ve sent will appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Group Chat Basket */}
      {isSelectMode && selectedUsers.length > 0 && (
        <GroupChatBasket
          selectedUsers={selectedUsers}
          connections={connections || []}
          onClear={handleClearSelection}
        />
      )}
    </div>
  )
}