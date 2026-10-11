'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Pendaftaran } from '@/types'
import type { TrenBulan } from '@/types/tren'
import type { AktivitasItem } from '@/app/api/admin/aktivitas/route'
import { useSettings } from '@/contexts/SettingsContext'

// ── Theme palette (light/dark) ──────────────────────────────────────────────
const PALETTE = {
  light: {
    pageBg:        '#F4F6FB',
    topbarBg:      'rgba(255,255,255,0.92)',
    topbarSolid:   '#ffffff',
    cardGrad:      'linear-gradient(180deg, #ffffff 0%, #FAFBFF 100%)',
    cardBorder:    '#EBEEF5',
    cardShadow:
      '0 1px 0 rgba(255,255,255,0.95) inset, 0 1px 2px rgba(16,24,40,0.05), 0 6px 16px -4px rgba(16,24,40,0.08), 0 18px 34px -14px rgba(16,24,40,0.12)',
    textPrimary:   '#111827',
    textSecondary: '#6b7280',
    textMuted:     '#9ca3af',
    divider:       '#F0F2F7',
    dividerSoft:   '#F5F6FA',
    cellBg:        '#F7F8FC',
    skeletonBg:    '#eef0f6',
    skeletonBg2:   '#f5f6fa',
    bellBg:        'linear-gradient(180deg,#ffffff 0%,#F5F6FB 100%)',
    bellBorder:    '#E8EBF3',
    bellIcon:      '#374151',
    quickLabel:    '#374151',
    gridLine:      '#E9ECF4',
    menuTileBg:    'linear-gradient(180deg,#ffffff 0%,#EFF1F9 100%)',
    menuEdge:      '#D9DEEC',
  },
  dark: {
    pageBg:        '#15131f',
    topbarBg:      'rgba(30,27,46,0.92)',
    topbarSolid:   '#1e1b2e',
    cardGrad:      'linear-gradient(180deg, #262239 0%, #1e1b2e 100%)',
    cardBorder:    '#322d49',
    cardShadow:
      '0 1px 0 rgba(255,255,255,0.05) inset, 0 1px 2px rgba(0,0,0,0.45), 0 8px 20px -6px rgba(0,0,0,0.55), 0 18px 36px -14px rgba(0,0,0,0.55)',
    textPrimary:   '#f1f0f5',
    textSecondary: '#b3aec4',
    textMuted:     '#8b86a3',
    divider:       '#2e2a40',
    dividerSoft:   '#292540',
    cellBg:        '#241f38',
    skeletonBg:    '#2a2640',
    skeletonBg2:   '#231f35',
    bellBg:        'linear-gradient(180deg,#2a2542 0%,#221e36 100%)',
    bellBorder:    '#352f52',
    bellIcon:      '#d8d4e8',
    quickLabel:    '#d8d4e8',
    gridLine:      '#2e2a40',
    menuTileBg:    'linear-gradient(180deg,#2d2848 0%,#241f38 100%)',
    menuEdge:      '#15122a',
  },
} as const

type Palette = (typeof PALETTE)[keyof typeof PALETTE]

// ── Tone (warna aksen) ───────────────────────────────────────────────────────
const TONES = {
  violet: { from: '#EDE9FE', to: '#DDD6FE', edge: '#BFB0F5', stroke: '#6D3DF5', glow: '#6D3DF5', bar: 'linear-gradient(90deg,#8B5CF6,#6D3DF5)' },
  green:  { from: '#D1FAE5', to: '#A7F3D0', edge: '#79DDB4', stroke: '#059669', glow: '#059669', bar: 'linear-gradient(90deg,#34D399,#059669)' },
  amber:  { from: '#FEF3C7', to: '#FDE68A', edge: '#F3C65A', stroke: '#D97706', glow: '#D97706', bar: 'linear-gradient(90deg,#FBBF24,#D97706)' },
  red:    { from: '#FEE2E2', to: '#FECACA', edge: '#F4A3A3', stroke: '#DC2626', glow: '#DC2626', bar: 'linear-gradient(90deg,#F87171,#DC2626)' },
  blue:   { from: '#DBEAFE', to: '#BFDBFE', edge: '#8FBCF6', stroke: '#2563EB', glow: '#2563EB', bar: 'linear-gradient(90deg,#60A5FA,#2563EB)' },
} as const

type Tone = (typeof TONES)[keyof typeof TONES]

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

// ── Konstanta ─────────────────────────────────────────────────────────────────
const WALLET_ICON = '/icons/wallet.png'

// Ikon kartu statistik (file ada di /public/icons)
const STAT_ICONS = {
  total:    '/icons/total-peserta-icon.png',
  verified: '/icons/terverifikasi-icon.png',
  waiting:  '/icons/menunggu.png',
  rejected: '/icons/ditolak-icon.png',
} as const

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

const AKTIVITAS_TONE: Record<AktivitasItem['type'], Tone> = {
  pendaftar_baru: TONES.violet,
  diverifikasi:   TONES.green,
  berkas_update:  TONES.blue,
  pembayaran:     TONES.amber,
  ditolak:        TONES.red,
  diterima:       TONES.green,
  diproses:       TONES.amber,
}

const MONTH_FULL: Record<string, string> = {
  Jan: 'Januari', Feb: 'Februari', Mar: 'Maret', Apr: 'April',
  Mei: 'Mei', Jun: 'Juni', Jul: 'Juli', Agt: 'Agustus',
  Sep: 'September', Okt: 'Oktober', Nov: 'November', Des: 'Desember',
}

// ── Menu Cepat Admin ──────────────────────────────────────────────────────────
const QUICK_MENU: { id: string; label: string; src: string; href: string; unoptimized?: boolean }[] = [
  { id: 'verifikasi', label: 'Verifikasi', src: '/icons/verifikasi-icon.png', href: '/admin/verifikasi', unoptimized: true },
  { id: 'jadwal',     label: 'Jadwal',     src: '/icons/calender-icon.png',   href: '/admin/jadwal' },
  { id: 'berkas',     label: 'Berkas',     src: '/icons/berkas-icon.png',     href: '/admin/berkas' },
  { id: 'pengumuman', label: 'Pengumuman', src: '/icons/pengumuman.png',      href: '/admin/pengumuman' },
  { id: 'chat',       label: 'Chat',       src: '/icons/chat.png',            href: '/admin/chat' },
]

// ── Reusable UI ───────────────────────────────────────────────────────────────

/**
 * Tile ikon bundar.
 * - default : bergaya 3D (efek keycap: gloss atas + tepi tebal bawah + bayangan berwarna)
 * - flat    : datar, warna solid lembut tanpa bayangan / gloss / tepi tebal
 */
function IconTile({
  tone, size = 40, flat = false, children,
}: { tone: Tone; size?: number; flat?: boolean; children: ReactNode }) {
  if (flat) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: tone.from,
        border: `1px solid ${tone.edge}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ display: 'flex' }}>{children}</span>
      </div>
    )
  }
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(145deg, ${tone.from} 0%, ${tone.to} 100%)`,
      border: '1px solid rgba(255,255,255,0.75)',
      boxShadow: `0 1px 0 rgba(255,255,255,0.95) inset, 0 -3px 6px ${tone.glow}1f inset, 0 4px 0 ${tone.edge}, 0 12px 18px -6px ${tone.glow}80`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: '48%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0))',
        pointerEvents: 'none',
      }} />
      <span style={{ position: 'relative', zIndex: 1, display: 'flex' }}>{children}</span>
    </div>
  )
}

/** Tile ikon statistik: alas BUNDAR terang + halo warna aksen, ikon PNG tampil utuh di tengah lingkaran */
function StatIconTile({
  tone, src, alt, size = 54,
}: { tone: Tone; src: string; alt: string; size?: number }) {
  const imgSize = Math.round(size * 0.62)
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `radial-gradient(circle at 35% 25%, #ffffff 0%, ${tone.from} 100%)`,
      border: `1px solid ${tone.edge}66`,
      boxShadow: `0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 16px -8px ${tone.glow}66`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Image
        src={src}
        alt={alt}
        width={imgSize}
        height={imgSize}
        sizes={`${imgSize}px`}
        draggable={false}
        style={{
          width: imgSize, height: imgSize, objectFit: 'contain',
          filter: `drop-shadow(0 3px 4px ${tone.glow}40)`,
          userSelect: 'none',
        }}
      />
    </div>
  )
}

/** Card 3D dasar */
function Card({
  p, children, style, className,
}: { p: Palette; children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={className} style={{
      background: p.cardGrad,
      border: `1px solid ${p.cardBorder}`,
      borderRadius: 22,
      boxShadow: p.cardShadow,
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionHeader({
  p, title, subtitle, href, actionLabel = 'Lihat Semua',
}: { p: Palette; title: string; subtitle?: string; href?: string; actionLabel?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: p.textPrimary, margin: 0, letterSpacing: '-0.3px' }}>{title}</p>
        {subtitle && (
          <p style={{ fontSize: 11, color: p.textMuted, margin: '2px 0 0', fontWeight: 500 }}>{subtitle}</p>
        )}
      </div>
      {href && (
        <Link href={href} style={{
          display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0,
          fontSize: 11.5, fontWeight: 700, color: '#6D3DF5', textDecoration: 'none',
        }}>
          {actionLabel}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      )}
    </div>
  )
}

// ── Ikon aktivitas ────────────────────────────────────────────────────────────
function AktivitasIcon({ type }: { type: AktivitasItem['type'] }) {
  const tone = AKTIVITAS_TONE[type] ?? TONES.violet
  const c  = tone.stroke
  const sl = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  let icon: ReactNode

  if (type === 'pembayaran') {
    icon = (
      <Image
        src={WALLET_ICON}
        alt="Pembayaran"
        width={26}
        height={26}
        style={{ width: 26, height: 26, objectFit: 'contain' }}
      />
    )
  } else if (type === 'diverifikasi' || type === 'diterima') {
    icon = (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={c} strokeWidth="2.2" {...sl} />
        <polyline points="22 4 12 14.01 9 11.01" stroke={c} strokeWidth="2.2" {...sl} />
      </svg>
    )
  } else if (type === 'ditolak') {
    icon = (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2.2" />
        <line x1="15" y1="9" x2="9" y2="15" stroke={c} strokeWidth="2.2" {...sl} />
        <line x1="9" y1="9" x2="15" y2="15" stroke={c} strokeWidth="2.2" {...sl} />
      </svg>
    )
  } else if (type === 'berkas_update') {
    icon = (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={c} strokeWidth="2" {...sl} />
        <polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="2" {...sl} />
        <line x1="12" y1="18" x2="12" y2="12" stroke={c} strokeWidth="2" {...sl} />
        <polyline points="9 15 12 12 15 15" stroke={c} strokeWidth="2" {...sl} />
      </svg>
    )
  } else if (type === 'diproses') {
    icon = (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="2.2" />
        <polyline points="12 6 12 12 16 14" stroke={c} strokeWidth="2.2" {...sl} />
      </svg>
    )
  } else {
    // pendaftar_baru
    icon = (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={c} strokeWidth="2.2" {...sl} />
        <circle cx="9" cy="7" r="4" stroke={c} strokeWidth="2.2" />
        <line x1="19" y1="8" x2="19" y2="14" stroke={c} strokeWidth="2.2" {...sl} />
        <line x1="16" y1="11" x2="22" y2="11" stroke={c} strokeWidth="2.2" {...sl} />
      </svg>
    )
  }

  return <IconTile tone={tone} size={46} flat>{icon}</IconTile>
}

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
      { month: 'Jan', year: 2026, pendaftar: 2, terverifikasi: 1 },
      { month: 'Feb', year: 2026, pendaftar: 3, terverifikasi: 2 },
      { month: 'Mar', year: 2026, pendaftar: 5, terverifikasi: 4 },
      { month: 'Apr', year: 2026, pendaftar: 7, terverifikasi: 5 },
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
  const s: Stats = stats ?? { total: 0, menunggu: 0, diproses: 0, diterima: 0, ditolak: 0 }
  const terVerif = s.diterima + s.diproses

  // ── Kartu statistik ─────────────────────────────────────────────────────────
  const pct = (v: number) => (s.total > 0 ? Math.round((v / s.total) * 100) : 0)

  const statCards: { label: string; value: number; tone: Tone; note: string; fill: number; iconSrc: string }[] = [
    {
      label: 'Total Pendaftar', value: s.total, tone: TONES.violet,
      note: 'Seluruh data masuk', fill: 100,
      iconSrc: STAT_ICONS.total,
    },
    {
      label: 'Terverifikasi', value: terVerif, tone: TONES.blue,
      note: `${pct(terVerif)}% dari total`, fill: pct(terVerif),
      iconSrc: STAT_ICONS.verified,
    },
    {
      label: 'Menunggu', value: s.menunggu, tone: TONES.amber,
      note: `${pct(s.menunggu)}% dari total`, fill: pct(s.menunggu),
      iconSrc: STAT_ICONS.waiting,
    },
    {
      label: 'Ditolak', value: s.ditolak, tone: TONES.red,
      note: `${pct(s.ditolak)}% dari total`, fill: pct(s.ditolak),
      iconSrc: STAT_ICONS.rejected,
    },
  ]

  // ── Diagram batang ala trading (candle = akumulasi, volume = pendaftar baru) ─
  const CW = 320, CH = 156
  const AX = 30                       // lebar sumbu harga (kanan)
  const PL = 6                        // padding kiri
  const PRICE_T = 10, PRICE_B = 104   // area candle
  const VOL_T = 112,  VOL_B = 136     // area volume
  const plotW = CW - PL - AX
  const step  = plotW / Math.max(chartData.length, 1)
  const candW = Math.min(step * 0.58, 20)
  const maxV  = Math.max(...chartData.map(d => d.pendaftar), 1)

  // skala sumbu-Y "rapi" (0, 5, 10, 15, 20 …)
  const rawStep  = Math.max(maxV, 4) / 4
  const mag      = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const norm     = rawStep / mag
  const niceStep = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag
  const yMax     = niceStep * 4
  const ticks    = [0, 1, 2, 3, 4].map(i => i * niceStep)
  const yPrice   = (v: number) => PRICE_B - (v / yMax) * (PRICE_B - PRICE_T)

  const monthlyNew = chartData.map((d, i) =>
    Math.max(0, d.pendaftar - (i > 0 ? chartData[i - 1].pendaftar : 0))
  )
  const maxVol = Math.max(...monthlyNew, 1)

  const candles = chartData.map((d, i) => {
    const open  = i > 0 ? chartData[i - 1].pendaftar : 0
    const close = d.pendaftar
    const yO = yPrice(open), yC = yPrice(close)
    const vol = monthlyNew[i]
    return {
      cx:      PL + step * i + step / 2,
      bodyTop: Math.min(yO, yC),
      bodyH:   Math.max(Math.abs(yO - yC), 2.5),
      up:      close > open,
      vol,
      volH:    vol > 0 ? Math.max((vol / maxVol) * (VOL_B - VOL_T), 3) : 0,
      month:   d.month,
    }
  })

  const lastClose = chartData[chartData.length - 1]?.pendaftar ?? 0
  const yLast     = yPrice(lastClose)

  // ── Pendaftar per bulan (non-kumulatif) ─────────────────────────────────────
  const perMonth = chartData.map((d, i) =>
    Math.max(0, d.pendaftar - (i > 0 ? chartData[i - 1].pendaftar : 0))
  )
  const lastMonths = chartData.slice(-4).map((d, i, arr) => ({
    month: d.month,
    value: perMonth[chartData.length - arr.length + i],
  }))

  const curM  = perMonth[perMonth.length - 1] ?? 0
  const prevM = perMonth.length > 1 ? perMonth[perMonth.length - 2] : null
  let growth: { text: string; pos: boolean } | null = null
  if (prevM !== null) {
    if (prevM > 0) {
      const g = Math.round(((curM - prevM) / prevM) * 100)
      growth = { text: `${g >= 0 ? '+' : ''}${g}% dari bulan lalu`, pos: g >= 0 }
    } else if (curM > 0) {
      growth = { text: `+${curM} pendaftar bulan ini`, pos: true }
    }
  }

  const displayActs = activities

  // Tinggi top bar (fixed) + jarak napas
  const TOPBAR_HEIGHT = 86 + 10
  const SECTION: CSSProperties = { padding: '16px 16px 0' }

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans','Inter',system-ui,-apple-system,sans-serif",
      background: p.pageBg,
      minHeight: '100dvh',
      maxWidth: 430,
      margin: '0 auto',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <style>{`
        .adm-lift { transition: transform .2s ease, box-shadow .2s ease; will-change: transform; }
        .adm-lift:active { transform: scale(.96); }
        @media (hover: hover) { .adm-lift:hover { transform: translateY(-3px); } }
        .adm-key { display: block; transition: transform .12s ease, opacity .12s ease; }
        .adm-key:active { transform: scale(.94); opacity: .85; }
        @media (hover: hover) { .adm-key:hover { transform: scale(1.04); } }
        .adm-float { animation: admFloat 4.5s ease-in-out infinite; }
        @keyframes admFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @media (prefers-reduced-motion: reduce) { .adm-float { animation: none; } .adm-lift, .adm-key { transition: none; } }
      `}</style>

      {/* ══ TOP BAR — FIXED ═════════════════════════════════════════════════ */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, zIndex: 200,
        background: p.topbarBg,
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        padding: '16px 20px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${p.cardBorder}`,
        boxShadow: '0 8px 24px -12px rgba(16,24,40,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <Link href="/admin/profile" style={{
            width: 52, height: 52, borderRadius: '50%',
            padding: 2.5, flexShrink: 0, textDecoration: 'none',
            background: 'linear-gradient(135deg,#8B5CF6,#6D3DF5 55%,#C4B5FD)',
            boxShadow: '0 8px 18px -6px rgba(109,40,217,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
              border: `2px solid ${p.topbarSolid}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
            }}>
              {avatarUrl
                ? <Image src={avatarUrl} alt={fullName} width={52} height={52}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    referrerPolicy="no-referrer" unoptimized />
                : <span style={{ color: '#fff', fontWeight: 800, fontSize: 19 }}>{avatarInitial}</span>}
            </span>
          </Link>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, color: p.textMuted, fontWeight: 500, margin: 0 }}>{greeting}</p>
            <p style={{
              fontSize: 19, fontWeight: 800, color: p.textPrimary, margin: '1px 0 0',
              lineHeight: 1.2, letterSpacing: '-0.5px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {fullName}
            </p>
            <p style={{ fontSize: 11.5, color: p.textMuted, margin: '2px 0 0', fontWeight: 500 }}>Admin Penerimaan Santri</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {[
            {
              href: '/admin/notifikasi', badge: unreadCount > 0,
              icon: (
                <>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </>
              ),
            },
            {
              href: '/admin/pengaturan', badge: false,
              icon: (
                <>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </>
              ),
            },
          ].map((b) => (
            <Link key={b.href} href={b.href} className="adm-lift" style={{
              width: 42, height: 42, borderRadius: '50%',
              background: p.bellBg, border: `1px solid ${p.bellBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', position: 'relative',
              boxShadow: `0 1px 0 rgba(255,255,255,0.9) inset, 0 3px 0 ${p.menuEdge}, 0 10px 14px -6px rgba(16,24,40,0.25)`,
            }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={p.bellIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {b.icon}
              </svg>
              {b.badge && (
                <span style={{
                  position: 'absolute', top: 8, right: 9,
                  width: 9, height: 9, borderRadius: '50%',
                  background: '#6D3DF5', border: `2px solid ${p.topbarSolid}`,
                }} />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer pengganti top bar fixed */}
      <div style={{ height: TOPBAR_HEIGHT }} />

      {/* ═══════════════ HERO BANNER ═══════════════ */}
      <div style={{ padding: '14px 16px 0' }}>
        <Link href="/admin/laporan" className="adm-lift" style={{ display: 'block', textDecoration: 'none' }}>
          <div style={{
            position: 'relative', width: '100%', borderRadius: 24, overflow: 'hidden',
            background: '#F5F3FF',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 14px 28px -10px rgba(109,61,245,0.35), 0 4px 10px rgba(109,61,245,0.10)',
          }}>
            <Image
              src="/icons/banner-penerimaan-santri-baru.png"
              alt="Beranda Admin Banner"
              width={1200}
              height={600}
              priority
              sizes="100vw"
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>
        </Link>
      </div>

      {/* ══ STATISTIK — 2 × 2 ════════════════════════════════════════════════ */}
      <div style={SECTION}>
        <SectionHeader p={p} title="Ringkasan Pendaftaran" subtitle="Data pendaftar terkini" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
          {statCards.map((c) => (
            <Card key={c.label} p={p} className="adm-lift" style={{ padding: '14px 14px 13px', borderRadius: 20, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <StatIconTile tone={c.tone} src={c.iconSrc} alt={c.label} />
                <p style={{
                  fontSize: 28, fontWeight: 900, color: p.textPrimary, margin: 0,
                  lineHeight: 1, letterSpacing: '-1.2px',
                }}>
                  {c.value}
                </p>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: p.textPrimary, margin: '12px 0 0' }}>{c.label}</p>
              <p style={{ fontSize: 10.5, color: p.textMuted, margin: '2px 0 9px', fontWeight: 500 }}>{c.note}</p>
              <div style={{ height: 6, borderRadius: 99, background: p.divider, overflow: 'hidden' }}>
                <div style={{
                  width: `${c.fill}%`, height: '100%', borderRadius: 99,
                  background: c.tone.bar,
                  boxShadow: `0 0 8px ${c.tone.glow}55`,
                  transition: 'width .6s ease',
                }} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ══ PENDAFTAR PER BULAN ══════════════════════════════════════════════ */}
      <div style={SECTION}>
        <Card p={p} style={{ padding: '18px 16px 16px' }}>
          <SectionHeader p={p} title="Pendaftar per Bulan" subtitle="Akumulasi pendaftar masuk" />

          <div style={{ display: growth ? 'flex' : 'none', justifyContent: 'flex-end', marginTop: 10 }}>
            {growth && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: growth.pos ? '#D1FAE5' : '#FEE2E2',
                borderRadius: 99, padding: '4px 10px',
                boxShadow: `0 4px 10px -4px ${growth.pos ? '#05966966' : '#DC262666'}`,
              }}>
                <svg width="9" height="9" viewBox="0 0 12 12">
                  {growth.pos
                    ? <path d="M6 2L10 7H2L6 2Z" fill="#059669" />
                    : <path d="M6 10L2 5H10L6 10Z" fill="#DC2626" />}
                </svg>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: growth.pos ? '#059669' : '#DC2626' }}>
                  {growth.text}
                </span>
              </div>
            )}
          </div>

          {/* Diagram batang trading */}
          <svg width="100%" viewBox={`0 0 ${CW} ${CH}`} style={{ display: 'block', marginTop: 14 }}>
            <defs>
              <linearGradient id="admCandleUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="admVolBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6D3DF5" stopOpacity="0.25" />
              </linearGradient>
              <filter id="admCandleGlow" x="-60%" y="-20%" width="220%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#059669" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* Grid + sumbu harga (kanan) */}
            {ticks.map((t, i) => (
              <g key={i}>
                <line x1={PL} x2={CW - AX} y1={yPrice(t)} y2={yPrice(t)}
                  stroke={p.gridLine} strokeWidth="1" strokeDasharray={t === 0 ? undefined : '3 4'} />
                <text x={CW - AX + 5} y={yPrice(t) + 3} fontSize="8.5" fontWeight="600" fill={p.textMuted}>
                  {t}
                </text>
              </g>
            ))}

            {/* Candle */}
            {candles.map((c, i) => {
              const isLast = i === candles.length - 1
              return (
                <rect key={i}
                  x={c.cx - candW / 2} y={c.bodyTop} width={candW} height={c.bodyH} rx="3"
                  fill={c.up ? 'url(#admCandleUp)' : p.textMuted}
                  opacity={c.up ? 1 : 0.6}
                  filter={isLast && c.up ? 'url(#admCandleGlow)' : undefined}
                />
              )
            })}

            {/* Garis harga terakhir + tag */}
            <line x1={PL} x2={CW - AX} y1={yLast} y2={yLast}
              stroke="#059669" strokeWidth="1" strokeDasharray="2 3" opacity="0.75" />
            <rect x={CW - AX + 1} y={yLast - 7} width={AX - 2} height="14" rx="4" fill="#059669" />
            <text x={CW - AX + 1 + (AX - 2) / 2} y={yLast + 3} textAnchor="middle"
              fontSize="8.5" fontWeight="800" fill="#fff">
              {lastClose}
            </text>

            {/* Volume (pendaftar baru per bulan) */}
            <line x1={PL} x2={CW - AX} y1={VOL_B} y2={VOL_B} stroke={p.gridLine} strokeWidth="1" />
            <text x={CW - AX + 5} y={VOL_T + 12} fontSize="8" fontWeight="600" fill={p.textMuted}>Baru</text>
            {candles.map((c, i) => (
              <g key={i}>
                {c.volH > 0 && (
                  <>
                    <rect x={c.cx - candW / 2} y={VOL_B - c.volH} width={candW} height={c.volH}
                      rx="2.5" fill="url(#admVolBar)" />
                    <text x={c.cx} y={VOL_B - c.volH - 2} textAnchor="middle"
                      fontSize="8" fontWeight="700" fill={p.textSecondary}>
                      {c.vol}
                    </text>
                  </>
                )}
                <text x={c.cx} y={CH - 6} textAnchor="middle" fontSize="9" fontWeight="600" fill={p.textMuted}>
                  {c.month}
                </text>
              </g>
            ))}
          </svg>

          {/* Legenda */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 12, borderRadius: 2, background: 'linear-gradient(180deg,#34D399,#059669)' }} />
              <span style={{ fontSize: 10, color: p.textMuted, fontWeight: 600 }}>Akumulasi pendaftar</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 12, borderRadius: 2, background: 'linear-gradient(180deg,#8B5CF6,#6D3DF5)', opacity: 0.7 }} />
              <span style={{ fontSize: 10, color: p.textMuted, fontWeight: 600 }}>Pendaftar baru / bulan</span>
            </div>
          </div>

          {/* Breakdown bulanan */}
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${Math.max(lastMonths.length, 1)}, minmax(0, 1fr))`,
            gap: 8, marginTop: 14,
          }}>
            {lastMonths.map((m, i) => (
              <div key={`${m.month}-${i}`} style={{
                background: p.cellBg, border: `1px solid ${p.divider}`,
                borderRadius: 14, padding: '9px 6px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: p.textPrimary, margin: 0, letterSpacing: '-0.4px' }}>
                  {m.value}
                </p>
                <p style={{ fontSize: 9.5, color: p.textMuted, margin: '2px 0 0', fontWeight: 600 }}>
                  {MONTH_FULL[m.month] ?? m.month}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ══ MENU CEPAT ════════════════════════════════════════════════════════ */}
      <div style={SECTION}>
        <Card p={p} style={{ padding: '16px 12px 14px' }}>
          <div style={{ padding: '0 4px' }}>
            <SectionHeader p={p} title="Menu Cepat" href="/admin/all-menu" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 10, marginTop: 14, paddingBottom: 4 }}>
            {QUICK_MENU.map((item) => (
              <Link key={item.id} href={item.href} className="adm-key" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
                  <div style={{
                    width: 58, height: 58, borderRadius: '50%',
                    background: p.cellBg,
                    border: `1px solid ${p.cardBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Image
                      src={item.src}
                      alt={item.label}
                      width={36}
                      height={36}
                      unoptimized={item.unoptimized}
                      style={{
                        width: 36, height: 36, objectFit: 'contain',
                      }}
                    />
                  </div>
                  <p style={{
                    fontSize: 9.5, fontWeight: 700, color: p.quickLabel, margin: 0,
                    textAlign: 'center', lineHeight: 1.2,
                    maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* ══ AKTIVITAS TERBARU ════════════════════════════════════════════════ */}
      <div style={SECTION}>
        <Card p={p} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px 12px' }}>
            <SectionHeader p={p} title="Aktivitas Terbaru" subtitle="Pembaruan terakhir dari pendaftar" href="/admin/aktivitas" />
          </div>

          {actLoading ? (
            <div style={{ padding: '0 18px 8px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0',
                  borderTop: `1px solid ${p.dividerSoft}`,
                }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: p.skeletonBg, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 10, background: p.skeletonBg, borderRadius: 5, marginBottom: 6, width: '55%' }} />
                    <div style={{ height: 8, background: p.skeletonBg2, borderRadius: 4, width: '75%' }} />
                  </div>
                  <div style={{ height: 8, background: p.skeletonBg, borderRadius: 4, width: 55 }} />
                </div>
              ))}
            </div>
          ) : displayActs.length === 0 ? (
            <div style={{ padding: '28px 18px 32px', textAlign: 'center', borderTop: `1px solid ${p.dividerSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <IconTile tone={TONES.violet} size={52}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6D3DF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                  </svg>
                </IconTile>
              </div>
              <p style={{ fontSize: 12.5, color: p.textSecondary, fontWeight: 700, margin: 0 }}>Belum ada aktivitas</p>
              <p style={{ fontSize: 11, color: p.textMuted, margin: '3px 0 0' }}>Aktivitas pendaftar akan muncul di sini</p>
            </div>
          ) : (
            displayActs.map((act) => (
              <div key={act.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 18px',
                borderTop: `1px solid ${p.dividerSoft}`,
              }}>
                <AktivitasIcon type={act.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 700, color: p.textPrimary, margin: '0 0 3px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {act.name}
                  </p>
                  <p style={{ fontSize: 11, color: p.textSecondary, margin: 0 }}>
                    {getAktivitasDesc(act.type)}
                  </p>
                </div>
                <p style={{
                  fontSize: 10.5, color: p.textMuted, flexShrink: 0, margin: 0,
                  whiteSpace: 'nowrap', fontWeight: 500,
                }}>
                  {act.time}
                </p>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* ══ PENGUMUMAN + LAPORAN & ANALITIK ══════════════════════════════════ */}
      <div style={{ ...SECTION, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'stretch' }}>

        {/* ── Pengumuman ── */}
        <Card p={p} className="adm-lift" style={{
          padding: '16px 14px 14px', position: 'relative', overflow: 'hidden',
          minHeight: 210, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(150deg, rgba(255,255,255,0) 35%, rgba(109,61,245,0.09) 100%)',
          }} />
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: p.textPrimary, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              Pengumuman
            </p>
            <p style={{ fontSize: 10.5, color: p.textMuted, lineHeight: 1.5, margin: 0 }}>
              Informasi terbaru untuk calon santri
            </p>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
              <IconTile tone={TONES.violet} size={108}>
                <Image
                  src="/icons/terompet-icon.png"
                  alt="Pengumuman"
                  width={76}
                  height={76}
                  className="adm-float"
                  style={{
                    width: 76, height: 76, objectFit: 'contain',
                    filter: 'drop-shadow(0 12px 14px rgba(109,61,245,0.28))',
                  }}
                />
              </IconTile>
            </div>

            <Link href="/admin/pengumuman" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              fontSize: 10.5, fontWeight: 800, color: '#fff', textDecoration: 'none',
              background: 'linear-gradient(180deg,#8B5CF6 0%,#6D3DF5 100%)',
              borderRadius: 12, padding: '9px 12px',
              boxShadow: '0 1px 0 rgba(255,255,255,0.35) inset, 0 8px 14px -6px rgba(109,61,245,0.6)',
            }}>
              Buat Pengumuman
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </Card>

        {/* ── Laporan & Analitik ── */}
        <Card p={p} className="adm-lift" style={{
          padding: '16px 14px 14px', position: 'relative', overflow: 'hidden',
          minHeight: 210, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(150deg, rgba(255,255,255,0) 35%, rgba(217,119,6,0.10) 100%)',
          }} />
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: p.textPrimary, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              Laporan &amp; Analitik
            </p>
            <p style={{ fontSize: 10.5, color: p.textMuted, lineHeight: 1.5, margin: 0 }}>
              Lihat laporan dan statistik pendaftaran
            </p>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
              <IconTile tone={TONES.amber} size={108}>
                <Image
                  src="/icons/laporan-grafik-icon.png"
                  alt="Laporan & Analitik"
                  width={76}
                  height={76}
                  className="adm-float"
                  style={{
                    width: 76, height: 76, objectFit: 'contain',
                    filter: 'drop-shadow(0 12px 14px rgba(245,158,11,0.3))',
                    userSelect: 'none', pointerEvents: 'none',
                  }}
                />
              </IconTile>
            </div>

            <Link href="/admin/laporan" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              fontSize: 10.5, fontWeight: 800, color: '#fff', textDecoration: 'none',
              background: 'linear-gradient(180deg,#FBBF24 0%,#D97706 100%)',
              borderRadius: 12, padding: '9px 12px',
              boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 14px -6px rgba(217,119,6,0.6)',
            }}>
              Lihat Laporan
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </Card>
      </div>

      {/*
        Bottom navigation disediakan global oleh <AdminBottomNav /> (app/admin/layout.tsx)
        lengkap dengan spacer-nya, jadi di sini cukup jarak penutup kecil.
      */}
      <div style={{ height: 16 }} />
    </div>
  )
}