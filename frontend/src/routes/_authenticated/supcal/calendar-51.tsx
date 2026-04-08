import { createFileRoute } from '@tanstack/react-router'
import { CalendarView51 } from '@/features/supcal/calendar-views/view-51'

export const Route = createFileRoute('/_authenticated/supcal/calendar-51')({
  component: CalendarView51,
})
