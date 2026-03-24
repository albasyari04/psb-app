// app/api/pendaftaran/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// ── GET: Ambil data pendaftaran milik user yang sedang login ──────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('pendaftaran')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (error) {
      console.error('[GET /api/pendaftaran] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/pendaftaran] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST: Buat pendaftaran baru ───────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Cek apakah sudah pernah daftar
    const { data: existing } = await supabaseAdmin
      .from('pendaftaran')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Anda sudah memiliki data pendaftaran. Gunakan metode PUT untuk memperbarui.' },
        { status: 409 }
      )
    }

    const payload = {
      user_id:         session.user.id,
      nama_lengkap:    body.nama_lengkap,
      nis:             body.nis,
      nisn:            body.nisn,
      tempat_lahir:    body.tempat_lahir,
      tanggal_lahir:   body.tanggal_lahir,
      jenis_kelamin:   body.jenis_kelamin,
      agama:           body.agama,
      alamat:          body.alamat,
      no_hp:           body.no_hp,
      asal_sekolah:    body.asal_sekolah,
      jurusan_pilihan: body.jurusan_pilihan,
      nilai_rata_rata: body.nilai_rata_rata,
      status:          'menunggu',
    }

    const { data, error } = await supabaseAdmin
      .from('pendaftaran')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('[POST /api/pendaftaran] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/pendaftaran] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PUT: Update pendaftaran (hanya jika status masih 'menunggu') ──────────────
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: 'ID pendaftaran diperlukan' }, { status: 400 })
    }

    // Pastikan data milik user ini dan statusnya masih 'menunggu'
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('pendaftaran')
      .select('id, user_id, status')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Data pendaftaran tidak ditemukan' }, { status: 404 })
    }

    if (existing.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (existing.status !== 'menunggu') {
      return NextResponse.json(
        { error: `Pendaftaran tidak dapat diubah karena status sudah '${existing.status}'` },
        { status: 422 }
      )
    }

    const payload = {
      nama_lengkap:    rest.nama_lengkap,
      nis:             rest.nis,
      nisn:            rest.nisn,
      tempat_lahir:    rest.tempat_lahir,
      tanggal_lahir:   rest.tanggal_lahir,
      jenis_kelamin:   rest.jenis_kelamin,
      agama:           rest.agama,
      alamat:          rest.alamat,
      no_hp:           rest.no_hp,
      asal_sekolah:    rest.asal_sekolah,
      jurusan_pilihan: rest.jurusan_pilihan,
      nilai_rata_rata: rest.nilai_rata_rata,
      updated_at:      new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('pendaftaran')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PUT /api/pendaftaran] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PUT /api/pendaftaran] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}