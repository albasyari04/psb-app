// app/api/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  // 1. Cek session
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  const body = await req.json() as { name?: string; avatar_url?: string }
  const { name, avatar_url } = body

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 })
  }
  if (name.trim().length > 50) {
    return NextResponse.json({ error: 'Nama terlalu panjang (maks 50 karakter)' }, { status: 400 })
  }

  // 3. Build update payload
  const updatePayload: Record<string, string> = {
    name:       name.trim(),
    updated_at: new Date().toISOString(),
  }
  if (avatar_url) {
    updatePayload.avatar_url = avatar_url
  }

  // 4. Update tabel profiles di Supabase
  const { error } = await supabaseAdmin
    .from('profiles')
    .update(updatePayload)
    .eq('id', session.user.id)

  if (error) {
    console.error('Profile update error:', error.message)
    return NextResponse.json({ error: 'Gagal menyimpan profil' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}