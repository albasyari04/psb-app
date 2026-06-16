'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Pendaftaran } from '@/types'
import type { TrenBulan } from '@/types/tren'
import type { AktivitasItem } from '@/app/api/admin/aktivitas/route'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Stats {
  total:    number
  menunggu: number
  diproses: number
  diterima: number
  ditolak:  number
}

interface Props {
  fullName:      string
  avatarInitial: string
  avatarUrl:     string | null
  pendaftaran:   Pendaftaran | null
  status:        Pendaftaran['status'] | null
  isAdmin?:      boolean
  stats?:        Stats | null
  trendData?:    TrenBulan[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting(hour: number): string {
  if (hour >= 4  && hour < 11) return 'Selamat pagi,'
  if (hour >= 11 && hour < 15) return 'Selamat siang,'
  if (hour >= 15 && hour < 18) return 'Selamat sore,'
  return 'Selamat malam,'
}

function getAktivitasDesc(type: AktivitasItem['type']): string {
  const map: Record<AktivitasItem['type'], string> = {
    pendaftar_baru: 'Pendaftaran baru masuk',
    diverifikasi:   'Pendaftaran diverifikasi',
    berkas_update:  'Mengunggah dokumen baru',
    pembayaran:     'Pembayaran dikonfirmasi',
    ditolak:        'Pendaftaran ditolak',
    diterima:       'Pendaftaran diterima',
    diproses:       'Menunggu verifikasi berkas',
  }
  return map[type] ?? 'Aktivitas baru'
}

// ── Aktivitas icon color per type ─────────────────────────────────────────────
const AKTIVITAS_CONFIG: Record<AktivitasItem['type'], { bg: string }> = {
  pendaftar_baru: { bg: '#6d28d9' },
  diverifikasi:   { bg: '#10b981' },
  berkas_update:  { bg: '#3b82f6' },
  pembayaran:     { bg: '#f59e0b' },
  ditolak:        { bg: '#ef4444' },
  diterima:       { bg: '#10b981' },
  diproses:       { bg: '#f59e0b' },
}

// ── Aktivitas SVG Icon ────────────────────────────────────────────────────────
function AktivitasIcon({ type }: { type: AktivitasItem['type'] }) {
  const c = '#fff'
  const sl = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (type === 'diverifikasi' || type === 'diterima') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={c} strokeWidth="2.2" {...sl}/>
      <polyline points="22 4 12 14.01 9 11.01" stroke={c} strokeWidth="2.2" {...sl}/>
    </svg>
  )
  if (type === 'ditolak') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2.2"/>
      <line x1="15" y1="9" x2="9" y2="15" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="9" y1="9" x2="15" y2="15" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  )
  if (type === 'berkas_update') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={c} strokeWidth="2.2" {...sl}/>
      <polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="2.2" {...sl}/>
      <line x1="12" y1="13" x2="12" y2="17" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
      <polyline points="9 15 12 12 15 15" stroke={c} strokeWidth="2.2" {...sl}/>
    </svg>
  )
  if (type === 'pembayaran' || type === 'diproses') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2.2"/>
      <polyline points="12 6 12 12 16 14" stroke={c} strokeWidth="2.2" {...sl}/>
    </svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={c} strokeWidth="2.2" {...sl}/>
      <circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2.2"/>
      <line x1="19" y1="8" x2="19" y2="14" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="16" y1="11" x2="22" y2="11" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  )
}

// ── Bottom Nav Icons ──────────────────────────────────────────────────────────
const NavHome = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      fill={active ? '#ede9fe' : 'none'}/>
    <polyline points="9 22 9 12 15 12 15 22"
      stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const NavPendaftar = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const NavVerifikasi = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="3" width="20" height="14" rx="2"
      stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2"/>
    <path d="M8 21h8M12 17v4"
      stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 10l3 3 6-6"
      stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const NavLaporan = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14 2 14 8 20 8"
      stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="13" x2="16" y2="13" stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="17" x2="12" y2="17" stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const NavPengaturan = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2"/>
  </svg>
)

// ── Quick Menu SVG Icons ───────────────────────────────────────────────────────
const IconPendaftar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="#6d28d9" strokeWidth="2"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconVerifikasi = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="22 4 12 14.01 9 11.01" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconLaporan = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="20" x2="18" y2="10" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round"/>
    <line x1="12" y1="20" x2="12" y2="4"  stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round"/>
    <line x1="6"  y1="20" x2="6"  y2="14" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
)
const IconPengumuman = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M19 3L5 8v8l14 5V3Z" stroke="#ec4899" strokeWidth="2" strokeLinejoin="round" fill="#fce7f3"/>
    <path d="M5 8H3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2" stroke="#ec4899" strokeWidth="2" strokeLinecap="round"/>
    <line x1="5" y1="16" x2="5" y2="21" stroke="#ec4899" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const IconNotifikasi = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const IconPengaturan = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="#6b7280" strokeWidth="2"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke="#6b7280" strokeWidth="2"/>
  </svg>
)

const IconBerkas = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14 2 14 8 20 8" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="13" x2="16" y2="13" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="17" x2="12" y2="17" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconJadwal = () => (
  <Image src="/icons/jadwal icon.png" alt="Jadwal" width={50} height={50} />
)

// ── Menu Cepat Admin Items ────────────────────────────────────────────────────
const QUICK_MENU = [
  { id: 'pendaftar',  label: 'Pendaftar',  Icon: IconPendaftar,  href: '/admin/pendaftar',  bgLight: '#ede9fe' },
  { id: 'verifikasi', label: 'Verifikasi', Icon: IconVerifikasi, href: '/admin/verifikasi', bgLight: '#d1fae5' },
  { id: 'laporan',    label: 'Laporan',    Icon: IconLaporan,    href: '/admin/laporan',    bgLight: '#fef3c7' },
  { id: 'berkas',     label: 'Berkas',     Icon: IconBerkas,     href: '/admin/berkas',     bgLight: '#ccfbf1' },
  { id: 'pengumuman', label: 'Pengumuman', Icon: IconPengumuman, href: '/admin/pengumuman', bgLight: '#fce7f3' },
  { id: 'notifikasi', label: 'Notifikasi', Icon: IconNotifikasi, href: '/admin/notifikasi', bgLight: '#dbeafe' },
  { id: 'pengaturan', label: 'Pengaturan', Icon: IconPengaturan, href: '/admin/pengaturan', bgLight: '#f3f4f6' },
  { id: 'jadwal',     label: 'Jadwal',     Icon: IconJadwal,     href: '/admin/jadwal',     bgLight: '#f3f4f6' },
]

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AdminDashboardClient({
  fullName, avatarInitial, avatarUrl,
  isAdmin = false, stats = null, trendData,
}: Props) {
  const [now, setNow]                 = useState<Date>(() => new Date())
  const [activities, setActivities]   = useState<AktivitasItem[]>([])
  const [actLoading, setActLoading]   = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const [chartData, setChartData] = useState<TrenBulan[]>(() => {
    if (trendData && trendData.length > 0) return trendData
    return [
      { month: 'Nov', year: 2025, pendaftar: 12,  terverifikasi: 8  },
      { month: 'Des', year: 2025, pendaftar: 30,  terverifikasi: 20 },
      { month: 'Jan', year: 2026, pendaftar: 52,  terverifikasi: 36 },
      { month: 'Feb', year: 2026, pendaftar: 78,  terverifikasi: 58 },
      { month: 'Mar', year: 2026, pendaftar: 98,  terverifikasi: 74 },
      { month: 'Apr', year: 2026, pendaftar: 112, terverifikasi: 90 },
    ]
  })

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/aktivitas?limit=4', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json.data)) setActivities(json.data)
      }
    } catch { /* silent */ } finally {
      setActLoading(false)
    }
  }, [])

  const fetchTrend = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tren', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json.data) && json.data.length > 0) setChartData(json.data)
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetch('/api/notifications?unread=true')
      .then(r => r.json())
      .then(j => setUnreadCount(j.unreadCount ?? 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    fetchTrend()
    fetchActivities()
    const interval = setInterval(() => { fetchTrend(); fetchActivities() }, 30_000)
    return () => clearInterval(interval)
  }, [fetchTrend, fetchActivities, isAdmin])

  const hour     = now.getHours()
  const greeting = getGreeting(hour)
  const s: Stats = stats ?? { total: 112, menunggu: 28, diproses: 0, diterima: 66, ditolak: 18 }
  const terVerif = s.diterima + s.diproses

  // ── Line chart ──────────────────────────────────────────────────────────────
  const CW = 140, CH = 58
  const maxV    = Math.max(...chartData.map(d => d.pendaftar), 10)
  const pts     = chartData.map((d, i) => ({
    x: (i / (chartData.length - 1)) * CW,
    y: CH - (d.pendaftar / maxV) * (CH - 6),
  }))
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath}L${CW},${CH}L0,${CH}Z`

  // ── Donut chart ─────────────────────────────────────────────────────────────
  const daerah = [
    { name: 'Kota Bandung', pct: 45, color: '#7c3aed' },
    { name: 'Kab. Bandung', pct: 30, color: '#ec4899' },
    { name: 'Garut',        pct: 12, color: '#a78bfa' },
    { name: 'Lainnya',      pct: 13, color: '#e2e8f0' },
  ]
  const R = 30, DCX = 38, DCY = 38, CIRC = 2 * Math.PI * R
  let cumPct = 0
  const donutSlices = daerah.map(d => {
    const dash   = (d.pct / 100) * CIRC
    const offset = -(cumPct / 100) * CIRC
    cumPct += d.pct
    return { ...d, dash, offset }
  })

  // ── Fallback activities ─────────────────────────────────────────────────────
  const fakeActs: AktivitasItem[] = [
    { id: '1', name: 'Ahmad Fadillah', type: 'diverifikasi',  time: '10 menit lalu', sub: 'MTs Kelas 7',  raw_at: new Date().toISOString() },
    { id: '2', name: 'Siti Aisyah',    type: 'diproses',      time: '30 menit lalu', sub: 'MTs Kelas 7',  raw_at: new Date().toISOString() },
    { id: '3', name: 'Rizky Ramadhan', type: 'berkas_update', time: '1 jam lalu',    sub: 'MA Kelas 10',  raw_at: new Date().toISOString() },
    { id: '4', name: 'Dewi Lestari',   type: 'ditolak',       time: '2 jam lalu',    sub: 'MTs Kelas 7',  raw_at: new Date().toISOString() },
  ]
  const displayActs = activities.length > 0 ? activities : (actLoading ? [] : fakeActs)

  // Shadows
  const cardShadow = '0 10px 30px rgba(109,61,245,0.08), 0 2px 8px rgba(0,0,0,0.04)'

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans','Inter',system-ui,-apple-system,sans-serif",
      background: '#F8FAFC',
      minHeight: '100dvh',
      maxWidth: 430,
      margin: '0 auto',
      overflowX: 'hidden',
    }}>

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#fff',
        padding: '44px 20px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <Link href="/admin/profile" style={{
            width: 50, height: 50, borderRadius: '50%',
            border: '2.5px solid #ede9fe', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', flexShrink: 0,
            background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
            boxShadow: '0 4px 14px rgba(109,40,217,0.28)',
          }}>
            {avatarUrl
              ? <Image src={avatarUrl} alt={fullName} width={50} height={50}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  referrerPolicy="no-referrer" unoptimized/>
              : <span style={{ color: '#fff', fontWeight: 800, fontSize: 19 }}>{avatarInitial}</span>
            }
          </Link>
          <div>
            <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, margin: 0 }}>{greeting}</p>
            <p style={{ fontSize: 19, fontWeight: 800, color: '#111827', margin: '1px 0 0', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
              {fullName}
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0', fontWeight: 500 }}>Admin Penerimaan Santri</p>
          </div>
        </div>

        {/* Bell icon */}
        <Link href="/admin/notifikasi" style={{
          width: 44, height: 44, borderRadius: '50%',
          background: '#f9fafb', border: '1.5px solid #f0f0f7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', flexShrink: 0, position: 'relative',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <div style={{
              position: 'absolute', top: 7, right: 8,
              width: 9, height: 9, borderRadius: '50%',
              background: '#6D3DF5', border: '2px solid #fff',
            }}/>
          )}
        </Link>
      </div>

      {/* ══ HERO BANNER — futuristik.jpg background ══════════════════════════ */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          position: 'relative', borderRadius: 20, overflow: 'hidden',
          minHeight: 110,
          background: 'linear-gradient(125deg,#3b0764 0%,#5b21b6 40%,#7c3aed 75%,#8b5cf6 100%)',
          boxShadow: '0 8px 28px rgba(109,40,217,0.45)',
        }}>

          {/* === futuristik.jpg as background === */}
          <Image
            src="/image/futuristik.jpg"
            alt=""
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              mixBlendMode: 'luminosity',
              opacity: 0.35,
            }}
            unoptimized
            priority
          />

          {/* Dark purple gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(110deg, rgba(30,5,100,0.95) 0%, rgba(76,29,149,0.85) 45%, rgba(109,40,217,0.60) 100%)',
            zIndex: 1,
          }}/>

          {/* Top shimmer line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(167,139,250,0.55),transparent)', zIndex: 3 }}/>

          {/* ─── Content ─── */}
          <div style={{ position: 'relative', zIndex: 4, padding: '14px 18px 14px' }}>

            {/* Chip: Tahun Ajaran Aktif */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 99, padding: '3px 10px 3px 8px', marginBottom: 8,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 5px #a78bfa' }}/>
              <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 8.5, fontWeight: 700, margin: 0, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                Tahun Ajaran Aktif
              </p>
            </div>

            {/* Tahun + Aktif badge row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1, letterSpacing: '-1px' }}>
                2026 / 2027
              </p>
              {/* Aktif badge — green pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'rgba(52,211,153,0.18)', border: '1px solid rgba(52,211,153,0.45)',
                borderRadius: 99, padding: '3px 9px',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 4px #34d399' }}/>
                <span style={{ color: '#6ee7b7', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.2 }}>Aktif</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.14)', marginBottom: 8, width: '70%' }}/>

            {/* Periode Pendaftaran */}
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 8.5, fontWeight: 600, margin: '0 0 3px', letterSpacing: 0.3, textTransform: 'uppercase' }}>
              Periode Pendaftaran
            </p>
            <p style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: 0, letterSpacing: '-0.2px' }}>
              01 Jan 2026 – 30 Apr 2026
            </p>
          </div>
        </div>
      </div>

      {/* ══ 4 STAT CARDS — 4 kolom horizontal seperti beranda.png ════════════ */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {([
            {
              label: 'Total Pendaftar', value: s.total, change: '+12%', pos: true,
              iconBg: '#EDE9FE', iconColor: '#6D3DF5',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#6D3DF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="#6D3DF5" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#6D3DF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: 'Terverifikasi', value: terVerif, change: '+8%', pos: true,
              iconBg: '#D1FAE5', iconColor: '#059669',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22 4 12 14.01 9 11.01" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: 'Menunggu', value: s.menunggu, change: '-4%', pos: false,
              iconBg: '#FEF3C7', iconColor: '#D97706',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#D97706" strokeWidth="2"/>
                  <polyline points="12 6 12 12 16 14" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: 'Ditolak', value: s.ditolak, change: '-2%', pos: false,
              iconBg: '#FEE2E2', iconColor: '#DC2626',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              ),
            },
          ] as const).map((c, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '12px 10px 10px',
              boxShadow: cardShadow,
            }}>
              {/* Icon rounded */}
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: c.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 8,
              }}>
                {c.icon}
              </div>

              {/* Label */}
              <p style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600, margin: '0 0 2px', letterSpacing: 0.1, lineHeight: 1.3 }}>
                {c.label}
              </p>

              {/* Big number */}
              <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1, margin: 0, letterSpacing: '-0.8px' }}>
                {c.value}
              </p>

              {/* % change */}
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: c.pos ? '#059669' : '#DC2626',
                display: 'inline-block', marginTop: 4,
              }}>
                {c.change}
              </span>

              {/* Sub text */}
              <p style={{ fontSize: 8.5, color: '#D1D5DB', margin: '1px 0 0', fontWeight: 500, lineHeight: 1.3 }}>
                Dari bulan lalu
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ MENU CEPAT ════════════════════════════════════════════════════════ */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: '#FFFFFF', borderRadius: 24,
          padding: '18px 16px 20px',
          boxShadow: cardShadow,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.2px' }}>Menu Cepat</p>
            <Link href="/admin/all-menu" style={{ fontSize: 11, color: '#6D3DF5', textDecoration: 'none', fontWeight: 600 }}>
              Lihat Semua
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {QUICK_MENU.map((item) => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 8, padding: '10px 4px 8px',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 18,
                    background: item.bgLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 12px ${item.bgLight}cc`,
                  }}>
                    <item.Icon />
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', margin: 0, textAlign: 'center' }}>
                    {item.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CHARTS ROW ════════════════════════════════════════════════════════ */}
      <div style={{ padding: '14px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Pendaftaran per Bulan */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '14px', boxShadow: cardShadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>Pendaftaran per Bulan</p>
            <Link href="/admin/laporan" style={{ fontSize: 9.5, color: '#6D3DF5', textDecoration: 'none', fontWeight: 700, flexShrink: 0 }}>Lihat</Link>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: '4px 0 0', lineHeight: 1 }}>{s.total}</p>
          <p style={{ fontSize: 9.5, color: '#9ca3af', margin: '2px 0 6px' }}>Mendaftar</p>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: '#d1fae5', color: '#059669',
            fontSize: 8.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, marginBottom: 8,
          }}>+18% dari bulan lalu</span>
          <svg width="100%" height="50" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6D3DF5" stopOpacity="0.20"/>
                <stop offset="100%" stopColor="#6D3DF5" stopOpacity="0.01"/>
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#lg1)"/>
            <path d={linePath} fill="none" stroke="#6D3DF5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y}
                r={i === pts.length - 1 ? 4 : 2.5}
                fill={i === pts.length - 1 ? '#6D3DF5' : '#a78bfa'}
                stroke="white" strokeWidth="1.5"/>
            ))}
          </svg>
        </div>

        {/* Asal Daerah */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '14px', boxShadow: cardShadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#111827', margin: 0 }}>Asal Daerah</p>
            <Link href="/admin/laporan" style={{ fontSize: 9.5, color: '#6D3DF5', textDecoration: 'none', fontWeight: 700 }}>Lihat</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
            {daerah.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, flexShrink: 0 }}/>
                  <p style={{ fontSize: 8.5, color: '#6b7280', margin: 0 }}>{d.name}</p>
                </div>
                <p style={{ fontSize: 8.5, fontWeight: 700, color: '#374151', margin: 0 }}>{d.pct}%</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <svg width="76" height="76" viewBox="0 0 76 76">
                {donutSlices.map((d, i) => (
                  <circle key={i} cx={DCX} cy={DCY} r={R}
                    fill="none" stroke={d.color} strokeWidth="13"
                    strokeDasharray={`${d.dash} ${CIRC}`}
                    strokeDashoffset={d.offset}
                    transform={`rotate(-90 ${DCX} ${DCY})`}
                    strokeLinecap="butt"/>
                ))}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 900, color: '#111827', lineHeight: 1, margin: 0 }}>{s.total}</p>
                <p style={{ fontSize: 7, color: '#9ca3af', margin: '1px 0 0' }}>Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ AKTIVITAS TERBARU ════════════════════════════════════════════════ */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ background: '#FFFFFF', borderRadius: 20, overflow: 'hidden', boxShadow: cardShadow }}>
          <div style={{ padding: '18px 18px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Aktivitas Terbaru</p>
            <Link href="/admin/aktivitas" style={{ fontSize: 11, color: '#6D3DF5', textDecoration: 'none', fontWeight: 700 }}>Lihat Semua</Link>
          </div>
          <div style={{ height: 1, background: '#F3F4F6' }}/>

          {actLoading ? (
            <div style={{ padding: '8px 18px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: '#f3f4f6', flexShrink: 0 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, marginBottom: 6, width: '45%' }}/>
                    <div style={{ height: 8,  background: '#f9fafb', borderRadius: 4, width: '70%' }}/>
                  </div>
                  <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, width: 52 }}/>
                </div>
              ))}
            </div>
          ) : displayActs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ fontSize: 32, margin: '0 0 8px' }}>📭</p>
              <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, margin: 0 }}>Belum ada aktivitas</p>
            </div>
          ) : (
            displayActs.map((act, i) => {
              const cfg    = AKTIVITAS_CONFIG[act.type] ?? AKTIVITAS_CONFIG.pendaftar_baru
              const isLast = i === displayActs.length - 1
              return (
                <div key={act.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 18px',
                  borderBottom: isLast ? 'none' : '1px solid #F9FAFB',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                    background: cfg.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 3px 10px ${cfg.bg}55`,
                  }}>
                    <AktivitasIcon type={act.type}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {act.name}
                    </p>
                    <p style={{ fontSize: 11, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getAktivitasDesc(act.type)}
                    </p>
                  </div>
                  <p style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0, margin: 0, whiteSpace: 'nowrap' }}>
                    {act.time}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ══ PENGUMUMAN + LAPORAN & ANALITIK ════════════════════ */}
      <div style={{ padding: '14px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* ── Pengumuman Card ── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 22,
          padding: '16px 14px 14px',
          boxShadow: cardShadow,
          overflow: 'hidden',
          position: 'relative',
          minHeight: 180,
        }}>
          {/* Small decorative image — bottom right corner */}
          <div style={{
            position: 'absolute', right: -8, bottom: -8,
            width: 90, height: 90, borderRadius: '50%',
            overflow: 'hidden', opacity: 0.13, pointerEvents: 'none',
          }}>
            <Image
              src="/image/pengumuman.png"
              alt=""
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              unoptimized
            />
          </div>

          {/* Subtle purple tint on right side */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(255,255,255,0) 40%, rgba(109,61,245,0.07) 100%)',
            borderRadius: 22,
          }}/>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Icon row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11,
                background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(109,40,217,0.35)',
              }}>
                {/* Modern megaphone icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9.5V14.5C3 15.328 3.672 16 4.5 16H7L9 21H11.5L9.5 16H10.5C14.5 16 19.5 18.5 19.5 18.5V5.5C19.5 5.5 14.5 8 10.5 8H4.5C3.672 8 3 8.672 3 9.5Z"
                    fill="white" fillOpacity="0.95"/>
                  <path d="M17 7Q19 9.5 19 12Q19 14.5 17 17"
                    stroke="white" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <p style={{ fontSize: 12.5, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
                Pengumuman
              </p>
            </div>

            <p style={{ fontSize: 9, color: '#9CA3AF', lineHeight: 1.55, margin: '0 0 auto', fontWeight: 400 }}>
              Informasi terbaru untuk calon santri
            </p>

            {/* CTA Button */}
            <Link href="/admin/pengumuman" style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 9.5, fontWeight: 700, color: '#6D3DF5', textDecoration: 'none',
              background: '#F5F0FF',
              border: '1.5px solid #DDD6FE',
              borderRadius: 10, padding: '6px 11px',
              marginTop: 12, alignSelf: 'flex-start',
              boxShadow: '0 2px 8px rgba(109,61,245,0.10)',
            }}>
              Buat Pengumuman
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>

        {/* ── Laporan & Analitik Card ── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 22,
          padding: '16px 14px 14px',
          boxShadow: cardShadow,
          overflow: 'hidden',
          position: 'relative',
          minHeight: 180,
        }}>
          {/* Small decorative image — bottom right corner */}
          <div style={{
            position: 'absolute', right: -8, bottom: -8,
            width: 90, height: 90, borderRadius: '50%',
            overflow: 'hidden', opacity: 0.13, pointerEvents: 'none',
          }}>
            <Image
              src="/image/laporan.jpg"
              alt=""
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              unoptimized
            />
          </div>

          {/* Subtle amber tint on right side */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(255,255,255,0) 40%, rgba(217,119,6,0.07) 100%)',
            borderRadius: 22,
          }}/>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Icon row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11,
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(217,119,6,0.35)',
              }}>
                {/* Modern bar chart + trend icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3"  y="13" width="4" height="8"  rx="1.5" fill="white" fillOpacity="0.55"/>
                  <rect x="10" y="8"  width="4" height="13" rx="1.5" fill="white" fillOpacity="0.80"/>
                  <rect x="17" y="4"  width="4" height="17" rx="1.5" fill="white" fillOpacity="0.95"/>
                  <polyline points="5 11 12 6.5 19 3"
                    stroke="white" strokeOpacity="0.95" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="5"  cy="11"  r="1.4" fill="white"/>
                  <circle cx="12" cy="6.5" r="1.4" fill="white"/>
                  <circle cx="19" cy="3"   r="1.4" fill="white"/>
                </svg>
              </div>
              <p style={{ fontSize: 12.5, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
                Laporan &amp; Analitik
              </p>
            </div>

            <p style={{ fontSize: 9, color: '#9CA3AF', lineHeight: 1.55, margin: '0 0 auto', fontWeight: 400 }}>
              Lihat laporan dan statistik pendaftaran
            </p>

            {/* CTA Button */}
            <Link href="/admin/laporan" style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 9.5, fontWeight: 700, color: '#D97706', textDecoration: 'none',
              background: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              borderRadius: 10, padding: '6px 11px',
              marginTop: 12, alignSelf: 'flex-start',
              boxShadow: '0 2px 8px rgba(217,119,6,0.10)',
            }}>
              Lihat Laporan
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ height: 90 }}/>

      {/* ══ BOTTOM NAVIGATION ════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid #F3F4F6',
        display: 'grid', gridTemplateColumns: 'repeat(5,1fr)',
        padding: '10px 4px 28px',
        zIndex: 100,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
      }}>
        {([
          { icon: (a: boolean) => <NavHome active={a}/>,       label: 'Beranda',    active: true,  href: '/admin/dashboard'  },
          { icon: (a: boolean) => <NavPendaftar active={a}/>,  label: 'Pendaftar',  active: false, href: '/admin/pendaftar'  },
          { icon: (a: boolean) => <NavVerifikasi active={a}/>, label: 'Verifikasi', active: false, href: '/admin/verifikasi' },
          { icon: (a: boolean) => <NavLaporan active={a}/>,    label: 'Laporan',    active: false, href: '/admin/laporan'    },
          { icon: (a: boolean) => <NavPengaturan active={a}/>, label: 'Pengaturan', active: false, href: '/admin/pengaturan' },
        ] as const).map(item => (
          <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative', paddingTop: 4 }}>
              {item.active && (
                <div style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  width: 28, height: 3, borderRadius: 2,
                  background: 'linear-gradient(90deg,#6D3DF5,#8B5CF6)',
                }}/>
              )}
              {item.icon(item.active)}
              <p style={{
                fontSize: 9.5, margin: 0,
                fontWeight: item.active ? 700 : 500,
                color: item.active ? '#6D3DF5' : '#9ca3af',
              }}>{item.label}</p>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  )
}