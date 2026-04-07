import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useRecords } from '../../api/records'
import { buildRecordsByDateMap, getRecordColorClasses, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import type { PaymentRecord } from '../../types'

export function CalendarView22() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const recordsQuery = useRecords()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const recordsByDate = useMemo(() => buildRecordsByDateMap(recordsQuery.data, year, month), [recordsQuery.data, year, month])
  const { days, firstDayOffset } = useMemo(() => {
    const ms = startOfMonth(currentDate)
    const me = endOfMonth(currentDate)
    return { days: eachDayOfInterval({ start: ms, end: me }), firstDayOffset: getDay(ms) }
  }, [currentDate])
  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || []
  }, [selectedDate, recordsByDate])

  function handleDayClick(date: Date) { setSelectedDate(date); setSheetOpen(true) }

  const allDays = useMemo(() => {
    const result: (Date | null)[] = []
    for (let i = 0; i < firstDayOffset; i++) result.push(null)
    days.forEach(d => result.push(d))
    return result
  }, [firstDayOffset, days])

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 22 · 瀑布流</h1>
            <p className='mt-1 text-sm text-muted-foreground'>多列瀑布卡片布局</p>
          </div>
        </div>
        <div className='mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'><CalendarDays className='h-4 w-4 text-primary' /></div>
            <h2 className='text-lg font-semibold tracking-tight'>{fmt(currentDate, 'yyyy年M月', { locale: zhCN })}</h2>
          </div>
          <div className='flex items-center gap-1.5'>
            <Button variant='ghost' size='sm' className='h-8 text-xs font-medium' onClick={() => setCurrentDate(new Date())}>今天</Button>
            <div className='mx-1 h-4 w-px bg-border' />
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate(d => subMonths(d, 1))}><ChevronLeft className='h-4 w-4' /></Button>
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate(d => addMonths(d, 1))}><ChevronRight className='h-4 w-4' /></Button>
          </div>
        </div>

        <div className='columns-3 gap-3 space-y-3'>
          {allDays.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} className='break-inside-avoid rounded-xl bg-muted/5 h-12' />
            const dateKey = fmt(day, 'yyyy-MM-dd')
            const dayRecords = recordsByDate.get(dateKey) || []
            const isCurrentDay = isToday(day)
            const cardHeight = dayRecords.length === 0 ? 'h-16' : dayRecords.length <= 2 ? 'h-28' : dayRecords.length <= 4 ? 'h-40' : 'h-52'
            return (
              <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('break-inside-avoid w-full rounded-xl border transition-all duration-200 p-3 text-left', cardHeight, isCurrentDay ? 'border-primary/40 bg-primary/5' : 'border-border/30 bg-card hover:border-border/60', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}>
                <div className='flex items-center justify-between mb-1'>
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium', isCurrentDay ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground/60')}>{fmt(day, 'd')}</span>
                  <span className='text-[9px] text-muted-foreground/50'>{fmt(day, 'EEE', { locale: zhCN })}</span>
                </div>
                {dayRecords.length > 0 && (
                  <div className='mt-1 space-y-1'>
                    {dayRecords.slice(0, 4).map((r) => {
                      const colors = getRecordColorClasses(r)
                      const payment = r.type === 'payment' ? (r as PaymentRecord) : null
                      return (
                        <div key={r.id} className={cn('rounded px-1.5 py-0.5 text-[9px] truncate', colors.bg, colors.text)}>
                          {r.name}
                          {payment && <span className='ml-1 font-semibold'>{payment.direction === 'income' ? '+' : '-'}</span>}
                        </div>
                      )
                    })}
                    {dayRecords.length > 4 && <span className='text-[8px] text-muted-foreground/40'>+{dayRecords.length - 4}</span>}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
