/**
 * app/siswa/galeri/page.tsx
 *
 * Halaman "Galeri Kegiatan" — diakses lewat tombol "Selengkapnya →"
 * pada banner carousel di Beranda Santri (DashboardClient.tsx).
 *
 * Ini Server Component sederhana yang hanya merender GaleriClient.
 * Jika project Anda butuh proteksi sesi (mis. via NextAuth) di setiap
 * halaman /siswa/*, tambahkan pengecekan session di sini mengikuti
 * pola yang sudah Anda pakai di halaman /siswa lain (dashboard, jadwal, dll).
 */

import GaleriClient from './GaleriClient'

export default function GaleriPage() {
  return <GaleriClient />
}