import { createFileRoute } from '@tanstack/react-router'
import { CalendarView70 } from '@/features/supcal/calendar-views/view-70'

export const Route = createFileRoute('/_authenticated/supcal/calendar-70')({
  component: CalendarView70,
})
