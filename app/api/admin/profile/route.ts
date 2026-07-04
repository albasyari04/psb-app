// app/api/admin/profile/route.ts
import { NextResponse }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { supabaseAdmin }    from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface AdminRow {
  name?: string | null
  email: string
  role?: string | null
  system?: string | null
  academic_year?: string | null
  avatar_url?: string | null
  last_login?: string | null
  is_active?: boolean | null
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ FIX: normalisasi email SAMA seperti di /api/profile/update dan
    // /api/profile/upload (trim + lowercase + ilike), supaya konsisten dan
    // tidak gagal match hanya karena beda kapitalisasi/spasi. Sebelumnya
    // route ini pakai `.eq('email', session.user.email)` mentah-mentah.
    const sessionEmail = session.user.email.trim().toLowerCase()

    const { data, error } = await supabaseAdmin
      .from('admin')
      .select('*')
      .ilike('email', sessionEmail)
      .single()

    if (error || !data) {
      console.error('[admin/profile] Query error:', error, 'email dicari:', sessionEmail)
      return NextResponse.json({ error: 'Data admin tidak ditemukan' }, { status: 404 })
    }

    const admin = data as AdminRow

    const profile = {
      name:          admin.name ?? 'Admin PSB',
      email:         admin.email,
      role:          admin.role ?? 'admin',
      system:        admin.system ?? 'PSB 2025/2026',
      academic_year: admin.academic_year ?? '2025/2026',
      avatar_url:    admin.avatar_url ?? null,
      last_login:    admin.last_login ?? null,
      is_active:     admin.is_active ?? true,
    }

    // ✅ FIX: pastikan response TIDAK di-cache oleh browser/CDN, supaya
    // setelah edit profil, halaman /admin/profile selalu dapat data terbaru
    // dan bukan versi lama yang ke-cache.
    return NextResponse.json(
      { profile },
      { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )

  } catch (err: unknown) {
    console.error('[admin/profile] Unhandled error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}