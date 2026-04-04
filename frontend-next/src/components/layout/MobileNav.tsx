'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { Calendar, Home, List, Plus, User } from 'lucide-react'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/calendar', label: '日历', icon: Calendar },
  { path: '/records', label: '记录', icon: List },
  { path: '/profile', label: '我的', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe md:hidden z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full touch-manipulation',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
        <div className="flex flex-col items-center justify-center w-16 h-full">
          <ThemeToggle />
          <span className="text-xs mt-1 text-muted-foreground">主题</span>
        </div>
        <Link
          href="/create"
          className="flex flex-col items-center justify-center w-16 h-full touch-manipulation"
        >
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 -mt-4">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xs mt-1 text-muted-foreground">新建</span>
        </Link>
      </div>
    </nav>
  )
}
