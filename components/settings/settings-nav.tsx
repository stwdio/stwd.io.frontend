'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { IconUser, IconBriefcase, IconShieldLock } from '@tabler/icons-react'

const settingsNavItems = [
  {
    title: 'Account',
    href: '/settings/account',
    icon: IconShieldLock,
    description: 'Email, password, and security'
  },
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: IconUser,
    description: 'Public profile information'
  },
  {
    title: 'Professional',
    href: '/settings/professional',
    icon: IconBriefcase,
    description: 'Skills and professional details'
  }
]

export function SettingsNav() {
  const pathname = usePathname()
  
  return (
    <nav className="space-y-1">
      {settingsNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent",
              isActive && "bg-accent"
            )}
          >
            <Icon className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-muted-foreground">
                {item.description}
              </div>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}