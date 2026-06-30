// app/api/admin/chat/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

type ChatThread = {
  id: string
  siswa_id: string
  siswa_nama: string
  siswa_avatar_url: string | null
  status: 'open' | 'closed'
  last_message: string | null
  last_message_at: string | null
  last_sender_role: string | null
  unread_by_siswa: number
  unread_by_admin: number
  created_at: string
  updated_at: string
}

type SiswaProfile = {
  id: string
  name: string
  avatar_url: string | null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  // ── 1. Ambil SEMUA siswa terdaftar (bukan cuma yang sudah pernah chat) ─────
  const { data: siswaList, error: siswaErr } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .eq('role', 'siswa') as { data: SiswaProfile[] | null; error: unknown }

  if (siswaErr) {
    console.error('Gagal mengambil daftar siswa:', siswaErr)
    return NextResponse.json({ error: 'Gagal memuat daftar siswa' }, { status: 500 })
  }

  // ── 2. Ambil semua chat_threads yang sudah ada ──────────────────────────────
  const { data: existingThreads, error: threadErr } = await supabase
    .from('chat_threads')
    .select('*') as { data: ChatThread[] | null; error: unknown }

  if (threadErr) {
    console.error('Gagal mengambil daftar chat:', threadErr)
    return NextResponse.json({ error: 'Gagal memuat daftar chat' }, { status: 500 })
  }

  const threadBySiswaId = new Map<string, ChatThread>()
  for (const t of existingThreads ?? []) {
    threadBySiswaId.set(t.siswa_id, t)
  }

  // ── 3. Siswa yang BELUM punya thread → buatkan thread kosong otomatis ──────
  // (sama persis seperti pola auto-create yang sudah dipakai di
  // app/api/siswa/chat/route.ts saat siswa pertama kali buka halaman chat —
  // di sini kita lakukan dari sisi admin supaya semua siswa langsung
  // terdaftar di inbox, walau belum pernah kirim pesan apa pun.)
  const siswaWithoutThread = (siswaList ?? []).filter((s) => !threadBySiswaId.has(s.id))

  if (siswaWithoutThread.length > 0) {
    const rowsToInsert = siswaWithoutThread.map((s) => ({
      siswa_id:         s.id,
      siswa_nama:       s.name || 'Santri',
      siswa_avatar_url: s.avatar_url ?? null,
      status:           'open' as const,
    }))

    const { data: created, error: createErr } = await supabase
      .from('chat_threads')
      .insert(rowsToInsert)
      .select('*') as { data: ChatThread[] | null; error: unknown }

    if (createErr) {
      console.error('Gagal membuat thread otomatis untuk siswa baru:', createErr)
      // Tidak return error — tetap lanjut dengan thread yang sudah ada,
      // supaya 1 kegagalan tidak bikin seluruh inbox gagal dimuat.
    } else {
      for (const t of created ?? []) {
        threadBySiswaId.set(t.siswa_id, t)
      }
    }
  }

  // ── 4. Gabungkan semua thread (lama + baru dibuat) & urutkan ───────────────
  const allThreads = Array.from(threadBySiswaId.values()).sort((a, b) => {
    // Yang ada pesan terbaru di atas; yang belum pernah chat (last_message_at null) di bawah,
    // diurutkan berdasarkan nama supaya tetap rapi & predictable.
    if (a.last_message_at && b.last_message_at) {
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    }
    if (a.last_message_at && !b.last_message_at) return -1
    if (!a.last_message_at && b.last_message_at) return 1
    return a.siswa_nama.localeCompare(b.siswa_nama)
  })

  const totalUnread = allThreads.reduce((sum, t) => sum + (t.unread_by_admin ?? 0), 0)

  return NextResponse.json({ data: allThreads, total_unread: totalUnread })
}