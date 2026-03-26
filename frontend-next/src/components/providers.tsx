'use client'

import { NextIntlClientProvider } from 'next-intl'
import type { AbstractIntlMessages } from 'next-intl'
import { ReactNode } from 'react'

export function Providers({
  children,
  locale,
  messages,
}: {
  children: ReactNode
  locale: string
  messages: AbstractIntlMessages
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
