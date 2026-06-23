// app/api/admin/pembayaran/route.ts
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { createNotification, formatRupiah } from '@/lib/notifications'

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

    // ── Notifikasi: tagihan/pembayaran baru ditambahkan admin ──────────────
    await createNotification({
      userId:  user_id,
      title:   '💳 Tagihan Pembayaran Baru',
      message: `Tagihan ${jenis_pembayaran} sebesar ${formatRupiah(Number(nominal))} telah ditambahkan. Silakan lakukan pembayaran sesuai instruksi.`,
      type:    'info',
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/pembayaran error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat data pembayaran' },
      { status: 500 }
    )
  }
}

// ── PATCH: Konfirmasi / tolak pembayaran + kirim notifikasi ────────────────────
// Body: { id, status: 'dikonfirmasi' | 'ditolak', catatan? }
export async function PATCH(request: NextRequest) {
  const supabase = getSupabaseAdmin()

  try {
    const body = await request.json()
    const { id, status, catatan } = body as {
      id: string
      status: 'menunggu' | 'dikonfirmasi' | 'ditolak'
      catatan?: string
    }

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Field id dan status wajib diisi' },
        { status: 400 }
      )
    }

    // 1. Ambil data pembayaran dulu untuk dapat user_id, nominal, jenis
    const { data: existing, error: fetchErr } = await supabase
      .from('pembayaran')
      .select('user_id, nama_siswa, nominal, jenis_pembayaran')
      .eq('id', id)
      .single()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Data pembayaran tidak ditemukan' }, { status: 404 })
    }

    // 2. Update status pembayaran
    const now = new Date().toISOString()
    const { data, error: updateErr } = await supabase
      .from('pembayaran')
      .update({
        status,
        catatan: catatan ?? null,
        confirmed_at: status === 'dikonfirmasi' ? now : null,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      console.error('PATCH /api/admin/pembayaran error:', updateErr)
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // 3. Kirim notifikasi sesuai status
    const nominalFormatted = formatRupiah(Number(existing.nominal))

    if (status === 'dikonfirmasi') {
      await createNotification({
        userId:  existing.user_id,
        title:   '✅ Pembayaran Dikonfirmasi',
        message: `Pembayaran ${existing.jenis_pembayaran} sebesar ${nominalFormatted} telah dikonfirmasi oleh admin. Terima kasih!`,
        type:    'success',
      })
    } else if (status === 'ditolak') {
      await createNotification({
        userId:  existing.user_id,
        title:   '⚠️ Pembayaran Ditolak',
        message: `Pembayaran ${existing.jenis_pembayaran} sebesar ${nominalFormatted} ditolak. ${catatan ? `Catatan: ${catatan}` : 'Silakan periksa kembali bukti pembayaran Anda.'}`,
        type:    'error',
      })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('PATCH /api/admin/pembayaran unexpected error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui status pembayaran' },
      { status: 500 }
    )
  }
}