// lib/webpush.ts
// ─────────────────────────────────────────────────────────────────────────────
// Helper server-side untuk mengirim Web Push (popup notifikasi sistem di HP/
// browser user), terpisah dari `lib/notifications.ts` yang menyimpan notif
// ke tabel `notifications` (untuk lonceng/drawer di dalam app).
//
// Dipanggil DARI DALAM `notifications.ts` (createNotification & notifyAllAdmins)
// supaya setiap kali ada notifikasi baru dibuat, otomatis terkirim juga
// sebagai push — tidak perlu ubah route chat/pembayaran/dll satu-satu.
//
// PENTING: hanya jalan kalau env VAPID_PUBLIC_KEY/PRIVATE_KEY sudah di-set.
// Kalau belum, fungsi-fungsi ini diam saja (no-op) — tidak melempar error,
// supaya tidak mengganggu alur utama (kirim chat, dll) kalau push belum
// dikonfigurasi.
// ─────────────────────────────────────────────────────────────────────────────

import webpush from 'web-push'
import { getSupabaseAdmin } from '@/lib/supabase'

const VAPID_PUBLIC_KEY  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? ''
const VAPID_SUBJECT     = process.env.VAPID_SUBJECT ?? 'mailto:admin@alistiqomah.sch.id'

let isConfigured = false

function ensureConfigured(): boolean {
  if (isConfigured) return true
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[webpush] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY belum di-set di .env.local — push notification dilewati.')
    return false
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  isConfigured = true
  return true
}

export interface PushPayload {
  title:   string
  message: string
  /** URL tujuan saat notifikasi di-klik, misal '/siswa/chat' atau '/admin/chat' */
  url?:    string
}

interface SubscriptionRow {
  id:       string
  endpoint: string
  p256dh:   string
  auth:     string
}

/**
 * Kirim push ke SEMUA device milik 1 user.
 * Kalau ada subscription yang sudah expired/invalid (404/410 dari browser
 * vendor), otomatis dihapus dari database supaya tidak terus dicoba.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  await sendPushToUsers([userId], payload)
}

/**
 * Kirim push ke banyak user sekaligus (dipakai untuk notifyAllAdmins).
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<void> {
  if (userIds.length === 0) return
  if (!ensureConfigured()) return

  const supabase = getSupabaseAdmin()

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .in('user_id', userIds) as { data: SubscriptionRow[] | null; error: unknown }

  if (error) {
    console.error('[webpush] Gagal mengambil subscriptions:', error)
    return
  }
  if (!subs || subs.length === 0) return

  const notificationPayload = JSON.stringify({
    title:   payload.title,
    message: payload.message,
    url:     payload.url ?? '/',
  })

  const expiredSubIds: string[] = []

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          notificationPayload
        )
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode
        // 404/410 = subscription sudah tidak valid lagi (uninstall, izin dicabut, dll)
        if (statusCode === 404 || statusCode === 410) {
          expiredSubIds.push(sub.id)
        } else {
          console.error('[webpush] Gagal kirim push ke 1 subscription:', err)
        }
      }
    })
  )

  if (expiredSubIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', expiredSubIds)
  }
}

/**
 * Kirim push ke SEMUA admin (role = 'admin' di tabel profiles).
 */
export async function sendPushToAdmins(payload: PushPayload): Promise<void> {
  if (!ensureConfigured()) return

  const supabase = getSupabaseAdmin()
  const { data: admins, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  if (error || !admins || admins.length === 0) return

  await sendPushToUsers(admins.map((a) => a.id), payload)
}