import React, { useState, useRef, useEffect } from 'react'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import { Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmojiPickerComponentProps {
  onEmojiClick: (emoji: string) => void
  className?: string
}

export function EmojiPickerComponent({ onEmojiClick, className }: EmojiPickerComponentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiClick(emojiData.emoji)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={pickerRef}>
      <Button
        variant="ghost"
        size="icon"
        className={cn("mb-1", className)}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Smile className="h-5 w-5" />
      </Button>
      
      {isOpen && (
        <div className="absolute bottom-12 left-0 z-50 shadow-lg border rounded-lg overflow-hidden">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={Theme.DARK}
            width={350}
            height={400}
            previewConfig={{
              defaultCaption: "Pick an emoji!",
              defaultEmoji: "😀"
            }}
            searchPlaceholder="Search emojis..."
            skinTonesDisabled={false}
          />
        </div>
      )}
    </div>
  )
} 