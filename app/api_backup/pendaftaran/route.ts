// app/api/pendaftaran/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// ── GET: ambil data pendaftaran milik user yang login ─────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = row not found (bukan error, hanya belum ada data)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? null })
}

// ── POST: insert pendaftaran baru ─────────────────────────────────────────
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // Pastikan user_id selalu dari session (tidak bisa dimanipulasi client)
  const payload = {
    ...body,
    user_id:    session.user.id,
    status:     'menunggu',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// ── PUT: update pendaftaran yang sudah ada (hanya jika status masih 'menunggu') ──
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...rest } = body

  if (!id) {
    return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })
  }

  // Verifikasi data milik user ini & masih bisa diedit
  const { data: existing } = await supabaseAdmin
    .from('pendaftaran')
    .select('user_id, status')
    .eq('id', id)
    .single()

  if (!existing || existing.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (existing.status !== 'menunggu') {
    return NextResponse.json({ error: 'Tidak dapat diedit setelah diproses' }, { status: 400 })
  }

  const payload = {
    ...rest,
    user_id:    session.user.id,  // tetap gunakan dari session
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}