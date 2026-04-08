import { createFileRoute } from '@tanstack/react-router'
import { CalendarView76 } from '@/features/supcal/calendar-views/view-76'

export const Route = createFileRoute('/_authenticated/supcal/calendar-76')({
  component: CalendarView76,
})
