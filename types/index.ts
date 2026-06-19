import type { Database } from './database.types'

// Re-exporting the generated Json and Database types
export type { Json, Database } from './database.types'

// --- Main Application Types ---
// By creating specific types from the auto-generated database types,
// we can create more robust and easier-to-use types throughout the application.

/** Represents a user profile */
export type Profil = Database['public']['Tables']['profiles']['Row']

/** Represents a registration/pendaftaran, potentially including related documents and payments */
export type Pendaftaran = Database['public']['Tables']['pendaftaran']['Row'] & {
  berkas?: Database['public']['Tables']['siswa_berkas']['Row']
  pembayaran?: Array<Database['public']['Tables']['pembayaran']['Row']>
}

/**
 * Represents a payment record with specific string literal types for better type safety.
 */
export type Pembayaran = Omit<
  Database['public']['Tables']['pembayaran']['Row'],
  'jenis_pembayaran' | 'metode_pembayaran' | 'status'
> & {
  jenis_pembayaran: 'Formulir' | 'SPP' | 'Seragam' | 'Lainnya'
  metode_pembayaran: 'Transfer Bank' | 'Tunai' | 'QRIS' | null // Allow null for metode
  status: 'menunggu' | 'dikonfirmasi' | 'ditolak'
}

/**
 * Defines the shape of the data for the payment creation/edit form.
 */
export interface PembayaranFormData {
  user_id: string
  nama_siswa: string
  nominal: number
  jenis_pembayaran: 'Formulir' | 'SPP' | 'Seragam' | 'Lainnya'
  metode_pembayaran: 'Transfer Bank' | 'Tunai' | 'QRIS'
  no_referensi: string // no_referensi is required in the form
  status: 'menunggu' | 'dikonfirmasi' | 'ditolak'
  catatan: string
  tanggal_bayar: string
}

/** Represents an announcement */
export type Pengumuman = Database['public']['Tables']['announcements']['Row']

/** Represents a report, potentially linked to a user profile */
export type Laporan = Database['public']['Tables']['laporan']['Row'] & {
  profiles?: Profil
}