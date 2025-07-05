import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent animate-pulse rounded-md",
        // Mobile optimizations for better performance
        "will-change-auto transform-gpu",
        // Smoother animation on mobile
        "animate-duration-[1.5s] animate-ease-in-out",
        className
      )}
      {...props}
    />
  )
}

// Mobile-optimized loading spinner component
function LoadingSpinner({ 
  className, 
  size = "default",
  ...props 
}: React.ComponentProps<"div"> & {
  size?: "sm" | "default" | "lg"
}) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    default: "w-6 h-6 border-2", 
    lg: "w-8 h-8 border-[3px]"
  }

  return (
    <div
      data-slot="loading-spinner"
      className={cn(
        "border-foreground border-t-transparent rounded-full animate-spin",
        "will-change-transform transform-gpu",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

// Touch-friendly loading button component
function LoadingButton({
  children,
  loading = false,
  disabled,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  loading?: boolean
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 min-h-[44px] md:min-h-[36px] px-4 py-2 touch-manipulation active:scale-95",
        "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/80",
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" className="text-current" />
      )}
      {children}
    </button>
  )
}

// Mobile-optimized pulse animation for cards
function PulseCard({ 
  className,
  children,
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pulse-card"
      className={cn(
        "animate-pulse bg-accent/20 rounded-lg p-4",
        "will-change-auto transform-gpu",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Skeleton, LoadingSpinner, LoadingButton, PulseCard }
