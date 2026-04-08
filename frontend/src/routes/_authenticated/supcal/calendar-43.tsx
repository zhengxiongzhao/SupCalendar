import { createFileRoute } from '@tanstack/react-router'
import { CalendarView43 } from '@/features/supcal/calendar-views/view-43'

export const Route = createFileRoute('/_authenticated/supcal/calendar-43')({
  component: CalendarView43,
})
