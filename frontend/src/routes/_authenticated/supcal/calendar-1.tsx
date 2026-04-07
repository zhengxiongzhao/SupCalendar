import { createFileRoute } from '@tanstack/react-router'
import { CalendarView1 } from '@/features/supcal/calendar-views/view-1'

export const Route = createFileRoute('/_authenticated/supcal/calendar-1')({
  component: CalendarView1,
})
