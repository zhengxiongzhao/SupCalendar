import { createFileRoute } from '@tanstack/react-router'
import { SupcalCalendar } from '@/features/supcal/calendar'

export const Route = createFileRoute('/_authenticated/supcal/calendar')({
  component: SupcalCalendar,
})
