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
  no_hp: string | null
  email: string | null
  asal_sekolah: string | null
  npsn: string | null
  jurusan_pilihan: string | null
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