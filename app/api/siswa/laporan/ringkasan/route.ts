// app/api/siswa/laporan/ringkasan/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

/**
 * Ringkasan laporan untuk widget "Laporan Terbaru" di Beranda Santri.
 *
 * Mengambil beberapa laporan TERBARU yang dibuat admin lewat
 * /api/admin/laporan (POST). Karena diurutkan by created_at desc,
 * laporan baru yang dibuat admin otomatis tampil di sini -- tidak perlu
 * ada perubahan apa pun di sisi admin.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('laporan')
      .select('id, judul, tipe, deskripsi, file_url, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) throw error

    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    console.error('[GET /api/siswa/laporan/ringkasan]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}