import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { MobileNav } from '@/components/layout/MobileNav'
import './globals.css'

export const metadata: Metadata = {
  title: 'SupCalendar',
  description: '财务提醒日历应用',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <DesktopNav />
          <MobileNav />
          <main className="md:pl-64 pb-20 md:pb-0">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
              {children}
            </div>
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
