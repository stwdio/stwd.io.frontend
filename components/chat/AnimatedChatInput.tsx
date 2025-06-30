import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface AnimatedChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSend: (content: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AnimatedChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  placeholder = "Type a message...",
  disabled = false,
  className
}: AnimatedChatInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [value])

  // Handle typing state
  useEffect(() => {
    setIsTyping(value.length > 0)
  }, [value])

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    onKeyDown?.(e)
  }

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className={cn(
          "flex items-end gap-3 p-3 rounded-2xl transition-all duration-200",
          "border-2 bg-background relative overflow-hidden",
          isFocused || isTyping
            ? "border-primary shadow-lg shadow-primary/20" 
            : "border-border"
        )}
        initial={{ scale: 1 }}
        animate={{ 
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused 
            ? "0 0 0 4px hsl(var(--primary) / 0.1), 0 10px 20px -5px hsl(var(--primary) / 0.2)" 
            : "0 1px 3px 0 rgb(0 0 0 / 0.1)"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
      >
        {/* Purple glow effect when focused */}
        <AnimatePresence>
          {(isFocused || isTyping) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl blur-sm"
            />
          )}
        </AnimatePresence>

        <motion.div
          className="flex-1"
          initial={{ width: "100%" }}
          animate={{ 
            width: isFocused ? "calc(100% - 50px)" : "100%" 
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
        >
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent p-0",
              "focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60",
              "text-base leading-relaxed"
            )}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {(isFocused || value.trim()) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 25 
              }}
            >
              <Button
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-full shrink-0 transition-all duration-200",
                  "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl",
                  "hover:scale-105 active:scale-95"
                )}
                onClick={handleSend}
                disabled={disabled || !value.trim()}
                type="button"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced Typing Indicator */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            className="absolute -bottom-7 left-4 flex items-center gap-2"
          >
            <div className="flex items-center gap-1">
              <motion.div
                className="w-1 h-1 bg-primary rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="w-1 h-1 bg-primary rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-1 h-1 bg-primary rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
            <span className="text-xs font-medium text-primary tracking-wider">
              TYPED IN
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 