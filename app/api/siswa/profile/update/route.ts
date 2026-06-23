// app/api/siswa/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check ──────────────────────────────────────────────────────
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 2. Validasi body ────────────────────────────────────────────────────
    const body = await req.json()
    const { name } = body as { name?: string }

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 })
    }
    if (name.trim().length < 3) {
      return NextResponse.json({ error: 'Nama minimal 3 karakter' }, { status: 400 })
    }

    // ── 3. Update tabel profiles (berdasarkan id, bukan email) ─────────────
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ name: name.trim() })
      .eq('id', session.user.id)

    if (error) {
      console.error('[profile:update] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: unknown) {
    console.error('[profile:update] Unhandled error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}