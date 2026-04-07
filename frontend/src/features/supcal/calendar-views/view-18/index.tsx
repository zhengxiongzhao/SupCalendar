import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, FolderOpen, Tag, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { addMonths, subMonths, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useRecords } from '../../api/records'
import { buildRecordsByDateMap, getRecordDotColor, format as fmt } from '../shared'
import { DayDetailSheet } from '../../calendar/components/day-detail-sheet'
import { formatAmount } from '../../lib/format'
import type { CalendarRecord, PaymentRecord } from '../../types'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView18() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const recordsQuery = useRecords()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const recordsByDate = useMemo(
    () => buildRecordsByDateMap(recordsQuery.data, year, month),
    [recordsQuery.data, year, month]
  )

  const { days, firstDayOffset } = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const offset = getDay(monthStart)
    return { days: daysInMonth, firstDayOffset: offset }
  }, [currentDate])

  const categoryTree = useMemo(() => {
    const tree = new Map<string, CalendarRecord[]>()
    if (!recordsQuery.data) return tree
    for (const record of recordsQuery.data) {
      const category = record.type === 'payment'
        ? (record as PaymentRecord).category || '未分类'
        : '提醒'
      const existing = tree.get(category) || []
      existing.push(record)
      tree.set(category, existing)
    }
    return tree
  }, [recordsQuery.data])

  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    const dayKey = fmt(selectedDate, 'yyyy-MM-dd')
    return recordsByDate.get(dayKey) || []
  }, [selectedDate, recordsByDate])

  function handleDayClick(date: Date) {
    setSelectedDate(date)
    setSheetOpen(true)
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 18 · 树形概览</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              分类树形结构 + 紧凑月历导航
            </p>
          </div>
        </div>

        <div className='mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'>
              <CalendarDays className='h-4 w-4 text-primary' />
            </div>
            <h2 className='text-lg font-semibold tracking-tight'>
              {fmt(currentDate, 'yyyy年M月', { locale: zhCN })}
            </h2>
          </div>
          <div className='flex items-center gap-1.5'>
            <Button variant='ghost' size='sm' className='h-8 text-xs font-medium' onClick={() => setCurrentDate(new Date())}>
              今天
            </Button>
            <div className='mx-1 h-4 w-px bg-border' />
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate((d) => subMonths(d, 1))}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-lg' onClick={() => setCurrentDate((d) => addMonths(d, 1))}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <div className='grid grid-cols-7 gap-1'>
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className='aspect-square animate-pulse rounded-lg bg-muted/30' />
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-5'>
            <div className='lg:col-span-2'>
              <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
                <div className='grid grid-cols-7 gap-px bg-muted/30 px-2 pt-3 pb-1'>
                  {WEEK_DAYS.map((day, idx) => (
                    <div
                      key={day}
                      className={cn(
                        'py-1.5 text-center text-[10px] font-semibold tracking-wider',
                        idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/60'
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-1 p-2'>
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className='aspect-square rounded-lg bg-muted/5' />
                  ))}
                  {days.map((day) => {
                    const dateKey = fmt(day, 'yyyy-MM-dd')
                    const dayRecords = recordsByDate.get(dateKey) || []
                    const isCurrentDay = isToday(day)
                    return (
                      <button
                        key={dateKey}
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          'group relative flex aspect-square flex-col items-center justify-center rounded-lg transition-all duration-200',
                          isCurrentDay && 'bg-primary/10 ring-2 ring-primary/30',
                          !isCurrentDay && dayRecords.length > 0 && 'bg-accent/30',
                          !isCurrentDay && dayRecords.length === 0 && 'hover:bg-accent/20',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                      >
                        <span className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium',
                          isCurrentDay ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-foreground/70'
                        )}>
                          {fmt(day, 'd')}
                        </span>
                        {dayRecords.length > 0 && (
                          <div className='mt-0.5 flex gap-0.5'>
                            {dayRecords.slice(0, 3).map((record, idx) => (
                              <span key={`${record.id}-${idx}`} className={cn('h-1 w-1 rounded-full', getRecordDotColor(record))} />
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className='lg:col-span-3'>
              <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
                <div className='border-b border-border/30 px-4 py-3'>
                  <h3 className='text-sm font-semibold'>分类概览</h3>
                  <p className='text-[10px] text-muted-foreground'>{categoryTree.size} 个分类</p>
                </div>

                {categoryTree.size === 0 ? (
                  <div className='flex h-40 items-center justify-center text-sm text-muted-foreground/50'>
                    暂无记录
                  </div>
                ) : (
                  <div className='max-h-[500px] divide-y divide-border/20 overflow-y-auto'>
                    {Array.from(categoryTree.entries()).map(([category, records]) => (
                      <div key={category} className='px-4 py-3'>
                        <div className='flex items-center gap-2 mb-2'>
                          <FolderOpen className='h-4 w-4 text-primary/60' />
                          <span className='text-sm font-semibold text-foreground/80'>{category}</span>
                          <Badge variant='secondary' className='text-[9px]'>
                            {records.length} 条
                          </Badge>
                        </div>
                        <div className='ml-6 space-y-1'>
                          {records.slice(0, 5).map((record) => {
                            const isPayment = record.type === 'payment'
                            const payment = isPayment ? (record as PaymentRecord) : null
                            return (
                              <div key={record.id} className='flex items-center gap-2 py-1'>
                                <Tag className='h-3 w-3 text-muted-foreground/40' />
                                {payment?.direction === 'income' ? (
                                  <ArrowUpRight className='h-3 w-3 text-emerald-500' />
                                ) : payment?.direction === 'expense' ? (
                                  <ArrowDownLeft className='h-3 w-3 text-rose-500' />
                                ) : (
                                  <Clock className='h-3 w-3 text-blue-500' />
                                )}
                                <span className='text-xs text-foreground/70 truncate flex-1'>{record.name}</span>
                                {payment && (
                                  <span className={cn(
                                    'text-[10px] font-semibold',
                                    payment.direction === 'income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                                  )}>
                                    {payment.direction === 'income' ? '+' : '-'}{formatAmount(payment.amount, payment.currency)}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                          {records.length > 5 && (
                            <span className='text-[10px] text-muted-foreground/50'>还有 {records.length - 5} 条...</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Main>

      <DayDetailSheet
        date={selectedDate}
        records={recordsForSelectedDate}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
