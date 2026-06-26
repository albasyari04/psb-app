// app/api/admin/pembayaran/[id]/route.ts
// Handles: GET (detail), PUT (update), DELETE
// FIX: Next.js 15 — params adalah Promise, harus di-await

import { getSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// ✅ FIX: type Params pakai Promise (Next.js 15)
type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  // ✅ FIX: await params sebelum destructuring
  const { id } = await params

  const supabase = getSupabaseAdmin()

  try {
    const { data, error } = await supabase
      .from('pembayaran')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/pembayaran/[id] error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pembayaran' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  // ✅ FIX: await params sebelum destructuring
  const { id } = await params

  const supabase = getSupabaseAdmin()

  try {
    const body = await request.json()
    const {
      nama_siswa,
      nominal,
      jenis_pembayaran,
      metode_pembayaran,
      no_referensi,
      status,
      catatan,
      tanggal_bayar,
    } = body

    // Jika dikonfirmasi, catat waktu konfirmasi
    const extraFields =
      status === 'dikonfirmasi'
        ? { confirmed_at: new Date().toISOString() }
        : {}

    const { data, error } = await supabase
      .from('pembayaran')
      .update({
        nama_siswa,
        nominal: nominal ? Number(nominal) : undefined,
        jenis_pembayaran,
        metode_pembayaran: metode_pembayaran || null,
        no_referensi: no_referensi || null,
        status,
        catatan: catatan || null,
        tanggal_bayar: tanggal_bayar || null,
        updated_at: new Date().toISOString(),
        ...extraFields,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('PUT /api/admin/pembayaran/[id] error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui data pembayaran' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  // ✅ FIX: await params sebelum destructuring
  const { id } = await params

  const supabase = getSupabaseAdmin()

  try {
    const { error } = await supabase
      .from('pembayaran')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: 'Data pembayaran berhasil dihapus' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/admin/pembayaran/[id] error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus data pembayaran' },
      { status: 500 }
    )
  }
}