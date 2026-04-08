import { createFileRoute } from '@tanstack/react-router'
import { CalendarView84 } from '@/features/supcal/calendar-views/view-84'

export const Route = createFileRoute('/_authenticated/supcal/calendar-84')({
  component: CalendarView84,
})
