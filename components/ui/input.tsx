import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Mobile optimizations
        "min-h-[44px] md:min-h-[36px] md:h-9 md:text-sm",
        // Keyboard-specific optimizations
        "data-[type=email]:inputmode-email data-[type=tel]:inputmode-tel data-[type=url]:inputmode-url data-[type=search]:inputmode-search",
        className
      )}
      // Auto-optimize keyboard type on mobile
      inputMode={
        type === 'email' ? 'email' :
        type === 'tel' ? 'tel' :
        type === 'url' ? 'url' :
        type === 'search' ? 'search' :
        type === 'number' ? 'numeric' :
        undefined
      }
      autoComplete={
        type === 'email' ? 'email' :
        type === 'tel' ? 'tel' :
        type === 'url' ? 'url' :
        type === 'password' ? 'current-password' :
        props.autoComplete
      }
      {...props}
    />
  )
}

export { Input }
