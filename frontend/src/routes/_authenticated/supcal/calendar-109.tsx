import { createFileRoute } from '@tanstack/react-router'
import { CalendarView109 } from '@/features/supcal/calendar-views/view-109'

export const Route = createFileRoute('/_authenticated/supcal/calendar-109')({
  component: CalendarView109,
})
