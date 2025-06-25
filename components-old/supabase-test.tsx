"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export function SupabaseTest() {
  const [status, setStatus] = useState<"testing" | "success" | "error">("testing")
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setStatus("testing")
    setError(null)

    try {
      console.log("Testing Supabase connection...")

      // Test basic connection
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        console.error("Supabase test error:", error)
        setError(error.message)
        setStatus("error")
      } else {
        console.log("Supabase test successful:", data)
        setStatus("success")
      }
    } catch (err) {
      console.error("Connection test failed:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setStatus("error")
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Supabase Connection Test</h3>
      <div className="space-y-2">
        <div>Status: {status}</div>
        {error && <div className="text-red-500">Error: {error}</div>}
        <Button onClick={testConnection} size="sm">
          Test Again
        </Button>
      </div>
    </div>
  )
}
