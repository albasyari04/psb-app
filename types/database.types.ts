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
        Insert: {
          id?: string
          user_id: string
          nama_lengkap?: string | null
          nisn?: string | null
          nik?: string | null
          tempat_lahir?: string | null
          tanggal_lahir?: string | null
          jenis_kelamin?: string | null
          agama?: string | null
          alamat?: string | null
          no_hp?: string | null
          email?: string | null
          asal_sekolah?: string | null
          npsn?: string | null
          jurusan_pilihan?: string | null
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
          nisn?: string | null
          nik?: string | null
          tempat_lahir?: string | null
          tanggal_lahir?: string | null
          jenis_kelamin?: string | null
          agama?: string | null
          alamat?: string | null
          no_hp?: string | null
          email?: string | null
          asal_sekolah?: string | null
          npsn?: string | null
          jurusan_pilihan?: string | null
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