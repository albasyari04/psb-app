import { getSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  try {
    let query = supabase
      .from('pembayaran')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'semua') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.ilike('nama_siswa', `%${search}%`)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/pembayaran error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pembayaran' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin()

  try {
    const body = await request.json()
    const {
      user_id,
      nama_siswa,
      nominal,
      jenis_pembayaran,
      metode_pembayaran,
      no_referensi,
      bukti_url,
      status = 'menunggu',
      catatan,
      tanggal_bayar,
    } = body

    // FIX: Validasi nominal pakai === null/undefined, bukan !nominal
    // karena nominal 0 adalah nilai valid (admin yang akan mengisi nominal sebenarnya)
    if (
      !user_id ||
      !nama_siswa ||
      nominal === undefined ||
      nominal === null ||
      !jenis_pembayaran
    ) {
      return NextResponse.json(
        { error: 'Field user_id, nama_siswa, nominal, dan jenis_pembayaran wajib diisi' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pembayaran')
      .insert({
        user_id,
        nama_siswa,
        nominal: Number(nominal),
        jenis_pembayaran,
        metode_pembayaran: metode_pembayaran || null,
        no_referensi:      no_referensi      || null,
        bukti_url:         bukti_url         || null,  // FIX: simpan bukti_url
        status,
        catatan:           catatan           || null,
        tanggal_bayar:     tanggal_bayar     || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/pembayaran error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat data pembayaran' },
      { status: 500 }
    )
  }
}