import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useRecords } from '@/api/records'
import { MonthCalendar } from './components/month-calendar'
import { DayDetail } from './components/day-detail'

export function CalendarPage() {
  const { data: records = [], isLoading } = useRecords()
  const [selectedDate, setSelectedDate] = useState(new Date())

  const selectedDateRecords = useMemo(() => {
    const dateStr = selectedDate.toDateString()
    return records.filter((record) => {
      const recordDateStr =
        record.type === 'simple'
          ? new Date(record.time).toDateString()
          : new Date(record.start_time).toDateString()
      return recordDateStr === dateStr
    })
  }, [records, selectedDate])

  return (
    <>
      <Header>
        <h1 className='text-lg font-semibold'>日历</h1>
      </Header>
      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>日历视图</h1>
            <p className='text-sm text-muted-foreground'>
              查看和管理你的日历记录
            </p>
          </div>
          <Link to='/create'>
            <Button>
              <Plus className='mr-2 size-4' />
              新建记录
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-20'>
            <p className='text-muted-foreground'>加载中...</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr,300px]'>
            <MonthCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              records={records}
            />
            <DayDetail date={selectedDate} records={selectedDateRecords} />
          </div>
        )}
      </Main>
    </>
  )
}
