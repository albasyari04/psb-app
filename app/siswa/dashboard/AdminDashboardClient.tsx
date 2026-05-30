'use client'

// app/siswa/dashboard/AdminDashboardClient.tsx
// FIX: Aktivitas Terbaru sekarang fetch dari /api/admin/aktivitas (real data)
// NEW: Desain aktivitas professional, elegant, modern dengan timeline style

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
  if (hour >= 4 && hour < 11) return 'Selamat Pagi'
  if (hour >= 11 && hour < 15) return 'Selamat Siang'
  if (hour >= 15 && hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

function getGreetingEmoji(hour: number): string {
  if (hour >= 4 && hour < 11) return '☀️'
  if (hour >= 11 && hour < 15) return '🌤️'
  if (hour >= 15 && hour < 18) return '👋'
  return '🌙'
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
}

const TARGET_SANTRI = 300

// ── Aktivitas Config ─────────────────────────────────────────────────────────
const AKTIVITAS_CONFIG: Record<AktivitasItem['type'], {
  icon: string
  iconBg: string
  iconColor: string
  dotColor: string
  badge: string
  badgeBg: string
  badgeColor: string
}> = {
  pendaftar_baru: {
    icon: '👤',
    iconBg: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
    iconColor: '#fff',
    dotColor: '#7c3aed',
    badge: 'Baru',
    badgeBg: '#ede9fe',
    badgeColor: '#6d28d9',
  },
  diverifikasi: {
    icon: '✓',
    iconBg: 'linear-gradient(135deg, #059669, #10b981)',
    iconColor: '#fff',
    dotColor: '#10b981',
    badge: 'Diterima',
    badgeBg: '#d1fae5',
    badgeColor: '#059669',
  },
  berkas_update: {
    icon: '📄',
    iconBg: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    iconColor: '#fff',
    dotColor: '#3b82f6',
    badge: 'Update',
    badgeBg: '#dbeafe',
    badgeColor: '#2563eb',
  },
  pembayaran: {
    icon: '💳',
    iconBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
    iconColor: '#fff',
    dotColor: '#f59e0b',
    badge: 'Bayar',
    badgeBg: '#fef3c7',
    badgeColor: '#b45309',
  },
  ditolak: {
    icon: '✕',
    iconBg: 'linear-gradient(135deg, #dc2626, #ef4444)',
    iconColor: '#fff',
    dotColor: '#ef4444',
    badge: 'Ditolak',
    badgeBg: '#fee2e2',
    badgeColor: '#dc2626',
  },
  diterima: {
    icon: '🎉',
    iconBg: 'linear-gradient(135deg, #059669, #10b981)',
    iconColor: '#fff',
    dotColor: '#10b981',
    badge: 'Diterima',
    badgeBg: '#d1fae5',
    badgeColor: '#059669',
  },
  diproses: {
    icon: '🔍',
    iconBg: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
    iconColor: '#fff',
    dotColor: '#0ea5e9',
    badge: 'Proses',
    badgeBg: '#e0f2fe',
    badgeColor: '#0284c7',
  },
}

// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconUsers = ({ color = '#6d28d9', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconCheck = ({ color = '#10b981', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="22 4 12 14.01 9 11.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconClock = ({ color = '#f59e0b', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <polyline points="12 6 12 12 16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconXCircle = ({ color = '#ef4444', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <line x1="15" y1="9" x2="9" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="9" y1="9" x2="15" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconHome = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="9 22 9 12 15 12 15 22" stroke={active ? 'white' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconClipboard = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="2"/>
  </svg>
)

const IconCreditCard = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="7" width="18" height="10" rx="2" stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="2"/>
    <line x1="3" y1="11" x2="21" y2="11" stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="2"/>
    <rect x="6" y="14" width="4" height="2" rx="1" fill={active ? '#7c3aed' : '#94a3b8'} />
  </svg>
)

const IconBarChart = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="20" x2="18" y2="10" stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="20" x2="12" y2="4" stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="2" strokeLinecap="round"/>
    <line x1="6" y1="20" x2="6" y2="14" stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconUser = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="2"/>
  </svg>
)

const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function AdminDashboardClient({
  fullName, avatarInitial, avatarUrl,
  isAdmin = false, stats = null, trendData,
}: Props) {
  const [now, setNow]           = useState<Date>(() => new Date())
  const [refreshing, setRefreshing]     = useState(false)
  const [actRefreshing, setActRefreshing] = useState(false)

  // ── FIX: Aktivitas dari DB, bukan hardcode ────────────────────────────────
  const [activities, setActivities] = useState<AktivitasItem[]>([])
  const [actLoading, setActLoading] = useState(true)

  const [chartData, setChartData] = useState<TrenBulan[]>(() => {
    if (trendData && trendData.length > 0) return trendData
    return [
      { month: 'Des', year: 2024, pendaftar: 0,   terverifikasi: 0 },
      { month: 'Jan', year: 2025, pendaftar: 20,  terverifikasi: 12 },
      { month: 'Feb', year: 2025, pendaftar: 55,  terverifikasi: 38 },
      { month: 'Mar', year: 2025, pendaftar: 120, terverifikasi: 85 },
      { month: 'Apr', year: 2025, pendaftar: 155, terverifikasi: 110 },
      { month: 'Mei', year: 2025, pendaftar: 178, terverifikasi: 120 },
    ]
  })

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const fetchTrend = useCallback(async () => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/admin/tren', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json.data) && json.data.length > 0) {
          setChartData(json.data)
        }
      }
    } catch { /* silent */ } finally {
      setRefreshing(false)
    }
  }, [])

  // ── FIX: Fetch aktivitas real dari database ────────────────────────────────
  const fetchActivities = useCallback(async () => {
    try {
      setActRefreshing(true)
      const res = await fetch('/api/admin/aktivitas?limit=5', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json.data)) {
          setActivities(json.data)
        }
      }
    } catch { /* silent */ } finally {
      setActRefreshing(false)
      setActLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    fetchTrend()
    fetchActivities()
    const interval = setInterval(() => {
      fetchTrend()
      fetchActivities() // ← auto-refresh tiap 30 detik
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchTrend, fetchActivities, isAdmin])

  const hour       = now.getHours()
  const greeting   = getGreeting(hour)
  const greetEmoji = getGreetingEmoji(hour)
  const dateStr    = formatDateShort(now)
  const timeStr    = formatTime(now)

  const s: Stats = stats ?? { total: 178, menunggu: 42, diproses: 0, diterima: 120, ditolak: 16 }
  const terVerif     = s.diterima + s.diproses
  const verPct       = s.total > 0 ? Math.round((terVerif / s.total) * 100) : 0
  const menungguPct  = s.total > 0 ? Math.round((s.menunggu / s.total) * 100) : 0
  const ditolakPct   = s.total > 0 ? Math.round((s.ditolak / s.total) * 100) : 0
  const progressPct  = Math.min(Math.round((s.total / TARGET_SANTRI) * 100), 100)
  const kuotaSisa    = Math.max(TARGET_SANTRI - s.total, 0)

  const maxVal = Math.max(...chartData.map(d => d.pendaftar), TARGET_SANTRI)
  const chartW = 200
  const chartH = 90
  const points = chartData.map((d, i) => ({
    x: (i / (chartData.length - 1)) * chartW,
    y: chartH - (d.pendaftar / maxVal) * chartH,
  }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${chartW} ${chartH} L 0 ${chartH} Z`

  const menus = [
    { icon: '👥', label: 'Data Santri',  href: '/admin/pendaftar' },
    { icon: '✅', label: 'Verifikasi',   href: '/admin/verifikasi' },
    { icon: '💳', label: 'Pembayaran',   href: '/admin/pembayaran' },
    { icon: '📢', label: 'Pengumuman',   href: '/admin/pengumuman' },
    { icon: '📅', label: 'Jadwal',       href: '/admin/jadwal' },
    { icon: '📊', label: 'Laporan',      href: '/admin/laporan' },
    { icon: '📄', label: 'Export PDF',   href: '/admin/export' },
    { icon: '💬', label: 'Broadcast WA', href: '/admin/broadcast' },
  ]

  const jadwal = [
    { dot: '#10b981', label: 'Pembukaan Pendaftaran', sub: 'Gelombang 1',          date: '01 Jan 2025' },
    { dot: '#ef4444', label: 'Penutupan Pendaftaran', sub: 'Gelombang 1',          date: '28 Feb 2025' },
    { dot: '#3b82f6', label: 'Pengumuman Hasil',       sub: 'Seleksi Gelombang 1', date: '15 Mar 2025' },
    { dot: '#8b5cf6', label: 'Daftar Ulang',           sub: 'Gelombang 1',         date: '1 – 15 Apr 2025' },
  ]

  const daerahData = [
    { name: 'Kota Bandung', pct: 45, color: '#6d28d9' },
    { name: 'Kab. Bandung', pct: 30, color: '#a78bfa' },
    { name: 'Garut',        pct: 12, color: '#ddd6fe' },
    { name: 'Lainnya',      pct: 13, color: '#e2e8f0' },
  ]

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
      background: '#f0edfb',
      minHeight: '100dvh',
      maxWidth: 430,
      margin: '0 auto',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* ══ APP BAR HEADER ════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative',
        paddingTop: 44,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 24,
        margin: '8px 10px 0',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #e8e4f8 0%, #ddd8f5 40%, #d2ccf0 100%)',
        boxShadow: '0 4px 24px rgba(109,40,217,0.12)',
      }}>
        {/* Subtle dot pattern overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle, rgba(109,40,217,0.07) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
        }} />

        {/* Mosque illustration — sisi kanan, dekoratif */}
        <div style={{
          position: 'absolute',
          right: -10,
          bottom: 0,
          width: '52%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}>
          <Image
            src="/image/ilustrasi masjid.png"
            alt="Ilustrasi Masjid"
            width={190}
            height={190}
            style={{
              objectFit: 'contain',
              objectPosition: 'bottom right',
              opacity: 0.22,
              filter: 'hue-rotate(230deg) saturate(0.6) brightness(0.8)',
              mixBlendMode: 'multiply',
            }}
            unoptimized
          />
        </div>

        {/* Light accent glow */}
        <div style={{
          position: 'absolute', bottom: -20, right: '10%',
          width: 180, height: 180,
          background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              <p style={{ color: '#6d28d9', fontSize: 12, fontWeight: 600, margin: 0, letterSpacing: 0.2 }}>
                {greeting}, {greetEmoji}
              </p>
              <h1 style={{ color: '#1e1b4b', fontSize: 22, fontWeight: 800, margin: '2px 0 0 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                {fullName}
              </h1>
              <p style={{ color: '#6d5fad', fontSize: 10, fontWeight: 500, marginTop: 3, letterSpacing: 0.3 }}>
                SPMB 2026/2027 • PON-PES AL ISTIQOMAH
              </p>
            </div>
            <Link href="/admin/profile" style={{
              width: 44, height: 44, borderRadius: '50%',
              background: avatarUrl ? 'transparent' : '#7c3aed',
              border: '2.5px solid rgba(255,255,255,0.7)',
              boxShadow: '0 4px 14px rgba(109,40,217,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', textDecoration: 'none', flexShrink: 0,
            }}>
              {avatarUrl ? (
                <Image src={avatarUrl} alt={fullName} width={44} height={44} style={{ objectFit: 'cover' }} referrerPolicy="no-referrer" unoptimized />
              ) : (
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>{avatarInitial}</span>
              )}
            </Link>
          </div>

          {/* Date & Time chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)',
              borderRadius: 20, padding: '5px 10px',
              border: '1px solid rgba(255,255,255,0.85)',
            }}>
              <span style={{ fontSize: 11 }}>📅</span>
              <p style={{ color: '#3730a3', fontSize: 10, fontWeight: 600, margin: 0 }}>{dateStr}</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)',
              borderRadius: 20, padding: '5px 10px',
              border: '1px solid rgba(255,255,255,0.85)',
            }}>
              <span style={{ fontSize: 11 }}>🕐</span>
              <p style={{ color: '#3730a3', fontSize: 10, fontWeight: 600, margin: 0 }}>{timeStr}</p>
            </div>
          </div>

          {/* Tahun Ajaran chip */}
          <div style={{
            marginTop: 10,
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '8px 14px',
            display: 'inline-flex', alignItems: 'center',
            gap: 10, border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
              boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
            }}>🎓</div>
            <div>
              <p style={{ color: '#7c3aed', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Tahun Ajaran</p>
              <p style={{ color: '#1e1b4b', fontSize: 13, fontWeight: 800, margin: '1px 0 0 0' }}>2026 / 2027</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTENT ════════════════════════════════════════════════════ */}
      <div style={{ padding: '20px 12px 100px' }}>

        {/* ── 4 STAT CARDS ─────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Total',        value: s.total,    sub: `dari ${TARGET_SANTRI} target`, icon: <IconUsers color="#6d28d9" size={18}/>, bg: '#ede9fe' },
            { label: 'Terverifikasi',value: terVerif,   sub: `${verPct}%`,                  icon: <IconCheck color="#10b981" size={18}/>, bg: '#d1fae5' },
            { label: 'Menunggu',     value: s.menunggu, sub: `${menungguPct}%`,              icon: <IconClock color="#f59e0b" size={18}/>, bg: '#fef3c7' },
            { label: 'Ditolak',      value: s.ditolak,  sub: `${ditolakPct}%`,              icon: <IconXCircle color="#ef4444" size={18}/>, bg: '#fee2e2' },
          ].map((card, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 20, padding: '14px 8px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 14, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {card.icon}
                </div>
              </div>
              <p style={{ fontSize: 9, color: '#64748b', fontWeight: 600, marginBottom: 3, letterSpacing: 0.3 }}>{card.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1, margin: 0 }}>{card.value}</p>
              <p style={{ fontSize: 8, color: '#94a3b8', marginTop: 4 }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Progress Penerimaan ──────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>Progress Penerimaan</p>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>Tahun Ajaran 2025/2026</p>
            </div>
            <button onClick={() => fetchTrend()} style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20,
              padding: '6px 14px', fontSize: 11, fontWeight: 600, color: '#475569',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {refreshing ? '⟳' : '6 Bulan Terakhir'}<span>▾</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#donutGrad)" strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - progressPct / 100)}
                  strokeLinecap="round" transform="rotate(-90 50 50)" />
                <defs>
                  <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6d28d9" /><stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{progressPct}%</p>
                <p style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>Tercapai</p>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>{s.total} / {TARGET_SANTRI}</p>
              <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>Target Santri</p>
              <p style={{ fontSize: 11, color: '#64748b' }}>Kuota Tersedia</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{kuotaSisa} Santri</p>
            </div>
            <div style={{ flex: '1.5', minWidth: 140 }}>
              <svg width="100%" height="90" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" /><stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#areaGrad)" />
                <path d={linePath} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#7c3aed" stroke="white" strokeWidth="1.5" />)}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                {chartData.map((d, i) => <span key={i} style={{ fontSize: 9, color: '#94a3b8', flex: 1, textAlign: 'center' }}>{d.month}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Menu Cepat ───────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Menu Cepat</p>
            <Link href="/admin" style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>
              Kelola semua fitur ›
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {menus.map(menu => (
              <Link key={menu.label} href={menu.href} style={{ textDecoration: 'none', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 8px' }}>
                  {menu.icon}
                </div>
                <p style={{ fontSize: 10, color: '#475569', fontWeight: 600, lineHeight: 1.2 }}>{menu.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Aktivitas Terbaru + Jadwal Penting ──────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>

          {/* ── AKTIVITAS TERBARU — Desain baru ── */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
          }}>
            {/* Header aktivitas */}
            <div style={{
              padding: '14px 14px 10px',
              borderBottom: '1px solid #f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 9,
                  background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <p style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', margin: 0 }}>Aktivitas</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={fetchActivities}
                  disabled={actRefreshing}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    cursor: actRefreshing ? 'default' : 'pointer',
                    color: actRefreshing ? '#c4b5fd' : '#7c3aed',
                    display: 'flex', alignItems: 'center',
                    transition: 'transform 0.3s',
                    transform: actRefreshing ? 'rotate(180deg)' : 'none',
                  }}
                >
                  <IconRefresh />
                </button>
                <Link href="/admin/aktivitas" style={{ fontSize: 9, color: '#7c3aed', textDecoration: 'none', fontWeight: 700 }}>
                  Semua
                </Link>
              </div>
            </div>

            {/* Body aktivitas — timeline style */}
            <div style={{ padding: '10px 0 4px' }}>
              {actLoading ? (
                // Skeleton loading
                <div style={{ padding: '0 14px' }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 10, background: '#f1f5f9', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, marginBottom: 5, width: '80%' }} />
                        <div style={{ height: 6, background: '#f8fafc', borderRadius: 4, width: '50%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div style={{ padding: '20px 14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 24, margin: '0 0 6px' }}>📭</p>
                  <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, margin: 0 }}>Belum ada aktivitas</p>
                </div>
              ) : (
                activities.map((act, i) => {
                  const cfg = AKTIVITAS_CONFIG[act.type] ?? AKTIVITAS_CONFIG.pendaftar_baru
                  const isLast = i === activities.length - 1
                  return (
                    <div key={act.id} style={{ position: 'relative' }}>
                      {/* Timeline connector line */}
                      {!isLast && (
                        <div style={{
                          position: 'absolute',
                          left: 27,
                          top: 38,
                          width: 1.5,
                          height: 'calc(100% - 20px)',
                          background: 'linear-gradient(to bottom, #e2e8f0, transparent)',
                        }} />
                      )}
                      <div style={{
                        display: 'flex',
                        gap: 9,
                        alignItems: 'flex-start',
                        padding: `8px 14px ${isLast ? '8px' : '4px'}`,
                      }}>
                        {/* Icon circle */}
                        <div style={{
                          width: 28, height: 28,
                          borderRadius: 10,
                          background: cfg.iconBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 800,
                          color: cfg.iconColor,
                          flexShrink: 0,
                          boxShadow: `0 2px 8px ${cfg.dotColor}40`,
                          position: 'relative',
                          zIndex: 1,
                        }}>
                          {cfg.icon}
                        </div>
                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 10.5, fontWeight: 700, color: '#0f172a',
                            lineHeight: 1.3, margin: '0 0 3px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {act.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: 8, fontWeight: 700, color: cfg.badgeColor,
                              background: cfg.badgeBg, borderRadius: 99,
                              padding: '1.5px 6px', letterSpacing: 0.3,
                            }}>
                              {cfg.badge}
                            </span>
                            <span style={{ fontSize: 8.5, color: '#94a3b8' }}>{act.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Jadwal Penting */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Jadwal Penting</p>
              <Link href="/admin/jadwal" style={{ fontSize: 10, color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>Lihat Semua</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {jadwal.map((j, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: j.dot, flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{j.label}</p>
                      <p style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{j.sub}</p>
                      <p style={{ fontSize: 9, color: j.dot, fontWeight: 600, marginTop: 3 }}>{j.date}</p>
                    </div>
                  </div>
                  {i < jadwal.length - 1 && <div style={{ height: 1, background: '#f1f5f9', marginTop: 10 }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3 Mini Stats ─────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#0f172a' }}>Pendaftar per Bulan</p>
              <Link href="/admin/laporan" style={{ fontSize: 9, color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>Lihat</Link>
            </div>
            <p style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{s.total}</p>
            <p style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>Santri</p>
            <svg width="100%" height="32" viewBox="0 0 80 32" preserveAspectRatio="none" style={{ marginTop: 8 }}>
              <polyline points="0,28 15,22 30,15 45,10 60,6 75,3" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ background: '#fff', borderRadius: 18, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#0f172a' }}>Asal Daerah</p>
              <Link href="/admin/laporan" style={{ fontSize: 9, color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>Lihat</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {daerahData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <p style={{ fontSize: 9, color: '#64748b', flex: 1 }}>{d.name}</p>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#0f172a' }}>{d.pct}%</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 18, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#0f172a' }}>Jenis Kelamin</p>
              <Link href="/admin/laporan" style={{ fontSize: 9, color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>Lihat</Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <svg width="70" height="70" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r="28" fill="none" stroke="#e0e7ff" strokeWidth="10" />
                <circle cx="35" cy="35" r="28" fill="none" stroke="#3b82f6" strokeWidth="10"
                  strokeDasharray={`${(112 / 178) * 175.9} 175.9`} strokeLinecap="butt" transform="rotate(-90 35 35)" />
                <circle cx="35" cy="35" r="28" fill="none" stroke="#f472b6" strokeWidth="10"
                  strokeDasharray={`${(66 / 178) * 175.9} 175.9`} strokeDashoffset={`-${(112 / 178) * 175.9}`}
                  strokeLinecap="butt" transform="rotate(-90 35 35)" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 900, color: '#3b82f6', lineHeight: 1 }}>112</p>
                <p style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>Laki-laki</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 900, color: '#f472b6', lineHeight: 1 }}>66</p>
                <p style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>Perempuan</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Pengumuman + Tips Admin ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a', borderRadius: 18, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>📢</span>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#92400e' }}>Pengumuman</p>
            </div>
            <p style={{ fontSize: 10, color: '#78350f', lineHeight: 1.4, marginBottom: 10 }}>Verifikasi gelombang 1 akan ditutup 3 hari lagi.</p>
            <Link href="/admin/pengumuman" style={{ fontSize: 10, fontWeight: 700, color: '#b45309', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Selengkapnya →
            </Link>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: 18, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>🛡️</span>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#1e40af' }}>Tips Admin</p>
            </div>
            <p style={{ fontSize: 10, color: '#1e3a8a', lineHeight: 1.4, marginBottom: 10 }}>Pastikan semua dokumen santri terbaca jelas sebelum diverifikasi.</p>
            <Link href="/admin/tips" style={{ fontSize: 10, fontWeight: 700, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Lihat Tips Lainnya →
            </Link>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM NAVIGATION ════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid #e2e8f0',
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        padding: '10px 16px 24px', zIndex: 100,
      }}>
        {[
          { icon: (a: boolean) => <IconHome active={a} />,       label: 'Beranda',   active: true,  href: '/admin/dashboard' },
          { icon: (a: boolean) => <IconClipboard active={a} />,  label: 'Pendaftar', active: false, href: '/admin/pendaftar' },
          { icon: (a: boolean) => <IconCreditCard active={a} />, label: 'Pembayaran',active: false, href: '/admin/pembayaran' },
          { icon: (a: boolean) => <IconBarChart active={a} />,   label: 'Laporan',   active: false, href: '/admin/laporan' },
          { icon: (a: boolean) => <IconUser active={a} />,       label: 'Profil',    active: false, href: '/admin/profile' },
        ].map(item => (
          <Link key={item.label} href={item.href} style={{ textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {item.icon(item.active)}
              <p style={{ fontSize: 10, fontWeight: item.active ? 700 : 500, color: item.active ? '#7c3aed' : '#94a3b8', margin: 0 }}>
                {item.label}
              </p>
              {item.active && (
                <div style={{ position: 'absolute', bottom: -8, width: 24, height: 3, background: '#7c3aed', borderRadius: 2 }} />
              )}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  )
}