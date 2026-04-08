import { createFileRoute } from '@tanstack/react-router'
import { CalendarView125 } from '@/features/supcal/calendar-views/view-125'

export const Route = createFileRoute('/_authenticated/supcal/calendar-125')({
  component: CalendarView125,
})
