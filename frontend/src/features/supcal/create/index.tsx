import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PaymentForm } from './components/payment-form'
import { SimpleForm } from './components/simple-form'

export function SupcalCreate() {
  const [activeTab, setActiveTab] = useState('payment')

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

        <Card className='max-w-2xl'>
          <CardHeader>
            <CardTitle>记录类型</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='mb-6'>
                <TabsTrigger value='payment'>收付款</TabsTrigger>
                <TabsTrigger value='simple'>简单提醒</TabsTrigger>
              </TabsList>
              <TabsContent value='payment'>
                <PaymentForm />
              </TabsContent>
              <TabsContent value='simple'>
                <SimpleForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
