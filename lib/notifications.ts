// lib/notifications.ts
// ─────────────────────────────────────────────────────────────────────────────
// Helper terpusat untuk membuat notifikasi ke user atau semua admin.
// Import dan panggil dari route mana pun setelah aksi berhasil.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseAdmin } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotifType = 'success' | 'error' | 'info'

export interface CreateNotificationPayload {
  userId: string
  title: string
  message: string
  type?: NotifType
}

export interface NotifPayload {
  title: string
  message: string
  type?: NotifType
}

// ── Core: Buat 1 notifikasi ke 1 user ────────────────────────────────────────

export async function createNotification({
  userId,
  title,
  message,
  type = 'info',
}: CreateNotificationPayload): Promise<void> {
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
      console.error('[notifications] createNotification error:', error.message)
    }
  } catch (err) {
    console.error('[notifications] createNotification unexpected error:', err)
  }
}

// ── Core: Kirim notifikasi ke SEMUA admin ─────────────────────────────────────
// Admin diambil dari tabel `profiles` dengan role = 'admin'

export async function notifyAllAdmins(payload: NotifPayload): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()

    const { data: admins, error: fetchErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if (fetchErr || !admins || admins.length === 0) {
      console.warn('[notifications] Tidak ada admin ditemukan:', fetchErr?.message)
      return
    }

    const rows = admins.map((admin) => ({
      user_id: admin.id,
      title:   payload.title,
      message: payload.message,
      type:    payload.type ?? 'info',
      is_read: false,
    }))

    const { error: insertErr } = await supabase.from('notifications').insert(rows)
    if (insertErr) {
      console.error('[notifications] notifyAllAdmins insert error:', insertErr.message)
    }
  } catch (err) {
    console.error('[notifications] notifyAllAdmins unexpected error:', err)
  }
}

// ── Template Notifikasi ───────────────────────────────────────────────────────
// Semua teks notifikasi dikumpulkan di satu tempat agar mudah diubah.

export const NotifTemplate = {

  // ── Pendaftaran ─────────────────────────────────────────────────────────────

  /** Notif ke SISWA: pendaftaran berhasil dikirim */
  pendaftaranDiterima: (nama: string): NotifPayload => ({
    title:   'Pendaftaran Berhasil Dikirim ✅',
    message: `Halo ${nama}, pendaftaran kamu sudah kami terima dan sedang dalam proses verifikasi.`,
    type:    'success',
  }),

  /** Notif ke ADMIN: ada pendaftar baru */
  pendaftarBaru: (nama: string): NotifPayload => ({
    title:   'Pendaftar Baru 🎉',
    message: `${nama} baru saja mengisi formulir pendaftaran. Segera lakukan verifikasi.`,
    type:    'info',
  }),

  /** Notif ke SISWA: pendaftaran diterima oleh admin */
  pendaftaranDiterimаAdmin: (nama: string): NotifPayload => ({
    title:   'Selamat! Pendaftaran Diterima 🎊',
    message: `Halo ${nama}, pendaftaran kamu telah DITERIMA. Silakan selesaikan proses selanjutnya.`,
    type:    'success',
  }),

  /** Notif ke SISWA: pendaftaran ditolak oleh admin */
  pendaftaranDitolak: (nama: string, catatan?: string | null): NotifPayload => ({
    title:   'Pendaftaran Tidak Diterima',
    message: catatan
      ? `Maaf ${nama}, pendaftaran kamu tidak diterima. Catatan admin: ${catatan}`
      : `Maaf ${nama}, pendaftaran kamu tidak diterima. Hubungi admin untuk informasi lebih lanjut.`,
    type: 'error',
  }),

  // ── Pembayaran ──────────────────────────────────────────────────────────────

  /** Notif ke ADMIN: ada bukti pembayaran baru dikirim siswa */
  pembayaranBaru: (nama: string, jenis: string, nominal: number): NotifPayload => ({
    title:   'Bukti Pembayaran Masuk 💰',
    message: `${nama} mengirim bukti pembayaran ${jenis} sebesar Rp ${nominal.toLocaleString('id-ID')}. Segera konfirmasi.`,
    type:    'info',
  }),

  /** Notif ke SISWA: pembayaran dikonfirmasi admin */
  pembayaranDikonfirmasi: (jenis: string, nominal: number): NotifPayload => ({
    title:   'Pembayaran Dikonfirmasi ✅',
    message: `Pembayaran ${jenis} sebesar Rp ${nominal.toLocaleString('id-ID')} telah dikonfirmasi oleh admin.`,
    type:    'success',
  }),

  /** Notif ke SISWA: pembayaran ditolak admin */
  pembayaranDitolak: (jenis: string, catatan?: string | null): NotifPayload => ({
    title:   'Pembayaran Ditolak ❌',
    message: catatan
      ? `Pembayaran ${jenis} ditolak. Alasan: ${catatan}`
      : `Pembayaran ${jenis} ditolak. Silakan hubungi admin.`,
    type: 'error',
  }),

  // ── Berkas / Dokumen ────────────────────────────────────────────────────────

  /** Notif ke ADMIN: siswa upload dokumen */
  berkasDikirim: (nama: string): NotifPayload => ({
    title:   'Dokumen Baru Diunggah 📄',
    message: `${nama} baru saja mengunggah dokumen persyaratan. Silakan periksa kelengkapannya.`,
    type:    'info',
  }),

  /** Notif ke SISWA: berkas diterima */
  berkasDiterima: (): NotifPayload => ({
    title:   'Dokumen Berhasil Diunggah ✅',
    message: 'Dokumen persyaratan kamu berhasil diunggah dan sedang dalam proses verifikasi.',
    type:    'success',
  }),

  // ── Chat ────────────────────────────────────────────────────────────────────

  /** Notif ke ADMIN: siswa mengirim pesan */
  pesanBaruDariSiswa: (nama: string): NotifPayload => ({
    title:   'Pesan Baru dari Siswa 💬',
    message: `${nama} mengirim pesan baru. Segera balas untuk membantu.`,
    type:    'info',
  }),

  /** Notif ke SISWA: admin membalas pesan */
  pesanBalasanAdmin: (): NotifPayload => ({
    title:   'Admin Membalas Pesan Kamu 💬',
    message: 'Admin telah membalas pesan kamu. Buka chat untuk melihat balasannya.',
    type:    'info',
  }),
}