// types/tren.ts
// ⚠️ Jangan impor tipe ini dari route.ts — simpan di sini agar bisa dipakai
// di Client Component, Server Component, maupun API route sekaligus.

export interface TrenBulan {
  month:         string  // 'Jan', 'Feb', dst.
  year:          number
  pendaftar:     number
  terverifikasi: number  // diterima + diproses
}