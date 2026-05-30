// types/index.ts

export type Role = 'siswa' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  avatar_url?: string
}

export interface Pendaftaran {
  id: string
  user_id: string
  nama_lengkap: string | null
  nisn: string | null
  nik: string | null
  tempat_lahir: string | null
  tanggal_lahir: string | null
  jenis_kelamin: string | null
  agama: string | null
  alamat: string | null
  alamat_kota: string | null
  alamat_kecamatan: string | null
  alamat_rt_rw: string | null
  no_hp: string | null
  asal_sekolah: string | null
  npsn: string | null
  nama_ayah: string | null
  nama_ibu: string | null
  pekerjaan_ayah: string | null
  pekerjaan_ibu: string | null
  no_hp_ortu: string | null
  status: string
  catatan_admin: string | null
  created_at: string | null
  updated_at: string | null
}

export type StatusPembayaran = 'menunggu' | 'dikonfirmasi' | 'ditolak'
export type JenisPembayaran = 'Formulir' | 'SPP' | 'Seragam' | 'Lainnya'
export type MetodePembayaran = 'Transfer Bank' | 'Tunai' | 'QRIS'

export interface Pembayaran {
  id: string
  user_id: string
  pendaftaran_id: string | null
  nama_siswa: string
  nominal: number
  jenis_pembayaran: JenisPembayaran | string
  metode_pembayaran: MetodePembayaran | string | null
  no_referensi: string | null
  bukti_url: string | null
  status: StatusPembayaran | string
  catatan: string | null
  tanggal_bayar: string | null
  confirmed_at: string | null
  confirmed_by: string | null
  created_at: string | null
  updated_at: string | null
}

export interface PembayaranFormData {
  user_id: string
  nama_siswa: string
  nominal: number
  jenis_pembayaran: string
  metode_pembayaran: string
  no_referensi: string
  status: string
  catatan: string
  tanggal_bayar: string
}

export interface Session {
  user: User
  expires: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info'
  is_read: boolean
  created_at: string
}

export type LaporanDataJson = Record<string, unknown> | null

export interface Laporan {
  id: string
  judul: string
  deskripsi: string | null
  tipe: 'bulanan' | 'tahunan' | 'khusus'
  file_url: string | null
  data_json: LaporanDataJson
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

export interface LaporanFormData {
  judul: string
  deskripsi: string
  tipe: string
  file_url?: string
  data_json?: LaporanDataJson
}