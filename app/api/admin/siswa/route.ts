// app/api/admin/siswa/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url')
      .eq('role', 'siswa')
      .order('name', { ascending: true })

    if (error) {
      console.error('[admin/siswa] Error:', error)
      throw error
    }

    console.log('[admin/siswa] Found students:', data?.length || 0)

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('[GET /api/admin/siswa]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}