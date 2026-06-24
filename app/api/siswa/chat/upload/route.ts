import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const BUCKET = 'chat-attachments'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'siswa') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData().catch(() => null)
  const file = formData?.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const ext = file.name.split('.').pop() || 'bin'
  const uniqueName = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(uniqueName, arrayBuffer, { contentType: file.type, upsert: false })

  if (uploadErr) {
    console.error('Gagal upload lampiran chat:', uploadErr)
    return NextResponse.json({ error: 'Gagal mengunggah file' }, { status: 500 })
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(uniqueName)

  return NextResponse.json({ data: { url: publicUrlData.publicUrl, nama: file.name } }, { status: 201 })
}
