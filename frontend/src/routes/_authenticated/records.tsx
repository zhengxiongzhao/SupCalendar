import { createFileRoute } from '@tanstack/react-router'
import { RecordsPage } from '@/features/records'

export const Route = createFileRoute('/_authenticated/records')({
  component: RecordsPage,
})
