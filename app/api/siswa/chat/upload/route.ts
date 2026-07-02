// app/api/siswa/chat/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const BUCKET = 'chat-attachments'

// ✅ FIX: whitelist tipe file di level aplikasi. Ini independen dari setting
// "Allowed MIME types" di Supabase Storage bucket — keduanya harus selaras.
// Kalau bucket punya daftar MIME type sendiri yang lebih ketat (mis. tidak
// menyertakan image/*), upload tetap akan ditolak oleh Supabase meskipun
// lolos pengecekan di sini. Cek: Supabase Dashboard → Storage →
// chat-attachments → Edit bucket → "Allowed MIME types".
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'siswa') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData().catch(() => null)
  const file = formData?.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
  }
  // ✅ FIX: validasi mime type di level app supaya pesan error jelas
  // sebelum sempat mencoba upload ke Supabase.
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Tipe file "${file.type}" tidak didukung. Gunakan gambar (JPG/PNG/WEBP/GIF), PDF, atau Word.` },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()
  const ext = file.name.split('.').pop() || 'bin'
  const uniqueName = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(uniqueName, arrayBuffer, { contentType: file.type, upsert: false })

  if (uploadErr) {
    // ✅ FIX: log detail lengkap error asli dari Supabase (message, name,
    // dan properti lain seperti statusCode) — sebelumnya hanya console.error
    // objek mentah yang sering tidak informatif di Vercel logs.
    console.error('[POST /api/siswa/chat/upload] Gagal upload ke Supabase Storage:', {
      message: uploadErr.message,
      name: uploadErr.name,
      cause: (uploadErr as { cause?: unknown }).cause,
      full: uploadErr,
    })

    // ✅ FIX: deteksi penyebab paling umum dan kasih pesan yang actionable
    // ke client, bukan cuma "Gagal mengunggah file" generik.
    const msg = uploadErr.message?.toLowerCase() ?? ''
    if (msg.includes('bucket not found')) {
      return NextResponse.json(
        { error: `Bucket "${BUCKET}" belum dibuat di Supabase Storage. Buat bucket ini dulu di Dashboard → Storage.` },
        { status: 500 }
      )
    }
    if (msg.includes('mime') || msg.includes('not allowed')) {
      return NextResponse.json(
        { error: 'Tipe file ini diblokir oleh pengaturan bucket Supabase. Cek "Allowed MIME types" di Storage → chat-attachments → Edit bucket.' },
        { status: 415 }
      )
    }
    if (msg.includes('exceeded') || msg.includes('size')) {
      return NextResponse.json(
        { error: 'Ukuran file melebihi batas yang diizinkan bucket Supabase. Cek "File size limit" di Storage → chat-attachments → Edit bucket.' },
        { status: 413 }
      )
    }
    if (msg.includes('row-level security') || msg.includes('permission') || msg.includes('policy')) {
      return NextResponse.json(
        { error: 'Akses ditolak oleh policy Storage. Pastikan SUPABASE_SERVICE_ROLE_KEY benar dan sudah ditambahkan di Vercel Environment Variables.' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: `Gagal mengunggah file: ${uploadErr.message || 'Unknown error'}` },
      { status: 500 }
    )
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(uniqueName)

  return NextResponse.json({ data: { url: publicUrlData.publicUrl, nama: file.name } }, { status: 201 })
}