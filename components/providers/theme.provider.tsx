'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import dynamic from 'next/dynamic'

// NoSSR komponenti yaratish
const NoSSR = dynamic(() => Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>), {
  ssr: false
})

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <NoSSR>{children}</NoSSR>
    </NextThemesProvider>
  )
}