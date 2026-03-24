import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// ── POST: Upload dokumen berkas ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const userId = session.user.id

    // Collect uploaded files
    const uploadedFiles: Record<string, string> = {}

    const documentTypes = ['kk', 'akte_lahir', 'ijazah_smp', 'raport_smp', 'skhun', 'sertifikat']

    for (const docType of documentTypes) {
      const file = formData.get(docType) as File | null
      if (!file) continue

      // Validate file
      const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
      if (!allowedMimes.includes(file.type)) {
        return NextResponse.json(
          { error: `File tipe tidak diizinkan: ${docType}` },
          { status: 400 }
        )
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File terlalu besar: ${docType} (max 5MB)` },
          { status: 400 }
        )
      }

      try {
        // Upload to Supabase Storage
        const fileName = `${userId}/${docType}-${Date.now()}.${file.type.split('/')[1]}`
        const buffer = await file.arrayBuffer()

        await supabaseAdmin.storage
          .from('berkas_siswa')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          })

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('berkas_siswa')
          .getPublicUrl(fileName)

        uploadedFiles[docType] = urlData.publicUrl
      } catch (err) {
        return NextResponse.json(
          { error: `Upload gagal untuk ${docType}: ${(err as Error).message}` },
          { status: 500 }
        )
      }
    }

    // Save to database
    if (Object.keys(uploadedFiles).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabaseAdmin.from('siswa_berkas') as any)
        .upsert({
          user_id: userId,
          ...uploadedFiles,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (dbError) {
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
    console.error('Upload berkas error:', err)
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

    const { data, error } = await supabaseAdmin
      .from('siswa_berkas')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      throw error
    }

    return NextResponse.json({ data: data ?? null })
  } catch (err) {
    console.error('Fetch berkas error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
