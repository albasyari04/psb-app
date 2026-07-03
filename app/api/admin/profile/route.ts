// app/api/admin/profile/route.ts
import { NextResponse }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { supabaseAdmin }    from '@/lib/supabase'

// ─────────────────────────────────────────────────────────────────────────
// GET /api/admin/profile
// Route ini SEBELUMNYA TIDAK ADA — makanya frontend (app/admin/profile/page.tsx)
// dapat 404 saat fetch('/api/admin/profile'). Dibuat baru di sini.
//
// Identifikasi akun tetap pakai EMAIL, konsisten dengan
// /api/profile/upload dan /api/profile/update.
// ─────────────────────────────────────────────────────────────────────────

// ✅ FIX TS2339: tabel `admin` belum terdaftar di database.types.ts, jadi
// Supabase client (yang sudah di-generic-kan pakai Database type) meng-infer
// hasil select('*') sebagai `{}` alih-alih baris asli tabel `admin`. Solusi
// paling cepat tanpa perlu regenerate database.types.ts: definisikan tipe
// baris secara manual di sini dan cast hasil query ke tipe itu.
//
// (Solusi jangka panjang yang lebih benar: tambahkan definisi tabel `admin`
// ke database.types.ts, biasanya lewat `supabase gen types typescript`.)
// ✅ FIX tambahan: pastikan route ini TIDAK PERNAH di-cache secara statis oleh
// Next.js (Full Route Cache), apa pun kondisinya. getServerSession sebenarnya
// sudah membuat route ini dinamis secara otomatis (karena baca cookies), tapi
// baris ini membuatnya eksplisit dan aman dari perubahan Next.js di masa depan.
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

    const { data, error } = await supabaseAdmin
      .from('admin')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (error || !data) {
      console.error('[admin/profile] Query error:', error)
      return NextResponse.json({ error: 'Data admin tidak ditemukan' }, { status: 404 })
    }

    const admin = data as AdminRow

    // ⚠️ Sesuaikan nama kolom di bawah ini dengan nama kolom asli di tabel
    // `admin` pada Supabase Anda. Beberapa field (system, academic_year,
    // last_login, is_active) saya beri fallback aman kalau kolomnya belum
    // ada, supaya route ini tidak error hanya karena kolom belum tersedia.
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

    return NextResponse.json({ profile }, { status: 200 })

  } catch (err: unknown) {
    console.error('[admin/profile] Unhandled error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}