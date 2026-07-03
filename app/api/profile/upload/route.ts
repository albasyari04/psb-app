// app/api/profile/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { supabaseAdmin }             from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES  = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const BUCKET         = 'avatars' // nama bucket di Supabase Storage

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check ──────────────────────────────────────────────────────
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const sessionEmail = session.user.email.trim().toLowerCase()

    // ── 2. Validasi Content-Type SEBELUM parsing ───────────────────────────
    const contentType = req.headers.get('content-type') ?? ''
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      console.error('[upload] Content-Type tidak sesuai. Diterima server:', contentType || '(kosong)')
      return NextResponse.json(
        {
          error:
            `Content-Type request tidak valid (diterima server: "${contentType || 'kosong'}"). ` +
            `Ini biasanya bukan bug di form, tapi ada Service Worker atau middleware yang mengubah ` +
            `request sebelum sampai ke server. Coba: DevTools → Application → Service Workers → Unregister, ` +
            `lalu hard refresh dan coba lagi.`,
        },
        { status: 400 }
      )
    }

    // ── 3. Parse form data ─────────────────────────────────────────────────
    const formData = await req.formData()
    const file     = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    // ── 4. Validasi ukuran & tipe file ─────────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Ukuran file maksimal 2 MB' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format file harus JPG, PNG, atau WebP' }, { status: 400 })
    }

    // ── 5. Upload ke Supabase Storage ──────────────────────────────────────
    const ext      = file.type.split('/')[1].replace('jpeg', 'jpg')
    const safeId   = sessionEmail.replace(/[^a-zA-Z0-9]/g, '_')
    const filePath = `${safeId}/avatar.${ext}`
    const buffer   = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert:      true, // overwrite jika sudah ada
      })

    if (uploadError) {
      console.error('[upload] Storage error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // ── 6. Ambil public URL ─────────────────────────────────────────────────
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    // Cache-bust agar browser reload foto baru
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

    // ── 7. Update avatar_url di tabel admin (berdasarkan email) ────────────
    // ✅ FIX UTAMA (sama seperti /api/profile/update): tambahkan `.select()`
    // supaya kita tahu pasti apakah ada baris yang benar-benar ter-update,
    // dan pakai `.ilike()` supaya tidak gagal karena beda kapitalisasi email.
    const { data: updatedRows, error: dbError } = await supabaseAdmin
      .from('admin')
      .update({ avatar_url: publicUrl })
      .ilike('email', sessionEmail)
      .select('email, avatar_url')

    if (dbError) {
      console.error('[upload] DB update error:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.error(
        '[upload] 0 baris ter-update untuk avatar_url. session email:',
        sessionEmail
      )
      return NextResponse.json(
        {
          error:
            `File berhasil di-upload ke storage, tapi tidak ada baris admin yang ` +
            `cocok dengan email "${sessionEmail}" untuk disimpan avatar_url-nya. ` +
            `Cek kolom "email" di tabel admin.`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, avatar_url: publicUrl }, { status: 200 })

  } catch (err: unknown) {
    console.error('[upload] Unhandled error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}