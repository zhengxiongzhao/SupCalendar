import { createFileRoute } from '@tanstack/react-router'
import { SupcalProfile } from '@/features/supcal/profile'

export const Route = createFileRoute('/_authenticated/supcal/profile')({
  component: SupcalProfile,
})
