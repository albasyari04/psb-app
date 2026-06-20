// app/layout.tsx
//
// CATATAN: Sesuaikan import lain (metadata, font, dll) dengan isi file
// app/layout.tsx Anda yang sebenarnya kalau ada bagian lain yang berbeda.
// Yang penting: <SettingsProvider> membungkus {children} di DALAM
// <Providers>, dan Providers di-import sebagai named import sesuai
// export aslinya di app/providers.tsx.

import type { Metadata } from 'next'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'PSMB - Pon-Pes Al Istiqomah',
  description: 'Penerimaan Santri Baru',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>
          <SettingsProvider>{children}</SettingsProvider>
        </Providers>
      </body>
    </html>
  )
}