import { notFound } from "next/navigation"
import { createServerComponentClient } from "@/lib/supabase/server"

export interface CoreStudioData {
  id: number
  name: string
  description: string
  location: string
  hourly_rate: number
  gear: any
  owner_id: number
  created_at: string
  verification_status: string
  published: boolean
  photo_urls?: string[]
  slug: string
}

// Minimal data fetching for instant page shell
export async function getCoreStudioData(slug: string): Promise<CoreStudioData> {
  const supabase = await createServerComponentClient()
  
  // Only fetch essential studio data - no joins, no amenities, no reviews
  const { data: studioData, error } = await supabase
    .from("studios")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !studioData) {
    notFound()
  }

  return studioData as CoreStudioData
}