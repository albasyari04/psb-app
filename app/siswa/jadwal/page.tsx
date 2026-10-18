'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSettings } from '@/contexts/SettingsContext'

// ── Icon set (SVG line-style — sama gaya dengan halaman Pendaftaran) ───────────
type IconProps = { size?: number; color?: string; strokeWidth?: number }

const IconArrowLeft = ({ size = 18, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
)

const IconCalendar = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
)

const IconClock = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

const IconCheckCircle = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.3 2.3 4.7-5" />
  </svg>
)

const IconBell = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
)

const IconPin = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

const IconInbox = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13.5 5.8 5.8A2 2 0 0 1 7.7 4.5h8.6a2 2 0 0 1 1.9 1.3L21 13.5" />
    <path d="M3 13.5V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4.5h-5.2a1 1 0 0 0-.9.6 3.3 3.3 0 0 1-5.8 0 1 1 0 0 0-.9-.6H3Z" />
  </svg>
)

const IconChevronRight = ({ size = 18, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7" />
  </svg>
)

// Ikon navigasi bawah
const NavHome = ({ size = 22, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
  </svg>
)
const NavForm = ({ size = 22, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
    <path d="m9 14 2 2 4-4" />
  </svg>
)
const NavCard = ({ size = 22, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 10h19M6.5 15h3" />
  </svg>
)
const NavChart = ({ size = 22, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />
  </svg>
)
const NavUser = ({ size = 22, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M5 21c0-3.866 3.134-7 7-7s7 3.134 7 7" />
  </svg>
)

// ── Types ─────────────────────────────────────────────────────────────────────
type StatusType = 'Akan Datang' | 'Berlangsung' | 'Selesai'

interface Jadwal {
  id: string
  label: string
  tanggal: string
  tanggal_mulai: string | null
  tanggal_selesai: string | null
  status: StatusType
  warna: string
  urutan: number
  lokasi?: string
  icon_url?: string
}

type FilterType = 'Semua' | StatusType

// ── Konstanta ─────────────────────────────────────────────────────────────────
const HEADER_HEIGHT = 84

const FILTERS: { key: FilterType; id: string; en: string }[] = [
  { key: 'Semua',       id: 'Semua',       en: 'All' },
  { key: 'Berlangsung', id: 'Berlangsung', en: 'Ongoing' },
  { key: 'Akan Datang', id: 'Akan Datang', en: 'Upcoming' },
  { key: 'Selesai',     id: 'Selesai',     en: 'Done' },
]

const STATUS_LABEL: Record<StatusType, { id: string; en: string }> = {
  'Berlangsung': { id: 'Berlangsung', en: 'Ongoing' },
  'Akan Datang': { id: 'Akan Datang', en: 'Upcoming' },
  'Selesai':     { id: 'Selesai',     en: 'Completed' },
}

// ── Theme tokens (identik dengan halaman Pendaftaran) ─────────────────────────
function getTheme(isDark: boolean) {
  return {
    bg:          isDark ? '#0E1512' : '#F5F8F6',
    surface:     isDark ? '#15201B' : '#FFFFFF',
    surfaceAlt:  isDark ? '#101A16' : '#F6F9F7',
    border:      isDark ? '#22332B' : '#E7EEE9',
    borderInput: isDark ? '#2A3D34' : '#DCE6DF',
    divider:     isDark ? '#22332B' : '#EAF0EC',
    text:        isDark ? '#EEF5F1' : '#14231C',
    label:       isDark ? '#CFE0D6' : '#1B2E25',
    muted:       isDark ? '#8FA89B' : '#6B7F74',
    faint:       isDark ? '#5E7569' : '#A3B3AA',
    primary:     '#0F6B4A',
    primaryDark: '#0A4F37',
    primaryText: isDark ? '#4ADE98' : '#0F6B4A',
    primarySoft: isDark ? '#16302A' : '#E8F4EE',
    accent:      '#F2B705',
    pendingBg:   isDark ? '#22332B' : '#EDF2EF',
    line:        isDark ? '#22332B' : '#DCE6DF',
    gradient:    'linear-gradient(135deg, #0F6B4A 0%, #0A4F37 100%)',
    shadowBtn:   '0 8px 20px rgba(15,107,74,.26)',
  }
}

// Warna per status — tetap satu keluarga dengan palet hijau
function getStatusConfig(status: StatusType, isDark: boolean) {
  if (status === 'Berlangsung') {
    return {
      solid: 'linear-gradient(135deg, #0F6B4A 0%, #0A4F37 100%)',
      glow:  'rgba(15,107,74,.26)',
      soft:  isDark ? '#16302A' : '#E8F4EE',
      fg:    isDark ? '#4ADE98' : '#0A4F37',
      line:  isDark ? '#22443A' : '#BFE0CE',
      dot:   isDark ? '#4ADE98' : '#0F6B4A',
    }
  }
  if (status === 'Akan Datang') {
    return {
      solid: 'linear-gradient(135deg, #F2B705 0%, #D99A00 100%)',
      glow:  'rgba(242,183,5,.30)',
      soft:  isDark ? '#2e2a1a' : '#FFF6D6',
      fg:    isDark ? '#fbbf24' : '#8A6200',
      line:  isDark ? '#4a3a1a' : '#F2D77A',
      dot:   '#F2B705',
    }
  }
  return {
    solid: 'linear-gradient(135deg, #7F9488 0%, #5E7569 100%)',
    glow:  'rgba(94,117,105,.22)',
    soft:  isDark ? '#22332B' : '#EDF2EF',
    fg:    isDark ? '#8FA89B' : '#5E7569',
    line:  isDark ? '#2A3D34' : '#DCE6DF',
    dot:   isDark ? '#8FA89B' : '#7F9488',
  }
}

function StatusIcon({ status, size = 20 }: { status: StatusType; size?: number }) {
  if (status === 'Berlangsung') return <IconClock size={size} strokeWidth={1.9} />
  if (status === 'Selesai')     return <IconCheckCircle size={size} strokeWidth={1.9} />
  return <IconBell size={size} strokeWidth={1.9} />
}

// Ikon gambar dari /public/icons — otomatis fallback ke ikon vektor jika file gagal dimuat
function AssetIcon({
  src,
  alt,
  size,
  fallback,
}: {
  src: string
  alt: string
  size: number
  fallback: React.ReactNode
}) {
  const [err, setErr] = useState(false)
  if (err) return <>{fallback}</>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block', userSelect: 'none' }}
    />
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTanggal(iso: string, isEn: boolean): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch { return iso }
}

function daysBetween(a: Date, b: Date): number {
  const DAY = 86400000
  const s = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const e = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((e - s) / DAY)
}

function getRelative(j: Jadwal, isEn: boolean): string | null {
  const now = new Date()
  if (j.status === 'Akan Datang') {
    const start = new Date(j.tanggal_mulai ?? j.tanggal)
    if (isNaN(start.getTime())) return null
    const d = daysBetween(now, start)
    if (d <= 0) return isEn ? 'Starts today' : 'Dimulai hari ini'
    if (d === 1) return isEn ? 'Starts tomorrow' : 'Dimulai besok'
    return isEn ? `In ${d} days` : `${d} hari lagi`
  }
  if (j.status === 'Berlangsung') {
    if (!j.tanggal_selesai) return null
    const end = new Date(j.tanggal_selesai)
    if (isNaN(end.getTime())) return null
    const d = daysBetween(now, end)
    if (d <= 0) return isEn ? 'Ends today' : 'Berakhir hari ini'
    if (d === 1) return isEn ? 'Ends tomorrow' : 'Berakhir besok'
    return isEn ? `Ends in ${d} days` : `Berakhir ${d} hari lagi`
  }
  return null
}

// CSS global halaman
const PAGE_CSS = `
@keyframes jdw-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
@keyframes jdw-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.psmb-back { transition: transform .12s ease, background-color .15s ease; -webkit-tap-highlight-color: transparent; }
.psmb-back:active { transform: scale(.94); }
.jdw-tab { transition: background .15s ease, color .15s ease, box-shadow .15s ease, transform .12s ease; -webkit-tap-highlight-color: transparent; }
.jdw-tab:active { transform: scale(.97); }
.jdw-nav { -webkit-tap-highlight-color: transparent; }
.jdw-main::-webkit-scrollbar { display: none; }
.jdw-main { scrollbar-width: none; }
`

// ── Component ─────────────────────────────────────────────────────────────────
export default function JadwalPage() {
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'
  const t = getTheme(isDark)

  const [jadwalList, setJadwalList] = useState<Jadwal[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<FilterType>('Semua')
  const [bannerErr, setBannerErr]   = useState(false)

  useEffect(() => {
    async function fetchJadwal() {
      try {
        const res  = await fetch('/api/siswa/jadwal')
        const json = await res.json()
        if (res.ok) setJadwalList(json.data ?? [])
      } catch (e) {
        console.error('Failed to fetch jadwal', e)
      } finally {
        setLoading(false)
      }
    }
    fetchJadwal()
  }, [])

  const filtered = filter === 'Semua'
    ? jadwalList
    : jadwalList.filter((j) => j.status === filter)

  const counts = {
    total:       jadwalList.length,
    berlangsung: jadwalList.filter((j) => j.status === 'Berlangsung').length,
    akanDatang:  jadwalList.filter((j) => j.status === 'Akan Datang').length,
    selesai:     jadwalList.filter((j) => j.status === 'Selesai').length,
  }

  const cardStyle: React.CSSProperties = {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 22,
    boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,60,40,.04), 0 10px 28px rgba(15,60,40,.06)',
  }

  const navItems = [
    { href: '/siswa',             label: isEn ? 'Home'     : 'Beranda', Icon: NavHome,  active: false },
    { href: '/siswa/pendaftaran', label: isEn ? 'Register' : 'Daftar',  Icon: NavForm,  active: false },
    { href: '/siswa/pembayaran',  label: isEn ? 'Payment'  : 'Bayar',   Icon: NavCard,  active: false },
    { href: '/siswa/status',      label: 'Status',                      Icon: NavChart, active: false },
    { href: '/siswa/profile',     label: isEn ? 'Profile'  : 'Profil',  Icon: NavUser,  active: false },
  ]

  return (
    // ══════ APP SHELL — tinggi dikunci 100dvh + overflow hidden ══════
    // Header & bottom nav ada di flow normal (bukan fixed/sticky) sehingga tidak ikut
    // ter-scroll di environment apa pun. Hanya <main> di tengah yang scroll.
    <div
      style={{
        height: '100dvh',
        backgroundColor: t.bg,
        maxWidth: 430,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ══════ HEADER — identik dengan halaman Pendaftaran ══════ */}
      <div
        style={{
          flexShrink: 0,
          height: HEADER_HEIGHT,
          zIndex: 40,
          background: t.surface,
          borderBottom: `1px solid ${t.border}`,
          padding: '0 16px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Link
          href="/siswa"
          aria-label={isEn ? 'Back' : 'Kembali'}
          className="psmb-back"
          style={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: '50%',
            background: t.primarySoft,
            border: isDark ? '1px solid #22443A' : '1px solid #CFE6DA',
            boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,107,74,.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: t.primaryText,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <IconArrowLeft size={18} />
        </Link>

        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: t.text,
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {isEn ? 'Important Schedule' : 'Jadwal Penting'}
          </h1>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 13,
              color: t.muted,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {isEn ? 'Schedule of Pon-Pes Al Istiqomah' : 'Jadwal Pon-Pes Al Istiqomah'}
          </p>
        </div>
      </div>

      {/* ══════ AREA SCROLL — HANYA INI YANG BOLEH SCROLL ══════ */}
      <main
        className="jdw-main"
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '0 16px 24px',
        }}
      >
        {/* ─── Ringkasan ─── */}
        {!loading && jadwalList.length > 0 && (
          <div style={{ ...cardStyle, padding: '16px 8px', marginTop: 16, animation: 'jdw-fade .25s ease both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {([
                { n: counts.berlangsung, label: isEn ? 'Ongoing'  : 'Berlangsung', status: 'Berlangsung' as StatusType },
                { n: counts.akanDatang,  label: isEn ? 'Upcoming' : 'Akan Datang', status: 'Akan Datang' as StatusType },
                { n: counts.selesai,     label: isEn ? 'Done'     : 'Selesai',     status: 'Selesai' as StatusType },
              ]).map((s, i) => {
                const cfg = getStatusConfig(s.status, isDark)
                return (
                  <div
                    key={s.status}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 4px',
                      borderLeft: i === 0 ? 'none' : `1px solid ${t.divider}`,
                    }}
                  >
                    <span style={{ fontSize: 24, fontWeight: 800, color: t.text, lineHeight: 1.1, letterSpacing: '-.02em' }}>
                      {s.n}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: cfg.fg }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── FILTER TABS (sticky di dalam area scroll) ─── */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: t.bg,
            padding: '14px 0 12px',
          }}
        >
          <div
            role="tablist"
            style={{
              ...cardStyle,
              borderRadius: 16,
              padding: 4,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 4,
            }}
          >
            {FILTERS.map((f) => {
              const isActive = filter === f.key
              return (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className="jdw-tab"
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: '10px 2px',
                    fontSize: 12.5,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#FFFFFF' : t.muted,
                    background: isActive ? t.gradient : 'transparent',
                    boxShadow: isActive ? '0 4px 10px rgba(15,107,74,.24)' : 'none',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    minHeight: 40,
                  }}
                >
                  {isEn ? f.en : f.id}
                </button>
              )
            })}
          </div>
        </div>

        {/* ─── Section header ─── */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 16px' }}>
            <span
              style={{
                width: 40, height: 40, minWidth: 40, borderRadius: '50%',
                background: t.primarySoft,
                border: isDark ? '1px solid #22443A' : '1px solid #CFE6DA',
                boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,107,74,.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <AssetIcon
                src="/icons/kalender-santri.png"
                alt={isEn ? 'Calendar' : 'Kalender'}
                size={26}
                fallback={<span style={{ display: 'flex', color: t.primaryText }}><IconCalendar size={18} strokeWidth={1.9} /></span>}
              />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: t.text, lineHeight: 1.3, letterSpacing: '-.01em' }}>
                {isEn ? 'Activity Schedule' : 'Jadwal Kegiatan'}
              </h2>
            </div>
            <span
              style={{
                padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: t.primarySoft, color: t.primaryText,
              }}
            >
              {filtered.length} {isEn ? 'items' : 'kegiatan'}
            </span>
          </div>
        )}

        {loading ? (
          /* ─── Skeleton ─── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 12, animation: 'jdw-pulse 1.5s ease-in-out infinite' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.pendingBg, flexShrink: 0 }} />
                <div style={{ ...cardStyle, flex: 1, padding: 16 }}>
                  <div style={{ width: '60%', height: 14, borderRadius: 6, background: t.pendingBg, marginBottom: 12 }} />
                  <div style={{ width: '80%', height: 11, borderRadius: 6, background: t.pendingBg, marginBottom: 8 }} />
                  <div style={{ width: '35%', height: 22, borderRadius: 999, background: t.pendingBg }} />
                </div>
              </div>
            ))}
          </div>

        ) : filtered.length === 0 ? (
          /* ─── Empty ─── */
          <div style={{ ...cardStyle, marginTop: 4, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: t.primarySoft, color: t.primaryText,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <IconInbox size={28} strokeWidth={1.6} />
            </span>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: t.text }}>
                {filter === 'Semua'
                  ? (isEn ? 'No schedule yet' : 'Belum ada jadwal')
                  : (isEn ? 'Nothing here' : 'Tidak ada jadwal')}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: t.muted, lineHeight: 1.5 }}>
                {filter === 'Semua'
                  ? (isEn ? 'Schedules will appear here once published.' : 'Jadwal akan tampil di sini setelah dipublikasikan.')
                  : (isEn
                      ? `There is no "${STATUS_LABEL[filter as StatusType].en}" schedule right now.`
                      : `Belum ada jadwal dengan status "${filter}".`)}
              </p>
            </div>
          </div>

        ) : (
          /* ─── Timeline cards ─── */
          <div key={filter} style={{ display: 'flex', flexDirection: 'column', animation: 'jdw-fade .25s ease both' }}>
            {filtered.map((j, idx) => {
              const cfg = getStatusConfig(j.status, isDark)
              const isLast = idx === filtered.length - 1
              const statusText = isEn ? STATUS_LABEL[j.status]?.en ?? j.status : STATUS_LABEL[j.status]?.id ?? j.status
              const relative = getRelative(j, isEn)
              const tanggalStr = j.tanggal_mulai && j.tanggal_selesai
                ? `${formatTanggal(j.tanggal_mulai, isEn)} – ${formatTanggal(j.tanggal_selesai, isEn)}`
                : formatTanggal(j.tanggal, isEn)

              return (
                <div key={j.id} style={{ display: 'flex', gap: 12 }}>
                  {/* Kolom timeline: ikon + konektor */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 46 }}>
                    <span
                      style={{
                        width: 46, height: 46, minWidth: 46, borderRadius: '50%',
                        background: j.status === 'Berlangsung' ? '#FFFFFF' : cfg.soft,
                        border: `2px solid ${cfg.dot}`,
                        boxSizing: 'border-box',
                        color: cfg.fg,
                        boxShadow: isDark ? 'none' : `0 4px 12px ${cfg.glow}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {j.status === 'Berlangsung' ? (
                        <AssetIcon
                          src="/icons/jam.png"
                          alt={isEn ? 'Clock' : 'Jam'}
                          size={30}
                          fallback={<StatusIcon status={j.status} />}
                        />
                      ) : (
                        <StatusIcon status={j.status} />
                      )}
                    </span>
                    {!isLast && (
                      <span style={{ flex: 1, width: 2, minHeight: 14, marginTop: 6, marginBottom: 6, borderRadius: 2, background: t.line }} />
                    )}
                  </div>

                  {/* Card */}
                  <div
                    style={{
                      ...cardStyle,
                      flex: 1,
                      minWidth: 0,
                      padding: '14px 16px',
                      marginBottom: isLast ? 0 : 14,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                      <h3
                        style={{
                          margin: 0, flex: 1, minWidth: 0,
                          fontSize: 15, fontWeight: 800, color: t.text,
                          lineHeight: 1.35, letterSpacing: '-.01em', wordBreak: 'break-word',
                        }}
                      >
                        {j.label}
                      </h3>
                      <span
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '4px 10px', borderRadius: 999,
                          fontSize: 11, fontWeight: 700,
                          background: cfg.soft, color: cfg.fg,
                          border: `1px solid ${cfg.line}`,
                          flexShrink: 0, whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
                        {statusText}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: `1px solid ${t.divider}` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ display: 'flex', color: t.primaryText, marginTop: 1 }}>
                          <IconCalendar size={15} />
                        </span>
                        <span style={{ color: t.label, fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>{tanggalStr}</span>
                      </div>

                      {j.lokasi && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ display: 'flex', color: t.primaryText, marginTop: 1 }}>
                            <IconPin size={15} />
                          </span>
                          <span style={{ color: t.muted, fontSize: 13, fontWeight: 500, lineHeight: 1.45 }}>{j.lokasi}</span>
                        </div>
                      )}

                      {relative && (
                        <div
                          style={{
                            alignSelf: 'flex-start',
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            marginTop: 2, padding: '5px 10px', borderRadius: 999,
                            background: cfg.soft, color: cfg.fg,
                            fontSize: 12, fontWeight: 700,
                          }}
                        >
                          <IconClock size={13} strokeWidth={2} />
                          {relative}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ─── BANNER "Jangan Lewatkan" ─── */}
        {!loading && (
          <div
            style={{
              marginTop: 24,
              borderRadius: 22,
              overflow: 'hidden',
              background: t.gradient,
              display: 'flex',
              alignItems: 'center',
              boxShadow: t.shadowBtn,
              position: 'relative',
              minHeight: 104,
            }}
          >
            {!bannerErr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/icons/jadwal%20banner1.png"
                alt={isEn ? "Don't miss important schedules" : 'Jangan lewatkan jadwal penting'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                onError={() => setBannerErr(true)}
              />
            ) : (
              <>
                <div style={{ position: 'absolute', top: -28, right: -28, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
                <div style={{ position: 'absolute', bottom: -24, left: '38%', width: 76, height: 76, borderRadius: '50%', background: 'rgba(242,183,5,.16)' }} />

                <div style={{ padding: '18px 0 18px 18px', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <span
                    style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'rgba(255,255,255,.14)',
                      border: '1px solid rgba(255,255,255,.22)',
                      color: '#FFFFFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <IconBell size={22} strokeWidth={1.8} />
                  </span>
                </div>

                <div style={{ padding: '18px 10px 18px 14px', flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                  <p style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 14.5, margin: '0 0 4px', lineHeight: 1.3, letterSpacing: '-.01em' }}>
                    {isEn ? "Don't miss important schedules!" : 'Jangan lewatkan jadwal penting!'}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,.82)', fontSize: 12, margin: 0, lineHeight: 1.45 }}>
                    {isEn
                      ? 'Make sure you never miss important information at every stage.'
                      : 'Pastikan kamu tidak ketinggalan informasi penting dari setiap tahapan.'}
                  </p>
                </div>

                <div style={{ padding: '18px 16px 18px 0', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <span
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: t.accent, color: '#4A3500',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <IconChevronRight size={16} />
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* ─── BOTTOM NAV (statis — bagian dari shell, tidak scroll) ─── */}
      <nav
        style={{
          flexShrink: 0,
          background: t.surface,
          borderTop: `1px solid ${t.border}`,
          display: 'flex',
          boxShadow: isDark ? 'none' : '0 -4px 20px rgba(15,60,40,.07)',
          zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.map(({ href, label, Icon, active }) => {
          const color = active ? t.primaryText : t.faint
          return (
            <Link
              key={href}
              href={href}
              className="jdw-nav"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '10px 0 12px',
                gap: 4,
                color,
                textDecoration: 'none',
                fontSize: 10.5,
                fontWeight: active ? 700 : 500,
              }}
            >
              <Icon size={22} color={color} strokeWidth={active ? 2 : 1.8} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <style>{PAGE_CSS}</style>
    </div>
  )
}