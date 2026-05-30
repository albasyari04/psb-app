// app/api/admin/announcements/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// ── GET /api/admin/announcements ──────────────────────────────────────────────
// Query params: ?tipe=Penting&q=keyword&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)

    const tipe  = searchParams.get('tipe')
    const q     = searchParams.get('q')
    const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
    const from  = (page - 1) * limit
    const to    = from + limit - 1

    let query = supabase
      .from('announcements')
      .select('*', { count: 'exact' })
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (tipe)  query = query.eq('tipe', tipe)
    if (q)     query = query.ilike('judul', `%${q}%`)

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/admin/announcements]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data:  data ?? [],
      total: count ?? 0,
      page,
      limit,
    })
  } catch (err) {
    console.error('[GET /api/admin/announcements] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST /api/admin/announcements ─────────────────────────────────────────────
// Body: { judul, tipe, konten, tanggal, lampiran_url?, lampiran_nama? }
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()

    const { judul, tipe, konten, tanggal, lampiran_url, lampiran_nama } = body

    // Validasi wajib
    if (!judul?.trim())   return NextResponse.json({ error: 'Judul wajib diisi' },  { status: 400 })
    if (!tipe?.trim())    return NextResponse.json({ error: 'Tipe wajib dipilih' }, { status: 400 })
    if (!konten?.trim())  return NextResponse.json({ error: 'Konten wajib diisi' }, { status: 400 })
    if (!tanggal)         return NextResponse.json({ error: 'Tanggal wajib diisi' },{ status: 400 })

    const TIPE_VALID = ['Penting', 'Informasi', 'Info', 'Peringatan']
    if (!TIPE_VALID.includes(tipe)) {
      return NextResponse.json({ error: `Tipe tidak valid. Pilih salah satu: ${TIPE_VALID.join(', ')}` }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert({
        judul:         judul.trim(),
        tipe,
        konten:        konten.trim(),
        tanggal,
        lampiran_url:  lampiran_url?.trim() || null,
        lampiran_nama: lampiran_nama?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/admin/announcements]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/announcements] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}