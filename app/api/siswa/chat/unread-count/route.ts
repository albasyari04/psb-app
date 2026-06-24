import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/siswa/chat/unread-count
// Endpoint ringan untuk badge unread di Quick Access dashboard,
// tanpa perlu memuat seluruh riwayat pesan.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'siswa') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('chat_threads')
    .select('unread_by_siswa')
    .eq('siswa_id', session.user.id)
    .maybeSingle()

  if (error) {
    console.error('Gagal mengambil unread count chat:', error)
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 })
  }

  return NextResponse.json({ data: { unread: data?.unread_by_siswa ?? 0 } })
}
