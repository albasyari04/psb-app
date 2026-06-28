// app/api/admin/chat/[threadId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createNotification, NotifTemplate } from '@/lib/notifications'

// ── GET: Admin ambil detail 1 thread + pesannya ───────────────────────────────
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await context.params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const { data: thread, error: threadErr } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('id', threadId)
    .maybeSingle()

  if (threadErr || !thread) {
    return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 })
  }

  const { data: messages, error: msgErr } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (msgErr) {
    console.error('[GET /api/admin/chat/[threadId]]', msgErr)
    return NextResponse.json({ error: 'Gagal memuat pesan' }, { status: 500 })
  }

  // Tandai pesan siswa sudah dibaca oleh admin
  await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('thread_id', threadId)
    .eq('sender_role', 'siswa')
    .eq('is_read', false)

  await supabase
    .from('chat_threads')
    .update({ unread_by_admin: 0 })
    .eq('id', threadId)

  return NextResponse.json({ data: { thread, messages: messages ?? [] } })
}

// ── POST: Admin balas pesan → notifikasi ke siswa ─────────────────────────────
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await context.params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const message        = (body?.message ?? '').toString().trim()
  const attachmentUrl  = body?.attachment_url  ?? null
  const attachmentNama = body?.attachment_nama ?? null

  if (!message && !attachmentUrl) {
    return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
  }

  const supabase    = getSupabaseAdmin()
  const adminNama   = session.user.name ?? 'Admin'

  // Pastikan thread ada dan ambil siswa_id untuk notifikasi
  const { data: thread, error: threadErr } = await supabase
    .from('chat_threads')
    .select('id, siswa_id, siswa_nama, unread_by_siswa')
    .eq('id', threadId)
    .maybeSingle()

  if (threadErr || !thread) {
    return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 })
  }

  // Simpan pesan admin
  const { data: newMessage, error: insertErr } = await supabase
    .from('chat_messages')
    .insert({
      thread_id:       threadId,
      sender_role:     'admin',
      sender_id:       session.user.id,
      sender_nama:     adminNama,
      message:         message || (attachmentNama ? `Mengirim lampiran: ${attachmentNama}` : ''),
      attachment_url:  attachmentUrl,
      attachment_nama: attachmentNama,
    })
    .select('*')
    .single()

  if (insertErr) {
    console.error('[POST /api/admin/chat/[threadId]]', insertErr)
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 })
  }

  // Update metadata thread
  await supabase
    .from('chat_threads')
    .update({
      last_message:     message || `[Lampiran: ${attachmentNama}]`,
      last_message_at:  new Date().toISOString(),
      last_sender_role: 'admin',
      unread_by_siswa:  (thread.unread_by_siswa ?? 0) + 1,
      updated_at:       new Date().toISOString(),
    })
    .eq('id', threadId)

  // ── Notifikasi ke SISWA: admin membalas pesan ────────────────────────────
  await createNotification({
    userId: thread.siswa_id,
    ...NotifTemplate.pesanBalasanAdmin(),
  })

  return NextResponse.json({ data: newMessage }, { status: 201 })
}

// ── PATCH: Admin ubah status thread (open <-> closed) ─────────────────────────
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await context.params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const status = body?.status

  if (status !== 'open' && status !== 'closed') {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: updated, error: updateErr } = await supabase
    .from('chat_threads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', threadId)
    .select('*')
    .maybeSingle()

  if (updateErr || !updated) {
    console.error('[PATCH /api/admin/chat/[threadId]]', updateErr)
    return NextResponse.json({ error: 'Gagal mengubah status percakapan' }, { status: 500 })
  }

  return NextResponse.json({ data: updated })
}