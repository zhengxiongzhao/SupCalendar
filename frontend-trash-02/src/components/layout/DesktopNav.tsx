'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { Calendar, Home, List, Plus, User } from 'lucide-react'

const navItems = [
  { path: '/', labelKey: 'dashboard' as const, icon: Home },
  { path: '/calendar', labelKey: 'calendar' as const, icon: Calendar },
  { path: '/records', labelKey: 'records' as const, icon: List },
  { path: '/profile', labelKey: 'profile' as const, icon: User },
]

export function DesktopNav() {
  const pathname = usePathname()
  const t = useTranslations('nav')

  return (
    <aside className="hidden md:flex fixed left-3 top-3 bottom-3 w-64 bg-card rounded-2xl shadow-lg ring-1 ring-border/50 flex-col z-40 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">SupCalendar</h1>
            <p className="text-xs text-muted-foreground">财务提醒日历</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 flex items-center justify-between border-t border-border/50">
        <ThemeToggle />
        <Link
          href="/create"
          className="flex-1 ml-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建记录
        </Link>
      </div>
    </aside>
  )
}
