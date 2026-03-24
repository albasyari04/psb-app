// app/api/admin/pendaftaran/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// ── GET: Ambil semua pendaftaran (opsional filter by id atau status) ──────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id     = searchParams.get('id')
  const status = searchParams.get('status')

  // ── Fetch detail by id ──────────────────────────────────────────────────────
  if (id) {
    const { data, error } = await supabaseAdmin
      .from('pendaftaran')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  // ── Fetch semua (dengan opsional filter status) ─────────────────────────────
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  // ✅ Select hanya kolom yang perlu
  let query = supabaseAdmin
    .from('pendaftaran')
    .select('id, nama_lengkap, nisn, asal_sekolah, jurusan_pilihan, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'semua') {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ 
    data: data ?? [],
    total: count || 0,
    page,
    limit,
  })
}

// ── PATCH: Update status + kirim notifikasi ke siswa ─────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, status, catatan_admin } = body as {
    id: string
    status: 'menunggu' | 'diproses' | 'diterima' | 'ditolak'
    catatan_admin?: string
  }

  if (!id || !status) {
    return NextResponse.json({ error: 'ID dan status diperlukan' }, { status: 400 })
  }

  // 1. Ambil data pendaftaran dulu (untuk user_id & nama)
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from('pendaftaran')
    .select('user_id, nama_lengkap, jurusan_pilihan')
    .eq('id', id)
    .single()

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
  }

  // 2. Update status pendaftaran
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (supabaseAdmin.from('pendaftaran') as any)
    .update({
      status,
      catatan_admin: catatan_admin ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // 3. Buat pesan notifikasi berdasarkan status
  const notifMap: Record<string, { title: string; message: string; type: 'success' | 'error' | 'info' }> = {
    diproses: {
      title: '🔍 Berkas Sedang Diverifikasi',
      message: `Halo ${existing.nama_lengkap}, berkas pendaftaran kamu sedang dalam proses verifikasi oleh panitia. Pantau terus status pendaftaranmu.`,
      type: 'info',
    },
    diterima: {
      title: '🎉 Selamat! Pendaftaran Diterima',
      message: `Selamat ${existing.nama_lengkap}! Kamu resmi diterima di jurusan ${existing.jurusan_pilihan}. ${catatan_admin ? `Catatan: ${catatan_admin}` : ''}`,
      type: 'success',
    },
    ditolak: {
      title: '❌ Pendaftaran Tidak Diterima',
      message: `Maaf ${existing.nama_lengkap}, pendaftaranmu tidak lolos seleksi. ${catatan_admin ? `Catatan panitia: ${catatan_admin}` : 'Semangat dan terus berusaha!'}`,
      type: 'error',
    },
  }

  // 4. Insert notifikasi (hanya untuk status yang relevan)
  const notifData = notifMap[status]
  if (notifData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: notifErr } = await (supabaseAdmin.from('notifications') as any)
      .insert({
        user_id: existing.user_id,
        title:   notifData.title,
        message: notifData.message,
        type:    notifData.type,
        is_read: false,
      })

    if (notifErr) {
      // Log error tapi jangan gagalkan seluruh request
      console.error('[API] Gagal insert notifikasi:', notifErr.message)
    }
  }

  return NextResponse.json({ success: true })
}