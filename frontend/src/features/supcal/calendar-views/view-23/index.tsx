import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval, endOfWeek, eachWeekOfInterval } from 'date-fns'
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
import type { CalendarRecord, PaymentRecord } from '../../types'

export function CalendarView23() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const recordsQuery = useRecords()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const recordsByDate = useMemo(() => buildRecordsByDateMap(recordsQuery.data, year, month), [recordsQuery.data, year, month])
  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || []
  }, [selectedDate, recordsByDate])

  const weeks = useMemo(() => {
    const ms = startOfMonth(currentDate)
    const me = endOfMonth(currentDate)
    return eachWeekOfInterval({ start: ms, end: me }, { weekStartsOn: 0 })
  }, [currentDate])

  const weekData = useMemo(() => {
    return weeks.map((weekStart) => {
      const wkEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: wkEnd })
      const weekRecords: CalendarRecord[] = []
      for (const d of daysInWeek) {
        const key = fmt(d, 'yyyy-MM-dd')
        const recs = recordsByDate.get(key) || []
        weekRecords.push(...recs)
      }
      return { weekStart, days: daysInWeek, records: weekRecords }
    })
  }, [weeks, recordsByDate])

  function handleDayClick(date: Date) { setSelectedDate(date); setSheetOpen(true) }

  const cx = 160, cy = 160, baseR = 40
  const ringGap = 30

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 23 · 轨道视图</h1>
            <p className='mt-1 text-sm text-muted-foreground'>同心圆轨道 + 周次环</p>
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

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <div className='flex items-center justify-center rounded-2xl border border-border/40 bg-card p-6 shadow-sm'>
            <svg viewBox='0 0 320 320' className='w-full max-w-[320px]'>
              {weekData.map((_, idx) => (
                <circle key={idx} cx={cx} cy={cy} r={baseR + idx * ringGap} fill='none' stroke='currentColor' className='text-border/30' strokeWidth='1.5' />
              ))}
              <text x={cx} y={cy} textAnchor='middle' dominantBaseline='central' className='fill-foreground/80 text-[11px] font-bold'>
                {fmt(currentDate, 'M月')}
              </text>
              {weekData.map((week, wIdx) => {
                const r = baseR + wIdx * ringGap
                return week.days.map((day, dIdx) => {
                  const angle = (dIdx / 7) * 2 * Math.PI - Math.PI / 2
                  const dx = cx + r * Math.cos(angle)
                  const dy = cy + r * Math.sin(angle)
                  const dateKey = fmt(day, 'yyyy-MM-dd')
                  const recs = recordsByDate.get(dateKey) || []
                  const isCurrent = isToday(day)
                  const inMonth = day.getMonth() === month
                  const dotR = recs.length > 0 ? 5 + recs.length * 1.5 : 3
                  return (
                    <g key={`${wIdx}-${dIdx}`}>
                      <circle cx={dx} cy={dy} r={dotR} fill={isCurrent ? 'hsl(var(--primary))' : recs.length > 0 ? 'hsl(var(--accent))' : 'hsl(var(--muted))'} opacity={inMonth ? 1 : 0.3} className='cursor-pointer' onClick={() => handleDayClick(day)} />
                      {recs.length > 0 && inMonth && (
                        <text x={dx} y={dy + 12} textAnchor='middle' className='fill-foreground/50 text-[7px]'>{fmt(day, 'd')}</text>
                      )}
                    </g>
                  )
                })
              })}
            </svg>
          </div>
          <div className='space-y-2'>
            {weekData.map((week, wIdx) => (
              <div key={wIdx} className='rounded-xl border border-border/30 bg-card p-3 shadow-sm'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-xs font-semibold text-muted-foreground'>第 {wIdx + 1} 周 · {fmt(week.weekStart, 'M/d')}</span>
                  <span className='text-[10px] text-muted-foreground/50'>{week.records.length} 条</span>
                </div>
                <div className='flex flex-wrap gap-1'>
                  {week.days.filter(d => d.getMonth() === month).map((day) => {
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const recs = recordsByDate.get(dateKey) || []
                    return (
                      <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-medium transition-colors', isToday(day) ? 'bg-primary text-primary-foreground' : recs.length > 0 ? 'bg-accent/40 text-foreground/70' : 'text-muted-foreground/40 hover:bg-accent/20')}>
                        {fmt(day, 'd')}
                      </button>
                    )
                  })}
                </div>
                {week.records.length > 0 && (
                  <div className='mt-2 space-y-1'>
                    {week.records.slice(0, 3).map((r) => {
                      const colors = getRecordColorClasses(r)
                      const payment = r.type === 'payment' ? (r as PaymentRecord) : null
                      return (
                        <div key={r.id} className='flex items-center gap-1.5 text-[10px]'>
                          {payment?.direction === 'income' ? <ArrowUpRight className='h-3 w-3 text-emerald-500' /> : payment?.direction === 'expense' ? <ArrowDownLeft className='h-3 w-3 text-rose-500' /> : <Clock className='h-3 w-3 text-blue-500' />}
                          <span className={cn('truncate', colors.text)}>{r.name}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
