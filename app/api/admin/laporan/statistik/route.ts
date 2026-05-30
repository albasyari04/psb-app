// app/api/admin/laporan/statistik/route.ts
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

    // Get pendaftaran data for last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data, error } = await supabase
      .from('pendaftaran')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Process data into monthly format
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const currentDate = new Date()
    const result = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(currentDate.getMonth() - i)
      const monthName = months[date.getMonth()]
      const count = data?.filter(item => {
        if (!item.created_at) return false  // ✅ skip null created_at
        const itemDate = new Date(item.created_at)
        return itemDate.getMonth() === date.getMonth() &&
               itemDate.getFullYear() === date.getFullYear()
      }).length || 0

      result.push({ bulan: monthName, jumlah: count })
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error fetching statistik:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}