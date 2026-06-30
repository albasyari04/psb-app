'use client'

/**
 * components/PushNotificationManager.tsx
 *
 * Komponen tak-terlihat (return null) yang:
 * 1. Menunggu user login (session ada)
 * 2. Minta izin notifikasi browser (Notification.requestPermission)
 * 3. Subscribe ke Push Manager pakai VAPID public key
 * 4. Kirim subscription itu ke server (app/api/push/subscribe) untuk disimpan
 *
 * Pasang SEKALI di masing-masing layout yang sudah pasti ada session,
 * yaitu app/(siswa)/layout.tsx DAN app/(admin)/layout.tsx — supaya baik
 * siswa maupun admin sama-sama bisa menerima push (chat kan 2 arah).
 */

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

// Hasil dikembalikan sebagai BufferSource (bukan Uint8Array biasa) supaya
// cocok dengan tipe `applicationServerKey` di lib.dom.d.ts versi terbaru
// (Uint8Array<ArrayBufferLike> vs Uint8Array<ArrayBuffer> mismatch — ini
// known issue TypeScript 5.x, bukan bug di logika kita).
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)

  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  // Cast eksplisit ke BufferSource — di runtime ini tetap Uint8Array biasa,
  // cuma TypeScript-nya saja yang dibikin longgar di titik ini.
  return outputArray as BufferSource
}

export default function PushNotificationManager() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      // Browser tidak mendukung Web Push (misal Safari versi lama / iOS < 16.4
      // di luar mode "Add to Home Screen"). Diamkan saja, bukan error.
      return
    }

    // ✅ FIX: simpan ke variabel baru bertipe `string` (bukan `string | undefined`)
    // SETELAH pengecekan, supaya TypeScript yakin nilainya pasti ada saat
    // dipakai di dalam closure `setupPush` di bawah.
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      console.warn('[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY belum di-set di .env.local')
      return
    }
    const vapidKey: string = vapidPublicKey

    let cancelled = false

    async function setupPush() {
      try {
        // Jangan tanya izin lagi kalau user sudah pernah menolak —
        // browser akan otomatis tolak diam-diam, lebih baik kita skip saja.
        if (Notification.permission === 'denied') return

        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission()
          if (permission !== 'granted') return
        }

        const registration = await navigator.serviceWorker.ready
        let subscription = await registration.pushManager.getSubscription()

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          })
        }

        if (cancelled) return

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        })
      } catch (err) {
        console.error('[push] Gagal setup push notification:', err)
      }
    }

    void setupPush()

    return () => {
      cancelled = true
    }
  }, [status, session?.user?.id])

  return null
}