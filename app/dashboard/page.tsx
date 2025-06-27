import { AppSidebar } from "@/components/app-sidebar"
import { BrowseStudiosContent } from "@/components/browse-studios-content"
import { FloatingCartButton } from "@/components/floating-cart-button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <BrowseStudiosContent />
          </div>
        </div>
      </SidebarInset>
      <FloatingCartButton />
    </SidebarProvider>
  )
}
