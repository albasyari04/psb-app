// app/api/siswa/jadwal/route.ts
// API publik untuk halaman siswa — hanya butuh session login (bukan admin)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    // Cukup cek login saja, tidak perlu role admin
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    // Halaman daftar lengkap (/siswa/jadwal) bisa memanggil
    // /api/siswa/jadwal?all=1 untuk tetap mendapat SEMUA jadwal seperti semula.
    const showAll = searchParams.get('all') === '1'

    let query = supabase.from('jadwal').select('*')

    if (showAll) {
      query = query.order('urutan', { ascending: true })
    } else {
      // FIX: default untuk widget "Jadwal Terdekat" di Beranda Santri.
      // Sebelumnya diurutkan berdasarkan `urutan` (urutan dibuat) saja,
      // sehingga jadwal BARU yang dibuat admin bisa tidak pernah muncul
      // di Beranda kalau sudah ada >5 jadwal lama (kepotong oleh slice(0,5)
      // di DashboardClient.tsx). Sekarang:
      //  - jadwal berstatus 'Selesai' disembunyikan dari widget Beranda
      //  - diurutkan dari tanggal TERDEKAT, bukan dari kapan dibuat
      // sehingga jadwal baru otomatis tampil sesuai relevansi tanggalnya.
      query = query
        .neq('status', 'Selesai')
        .order('tanggal', { ascending: true })
        .order('urutan', { ascending: true })
        .limit(10)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching jadwal (siswa):', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}