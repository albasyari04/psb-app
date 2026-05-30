// app/api/admin/announcements/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

// ── GET /api/admin/announcements/[id] ────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createAdminClient()
    const { id } = await params

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/admin/announcements/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PUT /api/admin/announcements/[id] ────────────────────────────────────────
// Body: { judul?, tipe?, konten?, tanggal?, lampiran_url?, lampiran_nama? }
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const supabase = createAdminClient()
    const { id }   = await params
    const body     = await req.json()

    const { judul, tipe, konten, tanggal, lampiran_url, lampiran_nama } = body

    // Validasi minimal satu field
    if (!judul && !tipe && !konten && !tanggal && lampiran_url === undefined) {
      return NextResponse.json({ error: 'Tidak ada data yang diubah' }, { status: 400 })
    }

    // Cek exists dulu
    const { data: existing } = await supabase
      .from('announcements')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 })
    }

    // Validasi tipe jika dikirim
    if (tipe) {
      const TIPE_VALID = ['Penting', 'Informasi', 'Info', 'Peringatan']
      if (!TIPE_VALID.includes(tipe)) {
        return NextResponse.json({ error: `Tipe tidak valid. Pilih: ${TIPE_VALID.join(', ')}` }, { status: 400 })
      }
    }

    // Bangun payload hanya field yang dikirim
    const updatePayload: Record<string, unknown> = {}
    if (judul   !== undefined) updatePayload.judul         = judul.trim()
    if (tipe    !== undefined) updatePayload.tipe          = tipe
    if (konten  !== undefined) updatePayload.konten        = konten.trim()
    if (tanggal !== undefined) updatePayload.tanggal       = tanggal
    if (lampiran_url  !== undefined) updatePayload.lampiran_url  = lampiran_url?.trim() || null
    if (lampiran_nama !== undefined) updatePayload.lampiran_nama = lampiran_nama?.trim() || null

    const { data, error } = await supabase
      .from('announcements')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PUT /api/admin/announcements/[id]]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PUT /api/admin/announcements/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE /api/admin/announcements/[id] ─────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabase = createAdminClient()
    const { id }   = await params

    // Cek exists dulu
    const { data: existing } = await supabase
      .from('announcements')
      .select('id, judul')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 })
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DELETE /api/admin/announcements/[id]]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: `Pengumuman "${existing.judul}" berhasil dihapus`,
      id,
    })
  } catch (err) {
    console.error('[DELETE /api/admin/announcements/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}