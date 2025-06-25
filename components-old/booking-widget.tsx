"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Studio {
  id: number
  name: string
  location: string
  hourly_rate: number
}

interface BookingWidgetProps {
  studio: Studio
}

export function BookingWidget({ studio }: BookingWidgetProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [date, setDate] = useState<Date>()
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).single()

    if (data) {
      setProfile(data)
    }
  }

  const calculateHours = () => {
    if (!startTime || !endTime) return 0
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    const diffMs = end.getTime() - start.getTime()
    return Math.max(0, diffMs / (1000 * 60 * 60))
  }

  const calculateTotal = () => {
    const hours = calculateHours()
    return hours * studio.hourly_rate
  }

  const handleBooking = async () => {
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a booking.",
        variant: "destructive",
      })
      return
    }

    if (!date || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your booking.",
        variant: "destructive",
      })
      return
    }

    if (startTime >= endTime) {
      toast({
        title: "Invalid Time",
        description: "End time must be after start time.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const startDateTime = new Date(date)
    const [startHour, startMinute] = startTime.split(":")
    startDateTime.setHours(Number.parseInt(startHour), Number.parseInt(startMinute))

    const endDateTime = new Date(date)
    const [endHour, endMinute] = endTime.split(":")
    endDateTime.setHours(Number.parseInt(endHour), Number.parseInt(endMinute))

    const { data, error } = await supabase.from("bookings").insert({
      creator_id: profile.id,
      studio_id: studio.id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      total_paid: calculateTotal(),
      status: "pending",
    })

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Booking Requested",
        description: "Your booking request has been sent to the studio owner.",
      })
      // Reset form
      setDate(undefined)
      setStartTime("")
      setEndTime("")
    }

    setLoading(false)
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Book This Studio</span>
          <div className="text-right">
            <div className="text-2xl font-bold">${studio.hourly_rate}</div>
            <div className="text-sm text-gray-400">per hour</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-black border-gray-700">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-time">End Time</Label>
            <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        {/* Duration and Total */}
        {startTime && endTime && (
          <div className="space-y-2 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Duration:</span>
              <span>{calculateHours()} hours</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        )}

        {/* Book Button */}
        <Button onClick={handleBooking} className="w-full" disabled={loading || !date || !startTime || !endTime}>
          {loading ? "Processing..." : "Request To Book"}
        </Button>

        {!user && <p className="text-sm text-gray-400 text-center">Sign In To Make A Booking</p>}
      </CardContent>
    </Card>
  )
}
