// app/api/admin/pendaftar/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createNotification, NotifTemplate } from '@/lib/notifications'

// ── GET: Detail 1 pendaftar ───────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('pendaftaran')
      .select('*, siswa_berkas(*), pembayaran(*)')
      .eq('id', params.id)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/admin/pendaftar/[id]] Unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PATCH: Admin terima atau tolak pendaftar ──────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const aksi: 'diterima' | 'ditolak' = body.aksi
    const catatan: string | null = body.catatan ?? null

    if (!['diterima', 'ditolak'].includes(aksi)) {
      return NextResponse.json({ error: 'Aksi tidak valid. Gunakan: diterima | ditolak' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Ambil data pendaftar untuk notifikasi
    const { data: pendaftar, error: fetchErr } = await supabase
      .from('pendaftaran')
      .select('id, user_id, nama_lengkap, status')
      .eq('id', params.id)
      .maybeSingle()

    if (fetchErr || !pendaftar) {
      return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })
    }

    // Update status pendaftaran
    const { data, error } = await supabase
      .from('pendaftaran')
      .update({
        status:        aksi === 'diterima' ? 'diterima' : 'ditolak',
        catatan_admin: catatan,
        updated_at:    new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[PATCH /api/admin/pendaftar/[id]]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ── Notifikasi ke SISWA ──────────────────────────────────────────────────
    const namaLengkap = pendaftar.nama_lengkap ?? 'Siswa'

    if (aksi === 'diterima') {
      await createNotification({
        userId: pendaftar.user_id,
        ...NotifTemplate.pendaftaranDiterimаAdmin(namaLengkap),
      })
    } else {
      await createNotification({
        userId: pendaftar.user_id,
        ...NotifTemplate.pendaftaranDitolak(namaLengkap, catatan),
      })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PATCH /api/admin/pendaftar/[id]] Unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}