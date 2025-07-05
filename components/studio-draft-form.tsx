'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Building, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { createDraftStudio } from '@/lib/actions/studios'

interface StudioDraftFormProps {
  onSuccess: (studioId: number) => void
}

export function StudioDraftForm({ onSuccess }: StudioDraftFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    hourly_rate: 50
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Studio name is required')
      return
    }
    
    if (!formData.location.trim()) {
      toast.error('Studio location is required')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createDraftStudio({
        name: formData.name.trim(),
        location: formData.location.trim(),
        description: formData.description.trim() || undefined,
        hourly_rate: formData.hourly_rate
      })

      if (result.success && result.data) {
        toast.success('Studio draft created! Add photos and details to complete your listing.')
        
        // Redirect to edit page
        router.push(`/dashboard/studios/${result.data.id}/edit`)
        
        // Call success callback
        onSuccess(result.data.id)
      } else {
        toast.error(result.error || 'Failed to create studio draft')
      }
    } catch (error) {
      console.error('Error creating studio draft:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Create Your Studio Listing
          </CardTitle>
          <CardDescription>
            Start by providing basic information about your studio. You'll be able to add photos, 
            equipment details, and amenities in the next step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Studio Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">
                Studio Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your studio name"
                className="h-12 text-base"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-base font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State/Province, Country"
                className="h-12 text-base"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                Brief Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Briefly describe your studio (you can expand this later)"
                rows={4}
                className="text-base resize-none"
              />
              <p className="text-sm text-muted-foreground">
                You can add a more detailed description later
              </p>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="hourly_rate" className="text-base font-medium">
                Starting Hourly Rate (USD)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-base">
                  $
                </span>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => handleInputChange('hourly_rate', Number.parseFloat(e.target.value) || 0)}
                  className="pl-10 h-12 text-base"
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                You can adjust this later based on your specific services
              </p>
            </div>

            {/* Information Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-medium text-primary mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Upload high-quality photos of your studio</li>
                <li>• Add detailed equipment and gear information</li>
                <li>• Select relevant amenities</li>
                <li>• Review and publish your listing</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="min-w-[180px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Draft...
                  </>
                ) : (
                  <>
                    Continue to Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 