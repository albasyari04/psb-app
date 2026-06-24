// lib/createNotification.ts
// ─────────────────────────────────────────────────────────────────────────────
// Utility server-side: buat satu baris di tabel `notifications`.
// Dipanggil dari route API lain (chat, laporan, jadwal, keuangan, dll).
//
// Contoh pemakaian:
//   import { createNotification } from '@/lib/createNotification'
//   await createNotification({
//     userId : siswaId,
//     title  : 'Pesan baru dari Admin',
//     message: 'Admin telah membalas pertanyaanmu.',
//     type   : 'chat',
//   })
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from '@/lib/supabase'

export type NotificationType =
  | 'chat'        // admin membalas chat
  | 'laporan'     // laporan baru diterbitkan
  | 'jadwal'      // jadwal baru / perubahan jadwal
  | 'pembayaran'  // konfirmasi / penolakan pembayaran
  | 'pengumuman'  // pengumuman baru dari admin
  | 'pendaftaran' // status pendaftaran berubah
  | 'info'        // notifikasi umum

interface CreateNotificationParams {
  userId  : string
  title   : string
  message : string
  type    : NotificationType
}

/**
 * Buat notifikasi untuk satu user.
 * Tidak melempar error — hanya log ke console jika gagal,
 * agar proses utama (kirim chat, upload laporan, dll) tidak terganggu.
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const { userId, title, message, type } = params

  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from('notifications').insert({
    user_id : userId,
    title,
    message,
    type,
    is_read : false,
  })

  if (error) {
    console.error('[createNotification] Gagal membuat notifikasi:', error.message)
  }
}

/**
 * Buat notifikasi untuk banyak user sekaligus (broadcast ke semua siswa, misalnya).
 */
export async function createNotificationBulk(
  userIds : string[],
  params  : Omit<CreateNotificationParams, 'userId'>,
): Promise<void> {
  if (userIds.length === 0) return

  const supabase = getSupabaseAdmin()

  const rows = userIds.map(userId => ({
    user_id : userId,
    title   : params.title,
    message : params.message,
    type    : params.type,
    is_read : false,
  }))

  const { error } = await supabase.from('notifications').insert(rows)

  if (error) {
    console.error('[createNotificationBulk] Gagal membuat notifikasi bulk:', error.message)
  }
}