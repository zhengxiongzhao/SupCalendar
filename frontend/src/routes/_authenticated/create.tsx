import { createFileRoute } from '@tanstack/react-router'
import { CreatePage } from '@/features/create'

export const Route = createFileRoute('/_authenticated/create')({
  component: CreatePage,
})
