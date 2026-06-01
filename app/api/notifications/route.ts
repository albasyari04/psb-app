// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

// Eksplisit tipe Row dari database.types.ts → hilangkan ambiguitas TypeScript
type NotificationRow = Database['public']['Tables']['notifications']['Row']

// ── GET: Ambil notifikasi milik user yang sedang login ────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const { searchParams } = new URL(req.url)
  const limit      = Number(searchParams.get('limit') ?? 20)
  const unreadOnly = searchParams.get('unread') === 'true'

  // FIX: Hindari conditional chaining yang merusak type inference.
  // Bangun filter array, lalu jalankan query sekali dengan tipe eksplisit.
  const baseQuery = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  const { data, error } = unreadOnly
    ? await baseQuery.eq('is_read', false)
    : await baseQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Cast eksplisit agar TypeScript tahu struktur row
  const rows = (data ?? []) as NotificationRow[]
  const unreadCount = rows.filter(n => !n.is_read).length

  return NextResponse.json({ data: rows, unreadCount })
}

// ── POST: Tandai notifikasi sebagai sudah dibaca ──────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { id?: string; markAllRead?: boolean }
  const { id, markAllRead } = body
  const supabase = getSupabaseAdmin()

  if (markAllRead) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (id) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Bad request' }, { status: 400 })
}