// app/api/notifications/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// GET  → ambil notifikasi milik user login (dengan filter unread & limit)
// POST → tandai notifikasi sebagai sudah dibaca (satu / semua)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { getSupabaseAdmin }          from '@/lib/supabase'
import type { Database }             from '@/types/database.types'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

/* ── GET ─────────────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit      = Math.min(Number(searchParams.get('limit') ?? 20), 50)
  const unreadOnly = searchParams.get('unread') === 'true'

  const supabase = getSupabaseAdmin()

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows        = (data ?? []) as NotificationRow[]
  const unreadCount = rows.filter(n => !n.is_read).length

  return NextResponse.json({ data: rows, unreadCount })
}

/* ── POST ────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as {
    id?: string
    markAllRead?: boolean
  }

  const supabase = getSupabaseAdmin()

  // Tandai SEMUA sebagai sudah dibaca
  if (body.markAllRead) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Tandai SATU notifikasi sebagai sudah dibaca
  if (body.id) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', body.id)
      .eq('user_id', session.user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Bad request' }, { status: 400 })
}