'use client'

import { useState } from 'react'
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

export function QuoteBasketDialog() {
  const { studios, isOpen, toggleBasket, removeStudio, clearBasket, submitInquiry } = useQuoteBasket()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    project_type: '',
    genre: '',
    budget_range: '',
    preferred_dates: '',
    location_preference: '',
    custom_message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.project_type) {
      toast.error('Please select a project type')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const success = await submitInquiry(formData)
      if (success) {
        // Reset form
        setFormData({
          project_type: '',
          genre: '',
          budget_range: '',
          preferred_dates: '',
          location_preference: '',
          custom_message: ''
        })
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
            <DialogTitle>Quote Basket ({studios.length})</DialogTitle>
            <DialogDescription>
              Send your project details to all selected studios at once
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
                    No studios selected. Browse studios and add them to your quote basket.
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
                    <SelectValue placeholder="Select project type" />
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
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                  placeholder="e.g., Pop, Rock, Hip-Hop, Electronic"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Budget Range</Label>
                <Select
                  value={formData.budget_range}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, budget_range: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
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
                <Label htmlFor="preferred_dates">Preferred Dates</Label>
                <Input
                  id="preferred_dates"
                  value={formData.preferred_dates}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_dates: e.target.value }))}
                  placeholder="e.g., Next week, January 15-20, Flexible"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_preference">Location Preference</Label>
                <Input
                  id="location_preference"
                  value={formData.location_preference}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_preference: e.target.value }))}
                  placeholder="e.g., Within 50 miles of downtown"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_message">Additional Message</Label>
                <Textarea
                  id="custom_message"
                  value={formData.custom_message}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_message: e.target.value }))}
                  placeholder="Tell the studios more about your project..."
                  rows={4}
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