import { createFileRoute } from '@tanstack/react-router'
import { CalendarView14 } from '@/features/supcal/calendar-views/view-14'

export const Route = createFileRoute('/_authenticated/supcal/calendar-14')({
  component: CalendarView14,
})
