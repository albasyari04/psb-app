// app/api/admin/tren/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
// ✅ Impor TrenBulan dari shared types, bukan didefinisikan ulang di sini
import type { TrenBulan } from '@/types/tren'

// Re-export agar kode lain yang sudah terlanjur impor dari sini tetap bekerja
export type { TrenBulan }

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()

  // ── Ambil semua pendaftaran dengan created_at dan status ─────────────────────
  // Kita ambil 12 bulan terakhir dari hari ini
  const now      = new Date()
  const since    = new Date(now.getFullYear(), now.getMonth() - 11, 1) // 12 bulan ke belakang
  const sinceISO = since.toISOString()

  const { data, error } = await admin
    .from('pendaftaran')
    .select('status, created_at')
    .gte('created_at', sinceISO)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as { status: string; created_at: string | null }[]

  // ── Bangun map bulan → { pendaftar, terverifikasi } ──────────────────────────
  // Kita buat slot untuk setiap bulan dari `since` sampai bulan ini
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']

  // Buat array slot bulan (12 slot)
  const slots: TrenBulan[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(since.getFullYear(), since.getMonth() + i, 1)
    slots.push({
      month:         MONTH_NAMES[d.getMonth()],
      year:          d.getFullYear(),
      pendaftar:     0,
      terverifikasi: 0,
    })
  }

  // Isi slot dengan data real (cumulative per-month)
  // pendaftar = semua yang created_at di bulan itu
  // terverifikasi = yang status diterima/diproses dan created_at di bulan itu
  const verifiedStatuses = new Set(['diterima', 'diproses'])

  for (const row of rows) {
    if (!row.created_at) continue
    const d     = new Date(row.created_at)
    const yr    = d.getFullYear()
    const mo    = d.getMonth() // 0-indexed

    const slotIdx = slots.findIndex(s => s.year === yr && s.month === MONTH_NAMES[mo])
    if (slotIdx === -1) continue

    slots[slotIdx].pendaftar += 1
    if (verifiedStatuses.has(row.status)) {
      slots[slotIdx].terverifikasi += 1
    }
  }

  // ── Ubah ke cumulative (running total) ───────────────────────────────────────
  // Agar grafik naik seperti referensi Sales & Revenue
  let cumPendaftar    = 0
  let cumTerverifikasi = 0
  const result: TrenBulan[] = slots.map(s => {
    cumPendaftar     += s.pendaftar
    cumTerverifikasi += s.terverifikasi
    return {
      ...s,
      pendaftar:     cumPendaftar,
      terverifikasi: cumTerverifikasi,
    }
  })

  // ── Kembalikan hanya bulan yang relevan (dari bulan pertama ada data sampai sekarang)
  // Minimal 6 bulan agar grafik tidak kosong
  const firstNonZero = result.findIndex(s => s.pendaftar > 0)
  const startIdx     = Math.max(0, Math.min(firstNonZero, result.length - 6))
  const trimmed      = result.slice(startIdx)

  return NextResponse.json({ data: trimmed })
}