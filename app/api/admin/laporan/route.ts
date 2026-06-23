// app/api/admin/laporan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createNotification } from '@/lib/notifications'

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
    const user_id = searchParams.get('user_id')

    console.log('[admin/laporan] GET - filter:', { tipe, user_id })

    let query = supabase
      .from('laporan')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          email,
          avatar_url
        ),
        creator:created_by (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (tipe && tipe !== 'semua') {
      query = query.eq('tipe', tipe)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    const { data, error } = await query
    if (error) {
      console.error('[admin/laporan] Query error:', error)
      throw error
    }

    console.log('[admin/laporan] Found items:', data?.length || 0)

    return NextResponse.json({ data: data || [] })
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
    const { judul, deskripsi, tipe, user_id, file_url, data_json } = body

    console.log('[admin/laporan] POST - creating:', { judul, tipe, user_id })

    if (!judul || !tipe) {
      return NextResponse.json({ error: 'Judul dan tipe wajib diisi' }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({ error: 'Siswa wajib dipilih' }, { status: 400 })
    }

    // Verifikasi user_id ada di profiles
    const supabase = getSupabaseAdmin()
    
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single()

    if (profileError || !profileCheck) {
      console.error('[admin/laporan] Invalid user_id:', user_id)
      return NextResponse.json({ error: 'ID Siswa tidak valid' }, { status: 400 })
    }

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('laporan')
      .insert({
        judul,
        deskripsi: deskripsi || null,
        tipe,
        user_id: user_id,
        file_url: file_url || null,
        data_json: data_json || null,
        created_by: session.user.id ?? null,
        created_at: now,
        updated_at: now,
      })
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          email,
          avatar_url
        ),
        creator:created_by (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('[laporan POST] Supabase error:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('[admin/laporan] Created successfully:', data)

    // ── Notifikasi: laporan baru tersedia untuk siswa ───────────────────────
    await createNotification({
      userId:  user_id,
      title:   '📄 Laporan Baru Tersedia',
      message: `Laporan "${judul}" telah diterbitkan untukmu. Buka halaman Laporan untuk melihat detailnya.`,
      type:    'info',
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[laporan POST] Unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}