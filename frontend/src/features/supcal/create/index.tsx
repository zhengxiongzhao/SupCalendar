import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PaymentForm } from './components/payment-form'
import { SimpleForm } from './components/simple-form'

export function SupcalCreate() {
  const [activeTab, setActiveTab] = useState<'payment' | 'simple'>('payment')

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
          <h1 className='text-2xl font-bold tracking-tight'>新建记录</h1>
          <p className='text-muted-foreground'>创建新的收付款记录或提醒</p>
        </div>

        <div className='mb-6'>
          <div className='inline-flex rounded-lg border bg-muted p-1'>
            <button
              type='button'
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                activeTab === 'payment'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setActiveTab('payment')}
            >
              收付款
            </button>
            <button
              type='button'
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                activeTab === 'simple'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setActiveTab('simple')}
            >
              简单提醒
            </button>
          </div>
        </div>

        <div className='max-w-3xl'>
          {activeTab === 'payment' ? <PaymentForm /> : <SimpleForm />}
        </div>
      </Main>
    </>
  )
}
