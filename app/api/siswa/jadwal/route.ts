// app/api/siswa/jadwal/route.ts
// API publik untuk halaman siswa — hanya butuh session login (bukan admin)
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Cukup cek login saja, tidak perlu role admin
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('jadwal')
      .select('*')
      .order('urutan', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching jadwal (siswa):', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}