"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import { type DateRange } from "react-day-picker"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: DateRange | undefined
  onDateChange?: (date: DateRange | undefined) => void
}

export default function DateRangePicker({
  className,
  date: controlledDate,
  onDateChange,
}: DateRangePickerProps) {
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>()
  
  // Use controlled date if provided, otherwise use internal state
  const date = controlledDate !== undefined ? controlledDate : internalDate
  const setDate = onDateChange || setInternalDate

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick A Date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from || new Date()}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
