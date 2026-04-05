import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useRecords } from '../api/records'
import { RecordsTable } from './components/records-table'

type FilterType = 'all' | 'payment' | 'simple'

export function SupcalRecords() {
  const [filter, setFilter] = useState<FilterType>('all')
  const recordsQuery = useRecords()
  const navigate = useNavigate()

  const filteredRecords = recordsQuery.data?.filter((record) => {
    if (filter === 'all') return true
    if (filter === 'payment') return record.type === 'payment'
    return record.type === 'simple'
  })

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
            <h1 className='text-2xl font-bold tracking-tight'>所有记录</h1>
            <p className='text-muted-foreground'>管理你的收付款和提醒记录</p>
          </div>
          <Button onClick={() => navigate({ to: '/supcal/create' })}>
            <Plus className='mr-2 h-4 w-4' />
            新建记录
          </Button>
        </div>

        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterType)}
          className='space-y-4'
        >
          <TabsList>
            <TabsTrigger value='all'>全部</TabsTrigger>
            <TabsTrigger value='payment'>收付款</TabsTrigger>
            <TabsTrigger value='simple'>提醒</TabsTrigger>
          </TabsList>

          <RecordsTable
            data={filteredRecords ?? []}
            filter={filter}
            isLoading={recordsQuery.isLoading}
          />
        </Tabs>
      </Main>
    </>
  )
}
