import { createFileRoute } from '@tanstack/react-router'
import { CalendarView97 } from '@/features/supcal/calendar-views/view-97'

export const Route = createFileRoute('/_authenticated/supcal/calendar-97')({
  component: CalendarView97,
})
