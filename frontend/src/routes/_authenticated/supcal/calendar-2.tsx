import { createFileRoute } from '@tanstack/react-router'
import { CalendarView2 } from '@/features/supcal/calendar-views/view-2'

export const Route = createFileRoute('/_authenticated/supcal/calendar-2')({
  component: CalendarView2,
})
