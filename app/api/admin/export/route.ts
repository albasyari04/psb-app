// app/api/admin/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const tipe = searchParams.get('tipe') // 'pendaftar' | 'verifikasi' | 'pembayaran'

    if (tipe === 'pendaftar') {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select(
          'nama_lengkap, nisn, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, ' +
          'asal_sekolah, jurusan_pilihan, no_hp, email, status, created_at'
        )
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ data: data ?? [] })
    }

    if (tipe === 'verifikasi') {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select(
          'nama_lengkap, nisn, asal_sekolah, jurusan_pilihan, ' +
          'status, catatan_admin, created_at, updated_at'
        )
        .order('updated_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ data: data ?? [] })
    }

    if (tipe === 'pembayaran') {
      const { data, error } = await supabase
        .from('pembayaran')
        .select(
          'nama_siswa, jenis_pembayaran, metode_pembayaran, ' +
          'nominal, no_referensi, status, tanggal_bayar, catatan, created_at'
        )
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ data: data ?? [] })
    }

    return NextResponse.json({ error: 'Tipe tidak valid' }, { status: 400 })
  } catch (err) {
    console.error('[GET /api/admin/export]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}