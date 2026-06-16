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
  
  // Coba ambil name dari berbagai kemungkinan field
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
 * Mengekstrak email dari raw_user_meta_data
 */
function extractEmailFromMeta(rawUserMetaData: unknown, fallbackEmail: string): string {
  if (!rawUserMetaData || typeof rawUserMetaData !== 'object') {
    return fallbackEmail || '-'
  }
  
  const meta = rawUserMetaData as Record<string, unknown>
  
  if (meta.email && typeof meta.email === 'string') {
    return meta.email
  }
  
  return fallbackEmail || '-'
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
  
  // FIX: Ambil data dari raw_user_meta_data
  const rawMeta = data.raw_user_meta_data
  const email = String(data.email || data.id || '-')
  
  return {
    id: String(data.id || ''),
    name: extractNameFromMeta(rawMeta),
    email: email
  }
}

/**
 * Memformat response dari Supabase menjadi SiswaBerkasWithUser[]
 */
function formatBerkasData(data: unknown): SiswaBerkasWithUser[] {
  if (!Array.isArray(data)) {
    return []
  }
  
  if (data.length === 0) {
    return []
  }
  
  return data.map((item: unknown) => {
    if (!item || typeof item !== 'object') {
      return null
    }
    
    const rawItem = item as Record<string, unknown>
    
    // Ekstrak data user
    const userField = rawItem.users
    const users = userField ? extractUserData(userField) : null
    
    // Buat object dengan semua properti
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
    
    return {
      ...formatted,
      users
    }
  }).filter((item): item is SiswaBerkasWithUser => item !== null)
}

// ── GET: Ambil semua berkas siswa (admin only) ─────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pastikan hanya admin yang bisa akses
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const admin = getSupabaseAdmin()

    // ── APPROACH 1: Query dengan join (preferred) ──
    // FIX: Gunakan raw_user_meta_data, bukan name langsung
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
      
      // ── APPROACH 2: Fallback tanpa join ──
      if (error.code === 'PGRST202' || error.message?.includes('foreign key') || error.code === '42703') {
        console.log('[admin/berkas] Falling back to query without join')
        
        const { data: fallbackData, error: fallbackError } = await admin
          .from('siswa_berkas')
          .select('*')
          .order('updated_at', { ascending: false })

        if (fallbackError) {
          console.error('[admin/berkas] Fallback error:', fallbackError)
          throw fallbackError
        }
        
        const formattedData = formatBerkasData(fallbackData)
        return NextResponse.json({ data: formattedData })
      }
      throw error
    }

    // Format data dari query utama
    const formattedData = formatBerkasData(data)
    return NextResponse.json({ data: formattedData })
    
  } catch (err) {
    console.error('[admin/berkas] Unhandled error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
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
      return NextResponse.json({ error: 'user_id dan status wajib diisi' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const now = new Date().toISOString()

    // Cek apakah data ada
    const { data: existingData, error: checkError } = await admin
      .from('siswa_berkas')
      .select('user_id')
      .eq('user_id', user_id)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[admin/berkas] Check error:', checkError)
      throw checkError
    }

    // Jika data tidak ada, buat record baru
    if (!existingData) {
      const { error: insertError } = await admin
        .from('siswa_berkas')
        .insert({
          user_id,
          status,
          catatan: catatan ?? null,
          verified_at: status === 'diverifikasi' ? now : null,
          verified_by: status === 'diverifikasi' ? session.user.id : null,
          updated_at: now,
          created_at: now,
        })

      if (insertError) {
        console.error('[admin/berkas] Insert error:', insertError)
        throw insertError
      }

      return NextResponse.json({ 
        success: true, 
        message: `Status berkas diperbarui: ${status}`,
        created: true
      })
    }

    // Update data yang ada
    const { error: updateError } = await admin
      .from('siswa_berkas')
      .update({
        status,
        catatan: catatan ?? null,
        verified_at: status === 'diverifikasi' ? now : null,
        verified_by: status === 'diverifikasi' ? session.user.id : null,
        updated_at: now,
      })
      .eq('user_id', user_id)

    if (updateError) {
      console.error('[admin/berkas] Update error:', updateError)
      throw updateError
    }

    return NextResponse.json({ 
      success: true, 
      message: `Status berkas diperbarui: ${status}`,
      updated: true
    })
  } catch (err) {
    console.error('[admin/berkas] Unhandled update error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat update'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}