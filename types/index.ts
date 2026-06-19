import type { Database } from './database.types'

// Re-exporting the generated Json and Database types
export type { Json, Database } from './database.types'

// Defining a specific type for Pembayaran by extracting it from the auto-generated types.
// This makes it easier to use throughout the app and provides better type safety
// with specific string literal types for fields like 'status'.
export type Pembayaran = Omit<
  Database['public']['Tables']['pembayaran']['Row'],
  'jenis_pembayaran' | 'metode_pembayaran' | 'status'
> & {
  jenis_pembayaran: 'Formulir' | 'SPP' | 'Seragam' | 'Lainnya'
  metode_pembayaran: 'Transfer Bank' | 'Tunai' | 'QRIS' | null
  status: 'menunggu' | 'dikonfirmasi' | 'ditolak'
}

// Defining the type for the form data used to create or edit a payment.
export interface PembayaranFormData {
  user_id: string
  nama_siswa: string
  nominal: number
  jenis_pembayaran: 'Formulir' | 'SPP' | 'Seragam' | 'Lainnya'
  metode_pembayaran: 'Transfer Bank' | 'Tunai' | 'QRIS'
  no_referensi: string
  status: 'menunggu' | 'dikonfirmasi' | 'ditolak'
  catatan: string
  tanggal_bayar: string
}