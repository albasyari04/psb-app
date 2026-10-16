'use client'
// app/siswa/pendaftaran/page.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSettings } from '@/contexts/SettingsContext'

// ── Icon set (SVG line-style — profesional, elegant, modern) ───────────────────
type IconProps = { size?: number; color?: string; strokeWidth?: number }

const IconUser = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M5 21c0-3.866 3.134-7 7-7s7 3.134 7 7" />
  </svg>
)

const IconSchool = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 2 8l10 5 10-5-10-5Z" />
    <path d="M6 10.5V16c0 1.2 2.7 3 6 3s6-1.8 6-3v-5.5" />
  </svg>
)

const IconPin = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

const IconFamily = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8.5" cy="7.5" r="3" />
    <circle cx="16" cy="8.5" r="2.3" />
    <path d="M2.5 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M15 14.2c2.4.3 4.2 2.3 4.2 4.8" />
  </svg>
)

const IconCheckCircle = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.3 2.3 4.7-5" />
  </svg>
)

const IconAlertTriangle = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.5 21.5 20H2.5L12 3.5Z" />
    <path d="M12 10v4" />
    <path d="M12 17.2h.01" />
  </svg>
)

const IconSave = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 4h11l3 3v13H5V4Z" />
    <path d="M8 4v5h7V4" />
    <path d="M8 14h8v6H8v-6Z" />
  </svg>
)

const IconClipboardEdit = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
    <path d="M9 11h6" />
    <path d="M9 14.5h3" />
  </svg>
)

const IconSend = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 3 10.5 13.5" />
    <path d="M21 3 14.5 21l-4-7.5L3 9.5 21 3Z" />
  </svg>
)

const IconSpinner = ({ size = 16, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin .8s linear infinite' }}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" opacity="0.2" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

// Ikon panah kembali — SAMA dengan yang dipakai di halaman Admin › Pendaftar
const IconArrowLeft = ({ size = 18, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
)

const IconChevronLeft = ({ size = 18, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5 8 12l7 7" />
  </svg>
)

const IconChevronRight = ({ size = 18, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7" />
  </svg>
)

const IconX = ({ size = 14, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

const IconCheck = ({ size = 16, color = 'currentColor', strokeWidth = 2.6 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
)

const IconMale = ({ size = 16, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="14" r="6" />
    <path d="M14.5 9.5 20 4M20 4h-4.5M20 4v4.5" />
  </svg>
)

const IconFemale = ({ size = 16, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="6" />
    <path d="M12 15v6M9 19h6" />
  </svg>
)

// ── Types ─────────────────────────────────────────────────────────────────────
interface PendaftaranData {
  id: string
  user_id: string
  nama_lengkap: string
  nik: string
  nisn: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: string
  agama: string
  alamat: string
  alamat_kota?: string
  alamat_kecamatan?: string
  alamat_rt_rw?: string
  no_hp: string
  asal_sekolah: string
  npsn: string
  nama_ayah: string
  nama_ibu: string
  pekerjaan_ayah: string
  pekerjaan_ibu: string
  no_hp_ortu: string
  status: 'menunggu' | 'diproses' | 'diterima' | 'ditolak'
}

interface FormState {
  nama_lengkap: string
  nik: string
  nisn: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: string
  agama: string
  alamat: string
  alamat_kota: string
  alamat_kecamatan: string
  alamat_rt_rw: string
  no_hp: string
  asal_sekolah: string
  npsn: string
  nama_ayah: string
  nama_ibu: string
  pekerjaan_ayah: string
  pekerjaan_ibu: string
  no_hp_ortu: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const AGAMA     = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']
const AGAMA_EN  = ['Islam', 'Christian', 'Catholic', 'Hindu', 'Buddha', 'Confucian']
const PEKERJAAN = [
  'Petani', 'Nelayan', 'PNS', 'TNI/Polri', 'Guru', 'Pengusaha',
  'Pedagang', 'Tukang', 'Karyawan Swasta', 'Profesional', 'Tidak Bekerja', 'Lainnya',
]
const PEKERJAAN_EN = [
  'Farmer', 'Fisherman', 'Civil Servant', 'Military/Police', 'Teacher', 'Entrepreneur',
  'Trader', 'Craftsman', 'Private Employee', 'Professional', 'Unemployed', 'Others',
]

// label     = nama pendek untuk step indicator (muat dalam 1–2 baris di layar 360px)
// title     = judul kartu di dalam form
const STEPS = [
  { label: 'Data Diri',  labelEn: 'Personal', Icon: IconUser },
  { label: 'Sekolah',    labelEn: 'School',   Icon: IconSchool },
  { label: 'Alamat',     labelEn: 'Address',  Icon: IconPin },
  { label: 'Orang Tua',  labelEn: 'Parents',  Icon: IconFamily },
  { label: 'Konfirmasi', labelEn: 'Confirm',  Icon: IconCheckCircle },
]

// ── Ukuran layout tetap ────────────────────────────────────────────────────────
const HEADER_HEIGHT = 84
const SISWA_NAV_HEIGHT = 68

const INIT: FormState = {
  nama_lengkap: '', nik: '', nisn: '',
  tempat_lahir: '', tanggal_lahir: '',
  jenis_kelamin: 'L', agama: 'Islam',
  alamat: '', alamat_kota: '', alamat_kecamatan: '', alamat_rt_rw: '',
  no_hp: '',
  asal_sekolah: '', npsn: '',
  nama_ayah: '', nama_ibu: '',
  pekerjaan_ayah: 'Petani', pekerjaan_ibu: 'Tidak Bekerja',
  no_hp_ortu: '',
}

// ── Theme tokens ───────────────────────────────────────────────────────────────
function getTheme(isDark: boolean) {
  return {
    // Palet hijau — diselaraskan dengan Beranda (banner hijau tua, aksen emas, link hijau)
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

// ── localStorage helpers ───────────────────────────────────────────────────────
const getDraftKey = (userId: string) => `pendaftaran_draft_${userId}`
const getStepKey  = (userId: string) => `pendaftaran_step_${userId}`

function saveDraft(userId: string, form: FormState, step: number) {
  try {
    localStorage.setItem(getDraftKey(userId), JSON.stringify(form))
    localStorage.setItem(getStepKey(userId),  String(step))
  } catch { /* kuota penuh atau private mode — abaikan */ }
}

function loadDraft(userId: string): { form: FormState; step: number } | null {
  try {
    const raw  = localStorage.getItem(getDraftKey(userId))
    const rawS = localStorage.getItem(getStepKey(userId))
    if (!raw) return null
    return {
      form: { ...INIT, ...(JSON.parse(raw) as Partial<FormState>) },
      step: rawS ? Math.max(1, Math.min(parseInt(rawS, 10) || 1, STEPS.length)) : 1,
    }
  } catch {
    return null
  }
}

function clearDraft(userId: string) {
  try {
    localStorage.removeItem(getDraftKey(userId))
    localStorage.removeItem(getStepKey(userId))
  } catch { /* abaikan */ }
}

// ── Validasi ────────────────────────────────────────────────────────────────────
// Setiap aturan tahu field-nya, step tempat field itu berada, dan pesan (ID / EN).
// Dengan begitu lompatan ke step yang salah tidak lagi bergantung pada pencocokan teks pesan.
const RULES: { key: keyof FormState; step: number; id: string; en: string }[] = [
  { key: 'nama_lengkap',     step: 1, id: 'Nama lengkap wajib diisi',     en: 'Full name is required' },
  { key: 'nik',              step: 1, id: 'NIK wajib diisi',              en: 'NIK is required' },
  { key: 'nisn',             step: 1, id: 'NISN wajib diisi',             en: 'NISN is required' },
  { key: 'tempat_lahir',     step: 1, id: 'Tempat lahir wajib diisi',     en: 'Place of birth is required' },
  { key: 'tanggal_lahir',    step: 1, id: 'Tanggal lahir wajib diisi',    en: 'Date of birth is required' },
  { key: 'asal_sekolah',     step: 2, id: 'Nama asal sekolah wajib diisi', en: 'Previous school name is required' },
  { key: 'npsn',             step: 2, id: 'NPSN wajib diisi',             en: 'NPSN is required' },
  { key: 'alamat',           step: 3, id: 'Alamat wajib diisi',           en: 'Address is required' },
  { key: 'alamat_kota',      step: 3, id: 'Kota wajib diisi',             en: 'City is required' },
  { key: 'alamat_kecamatan', step: 3, id: 'Kecamatan wajib diisi',        en: 'District is required' },
  { key: 'alamat_rt_rw',     step: 3, id: 'RT/RW wajib diisi',            en: 'RT/RW is required' },
  { key: 'no_hp',            step: 3, id: 'No. HP wajib diisi',           en: 'Phone number is required' },
  { key: 'nama_ayah',        step: 4, id: 'Nama ayah wajib diisi',        en: "Father's name is required" },
  { key: 'nama_ibu',         step: 4, id: 'Nama ibu wajib diisi',         en: "Mother's name is required" },
  { key: 'pekerjaan_ayah',   step: 4, id: 'Pekerjaan ayah wajib dipilih', en: "Father's occupation is required" },
  { key: 'pekerjaan_ibu',    step: 4, id: 'Pekerjaan ibu wajib dipilih',  en: "Mother's occupation is required" },
  { key: 'no_hp_ortu',       step: 4, id: 'No. HP orang tua wajib diisi', en: "Parent's phone number is required" },
]

function validateAll(
  form: FormState,
  isEn: boolean,
): { message: string; step: number; key: keyof FormState } | null {
  for (const r of RULES) {
    if (!String(form[r.key] ?? '').trim()) {
      return { message: isEn ? r.en : r.id, step: r.step, key: r.key }
    }
  }
  return null
}

function getStepCompletion(form: FormState): Record<number, boolean> {
  return {
    1: !!(form.nama_lengkap && form.nik && form.nisn && form.tempat_lahir && form.tanggal_lahir),
    2: !!(form.asal_sekolah && form.npsn),
    3: !!(form.alamat && form.alamat_kota && form.alamat_kecamatan && form.alamat_rt_rw && form.no_hp),
    4: !!(form.nama_ayah && form.nama_ibu && form.pekerjaan_ayah && form.pekerjaan_ibu && form.no_hp_ortu),
    5: true,
  }
}

// ── Style helpers ───────────────────────────────────────────────────────────────
// fontSize 16 sengaja dipakai agar iOS Safari tidak melakukan auto-zoom saat input difokus.
function getInputStyle(isDark: boolean): React.CSSProperties {
  const t = getTheme(isDark)
  return {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: 46,
    background: t.surfaceAlt,
    border: `1px solid ${t.borderInput}`,
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 16,
    lineHeight: 1.3,
    color: t.text,
    outline: 'none',
    transition: 'border-color .15s ease, box-shadow .15s ease',
  }
}

const SELECT_ARROW =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")"

function getSelectStyle(isDark: boolean): React.CSSProperties {
  return {
    ...getInputStyle(isDark),
    appearance: 'none',
    WebkitAppearance: 'none',
    paddingRight: 40,
    backgroundImage: SELECT_ARROW,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: 16,
  }
}

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

function getLabelStyle(isDark: boolean): React.CSSProperties {
  const t = getTheme(isDark)
  return {
    display: 'block',
    fontSize: 12.5,
    fontWeight: 700,
    color: t.label,
    marginBottom: 7,
    letterSpacing: '.01em',
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  invalid = false,
  inputMode,
  isDark = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  invalid?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  isDark?: boolean
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={getLabelStyle(isDark)}>{label}</label>
      <input
        className="psmb-input"
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        style={{
          ...getInputStyle(isDark),
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
  invalid = false,
  isDark = false,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
  disabled?: boolean
  invalid?: boolean
  isDark?: boolean
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={getLabelStyle(isDark)}>{label}</label>
      <select
        className="psmb-input"
        aria-label={label}
        aria-invalid={invalid || undefined}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{
          ...getSelectStyle(isDark),
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function IconBadge({
  icon: Icon,
  isDark,
  size = 34,
}: {
  icon: React.ComponentType<IconProps>
  isDark: boolean
  size?: number
}) {
  const t = getTheme(isDark)
  return (
    <span
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        background: t.gradient,
        color: '#FFFFFF',
        boxShadow: isDark ? 'none' : '0 4px 10px rgba(15,107,74,.22)',
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
  isDark = false,
}: {
  icon: React.ComponentType<IconProps>
  title: string
  subtitle?: string
  isDark?: boolean
}) {
  const t = getTheme(isDark)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 18,
        paddingBottom: 16,
        borderBottom: `1px solid ${t.divider}`,
      }}
    >
      <IconBadge icon={icon} isDark={isDark} size={40} />
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: t.text, lineHeight: 1.3, letterSpacing: '-.01em' }}>{title}</h2>
        {subtitle && (
          <p style={{ margin: '2px 0 0', fontSize: 12.5, color: t.muted, fontWeight: 500, lineHeight: 1.4 }}>{subtitle}</p>
        )}
      </div>
    </div>
  )
}

function SectionLabel({
  icon: Icon,
  children,
  isDark = false,
}: {
  icon: React.ComponentType<IconProps>
  children: React.ReactNode
  isDark?: boolean
}) {
  const t = getTheme(isDark)
  return (
    <p
      style={{
        margin: '0 0 14px',
        fontSize: 13.5,
        fontWeight: 800,
        color: t.text,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ display: 'flex', color: t.primaryText }}><Icon size={15} /></span>
      {children}
    </p>
  )
}

type AlertKind = 'info' | 'warning' | 'error' | 'success'

function Alert({
  kind,
  icon: Icon,
  isDark,
  onClose,
  children,
  style,
}: {
  kind: AlertKind
  icon: React.ComponentType<IconProps>
  isDark: boolean
  onClose?: () => void
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  const palette: Record<AlertKind, { bg: string; border: string; color: string }> = {
    info:    { bg: isDark ? '#16302A' : '#E8F4EE', border: isDark ? '#22443A' : '#BFE0CE', color: isDark ? '#4ADE98' : '#0A4F37' },
    warning: { bg: isDark ? '#2e2a1a' : '#FFF6D6', border: isDark ? '#4a3a1a' : '#F2D77A', color: isDark ? '#fbbf24' : '#8A6200' },
    error:   { bg: isDark ? '#2e1a1a' : '#FEECEC', border: isDark ? '#4a1a1a' : '#F5A9A9', color: isDark ? '#fca5a5' : '#B42318' },
    success: { bg: isDark ? '#1a2e1a' : '#E7F8EE', border: isDark ? '#1a4a2e' : '#86E0AB', color: isDark ? '#6ee7b7' : '#067647' },
  }
  const p = palette[kind]
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      style={{
        background: p.bg,
        border: `1px solid ${p.border}`,
        borderRadius: 14,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        color: p.color,
        fontSize: 13.5,
        lineHeight: 1.5,
        ...style,
      }}
    >
      <span style={{ flexShrink: 0, marginTop: 2, display: 'flex' }}><Icon size={17} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>{children}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: p.color,
            display: 'flex',
            padding: 2,
            flexShrink: 0,
          }}
        >
          <IconX size={14} />
        </button>
      )}
    </div>
  )
}

function SummarySection({
  icon,
  title,
  rows,
  isDark,
  onEdit,
  editLabel,
  last = false,
}: {
  icon: React.ComponentType<IconProps>
  title: string
  rows: { key: string; val: string }[]
  isDark: boolean
  onEdit?: () => void
  editLabel: string
  last?: boolean
}) {
  const t = getTheme(isDark)
  return (
    <div
      style={{
        marginBottom: last ? 0 : 18,
        paddingBottom: last ? 0 : 18,
        borderBottom: last ? 'none' : `1px solid ${t.divider}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <SectionLabel icon={icon} isDark={isDark}>{title}</SectionLabel>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            style={{
              marginTop: -14,
              background: t.primarySoft,
              color: t.primaryText,
              border: 'none',
              borderRadius: 999,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {editLabel}
          </button>
        )}
      </div>
      {rows.map(({ key, val }) => (
        <div
          key={key}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            padding: '8px 0',
            fontSize: 13.5,
          }}
        >
          <span style={{ color: t.muted, fontWeight: 500, flexShrink: 0 }}>{key}</span>
          <span style={{ color: t.text, fontWeight: 600, textAlign: 'right', wordBreak: 'break-word', minWidth: 0 }}>
            {val || '-'}
          </span>
        </div>
      ))}
    </div>
  )
}

// CSS global halaman (focus ring, tombol back, animasi spinner)
const PAGE_CSS = `
@keyframes spin { to { transform: rotate(360deg); } }
.psmb-input:focus { border-color: #0F6B4A !important; box-shadow: 0 0 0 3px rgba(15,107,74,.16) !important; }
.psmb-input[aria-invalid='true'] { border-color: #EF4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,.14) !important; }
.psmb-input::placeholder { color: #A3B3AA; opacity: 1; }
.psmb-back { transition: transform .12s ease, background-color .15s ease; -webkit-tap-highlight-color: transparent; }
.psmb-back:active { transform: scale(.94); }
.psmb-btn { transition: transform .12s ease, filter .15s ease; -webkit-tap-highlight-color: transparent; }
.psmb-btn:active:not(:disabled) { transform: scale(.98); }
@keyframes psmb-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
`

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PendaftaranPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'
  const t = getTheme(isDark)

  const [step,        setStep]       = useState(1)
  const [loading,     setLoading]    = useState(false)
  const [fetching,    setFetching]   = useState(true)
  const [existing,    setExisting]   = useState<PendaftaranData | null>(null)
  const [form,        setForm]       = useState<FormState>(INIT)
  const [errorMsg,    setErrorMsg]   = useState<string | null>(null)
  const [errorField,  setErrorField] = useState<keyof FormState | null>(null)
  const [successMsg,  setSuccessMsg] = useState<string | null>(null)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [draftBanner, setDraftBanner] = useState(false)
  const initializedRef = useRef(false)

  // ── Get i18n labels ──
  const getAgamaOptions = () => isEn ? AGAMA_EN : AGAMA
  const getPekerjaanOptions = () => isEn ? PEKERJAAN_EN : PEKERJAAN
  const getStepLabel = (s: typeof STEPS[0]) => isEn ? s.labelEn : s.label
  const getStatusLabel = (status: string) => {
    const map: Record<string, { id: string; en: string }> = {
      menunggu: { id: 'Menunggu', en: 'Pending' },
      diproses: { id: 'Diproses', en: 'Processing' },
      diterima: { id: 'Diterima', en: 'Accepted' },
      ditolak: { id: 'Ditolak', en: 'Rejected' },
    }
    return isEn ? map[status]?.en ?? status : map[status]?.id ?? status
  }

  // ── Fetch data existing ──────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionStatus === 'loading') return
    const userId = session?.user?.id
    if (!userId) {
      setFetching(false)
      return
    }

    const fetchExisting = async () => {
      setFetching(true)
      try {
        const res  = await fetch('/api/pendaftaran')
        const json = await res.json()

        if (json.data) {
          const d = json.data as PendaftaranData
          setExisting(d)
          const serverForm: FormState = {
            nama_lengkap:     d.nama_lengkap     ?? '',
            nik:              d.nik               ?? '',
            nisn:             d.nisn              ?? '',
            tempat_lahir:     d.tempat_lahir      ?? '',
            tanggal_lahir:    d.tanggal_lahir     ?? '',
            jenis_kelamin:    d.jenis_kelamin     ?? 'L',
            agama:            d.agama             ?? 'Islam',
            alamat:           d.alamat            ?? '',
            alamat_kota:      d.alamat_kota       ?? '',
            alamat_kecamatan: d.alamat_kecamatan  ?? '',
            alamat_rt_rw:     d.alamat_rt_rw      ?? '',
            no_hp:            d.no_hp             ?? '',
            asal_sekolah:     d.asal_sekolah      ?? '',
            npsn:             d.npsn              ?? '',
            nama_ayah:        d.nama_ayah         ?? '',
            nama_ibu:         d.nama_ibu          ?? '',
            pekerjaan_ayah:   d.pekerjaan_ayah    ?? 'Petani',
            pekerjaan_ibu:    d.pekerjaan_ibu     ?? 'Tidak Bekerja',
            no_hp_ortu:       d.no_hp_ortu        ?? '',
          }
          setForm(serverForm)
          clearDraft(userId)
        } else {
          const draft = loadDraft(userId)
          if (draft) {
            setForm(draft.form)
            setStep(draft.step)
            setDraftBanner(true)
          }
        }
      } catch (err) {
        console.error('Fetch existing error:', err)
        const draft = loadDraft(userId)
        if (draft) {
          setForm(draft.form)
          setStep(draft.step)
          setDraftBanner(true)
        }
      } finally {
        setFetching(false)
        setDraftLoaded(true)
        initializedRef.current = true
      }
    }

    fetchExisting()
  }, [session, sessionStatus])

  // ── Auto-save draft ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!draftLoaded)           return
    if (!session?.user?.id)     return
    if (existing)               return
    if (!initializedRef.current) return

    saveDraft(session.user.id, form, step)
  }, [form, step, draftLoaded, existing, session])

  // ── Scroll ke atas setiap pindah step agar judul kartu selalu terlihat ──────
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  // ── Scroll ke atas saat ada error supaya pesan error langsung terlihat ──────
  useEffect(() => {
    if (!errorMsg || typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [errorMsg])

  const isEditable = !existing || existing.status === 'menunggu'

  const set = (key: keyof FormState, val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrorMsg(null)
    if (errorField === key) setErrorField(null)
  }

  const handleNextStep = () => {
    setErrorMsg(null)
    setStep(s => Math.min(s + 1, STEPS.length))
  }

  const handleSubmit = async () => {
    if (!isEditable || loading) return

    const invalid = validateAll(form, isEn)
    if (invalid) {
      setErrorMsg(invalid.message)
      setErrorField(invalid.key)
      setStep(invalid.step)
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setErrorField(null)

    const payload: FormState = { ...form }

    try {
      let res: Response

      if (existing) {
        res = await fetch('/api/pendaftaran', {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ id: existing.id, ...payload }),
        })
      } else {
        res = await fetch('/api/pendaftaran', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        })
      }

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error ?? (isEn ? 'An error occurred. Please try again.' : 'Terjadi kesalahan. Silakan coba lagi.'))
        return
      }

      if (session?.user?.id) clearDraft(session.user.id)

      setSuccessMsg(isEn ? 'Registration submitted successfully!' : 'Pendaftaran berhasil dikirim!')
      setTimeout(() => router.push('/siswa/status'), 1000)

    } catch (err) {
      console.error('Submit error:', err)
      setErrorMsg(isEn ? 'Failed to send data. Check your internet connection.' : 'Gagal mengirim data. Periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  const stepCompletion = getStepCompletion(form)
  const cardStyle = getCardStyle(isDark)
  const labelStyle = getLabelStyle(isDark)

  // ── Loading state ─────────────────────────────────────────────────────────
  if (sessionStatus === 'loading' || fetching) {
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
          borderColor: isDark ? '#22332B' : '#DCE6DF',
          borderTopColor: '#0F6B4A',
          borderRadius: '50%',
          animation: 'spin .8s linear infinite',
        }} />
        <p style={{ color: t.muted, fontSize: 13, fontWeight: 500, margin: 0 }}>
          {isEn ? 'Loading registration data...' : 'Memuat data pendaftaran...'}
        </p>
        <style>{PAGE_CSS}</style>
      </div>
    )
  }

  // ── Data konten per step ──────────────────────────────────────────────────
  const stepTitles: Record<number, { title: string; subtitle: string; icon: React.ComponentType<IconProps> }> = {
    1: {
      title: isEn ? 'Student Identity' : 'Identitas Diri Santri',
      subtitle: isEn ? 'Fill in according to official documents' : 'Isi sesuai dokumen resmi',
      icon: IconUser,
    },
    2: {
      title: isEn ? 'School Origin' : 'Asal Sekolah Santri',
      subtitle: isEn ? 'Information about the previous school' : 'Informasi sekolah sebelumnya',
      icon: IconSchool,
    },
    3: {
      title: isEn ? 'Address & Contact' : 'Alamat & Kontak Santri',
      subtitle: isEn ? 'Home address and contact number' : 'Alamat tinggal dan nomor yang dapat dihubungi',
      icon: IconPin,
    },
    4: {
      title: isEn ? 'Parent & Guardian Data' : 'Data Orang Tua & Wali',
      subtitle: isEn ? "Father, mother and parent's contact" : 'Data ayah, ibu, dan kontak orang tua',
      icon: IconFamily,
    },
    5: {
      title: isEn ? 'Registration Summary' : 'Ringkasan Pendaftaran',
      subtitle: isEn ? 'Review your data before submitting' : 'Periksa kembali data sebelum mengirim',
      icon: IconClipboardEdit,
    },
  }
  const current = stepTitles[step]

  const missingSteps = [
    !stepCompletion[1] && (isEn ? 'Personal Data' : 'Data Diri'),
    !stepCompletion[2] && (isEn ? 'School Origin' : 'Asal Sekolah'),
    !stepCompletion[3] && (isEn ? 'Address & Contact' : 'Alamat & Kontak'),
    !stepCompletion[4] && (isEn ? 'Parent Data' : 'Data Orang Tua'),
  ].filter(Boolean) as string[]

  const editLabel = isEn ? 'Edit' : 'Ubah'
  const goEdit = (n: number) => () => { setStep(n); setErrorMsg(null) }

  // ── Render ────────────────────────────────────────────────────────────────
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

      {/* ══ HEADER (FIXED) ══ */}
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
        {/* Tombol kembali — desain identik dengan halaman Admin › Pendaftar */}
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
            {isEn ? 'Registration Form' : 'Formulir Pendaftaran'}
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
            {isEn ? 'Complete your personal data to register' : 'Lengkapi data diri Anda untuk mendaftar'}
          </p>
        </div>
      </div>

      {/* ══ AREA KONTEN ════════════════════════════════════════════════════════ */}
      <div
        style={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: SISWA_NAV_HEIGHT + 16,
        }}
      >
        {/* ── STEP INDICATOR ── */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ ...cardStyle, padding: '16px 8px 14px', borderRadius: 22 }}>
            <div style={{ padding: '0 12px 16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 9,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: t.muted }}>
                  {isEn ? `Step ${step} of ${STEPS.length}` : `Langkah ${step} dari ${STEPS.length}`}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: t.primaryText }}>
                  {Math.round((step / STEPS.length) * 100)}%
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: t.pendingBg, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(step / STEPS.length) * 100}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${t.primary}, ${t.accent})`,
                    transition: 'width .3s ease',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
              {STEPS.map((s, i) => {
                const idx      = i + 1
                const isActive = idx === step
                const isDone   = !isActive && (idx < step || (idx < STEPS.length && stepCompletion[idx]))
                const isLast   = i === STEPS.length - 1

                const circleBg    = isActive || isDone ? t.primary : t.pendingBg
                const circleColor = isActive || isDone ? '#FFFFFF' : t.faint
                const labelColor  = isActive ? t.primaryText : isDone ? t.primaryText : t.faint

                return (
                  <div key={s.label} style={{ position: 'relative' }}>
                    {!isLast && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 15,
                          left: '50%',
                          width: '100%',
                          height: 2,
                          borderRadius: 2,
                          background: idx < step ? t.primary : t.line,
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => { setStep(idx); setErrorMsg(null) }}
                      aria-current={isActive ? 'step' : undefined}
                      aria-label={`${idx}. ${getStepLabel(s)}`}
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: circleBg,
                          color: circleColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          boxShadow: isActive ? `0 0 0 4px ${isDark ? 'rgba(74,222,152,.18)' : 'rgba(15,107,74,.14)'}` : 'none',
                          transition: 'box-shadow .2s ease, background-color .2s ease',
                        }}
                      >
                        {isDone ? <IconCheck size={15} /> : idx}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: isActive ? 800 : 700,
                          color: labelColor,
                          textAlign: 'center',
                          lineHeight: 1.25,
                          padding: '0 2px',
                          wordBreak: 'break-word',
                        }}
                      >
                        {getStepLabel(s)}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Notifikasi ── */}
        {(draftBanner || !isEditable || errorMsg || successMsg) && (
          <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {draftBanner && (
              <Alert kind="info" icon={IconSave} isDark={isDark} onClose={() => setDraftBanner(false)}>
                {isEn
                  ? 'Previously saved draft loaded. Continue filling the form.'
                  : 'Draft tersimpan sebelumnya telah dimuat. Lanjutkan mengisi formulir.'}
              </Alert>
            )}

            {!isEditable && (
              <Alert kind="warning" icon={IconAlertTriangle} isDark={isDark}>
                {isEn ? 'Form cannot be edited because registration status is' : 'Formulir tidak dapat diedit karena status pendaftaran sudah'}
                {' '}<strong>{getStatusLabel(existing?.status ?? '')}</strong>.
              </Alert>
            )}

            {errorMsg && (
              <Alert kind="error" icon={IconAlertTriangle} isDark={isDark}>
                {errorMsg}
              </Alert>
            )}

            {successMsg && (
              <Alert kind="success" icon={IconCheckCircle} isDark={isDark}>
                {successMsg}
              </Alert>
            )}
          </div>
        )}

        {/* ══ BODY ═════════════════════════════════════════════════════════════ */}
        <div style={{ padding: '14px 16px 24px' }}>
          <div key={step} style={{ animation: 'psmb-fade .25s ease both' }}>

            <div style={cardStyle}>
              <CardTitle icon={current.icon} title={current.title} subtitle={current.subtitle} isDark={isDark} />

              {/* ── STEP 1: Data Diri ── */}
              {step === 1 && (
                <>
                  <Field
                    label={isEn ? 'Full Name' : 'Nama Lengkap'}
                    value={form.nama_lengkap}
                    onChange={v => set('nama_lengkap', v)}
                    placeholder={isEn ? 'As per diploma' : 'Sesuai ijazah'}
                    disabled={!isEditable}
                    invalid={errorField === 'nama_lengkap'}
                    isDark={isDark}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field
                      label="NIK"
                      value={form.nik}
                      onChange={v => set('nik', v)}
                      placeholder="NIK"
                      inputMode="numeric"
                      disabled={!isEditable}
                      invalid={errorField === 'nik'}
                      isDark={isDark}
                    />
                    <Field
                      label="NISN"
                      value={form.nisn}
                      onChange={v => set('nisn', v)}
                      placeholder="NISN"
                      inputMode="numeric"
                      disabled={!isEditable}
                      invalid={errorField === 'nisn'}
                      isDark={isDark}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field
                      label={isEn ? 'Place of Birth' : 'Tempat Lahir'}
                      value={form.tempat_lahir}
                      onChange={v => set('tempat_lahir', v)}
                      placeholder={isEn ? 'City' : 'Kota'}
                      disabled={!isEditable}
                      invalid={errorField === 'tempat_lahir'}
                      isDark={isDark}
                    />
                    <Field
                      label={isEn ? 'Date of Birth' : 'Tanggal Lahir'}
                      value={form.tanggal_lahir}
                      onChange={v => set('tanggal_lahir', v)}
                      type="date"
                      disabled={!isEditable}
                      invalid={errorField === 'tanggal_lahir'}
                      isDark={isDark}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>{isEn ? 'Gender' : 'Jenis Kelamin'}</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {(['L', 'P'] as const).map(v => {
                        const active = form.jenis_kelamin === v
                        return (
                          <button
                            key={v}
                            type="button"
                            className="psmb-btn"
                            aria-pressed={active}
                            onClick={() => isEditable && set('jenis_kelamin', v)}
                            disabled={!isEditable}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              minHeight: 46,
                              padding: '12px 0',
                              borderRadius: 12,
                              border: active ? `1px solid ${t.primary}` : `1px solid ${t.borderInput}`,
                              background: active ? t.primarySoft : t.surfaceAlt,
                              color: active ? t.primaryText : t.muted,
                              fontWeight: 700,
                              fontSize: 13.5,
                              cursor: isEditable ? 'pointer' : 'not-allowed',
                              opacity: isEditable ? 1 : 0.6,
                            }}
                          >
                            <span style={{ display: 'flex' }}>{v === 'L' ? <IconMale size={15} /> : <IconFemale size={15} />}</span>
                            <span>{v === 'L' ? (isEn ? 'Male' : 'Laki-laki') : (isEn ? 'Female' : 'Perempuan')}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <SelectField
                    label={isEn ? 'Religion' : 'Agama'}
                    value={form.agama}
                    options={getAgamaOptions()}
                    onChange={v => set('agama', v)}
                    disabled={!isEditable}
                    isDark={isDark}
                  />
                </>
              )}

              {/* ── STEP 2: Asal Sekolah ── */}
              {step === 2 && (
                <>
                  <Field
                    label={isEn ? 'School Name' : 'Nama SMP / MTs Asal'}
                    value={form.asal_sekolah}
                    onChange={v => set('asal_sekolah', v)}
                    placeholder={isEn ? 'Previous school name' : 'Nama sekolah asal'}
                    disabled={!isEditable}
                    invalid={errorField === 'asal_sekolah'}
                    isDark={isDark}
                  />
                  <Field
                    label="NPSN"
                    value={form.npsn}
                    onChange={v => set('npsn', v)}
                    placeholder="NPSN"
                    inputMode="numeric"
                    disabled={!isEditable}
                    invalid={errorField === 'npsn'}
                    isDark={isDark}
                  />
                </>
              )}

              {/* ── STEP 3: Alamat & Kontak ── */}
              {step === 3 && (
                <>
                  <Field
                    label={isEn ? 'Full Address' : 'Alamat Lengkap'}
                    value={form.alamat}
                    onChange={v => set('alamat', v)}
                    placeholder={isEn ? 'Street, Number, Alley, etc' : 'Jl., Nomor, Gang, dsb'}
                    disabled={!isEditable}
                    invalid={errorField === 'alamat'}
                    isDark={isDark}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field
                      label={isEn ? 'City' : 'Kota'}
                      value={form.alamat_kota}
                      onChange={v => set('alamat_kota', v)}
                      placeholder={isEn ? 'City' : 'Kota'}
                      disabled={!isEditable}
                      invalid={errorField === 'alamat_kota'}
                      isDark={isDark}
                    />
                    <Field
                      label={isEn ? 'District' : 'Kecamatan'}
                      value={form.alamat_kecamatan}
                      onChange={v => set('alamat_kecamatan', v)}
                      placeholder={isEn ? 'District' : 'Kecamatan'}
                      disabled={!isEditable}
                      invalid={errorField === 'alamat_kecamatan'}
                      isDark={isDark}
                    />
                  </div>
                  <Field
                    label="RT/RW"
                    value={form.alamat_rt_rw}
                    onChange={v => set('alamat_rt_rw', v)}
                    placeholder="RT/RW"
                    disabled={!isEditable}
                    invalid={errorField === 'alamat_rt_rw'}
                    isDark={isDark}
                  />
                  <Field
                    label={isEn ? 'Phone / WA' : 'No. HP / WA'}
                    value={form.no_hp}
                    onChange={v => set('no_hp', v)}
                    placeholder="08xxxxxxxxxx"
                    type="tel"
                    inputMode="tel"
                    disabled={!isEditable}
                    invalid={errorField === 'no_hp'}
                    isDark={isDark}
                  />
                  <div style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      value={session?.user?.email ?? ''}
                      disabled
                      readOnly
                      style={{
                        ...getInputStyle(isDark),
                        opacity: 0.6,
                        cursor: 'not-allowed',
                      }}
                    />
                    <p style={{ fontSize: 12, color: t.muted, margin: '6px 0 0', lineHeight: 1.4 }}>
                      {isEn
                        ? 'Email is taken from your account and cannot be changed here.'
                        : 'Email diambil dari akun Anda dan tidak dapat diubah di sini.'}
                    </p>
                  </div>
                </>
              )}

              {/* ── STEP 4: Data Orang Tua ── */}
              {step === 4 && (
                <>
                  <div style={{ marginBottom: 18, paddingBottom: 6, borderBottom: `1px solid ${t.divider}` }}>
                    <SectionLabel icon={IconUser} isDark={isDark}>
                      {isEn ? "Father's Data" : 'Data Ayah'}
                    </SectionLabel>
                    <Field
                      label={isEn ? "Father's Name" : 'Nama Ayah'}
                      value={form.nama_ayah}
                      onChange={v => set('nama_ayah', v)}
                      placeholder={isEn ? "Father's full name" : 'Nama lengkap ayah'}
                      disabled={!isEditable}
                      invalid={errorField === 'nama_ayah'}
                      isDark={isDark}
                    />
                    <SelectField
                      label={isEn ? "Father's Occupation" : 'Pekerjaan Ayah'}
                      value={form.pekerjaan_ayah}
                      options={getPekerjaanOptions()}
                      onChange={v => set('pekerjaan_ayah', v)}
                      disabled={!isEditable}
                      invalid={errorField === 'pekerjaan_ayah'}
                      isDark={isDark}
                    />
                  </div>
                  <div style={{ marginBottom: 18, paddingBottom: 6, borderBottom: `1px solid ${t.divider}` }}>
                    <SectionLabel icon={IconUser} isDark={isDark}>
                      {isEn ? "Mother's Data" : 'Data Ibu'}
                    </SectionLabel>
                    <Field
                      label={isEn ? "Mother's Name" : 'Nama Ibu'}
                      value={form.nama_ibu}
                      onChange={v => set('nama_ibu', v)}
                      placeholder={isEn ? "Mother's full name" : 'Nama lengkap ibu'}
                      disabled={!isEditable}
                      invalid={errorField === 'nama_ibu'}
                      isDark={isDark}
                    />
                    <SelectField
                      label={isEn ? "Mother's Occupation" : 'Pekerjaan Ibu'}
                      value={form.pekerjaan_ibu}
                      options={getPekerjaanOptions()}
                      onChange={v => set('pekerjaan_ibu', v)}
                      disabled={!isEditable}
                      invalid={errorField === 'pekerjaan_ibu'}
                      isDark={isDark}
                    />
                  </div>
                  <Field
                    label={isEn ? "Parent's Phone" : 'No. HP Orang Tua'}
                    value={form.no_hp_ortu}
                    onChange={v => set('no_hp_ortu', v)}
                    placeholder="08xxxxxxxxxx"
                    type="tel"
                    inputMode="tel"
                    disabled={!isEditable}
                    invalid={errorField === 'no_hp_ortu'}
                    isDark={isDark}
                  />
                </>
              )}

              {/* ── STEP 5: Konfirmasi ── */}
              {step === 5 && (
                <>
                  {missingSteps.length > 0 && (
                    <Alert kind="error" icon={IconAlertTriangle} isDark={isDark} style={{ marginBottom: 18 }}>
                      {isEn ? 'Some fields are not filled: ' : 'Beberapa field belum diisi: '}
                      <strong>{missingSteps.join(', ')}</strong>.{' '}
                      {isEn ? 'Click the step name above to complete.' : 'Klik nama langkah di atas untuk melengkapi.'}
                    </Alert>
                  )}

                  <SummarySection
                    icon={IconUser}
                    title={isEn ? 'Personal Data' : 'Data Diri'}
                    isDark={isDark}
                    editLabel={editLabel}
                    onEdit={isEditable ? goEdit(1) : undefined}
                    rows={[
                      { key: isEn ? 'Full Name' : 'Nama Lengkap', val: form.nama_lengkap },
                      { key: 'NIK / NISN', val: `${form.nik || '-'} / ${form.nisn || '-'}` },
                      {
                        key: isEn ? 'Place, Date of Birth' : 'Tempat, Tgl Lahir',
                        val: `${form.tempat_lahir || '-'}, ${
                          form.tanggal_lahir
                            ? new Date(form.tanggal_lahir).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                            : '-'
                        }`,
                      },
                      { key: isEn ? 'Gender' : 'Jenis Kelamin', val: form.jenis_kelamin === 'L' ? (isEn ? 'Male' : 'Laki-laki') : (isEn ? 'Female' : 'Perempuan') },
                      { key: isEn ? 'Religion' : 'Agama', val: form.agama },
                    ]}
                  />

                  <SummarySection
                    icon={IconSchool}
                    title={isEn ? 'School Origin' : 'Asal Sekolah'}
                    isDark={isDark}
                    editLabel={editLabel}
                    onEdit={isEditable ? goEdit(2) : undefined}
                    rows={[
                      { key: isEn ? 'School Name' : 'Nama Sekolah', val: form.asal_sekolah },
                      { key: 'NPSN', val: form.npsn },
                    ]}
                  />

                  <SummarySection
                    icon={IconPin}
                    title={isEn ? 'Address & Contact' : 'Alamat & Kontak'}
                    isDark={isDark}
                    editLabel={editLabel}
                    onEdit={isEditable ? goEdit(3) : undefined}
                    rows={[
                      { key: isEn ? 'Full Address' : 'Alamat Lengkap', val: form.alamat },
                      { key: isEn ? 'City' : 'Kota', val: form.alamat_kota },
                      { key: isEn ? 'District' : 'Kecamatan', val: form.alamat_kecamatan },
                      { key: 'RT/RW', val: form.alamat_rt_rw },
                      { key: isEn ? 'Phone / WA' : 'No. HP / WA', val: form.no_hp },
                      { key: 'Email', val: session?.user?.email ?? '-' },
                    ]}
                  />

                  <SummarySection
                    icon={IconFamily}
                    title={isEn ? "Parent's Data" : 'Data Orang Tua'}
                    isDark={isDark}
                    editLabel={editLabel}
                    onEdit={isEditable ? goEdit(4) : undefined}
                    last
                    rows={[
                      { key: isEn ? "Father's Name" : 'Nama Ayah', val: form.nama_ayah },
                      { key: isEn ? "Father's Occupation" : 'Pekerjaan Ayah', val: form.pekerjaan_ayah },
                      { key: isEn ? "Mother's Name" : 'Nama Ibu', val: form.nama_ibu },
                      { key: isEn ? "Mother's Occupation" : 'Pekerjaan Ibu', val: form.pekerjaan_ibu },
                      { key: isEn ? "Parent's Phone" : 'No. HP Ortu', val: form.no_hp_ortu },
                    ]}
                  />
                </>
              )}
            </div>

            {/* ══ ACTION BUTTONS ══ */}
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                gap: 10,
                boxSizing: 'border-box',
              }}
            >
              {step > 1 && (
                <button
                  type="button"
                  className="psmb-btn"
                  onClick={() => { setStep(s => Math.max(1, s - 1)); setErrorMsg(null) }}
                  style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    minHeight: 50,
                    padding: '14px 18px',
                    borderRadius: 14,
                    border: `1px solid ${t.borderInput}`,
                    background: t.surface,
                    color: t.label,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  <IconChevronLeft size={16} /> {isEn ? 'Back' : 'Kembali'}
                </button>
              )}

              {step < STEPS.length ? (
                <button
                  type="button"
                  className="psmb-btn"
                  onClick={handleNextStep}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    minHeight: 50,
                    padding: '14px 18px',
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
                  {isEn ? 'Next' : 'Lanjut'} <IconChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="psmb-btn"
                  onClick={handleSubmit}
                  disabled={loading || !isEditable}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    minHeight: 50,
                    padding: '14px 18px',
                    borderRadius: 14,
                    border: 'none',
                    background: loading || !isEditable ? (isDark ? '#22332B' : '#B8C7BE') : t.gradient,
                    boxShadow: loading || !isEditable ? 'none' : t.shadowBtn,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: loading || !isEditable ? 'not-allowed' : 'pointer',
                    opacity: loading || !isEditable ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <><IconSpinner size={16} color="#FFFFFF" />{isEn ? 'Saving...' : 'Menyimpan...'}</>
                  ) : existing ? (
                    <><IconClipboardEdit size={16} />{isEn ? 'Update Data' : 'Perbarui Data'}</>
                  ) : (
                    <><IconSend size={16} />{isEn ? 'Submit Registration' : 'Kirim Pendaftaran'}</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{PAGE_CSS}</style>
    </div>
  )
}