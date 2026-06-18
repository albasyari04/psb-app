// app/api/siswa/laporan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const tipe = searchParams.get('tipe')

    let query = supabase
      .from('laporan')
      .select('*')
      .order('created_at', { ascending: false })

    if (tipe && tipe !== 'semua') {
      query = query.eq('tipe', tipe)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[GET /api/siswa/laporan]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}