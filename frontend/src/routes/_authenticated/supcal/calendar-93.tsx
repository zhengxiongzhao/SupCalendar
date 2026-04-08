import { createFileRoute } from '@tanstack/react-router'
import { CalendarView93 } from '@/features/supcal/calendar-views/view-93'

export const Route = createFileRoute('/_authenticated/supcal/calendar-93')({
  component: CalendarView93,
})
