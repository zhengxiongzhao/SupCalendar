import { createFileRoute } from '@tanstack/react-router'
import { CalendarView21 } from '@/features/supcal/calendar-views/view-21'

export const Route = createFileRoute('/_authenticated/supcal/calendar-21')({
  component: CalendarView21,
})
