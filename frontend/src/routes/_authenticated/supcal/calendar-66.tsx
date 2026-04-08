import { createFileRoute } from '@tanstack/react-router'
import { CalendarView66 } from '@/features/supcal/calendar-views/view-66'

export const Route = createFileRoute('/_authenticated/supcal/calendar-66')({
  component: CalendarView66,
})
