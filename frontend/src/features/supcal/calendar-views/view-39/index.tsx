import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
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

export function CalendarView39() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const recordsQuery = useRecords()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const recordsByDate = useMemo(() => buildRecordsByDateMap(recordsQuery.data, year, month), [recordsQuery.data, year, month])
  const { days } = useMemo(() => {
    const ms = startOfMonth(currentDate)
    const me = endOfMonth(currentDate)
    return { days: eachDayOfInterval({ start: ms, end: me }) }
  }, [currentDate])
  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return recordsByDate.get(fmt(selectedDate, 'yyyy-MM-dd')) || []
  }, [selectedDate, recordsByDate])

  function handleDayClick(date: Date) { setSelectedDate(date); setSheetOpen(true) }

  const spiralPoints = useMemo(() => {
    const pts: { day: Date; x: number; y: number; records: typeof recordsByDate extends Map<string, infer V> ? V : never }[] = []
    const totalDays = days.length
    const centerX = 150, centerY = 150
    const maxRadius = 130
    for (let i = 0; i < totalDays; i++) {
      const t = i / totalDays
      const angle = t * 4 * Math.PI
      const r = 20 + t * (maxRadius - 20)
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      const dateKey = fmt(days[i], 'yyyy-MM-dd')
      const recs = recordsByDate.get(dateKey) || []
      pts.push({ day: days[i], x, y, records: recs })
    }
    return pts
  }, [days, recordsByDate])

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 39 · 螺旋日程</h1>
            <p className='mt-1 text-sm text-muted-foreground'>阿基米德螺旋线日历</p>
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
          <div className='flex items-center justify-center rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
            <svg viewBox='0 0 300 300' className='w-full max-w-[300px]'>
              <path d={spiralPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill='none' stroke='hsl(var(--border))' strokeWidth='1' />
              {spiralPoints.map((pt) => {
                const isCurrentDay = isToday(pt.day)
                const dotR = pt.records.length > 0 ? 4 + pt.records.length * 1.5 : 3
                return (
                  <g key={fmt(pt.day, 'yyyy-MM-dd')}>
                    <circle cx={pt.x} cy={pt.y} r={dotR} fill={isCurrentDay ? 'hsl(var(--primary))' : pt.records.length > 0 ? 'hsl(var(--accent))' : 'hsl(var(--muted))'} className='cursor-pointer' onClick={() => handleDayClick(pt.day)} />
                    {(pt.records.length > 0 || isCurrentDay) && (
                      <text x={pt.x} y={pt.y + dotR + 8} textAnchor='middle' className='fill-foreground/50 text-[6px]'>{fmt(pt.day, 'd')}</text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>

          <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
            <h3 className='text-sm font-semibold mb-3'>
              {selectedDate ? fmt(selectedDate, 'M月d日日程', { locale: zhCN }) : '螺旋日程详情'}
            </h3>
            {selectedDate && recordsForSelectedDate.length > 0 ? (
              <div className='space-y-2'>
                {recordsForSelectedDate.map((r) => {
                  const colors = getRecordColorClasses(r)
                  const payment = r.type === 'payment' ? (r as PaymentRecord) : null
                  return (
                    <div key={r.id} className={cn('rounded-lg p-2.5', colors.bg)}>
                      <div className='flex items-center gap-1.5'>
                        {payment?.direction === 'income' ? <ArrowUpRight className='h-3.5 w-3.5 text-emerald-500' /> : payment?.direction === 'expense' ? <ArrowDownLeft className='h-3.5 w-3.5 text-rose-500' /> : <Clock className='h-3.5 w-3.5 text-blue-500' />}
                        <span className='text-xs font-medium'>{r.name}</span>
                      </div>
                      {payment && <span className={cn('text-[10px] font-semibold ml-5 mt-0.5 block', colors.text)}>{payment.direction === 'income' ? '+' : '-'}{payment.amount} {payment.currency}</span>}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className='text-xs text-muted-foreground/40'>点击螺旋上的节点查看日程</p>
            )}
          </div>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
