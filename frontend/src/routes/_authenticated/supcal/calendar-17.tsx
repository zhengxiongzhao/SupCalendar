import { createFileRoute } from '@tanstack/react-router'
import { CalendarView17 } from '@/features/supcal/calendar-views/view-17'

export const Route = createFileRoute('/_authenticated/supcal/calendar-17')({
  component: CalendarView17,
})
