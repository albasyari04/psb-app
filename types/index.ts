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
  nama_lengkap: string
  nis: string
  nisn: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: 'L' | 'P'
  agama: string
  alamat: string
  no_hp: string
  asal_sekolah: string
  jurusan_pilihan: string
  nilai_rata_rata: number
  foto_url?: string
  berkas_url?: string
  status: 'menunggu' | 'diproses' | 'diterima' | 'ditolak'
  catatan_admin?: string
  created_at: string
  updated_at: string
}

export interface Session {
  user: User
  expires: string
}

// ── BARU: Notification ────────────────────────────────────────────────────────
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info'
  is_read: boolean
  created_at: string
}