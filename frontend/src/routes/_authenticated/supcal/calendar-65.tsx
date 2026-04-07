import { createFileRoute } from '@tanstack/react-router'
import { CalendarView65 } from '@/features/supcal/calendar-views/view-65'

export const Route = createFileRoute('/_authenticated/supcal/calendar-65')({
  component: CalendarView65,
})
