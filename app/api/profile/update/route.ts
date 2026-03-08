import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, avatar_url } = body as { name?: string; avatar_url?: string }

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 })
    }

    const updateData: Record<string, string> = { name: name.trim() }
    if (avatar_url) updateData.avatar_url = avatar_url

    const { error } = await supabaseAdmin
      .from('admin')
      .update(updateData)
      .eq('email', session.user.email)

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (err: unknown) {
    console.error('Profile update error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}