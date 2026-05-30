import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // 1. Cek autentikasi
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Ambil file dari FormData
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('user_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    // 3. Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau WEBP' },
        { status: 400 }
      )
    }

    // 4. Validasi ukuran file (maks 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      )
    }

    // 5. Konversi file ke Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 6. Generate nama file unik
    const uid = userId ?? session.user.id
    const ext = file.name.split('.').pop() ?? 'jpg'
    const timestamp = Date.now()
    const fileName = `bukti_${uid}_${timestamp}.${ext}`
    const filePath = `pembayaran/${fileName}`

    // 7. Upload ke Supabase Storage
    const supabase = getSupabaseAdmin()
    const { error: uploadError } = await supabase.storage
      .from('berkas-siswa') // nama bucket di Supabase Storage
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload] Supabase storage error:', uploadError)
      return NextResponse.json(
        { error: 'Gagal mengupload file: ' + uploadError.message },
        { status: 500 }
      )
    }

    // 8. Ambil public URL
    const { data: urlData } = supabase.storage
      .from('berkas-siswa')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: 'Gagal mendapatkan URL file' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: urlData.publicUrl }, { status: 200 })

  } catch (err) {
    console.error('[upload] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}