import { Loader2, AlertCircle } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useProfileStats } from '@/api/profile'
import { StatsDisplay } from './components/stats-display'
import { DataManagement } from './components/data-management'
import { IcalSubscription } from './components/ical-subscription'

export function SettingsPage() {
  const { data: stats, isLoading, error } = useProfileStats()

  return (
    <>
      <Header>
        <h1 className='text-lg font-semibold'>设置</h1>
      </Header>
      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>设置</h1>
          <p className='text-sm text-muted-foreground'>管理你的数据和日历订阅</p>
        </div>

        <div className='space-y-6'>
          {isLoading && (
            <div className='flex items-center justify-center py-20'>
              <Loader2 className='size-8 animate-spin text-muted-foreground' />
            </div>
          )}

          {error && !isLoading && (
            <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center'>
              <AlertCircle className='mx-auto mb-3 size-12 text-destructive' />
              <p className='font-medium text-destructive'>加载失败</p>
            </div>
          )}

          {stats && !isLoading && <StatsDisplay stats={stats} />}

          <DataManagement />
          <IcalSubscription />
        </div>
      </Main>
    </>
  )
}
