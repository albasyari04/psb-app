// app/api/siswa/laporan/[id]/route.ts
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = getSupabaseAdmin()

    // ✅ FIX: Pastikan siswa hanya bisa melihat laporan miliknya sendiri
    const { data, error } = await supabase
      .from('laporan')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)  // ← TAMBAHKAN INI
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching laporan:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}