// app/api/admin/laporan/route.ts  (CONTOH INTEGRASI NOTIF — sesuaikan dengan route laporan kamu)
// ─────────────────────────────────────────────────────────────────────────────
// Perubahan dari versi sebelumnya ditandai: // ✅ NOTIF
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse }      from 'next/server'
import { getServerSession }               from 'next-auth'
import { authOptions }                    from '@/lib/auth'
import { getSupabaseAdmin }               from '@/lib/supabase'
import { createNotificationBulk }         from '@/lib/createNotification'  // ✅ NOTIF

/* ── POST: Admin menerbitkan laporan baru ─────────────────────────────────── */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.judul) {
    return NextResponse.json({ error: 'Judul laporan wajib diisi' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Simpan laporan
  const { data: laporan, error: laporanErr } = await supabase
    .from('laporan')
    .insert({
      judul      : body.judul,
      deskripsi  : body.deskripsi  ?? null,
      tipe       : body.tipe       ?? 'khusus',
      file_url   : body.file_url   ?? null,
      data_json  : body.data_json  ?? null,
      created_by : session.user.id,
    })
    .select('*')
    .single()

  if (laporanErr || !laporan) {
    console.error('Gagal membuat laporan:', laporanErr)
    return NextResponse.json({ error: 'Gagal membuat laporan' }, { status: 500 })
  }

  // ✅ NOTIF: kirim notifikasi ke semua siswa yang punya profil
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'siswa')

  const siswaIds = (profiles ?? []).map(p => p.id)

  if (siswaIds.length > 0) {
    await createNotificationBulk(siswaIds, {
      title  : 'Laporan Baru Tersedia',
      message: `Admin menerbitkan laporan baru: "${body.judul}"`,
      type   : 'laporan',
    })
  }

  return NextResponse.json({ data: laporan }, { status: 201 })
}

/* ── GET: Ambil daftar laporan ───────────────────────────────────────────── */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('laporan')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}