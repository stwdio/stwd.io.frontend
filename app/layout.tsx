import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ClientLayout } from "@/components/client-layout"
import { OnboardingGate } from "@/components/onboarding-gate"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { STWDSidebar } from "@/components/stwd-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "stwd.io - Professional Recording Studios",
  description: "Book professional recording studios worldwide",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout>
          <OnboardingGate>
            <SidebarProvider>
              <STWDSidebar variant="inset" />
              <SidebarInset>
                <main className="flex flex-1 flex-col">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </OnboardingGate>
          <Toaster />
        </ClientLayout>
      </body>
    </html>
  )
}
