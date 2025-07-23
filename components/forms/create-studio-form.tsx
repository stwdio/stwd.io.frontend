'use client'

import { StudioFormStandalone } from '@/components/studio-form-standalone'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface CreateStudioFormProps {
  userId: string
}

export function CreateStudioForm({ userId }: CreateStudioFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleSaved = () => {
    toast({
      title: "Studio created",
      description: "Your studio has been successfully created."
    })
    router.push('/workspace')
  }

  return (
    <StudioFormStandalone
      ownerId={userId}
      onSaved={handleSaved}
      showActions={true}
    />
  )
}