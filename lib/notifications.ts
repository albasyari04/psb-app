// lib/notifications.ts
// Helper terpusat untuk membuat notifikasi.
// Dipakai di API route manapun yang perlu trigger notifikasi.

import { getSupabaseAdmin } from '@/lib/supabase'

type NotifType = 'success' | 'error' | 'info'

interface SendNotifOptions {
  user_id: string
  title: string
  message: string
  type?: NotifType
}

/**
 * Kirim satu notifikasi ke user tertentu.
 */
export async function sendNotification(opts: SendNotifOptions): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('notifications').insert({
    user_id: opts.user_id,
    title:   opts.title,
    message: opts.message,
    type:    opts.type ?? 'info',
    is_read: false,
  })

  if (error) {
    // Jangan throw — notif gagal tidak boleh break flow utama
    console.error('[notifications] Gagal kirim notif:', error.message)
  }
}

/**
 * Kirim notifikasi ke semua admin yang terdaftar di tabel `admin`.
 */
export async function notifyAllAdmins(opts: Omit<SendNotifOptions, 'user_id'>): Promise<void> {
  const supabase = getSupabaseAdmin()

  // Ambil semua ID admin
  const { data: admins, error } = await supabase
    .from('admin')
    .select('id')

  if (error || !admins?.length) {
    console.error('[notifications] Gagal ambil admin list:', error?.message)
    return
  }

  // Bulk insert notifikasi ke semua admin
  const rows = admins.map(a => ({
    user_id: a.id,
    title:   opts.title,
    message: opts.message,
    type:    opts.type ?? 'info',
    is_read: false,
  }))

  const { error: insertError } = await supabase
    .from('notifications')
    .insert(rows)

  if (insertError) {
    console.error('[notifications] Gagal bulk insert notif admin:', insertError.message)
  }
}

// ── Template notifikasi siap pakai ────────────────────────────────────────────

export const NotifTemplate = {
  /** Dikirim ke ADMIN saat ada pendaftar baru */
  pendaftarBaru: (namaSiswa: string) => ({
    title:   '🎓 Pendaftar Baru',
    message: `${namaSiswa} baru saja mendaftar dan menunggu verifikasi.`,
    type:    'info' as NotifType,
  }),

  /** Dikirim ke SISWA setelah berhasil mendaftar */
  pendaftaranDiterima: (namaSiswa: string) => ({
    title:   '✅ Pendaftaran Berhasil',
    message: `Halo ${namaSiswa}, pendaftaranmu berhasil dikirim! Tunggu verifikasi dari admin.`,
    type:    'success' as NotifType,
  }),

  /** Dikirim ke SISWA saat status diverifikasi */
  statusDiverifikasi: () => ({
    title:   '✅ Pendaftaran Diverifikasi',
    message: 'Selamat! Pendaftaranmu telah diverifikasi oleh admin.',
    type:    'success' as NotifType,
  }),

  /** Dikirim ke SISWA saat status ditolak */
  statusDitolak: (catatan?: string | null) => ({
    title:   '❌ Pendaftaran Ditolak',
    message: catatan
      ? `Pendaftaranmu ditolak. Catatan admin: ${catatan}`
      : 'Pendaftaranmu ditolak. Hubungi admin untuk informasi lebih lanjut.',
    type: 'error' as NotifType,
  }),

  /** Dikirim ke SISWA saat pembayaran dikonfirmasi */
  pembayaranDikonfirmasi: (nominal: number) => ({
    title:   '💰 Pembayaran Dikonfirmasi',
    message: `Pembayaran sebesar Rp ${nominal.toLocaleString('id-ID')} telah dikonfirmasi.`,
    type:    'success' as NotifType,
  }),

  /** Dikirim ke ADMIN saat ada pembayaran baru */
  pembayaranBaru: (namaSiswa: string, nominal: number) => ({
    title:   '💳 Pembayaran Baru',
    message: `${namaSiswa} mengirim bukti pembayaran Rp ${nominal.toLocaleString('id-ID')}.`,
    type:    'info' as NotifType,
  }),
}