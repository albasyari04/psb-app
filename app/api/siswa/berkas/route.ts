import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'  // ✅ import fungsi, bukan proxy

// ── POST: Upload dokumen berkas ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const userId = session.user.id
    const admin = getSupabaseAdmin()  // ✅ type-safe karena pakai Database generic

    const uploadedFiles: Record<string, string> = {}

    const documentTypes = ['kk', 'akte_lahir', 'ijazah_smp', 'raport_smp', 'skhun', 'sertifikat']

    for (const docType of documentTypes) {
      const file = formData.get(docType) as File | null
      if (!file) continue

      // Validate MIME type
      const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
      if (!allowedMimes.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipe file tidak diizinkan: ${docType}` },
          { status: 400 }
        )
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File terlalu besar: ${docType} (max 5MB)` },
          { status: 400 }
        )
      }

      // Determine file extension
      const extMap: Record<string, string> = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
      }
      const ext = extMap[file.type] ?? 'bin'
      const fileName = `${userId}/${docType}-${Date.now()}.${ext}`
      const buffer = await file.arrayBuffer()

      // Upload ke Supabase Storage — FIX: cek error upload
      const { error: uploadError } = await admin.storage
        .from('berkas_siswa')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true, // FIX: upsert true agar bisa overwrite file lama
        })

      if (uploadError) {
        console.error(`[berkas] Storage upload error (${docType}):`, uploadError)
        return NextResponse.json(
          { error: `Upload gagal untuk ${docType}: ${uploadError.message}` },
          { status: 500 }
        )
      }

      // Ambil public URL
      const { data: urlData } = admin.storage
        .from('berkas_siswa')
        .getPublicUrl(fileName)

      uploadedFiles[docType] = urlData.publicUrl
    }

    // Simpan ke database — field eksplisit agar TypeScript bisa validasi tipe
    if (Object.keys(uploadedFiles).length > 0) {
      const { error: dbError } = await admin
        .from('siswa_berkas')
        .upsert(
          {
            user_id: userId,
            kk:         uploadedFiles['kk']         ?? null,
            akte_lahir: uploadedFiles['akte_lahir'] ?? null,
            ijazah_smp: uploadedFiles['ijazah_smp'] ?? null,
            raport_smp: uploadedFiles['raport_smp'] ?? null,
            skhun:      uploadedFiles['skhun']      ?? null,
            sertifikat: uploadedFiles['sertifikat'] ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

      if (dbError) {
        console.error('[berkas] DB upsert error:', dbError)
        return NextResponse.json(
          { error: `Gagal menyimpan ke database: ${dbError.message}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Berkas berhasil diunggah',
      files: uploadedFiles,
    })
  } catch (err) {
    console.error('[berkas] Unhandled upload error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Terjadi kesalahan saat upload' },
      { status: 500 }
    )
  }
}

// ── GET: Retrieve uploaded berkas ──────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const admin = getSupabaseAdmin()  // ✅ type-safe

    const { data, error } = await admin
      .from('siswa_berkas')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle() // FIX: gunakan maybeSingle() — tidak throw error jika data kosong

    if (error) {
      console.error('[berkas] Fetch error:', error)
      throw error
    }

    return NextResponse.json({ data: data ?? null })
  } catch (err) {
    console.error('[berkas] Unhandled fetch error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}