import { createFileRoute } from '@tanstack/react-router'
import { CalendarView53 } from '@/features/supcal/calendar-views/view-53'

export const Route = createFileRoute('/_authenticated/supcal/calendar-53')({
  component: CalendarView53,
})
