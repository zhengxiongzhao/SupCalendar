import { createFileRoute } from '@tanstack/react-router'
import { CalendarView7 } from '@/features/supcal/calendar-views/view-7'

export const Route = createFileRoute('/_authenticated/supcal/calendar-7')({
  component: CalendarView7,
})
