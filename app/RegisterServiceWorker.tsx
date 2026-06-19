'use client'

/**
 * app/RegisterServiceWorker.tsx
 *
 * Komponen kecil yang mendaftarkan public/sw.js setelah halaman selesai
 * load. Dipakai sekali saja di RootLayout (app/layout.tsx).
 *
 * Tidak merender apa pun di DOM — return null.
 */

import { useEffect } from 'react'

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('Gagal mendaftarkan service worker:', err))
    })
  }, [])

  return null
}