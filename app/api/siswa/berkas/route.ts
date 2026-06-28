// app/api/siswa/berkas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createNotification, notifyAllAdmins, NotifTemplate } from '@/lib/notifications'

// ── POST: Upload dokumen berkas ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const userId   = session.user.id
    const admin    = getSupabaseAdmin()

    const uploadedFiles: Record<string, string> = {}

    const documentTypes = ['kk', 'akte_lahir', 'ijazah_smp', 'raport_smp', 'skhun', 'sertifikat']

    for (const docType of documentTypes) {
      const file = formData.get(docType) as File | null
      if (!file) continue

      const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
      if (!allowedMimes.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipe file tidak diizinkan: ${docType}` },
          { status: 400 }
        )
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File terlalu besar: ${docType} (max 5MB)` },
          { status: 400 }
        )
      }

      const extMap: Record<string, string> = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/png':  'png',
        'image/webp': 'webp',
      }
      const ext      = extMap[file.type] ?? 'bin'
      const fileName = `${userId}/${docType}-${Date.now()}.${ext}`
      const buffer   = await file.arrayBuffer()

      const { error: uploadError } = await admin.storage
        .from('berkas_siswa')
        .upload(fileName, buffer, { contentType: file.type, upsert: true })

      if (uploadError) {
        console.error(`[berkas] Storage upload error (${docType}):`, uploadError)
        return NextResponse.json(
          { error: `Upload gagal untuk ${docType}: ${uploadError.message}` },
          { status: 500 }
        )
      }

      const { data: urlData } = admin.storage.from('berkas_siswa').getPublicUrl(fileName)
      uploadedFiles[docType] = urlData.publicUrl
    }

    if (Object.keys(uploadedFiles).length > 0) {
      const { error: dbError } = await admin
        .from('siswa_berkas')
        .upsert(
          {
            user_id:    userId,
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

      // ── Notifikasi ────────────────────────────────────────────────────────
      const namaSiswa = session.user.name ?? 'Siswa'

      // Siswa: konfirmasi berkas berhasil dikirim
      await createNotification({
        userId: userId,
        ...NotifTemplate.berkasDiterima(),
      })

      // Admin: ada dokumen baru dari siswa
      await notifyAllAdmins(NotifTemplate.berkasDikirim(namaSiswa))
    }

    return NextResponse.json({
      success: true,
      message: 'Berkas berhasil diunggah',
      files:   uploadedFiles,
    })
  } catch (err) {
    console.error('[berkas] Unhandled upload error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Terjadi kesalahan saat upload' },
      { status: 500 }
    )
  }
}

// ── GET: Ambil berkas siswa ───────────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const admin  = getSupabaseAdmin()

    const { data, error } = await admin
      .from('siswa_berkas')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

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