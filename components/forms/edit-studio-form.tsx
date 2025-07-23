'use client'

import { StudioFormStandalone } from '@/components/studio-form-standalone'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/lib/types/database'

type Studio = Database['public']['Tables']['studios']['Row'] & {
  amenities?: Array<{
    amenity_id: number
  }>
  gear?: Array<{
    gear: string
  }>
}

interface EditStudioFormProps {
  studio: Studio
  userId: string
}

export function EditStudioForm({ studio, userId }: EditStudioFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleSaved = () => {
    toast({
      title: "Studio updated",
      description: "Your studio has been successfully updated."
    })
    router.push('/workspace')
  }

  return (
    <StudioFormStandalone
      studio={studio}
      ownerId={userId}
      onSaved={handleSaved}
      showActions={true}
    />
  )
}