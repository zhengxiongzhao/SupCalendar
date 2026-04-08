import { createFileRoute } from '@tanstack/react-router'
import { CalendarView104 } from '@/features/supcal/calendar-views/view-104'

export const Route = createFileRoute('/_authenticated/supcal/calendar-104')({
  component: CalendarView104,
})
