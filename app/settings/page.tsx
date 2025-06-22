"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Bell, Shield, CreditCard } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="grid gap-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/settings/profile">
          <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your personal information and username
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card className="bg-gray-900 border-gray-800 opacity-50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure email and push notifications (Coming Soon)
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gray-900 border-gray-800 opacity-50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Shield className="h-5 w-5" />
              Privacy & Security  
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage account security and privacy settings (Coming Soon)
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gray-900 border-gray-800 opacity-50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <CreditCard className="h-5 w-5" />
              Billing & Payments
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage subscription and payment methods (Coming Soon)
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
} 