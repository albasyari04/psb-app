// lib/webpush.ts
//
// Inti pengiriman Web Push notification (popup notifikasi sistem di HP/desktop
// user) menggunakan VAPID keys + library `web-push`.
//
// Dipanggil dari lib/notifications.ts setiap kali createNotification() /
// notifyAllAdmins() dipanggil — jadi route chat, pembayaran, berkas, dll
// TIDAK perlu diubah sama sekali, push otomatis ikut terkirim.
//
// SYARAT AGAR INI BERFUNGSI:
// 1. `npm install web-push`
// 2. .env.local berisi NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
// 3. User (siswa/admin) sudah pernah subscribe via PushNotificationManager.tsx
//    (artinya ada baris di tabel push_subscriptions untuk user tsb)

import webpush from 'web-push'
import { getSupabaseAdmin } from '@/lib/supabase'

// ── Setup VAPID — dijalankan sekali saat module di-import ──────────────────
const VAPID_PUBLIC_KEY  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT     = process.env.VAPID_SUBJECT || 'mailto:admin@alistiqomah.sch.id'

let vapidConfigured = false

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  vapidConfigured = true
} else {
  // Jangan throw — supaya build/dev server tidak crash kalau env belum di-set.
  // Tapi WARNING ini akan muncul di Vercel > Project > Logs (Runtime Logs)
  // kalau env var belum ditambahkan di sana — cek di situ kalau push masih
  // tidak jalan setelah deploy.
  console.error(
    '[webpush] ❌ VAPID keys TIDAK ditemukan di environment ini. ' +
    `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY ? 'ADA' : 'KOSONG'}, ` +
    `VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY ? 'ADA' : 'KOSONG'}. ` +
    'Kalau ini di production (Vercel), tambahkan env var ini di ' +
    'Project Settings > Environment Variables, lalu REDEPLOY. ' +
    'Push notification TIDAK akan terkirim sampai ini diperbaiki.'
  )
}

export interface PushPayload {
  title: string
  message: string
  url?: string
}

interface PushSubscriptionRow {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
}

// ── Kirim push ke SATU user (semua device yang pernah subscribe) ───────────
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!vapidConfigured) return
  await sendPushToUsers([userId], payload)
}

// ── Kirim push ke BANYAK user sekaligus (dipakai notifyAllAdmins) ──────────
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<void> {
  if (!vapidConfigured) {
    console.error('[webpush] sendPushToUsers dibatalkan — VAPID belum dikonfigurasi.')
    return
  }
  if (userIds.length === 0) return

  const supabase = getSupabaseAdmin()

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth')
    .in('user_id', userIds) as { data: PushSubscriptionRow[] | null; error: unknown }

  if (error) {
    console.error('[webpush] Gagal mengambil push_subscriptions:', error)
    return
  }
  if (!subs || subs.length === 0) {
    // Wajar terjadi kalau user belum pernah buka app / belum izinkan notifikasi.
    console.warn(`[webpush] Tidak ada subscription ditemukan untuk userIds: ${userIds.join(', ')}`)
    return
  }

  console.log(`[webpush] Mengirim push ke ${subs.length} device untuk ${userIds.length} user...`)

  const notificationPayload = JSON.stringify({
    title:   payload.title,
    message: payload.message,
    url:     payload.url || '/',
  })

  // Kirim ke semua subscription secara paralel. Kalau salah satu gagal
  // (misal endpoint sudah expired/410 Gone), hapus baris itu dari DB supaya
  // tidak terus dicoba lagi di masa depan.
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        notificationPayload
      )
    )
  )

  const expiredIds: string[] = []
  let successCount = 0
  results.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      successCount++
    } else {
      const err = result.reason as { statusCode?: number; body?: string }
      // 404/410 = subscription sudah tidak valid lagi (user uninstall, clear data, dll)
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        expiredIds.push(subs[idx].id)
      } else {
        console.error(
          `[webpush] Gagal kirim push ke device ${subs[idx].id} (statusCode: ${err?.statusCode}):`,
          err?.body || err
        )
      }
    }
  })
  console.log(`[webpush] Push terkirim: ${successCount}/${subs.length} berhasil.`)

  if (expiredIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', expiredIds)
  }
}