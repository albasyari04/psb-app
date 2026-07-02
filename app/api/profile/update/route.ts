// app/api/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { supabaseAdmin }             from '@/lib/supabase'

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

    // ── 2. Parse body ────────────────────────────────────────────────────
    // ✅ FIX UTAMA: sebelumnya route ini kemungkinan memanggil req.formData(),
    // padahal client (app/admin/profile/edit/page.tsx) mengirim:
    //   headers: { 'Content-Type': 'application/json' }
    //   body: JSON.stringify({ name, avatar_url })
    // req.formData() akan throw "Content-Type was not one of 'multipart/
    // form-data' or 'application/x-www-form-urlencoded'" kalau Content-Type
    // request bukan salah satu dari itu — persis pesan error yang muncul di
    // UI. Solusinya: baca body sebagai JSON, bukan FormData.
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
    const { error: dbError } = await supabaseAdmin
      .from('admin')
      .update(updateData)
      .eq('email', session.user.email)

    if (dbError) {
      console.error('[profile/update] DB update error:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (err: unknown) {
    console.error('[profile/update] Unhandled error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}