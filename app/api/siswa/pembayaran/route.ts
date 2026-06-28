// app/api/siswa/pembayaran/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createNotification, notifyAllAdmins, NotifTemplate } from '@/lib/notifications'

// ── GET: Ambil semua pembayaran milik siswa ───────────────────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('pembayaran')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/siswa/pembayaran]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (err) {
    console.error('[GET /api/siswa/pembayaran] Unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST: Buat data pembayaran baru (siswa submit) ────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const supabase = getSupabaseAdmin()

    const namaSiswa: string = body.nama_siswa ?? session.user.name ?? 'Siswa'
    const jenisPembayaran: string = body.jenis_pembayaran ?? 'Lainnya'
    const nominal: number = Number(body.nominal ?? 0)

    const payload = {
      user_id:           session.user.id,
      nama_siswa:        namaSiswa,
      nominal,
      jenis_pembayaran:  jenisPembayaran,
      metode_pembayaran: body.metode_pembayaran ?? null,
      no_referensi:      body.no_referensi ?? null,
      bukti_url:         body.bukti_url ?? null,
      status:            'menunggu' as const,
      catatan:           body.catatan ?? null,
      tanggal_bayar:     body.tanggal_bayar ?? new Date().toISOString(),
      pendaftaran_id:    body.pendaftaran_id ?? null,
    }

    const { data, error } = await supabase
      .from('pembayaran')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('[POST /api/siswa/pembayaran]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ── Notifikasi ──────────────────────────────────────────────────────────
    // Siswa: konfirmasi pembayaran terkirim
    await createNotification({
      userId: session.user.id,
      title:  'Bukti Pembayaran Dikirim ✅',
      message: `Bukti pembayaran ${jenisPembayaran} sebesar Rp ${nominal.toLocaleString('id-ID')} berhasil dikirim dan menunggu konfirmasi admin.`,
      type:   'success',
    })

    // Admin: ada pembayaran baru masuk
    await notifyAllAdmins(NotifTemplate.pembayaranBaru(namaSiswa, jenisPembayaran, nominal))

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/siswa/pembayaran] Unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PUT: Update data pembayaran (contoh: re-upload bukti) ─────────────────────
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: 'ID pembayaran diperlukan' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Pastikan pembayaran milik user ini
    const { data: existing, error: fetchErr } = await supabase
      .from('pembayaran')
      .select('id, user_id, status, jenis_pembayaran, nama_siswa, nominal')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Data pembayaran tidak ditemukan' }, { status: 404 })
    }
    if (existing.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (existing.status === 'dikonfirmasi') {
      return NextResponse.json({ error: 'Pembayaran sudah dikonfirmasi, tidak dapat diubah' }, { status: 422 })
    }

    const { data, error } = await supabase
      .from('pembayaran')
      .update({ ...rest, status: 'menunggu', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PUT /api/siswa/pembayaran]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Notif admin: bukti diperbarui
    await notifyAllAdmins({
      title:   'Bukti Pembayaran Diperbarui 🔄',
      message: `${existing.nama_siswa} memperbarui bukti pembayaran ${existing.jenis_pembayaran}. Mohon periksa kembali.`,
      type:    'info',
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PUT /api/siswa/pembayaran] Unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}