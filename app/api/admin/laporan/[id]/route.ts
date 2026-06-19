// app/api/admin/laporan/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching laporan:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { judul, deskripsi, tipe, user_id, file_url, data_json } = body

    if (!judul || !tipe) {
      return NextResponse.json({ error: 'Judul dan tipe wajib diisi' }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({ error: 'Siswa wajib dipilih' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Verifikasi user_id ada
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single()

    if (profileError || !profileCheck) {
      return NextResponse.json({ error: 'ID Siswa tidak valid' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('laporan')
      .update({
        judul,
        deskripsi: deskripsi || null,
        tipe,
        user_id: user_id,
        file_url: file_url || null,
        data_json: data_json || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating laporan:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase.from('laporan').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting laporan:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}