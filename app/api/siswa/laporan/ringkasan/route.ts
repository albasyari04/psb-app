// app/api/siswa/laporan/ringkasan/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

/**
 * Ringkasan laporan untuk widget "Laporan Terbaru" di Beranda Santri.
 * 
 * Hanya menampilkan laporan yang ditujukan untuk siswa yang sedang login.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // ✅ FIX: Filter berdasarkan user_id yang login
    const { data, error } = await supabase
      .from('laporan')
      .select('id, judul, tipe, deskripsi, file_url, created_at')
      .eq('user_id', session.user.id)  // ← INI YANG DITAMBAHKAN
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) throw error

    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    console.error('[GET /api/siswa/laporan/ringkasan]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}