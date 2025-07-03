'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, Plus, Check, BookmarkPlus, Loader2 } from 'lucide-react'
import { addStudioToList, removeStudioFromList, getUserLists, ListWithCount } from '@/lib/actions/lists'
import { toast } from 'sonner'
import CreateListDialog from './create-list-dialog'

interface AddToListDropdownProps {
  studioId: string
  studioName: string
  trigger?: React.ReactNode
  onSuccess?: () => void
  // OPTIMIZED: Receive membership data as props instead of fetching on render
  initialMemberships?: {list_id: number, list_name: string, list_icon_emoji: string}[]
}

export default function AddToListDropdown({ 
  studioId, 
  studioName, 
  trigger,
  onSuccess,
  initialMemberships = []
}: AddToListDropdownProps) {
  const [lists, setLists] = useState<ListWithCount[]>([])
  const [listMemberships, setListMemberships] = useState<Set<number>>(() => 
    new Set(initialMemberships.map(m => m.list_id))
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [actionLoadingStates, setActionLoadingStates] = useState<Set<number>>(new Set())

  // Load user's lists when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      loadData()
    }
  }, [isDropdownOpen])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load user's lists (memberships are provided as props)
      const listsResult = await getUserLists()

      if (listsResult.success) {
        setLists(listsResult.data || [])
      } else {
        toast.error('Failed to load your lists')
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load lists')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStudio = async (listId: number, listName: string, isInList: boolean) => {
    setActionLoadingStates(prev => new Set(prev).add(listId))
    
    try {
      const result = isInList 
        ? await removeStudioFromList(listId.toString(), studioId)
        : await addStudioToList(listId.toString(), studioId)

      if (result.success) {
        const action = isInList ? 'removed from' : 'added to'
        toast.success(`${studioName} ${action} ${listName}`)
        
        // Update local state
        setListMemberships(prev => {
          const updated = new Set(prev)
          if (isInList) {
            updated.delete(listId)
          } else {
            updated.add(listId)
          }
          return updated
        })
        
        // Update list counts
        setLists(prev => prev.map(list => 
          list.id === listId.toString() 
            ? { 
                ...list, 
                studio_count: isInList 
                  ? Math.max(0, list.studio_count - 1)
                  : list.studio_count + 1
              }
            : list
        ))
        
        onSuccess?.()
      } else {
        toast.error(result.error || 'Failed to update list')
      }
    } catch (error) {
      console.error('Error toggling studio in list:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setActionLoadingStates(prev => {
        const updated = new Set(prev)
        updated.delete(listId)
        return updated
      })
    }
  }

  const handleCreateListSuccess = () => {
    setShowCreateDialog(false)
    // Reload data to show the new list
    loadData()
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <BookmarkPlus className="h-4 w-4 mr-2" />
      Add to List
    </Button>
  )

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          {trigger || defaultTrigger}
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Add to List</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isLoading ? (
            <DropdownMenuItem disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading lists...
            </DropdownMenuItem>
          ) : lists.length === 0 ? (
            <DropdownMenuItem disabled>
              No lists created yet
            </DropdownMenuItem>
          ) : (
            lists.map((list) => {
              const isInList = listMemberships.has(parseInt(list.id))
              const isActionLoading = actionLoadingStates.has(parseInt(list.id))
              
              return (
                <DropdownMenuItem
                  key={list.id}
                  onClick={() => handleToggleStudio(parseInt(list.id), list.name, isInList)}
                  disabled={isActionLoading}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="mr-2">{list.icon_emoji}</span>
                    <div className="flex flex-col">
                      <span className="text-sm">{list.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {list.studio_count} studio{list.studio_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {isActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isInList ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </div>
                </DropdownMenuItem>
              )
            })
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateListDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onListCreated={handleCreateListSuccess}
      />
    </>
  )
} 