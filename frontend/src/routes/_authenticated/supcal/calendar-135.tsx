import { createFileRoute } from '@tanstack/react-router'
import { CalendarView135 } from '@/features/supcal/calendar-views/view-135'

export const Route = createFileRoute('/_authenticated/supcal/calendar-135')({
  component: CalendarView135,
})
