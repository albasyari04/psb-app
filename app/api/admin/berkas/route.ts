// app/api/admin/berkas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// ── Definisikan tipe untuk data ─────────────────────────────────────────────
type BerkasStatus = 'pending' | 'diverifikasi' | 'ditolak'

// Tipe untuk data dari Supabase (tanpa users)
interface RawSiswaBerkas {
  id: string
  user_id: string
  kk: string | null
  akte_lahir: string | null
  ijazah_smp: string | null
  raport_smp: string | null
  skhun: string | null
  sertifikat: string | null
  status: BerkasStatus
  catatan: string | null
  updated_at: string
  verified_at: string | null
  verified_by: string | null
  created_at: string
}

// Tipe untuk data user
interface UserData {
  id: string
  name: string
  email: string
}

// Tipe untuk response yang sudah diformat dengan users
interface SiswaBerkasWithUser extends RawSiswaBerkas {
  users: UserData | null
}

// ── Helper untuk format data ────────────────────────────────────────────────

/**
 * Mengekstrak nama dari raw_user_meta_data
 */
function extractNameFromMeta(rawUserMetaData: unknown): string {
  if (!rawUserMetaData || typeof rawUserMetaData !== 'object') {
    return 'Nama tidak tersedia'
  }

  const meta = rawUserMetaData as Record<string, unknown>

  if (meta.name && typeof meta.name === 'string') {
    return meta.name
  }

  if (meta.full_name && typeof meta.full_name === 'string') {
    return meta.full_name
  }

  if (meta.display_name && typeof meta.display_name === 'string') {
    return meta.display_name
  }

  return 'Nama tidak tersedia'
}

/**
 * Memformat data user dari hasil query Supabase
 */
function extractUserData(userData: unknown): UserData | null {
  if (!userData || typeof userData !== 'object') return null

  const data = userData as Record<string, unknown>

  // Cek apakah ada field 'error' (berarti parsing gagal)
  if ('error' in data && data.error === true) {
    console.warn('[admin/berkas] User data parsing error:', data)
    return null
  }

  // Ambil data dari raw_user_meta_data
  const rawMeta = data.raw_user_meta_data
  const email = String(data.email || data.id || '-')

  return {
    id: String(data.id || ''),
    name: extractNameFromMeta(rawMeta),
    email,
  }
}

/**
 * Menghapus baris duplikat berdasarkan user_id.
 *
 * Safety net untuk data lama: kalau di tabel siswa_berkas masih ada
 * >1 baris untuk user_id yang sama, admin tidak akan melihat satu
 * siswa muncul dua kali. Data diurutkan DESC by updated_at sebelum
 * fungsi ini dipanggil, sehingga kemunculan PERTAMA = data paling baru.
 */
function dedupeByUserId(items: SiswaBerkasWithUser[]): SiswaBerkasWithUser[] {
  const seen = new Set<string>()
  const result: SiswaBerkasWithUser[] = []

  for (const item of items) {
    if (seen.has(item.user_id)) continue
    seen.add(item.user_id)
    result.push(item)
  }

  return result
}

/**
 * Memformat response dari Supabase menjadi SiswaBerkasWithUser[]
 */
function formatBerkasData(data: unknown): SiswaBerkasWithUser[] {
  if (!Array.isArray(data) || data.length === 0) {
    return []
  }

  return data
    .map((item: unknown) => {
      if (!item || typeof item !== 'object') return null

      const rawItem = item as Record<string, unknown>

      const userField = rawItem.users
      const users = userField ? extractUserData(userField) : null

      const formatted: RawSiswaBerkas = {
        id: String(rawItem.id || ''),
        user_id: String(rawItem.user_id || ''),
        kk: rawItem.kk ? String(rawItem.kk) : null,
        akte_lahir: rawItem.akte_lahir ? String(rawItem.akte_lahir) : null,
        ijazah_smp: rawItem.ijazah_smp ? String(rawItem.ijazah_smp) : null,
        raport_smp: rawItem.raport_smp ? String(rawItem.raport_smp) : null,
        skhun: rawItem.skhun ? String(rawItem.skhun) : null,
        sertifikat: rawItem.sertifikat ? String(rawItem.sertifikat) : null,
        status: (rawItem.status as BerkasStatus) || 'pending',
        catatan: rawItem.catatan ? String(rawItem.catatan) : null,
        updated_at: String(rawItem.updated_at || new Date().toISOString()),
        verified_at: rawItem.verified_at ? String(rawItem.verified_at) : null,
        verified_by: rawItem.verified_by ? String(rawItem.verified_by) : null,
        created_at: String(rawItem.created_at || new Date().toISOString()),
      }

      return { ...formatted, users }
    })
    .filter((item): item is SiswaBerkasWithUser => item !== null)
}

// ── GET: Ambil semua berkas siswa (admin only) ─────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const admin = getSupabaseAdmin()

    // Query dengan join ke auth.users untuk ambil nama & email
    const { data, error } = await admin
      .from('siswa_berkas')
      .select(`
        *,
        users:auth_users!user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[admin/berkas] Fetch error:', error)

      // Fallback tanpa join jika relasi tidak tersedia
      if (
        error.code === 'PGRST202' ||
        error.code === '42703' ||
        error.message?.includes('foreign key')
      ) {
        console.log('[admin/berkas] Falling back to query without join')

        const { data: fallbackData, error: fallbackError } = await admin
          .from('siswa_berkas')
          .select('*')
          .order('updated_at', { ascending: false })

        if (fallbackError) {
          console.error('[admin/berkas] Fallback error:', fallbackError)
          throw fallbackError
        }

        const formattedData = dedupeByUserId(formatBerkasData(fallbackData))
        return NextResponse.json({ data: formattedData })
      }

      throw error
    }

    const formattedData = dedupeByUserId(formatBerkasData(data))
    return NextResponse.json({ data: formattedData })
  } catch (err) {
    console.error('[admin/berkas] Unhandled error:', err)
    const errorMessage =
      err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// ── PATCH: Update status verifikasi berkas ─────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { user_id, status, catatan } = body as {
      user_id: string
      status: 'pending' | 'diverifikasi' | 'ditolak'
      catatan?: string
    }

    if (!user_id || !status) {
      return NextResponse.json(
        { error: 'user_id dan status wajib diisi' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()
    const now = new Date().toISOString()

    const payload = {
      status,
      catatan: catatan ?? null,
      verified_at: status === 'diverifikasi' ? now : null,
      verified_by: status === 'diverifikasi' ? session.user.id : null,
      updated_at: now,
    }

    // UPDATE langsung semua baris milik user_id ini sekaligus.
    // Menghindari masalah maybeSingle() yang melempar error saat ada
    // >1 baris cocok, yang dulu menyebabkan INSERT baris baru sehingga
    // status lama ('pending') tidak pernah ter-update.
    const { data: updatedRows, error: updateError } = await admin
      .from('siswa_berkas')
      .update(payload)
      .eq('user_id', user_id)
      .select('id')

    if (updateError) {
      console.error('[admin/berkas] Update error:', updateError)

      // PGRST204 = kolom yang dikirim tidak ditemukan di schema cache PostgREST.
      // Biasanya karena migrasi ALTER TABLE belum dijalankan lengkap, atau
      // schema cache Supabase belum direload setelah migrasi (NOTIFY pgrst, 'reload schema').
      if (updateError.code === 'PGRST204') {
        return NextResponse.json(
          {
            error:
              'Kolom database tidak ditemukan (schema cache belum sinkron). ' +
              'Jalankan migrasi ALTER TABLE siswa_berkas yang sesuai lalu reload schema cache di Supabase.',
            detail: updateError.message,
          },
          { status: 500 }
        )
      }

      throw updateError
    }

    // Jika tidak ada baris yang ter-update, buat baris baru
    if (!updatedRows || updatedRows.length === 0) {
      const { error: insertError } = await admin
        .from('siswa_berkas')
        .insert({
          user_id,
          ...payload,
          created_at: now,
        })

      if (insertError) {
        console.error('[admin/berkas] Insert error:', insertError)
        throw insertError
      }

      return NextResponse.json({
        success: true,
        message: `Status berkas diperbarui: ${status}`,
        created: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Status berkas diperbarui: ${status}`,
      updated: true,
      rows_updated: updatedRows.length,
    })
  } catch (err) {
    console.error('[admin/berkas] Unhandled update error:', err)
    const errorMessage =
      err instanceof Error ? err.message : 'Terjadi kesalahan saat update'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}