// app/api/admin/pembayaran/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createNotification, NotifTemplate } from '@/lib/notifications'

// ── PATCH: Admin konfirmasi atau tolak pembayaran ─────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(req: NextRequest, context: any) {
  const { id } = context.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

// ── GET: Detail 1 pembayaran (admin) ─────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(_req: NextRequest, context: any) {
  const { id } = context.params;
  try {
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