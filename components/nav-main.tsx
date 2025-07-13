"use client"

import { type Icon } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const { isMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const isActive = (itemUrl: string) => {
    // Exact match for /browse (Studios)
    if (itemUrl === '/browse' && pathname === '/browse') {
      return true
    }
    // For sub-routes, check if the pathname starts with the item URL
    if (itemUrl !== '/browse' && pathname.startsWith(itemUrl)) {
      return true
    }
    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title} 
                asChild
                isActive={isActive(item.url)}
              >
                <Link href={item.url} onClick={handleNavClick}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
