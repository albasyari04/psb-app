// lib/notifications.ts
// Helper terpusat untuk membuat notifikasi siswa dari route admin.
// Dipakai oleh: announcements, pembayaran, laporan, jadwal, berkas, pendaftaran.

import { getSupabaseAdmin } from '@/lib/supabase'

export type NotifType = 'success' | 'error' | 'info' | 'warning'

interface CreateNotificationInput {
  userId: string
  title: string
  message: string
  type: NotifType
}

/**
 * Insert satu notifikasi untuk satu user.
 * Gagal insert TIDAK melempar error ke caller — hanya di-log.
 * Ini supaya aksi utama (misal update status pembayaran) tetap
 * berhasil walau notifikasi gagal terkirim.
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
}: CreateNotificationInput): Promise<void> {
  if (!userId) {
    console.warn('[notifications] Lewati insert: userId kosong')
    return
  }

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
    })

    if (error) {
      console.error('[notifications] Gagal insert notifikasi:', error.message)
    }
  } catch (err) {
    console.error('[notifications] Unexpected error saat insert notifikasi:', err)
  }
}

/**
 * Insert notifikasi yang sama untuk banyak user sekaligus.
 * Dipakai misalnya untuk pengumuman yang harus diterima semua santri.
 */
export async function createNotificationForUsers(
  userIds: string[],
  payload: Omit<CreateNotificationInput, 'userId'>
): Promise<void> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)))
  if (uniqueIds.length === 0) {
    console.warn('[notifications] Lewati broadcast: tidak ada userId valid')
    return
  }

  try {
    const supabase = getSupabaseAdmin()
    const rows = uniqueIds.map((userId) => ({
      user_id: userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      is_read: false,
    }))

    const { error } = await supabase.from('notifications').insert(rows)

    if (error) {
      console.error('[notifications] Gagal broadcast notifikasi:', error.message)
    }
  } catch (err) {
    console.error('[notifications] Unexpected error saat broadcast notifikasi:', err)
  }
}

/** Format Rupiah konsisten untuk pesan notifikasi pembayaran */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

/**
 * Kirim notifikasi yang sama ke SEMUA admin.
 *
 * Catatan penting: tabel `notifications` punya kolom `user_id` tunggal
 * dan tidak ada foreign key ke tabel `admin` secara eksplisit di schema —
 * jadi baris notifikasi admin disimpan dengan `user_id` = id admin terkait,
 * sama seperti pola notifikasi siswa. Halaman/listing notifikasi admin
 * (jika ada) tinggal query `notifications` dengan `user_id` = id admin
 * yang sedang login.
 */
export async function notifyAllAdmins(
  payload: Omit<CreateNotificationInput, 'userId'>
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    const { data: admins, error: adminErr } = await supabase
      .from('admin')
      .select('id')

    if (adminErr) {
      console.error('[notifications] Gagal ambil daftar admin:', adminErr.message)
      return
    }

    if (!admins || admins.length === 0) {
      console.warn('[notifications] Lewati notifyAllAdmins: tidak ada admin terdaftar')
      return
    }

    await createNotificationForUsers(
      admins.map((a) => a.id),
      payload
    )
  } catch (err) {
    console.error('[notifications] Unexpected error saat notifyAllAdmins:', err)
  }
}

/**
 * Kumpulan template pesan notifikasi yang sering dipakai berulang,
 * supaya teks di berbagai route tetap konsisten dan tidak ditulis manual
 * di setiap tempat.
 */
export const NotifTemplate = {
  /** Dikirim ke siswa setelah ia berhasil submit formulir pendaftaran */
  pendaftaranDiterima: (namaLengkap: string): Omit<CreateNotificationInput, 'userId'> => ({
    title:   '✅ Pendaftaran Berhasil Dikirim',
    message: `Halo ${namaLengkap}, data pendaftaranmu telah berhasil dikirim dan akan segera diverifikasi oleh panitia. Pantau status pendaftaranmu secara berkala.`,
    type:    'success',
  }),

  /** Dikirim ke semua admin saat ada pendaftar baru masuk */
  pendaftarBaru: (namaLengkap: string): Omit<CreateNotificationInput, 'userId'> => ({
    title:   '🆕 Pendaftar Baru',
    message: `${namaLengkap} baru saja mengirimkan formulir pendaftaran. Segera lakukan verifikasi data dan berkas.`,
    type:    'info',
  }),
}