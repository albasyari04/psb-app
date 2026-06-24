import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// ✅ Definisikan tipe lokal agar TypeScript happy tanpa perlu Database types
type ChatThread = {
  id: string
  siswa_id: string
  siswa_nama: string
  siswa_avatar_url: string | null
  status: 'open' | 'closed'
  last_message_at: string | null
  unread_by_siswa: number
  unread_by_admin: number
  created_at: string
}

type ChatMessage = {
  id: string
  thread_id: string
  sender_role: 'siswa' | 'admin'
  sender_id: string
  sender_nama: string
  message: string
  attachment_url: string | null
  attachment_nama: string | null
  is_read: boolean
  created_at: string
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'siswa') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const siswaId = session.user.id
  const siswaNama = session.user.name ?? 'Santri'
  const siswaAvatarUrl = (session.user as { image?: string | null }).image ?? null

  // ✅ Cast hasil query ke tipe yang sudah didefinisikan
  const { data: existingThread, error: threadErr } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('siswa_id', siswaId)
    .maybeSingle() as { data: ChatThread | null; error: unknown }

  if (threadErr) {
    console.error('Gagal mengambil thread chat:', threadErr)
    return NextResponse.json({ error: 'Gagal memuat chat' }, { status: 500 })
  }

  let thread: ChatThread | null = existingThread

  if (!thread) {
    const { data: created, error: createErr } = await supabase
      .from('chat_threads')
      .insert({
        siswa_id: siswaId,
        siswa_nama: siswaNama,
        siswa_avatar_url: siswaAvatarUrl,
        status: 'open',
      })
      .select('*')
      .single() as { data: ChatThread | null; error: unknown }

    if (createErr) {
      console.error('Gagal membuat thread chat:', createErr)
      return NextResponse.json({ error: 'Gagal membuat chat' }, { status: 500 })
    }
    thread = created
  }

  const { data: messages, error: msgErr } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_id', thread!.id)          // ✅ thread.id sudah dikenali
    .order('created_at', { ascending: true }) as { data: ChatMessage[] | null; error: unknown }

  if (msgErr) {
    console.error('Gagal mengambil pesan chat:', msgErr)
    return NextResponse.json({ error: 'Gagal memuat pesan' }, { status: 500 })
  }

  await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('thread_id', thread!.id)          // ✅ thread.id sudah dikenali
    .eq('sender_role', 'admin')
    .eq('is_read', false)

  await supabase
    .from('chat_threads')
    .update({ unread_by_siswa: 0 })
    .eq('id', thread!.id)                 // ✅ thread.id sudah dikenali

  return NextResponse.json({ data: { thread, messages: messages ?? [] } })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'siswa') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const message = (body?.message ?? '').toString().trim()
  const attachmentUrl = body?.attachment_url ?? null
  const attachmentNama = body?.attachment_nama ?? null

  if (!message && !attachmentUrl) {
    return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const siswaId = session.user.id
  const siswaNama = session.user.name ?? 'Santri'
  const siswaAvatarUrl = (session.user as { image?: string | null }).image ?? null

  // ✅ Cast ke tipe partial (hanya field yang di-select)
  const { data: existingThread } = await supabase
    .from('chat_threads')
    .select('id, status')
    .eq('siswa_id', siswaId)
    .maybeSingle() as { data: Pick<ChatThread, 'id' | 'status'> | null; error: unknown }

  let thread: Pick<ChatThread, 'id' | 'status'> | null = existingThread

  if (!thread) {
    const { data: created, error: createErr } = await supabase
      .from('chat_threads')
      .insert({
        siswa_id: siswaId,
        siswa_nama: siswaNama,
        siswa_avatar_url: siswaAvatarUrl,
        status: 'open',
      })
      .select('id, status')
      .single() as { data: Pick<ChatThread, 'id' | 'status'> | null; error: unknown }

    if (createErr) {
      console.error('Gagal membuat thread chat:', createErr)
      return NextResponse.json({ error: 'Gagal membuat chat' }, { status: 500 })
    }
    thread = created
  } else if (thread.status === 'closed') {
    await supabase.from('chat_threads').update({ status: 'open' }).eq('id', thread.id)
  }

  const { data: newMessage, error: insertErr } = await supabase
    .from('chat_messages')
    .insert({
      thread_id: thread!.id,
      sender_role: 'siswa',
      sender_id: siswaId,
      sender_nama: siswaNama,
      message: message || (attachmentNama ? `Mengirim lampiran: ${attachmentNama}` : ''),
      attachment_url: attachmentUrl,
      attachment_nama: attachmentNama,
    })
    .select('*')
    .single() as { data: ChatMessage | null; error: unknown }

  if (insertErr) {
    console.error('Gagal mengirim pesan chat:', insertErr)
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 })
  }

  return NextResponse.json({ data: newMessage }, { status: 201 })
}