'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuoteBasket } from '@/lib/store/quote-basket'
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, MapPin, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getPriceTierSymbol } from '@/lib/constants/currencies'
import DateRangePicker from '@/components/date-picker/date-range-picker'
import { format } from 'date-fns'
import { type DateRange } from 'react-day-picker'

export function QuoteBasketDialog() {
  const router = useRouter()
  const { studios, isOpen, toggleBasket, removeStudio, clearBasket, submitInquiry } = useQuoteBasket()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [formData, setFormData] = useState({
    project_type: '',
    genre: '',
    budget_range: '',
    preferred_dates: '',
    custom_message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.project_type) {
      toast.error('Please Select A Project Type')
      return
    }
    
    if (!formData.genre) {
      toast.error('Please Select A Genre')
      return
    }
    
    if (!formData.budget_range) {
      toast.error('Please Select A Budget Range')
      return
    }
    
    if (!dateRange?.from) {
      toast.error('Please Select Preferred Dates')
      return
    }
    
    
    // Format date range for submission
    const dateRangeString = dateRange?.from 
      ? dateRange.to 
        ? `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`
        : format(dateRange.from, 'LLL dd, y')
      : ''
    
    setIsSubmitting(true)
    
    try {
      const success = await submitInquiry({
        ...formData,
        preferred_dates: dateRangeString
      })
      if (success) {
        // Reset form
        setFormData({
          project_type: '',
          genre: '',
          budget_range: '',
          preferred_dates: '',
          custom_message: ''
        })
        setDateRange(undefined)
        
        // Navigate to chat
        router.push('/connect/chat')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const projectTypes = [
    { value: 'record', label: 'Recording Session' },
    { value: 'mix', label: 'Mixing' },
    { value: 'master', label: 'Mastering' },
    { value: 'rehearsal', label: 'Rehearsal' },
    { value: 'other', label: 'Other' }
  ]

  const budgetRanges = [
    { value: '$', label: '$ - Under $500' },
    { value: '$$', label: '$$ - $500 - $1,500' },
    { value: '$$$', label: '$$$ - $1,500 - $5,000' },
    { value: '$$$$', label: '$$$$ - Over $5,000' }
  ]

  const genres = [
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock' },
    { value: 'hip-hop', label: 'Hip-Hop' },
    { value: 'r&b', label: 'R&B' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'classical', label: 'Classical' },
    { value: 'country', label: 'Country' },
    { value: 'metal', label: 'Metal' },
    { value: 'indie', label: 'Indie' },
    { value: 'folk', label: 'Folk' },
    { value: 'blues', label: 'Blues' },
    { value: 'reggae', label: 'Reggae' },
    { value: 'latin', label: 'Latin' },
    { value: 'world', label: 'World' },
    { value: 'experimental', label: 'Experimental' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'audiobook', label: 'Audiobook' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={toggleBasket}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "sm:rounded-lg"
          )}
        >
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          
          <DialogHeader>
            <DialogTitle>Quote Basket</DialogTitle>
            <DialogDescription>
              Send Your Project Details To All Selected Studios At Once
            </DialogDescription>
          </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Studios List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Selected Studios</h3>
              {studios.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearBasket}>
                  Clear All
                </Button>
              )}
            </div>
            
            {studios.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No Studios Selected. Browse Studios And Add Them To Your Quote Basket.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {studios.map((studio) => (
                  <Card key={studio.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{studio.name}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {studio.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {getPriceTierSymbol(studio.price_tier || 1)}
                            </div>
                          </div>
                          <Badge variant="default" className="mt-2">
                            Verified
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStudio(studio.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Inquiry Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project_type">Project Type *</Label>
                <Select
                  value={formData.project_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, project_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Project Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre *</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre.value} value={genre.value}>
                        {genre.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Budget Range *</Label>
                <Select
                  value={formData.budget_range}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, budget_range: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Budget Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((budget) => (
                      <SelectItem key={budget.value} value={budget.value}>
                        {budget.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Dates *</Label>
                <DateRangePicker 
                  date={dateRange}
                  onDateChange={setDateRange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom_message">Additional Message</Label>
                  <span className={cn(
                    "text-xs",
                    formData.custom_message.length > 280 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {formData.custom_message.length}/280
                  </span>
                </div>
                <Textarea
                  id="custom_message"
                  value={formData.custom_message}
                  onChange={(e) => {
                    if (e.target.value.length <= 280) {
                      setFormData(prev => ({ ...prev, custom_message: e.target.value }))
                    }
                  }}
                  placeholder="Tell The Studios More About Your Project..."
                  rows={4}
                  className={cn(
                    formData.custom_message.length > 260 && "focus:ring-amber-500"
                  )}
                />
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={studios.length === 0 || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Sending...' : `Send to ${studios.length} Studio${studios.length !== 1 ? 's' : ''}`}
                </Button>
                <Button type="button" variant="outline" onClick={toggleBasket}>
                  Close
                </Button>
              </div>
            </form>
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
} 