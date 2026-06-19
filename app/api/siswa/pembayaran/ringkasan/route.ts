// app/api/siswa/pembayaran/ringkasan/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

/**
 * GET /api/siswa/pembayaran/ringkasan
 *
 * Ringkasan pembayaran untuk:
 * 1. Widget "Pembayaran" di Beranda Santri (DashboardClient.tsx)
 * 2. Halaman /siswa/pembayaran/page.tsx
 *
 * Mapping status DB → status UI:
 *   - 'dikonfirmasi'         → 'lunas'
 *   - 'menunggu' | 'ditolak' → 'belum_lunas'
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('pembayaran')
      .select('id, jenis_pembayaran, nominal, status, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const rows = data ?? []

    const items = rows.map((row) => ({
      id: row.id,
      judul: row.jenis_pembayaran,
      jumlah: row.nominal,
      status: row.status === 'dikonfirmasi' ? 'lunas' : 'belum_lunas',
    }))

    // Total tagihan yang BELUM lunas
    const total = items
      .filter((item) => item.status !== 'lunas')
      .reduce((sum, item) => sum + (item.jumlah ?? 0), 0)

    return NextResponse.json({ data: { total, items } })
  } catch (error) {
    console.error('[GET /api/siswa/pembayaran/ringkasan]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}