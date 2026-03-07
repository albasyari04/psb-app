// app/api/admin/pendaftaran/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// ── Guard: hanya admin ────────────────────────────────────────────────────
async function guardAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return null
  return session
}

// ── GET /api/admin/pendaftaran?status=xxx  → list semua / filter status ──
export async function GET(req: Request) {
  const session = await guardAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const id     = searchParams.get('id')

  // Ambil satu data by id
  if (id) {
    const { data, error } = await supabaseAdmin
      .from('pendaftaran')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  // Ambil list (opsional filter status)
  let q = supabaseAdmin
    .from('pendaftaran')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'semua') {
    q = q.eq('status', status)
  }

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

// ── PATCH /api/admin/pendaftaran  → update status + catatan_admin ─────────
export async function PATCH(req: Request) {
  const session = await guardAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { id, status, catatan_admin } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'id dan status wajib diisi' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .update({
      status,
      catatan_admin,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update status error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}