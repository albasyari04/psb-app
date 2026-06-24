import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// ✅ Bisa import ChatThread dari file types terpusat, atau definisikan ulang di sini
type ChatThread = {
  id: string
  siswa_id: string
  siswa_nama: string
  siswa_avatar_url: string | null
  status: 'open' | 'closed'
  last_message_at: string | null
  unread_by_siswa: number
  unread_by_admin: number    // ✅ Sekarang TypeScript mengenali properti ini
  created_at: string
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false }) as { data: ChatThread[] | null; error: unknown }

  if (error) {
    console.error('Gagal mengambil daftar chat:', error)
    return NextResponse.json({ error: 'Gagal memuat daftar chat' }, { status: 500 })
  }

  // ✅ unread_by_admin sekarang dikenali oleh TypeScript
  const totalUnread = (data ?? []).reduce((sum, t) => sum + (t.unread_by_admin ?? 0), 0)

  return NextResponse.json({ data: data ?? [], total_unread: totalUnread })
}