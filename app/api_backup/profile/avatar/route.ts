// app/api/profile/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// Supabase Storage bucket name — buat bucket "avatars" di dashboard Supabase
// dengan policy: public read, authenticated write
const BUCKET = 'avatars'

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse multipart form
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
  }

  // 3. Validate type & size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Format file tidak didukung (jpg/png/webp)' }, { status: 400 })
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ukuran file maks 2MB' }, { status: 400 })
  }

  // 4. Convert File → ArrayBuffer → Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer      = Buffer.from(arrayBuffer)

  // 5. File path: avatars/{userId}.{ext}
  const ext      = file.type.split('/')[1] // jpeg | png | webp
  const filePath = `${session.user.id}.${ext}`

  // 6. Upload ke Supabase Storage (upsert = replace jika sudah ada)
  const { error: uploadError } = await supabaseAdmin
    .storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert:      true,
    })

  if (uploadError) {
    console.error('Avatar upload error:', uploadError.message)
    return NextResponse.json({ error: 'Upload gagal: ' + uploadError.message }, { status: 500 })
  }

  // 7. Ambil public URL
  const { data: urlData } = supabaseAdmin
    .storage
    .from(BUCKET)
    .getPublicUrl(filePath)

  const publicUrl = urlData.publicUrl

  // 8. Juga update kolom avatar_url di profiles
  const { error: dbError } = await supabaseAdmin
    .from('profiles')
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.user.id)

  if (dbError) {
    console.error('Avatar DB update error:', dbError.message)
    // Tidak fatal — file sudah terupload, return URL-nya
  }

  return NextResponse.json({ ok: true, url: publicUrl })
}