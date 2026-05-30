// app/api/admin/laporan/route.ts
// Gunakan file ini SETELAH menjalankan fix_laporan_fkey.sql di Supabase
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const tipe = searchParams.get('tipe')

    let query = supabase.from('laporan').select('*').order('created_at', { ascending: false })

    if (tipe && tipe !== 'semua') {
      query = query.eq('tipe', tipe)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[GET /api/admin/laporan]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { judul, deskripsi, tipe, file_url, data_json } = body

    if (!judul || !tipe) {
      return NextResponse.json({ error: 'Judul dan tipe wajib diisi' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('laporan')
      .insert({
        judul,
        deskripsi:  deskripsi  || null,
        tipe,
        file_url:   file_url   || null,
        data_json:  data_json  || null,
        created_by: session.user.id ?? null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error('[laporan POST] Supabase error:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[laporan POST] Unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}