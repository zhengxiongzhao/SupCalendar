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
import { buildRecordsByDateMap, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import type { PaymentRecord } from '../../types'

export function CalendarView36() {
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

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 36 · 条形码日历</h1>
            <p className='mt-1 text-sm text-muted-foreground'>条形码风格月历扫描</p>
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

        <div className='rounded-2xl border border-border/40 bg-card shadow-sm p-4 overflow-x-auto'>
          <div className='flex items-end gap-[2px] min-w-[600px]'>
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`e-${i}`} className='w-[3px] bg-muted/10 rounded-t-sm' style={{ height: '4px' }} />
            ))}
            {days.map((day) => {
              const dateKey = fmt(day, 'yyyy-MM-dd')
              const dayRecords = recordsByDate.get(dateKey) || []
              const isCurrentDay = isToday(day)
              const incomeCount = dayRecords.filter(r => r.type === 'payment' && (r as PaymentRecord).direction === 'income').length
              const expenseCount = dayRecords.filter(r => r.type === 'payment' && (r as PaymentRecord).direction === 'expense').length
              const reminderCount = dayRecords.filter(r => r.type !== 'payment').length
              return (
                <button key={dateKey} onClick={() => handleDayClick(day)} className='flex flex-col items-center gap-[1px] group relative'>
                  <div className='flex items-end gap-[1px]'>
                    {incomeCount > 0 && <div className='w-[2px] rounded-t-sm bg-emerald-500 transition-all group-hover:opacity-80' style={{ height: `${incomeCount * 15 + 8}px` }} />}
                    {expenseCount > 0 && <div className='w-[2px] rounded-t-sm bg-rose-500 transition-all group-hover:opacity-80' style={{ height: `${expenseCount * 15 + 8}px` }} />}
                    {reminderCount > 0 && <div className='w-[2px] rounded-t-sm bg-blue-500 transition-all group-hover:opacity-80' style={{ height: `${reminderCount * 15 + 8}px` }} />}
                    {dayRecords.length === 0 && <div className='w-[2px] rounded-t-sm bg-muted/20' style={{ height: '4px' }} />}
                  </div>
                  <span className={cn('text-[7px] mt-1', isCurrentDay ? 'text-primary font-bold' : 'text-muted-foreground/40')}>{fmt(day, 'd')}</span>
                  {isCurrentDay && <div className='absolute -top-1 left-1/2 -translate-x-1/2 h-[2px] w-3 bg-primary rounded-full' />}
                </button>
              )
            })}
          </div>
        </div>

        <div className='mt-3 flex items-center gap-4 text-[10px] text-muted-foreground/60'>
          <span className='flex items-center gap-1'><span className='h-2 w-2 rounded-sm bg-emerald-500' />收入</span>
          <span className='flex items-center gap-1'><span className='h-2 w-2 rounded-sm bg-rose-500' />支出</span>
          <span className='flex items-center gap-1'><span className='h-2 w-2 rounded-sm bg-blue-500' />提醒</span>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
