// app/api/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { supabaseAdmin }             from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface UpdateBody {
  name?: string
  avatar_url?: string
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check (via email, konsisten dgn route lain) ────────────────
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ FIX: normalize email (lowercase + trim). Kalau email di tabel `admin`
    // tersimpan dengan kapitalisasi berbeda dari session.user.email (misal
    // dari provider OAuth), .eq('email', session.user.email) akan cocok
    // dengan 0 baris — dan Supabase TIDAK menganggap itu error.
    const sessionEmail = session.user.email.trim().toLowerCase()

    // ── 2. Parse body ────────────────────────────────────────────────────
    let body: UpdateBody
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Body request harus JSON valid' }, { status: 400 })
    }

    const name = body.name?.trim()
    if (!name) {
      return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 })
    }
    if (name.length > 80) {
      return NextResponse.json({ error: 'Nama maksimal 80 karakter' }, { status: 400 })
    }

    // ── 3. Susun payload update ─────────────────────────────────────────────
    const updateData: { name: string; avatar_url?: string } = { name }
    if (body.avatar_url) updateData.avatar_url = body.avatar_url

    // ── 4. Update tabel `admin` berdasarkan email ───────────────────────────
    // ✅ FIX UTAMA: sebelumnya `.update().eq('email', ...)` TANPA `.select()`.
    // Supabase-js hanya melempar `error` kalau ada masalah koneksi/permission
    // (misal RLS), BUKAN kalau kondisi `.eq()` cocok dengan 0 baris. Jadi
    // sebelum ini, kalau email tidak match, API tetap balas `success: true`
    // padahal tidak ada apa pun yang berubah di database — persis gejala
    // "sudah disimpan tapi tetap sama" yang dilaporkan.
    //
    // Dengan menambahkan `.select()`, kita dapat array baris yang benar-benar
    // ter-update. Kalau array-nya kosong, berarti email tidak cocok dengan
    // baris manapun di tabel `admin` → kita balas error yang jelas, bukan
    // pura-pura sukses. `ilike` dipakai (bukan `eq`) supaya matching email
    // tidak sensitif huruf besar/kecil.
    const { data: updatedRows, error: dbError } = await supabaseAdmin
      .from('admin')
      .update(updateData)
      .ilike('email', sessionEmail)
      .select('email, name, avatar_url')

    if (dbError) {
      console.error('[profile/update] DB update error:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    if (!updatedRows || updatedRows.length === 0) {
      // Ini kasus utama yang sebelumnya "silent fail". Sekarang kita
      // laporkan dengan jelas ke frontend + log server supaya langsung
      // ketahuan akar masalahnya (mismatch email antara session & tabel admin).
      console.error(
        '[profile/update] 0 baris ter-update. session email:',
        sessionEmail,
        '— cek apakah email ini benar-benar ada persis di tabel `admin`.'
      )
      return NextResponse.json(
        {
          error:
            `Tidak ada data admin yang cocok dengan email "${sessionEmail}". ` +
            `Cek kembali apakah kolom "email" di tabel admin persis sama ` +
            `(tanpa spasi/beda kapitalisasi) dengan email akun ini.`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, profile: updatedRows[0] }, { status: 200 })

  } catch (err: unknown) {
    console.error('[profile/update] Unhandled error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}