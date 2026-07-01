// app/layout.tsx

import type { Metadata } from 'next'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { Providers } from './providers'
import RegisterServiceWorker from '@/app/RegisterServiceWorker'
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
          <SettingsProvider>
            {/* Mendaftarkan service worker (public/sw.js) agar:
                1. Push notification bisa diterima walau app tidak dibuka
                2. App bisa di-install sebagai PWA (Add to Home Screen)
                Harus ada di RootLayout supaya jalan di semua halaman (siswa & admin) */}
            <RegisterServiceWorker />
            {children}
          </SettingsProvider>
        </Providers>
      </body>
    </html>
  )
}