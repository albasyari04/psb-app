// app/api/pendaftaran/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { createNotification, notifyAllAdmins, NotifTemplate } from '@/lib/notifications'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await getSupabaseAdmin()
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const { data: existing } = await getSupabaseAdmin()
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

    const namaLengkap: string = body.nama_lengkap ?? session.user.name ?? 'Siswa'

    const payload = {
      user_id:          session.user.id,
      nama_lengkap:     namaLengkap,
      nik:              body.nik,
      nisn:             body.nisn,
      tempat_lahir:     body.tempat_lahir,
      tanggal_lahir:    body.tanggal_lahir,
      jenis_kelamin:    body.jenis_kelamin,
      agama:            body.agama,
      alamat:           body.alamat,
      alamat_kota:      body.alamat_kota,
      alamat_kecamatan: body.alamat_kecamatan,
      alamat_rt_rw:     body.alamat_rt_rw,
      no_hp:            body.no_hp,
      asal_sekolah:     body.asal_sekolah,
      npsn:             body.npsn,
      nama_ayah:        body.nama_ayah,
      nama_ibu:         body.nama_ibu,
      pekerjaan_ayah:   body.pekerjaan_ayah,
      pekerjaan_ibu:    body.pekerjaan_ibu,
      no_hp_ortu:       body.no_hp_ortu,
      status:           'menunggu',
    }

    const { data, error } = await getSupabaseAdmin()
      .from('pendaftaran')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('[POST /api/pendaftaran] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ── Kirim notifikasi setelah pendaftaran berhasil tersimpan ──────────────
    // Notif ke siswa: konfirmasi pendaftaran berhasil
    await createNotification({
      userId: session.user.id,
      ...NotifTemplate.pendaftaranDiterima(namaLengkap),
    })

    // Notif ke semua admin: ada pendaftar baru
    await notifyAllAdmins(NotifTemplate.pendaftarBaru(namaLengkap))

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/pendaftaran] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const admin = getSupabaseAdmin()

    const { data: existing, error: fetchErr } = await admin
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
      nama_lengkap:     rest.nama_lengkap,
      nik:              rest.nik,
      nisn:             rest.nisn,
      tempat_lahir:     rest.tempat_lahir,
      tanggal_lahir:    rest.tanggal_lahir,
      jenis_kelamin:    rest.jenis_kelamin,
      agama:            rest.agama,
      alamat:           rest.alamat,
      alamat_kota:      rest.alamat_kota,
      alamat_kecamatan: rest.alamat_kecamatan,
      alamat_rt_rw:     rest.alamat_rt_rw,
      no_hp:            rest.no_hp,
      asal_sekolah:     rest.asal_sekolah,
      npsn:             rest.npsn,
      nama_ayah:        rest.nama_ayah,
      nama_ibu:         rest.nama_ibu,
      pekerjaan_ayah:   rest.pekerjaan_ayah,
      pekerjaan_ibu:    rest.pekerjaan_ibu,
      no_hp_ortu:       rest.no_hp_ortu,
      updated_at:       new Date().toISOString(),
    }

    const { data, error } = await admin
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