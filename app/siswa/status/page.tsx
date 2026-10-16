'use client'
// app/siswa/status/page.tsx
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSettings } from '@/contexts/SettingsContext'

// ── Icon set (SVG line-style — sama dengan halaman Pendaftaran) ────────────────
type IconProps = { size?: number; color?: string; strokeWidth?: number }

const Svg = ({
  size,
  color,
  strokeWidth,
  children,
}: Required<IconProps> & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

// Ikon panah kembali — SAMA PERSIS dengan halaman Pendaftaran
const IconArrowLeft = ({ size = 18, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </Svg>
)

const IconSend = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M21 3 10.5 13.5" />
    <path d="M21 3 14.5 21l-4-7.5L3 9.5 21 3Z" />
  </Svg>
)

const IconSearch = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
)

const IconAward = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <circle cx="12" cy="9" r="6" />
    <path d="M8.5 14 7 21l5-3 5 3-1.5-7" />
  </Svg>
)

const IconClock = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
)

const IconCheckCircle = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.3 2.3 4.7-5" />
  </Svg>
)

const IconXCircle = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </Svg>
)

const IconCheck = ({ size = 16, color = 'currentColor', strokeWidth = 2.6 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M5 13l4 4L19 7" />
  </Svg>
)

const IconAlertTriangle = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M12 3.5 21.5 20H2.5L12 3.5Z" />
    <path d="M12 10v4" />
    <path d="M12 17.2h.01" />
  </Svg>
)

const IconClipboard = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
    <path d="M9 11h6" />
    <path d="M9 14.5h3" />
  </Svg>
)

const IconTimeline = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <circle cx="6" cy="6" r="2.2" />
    <circle cx="6" cy="18" r="2.2" />
    <path d="M6 8.2v7.6" />
    <path d="M12 6h8" />
    <path d="M12 18h8" />
  </Svg>
)

const IconFile = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </Svg>
)

const IconMessage = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12Z" />
    <path d="M9 11h6" />
    <path d="M9 14h3" />
  </Svg>
)

const IconHome = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-5h4v5" />
  </Svg>
)

const IconEdit = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </Svg>
)

const IconRefresh = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M20 12a8 8 0 1 1-2.3-5.7" />
    <path d="M20 4v5h-5" />
  </Svg>
)

// ── Types ──────────────────────────────────────────────────────────────────────
type StatusKey = 'menunggu' | 'diproses' | 'diterima' | 'ditolak'

interface Pendaftaran {
  id: string
  status: StatusKey
  nama_lengkap: string
  nisn?: string | null
  asal_sekolah?: string | null
  jurusan_pilihan?: string | null
  nilai_rata_rata?: number | string | null
  catatan_admin?: string | null
  created_at: string
}

// ── Konstanta ──────────────────────────────────────────────────────────────────
// Ukuran layout tetap — SAMA dengan halaman Pendaftaran
const HEADER_HEIGHT = 84
const SISWA_NAV_HEIGHT = 68

const TIMELINE: {
  key: string
  label: { id: string; en: string }
  desc: { id: string; en: string }
  Icon: React.ComponentType<IconProps>
}[] = [
  {
    key: 'menunggu',
    label: { id: 'Pendaftaran Dikirim', en: 'Registration Sent' },
    desc:  { id: 'Formulir berhasil diterima oleh sistem', en: 'Form successfully received by system' },
    Icon: IconSend,
  },
  {
    key: 'diproses',
    label: { id: 'Verifikasi Berkas', en: 'Document Verification' },
    desc:  { id: 'Panitia sedang memeriksa kelengkapan berkas', en: 'Committee is checking document completeness' },
    Icon: IconSearch,
  },
  {
    key: 'diterima',
    label: { id: 'Pengumuman Hasil', en: 'Result Announcement' },
    desc:  { id: 'Keputusan akhir penerimaan telah ditetapkan', en: 'Final admission decision has been made' },
    Icon: IconAward,
  },
]
const STATUS_ORDER = ['menunggu', 'diproses', 'diterima']

const STATUS_META: Record<
  StatusKey,
  { Icon: React.ComponentType<IconProps>; tag: { id: string; en: string }; name: { id: string; en: string } }
> = {
  menunggu: { Icon: IconClock,       tag: { id: 'Menunggu Review', en: 'Pending Review' }, name: { id: 'Menunggu', en: 'Pending' } },
  diproses: { Icon: IconSearch,      tag: { id: 'Sedang Diproses', en: 'Processing' },     name: { id: 'Diproses', en: 'Processing' } },
  diterima: { Icon: IconCheckCircle, tag: { id: 'Diterima',        en: 'Accepted' },       name: { id: 'Diterima', en: 'Accepted' } },
  ditolak:  { Icon: IconXCircle,     tag: { id: 'Tidak Diterima',  en: 'Not Accepted' },   name: { id: 'Ditolak',  en: 'Rejected' } },
}

// ── Theme tokens — palet hijau, SAMA dengan halaman Pendaftaran & Beranda ──────
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
type Theme = ReturnType<typeof getTheme>

// Warna semantik per status
function getStatusTone(isDark: boolean): Record<StatusKey, { bg: string; border: string; text: string; dot: string }> {
  return {
    menunggu: {
      bg:     isDark ? '#2e2a1a' : '#FFF6D6',
      border: isDark ? '#4a3a1a' : '#F2D77A',
      text:   isDark ? '#fbbf24' : '#8A6200',
      dot:    '#F2B705',
    },
    diproses: {
      bg:     isDark ? '#12262d' : '#E6F2F7',
      border: isDark ? '#1d3d49' : '#BFDDEA',
      text:   isDark ? '#5CC8E6' : '#0B5C7A',
      dot:    '#0EA5C6',
    },
    diterima: {
      bg:     isDark ? '#16302A' : '#E8F4EE',
      border: isDark ? '#22443A' : '#BFE0CE',
      text:   isDark ? '#4ADE98' : '#0A4F37',
      dot:    '#16A36A',
    },
    ditolak: {
      bg:     isDark ? '#2e1a1a' : '#FEECEC',
      border: isDark ? '#4a1a1a' : '#F5A9A9',
      text:   isDark ? '#fca5a5' : '#B42318',
      dot:    '#EF4444',
    },
  }
}

// ── Style helpers ───────────────────────────────────────────────────────────────
function getCardStyle(isDark: boolean): React.CSSProperties {
  const t = getTheme(isDark)
  return {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 22,
    padding: 20,
    boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,60,40,.04), 0 10px 28px rgba(15,60,40,.06)',
  }
}

// ── Sub-components ──────────────────────────────────────────────────────────────
function IconBadge({
  icon: Icon,
  isDark,
  size = 40,
  tone,
}: {
  icon: React.ComponentType<IconProps>
  isDark: boolean
  size?: number
  tone?: { bg: string; color: string }
}) {
  const t = getTheme(isDark)
  return (
    <span
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        background: tone ? tone.bg : t.gradient,
        color: tone ? tone.color : '#FFFFFF',
        boxShadow: tone || isDark ? 'none' : '0 4px 10px rgba(15,107,74,.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={Math.round(size * 0.48)} strokeWidth={1.8} />
    </span>
  )
}

function CardTitle({
  icon,
  title,
  subtitle,
  isDark,
  tone,
  noDivider = false,
}: {
  icon: React.ComponentType<IconProps>
  title: string
  subtitle?: string
  isDark: boolean
  tone?: { bg: string; color: string }
  noDivider?: boolean
}) {
  const t = getTheme(isDark)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: noDivider ? 0 : 18,
        paddingBottom: noDivider ? 0 : 16,
        borderBottom: noDivider ? 'none' : `1px solid ${t.divider}`,
      }}
    >
      <IconBadge icon={icon} isDark={isDark} size={40} tone={tone} />
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: t.text, lineHeight: 1.3, letterSpacing: '-.01em' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ margin: '2px 0 0', fontSize: 12.5, color: t.muted, fontWeight: 500, lineHeight: 1.4 }}>{subtitle}</p>
        )}
      </div>
    </div>
  )
}

function Pill({
  children,
  bg,
  color,
  border,
}: {
  children: React.ReactNode
  bg: string
  color: string
  border: string
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 700,
        color,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 999,
        padding: '3px 10px',
      }}
    >
      {children}
    </span>
  )
}

// CSS global halaman (tombol back, animasi) — sama dengan halaman Pendaftaran
const PAGE_CSS = `
@keyframes spin { to { transform: rotate(360deg); } }
.psmb-back { transition: transform .12s ease, background-color .15s ease; -webkit-tap-highlight-color: transparent; }
.psmb-back:active { transform: scale(.94); }
.psmb-btn { transition: transform .12s ease, filter .15s ease; -webkit-tap-highlight-color: transparent; }
.psmb-btn:active:not(:disabled) { transform: scale(.98); }
@keyframes psmb-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
`

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StatusPage() {
  const { status: sessionStatus } = useSession()
  const router = useRouter()
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'
  const t: Theme = getTheme(isDark)
  const cardStyle = getCardStyle(isDark)
  const tones = getStatusTone(isDark)

  const [pendaftaran, setPendaftaran] = useState<Pendaftaran | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (sessionStatus !== 'authenticated') return

    let cancelled = false

    fetch('/api/pendaftaran')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(json => {
        if (!cancelled) setPendaftaran((json.data as Pendaftaran | null) ?? null)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [sessionStatus, router, reloadKey])

  const retryFetch = () => {
    setLoading(true)
    setError(false)
    setReloadKey(key => key + 1)
  }

  const getText = (obj: { id: string; en: string }) => (isEn ? obj.en : obj.id)

  // ── Header (FIXED) — desain identik dengan halaman Pendaftaran ──────────────
  const header = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
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
        href="/siswa/dashboard"
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
          {isEn ? 'Registration Status' : 'Status Pendaftaran'}
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
          {isEn ? 'Track your selection progress' : 'Pantau progres seleksi kamu'}
        </p>
      </div>
    </div>
  )

  // ── Loading state ───────────────────────────────────────────────────────────
  if (sessionStatus === 'loading' || loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: t.bg,
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderWidth: 4,
            borderStyle: 'solid',
            borderColor: isDark ? '#22332B' : '#DCE6DF',
            borderTopColor: '#0F6B4A',
            borderRadius: '50%',
            animation: 'spin .8s linear infinite',
          }}
        />
        <p style={{ color: t.muted, fontSize: 13, fontWeight: 500, margin: 0 }}>
          {isEn ? 'Loading registration data...' : 'Memuat data pendaftaran...'}
        </p>
        <style>{PAGE_CSS}</style>
      </div>
    )
  }

  // ── Data turunan ────────────────────────────────────────────────────────────
  const p = pendaftaran
  const currentIdx = p ? STATUS_ORDER.indexOf(p.status) : -1
  const isDitolak = p?.status === 'ditolak'
  const isDiterima = p?.status === 'diterima'
  const meta = p ? STATUS_META[p.status] : null
  const tone = p ? tones[p.status] : null

  let tanggalDaftar = '-'
  if (p?.created_at) {
    const d = new Date(p.created_at)
    if (!Number.isNaN(d.getTime())) {
      tanggalDaftar = d.toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }
  }

  const nilaiRaw = p?.nilai_rata_rata
  const nilaiStr =
    nilaiRaw !== null && nilaiRaw !== undefined && nilaiRaw !== '' && Number.isFinite(Number(nilaiRaw))
      ? `${Number(nilaiRaw).toFixed(2)} / 100`
      : ''

  // Baris data: field opsional hanya tampil jika ada isinya
  const dataRows: { key: string; val: string }[] = p
    ? [
        { key: isEn ? 'Full Name' : 'Nama Lengkap', val: p.nama_lengkap ?? '' },
        { key: 'NISN', val: p.nisn ?? '' },
        { key: isEn ? 'School Origin' : 'Asal Sekolah', val: p.asal_sekolah ?? '' },
        { key: isEn ? 'Major Choice' : 'Jurusan Pilihan', val: p.jurusan_pilihan ?? '' },
        { key: isEn ? 'Average Score' : 'Nilai Rata-rata', val: nilaiStr },
      ].filter((r, i) => i === 0 || Boolean(r.val))
    : []

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 430,
        margin: '0 auto',
        background: t.bg,
        minHeight: '100dvh',
      }}
    >
      {header}

      <main
        style={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: SISWA_NAV_HEIGHT + 16,
        }}
      >
        <div
          style={{
            padding: '16px 16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            animation: 'psmb-fade .25s ease both',
          }}
        >
          {/* ── Error state ── */}
          {error && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <IconBadge
                  icon={IconAlertTriangle}
                  isDark={isDark}
                  size={60}
                  tone={{ bg: tones.ditolak.bg, color: tones.ditolak.text }}
                />
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: t.text, margin: '0 0 6px' }}>
                {isEn ? 'Failed to load registration data' : 'Gagal memuat data pendaftaran'}
              </p>
              <p style={{ fontSize: 13, color: t.muted, margin: '0 0 20px', lineHeight: 1.5 }}>
                {isEn ? 'Check your internet connection and try again.' : 'Periksa koneksi internet Anda lalu coba lagi.'}
              </p>
              <button
                type="button"
                className="psmb-btn"
                onClick={retryFetch}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: 46,
                  padding: '12px 24px',
                  borderRadius: 14,
                  border: 'none',
                  background: t.gradient,
                  boxShadow: t.shadowBtn,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                <IconRefresh size={16} />
                {isEn ? 'Try Again' : 'Coba Lagi'}
              </button>
            </div>
          )}

          {/* ── Empty state ── */}
          {!error && !p && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '44px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <IconBadge icon={IconClipboard} isDark={isDark} size={64} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: t.text, margin: '0 0 8px' }}>
                {isEn ? 'No Registration Yet' : 'Belum Ada Pendaftaran'}
              </p>
              <p style={{ fontSize: 13, color: t.muted, margin: '0 0 22px', lineHeight: 1.55 }}>
                {isEn
                  ? "You haven't filled out the registration form yet. Register before the deadline."
                  : 'Kamu belum mengisi formulir pendaftaran. Segera daftarkan diri sebelum batas waktu.'}
              </p>
              <Link
                href="/siswa/pendaftaran"
                className="psmb-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: 46,
                  padding: '12px 24px',
                  borderRadius: 14,
                  background: t.gradient,
                  boxShadow: t.shadowBtn,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                <IconEdit size={16} />
                <span>{isEn ? 'Fill Form Now' : 'Isi Formulir Sekarang'}</span>
              </Link>
            </div>
          )}

          {!error && p && (
            <>
              {/* ── No. Registrasi ── */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <IconBadge icon={IconClipboard} isDark={isDark} size={44} />
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: '0 0 3px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: t.muted,
                        letterSpacing: 0.6,
                        textTransform: 'uppercase',
                      }}
                    >
                      {isEn ? 'Registration No.' : 'No. Registrasi'}
                    </p>
                    <p
                      style={{
                        margin: '0 0 3px',
                        fontSize: 22,
                        fontWeight: 800,
                        color: t.text,
                        letterSpacing: 0.6,
                        lineHeight: 1.2,
                      }}
                    >
                      {p.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p style={{ margin: 0, fontSize: 12.5, color: t.muted, fontWeight: 500 }}>
                      {isEn ? 'Registered' : 'Didaftarkan'}: {tanggalDaftar}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Status badge ── */}
              {meta && tone && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: tone.bg,
                    border: `1px solid ${tone.border}`,
                    borderRadius: 18,
                    padding: '13px 16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.75)',
                        color: tone.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <meta.Icon size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: tone.text,
                          letterSpacing: 0.6,
                          textTransform: 'uppercase',
                          margin: '0 0 2px',
                          opacity: 0.85,
                        }}
                      >
                        {getText(meta.tag)}
                      </p>
                      <p style={{ fontSize: 15.5, fontWeight: 800, color: tone.text, margin: 0 }}>
                        {getText(meta.name)}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: tone.dot,
                      boxShadow: `0 0 0 4px ${tone.dot}33`,
                      flexShrink: 0,
                    }}
                  />
                </div>
              )}

              {/* ── Banner Diterima ── */}
              {isDiterima && (
                <div
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 22,
                    padding: '28px 20px',
                    textAlign: 'center',
                    background: t.gradient,
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 12px 28px rgba(15,107,74,.28)',
                  }}
                >
                  <div style={{ position: 'absolute', top: -34, right: -34, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                  <div style={{ position: 'absolute', bottom: -26, left: -26, width: 100, height: 100, borderRadius: '50%', background: 'rgba(242,183,5,0.14)' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.16)',
                        border: '1px solid rgba(255,255,255,0.28)',
                        color: t.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px',
                      }}
                    >
                      <IconAward size={30} strokeWidth={1.7} />
                    </div>
                    <p style={{ fontSize: 19, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-.01em' }}>
                      {isEn ? "Congratulations! You're Accepted" : 'Selamat! Anda Diterima'}
                    </p>
                    {p.jurusan_pilihan && (
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', margin: '0 0 16px' }}>
                        {isEn ? 'in Major' : 'di Jurusan'}{' '}
                        <span style={{ fontWeight: 700, color: '#fff' }}>{p.jurusan_pilihan}</span>
                      </p>
                    )}
                    {p.catatan_admin && (
                      <p
                        style={{
                          fontSize: 12.5,
                          color: 'rgba(255,255,255,0.9)',
                          background: 'rgba(255,255,255,0.12)',
                          borderRadius: 14,
                          padding: '10px 14px',
                          margin: '12px 0 16px',
                          lineHeight: 1.5,
                        }}
                      >
                        {p.catatan_admin}
                      </p>
                    )}
                    <Link
                      href="/siswa/dashboard"
                      className="psmb-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#FFFFFF',
                        color: t.primary,
                        padding: '11px 22px',
                        borderRadius: 14,
                        fontWeight: 700,
                        fontSize: 13.5,
                        textDecoration: 'none',
                        marginTop: p.catatan_admin || p.jurusan_pilihan ? 0 : 14,
                      }}
                    >
                      <IconHome size={16} />
                      {isEn ? 'Back to Home' : 'Kembali ke Beranda'}
                    </Link>
                  </div>
                </div>
              )}

              {/* ── Kartu Ditolak ── */}
              {isDitolak && (
                <div style={cardStyle}>
                  <CardTitle
                    icon={IconXCircle}
                    isDark={isDark}
                    tone={{ bg: tones.ditolak.bg, color: tones.ditolak.text }}
                    title={isEn ? 'Registration Not Accepted' : 'Pendaftaran Tidak Diterima'}
                    subtitle={
                      isEn
                        ? 'Sorry, your registration did not pass the selection'
                        : 'Maaf, pendaftaran Anda tidak lolos seleksi'
                    }
                    noDivider={!p.catatan_admin}
                  />
                  {p.catatan_admin && (
                    <div
                      style={{
                        background: tones.ditolak.bg,
                        border: `1px solid ${tones.ditolak.border}`,
                        borderRadius: 14,
                        padding: '12px 14px',
                      }}
                    >
                      <p
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 800,
                          color: tones.ditolak.text,
                          margin: '0 0 6px',
                        }}
                      >
                        <IconMessage size={14} />
                        {isEn ? 'Committee Note' : 'Catatan Panitia'}
                      </p>
                      <p style={{ fontSize: 12.5, color: tones.ditolak.text, margin: 0, lineHeight: 1.55 }}>
                        {p.catatan_admin}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Timeline ── */}
              {!isDitolak && (
                <div style={cardStyle}>
                  <CardTitle
                    icon={IconTimeline}
                    isDark={isDark}
                    title={isEn ? 'Selection Timeline' : 'Timeline Proses Seleksi'}
                    subtitle={isEn ? 'Stages of your registration' : 'Tahapan pendaftaran Anda'}
                  />

                  <div>
                    {TIMELINE.map((step, i) => {
                      const isDone = i < currentIdx
                      const isActive = i === currentIdx
                      const isLast = i === TIMELINE.length - 1

                      const circleBg = isDone ? t.gradient : isActive ? t.primarySoft : t.pendingBg
                      const circleColor = isDone ? '#FFFFFF' : isActive ? t.primaryText : t.faint
                      const circleBorder = isDone ? 'transparent' : isActive ? t.primary : t.line
                      const labelColor = isDone || isActive ? t.text : t.faint
                      const lineColor = isDone ? t.primary : t.line

                      return (
                        <div key={step.key} style={{ display: 'flex', gap: 14 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: circleBg,
                                color: circleColor,
                                border: `1.5px solid ${circleBorder}`,
                                boxShadow: isActive
                                  ? `0 0 0 4px ${isDark ? 'rgba(74,222,152,.18)' : 'rgba(15,107,74,.14)'}`
                                  : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxSizing: 'border-box',
                              }}
                            >
                              {isDone ? <IconCheck size={17} /> : <step.Icon size={18} strokeWidth={1.8} />}
                            </div>
                            {!isLast && (
                              <div
                                style={{
                                  width: 2,
                                  flex: 1,
                                  minHeight: 32,
                                  borderRadius: 2,
                                  background: lineColor,
                                  margin: '4px 0',
                                }}
                              />
                            )}
                          </div>

                          <div style={{ paddingBottom: isLast ? 0 : 20, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 800, color: labelColor, margin: '9px 0 3px' }}>
                              {getText(step.label)}
                            </p>
                            <p style={{ fontSize: 12.5, color: t.muted, margin: '0 0 8px', lineHeight: 1.45 }}>
                              {getText(step.desc)}
                            </p>
                            {isActive && (
                              <Pill
                                bg={t.primarySoft}
                                color={t.primaryText}
                                border={isDark ? '#22443A' : '#BFE0CE'}
                              >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.primary }} />
                                {isEn ? 'In progress' : 'Sedang berlangsung'}
                              </Pill>
                            )}
                            {isDone && (
                              <Pill
                                bg={t.primarySoft}
                                color={t.primaryText}
                                border={isDark ? '#22443A' : '#BFE0CE'}
                              >
                                <IconCheck size={11} strokeWidth={3} />
                                {isEn ? 'Completed' : 'Selesai'}
                              </Pill>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Data Pendaftaran ── */}
              <div style={cardStyle}>
                <CardTitle
                  icon={IconFile}
                  isDark={isDark}
                  title={isEn ? 'Registration Data' : 'Data Pendaftaran'}
                  subtitle={isEn ? 'Information you submitted' : 'Informasi yang Anda kirimkan'}
                />
                <div>
                  {dataRows.map(({ key, val }, idx) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 16,
                        padding: '11px 0',
                        borderBottom: idx < dataRows.length - 1 ? `1px solid ${t.divider}` : 'none',
                        paddingTop: idx === 0 ? 0 : 11,
                      }}
                    >
                      <span style={{ fontSize: 13.5, color: t.muted, fontWeight: 500, flexShrink: 0 }}>{key}</span>
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: t.text,
                          textAlign: 'right',
                          wordBreak: 'break-word',
                          minWidth: 0,
                        }}
                      >
                        {val || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Tombol Edit ── */}
              {p.status === 'menunggu' && (
                <Link
                  href="/siswa/pendaftaran"
                  className="psmb-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    minHeight: 50,
                    padding: '14px 18px',
                    borderRadius: 14,
                    background: t.surface,
                    color: t.primaryText,
                    border: `1.5px solid ${isDark ? '#22443A' : '#BFE0CE'}`,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <IconEdit size={16} />
                  <span>{isEn ? 'Edit Registration Form' : 'Edit Formulir Pendaftaran'}</span>
                </Link>
              )}
            </>
          )}
        </div>
      </main>

      <style>{PAGE_CSS}</style>
    </div>
  )
}