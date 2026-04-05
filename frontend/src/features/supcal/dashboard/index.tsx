import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useDashboardSummary, useTopPayments, useUpcomingRecords } from '../api/dashboard'
import { TopPaymentsList } from './components/top-payments-list'
import { UpcomingList } from './components/upcoming-list'
import { SummaryCards } from './components/summary-cards'

export function SupcalDashboard() {
  const navigate = useNavigate()
  const summaryQuery = useDashboardSummary()
  const topPaymentsQuery = useTopPayments()
  const upcomingQuery = useUpcomingRecords()

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
            <h1 className='text-2xl font-bold tracking-tight'>财务日历</h1>
            <p className='text-muted-foreground'>管理你的周期性收付款和提醒</p>
          </div>
          <Button onClick={() => navigate({ to: '/supcal/create' })}>
            <Plus className='mr-2 h-4 w-4' />
            新建记录
          </Button>
        </div>

        <SummaryCards
          summary={summaryQuery.data}
          isLoading={summaryQuery.isLoading}
        />

        <div className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <TopPaymentsList
            payments={topPaymentsQuery.data}
            isLoading={topPaymentsQuery.isLoading}
          />
          <UpcomingList
            records={upcomingQuery.data}
            isLoading={upcomingQuery.isLoading}
          />
        </div>
      </Main>
    </>
  )
}
