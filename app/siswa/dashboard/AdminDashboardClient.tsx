'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Pendaftaran } from '@/types'
import type { TrenBulan } from '@/types/tren'
import type { AktivitasItem } from '@/app/api/admin/aktivitas/route'
import { useSettings } from '@/contexts/SettingsContext'

// ── Theme palette (light/dark) ──────────────────────────────────────────────
const PALETTE = {
  light: {
    pageBg:        '#F8FAFC',
    topbarBg:      '#ffffff',
    cardBg:        '#ffffff',
    textPrimary:   '#111827',
    textSecondary: '#6b7280',
    textMuted:     '#9ca3af',
    textFaint:     '#D1D5DB',
    divider:       '#F3F4F6',
    dividerSoft:   '#F9FAFB',
    skeletonBg:    '#f3f4f6',
    skeletonBg2:   '#f9fafb',
    bellBg:        '#f9fafb',
    bellBorder:    '#f0f0f7',
    bellIcon:      '#374151',
    quickLabel:    '#374151',
    navBg:         'rgba(255,255,255,0.98)',
    navBorder:     '#F3F4F6',
    navInactive:   '#9ca3af',
  },
  dark: {
    pageBg:        '#15131f',
    topbarBg:      '#1e1b2e',
    cardBg:        '#1e1b2e',
    textPrimary:   '#f1f0f5',
    textSecondary: '#b3aec4',
    textMuted:     '#8b86a3',
    textFaint:     '#6b6680',
    divider:       '#2e2a40',
    dividerSoft:   '#262236',
    skeletonBg:    '#2a2640',
    skeletonBg2:   '#231f35',
    bellBg:        '#241f38',
    bellBorder:    '#332c4d',
    bellIcon:      '#d8d4e8',
    quickLabel:    '#d8d4e8',
    navBg:         'rgba(30,27,46,0.98)',
    navBorder:     '#2e2a40',
    navInactive:   '#6b6680',
  },
} as const

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

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (days  > 0) return `${days} hari lalu`
  if (hours > 0) return `${hours} jam lalu`
  if (mins  > 0) return `${mins} menit lalu`
  return 'Baru saja'
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
  pendaftar_baru: { bg: '#f59e0b' },
  diverifikasi:   { bg: '#10b981' },
  berkas_update:  { bg: '#f59e0b' },
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={c} strokeWidth="2.2" {...sl}/>
      <polyline points="22 4 12 14.01 9 11.01" stroke={c} strokeWidth="2.2" {...sl}/>
    </svg>
  )
  if (type === 'ditolak') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2.2"/>
      <line x1="15" y1="9" x2="9" y2="15" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="9" y1="9" x2="15" y2="15" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  )
  if (type === 'pembayaran' || type === 'pendaftar_baru' || type === 'berkas_update' || type === 'diproses') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke={c} strokeWidth="2" {...sl}/>
      <path d="M3 10h18" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 15h.01M11 15h3" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
const NavProfil = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? '#6d28d9' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Quick Menu SVG Icons (inline SVG, tidak bergantung file gambar) ────────────
const IconVerifikasi = () => (
  <div style={{
    width: 52, height: 52, borderRadius: 16,
    background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M9 11l3 3L22 4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
)

// ── Menu Cepat Admin Items ────────────────────────────────────────────────────
const QUICK_MENU = [
  { id: 'verifikasi', label: 'Verifikasi', Icon: () => <Image src="/icons/verifikasi-icon.png" alt="Jadwal" width={52} height={52} />,     href: '/admin/verifikasi' },
  { id: 'jadwal',     label: 'Jadwal' ,    Icon: () => <Image src="/icons/jadwal icon.png" alt="Jadwal" width={52} height={52} />,         href: '/admin/jadwal'},
  { id: 'berkas',     label: 'Berkas',     Icon: () => <Image src="/icons/berkas icon.png" alt="Berkas" width={52} height={52} />,         href: '/admin/berkas'},
  { id: 'pengumuman', label: 'Pengumuman', Icon: () => <Image src="/icons/pengumuman icon.png" alt="Pengumuman" width={52} height={52} />, href: '/admin/pengumuman'},
  { id: 'chat',       label: 'Chat',       Icon: () => <Image src="/icons/chat icon.png" alt="Chat" width={52} height={52} />,             href: '/admin/chat'},
]

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AdminDashboardClient({
  fullName, avatarInitial, avatarUrl,
  isAdmin = false, stats = null, trendData,
}: Props) {
  const { theme } = useSettings()
  const p = PALETTE[theme]

  const [now, setNow]                 = useState<Date>(() => new Date())
  const [activities, setActivities]   = useState<AktivitasItem[]>([])
  const [actLoading, setActLoading]   = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const [chartData, setChartData] = useState<TrenBulan[]>(() => {
    if (trendData && trendData.length > 0) return trendData
    return [
      { month: 'Jan', year: 2026, pendaftar: 2,  terverifikasi: 1  },
      { month: 'Feb', year: 2026, pendaftar: 3,  terverifikasi: 2  },
      { month: 'Mar', year: 2026, pendaftar: 5,  terverifikasi: 4  },
      { month: 'Apr', year: 2026, pendaftar: 7,  terverifikasi: 5  },
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
  const s: Stats = stats ?? { total: 7, menunggu: 0, diproses: 0, diterima: 7, ditolak: 0 }
  const terVerif = s.diterima + s.diproses

  // ── Line chart ─────────────────────────────────────────────────────────────
  const CW = 170, CH = 64
  const maxV    = Math.max(...chartData.map(d => d.pendaftar), 1)
  const pts     = chartData.map((d, i) => ({
    x: chartData.length > 1
      ? (i / (chartData.length - 1)) * CW
      : CW / 2,
    y: CH - (d.pendaftar / maxV) * (CH - 8),
  }))
  const linePath = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath}L${CW},${CH}L0,${CH}Z`

  // ── Per-month breakdown ─────────────────────────────────────────────────────
  const MONTH_FULL: Record<string, string> = {
    Jan: 'Januari', Feb: 'Februari', Mar: 'Maret', Apr: 'April',
    Mei: 'Mei', Jun: 'Juni', Jul: 'Juli', Agt: 'Agustus',
    Sep: 'September', Okt: 'Oktober', Nov: 'November', Des: 'Desember',
  }
  // Bulan-bulan yang ditampilkan di tabel kanan (max 4 bulan terakhir)
  const lastMonths = chartData.slice(-4)

  // ── Fallback activities ─────────────────────────────────────────────────────
  const fakeActs: AktivitasItem[] = [
    { id: '1', name: 'Pembayaran al basyari al faruq', type: 'pembayaran',     time: '21 jam lalu', sub: '', raw_at: new Date(Date.now() - 21*3600*1000).toISOString() },
    { id: '2', name: 'Pembayaran Muhammad Soleh j...',  type: 'pembayaran',     time: '4 hari lalu', sub: '', raw_at: new Date(Date.now() - 4*86400*1000).toISOString()  },
    { id: '3', name: 'Pembayaran M. Naufal Al basyari', type: 'pembayaran',    time: '6 hari lalu', sub: '', raw_at: new Date(Date.now() - 6*86400*1000).toISOString()  },
    { id: '4', name: 'Status liman diperbarui',          type: 'diverifikasi', time: '25 hari lalu',sub: '', raw_at: new Date(Date.now() - 25*86400*1000).toISOString() },
  ]
  const displayActs = activities.length > 0 ? activities : (actLoading ? [] : fakeActs)

  // Shadows
  const cardShadow = '0 2px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)'

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans','Inter',system-ui,-apple-system,sans-serif",
      background: p.pageBg,
      minHeight: '100dvh',
      maxWidth: 430,
      margin: '0 auto',
      overflowX: 'hidden',
    }}>

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      <div style={{
        background: p.topbarBg,
        padding: '52px 20px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Avatar + greeting + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/profile" style={{
            width: 52, height: 52, borderRadius: '50%',
            border: '2.5px solid #ede9fe', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', flexShrink: 0,
            background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
            boxShadow: '0 4px 14px rgba(109,40,217,0.22)',
          }}>
            {avatarUrl
              ? <Image src={avatarUrl} alt={fullName} width={52} height={52}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  referrerPolicy="no-referrer" unoptimized/>
              : <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>{avatarInitial}</span>
            }
          </Link>
          <div>
            <p style={{ fontSize: 12, color: p.textMuted, fontWeight: 500, margin: 0 }}>{greeting}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: p.textPrimary, margin: '1px 0 0', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
              {fullName}
            </p>
            <p style={{ fontSize: 11.5, color: p.textMuted, margin: '2px 0 0', fontWeight: 500 }}>Admin Penerimaan Santri</p>
          </div>
        </div>

        {/* Bell + Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/admin/notifikasi" style={{
            width: 42, height: 42, borderRadius: '50%',
            background: p.bellBg, border: `1.5px solid ${p.bellBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', flexShrink: 0, position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={p.bellIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: 7, right: 8,
                width: 9, height: 9, borderRadius: '50%',
                background: '#6D3DF5', border: `2px solid ${p.topbarBg}`,
              }}/>
            )}
          </Link>

          <Link href="/admin/pengaturan" style={{
            width: 42, height: 42, borderRadius: '50%',
            background: p.bellBg, border: `1.5px solid ${p.bellBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={p.bellIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* ═══════════════ HERO BANNER ═══════════════ */}
      <div style={{ padding: '12px 16px 0' }}>
        <Link
          href="/admin/laporan"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 8',
              borderRadius: 24,
              overflow: 'hidden',
              background: '#F5F3FF',
              boxShadow: '0 12px 30px rgba(109,61,245,.16)',
            }}
          >
            <Image
              src="/icons/beranda-admin-banner.png"
              alt="Beranda Admin Banner"
              fill
              priority
              sizes="100vw"
              style={{
                objectFit: 'cover',
              }}
            />
          </div>
        </Link>
      </div>

      {/* ══ 4 STAT CARDS — 1 baris × 4 kolom seperti target desain ═════════ */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
          {([
            {
              label: 'Total Pendaftar', value: s.total, change: '+12%', pos: true,
              iconBg: '#EDE9FE', iconStroke: '#6D3DF5',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#6D3DF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="#6D3DF5" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#6D3DF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: 'Verifikasi', value: terVerif, change: '+40%', pos: true,
              iconBg: '#D1FAE5', iconStroke: '#059669',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#059669" strokeWidth="2"/>
                  <path d="M8 12l2.5 2.5L16 9" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: 'Menunggu', value: s.menunggu, change: '-8%', pos: false,
              iconBg: '#FEF3C7', iconStroke: '#D97706',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#D97706" strokeWidth="2"/>
                  <polyline points="12 6 12 12 16 14" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: 'Ditolak', value: s.ditolak, change: '-2%', pos: false,
              iconBg: '#FEE2E2', iconStroke: '#DC2626',
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
              background: p.cardBg,
              borderRadius: 16,
              padding: '12px 10px 11px',
              boxShadow: cardShadow,
              minWidth: 0,
            }}>
              {/* Icon circle */}
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: c.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 8,
              }}>
                {c.icon}
              </div>
              {/* Label */}
              <p style={{
                fontSize: 9.5, color: p.textMuted, fontWeight: 500, margin: '0 0 2px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {c.label}
              </p>
              {/* Big number */}
              <p style={{ fontSize: 22, fontWeight: 800, color: p.textPrimary, lineHeight: 1, margin: 0, letterSpacing: '-0.8px' }}>
                {c.value}
              </p>
              {/* % change */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 5, flexWrap: 'nowrap' }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                  {c.pos
                    ? <path d="M6 2L10 7H2L6 2Z" fill="#059669"/>
                    : <path d="M6 10L2 5H10L6 10Z" fill="#DC2626"/>
                  }
                </svg>
                <span style={{
                  fontSize: 9.5, fontWeight: 700, whiteSpace: 'nowrap',
                  color: c.pos ? '#059669' : '#DC2626',
                }}>{c.change}</span>
              </div>
              <p style={{ fontSize: 8, color: p.textMuted, fontWeight: 400, margin: '1px 0 0' }}>dari bulan lalu</p>
            </div>
          ))}
        </div>
      </div>


      {/* ══ PENDAFTAR PER BULAN ══════════════════════════════════════════════ */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ background: p.cardBg, borderRadius: 20, padding: '18px 16px', boxShadow: cardShadow }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: p.textPrimary, margin: 0 }}>Pendaftar per Bulan</p>
            <Link href="/admin/laporan" style={{ fontSize: 11.5, color: '#6D3DF5', textDecoration: 'none', fontWeight: 700 }}>Lihat Semua</Link>
          </div>

          {/* Content: chart kiri + tabel kanan */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 8 }}>

            {/* LEFT: chart area */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Total + badge */}
              <p style={{ fontSize: 32, fontWeight: 900, color: p.textPrimary, margin: '0 0 2px', lineHeight: 1, letterSpacing: '-1.5px' }}>
                {s.total}
              </p>
              <p style={{ fontSize: 11, color: p.textMuted, margin: '0 0 6px' }}>Pendaftar</p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: '#D1FAE5', borderRadius: 99, padding: '3px 9px', marginBottom: 10,
              }}>
                <svg width="9" height="9" viewBox="0 0 12 12"><path d="M6 2L10 7H2L6 2Z" fill="#059669"/></svg>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#059669' }}>18% dari bulan lalu</span>
              </div>

              {/* Line chart */}
              <svg width="100%" height="60" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6D3DF5" stopOpacity="0.18"/>
                    <stop offset="100%" stopColor="#6D3DF5" stopOpacity="0.01"/>
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#areaGrad)"/>
                <path d={linePath} fill="none" stroke="#6D3DF5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                {pts.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y}
                    r={i === pts.length - 1 ? 4.5 : 3}
                    fill={i === pts.length - 1 ? '#6D3DF5' : '#a78bfa'}
                    stroke={p.cardBg} strokeWidth="1.5"/>
                ))}
              </svg>

              {/* X axis labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {chartData.map((d, i) => (
                  <p key={i} style={{ fontSize: 9, color: p.textMuted, margin: 0, fontWeight: 500 }}>{d.month}</p>
                ))}
              </div>
            </div>

            {/* RIGHT: bulan breakdown */}
            <div style={{ width: 120, flexShrink: 0 }}>
              {/* Spacer to align with chart */}
              <div style={{ height: 68 }}/>
              {lastMonths.map((d, i) => {
                // Hitung pendaftar bulan itu (non-cumulative)
                const prev = i === 0 ? 0 : (chartData[chartData.length - lastMonths.length + i - 1]?.pendaftar ?? 0)
                const thisMonth = i === 0
                  ? chartData[chartData.length - lastMonths.length]?.pendaftar ?? d.pendaftar
                  : d.pendaftar - prev
                return (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 0',
                    borderBottom: i < lastMonths.length - 1 ? `1px solid ${p.divider}` : 'none',
                  }}>
                    <p style={{ fontSize: 12, color: p.textSecondary, margin: 0 }}>
                      {MONTH_FULL[d.month] ?? d.month}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: p.textPrimary, margin: 0 }}>
                      {Math.max(0, thisMonth)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ MENU CEPAT ════════════════════════════════════════════════════════ */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: p.cardBg, borderRadius: 22,
          padding: '18px 14px 16px',
          boxShadow: cardShadow,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: p.textPrimary, margin: 0 }}>Menu Cepat</p>
            <Link href="/admin/all-menu" style={{ fontSize: 11.5, color: '#6D3DF5', textDecoration: 'none', fontWeight: 600 }}>
              Lihat Semua
            </Link>
          </div>

          {/* Row 1: 5 items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 6 }}>
            {QUICK_MENU.slice(0, 5).map((item) => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '6px 2px',
                }}>
                  <item.Icon />
                  <p style={{ fontSize: 10, fontWeight: 600, color: p.quickLabel, margin: 0, textAlign: 'center', lineHeight: 1.2 }}>
                    {item.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 2: 4 items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {QUICK_MENU.slice(5, 9).map((item) => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '6px 2px',
                }}>
                  <item.Icon />
                  <p style={{ fontSize: 10, fontWeight: 600, color: p.quickLabel, margin: 0, textAlign: 'center', lineHeight: 1.2 }}>
                    {item.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══ AKTIVITAS TERBARU ════════════════════════════════════════════════ */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ background: p.cardBg, borderRadius: 20, overflow: 'hidden', boxShadow: cardShadow }}>
          {/* Header */}
          <div style={{ padding: '16px 18px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: p.textPrimary, margin: 0 }}>Aktivitas Terbaru</p>
            <Link href="/admin/aktivitas" style={{ fontSize: 11.5, color: '#6D3DF5', textDecoration: 'none', fontWeight: 700 }}>Lihat Semua</Link>
          </div>

          {actLoading ? (
            <div style={{ padding: '0 18px 8px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? `1px solid ${p.dividerSoft}` : 'none' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: p.skeletonBg, flexShrink: 0 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 10, background: p.skeletonBg, borderRadius: 5, marginBottom: 6, width: '55%' }}/>
                    <div style={{ height: 8, background: p.skeletonBg2, borderRadius: 4, width: '75%' }}/>
                  </div>
                  <div style={{ height: 8, background: p.skeletonBg, borderRadius: 4, width: 55 }}/>
                </div>
              ))}
            </div>
          ) : displayActs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ fontSize: 32, margin: '0 0 8px' }}>📭</p>
              <p style={{ fontSize: 12, color: p.textMuted, fontWeight: 600, margin: 0 }}>Belum ada aktivitas</p>
            </div>
          ) : (
            displayActs.map((act, i) => {
              const cfg    = AKTIVITAS_CONFIG[act.type] ?? AKTIVITAS_CONFIG.pendaftar_baru
              const isLast = i === displayActs.length - 1
              return (
                <div key={act.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 18px',
                  borderBottom: isLast ? 'none' : `1px solid ${p.dividerSoft}`,
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                    background: cfg.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 3px 10px ${cfg.bg}44`,
                  }}>
                    <AktivitasIcon type={act.type}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: p.textPrimary, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {act.name}
                    </p>
                    <p style={{ fontSize: 11, color: p.textSecondary, margin: 0 }}>
                      {getAktivitasDesc(act.type)}
                    </p>
                  </div>
                  <p style={{ fontSize: 10.5, color: p.textMuted, flexShrink: 0, margin: 0, whiteSpace: 'nowrap' }}>
                    {act.time}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ══ PENGUMUMAN + LAPORAN & ANALITIK ════════════════════════════════════ */}
      <div style={{ padding: '14px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* ── Pengumuman Card ── */}
        <div style={{
          background: p.cardBg,
          borderRadius: 22,
          padding: '16px 14px 14px',
          boxShadow: cardShadow,
          overflow: 'hidden',
          position: 'relative',
          minHeight: 190,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Purple tint */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(145deg, rgba(255,255,255,0) 30%, rgba(109,61,245,0.05) 100%)',
            borderRadius: 22,
          }}/>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: p.textPrimary, margin: '0 0 6px', letterSpacing: '-0.2px' }}>
              Pengumuman
            </p>
            <p style={{ fontSize: 10.5, color: p.textMuted, lineHeight: 1.55, margin: 0, fontWeight: 400 }}>
              Informasi terbaru untuk calon santri
            </p>

            {/* Ilustrasi Terompet */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 0 10px',
              }}
            >
              <Image
                src="/icons/terompet-icon.png"
                alt="Pengumuman"
                width={92}
                height={92}
                priority
                style={{
                  width: '92px',
                  height: '92px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 18px rgba(109,61,245,0.18))',
                  transition: 'transform .25s ease',
                }}
              />
            </div>

            {/* CTA Button */}
            <Link href="/admin/pengumuman" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 10.5, fontWeight: 700, color: '#6D3DF5', textDecoration: 'none',
              background: '#F5F0FF',
              border: '1.5px solid #DDD6FE',
              borderRadius: 12, padding: '7px 12px',
              alignSelf: 'flex-start',
              boxShadow: '0 2px 8px rgba(109,61,245,0.10)',
            }}>
              Buat Pengumuman
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>

        {/* ── Laporan & Analitik Card ── */}
        <div style={{
          background: p.cardBg,
          borderRadius: 22,
          padding: '16px 14px 14px',
          boxShadow: cardShadow,
          overflow: 'hidden',
          position: 'relative',
          minHeight: 190,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Amber tint */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(145deg, rgba(255,255,255,0) 30%, rgba(217,119,6,0.05) 100%)',
            borderRadius: 22,
          }}/>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: p.textPrimary, margin: '0 0 6px', letterSpacing: '-0.2px' }}>
              Laporan &amp; Analitik
            </p>
            <p style={{ fontSize: 10.5, color: p.textMuted, lineHeight: 1.55, margin: 0, fontWeight: 400 }}>
              Lihat laporan dan statistik pendaftaran
            </p>

            {/* Ilustrasi Laporan */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 0 10px',
              }}
            >
              <Image
                src="/icons/laporan-grafik-icon.png"
                alt="Laporan & Analitik"
                width={90}
                height={90}
                priority
                style={{
                  width: '90px',
                  height: '90px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 18px rgba(245,158,11,.22))',
                  transition: 'transform .25s ease',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* CTA Button */}
            <Link href="/admin/laporan" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 10.5, fontWeight: 700, color: '#D97706', textDecoration: 'none',
              background: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              borderRadius: 12, padding: '7px 12px',
              alignSelf: 'flex-start',
              boxShadow: '0 2px 8px rgba(217,119,6,0.10)',
            }}>
              Lihat Laporan
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer for bottom nav */}
      <div style={{ height: 90 }}/>

      {/* ══ BOTTOM NAVIGATION ════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: p.navBg,
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${p.navBorder}`,
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
          { icon: (a: boolean) => <NavProfil active={a}/>,     label: 'Profil',     active: false, href: '/admin/profil'     },
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
                color: item.active ? '#6D3DF5' : p.navInactive,
              }}>{item.label}</p>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  )
}