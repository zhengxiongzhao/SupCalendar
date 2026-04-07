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


const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

function getBubbleSize(count: number): string {
  if (count === 0) return 'h-8 w-8'
  if (count === 1) return 'h-10 w-10'
  if (count === 2) return 'h-12 w-12'
  if (count <= 4) return 'h-14 w-14'
  return 'h-16 w-16'
}

function getBubbleBg(count: number): string {
  if (count === 0) return 'bg-muted/20 border-border/20'
  if (count === 1) return 'bg-primary/10 border-primary/20'
  if (count === 2) return 'bg-primary/20 border-primary/30'
  if (count <= 4) return 'bg-primary/30 border-primary/40'
  return 'bg-primary/40 border-primary/50'
}

export function CalendarView14() {
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
            <h1 className='text-2xl font-bold tracking-tight'>日历视图 14 · 气泡矩阵</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              日程密度可视化 - 气泡大小反映当日记录数量
            </p>
          </div>
        </div>

        {/* Month navigation */}
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
          <div className='flex flex-wrap justify-center gap-3 py-8'>
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className='h-12 w-12 animate-pulse rounded-full bg-muted/30' />
            ))}
          </div>
        ) : (
          <div className='overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm'>
            {/* Header */}
            <div className='grid grid-cols-7 gap-0 border-b border-border/30 px-4 pt-4 pb-2'>
              {WEEK_DAYS.map((day, idx) => (
                <div
                  key={day}
                  className={cn(
                    'py-1 text-center text-[10px] font-semibold tracking-wider',
                    idx === 0 || idx === 6 ? 'text-rose-500/60' : 'text-muted-foreground/50'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Bubble grid */}
            <div className='grid grid-cols-7 gap-0 p-4'>
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className='flex items-center justify-center py-2'>
                  <div className='h-6 w-6 rounded-full bg-muted/5' />
                </div>
              ))}
              {days.map((day) => {
                const dateKey = fmt(day, 'yyyy-MM-dd')
                const dayRecords = recordsByDate.get(dateKey) || []
                const count = dayRecords.length
                const isCurrentDay = isToday(day)

                return (
                  <button
                    key={dateKey}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      'flex items-center justify-center py-2 transition-transform duration-200 hover:scale-110',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
                    )}
                  >
                    <div
                      className={cn(
                        'flex flex-col items-center justify-center rounded-full border-2 transition-all duration-300',
                        getBubbleSize(count),
                        isCurrentDay ? 'border-primary bg-primary/20 ring-2 ring-primary/30' : getBubbleBg(count)
                      )}
                    >
                      <span className={cn(
                        'text-[10px] font-bold leading-none',
                        isCurrentDay ? 'text-primary' : count > 0 ? 'text-foreground/80' : 'text-muted-foreground/40'
                      )}>
                        {fmt(day, 'd')}
                      </span>
                      {count > 0 && (
                        <span className={cn(
                          'text-[7px] font-medium leading-none mt-0.5',
                          isCurrentDay ? 'text-primary/80' : 'text-muted-foreground/60'
                        )}>
                          {count}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className='flex items-center justify-center gap-4 border-t border-border/20 px-4 py-3'>
              <span className='text-[10px] text-muted-foreground/50'>日程密度:</span>
              <div className='flex items-center gap-2'>
                {[
                  { size: 'h-3 w-3', label: '0' },
                  { size: 'h-4 w-4', label: '1' },
                  { size: 'h-5 w-5', label: '2' },
                  { size: 'h-6 w-6', label: '3+' },
                ].map((item) => (
                  <div key={item.label} className='flex items-center gap-1'>
                    <div className={cn('rounded-full bg-primary/20 border border-primary/20', item.size)} />
                    <span className='text-[9px] text-muted-foreground/50'>{item.label}</span>
                  </div>
                ))}
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
