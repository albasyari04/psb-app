// app/api/admin/chat/[threadId]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Sudah ditambahkan: createNotification ke siswa saat admin membalas.
// Perubahan dari versi sebelumnya ditandai: // ✅ NOTIF
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse }   from 'next/server'
import { getServerSession }            from 'next-auth'
import { authOptions }                 from '@/lib/auth'
import { getSupabaseAdmin }            from '@/lib/supabase'
import { createNotification }          from '@/lib/createNotification'  // ✅ NOTIF

interface RouteParams {
  params: Promise<{ threadId: string }>
}

/* ── GET ─────────────────────────────────────────────────────────────────── */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { threadId } = await params
  const supabase = getSupabaseAdmin()

  const { data: thread, error: threadErr } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('id', threadId)
    .single()

  if (threadErr || !thread) {
    return NextResponse.json({ error: 'Chat tidak ditemukan' }, { status: 404 })
  }

  const { data: messages, error: msgErr } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (msgErr) {
    return NextResponse.json({ error: 'Gagal memuat pesan' }, { status: 500 })
  }

  // Tandai pesan siswa sebagai sudah dibaca oleh admin
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

/* ── POST ────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { threadId } = await params
  const body         = await req.json().catch(() => null)
  const message      = (body?.message ?? '').toString().trim()
  const attachmentUrl  = body?.attachment_url  ?? null
  const attachmentNama = body?.attachment_nama ?? null

  if (!message && !attachmentUrl) {
    return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
  }

  const supabase  = getSupabaseAdmin()
  const adminId   = session.user.id
  const adminNama = session.user.name ?? 'Admin Pondok'

  // Pastikan thread ada & ambil siswa_id untuk notifikasi
  const { data: thread, error: threadErr } = await supabase
    .from('chat_threads')
    .select('id, siswa_id')     // ✅ NOTIF: tambah siswa_id
    .eq('id', threadId)
    .maybeSingle()

  if (threadErr || !thread) {
    return NextResponse.json({ error: 'Chat tidak ditemukan' }, { status: 404 })
  }

  const { data: newMessage, error: insertErr } = await supabase
    .from('chat_messages')
    .insert({
      thread_id    : threadId,
      sender_role  : 'admin',
      sender_id    : adminId,
      sender_nama  : adminNama,
      message      : message || (attachmentNama ? `Mengirim lampiran: ${attachmentNama}` : ''),
      attachment_url  : attachmentUrl,
      attachment_nama : attachmentNama,
    })
    .select('*')
    .single()

  if (insertErr) {
    console.error('Gagal membalas chat:', insertErr)
    return NextResponse.json({ error: 'Gagal mengirim balasan' }, { status: 500 })
  }

  // ✅ NOTIF: kirim notifikasi ke siswa pemilik thread
  await createNotification({
    userId  : thread.siswa_id,
    title   : 'Pesan baru dari Admin',
    message : message
      ? (message.length > 80 ? message.slice(0, 80) + '…' : message)
      : `Admin mengirim lampiran: ${attachmentNama ?? 'file'}`,
    type    : 'chat',
  })

  // Update counter unread_by_siswa di thread
  await supabase.rpc('increment_unread_by_siswa', { thread_id: threadId })
    .catch(() => {
      // Fallback manual jika RPC belum ada
      supabase
        .from('chat_threads')
        .select('unread_by_siswa')
        .eq('id', threadId)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase
              .from('chat_threads')
              .update({ unread_by_siswa: (data.unread_by_siswa ?? 0) + 1 })
              .eq('id', threadId)
          }
        })
    })

  return NextResponse.json({ data: newMessage }, { status: 201 })
}

/* ── PATCH ───────────────────────────────────────────────────────────────── */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { threadId } = await params
  const body   = await req.json().catch(() => null)
  const status = body?.status

  if (status !== 'open' && status !== 'closed') {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('chat_threads')
    .update({ status })
    .eq('id', threadId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Gagal mengubah status' }, { status: 500 })
  }

  return NextResponse.json({ data })
}