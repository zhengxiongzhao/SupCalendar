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

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView37() {
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

  const cx = 150, cy = 150, maxR = 130

  return (
    <>
      <Header><Search /><div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div></Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 37 · 万花筒</h1>
            <p className='mt-1 text-sm text-muted-foreground'>对称万花筒圆形日历</p>
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
              <circle cx={cx} cy={cy} r={maxR} fill='none' stroke='hsl(var(--border))' strokeWidth='1' />
              <circle cx={cx} cy={cy} r={maxR * 0.6} fill='none' stroke='hsl(var(--border))' strokeWidth='0.5' />
              <circle cx={cx} cy={cy} r={maxR * 0.3} fill='none' stroke='hsl(var(--border))' strokeWidth='0.5' />
              {days.map((day, idx) => {
                const angle = ((firstDayOffset + idx) / (firstDayOffset + days.length)) * 2 * Math.PI - Math.PI / 2
                const dateKey = fmt(day, 'yyyy-MM-dd')
                const recs = recordsByDate.get(dateKey) || []
                const isCurrentDay = isToday(day)
                const r = recs.length > 0 ? maxR * 0.75 : maxR * 0.5
                const dx = cx + r * Math.cos(angle)
                const dy = cy + r * Math.sin(angle)
                const dotR = Math.max(3, recs.length * 2)
                return (
                  <g key={dateKey}>
                    <line x1={cx} y1={cy} x2={dx} y2={dy} stroke='hsl(var(--border))' strokeWidth='0.3' />
                    <circle cx={dx} cy={dy} r={dotR} fill={isCurrentDay ? 'hsl(var(--primary))' : recs.length > 0 ? 'hsl(var(--accent))' : 'hsl(var(--muted))'} className='cursor-pointer' onClick={() => handleDayClick(day)} />
                    <text x={dx} y={dy - dotR - 3} textAnchor='middle' className='fill-foreground/40 text-[6px]'>{fmt(day, 'd')}</text>
                  </g>
                )
              })}
              <text x={cx} y={cy} textAnchor='middle' dominantBaseline='central' className='fill-foreground/70 text-[12px] font-bold'>{fmt(currentDate, 'M月')}</text>
            </svg>
          </div>

          <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
            <div className='grid grid-cols-7 gap-1 mb-3'>
              {WEEK_DAYS.map((d, i) => (
                <div key={d} className={cn('text-center text-[9px] font-semibold', i === 0 || i === 6 ? 'text-rose-500/60' : 'text-muted-foreground/50')}>{d}</div>
              ))}
              {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} className='h-7' />)}
              {days.map((day) => {
                const dateKey = fmt(day, 'yyyy-MM-dd')
                const recs = recordsByDate.get(dateKey) || []
                const isCurrentDay = isToday(day)
                return (
                  <button key={dateKey} onClick={() => handleDayClick(day)} className={cn('h-7 rounded text-[10px] transition-colors', isCurrentDay ? 'bg-primary text-primary-foreground font-bold' : recs.length > 0 ? 'bg-accent/30' : 'hover:bg-accent/20')}>
                    {fmt(day, 'd')}
                  </button>
                )
              })}
            </div>
            <div className='space-y-1 max-h-[200px] overflow-y-auto'>
              {selectedDate ? recordsForSelectedDate.map((r) => {
                const colors = getRecordColorClasses(r)
                const payment = r.type === 'payment' ? (r as PaymentRecord) : null
                return (
                  <div key={r.id} className={cn('flex items-center gap-1.5 rounded px-2 py-1 text-[10px]', colors.bg)}>
                    {payment?.direction === 'income' ? <ArrowUpRight className='h-3 w-3 text-emerald-500' /> : payment?.direction === 'expense' ? <ArrowDownLeft className='h-3 w-3 text-rose-500' /> : <Clock className='h-3 w-3 text-blue-500' />}
                    <span className={cn('truncate', colors.text)}>{r.name}</span>
                  </div>
                )
              }) : <p className='text-[10px] text-muted-foreground/40'>点击日历查看记录</p>}
            </div>
          </div>
        </div>
      </Main>
      <DayDetailSheet date={selectedDate} records={recordsForSelectedDate} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
