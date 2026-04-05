import { LayoutDashboard, CalendarDays, Plus, List, User } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

const navItems = [
  { label: '概览', href: '/supcal', icon: LayoutDashboard },
  { label: '日历', href: '/supcal/calendar', icon: CalendarDays },
  { label: '记录', href: '/supcal/records', icon: List },
  { label: '我的', href: '/supcal/profile', icon: User },
]

export function MobileNav() {
  const location = useLocation()
  const pathname = location.pathname

  if (!pathname.startsWith('/supcal')) return null

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden'>
      <div className='flex items-center justify-around px-2 py-1'>
        {navItems.slice(0, 2).map((tab) => {
          const Icon = tab.icon
          const isActive =
            tab.href === '/supcal'
              ? pathname === '/supcal'
              : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className='h-5 w-5' />
              <span className='text-[10px] leading-tight'>{tab.label}</span>
            </Link>
          )
        })}

        <Link
          to='/supcal/create'
          className='flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg -mt-4'
        >
          <Plus className='h-6 w-6' />
        </Link>

        {navItems.slice(2).map((tab) => {
          const Icon = tab.icon
          const isActive = pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className='h-5 w-5' />
              <span className='text-[10px] leading-tight'>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
