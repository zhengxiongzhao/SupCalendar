import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  title: string
  url?: string
  icon?: LucideIcon | React.ComponentType<{ className?: string }>
  isActive?: boolean
  items?: NavItem[]
  badge?: string
  disabled?: boolean
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export type UserInfo = {
  name: string
  email: string
  avatar: string
}

export type SidebarData = {
  user: UserInfo
  navGroups: NavGroup[]
}
