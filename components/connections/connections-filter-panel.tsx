'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, Send, UserPlus } from 'lucide-react'

interface ConnectionsFilterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filterType: 'all' | 'connected' | 'sent' | 'received'
  onFilterTypeChange: (type: 'all' | 'connected' | 'sent' | 'received') => void
  receivedCount: number
  sentCount: number
}

export function ConnectionsFilterPanel({
  open,
  onOpenChange,
  filterType,
  onFilterTypeChange,
  receivedCount,
  sentCount
}: ConnectionsFilterPanelProps) {
  
  const handleReset = () => {
    onFilterTypeChange('all')
  }

  const handleApply = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filter Connections</SheetTitle>
          <SheetDescription>
            Filter your connections by status
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          {/* Connection Status Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Connection Status</Label>
            <RadioGroup value={filterType} onValueChange={(value) => onFilterTypeChange(value as 'all' | 'connected' | 'sent' | 'received')}>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="flex-1 cursor-pointer flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>All Connections</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="connected" id="connected" />
                <Label htmlFor="connected" className="flex-1 cursor-pointer flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Connected</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="received" id="received" />
                <Label htmlFor="received" className="flex-1 cursor-pointer flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Received Requests</span>
                  {receivedCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {receivedCount}
                    </Badge>
                  )}
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="sent" id="sent" />
                <Label htmlFor="sent" className="flex-1 cursor-pointer flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>Sent Requests</span>
                  {sentCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {sentCount}
                    </Badge>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}