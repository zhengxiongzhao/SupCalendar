import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useProfileStats } from '../api/profile'
import { StatsCards } from './components/stats-cards'
import { ExportImport } from './components/export-import'

export function SupcalProfile() {
  const statsQuery = useProfileStats()

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
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>个人中心</h1>
          <p className='text-muted-foreground'>查看统计信息和数据管理</p>
        </div>

        <div className='space-y-8'>
          <StatsCards
            stats={statsQuery.data}
            isLoading={statsQuery.isLoading}
          />
          <ExportImport />
        </div>
      </Main>
    </>
  )
}
