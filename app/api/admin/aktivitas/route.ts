import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export interface AktivitasItem {
  id:     string
  type:   'pendaftar_baru' | 'diverifikasi' | 'berkas_update' | 'pembayaran' | 'ditolak' | 'diterima' | 'diproses'
  name:   string
  sub:    string
  time:   string
  raw_at: string
}

// FIX: terima string | null | undefined, fallback ke now jika null
function toDate(val: string | null | undefined): Date {
  if (!val) return new Date()
  return new Date(val)
}

function relativeTime(isoStr: string | null | undefined): string {
  const diff = Date.now() - toDate(isoStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)

  if (mins < 1)   return 'Baru saja'
  if (mins < 60)  return `${mins} mnt lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days === 1) return 'Kemarin'
  return `${days} hari lalu`
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  const limit = parseInt(new URL(req.url).searchParams.get('limit') ?? '10')

  // ── 1. Pendaftaran terbaru ──────────────────────────────────────────────────
  const { data: pendaftaran } = await admin
    .from('pendaftaran')
    .select('id, nama_lengkap, status, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)

  // ── 2. Pembayaran terbaru ───────────────────────────────────────────────────
  const { data: pembayaran } = await admin
    .from('pembayaran')
    .select('id, nama_siswa, status, jenis_pembayaran, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)

  const items: AktivitasItem[] = []

  for (const p of pendaftaran ?? []) {
    // FIX: gunakan toDate() agar tidak error saat null
    const createdAt  = toDate(p.created_at)
    const updatedAt  = toDate(p.updated_at)
    const isNew      = Math.abs(createdAt.getTime() - updatedAt.getTime()) < 5000

    const typeMap: Record<string, AktivitasItem['type']> = {
      menunggu: 'pendaftar_baru',
      diproses: 'diproses',
      diterima: 'diverifikasi',
      ditolak:  'ditolak',
    }
    const subMap: Record<string, string> = {
      menunggu: 'Pendaftar Baru',
      diproses: 'Sedang Diproses',
      diterima: 'Diterima ✓',
      ditolak:  'Tidak Diterima',
    }

    // FIX: raw_at pakai fallback string agar tidak null
    const rawAt = p.updated_at ?? p.created_at ?? new Date().toISOString()

    items.push({
      id:     `pdft-${p.id}`,
      type:   typeMap[p.status] ?? 'pendaftar_baru',
      name:   isNew ? `${p.nama_lengkap} mendaftar` : `Status ${p.nama_lengkap} diperbarui`,
      sub:    subMap[p.status] ?? p.status,
      time:   relativeTime(rawAt),
      raw_at: rawAt,  // FIX: dijamin string
    })
  }

  for (const p of pembayaran ?? []) {
    const typeMap: Record<string, AktivitasItem['type']> = {
      dikonfirmasi: 'pembayaran',
      menunggu:     'pembayaran',
      ditolak:      'ditolak',
    }
    const subMap: Record<string, string> = {
      dikonfirmasi: `${p.jenis_pembayaran} · Dikonfirmasi`,
      menunggu:     `${p.jenis_pembayaran} · Menunggu`,
      ditolak:      `${p.jenis_pembayaran} · Ditolak`,
    }

    // FIX: raw_at pakai fallback string agar tidak null
    const rawAt = p.updated_at ?? p.created_at ?? new Date().toISOString()

    items.push({
      id:     `pmby-${p.id}`,
      type:   typeMap[p.status] ?? 'pembayaran',
      name:   `Pembayaran ${p.nama_siswa}`,
      sub:    subMap[p.status] ?? p.status,
      time:   relativeTime(rawAt),
      raw_at: rawAt,  // FIX: dijamin string
    })
  }

  // Sort by newest first
  items.sort((a, b) => new Date(b.raw_at).getTime() - new Date(a.raw_at).getTime())

  return NextResponse.json({ data: items.slice(0, limit) })
}