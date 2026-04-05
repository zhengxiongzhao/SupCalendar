import { createFileRoute } from '@tanstack/react-router'
import { SupcalDashboard } from '@/features/supcal/dashboard'

export const Route = createFileRoute('/_authenticated/supcal/')({
  component: SupcalDashboard,
})
