import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { ClientLayout } from "@/components/client-layout"
import { OnboardingGate } from "@/components/onboarding-gate"

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout>
          <OnboardingGate>
            <div className="min-h-screen bg-black text-white">
              <Header />
              <main>{children}</main>
            </div>
          </OnboardingGate>
          <Toaster />
        </ClientLayout>
      </body>
    </html>
  )
}
