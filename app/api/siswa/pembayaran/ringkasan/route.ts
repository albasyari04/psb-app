// app/api/siswa/pembayaran/ringkasan/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

/**
 * Ringkasan pembayaran untuk widget "Pembayaran" di Beranda Santri.
 *
 * Sumber data: tabel `pembayaran` (lihat types/database.types.ts).
 * Tabel ini PUNYA kolom: id, user_id, nama_siswa, nominal,
 * jenis_pembayaran, status ('menunggu' | 'dikonfirmasi' | 'ditolak'), dll.
 * (Bukan `tagihan` dengan kolom `judul`/`jumlah` seperti sebelumnya.)
 *
 * Mapping status DB → status UI widget Beranda:
 *   - 'dikonfirmasi'            → 'lunas'
 *   - 'menunggu' | 'ditolak'    → 'belum_lunas'
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

    // Map ke bentuk yang dipakai widget Pembayaran di Beranda Santri
    // (interface PembayaranItem: { id, judul, jumlah, status }).
    const items = rows.map((row) => ({
      id: row.id,
      judul: row.jenis_pembayaran,
      jumlah: row.nominal,
      status: row.status === 'dikonfirmasi' ? 'lunas' : 'belum_lunas',
    }))

    // Total tagihan yang BELUM lunas (belum dikonfirmasi admin)
    const total = items
      .filter((item) => item.status !== 'lunas')
      .reduce((sum, item) => sum + (item.jumlah ?? 0), 0)

    return NextResponse.json({ data: { total, items } })
  } catch (error) {
    console.error('[GET /api/siswa/pembayaran/ringkasan]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}