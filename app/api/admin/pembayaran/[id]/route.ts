// app/api/admin/pembayaran/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createNotification, NotifTemplate } from '@/lib/notifications'

// ✅ FIX: Di Next.js 15, `params` pada route handler dinamis ([id]) adalah
// Promise<{ id: string }>, bukan object biasa lagi. Sebelumnya kode melakukan
// `const { id } = context.params` (tanpa await), sehingga `id` selalu undefined
// karena yang di-destructure adalah Promise itu sendiri, bukan isinya.
// Itu sebabnya server selalu balas "Parameter ID tidak ditemukan" / 400,
// padahal id-nya jelas ada di URL. Solusi: await context.params dulu.
type RouteContext = { params: Promise<{ id: string }> }

// ── PATCH: Admin konfirmasi atau tolak pembayaran ─────────────────────────────
export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Parameter ID tidak ditemukan' }, { status: 400 })
    }

    const body = await req.json()
    const aksi: 'dikonfirmasi' | 'ditolak' = body.aksi
    const catatan: string | null = body.catatan ?? null

    if (!['dikonfirmasi', 'ditolak'].includes(aksi)) {
      return NextResponse.json({ error: 'Aksi tidak valid. Gunakan: dikonfirmasi | ditolak' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Ambil data pembayaran untuk notifikasi
    const { data: pembayaran, error: fetchErr } = await supabase
      .from('pembayaran')
      .select('id, user_id, jenis_pembayaran, nominal, nama_siswa, status')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !pembayaran) {
      return NextResponse.json({ error: 'Pembayaran tidak ditemukan' }, { status: 404 })
    }

    if (pembayaran.status === 'dikonfirmasi') {
      return NextResponse.json({ error: 'Pembayaran sudah dikonfirmasi sebelumnya' }, { status: 422 })
    }

    // Update status pembayaran
    const { data, error } = await supabase
      .from('pembayaran')
      .update({
        status:       aksi,
        catatan:      catatan,
        confirmed_by: aksi === 'dikonfirmasi' ? session.user.id : null,
        confirmed_at: aksi === 'dikonfirmasi' ? new Date().toISOString() : null,
        updated_at:   new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PATCH /api/admin/pembayaran/[id]]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ── Notifikasi ke SISWA ──────────────────────────────────────────────────
    if (aksi === 'dikonfirmasi') {
      await createNotification({
        userId: pembayaran.user_id,
        ...NotifTemplate.pembayaranDikonfirmasi(
          pembayaran.jenis_pembayaran,
          pembayaran.nominal
        ),
      })
    } else {
      await createNotification({
        userId: pembayaran.user_id,
        ...NotifTemplate.pembayaranDitolak(pembayaran.jenis_pembayaran, catatan),
      })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PATCH /api/admin/pembayaran/[id]] Unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PUT: Admin update lengkap data pembayaran (dari halaman Edit) ────────────
export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Parameter ID tidak ditemukan' }, { status: 400 })
    }

    const body = await req.json()
    const {
      user_id,
      nama_siswa,
      nominal,
      jenis_pembayaran,
      metode_pembayaran,
      no_referensi,
      status,
      catatan,
      tanggal_bayar,
    } = body

    if (!user_id || !nama_siswa || !nominal) {
      return NextResponse.json({ error: 'User ID, nama siswa, dan nominal wajib diisi.' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Pastikan data ada
    const { data: existing, error: fetchErr } = await supabase
      .from('pembayaran')
      .select('id, status')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Pembayaran tidak ditemukan' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('pembayaran')
      .update({
        user_id,
        nama_siswa,
        nominal: Number(nominal),
        jenis_pembayaran,
        metode_pembayaran,
        no_referensi: no_referensi ?? null,
        status,
        catatan: catatan ?? null,
        tanggal_bayar: tanggal_bayar || null,
        confirmed_by: status === 'dikonfirmasi' ? session.user.id : null,
        confirmed_at: status === 'dikonfirmasi' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PUT /api/admin/pembayaran/[id]]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ── Notifikasi ke SISWA jika status berubah jadi dikonfirmasi/ditolak ───
    if (existing.status !== 'dikonfirmasi' && status === 'dikonfirmasi') {
      await createNotification({
        userId: user_id,
        ...NotifTemplate.pembayaranDikonfirmasi(jenis_pembayaran, Number(nominal)),
      })
    } else if (existing.status !== 'ditolak' && status === 'ditolak') {
      await createNotification({
        userId: user_id,
        ...NotifTemplate.pembayaranDitolak(jenis_pembayaran, catatan ?? null),
      })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PUT /api/admin/pembayaran/[id]] Unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET: Detail 1 pembayaran (admin) ─────────────────────────────────────────
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    if (!id) {
      return NextResponse.json({ error: 'Parameter ID tidak ditemukan' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('pembayaran')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/admin/pembayaran/[id]] Unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}