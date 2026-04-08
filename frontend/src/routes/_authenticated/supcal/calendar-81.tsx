import { createFileRoute } from '@tanstack/react-router'
import { CalendarView81 } from '@/features/supcal/calendar-views/view-81'

export const Route = createFileRoute('/_authenticated/supcal/calendar-81')({
  component: CalendarView81,
})
