'use client'

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/contexts/SettingsContext'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Pembayaran {
  id: string
  user_id: string
  nama_siswa: string
  nominal: number
  jenis_pembayaran: string
  metode_pembayaran: string
  status: 'menunggu' | 'dikonfirmasi' | 'ditolak'
  bukti_url?: string | null
  catatan?: string | null
  tanggal_bayar?: string | null
  created_at?: string | null
}

interface BiayaItem {
  no: number
  jenis: string
  jumlah: string
  nominal: number
  kategori: string
}

type IconProps = { size?: number; color?: string; strokeWidth?: number }
type IconComponent = React.ComponentType<IconProps>

// ─── Konstanta ─────────────────────────────────────────────────────────────────

const REKENING_INFO = [
  {
    id: 'bri',
    label: 'Bank BRI',
    labelEn: 'BRI Bank',
    number: '5613 0104 4986 539',
    numberRaw: '561301044986539',
    name: 'Ahmad Agus Munif',
    primaryColor: '#003087',
    badgeText: 'BRI',
  },
  {
    id: 'dana',
    label: 'DANA',
    labelEn: 'DANA',
    number: '0878 1455 9628',
    numberRaw: '087814559628',
    name: 'Ahmad Agus Munif',
    primaryColor: '#118EEA',
    badgeText: 'DANA',
  },
]

const STATUS_MAP: Record<string, { label: string; labelEn: string; bg: string; bgDark: string; text: string; textDark: string; dot: string; dotDark: string }> = {
  menunggu: {
    label: 'Menunggu Verifikasi', labelEn: 'Pending Verification',
    bg: '#FFF7ED', bgDark: '#2e2a1a',
    text: '#C2410C', textDark: '#fbbf24',
    dot: '#F97316', dotDark: '#fbbf24',
  },
  dikonfirmasi: {
    label: 'Dikonfirmasi', labelEn: 'Confirmed',
    bg: '#F0FDF4', bgDark: '#1a2e1a',
    text: '#15803D', textDark: '#34d399',
    dot: '#22C55E', dotDark: '#34d399',
  },
  ditolak: {
    label: 'Ditolak', labelEn: 'Rejected',
    bg: '#FFF1F2', bgDark: '#2e1a1a',
    text: '#BE123C', textDark: '#fca5a5',
    dot: '#F43F5E', dotDark: '#fca5a5',
  },
}

const DATA_BIAYA: BiayaItem[] = [
  { no: 1,  jenis: 'Pendaftaran Asrama + Madrasah (Putra)', jumlah: 'Rp. 100.000,-',          nominal: 100000,  kategori: 'Putra' },
  { no: 2,  jenis: 'KTS, Buku Pegangan Santri (Putra)',     jumlah: 'Rp. 70.000,-',            nominal: 70000,   kategori: 'Putra' },
  { no: 3,  jenis: 'Raport (Putra)',                        jumlah: 'Rp. 70.000,-',            nominal: 70000,   kategori: 'Putra' },
  { no: 4,  jenis: 'Seragam Madrasah (2 baju) - Putra',    jumlah: 'Rp. 200.000,-',           nominal: 200000,  kategori: 'Putra' },
  { no: 5,  jenis: 'Uang Kos Makan (2x sehari) - Putra',   jumlah: 'Rp. 300.000,-/Bulan',     nominal: 300000,  kategori: 'Putra' },
  { no: 6,  jenis: 'Sahriyah Asrama + Madrasah (Putra)',   jumlah: 'Rp. 180.000,-/3 Bulan',   nominal: 180000,  kategori: 'Putra' },
  { no: 7,  jenis: 'Uang Bangunan (Putra)',                 jumlah: 'Rp. 250.000,-/Tahun',     nominal: 250000,  kategori: 'Putra' },
  { no: 8,  jenis: 'Pendaftaran Asrama + Madrasah (Putri)', jumlah: 'Rp. 100.000,-',          nominal: 100000,  kategori: 'Putri' },
  { no: 9,  jenis: 'KTS, Buku Pegangan Santri (Putri)',    jumlah: 'Rp. 70.000,-',            nominal: 70000,   kategori: 'Putri' },
  { no: 10, jenis: 'Raport (Putri)',                        jumlah: 'Rp. 70.000,-',            nominal: 70000,   kategori: 'Putri' },
  { no: 11, jenis: 'Seragam Madrasah (3 baju) - Putri',   jumlah: 'Rp. 300.000,-',           nominal: 300000,  kategori: 'Putri' },
  { no: 12, jenis: 'Uang Kos Makan (2x sehari) - Putri',  jumlah: 'Rp. 300.000,-/Bulan',     nominal: 300000,  kategori: 'Putri' },
  { no: 13, jenis: 'Sahriyah Asrama + Madrasah (Putri)',  jumlah: 'Rp. 180.000,-/3 Bulan',   nominal: 180000,  kategori: 'Putri' },
  { no: 14, jenis: 'Uang Bangunan (Putri)',                jumlah: 'Rp. 250.000,-',           nominal: 250000,  kategori: 'Putri' },
  { no: 15, jenis: 'Administrasi Pendaftaran (SMP)',       jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMP' },
  { no: 16, jenis: 'Bet Sekolah (SMP)',                    jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMP' },
  { no: 17, jenis: 'Administrasi Bangunan (SMP)',          jumlah: 'Rp. 200.000,-',           nominal: 200000,  kategori: 'SMP' },
  { no: 18, jenis: 'Uang SPP (SMP)',                       jumlah: 'Rp. 300.000,-/Semester',  nominal: 300000,  kategori: 'SMP' },
  { no: 19, jenis: 'Seragam Batik (SMP)',                  jumlah: 'Rp. 100.000,-',           nominal: 100000,  kategori: 'SMP' },
  { no: 20, jenis: 'Seragam Olahraga (SMP)',               jumlah: 'Rp. 150.000,-',           nominal: 150000,  kategori: 'SMP' },
  { no: 21, jenis: 'Ujian Semester I (SMP)',               jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMP' },
  { no: 22, jenis: 'Ujian Semester II (SMP)',              jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMP' },
  { no: 23, jenis: 'Raport (SMP)',                         jumlah: 'Rp. 80.000,-',            nominal: 80000,   kategori: 'SMP' },
  { no: 24, jenis: 'Administrasi Pendaftaran (SMA)',       jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMA' },
  { no: 25, jenis: 'Bet Sekolah (SMA)',                    jumlah: 'Rp. 75.000,-',            nominal: 75000,   kategori: 'SMA' },
  { no: 26, jenis: 'Cetak Photo 2x3 & 3x4',               jumlah: 'Rp. 50.000,-',            nominal: 50000,   kategori: 'SMA' },
  { no: 27, jenis: 'Raport (SMA)',                         jumlah: 'Rp. 75.000,-',            nominal: 75000,   kategori: 'SMA' },
  { no: 28, jenis: 'Uang SPP (SMA)',                       jumlah: 'Rp. 350.000,-/Semester',  nominal: 350000,  kategori: 'SMA' },
  { no: 29, jenis: 'Seragam Batik (SMA)',                  jumlah: 'Rp. 100.000,-',           nominal: 100000,  kategori: 'SMA' },
  { no: 30, jenis: 'Seragam Olahraga (SMA)',               jumlah: 'Rp. 150.000,-',           nominal: 150000,  kategori: 'SMA' },
  { no: 31, jenis: 'Administrasi Bangunan (SMA)',          jumlah: 'Rp. 600.000,-/1 Tahun',   nominal: 600000,  kategori: 'SMA' },
]

const KATEGORI_LIST = ['Putra', 'Putri', 'SMP', 'SMA']
const KATEGORI_LIST_EN = ['Boys', 'Girls', 'Junior High', 'Senior High']

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const HISTORY_PREVIEW_COUNT = 5

// ─── Layout Constants ────────────────────────────────────────────────────────
const HEADER_HEIGHT = 84
const PAGE_MAX_WIDTH = 430
const FONT_FAMILY = 'Plus Jakarta Sans, system-ui, sans-serif'

// ─── Theme tokens (sama dengan halaman Pendaftaran) ────────────────────────────

function getTheme(isDark: boolean) {
  return {
    bg:          isDark ? '#15131f' : '#F8FAFC',
    surface:     isDark ? '#1e1b2e' : '#FFFFFF',
    surfaceAlt:  isDark ? '#15131f' : '#F4F6FA',
    border:      isDark ? '#2e2a40' : '#EEF1F6',
    borderInput: isDark ? '#2e2a40' : '#E6E9F0',
    divider:     isDark ? '#2e2a40' : '#EEF1F6',
    text:        isDark ? '#f1f0f5' : '#1E2233',
    label:       isDark ? '#cbd5e1' : '#1E2233',
    muted:       isDark ? '#94a3b8' : '#7B8296',
    faint:       isDark ? '#6b6885' : '#A6ACBC',
    primary:     '#4F46E5',
    primaryText: isDark ? '#a5b4fc' : '#4F46E5',
    primarySoft: isDark ? '#2a2650' : '#EEF2FF',
    line:        isDark ? '#2e2a40' : '#E6E9F0',
    // Figma: tile aksi cepat & baris transaksi
    tile:        isDark ? '#241f3a' : '#E8ECF5',
    tileIcon:    isDark ? '#c7d2fe' : '#1E2A5A',
    row:         isDark ? '#1e1b2e' : '#E9EDF7',
    rowIconBg:   isDark ? '#2a2650' : '#FFFFFF',
  }
}
type Theme = ReturnType<typeof getTheme>

// ─── Utils ─────────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n)
}

function formatTanggal(t: string | null, isEn: boolean = false) {
  if (!t) return '-'
  const locale = isEn ? 'en-US' : 'id-ID'
  return new Date(t).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })
}

async function uploadBukti(file: File, userId: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user_id', userId)
  const res = await fetch('/api/siswa/pembayaran/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Gagal upload gambar')
  }
  const { url } = await res.json()
  return url
}

// ─── SVG Icons (line-style, konsisten dengan halaman Pendaftaran) ──────────────

const svgBase = (size: number, color: string, strokeWidth: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

// Ikon panah kembali — sama dengan halaman Pendaftaran
const IconArrowLeft = ({ size = 18, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
)

// Ikon aksi cepat — sama dengan desain Figma (Send / Receive / Withdraw / More)
const IconSend = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M3 6h8" />
    <path d="M3 12h6" />
    <path d="M3 18h6" />
    <path d="M17 20V5" />
    <path d="m13 9 4-4 4 4" />
  </svg>
)

const IconReceive = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M3 6h6" />
    <path d="M3 12h6" />
    <path d="M3 18h8" />
    <path d="M17 4v15" />
    <path d="m13 15 4 4 4-4" />
  </svg>
)

const IconArchive = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect x="3" y="4" width="18" height="5" rx="1.5" />
    <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
    <path d="M10 13h4" />
  </svg>
)

const IconGridPlus = ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <circle cx="7" cy="7" r="3" />
    <circle cx="17" cy="7" r="3" />
    <circle cx="7" cy="17" r="3" />
    <path d="M17 14v6" />
    <path d="M14 17h6" />
  </svg>
)

const IconUpload = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m17 8-5-5-5 5" />
    <path d="M12 3v12" />
  </svg>
)

const IconCopy = ({ size = 14, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const IconCheck = ({ size = 14, color = 'currentColor', strokeWidth = 2.6 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M5 13l4 4L19 7" />
  </svg>
)

const IconReceipt = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V8z" />
    <path d="M16 2v4a2 2 0 0 0 2 2h4" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </svg>
)

const IconShield = ({ size = 14, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M12 2 3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const IconContactless = ({ size = 20, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="m8 6-5 6 5 6" />
    <path d="m16 6 5 6-5 6" />
    <circle cx="12" cy="12" r="1" />
  </svg>
)

const IconListCheck = ({ size = 16, color = 'currentColor', strokeWidth = 1.9 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const IconCard = ({ size = 16, color = 'currentColor', strokeWidth = 1.9 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M2 10h20" />
  </svg>
)

const IconCamera = ({ size = 16, color = 'currentColor', strokeWidth = 1.9 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const IconImage = ({ size = 28, color = 'currentColor', strokeWidth = 1.6 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
)

const IconX = ({ size = 14, color = 'currentColor', strokeWidth = 2.4 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

const IconSearch = ({ size = 15, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const IconChevronRight = ({ size = 14, color = 'currentColor', strokeWidth = 2.2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
)

const IconCheckCircle = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.3 2.3 4.7-5" />
  </svg>
)

const IconAlertTriangle = ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M12 3.5 21.5 20H2.5L12 3.5Z" />
    <path d="M12 10v4" />
    <path d="M12 17.2h.01" />
  </svg>
)

const IconSpinner = ({ size = 16, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin .8s linear infinite' }}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" opacity="0.2" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

// ─── CSS global halaman ────────────────────────────────────────────────────────

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeInDown {
  from { opacity: 0; transform: translateX(-50%) translateY(-14px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
@keyframes psmb-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.psmb-back { transition: transform .12s ease; }
.psmb-back:active { transform: scale(.94); }
.psmb-press { transition: transform .12s ease, filter .15s ease; }
.psmb-press:active:not(:disabled) { transform: scale(.97); }
.psmb-input:focus { border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.18) !important; outline: none; }
.psmb-input::placeholder { color: #A6ACBC; opacity: 1; }
`

// ─── Komponen kecil ─────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  action,
  t,
}: {
  title: string
  action?: React.ReactNode
  t: Theme
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: t.text, fontFamily: 'inherit' }}>{title}</h2>
      {action}
    </div>
  )
}

function BankBadge({ item, t }: { item: typeof REKENING_INFO[0]; t: Theme }) {
  return (
    <span
      style={{
        width: 40, height: 40, minWidth: 40, borderRadius: 12,
        background: t.rowIconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill={item.primaryColor} />
        <text
          x="20" y={item.badgeText.length > 3 ? 24 : 25}
          textAnchor="middle" fill="#fff"
          fontSize={item.badgeText.length > 3 ? 8 : 10}
          fontWeight="800" fontFamily="sans-serif"
        >
          {item.badgeText}
        </text>
      </svg>
    </span>
  )
}

function CopyButton({ text, isEn = false, t }: { text: string; isEn?: boolean; t: Theme }) {
  const [copied, setCopied] = useState(false)
  const color = copied ? '#16A34A' : t.primaryText

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text.replace(/\s/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard tidak tersedia — abaikan */ }
  }

  return (
    <button
      type="button"
      className="psmb-press"
      onClick={handleCopy}
      aria-label={copied ? (isEn ? 'Copied' : 'Disalin') : (isEn ? 'Copy number' : 'Salin nomor')}
      title={isEn ? 'Copy number' : 'Salin nomor'}
      style={{
        width: 38, height: 38, minWidth: 38, flexShrink: 0, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${copied ? '#BBF7D0' : t.borderInput}`,
        background: copied ? (t.bg === '#15131f' ? '#1a2e1a' : '#F0FDF4') : t.surface,
        color, cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {copied ? <IconCheck size={15} color={color} /> : <IconCopy size={15} color={color} />}
    </button>
  )
}

// ─── Rekening Row ───────────────────────────────────────────────────────────────

function RekeningRow({ item, isEn, isDark, t }: { item: typeof REKENING_INFO[0]; isEn: boolean; isDark: boolean; t: Theme }) {
  // Biru tua BRI tidak terbaca di dark mode → pakai varian terang
  const bankLabelColor = isDark && item.id === 'bri' ? '#93c5fd' : item.primaryColor
  return (
    <div
      style={{
        background: t.row, borderRadius: 16, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <BankBadge item={item} t={t} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: bankLabelColor, fontFamily: 'inherit' }}>
          {isEn ? item.labelEn : item.label}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 800, color: t.text, fontFamily: 'inherit', lineHeight: 1.35, fontVariantNumeric: 'tabular-nums' }}>
          {item.number}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: t.muted, fontWeight: 500, fontFamily: 'inherit' }}>
          {item.name}
        </p>
      </div>
      <CopyButton text={item.numberRaw} isEn={isEn} t={t} />
    </div>
  )
}

function ActionTile({
  icon: Icon,
  label,
  onClick,
  t,
}: {
  icon: IconComponent
  label: string
  onClick: () => void
  t: Theme
}) {
  return (
    <button
      type="button"
      className="psmb-press"
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      <span
        style={{
          width: '100%', height: 58, borderRadius: 16,
          background: t.tile, color: t.tileIcon,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon size={24} />
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: t.muted }}>{label}</span>
    </button>
  )
}

function CaraPembayaran({ isEn, isDark, t }: { isEn: boolean; isDark: boolean; t: Theme }) {
  const steps: { Icon: IconComponent; label: string }[] = [
    { Icon: IconListCheck, label: isEn ? 'Select payment\ntype' : 'Pilih jenis\npembayaran' },
    { Icon: IconCard,      label: isEn ? 'Transfer to\nthe amount' : 'Transfer\nsesuai nominal' },
    { Icon: IconCamera,    label: isEn ? 'Upload payment\nproof' : 'Upload bukti\npembayaran' },
    { Icon: IconShield,    label: isEn ? 'Wait for admin\nconfirmation' : 'Tunggu\nkonfirmasi admin' },
  ]

  return (
    <div
      style={{
        background: t.surface, borderRadius: 18, border: `1px solid ${t.border}`,
        padding: '18px 8px 16px',
        boxShadow: isDark ? 'none' : '0 1px 2px rgba(30,34,51,.03), 0 4px 16px rgba(30,34,51,.04)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map(({ Icon, label }, i) => (
          <div key={i} style={{ position: 'relative' }}>
            {i < steps.length - 1 && (
              <div
                style={{
                  position: 'absolute', top: 17, left: '50%', width: '100%', height: 2, borderRadius: 2,
                  background: `linear-gradient(to right, ${t.primary}, ${t.line})`,
                }}
              />
            )}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: '50%', color: '#fff',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.30)',
                  }}
                >
                  <Icon size={16} color="#fff" />
                </div>
                <div
                  style={{
                    position: 'absolute', bottom: -3, right: -3, width: 16, height: 16, borderRadius: '50%',
                    background: t.surface, border: `2px solid ${t.primary}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: 8, fontWeight: 800, color: t.primaryText, fontFamily: 'inherit' }}>{i + 1}</span>
                </div>
              </div>
              <p
                style={{
                  margin: 0, fontSize: 10.5, color: t.muted, textAlign: 'center',
                  lineHeight: 1.45, fontWeight: 600, whiteSpace: 'pre-line', fontFamily: 'inherit',
                }}
              >
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SiswaPembayaranBayarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'
  const t = getTheme(isDark)

  const [data, setData] = useState<Pembayaran[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPilihModal, setShowPilihModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<BiayaItem | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const rekeningRef = useRef<HTMLDivElement>(null)
  const panduanRef = useRef<HTMLDivElement>(null)
  const riwayatRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const userId = session?.user?.id

  const showToast = (msg: string, type: 'success' | 'error') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, type })
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // silent = true → refresh di latar belakang tanpa menampilkan layar loading penuh
  const fetchData = useCallback(async (silent = false) => {
    if (!userId) return
    try {
      if (!silent) setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/pembayaran')
      if (!res.ok) throw new Error(isEn ? 'Failed to fetch data' : 'Gagal mengambil data')
      const json = await res.json()
      const filtered = (json.data as Pembayaran[]).filter((p) => p.user_id === userId)
      setData(filtered)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : (isEn ? 'An error occurred' : 'Terjadi kesalahan'))
    } finally {
      setLoading(false)
    }
  }, [userId, isEn])

  useEffect(() => {
    if (status === 'authenticated') fetchData()
  }, [status, fetchData])

  // Kunci scroll body saat bottom sheet terbuka
  useEffect(() => {
    if (typeof document === 'undefined') return
    const open = showPilihModal || showUploadModal
    const prev = document.body.style.overflow
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [showPilihModal, showUploadModal])

  const handlePilihItem = (item: BiayaItem) => {
    setSelectedItem(item)
    setShowPilihModal(false)
    setShowUploadModal(true)
  }

  const handleSubmitBukti = async (file: File, catatan: string, nominal: number, jenisPembayaran: string) => {
    if (!userId) return
    try {
      setUploadLoading(true)
      const buktiUrl = await uploadBukti(file, userId)
      const res = await fetch('/api/admin/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          nama_siswa: session?.user?.name,
          nominal,
          jenis_pembayaran: jenisPembayaran,
          metode_pembayaran: 'Transfer Bank',
          bukti_url: buktiUrl,
          status: 'menunggu',
          catatan: catatan || null,
          tanggal_bayar: new Date().toISOString().split('T')[0],
        }),
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || (isEn ? 'Failed to send payment data' : 'Gagal mengirim data pembayaran'))
      }
      setShowUploadModal(false)
      setSelectedItem(null)
      showToast(
        isEn ? `Payment proof for ${jenisPembayaran} sent successfully!` : `Bukti pembayaran untuk ${jenisPembayaran} berhasil dikirim!`,
        'success'
      )
      fetchData(true)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : (isEn ? 'Failed to send proof' : 'Gagal mengirim bukti'), 'error')
    } finally {
      setUploadLoading(false)
    }
  }

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => () => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ─── Data turunan ──────────────────────────────────────────────────────────
  const dikonfirmasiCount = data.filter((d) => d.status === 'dikonfirmasi').length
  const menungguCount = data.filter((d) => d.status === 'menunggu').length
  const totalDikonfirmasi = data
    .filter((d) => d.status === 'dikonfirmasi')
    .reduce((sum, d) => sum + (Number(d.nominal) || 0), 0)

  const sortedHistory = useMemo(
    () => [...data].sort((a, b) =>
      new Date(b.tanggal_bayar ?? b.created_at ?? 0).getTime() -
      new Date(a.tanggal_bayar ?? a.created_at ?? 0).getTime()
    ),
    [data]
  )
  const visibleHistory = showAllHistory ? sortedHistory : sortedHistory.slice(0, HISTORY_PREVIEW_COUNT)

  const firstName = (session?.user?.name ?? '').trim().split(/\s+/)[0] || (isEn ? 'there' : 'Santri')

  const getStatusLabel = (s: string) => {
    const config = STATUS_MAP[s]
    if (!config) return s
    return isEn ? config.labelEn : config.label
  }

  const getStatusStyle = (s: string) => {
    const config = STATUS_MAP[s]
    if (!config) return { bg: '#F8FAFC', text: '#64748B', dot: '#94A3B8' }
    return {
      bg: isDark ? config.bgDark : config.bg,
      text: isDark ? config.textDark : config.text,
      dot: isDark ? config.dotDark : config.dot,
    }
  }

  // ─── Loading state (SAMA PERSIS dengan halaman Pendaftaran) ────────────────
  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: t.bg,
        gap: 12,
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderWidth: 4,
          borderStyle: 'solid',
          borderColor: isDark ? '#2e2a40' : '#E2E8F0',
          borderTopColor: '#6366F1',
          borderRadius: '50%',
          animation: 'spin .8s linear infinite',
        }} />
        <p style={{ color: t.muted, fontSize: 13, fontWeight: 500, margin: 0 }}>
          {isEn ? 'Loading payment data...' : 'Memuat data pembayaran...'}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', background: t.bg, paddingBottom: 100, fontFamily: FONT_FAMILY }}>
      <style>{PAGE_CSS}</style>

      {/* Toast */}
      {toast && (
        <div
          role={toast.type === 'error' ? 'alert' : 'status'}
          style={{
            position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 400,
            background: toast.type === 'success'
              ? (isDark ? 'linear-gradient(135deg, #065f46, #0A5C46)' : 'linear-gradient(135deg, #1E293B, #0F172A)')
              : (isDark ? 'linear-gradient(135deg, #7f1d1d, #4a1a1a)' : 'linear-gradient(135deg, #BE123C, #9F1239)'),
            color: '#fff', borderRadius: 16, padding: '13px 18px',
            fontSize: 12.5, fontWeight: 700, lineHeight: 1.4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            width: 'max-content', maxWidth: '88vw', animation: 'fadeInDown .3s ease',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'inherit',
          }}
        >
          <span style={{ display: 'flex', flexShrink: 0 }}>
            {toast.type === 'success' ? <IconCheckCircle size={17} /> : <IconAlertTriangle size={17} />}
          </span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ══ HEADER (FIXED) ══ */}
      <div
        style={{
          position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: PAGE_MAX_WIDTH, height: HEADER_HEIGHT, zIndex: 50,
          background: t.bg, borderBottom: `1px solid ${t.border}`,
          padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        {/* Tombol kembali — desain sama dengan halaman Pendaftaran */}
        <button
          type="button"
          className="psmb-back"
          onClick={() => router.back()}
          aria-label={isEn ? 'Back' : 'Kembali'}
          style={{
            width: 40, height: 40, minWidth: 40, borderRadius: '50%', flexShrink: 0,
            background: isDark ? '#2e2a40' : '#F3F0FF',
            border: isDark ? '1px solid #3b3656' : '1px solid #E9E4FF',
            boxShadow: isDark ? 'none' : '0 1px 2px rgba(124,58,237,.08)',
            color: isDark ? '#c4b5fd' : '#7C3AED', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <IconArrowLeft size={18} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0, fontSize: 20, fontWeight: 800, color: t.text, lineHeight: 1.25,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'inherit',
            }}
          >
            {isEn ? 'Payment' : 'Pembayaran'}
          </h1>
          <p
            style={{
              margin: '2px 0 0', fontSize: 13, color: t.muted, fontWeight: 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'inherit',
            }}
          >
            {isEn ? 'Manage your payments' : 'Kelola pembayaran Anda'}
          </p>
        </div>
      </div>
      <div style={{ height: HEADER_HEIGHT, flexShrink: 0 }} />

      {/* ══ KONTEN ══ */}
      <div style={{ padding: '18px 16px 0', maxWidth: PAGE_MAX_WIDTH, margin: '0 auto', animation: 'psmb-fade .25s ease both' }}>

        {/* ── Sapaan ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: t.text, fontFamily: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isEn ? `Hi, ${firstName}!` : `Halo, ${firstName}!`}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: t.muted, fontWeight: 500, fontFamily: 'inherit' }}>
              {isEn ? 'Ready to make a payment?' : 'Siap melakukan pembayaran?'}
            </p>
          </div>
          <span
            style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              color: isDark ? '#34d399' : '#15803D',
              background: isDark ? '#1a2e1a' : '#F0FDF4',
              border: `1px solid ${isDark ? '#1a4a2e' : '#BBF7D0'}`,
              fontFamily: 'inherit',
            }}
          >
            <IconShield size={14} />
            {isEn ? 'Secure' : 'Aman'}
          </span>
        </div>

        {/* ── Kartu utama (gaya Figma) ── */}
        <div
          style={{
            position: 'relative', overflow: 'hidden', borderRadius: 24,
            padding: '20px 20px 0', minHeight: 178, color: '#fff',
            background: 'linear-gradient(135deg, #3B0F8C 0%, #4A1BB0 100%)',
            boxShadow: isDark ? '0 12px 28px rgba(0,0,0,.4)' : '0 14px 30px rgba(74,27,176,.28)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', fontFamily: 'inherit' }}>
                {isEn ? 'Total Confirmed' : 'Total Dikonfirmasi'}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.15, fontFamily: 'inherit', wordBreak: 'break-word' }}>
                {formatRupiah(totalDikonfirmasi)}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.7)', fontFamily: 'inherit' }}>
                {dikonfirmasiCount} {isEn ? 'confirmed' : 'dikonfirmasi'} · {menungguCount} {isEn ? 'pending' : 'menunggu'}
              </p>
            </div>
            <span style={{ display: 'flex', color: 'rgba(255,255,255,.85)', flexShrink: 0, marginTop: 2 }}>
              <IconContactless size={20} />
            </span>
          </div>

          <div style={{ position: 'absolute', left: 20, bottom: 18, display: 'flex', gap: 20 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 500, fontFamily: 'inherit' }}>
                {isEn ? 'BRI Account' : 'Rekening BRI'}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>•••• 6539</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 500, fontFamily: 'inherit' }}>
                {isEn ? 'Period' : 'Periode'}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>2026/2027</p>
            </div>
          </div>

          {/* Notch tombol "Bayar" */}
          <div
            style={{
              position: 'absolute', right: 0, bottom: 0,
              background: t.bg, padding: '8px 0 0 8px',
              borderTopLeftRadius: 22,
            }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute', right: 0, top: -16, width: 16, height: 16,
                background: `radial-gradient(circle at 0 0, transparent 16px, ${t.bg} 16.5px)`,
              }}
            />
            <span
              aria-hidden
              style={{
                position: 'absolute', left: -16, bottom: 0, width: 16, height: 16,
                background: `radial-gradient(circle at 0 0, transparent 16px, ${t.bg} 16.5px)`,
              }}
            />
            <button
              type="button"
              className="psmb-press"
              onClick={() => setShowPilihModal(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                height: 46, padding: '0 20px', borderRadius: 16, border: 'none',
                background: isDark ? '#312E81' : '#17171C', color: '#fff', cursor: 'pointer',
                fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                margin: '0 8px 8px 0', whiteSpace: 'nowrap',
              }}
            >
              <IconUpload size={16} color="#fff" />
              {isEn ? 'Pay' : 'Bayar'}
            </button>
          </div>
        </div>

        {/* ── Aksi cepat ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '22px 0 26px' }}>
          <ActionTile icon={IconSend}    label={isEn ? 'Pay' : 'Bayar'}           onClick={() => setShowPilihModal(true)} t={t} />
          <ActionTile icon={IconReceive} label={isEn ? 'Accounts' : 'Rekening'}   onClick={scrollTo(rekeningRef)} t={t} />
          <ActionTile icon={IconArchive} label={isEn ? 'History' : 'Riwayat'}     onClick={scrollTo(riwayatRef)} t={t} />
          <ActionTile icon={IconGridPlus} label={isEn ? 'Guide' : 'Panduan'}      onClick={scrollTo(panduanRef)} t={t} />
        </div>

        {/* ── Rekening tujuan ── */}
        <div ref={rekeningRef} style={{ scrollMarginTop: HEADER_HEIGHT + 12, marginBottom: 26 }}>
          <SectionHeader
            title={isEn ? 'Transfer Accounts' : 'Rekening Tujuan'}
            t={t}
            action={
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: isDark ? '#34d399' : '#15803D', fontFamily: 'inherit' }}>
                <IconShield size={13} />
                {isEn ? 'Verified' : 'Terverifikasi'}
              </span>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REKENING_INFO.map((r) => <RekeningRow key={r.id} item={r} isEn={isEn} isDark={isDark} t={t} />)}
          </div>
        </div>

        {/* ── Panduan ── */}
        <div ref={panduanRef} style={{ scrollMarginTop: HEADER_HEIGHT + 12, marginBottom: 26 }}>
          <SectionHeader title={isEn ? 'Payment Steps' : 'Langkah Pembayaran'} t={t} />
          <CaraPembayaran isEn={isEn} isDark={isDark} t={t} />
        </div>

        {/* ── Riwayat transaksi ── */}
        <div ref={riwayatRef} style={{ scrollMarginTop: HEADER_HEIGHT + 12 }}>
          <SectionHeader
            title={isEn ? 'Transactions' : 'Riwayat Transaksi'}
            t={t}
            action={
              sortedHistory.length > HISTORY_PREVIEW_COUNT ? (
                <button
                  type="button"
                  onClick={() => setShowAllHistory((v) => !v)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: t.primaryText, fontFamily: 'inherit' }}
                >
                  {showAllHistory ? (isEn ? 'Show less' : 'Ringkas') : (isEn ? 'See All' : 'Lihat Semua')}
                </button>
              ) : undefined
            }
          />

          {error ? (
            <div
              style={{
                textAlign: 'center', padding: '28px 16px', background: t.surface,
                borderRadius: 18, border: `1px solid ${isDark ? '#4a1a1a' : '#FEE2E2'}`,
              }}
            >
              <span style={{ display: 'inline-flex', color: '#EF4444', marginBottom: 8 }}><IconAlertTriangle size={22} /></span>
              <p style={{ color: '#EF4444', fontWeight: 600, fontSize: 13, margin: 0, fontFamily: 'inherit' }}>{error}</p>
              <button
                type="button"
                className="psmb-press"
                onClick={() => fetchData()}
                style={{ marginTop: 14, padding: '10px 22px', borderRadius: 12, background: '#6366F1', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {isEn ? 'Try Again' : 'Coba Lagi'}
              </button>
            </div>
          ) : sortedHistory.length === 0 ? (
            <div
              style={{
                background: t.surface, borderRadius: 20, padding: '40px 20px', textAlign: 'center',
                border: `2px dashed ${isDark ? '#2e2a40' : '#DDE2EC'}`,
              }}
            >
              <div
                style={{
                  width: 60, height: 60, borderRadius: 20, margin: '0 auto 14px',
                  background: t.tile, color: t.tileIcon,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IconReceipt size={28} />
              </div>
              <p style={{ fontWeight: 800, color: t.text, fontSize: 14, margin: '0 0 6px', fontFamily: 'inherit' }}>
                {isEn ? 'No History' : 'Belum Ada Riwayat'}
              </p>
              <p style={{ color: t.muted, fontSize: 12.5, margin: 0, fontFamily: 'inherit', lineHeight: 1.5 }}>
                {isEn ? 'Tap "Pay" to start your first payment' : 'Ketuk "Bayar" untuk memulai pembayaran pertama'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visibleHistory.map((item) => {
                const st = getStatusStyle(item.status)
                return (
                  <div
                    key={item.id}
                    style={{ background: t.row, borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <span
                      style={{
                        width: 40, height: 40, minWidth: 40, borderRadius: 12, background: t.rowIconBg, color: st.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <IconReceipt size={20} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0, fontSize: 13.5, fontWeight: 700, color: t.text, lineHeight: 1.3, fontFamily: 'inherit',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}
                      >
                        {item.jenis_pembayaran}
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: 11.5, color: t.muted, fontFamily: 'inherit' }}>
                        {formatTanggal(item.tanggal_bayar ?? item.created_at ?? null, isEn)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: t.text, fontFamily: 'inherit' }}>
                        {formatRupiah(item.nominal)}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginTop: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: st.text, fontFamily: 'inherit' }}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPilihModal && (
        <PilihPembayaranModal
          onClose={() => setShowPilihModal(false)}
          onSelect={handlePilihItem}
          isDark={isDark}
          isEn={isEn}
        />
      )}
      {showUploadModal && (
        <UploadBuktiModal
          onClose={() => { setShowUploadModal(false); setSelectedItem(null) }}
          onSubmit={handleSubmitBukti}
          loading={uploadLoading}
          selectedItem={selectedItem}
          isDark={isDark}
          isEn={isEn}
        />
      )}
    </div>
  )
}

// ─── PilihPembayaranModal ──────────────────────────────────────────────────────

function PilihPembayaranModal({
  onClose,
  onSelect,
  isDark = false,
  isEn = false,
}: {
  onClose: () => void
  onSelect: (item: BiayaItem) => void
  isDark?: boolean
  isEn?: boolean
}) {
  const t = getTheme(isDark)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState<string>('all')

  const filtered = DATA_BIAYA.filter((b) => {
    const matchKat = kategori === 'all' || b.kategori === kategori
    const matchSearch = b.jenis.toLowerCase().includes(search.trim().toLowerCase())
    return matchKat && matchSearch
  })

  const getKategoriLabel = (k: string) => {
    if (k === 'all') return isEn ? 'All' : 'Semua'
    const idx = KATEGORI_LIST.indexOf(k)
    return idx >= 0 ? (isEn ? KATEGORI_LIST_EN[idx] : k) : k
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%', maxWidth: PAGE_MAX_WIDTH, background: t.bg,
          borderRadius: '24px 24px 0 0', maxHeight: '88vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          borderTop: isDark ? `1px solid ${t.border}` : 'none',
          fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 999, background: isDark ? '#3d3655' : '#E2E8F0', margin: '12px auto 0', flexShrink: 0 }} />

        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 17, fontWeight: 800, color: t.text, margin: 0, fontFamily: 'inherit' }}>
              {isEn ? 'Select Payment Type' : 'Pilih Jenis Pembayaran'}
            </p>
            <p style={{ fontSize: 12, color: t.muted, margin: '2px 0 0', fontFamily: 'inherit' }}>
              {filtered.length} {isEn ? 'items available' : 'item tersedia'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'Tutup'}
            style={{
              width: 36, height: 36, borderRadius: 12, border: `1px solid ${t.borderInput}`,
              background: t.surface, color: t.muted, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <IconX size={14} />
          </button>
        </div>

        <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', color: t.faint, pointerEvents: 'none' }}>
              <IconSearch size={15} />
            </span>
            <input
              className="psmb-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEn ? 'Search payment type...' : 'Cari jenis pembayaran...'}
              style={{
                width: '100%', minHeight: 46, padding: '11px 14px 11px 38px', borderRadius: 12,
                border: `1px solid ${t.borderInput}`, fontSize: 16, fontFamily: 'inherit',
                color: t.text, background: t.surface,
              }}
            />
          </div>
        </div>

        <div style={{ padding: '12px 20px 2px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0 }}>
          {['all', ...KATEGORI_LIST].map((k) => {
            const isActive = kategori === k
            return (
              <button
                type="button"
                key={k}
                onClick={() => setKategori(k)}
                style={{
                  padding: '7px 16px', borderRadius: 999, fontSize: 12.5, fontWeight: 700,
                  border: `1px solid ${isActive ? t.primary : t.borderInput}`,
                  background: isActive ? t.primarySoft : t.surface,
                  color: isActive ? t.primaryText : t.muted,
                  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', flexShrink: 0,
                }}
              >
                {getKategoriLabel(k)}
              </button>
            )
          })}
        </div>

        <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: '12px 20px 28px' }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: t.muted, fontSize: 13, padding: '28px 0', fontFamily: 'inherit', margin: 0 }}>
              {isEn ? 'No results found' : 'Tidak ditemukan'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((b) => (
                <button
                  type="button"
                  className="psmb-press"
                  key={b.no}
                  onClick={() => onSelect(b)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '12px 14px', borderRadius: 16, border: 'none',
                    background: t.row, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0, fontFamily: 'inherit', lineHeight: 1.35 }}>{b.jenis}</p>
                    <p style={{ fontSize: 11.5, color: t.muted, margin: '3px 0 0', fontFamily: 'inherit' }}>
                      {isEn ? 'Category' : 'Kategori'}: {getKategoriLabel(b.kategori)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, color: t.primaryText }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, textAlign: 'right', fontFamily: 'inherit' }}>{b.jumlah}</span>
                    <IconChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── UploadBuktiModal ────────────────────────────────────────────────────────

function UploadBuktiModal({
  onClose,
  onSubmit,
  loading,
  selectedItem,
  isDark = false,
  isEn = false,
}: {
  onClose: () => void
  onSubmit: (file: File, catatan: string, nominal: number, jenis: string) => void
  loading: boolean
  selectedItem: BiayaItem | null
  isDark?: boolean
  isEn?: boolean
}) {
  const t = getTheme(isDark)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [catatan, setCatatan] = useState('')
  const [nominal, setNominal] = useState<number>(selectedItem?.nominal ?? 0)
  const [drag, setDrag] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<string | null>(null)

  // Bersihkan object URL saat modal ditutup
  useEffect(() => () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current) }, [])

  const handleFile = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setFileError(isEn ? 'Only JPG, PNG or WEBP images are allowed.' : 'Hanya gambar JPG, PNG, atau WEBP yang diperbolehkan.')
      return
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError(isEn ? 'File is too large (max. 5MB).' : 'Ukuran file terlalu besar (maks. 5MB).')
      return
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const url = URL.createObjectURL(f)
    previewRef.current = url
    setFileError(null)
    setFile(f)
    setPreview(url)
  }

  const canSubmit = !!file && nominal > 0 && !loading

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', marginTop: 6, minHeight: 46,
    padding: '12px 14px', borderRadius: 12,
    border: `1px solid ${t.borderInput}`, fontSize: 16, color: t.text,
    fontFamily: 'inherit', background: t.surface,
  }
  const labelStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: t.label, fontFamily: 'inherit' }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%', maxWidth: PAGE_MAX_WIDTH, background: t.bg,
          borderRadius: '24px 24px 0 0', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          borderTop: isDark ? `1px solid ${t.border}` : 'none',
          fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 999, background: isDark ? '#3d3655' : '#E2E8F0', margin: '12px auto 0', flexShrink: 0 }} />

        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 17, fontWeight: 800, color: t.text, margin: 0, fontFamily: 'inherit' }}>
              {isEn ? 'Upload Payment Proof' : 'Upload Bukti Pembayaran'}
            </p>
            {selectedItem && (
              <p style={{ fontSize: 12, color: t.primaryText, margin: '2px 0 0', fontFamily: 'inherit', fontWeight: 600, lineHeight: 1.4 }}>
                {selectedItem.jenis}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'Tutup'}
            style={{
              width: 36, height: 36, borderRadius: 12, border: `1px solid ${t.borderInput}`,
              background: t.surface, color: t.muted, cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IconX size={14} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={labelStyle}>{isEn ? 'Payment Amount (Rp)' : 'Nominal Pembayaran (Rp)'}</label>
            <input
              className="psmb-input"
              type="number"
              inputMode="numeric"
              min={0}
              value={nominal}
              onChange={(e) => setNominal(Number(e.target.value))}
              style={{ ...inputStyle, fontWeight: 700 }}
            />
            {nominal > 0 && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: t.muted, fontFamily: 'inherit' }}>{formatRupiah(nominal)}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>{isEn ? 'Transfer Proof *' : 'Bukti Transfer *'}</label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click() } }}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              style={{
                marginTop: 6, borderRadius: 16,
                border: `2px dashed ${fileError ? '#EF4444' : drag ? t.primary : (isDark ? '#2e2a40' : '#D5DBE8')}`,
                background: drag ? t.primarySoft : t.surface,
                padding: 20, textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
              }}
            >
              {preview ? (
                <Image
                  src={preview} alt="preview" width={300} height={180} unoptimized
                  style={{ maxHeight: 180, width: 'auto', height: 'auto', borderRadius: 10, objectFit: 'contain', maxWidth: '100%' }}
                />
              ) : (
                <>
                  <div style={{ marginBottom: 8, color: t.primaryText, display: 'flex', justifyContent: 'center' }}>
                    <IconImage size={28} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: t.label, margin: 0, fontFamily: 'inherit' }}>
                    {isEn ? 'Tap or drag transfer proof image' : 'Ketuk atau drag foto bukti transfer'}
                  </p>
                  <p style={{ fontSize: 11.5, color: t.muted, margin: '4px 0 0', fontFamily: 'inherit' }}>
                    JPG, PNG, WEBP – {isEn ? 'max. 5MB' : 'maks. 5MB'}
                  </p>
                </>
              )}
            </div>
            {fileError && (
              <p role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: '#EF4444', fontWeight: 600, fontFamily: 'inherit' }}>{fileError}</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
            />
          </div>

          <div>
            <label style={labelStyle}>{isEn ? 'Notes (optional)' : 'Catatan (opsional)'}</label>
            <textarea
              className="psmb-input"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder={isEn ? 'e.g., payment stage 1, July...' : 'Misal: pembayaran tahap 1, bulan Juli...'}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.4 }}
            />
          </div>

          <button
            type="button"
            className="psmb-press"
            disabled={!canSubmit}
            onClick={() => { if (file && selectedItem && canSubmit) onSubmit(file, catatan, nominal, selectedItem.jenis) }}
            style={{
              width: '100%', minHeight: 52, padding: '14px',
              borderRadius: 16, border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
              background: canSubmit ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' : (isDark ? '#2e2a40' : '#E2E8F0'),
              color: canSubmit ? '#fff' : (isDark ? '#6b6885' : '#94A3B8'),
              fontWeight: 800, fontSize: 14.5, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: canSubmit ? '0 8px 22px rgba(79,70,229,0.32)' : 'none',
              transition: 'all .2s',
            }}
          >
            {loading ? (
              <>
                <IconSpinner size={16} color="#fff" />
                {isEn ? 'Sending...' : 'Mengirim...'}
              </>
            ) : (
              <>
                <IconUpload size={17} color="currentColor" />
                {isEn ? 'Submit Payment Proof' : 'Kirim Bukti Pembayaran'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}