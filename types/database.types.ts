// types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin: {
        Row: {
          id: string
          email: string
          password: string
          nama: string | null
          name: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          email: string
          password: string
          nama?: string | null
          name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          password?: string
          nama?: string | null
          name?: string | null
          avatar_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: string
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          avatar_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          judul: string
          tipe: 'Penting' | 'Informasi' | 'Info' | 'Peringatan'
          konten: string
          tanggal: string
          lampiran_url: string | null
          lampiran_nama: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          judul: string
          tipe: 'Penting' | 'Informasi' | 'Info' | 'Peringatan'
          konten: string
          tanggal: string
          lampiran_url?: string | null
          lampiran_nama?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          judul?: string
          tipe?: 'Penting' | 'Informasi' | 'Info' | 'Peringatan'
          konten?: string
          tanggal?: string
          lampiran_url?: string | null
          lampiran_nama?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      siswa_berkas: {
        Row: {
          id: string
          user_id: string
          kk: string | null
          akte_lahir: string | null
          ijazah_smp: string | null
          raport_smp: string | null
          skhun: string | null
          sertifikat: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          kk?: string | null
          akte_lahir?: string | null
          ijazah_smp?: string | null
          raport_smp?: string | null
          skhun?: string | null
          sertifikat?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          kk?: string | null
          akte_lahir?: string | null
          ijazah_smp?: string | null
          raport_smp?: string | null
          skhun?: string | null
          sertifikat?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pendaftaran: {
        Row: {
          id: string
          user_id: string
          nama_lengkap: string | null
          nik: string | null
          nisn: string | null
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
        Insert: {
          id?: string
          user_id: string
          nama_lengkap?: string | null
          nik?: string | null
          nisn?: string | null
          tempat_lahir?: string | null
          tanggal_lahir?: string | null
          jenis_kelamin?: string | null
          agama?: string | null
          alamat?: string | null
          alamat_kota?: string | null
          alamat_kecamatan?: string | null
          alamat_rt_rw?: string | null
          no_hp?: string | null
          asal_sekolah?: string | null
          npsn?: string | null
          nama_ayah?: string | null
          nama_ibu?: string | null
          pekerjaan_ayah?: string | null
          pekerjaan_ibu?: string | null
          no_hp_ortu?: string | null
          status?: string
          catatan_admin?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          nama_lengkap?: string | null
          nik?: string | null
          nisn?: string | null
          tempat_lahir?: string | null
          tanggal_lahir?: string | null
          jenis_kelamin?: string | null
          agama?: string | null
          alamat?: string | null
          alamat_kota?: string | null
          alamat_kecamatan?: string | null
          alamat_rt_rw?: string | null
          no_hp?: string | null
          asal_sekolah?: string | null
          npsn?: string | null
          nama_ayah?: string | null
          nama_ibu?: string | null
          pekerjaan_ayah?: string | null
          pekerjaan_ibu?: string | null
          no_hp_ortu?: string | null
          status?: string
          catatan_admin?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pembayaran: {
        Row: {
          id: string
          user_id: string
          pendaftaran_id: string | null
          nama_siswa: string
          nominal: number
          jenis_pembayaran: string
          metode_pembayaran: string | null
          no_referensi: string | null
          bukti_url: string | null
          status: string
          catatan: string | null
          tanggal_bayar: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          pendaftaran_id?: string | null
          nama_siswa: string
          nominal: number
          jenis_pembayaran: string
          metode_pembayaran?: string | null
          no_referensi?: string | null
          bukti_url?: string | null
          status?: string
          catatan?: string | null
          tanggal_bayar?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          pendaftaran_id?: string | null
          nama_siswa?: string
          nominal?: number
          jenis_pembayaran?: string
          metode_pembayaran?: string | null
          no_referensi?: string | null
          bukti_url?: string | null
          status?: string
          catatan?: string | null
          tanggal_bayar?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      laporan: {
        Row: {
          id: string
          judul: string
          deskripsi: string | null
          tipe: string
          file_url: string | null
          data_json: Json | null
          created_by: string | null
          user_id: string | null  // ← TAMBAHKAN INI
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          judul: string
          deskripsi?: string | null
          tipe?: string
          file_url?: string | null
          data_json?: Json | null
          created_by?: string | null
          user_id?: string | null  // ← TAMBAHKAN INI
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          judul?: string
          deskripsi?: string | null
          tipe?: string
          file_url?: string | null
          data_json?: Json | null
          created_by?: string | null
          user_id?: string | null  // ← TAMBAHKAN INI
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      auth_users_view: {
        Row: {
          id: string
          email: string
          encrypted_password: string | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}