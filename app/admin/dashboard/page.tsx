// app/admin/dashboard/page.tsx
import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"
import AdminDashboardClient from '@/app/siswa/dashboard/AdminDashboardClient'
import type { TrenBulan }   from '@/app/api/admin/tren/route'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const admin   = getSupabaseAdmin()

  const fullName      = session?.user.name      ?? 'Admin'
  const avatarUrl     = session?.user.avatar_url ?? null
  const avatarInitial = fullName.split(' ')[0]?.[0]?.toUpperCase() ?? 'A'

  // ── 1. Stats (total per status) ─────────────────────────────────────────────
  interface StatusRow { status: string; created_at: string | null }
  const { data: semua } = await admin
    .from('pendaftaran')
    .select('status, created_at')

  const rows = (semua ?? []) as StatusRow[]

  const stats = {
    total:    rows.length,
    menunggu: rows.filter(p => p.status === 'menunggu').length,
    diproses: rows.filter(p => p.status === 'diproses').length,
    diterima: rows.filter(p => p.status === 'diterima').length,
    ditolak:  rows.filter(p => p.status === 'ditolak').length,
  }

  // ── 2. Tren data (12 bulan terakhir, cumulative) ────────────────────────────
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']
  const now   = new Date()
  const since = new Date(now.getFullYear(), now.getMonth() - 11, 1)

  // Filter hanya 12 bulan ke belakang
  const recentRows = rows.filter(r => {
    if (!r.created_at) return false
    return new Date(r.created_at) >= since
  })

  // Buat 12 slot bulan
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

  const verifiedStatuses = new Set(['diterima', 'diproses'])

  for (const row of recentRows) {
    if (!row.created_at) continue
    const d       = new Date(row.created_at)
    const slotIdx = slots.findIndex(
      s => s.year === d.getFullYear() && s.month === MONTH_NAMES[d.getMonth()]
    )
    if (slotIdx === -1) continue
    slots[slotIdx].pendaftar += 1
    if (verifiedStatuses.has(row.status)) {
      slots[slotIdx].terverifikasi += 1
    }
  }

  // Ubah ke cumulative
  let cumP = 0, cumV = 0
  const trendData: TrenBulan[] = slots.map(s => {
    cumP += s.pendaftar
    cumV += s.terverifikasi
    return { ...s, pendaftar: cumP, terverifikasi: cumV }
  })

  // Trim dari bulan pertama ada data (min 6 slot)
  const firstNonZero = trendData.findIndex(s => s.pendaftar > 0)
  const startIdx     = Math.max(0, Math.min(firstNonZero < 0 ? 6 : firstNonZero, trendData.length - 6))
  const trimmedTrend = trendData.slice(startIdx)

  return (
    <AdminDashboardClient
      fullName={fullName}
      avatarInitial={avatarInitial}
      avatarUrl={avatarUrl}
      pendaftaran={null}
      status={null}
      isAdmin={true}
      stats={stats}
      trendData={trimmedTrend}
    />
  )
}