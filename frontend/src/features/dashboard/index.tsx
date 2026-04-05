import { Calendar, Plus, Loader2, AlertCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useSummary, useTopPayments, useUpcomingSimples } from '@/api/dashboard'
import { SummaryCards } from './components/summary-cards'
import { TopPayments } from './components/top-payments'
import { UpcomingRecords } from './components/upcoming-records'

export function Dashboard() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useSummary()
  const { data: topPayments = [], isLoading: paymentsLoading } = useTopPayments()
  const { data: upcomingRecords = [], isLoading: upcomingLoading } = useUpcomingSimples()

  const isLoading = summaryLoading || paymentsLoading || upcomingLoading
  const currentMonth = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })

  return (
    <>
      <Header>
        <h1 className='text-lg font-semibold'>Dashboard</h1>
      </Header>
      <Main>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>财务概览</h1>
            <p className='text-muted-foreground'>{currentMonth} · 管理你的收付款和提醒记录</p>
          </div>
          <div className='flex shrink-0 gap-2'>
            <Link to='/calendar'>
              <Button variant='outline'>
                <Calendar className='mr-2 size-4' />
                查看日历
              </Button>
            </Link>
            <Link to='/create'>
              <Button>
                <Plus className='mr-2 size-4' />
                新建记录
              </Button>
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='size-8 animate-spin text-muted-foreground' />
          </div>
        )}

        {summaryError && !isLoading && (
          <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center'>
            <AlertCircle className='mx-auto mb-3 size-12 text-destructive' />
            <p className='font-medium text-destructive'>加载失败</p>
            <p className='mt-1 text-sm text-destructive/80'>{summaryError.message}</p>
          </div>
        )}

        {!isLoading && !summaryError && (
          <div className='space-y-8'>
            {summary && (
              <SummaryCards
                income={summary.income}
                expense={summary.expense}
                balance={summary.balance}
              />
            )}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <TopPayments records={topPayments} />
              <UpcomingRecords records={upcomingRecords} />
            </div>
          </div>
        )}
      </Main>
    </>
  )
}
