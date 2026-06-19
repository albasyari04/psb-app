// types/index.ts
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

/** Represents a notification - created_at might be null from database */
export type Notification = Database['public']['Tables']['notifications']['Row']

/**
 * Represents a notification with non-null created_at for display purposes
 * Use this type when you need to guarantee created_at exists
 */
export type NotificationDisplay = Omit<Notification, 'created_at'> & {
  created_at: string // ensure created_at is always a string for display
}

/**
 * Represents a student profile with additional computed fields
 */
export type StudentProfile = Profil & {
  kelas?: string
  asrama?: string
  nisn?: string
}

/**
 * Represents admin user type
 */
export type Admin = Database['public']['Tables']['admin']['Row']

/**
 * Represents student documents/berkas
 */
export type SiswaBerkas = Database['public']['Tables']['siswa_berkas']['Row']

/**
 * Type for the response when fetching paginated data
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Type for API response with standard structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Type for filter options in laporan
 */
export type LaporanTipe = 'bulanan' | 'tahunan' | 'khusus' | 'semua'

/**
 * Type for notification types
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning'

/**
 * Type for announcement types
 */
export type AnnouncementTipe = 'Penting' | 'Informasi' | 'Info' | 'Peringatan'

/**
 * Type for payment status
 */
export type PaymentStatus = 'menunggu' | 'dikonfirmasi' | 'ditolak'

/**
 * Type for payment jenis
 */
export type PaymentJenis = 'Formulir' | 'SPP' | 'Seragam' | 'Lainnya'

/**
 * Type for payment metode
 */
export type PaymentMetode = 'Transfer Bank' | 'Tunai' | 'QRIS'

/**
 * Type for user roles
 */
export type UserRole = 'admin' | 'siswa' | 'user'

/**
 * Type for profile update data
 */
export interface ProfileUpdateData {
  name?: string
  avatar_url?: string | null
  email?: string
  role?: UserRole
}

/**
 * Type for registration status
 */
export type RegistrationStatus = 
  | 'pending' 
  | 'diproses' 
  | 'diterima' 
  | 'ditolak' 
  | 'selesai'
  | string

/**
 * Type for registration form data
 */
export interface PendaftaranFormData {
  nama_lengkap: string
  nik: string
  nisn: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: 'Laki-laki' | 'Perempuan'
  agama: string
  alamat: string
  alamat_kota: string
  alamat_kecamatan: string
  alamat_rt_rw: string
  no_hp: string
  asal_sekolah: string
  npsn: string
  nama_ayah: string
  nama_ibu: string
  pekerjaan_ayah: string
  pekerjaan_ibu: string
  no_hp_ortu: string
}

/**
 * Type for dashboard statistics
 */
export interface DashboardStats {
  totalSiswa: number
  totalPendaftaran: number
  totalPembayaran: number
  totalLaporan: number
  pendaftaranBaru: number
  pembayaranMenunggu: number
  laporanBulanan: number
}

/**
 * Type for chart data
 */
export interface ChartData {
  label: string
  value: number
  [key: string]: string | number
}

/**
 * Type for user session
 */
export interface UserSession {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
    avatar_url?: string | null
  }
  expires: string
}

/**
 * Utility type for making all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Utility type for picking required properties
 */
export type RequiredPick<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Utility type for making specific properties nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null
}