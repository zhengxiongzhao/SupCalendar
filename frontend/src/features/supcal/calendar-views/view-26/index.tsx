import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
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

export function CalendarView26() {
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

  const maxRecords = useMemo(() => {
    let max = 0
    recordsByDate.forEach(recs => { if (recs.length > max) max = recs.length })
    return max || 1
  }, [recordsByDate])

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 26 · 梳子视图</h1>
            <p className='mt-1 text-sm text-muted-foreground'>垂直梳齿 + 日程面板</p>
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

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          <div className='lg:col-span-2 rounded-2xl border border-border/40 bg-card shadow-sm p-4'>
            <div className='flex items-end gap-0.5 h-48'>
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`e-${i}`} className='flex-1 min-w-[8px]' />
              ))}
              {days.map((day) => {
                const dateKey = fmt(day, 'yyyy-MM-dd')
                const dayRecords = recordsByDate.get(dateKey) || []
                const isCurrentDay = isToday(day)
                const height = Math.max(8, (dayRecords.length / maxRecords) * 100)
                return (
                  <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('flex-1 min-w-[8px] rounded-t-md transition-all duration-200 relative group', isCurrentDay ? 'bg-primary/60' : dayRecords.length > 0 ? 'bg-accent/50' : 'bg-muted/20 hover:bg-accent/30')}>
                    <div className={cn('absolute bottom-0 w-full rounded-t-md transition-all', isCurrentDay ? 'bg-primary' : 'bg-accent/70')} style={{ height: `${height}%` }} />
                    <span className='absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground/50'>{fmt(day, 'd')}</span>
                  </button>
                )
              })}
            </div>
            <div className='mt-6 border-t border-border/20 pt-2' />
          </div>

          <div className='rounded-2xl border border-border/40 bg-card shadow-sm p-4'>
            <h3 className='text-sm font-semibold mb-3'>
              {selectedDate ? fmt(selectedDate, 'M月d日 EEEE', { locale: zhCN }) : '选择日期'}
            </h3>
            {selectedDate ? (
              recordsForSelectedDate.length === 0 ? (
                <p className='text-xs text-muted-foreground/50'>暂无日程</p>
              ) : (
                <div className='space-y-2'>
                  {recordsForSelectedDate.map((r) => {
                    const colors = getRecordColorClasses(r)
                    const payment = r.type === 'payment' ? (r as PaymentRecord) : null
                    return (
                      <div key={r.id} className={cn('rounded-lg p-2', colors.bg)}>
                        <div className='flex items-center gap-1.5'>
                          {payment?.direction === 'income' ? <ArrowUpRight className='h-3 w-3 text-emerald-500' /> : payment?.direction === 'expense' ? <ArrowDownLeft className='h-3 w-3 text-rose-500' /> : <Clock className='h-3 w-3 text-blue-500' />}
                          <span className='text-xs font-medium'>{r.name}</span>
                        </div>
                        {payment && (
                          <span className={cn('text-[10px] font-semibold ml-5', colors.text)}>
                            {payment.direction === 'income' ? '+' : '-'}{payment.amount}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              <p className='text-xs text-muted-foreground/40'>点击梳齿查看日程</p>
            )}
          </div>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
