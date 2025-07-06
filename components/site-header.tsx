import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { IconBuilding } from "@tabler/icons-react"
import Link from "next/link"

interface SiteHeaderProps {
  title?: string
  showLogo?: boolean
}

export function SiteHeader({ title, showLogo = true }: SiteHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex w-full items-center gap-2 px-4">
        {/* Sidebar trigger for both mobile and desktop */}
        <SidebarTrigger />
        
        {showLogo && (
          <>
            {/* Logo for mobile when sidebar is hidden */}
            <Link href="/browse" className="flex items-center gap-2 md:hidden hover:opacity-80 transition-opacity">
              <IconBuilding className="h-5 w-5" />
              <span className="font-semibold">stwd.io</span>
            </Link>
            <Separator
              orientation="vertical"
              className="mx-2 h-4 md:hidden"
            />
          </>
        )}
        
        {title && (
          <h1 className="text-base font-medium text-foreground/80">{title}</h1>
        )}
        
        <div className="ml-auto" />
      </div>
    </header>
  )
}
