import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SimpleForm } from './components/simple-form'
import { PaymentForm } from './components/payment-form'

export function CreatePage() {
  const [activeTab, setActiveTab] = useState('payment')

  return (
    <>
      <Header>
        <h1 className='text-lg font-semibold'>创建记录</h1>
      </Header>
      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>创建记录</h1>
          <p className='text-sm text-muted-foreground'>添加收付款记录或简单提醒</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='payment'>收付款记录</TabsTrigger>
            <TabsTrigger value='simple'>简单提醒</TabsTrigger>
          </TabsList>
          <TabsContent value='payment' className='mt-6'>
            <PaymentForm />
          </TabsContent>
          <TabsContent value='simple' className='mt-6'>
            <SimpleForm />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
