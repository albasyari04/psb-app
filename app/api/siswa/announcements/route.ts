import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)

    const tipe  = searchParams.get('tipe')
    const q     = searchParams.get('q')
    const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '10'))

    let query = supabase
      .from('announcements')
      .select('id, judul, tipe, konten, tanggal, lampiran_url, lampiran_nama, created_at')
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (tipe) query = query.eq('tipe', tipe)
    if (q)    query = query.ilike('judul', `%${q}%`)

    const { data, error } = await query

    if (error) {
      console.error('[GET /api/siswa/announcements]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (err) {
    console.error('[GET /api/siswa/announcements] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}