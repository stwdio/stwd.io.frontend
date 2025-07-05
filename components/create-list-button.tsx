'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateListDialog from './create-list-dialog'
import { useRouter } from 'next/navigation'

interface CreateListButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export default function CreateListButton({ 
  variant = 'outline', 
  size = 'default',
  className 
}: CreateListButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const router = useRouter()

  const handleListCreated = () => {
    setShowDialog(false)
    // Refresh the page to show the new list
    router.refresh()
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowDialog(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create List
      </Button>

      <CreateListDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onListCreated={handleListCreated}
      />
    </>
  )
} 