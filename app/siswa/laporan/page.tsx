// app/siswa/laporan/page.tsx
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSettings } from '@/contexts/SettingsContext'

/* ════════════════════════════════════════════════════════════════
   ICON SET — SVG line-style (gaya sama dengan halaman Pendaftaran)
   ════════════════════════════════════════════════════════════════ */
type IconProps = { size?: number; color?: string; strokeWidth?: number }
type IconCmp = React.ComponentType<IconProps>

const Svg = ({
  size, color, strokeWidth, children,
}: Required<IconProps> & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

// Ikon panah kembali — IDENTIK dengan halaman Pendaftaran
const IconArrowLeft = ({ size = 18, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </Svg>
)

const IconChevronRight = ({ size = 16, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
)

const IconArrowRight = ({ size = 14, color = 'currentColor', strokeWidth = 2.4 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
)

const IconX = ({ size = 14, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)

const IconCalendar = ({ size = 14, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </Svg>
)

const IconFile = ({ size = 14, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h4" />
  </Svg>
)

const IconDownload = ({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M12 4v11" />
    <path d="m7.5 11 4.5 4.5L16.5 11" />
    <path d="M5 20h14" />
  </Svg>
)

const IconExternal = ({ size = 14, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    <path d="M15 4h5v5" />
    <path d="M10 14 20 4" />
  </Svg>
)

const IconInbox = ({ size = 28, color = 'currentColor', strokeWidth = 1.6 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M3 13.5 5.8 5.8A2 2 0 0 1 7.7 4.5h8.6a2 2 0 0 1 1.9 1.3L21 13.5" />
    <path d="M3 13.5V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4.5h-5.2a1 1 0 0 0-.9.6 3.3 3.3 0 0 1-5.8 0 1 1 0 0 0-.9-.6H3Z" />
  </Svg>
)

const IconAlertTriangle = ({ size = 18, color = 'currentColor', strokeWidth = 1.75 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M12 3.5 21.5 20H2.5L12 3.5Z" />
    <path d="M12 10v4" />
    <path d="M12 17.2h.01" />
  </Svg>
)

const IconQuote = ({ size = 16, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M9.5 7H6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v1.5A2.5 2.5 0 0 1 6.5 17" />
    <path d="M19 7h-3.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v1.5A2.5 2.5 0 0 1 16 17" />
  </Svg>
)

const IconChart = ({ size = 16, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />
  </Svg>
)

// Ikon kategori
const IconBookOpen = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M2.5 4.5h6A3.5 3.5 0 0 1 12 8v12a2.5 2.5 0 0 0-2.5-2.5h-7v-13Z" />
    <path d="M21.5 4.5h-6A3.5 3.5 0 0 0 12 8v12a2.5 2.5 0 0 1 2.5-2.5h7v-13Z" />
  </Svg>
)

const IconMosque = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M12 2.5V5" />
    <path d="M7 11a5 5 0 0 1 10 0v1H7v-1Z" />
    <path d="M3.5 21v-6a2.5 2.5 0 0 1 2.5-2.5h12a2.5 2.5 0 0 1 2.5 2.5v6" />
    <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
    <path d="M2 21h20" />
  </Svg>
)

const IconUsers = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <circle cx="8.5" cy="7.5" r="3" />
    <circle cx="16" cy="8.5" r="2.3" />
    <path d="M2.5 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M15 14.2c2.4.3 4.2 2.3 4.2 4.8" />
  </Svg>
)

const IconFlag = ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M5 21V4" />
    <path d="M5 4h11l-2 4 2 4H5" />
  </Svg>
)

/* ════════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════════ */
interface LaporanItem {
  id: string
  judul: string
  tipe: 'bulanan' | 'tahunan' | 'khusus' | string
  deskripsi: string | null
  file_url: string | null
  created_at: string | null
  nilai?: number
  data_json?: Record<string, unknown> | null
}

type KategoriKey = 'pelajaran' | 'ibadah' | 'akhlak' | 'kegiatan' | 'pelanggaran'
type SeverityKey = 'ringan' | 'sedang' | 'berat'

/* ════════════════════════════════════════════════════════════════
   THEME (sama dengan halaman Pendaftaran & Jadwal)
   ════════════════════════════════════════════════════════════════ */
const HEADER_HEIGHT = 84
const SISWA_NAV_HEIGHT = 68

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

function useUi() {
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'
  return {
    isDark,
    isEn,
    t: getTheme(isDark),
    tr: (id: string, en: string) => (isEn ? en : id),
  }
}

function getCardStyle(isDark: boolean): React.CSSProperties {
  const t = getTheme(isDark)
  return {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 22,
    boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,60,40,.04), 0 10px 28px rgba(15,60,40,.06)',
  }
}

/* ════════════════════════════════════════════════════════════════
   KATEGORI / SEVERITY / TIPE
   ════════════════════════════════════════════════════════════════ */
const KATEGORI: Record<KategoriKey, {
  label: { id: string; en: string }
  desc: { id: string; en: string }
  fg: string; fgDark: string
  soft: string; softDark: string
  line: string; lineDark: string
  grad: string; glow: string
  Icon: IconCmp
}> = {
  pelajaran: {
    label: { id: 'Pelajaran', en: 'Academics' },
    desc:  { id: 'Pemahaman materi dan tugas', en: 'Understanding of lessons and assignments' },
    fg: '#0A4F37', fgDark: '#4ADE98',
    soft: '#E8F4EE', softDark: '#16302A',
    line: '#BFE0CE', lineDark: '#22443A',
    grad: 'linear-gradient(135deg, #0F6B4A 0%, #0A4F37 100%)', glow: 'rgba(15,107,74,.26)',
    Icon: IconBookOpen,
  },
  ibadah: {
    label: { id: 'Ibadah', en: 'Worship' },
    desc:  { id: 'Kedisiplinan dalam beribadah', en: 'Discipline in worship' },
    fg: '#8A6200', fgDark: '#fbbf24',
    soft: '#FFF6D6', softDark: '#2e2a1a',
    line: '#F2D77A', lineDark: '#4a3a1a',
    grad: 'linear-gradient(135deg, #F2B705 0%, #D99A00 100%)', glow: 'rgba(242,183,5,.30)',
    Icon: IconMosque,
  },
  akhlak: {
    label: { id: 'Akhlak & Sikap', en: 'Character' },
    desc:  { id: 'Perilaku dan sikap sehari-hari', en: 'Daily behavior and attitude' },
    fg: '#0E6E83', fgDark: '#5CC8DB',
    soft: '#E3F4F8', softDark: '#12303A',
    line: '#B5DEE8', lineDark: '#1F4654',
    grad: 'linear-gradient(135deg, #0E8FA8 0%, #0B6F83 100%)', glow: 'rgba(14,143,168,.26)',
    Icon: IconUsers,
  },
  kegiatan: {
    label: { id: 'Kegiatan', en: 'Activities' },
    desc:  { id: 'Keaktifan dalam kegiatan pesantren', en: 'Participation in pesantren activities' },
    fg: '#5B3FC4', fgDark: '#B7A6FF',
    soft: '#EFEBFD', softDark: '#231F3D',
    line: '#D4C9F7', lineDark: '#373064',
    grad: 'linear-gradient(135deg, #7C5CE0 0%, #5B3FC4 100%)', glow: 'rgba(124,92,224,.26)',
    Icon: IconFlag,
  },
  pelanggaran: {
    label: { id: 'Pelanggaran', en: 'Violation' },
    desc:  { id: 'Catatan kedisiplinan santri', en: "Student's discipline record" },
    fg: '#B42318', fgDark: '#fca5a5',
    soft: '#FEECEC', softDark: '#2e1a1a',
    line: '#F5A9A9', lineDark: '#4a1a1a',
    grad: 'linear-gradient(135deg, #E5484D 0%, #B42318 100%)', glow: 'rgba(220,38,38,.26)',
    Icon: IconAlertTriangle,
  },
}

function getKategoriKey(judul: string): KategoriKey {
  const j = judul.toLowerCase()
  if (/(pelanggaran|melanggar|denda|sanksi|teguran|peringatan)/.test(j)) return 'pelanggaran'
  if (/(ibadah|sholat|shalat|sholawat|hafalan|tahfidz|ngaji|mengaji)/.test(j)) return 'ibadah'
  if (/(akhlak|sikap|perilaku|adab)/.test(j)) return 'akhlak'
  if (/(kegiatan|ekstra|organisasi|santri\s*baru|kepramukaan)/.test(j)) return 'kegiatan'
  return 'pelajaran'
}

function catTone(key: KategoriKey, isDark: boolean, isEn: boolean) {
  const m = KATEGORI[key]
  return {
    key,
    label: isEn ? m.label.en : m.label.id,
    desc:  isEn ? m.desc.en : m.desc.id,
    fg:    isDark ? m.fgDark : m.fg,
    soft:  isDark ? m.softDark : m.soft,
    line:  isDark ? m.lineDark : m.line,
    grad:  m.grad,
    glow:  m.glow,
    Icon:  m.Icon,
  }
}

function extractSeverityLevel(item: LaporanItem): SeverityKey {
  const d = (item.judul + ' ' + (item.deskripsi ?? '')).toLowerCase()
  if (/(berat|keras|dikeluarkan|skors|denda|merusak|dirusak)/.test(d)) return 'berat'
  if (/(sedang|peringatan\s*ke-?2|teguran\s*tertulis)/.test(d)) return 'sedang'
  return 'ringan'
}

function sevTone(level: SeverityKey, isDark: boolean, isEn: boolean) {
  const map = {
    ringan: {
      label: isEn ? 'Mild' : 'Tingkat Ringan',
      fg: isDark ? '#fbbf24' : '#8A6200', soft: isDark ? '#2e2a1a' : '#FFF6D6',
      line: isDark ? '#4a3a1a' : '#F2D77A', dot: '#F2B705',
    },
    sedang: {
      label: isEn ? 'Moderate' : 'Tingkat Sedang',
      fg: isDark ? '#fdba74' : '#C2410C', soft: isDark ? '#3a2412' : '#FFEDD5',
      line: isDark ? '#5a3716' : '#FDC99B', dot: '#F97316',
    },
    berat: {
      label: isEn ? 'Severe' : 'Tingkat Berat',
      fg: isDark ? '#fca5a5' : '#B42318', soft: isDark ? '#2e1a1a' : '#FEECEC',
      line: isDark ? '#4a1a1a' : '#F5A9A9', dot: '#EF4444',
    },
  }
  return map[level]
}

function tipeTone(tipe: string, isDark: boolean, isEn: boolean) {
  const t = getTheme(isDark)
  if (tipe === 'bulanan') {
    const c = catTone('akhlak', isDark, isEn)
    return { label: isEn ? 'Monthly' : 'Bulanan', fg: c.fg, soft: c.soft, line: c.line }
  }
  if (tipe === 'tahunan') {
    const c = catTone('pelajaran', isDark, isEn)
    return { label: isEn ? 'Annual' : 'Tahunan', fg: c.fg, soft: c.soft, line: c.line }
  }
  if (tipe === 'khusus') {
    const c = catTone('ibadah', isDark, isEn)
    return { label: isEn ? 'Special' : 'Khusus', fg: c.fg, soft: c.soft, line: c.line }
  }
  return { label: tipe, fg: t.muted, soft: t.pendingBg, line: t.border }
}

function formatTanggal(iso: string, isEn: boolean): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

/* ════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════════ */
function Chip({
  fg, soft, line, children, dot,
}: {
  fg: string; soft: string; line: string; dot?: string; children: React.ReactNode
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: soft,
        color: fg,
        border: `1px solid ${line}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.3,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />}
      {children}
    </span>
  )
}

function IconBubble({
  grad, glow, size = 46, children,
}: {
  grad: string; glow: string; size?: number; children: React.ReactNode
}) {
  const { isDark } = useUi()
  return (
    <span
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        background: grad,
        color: '#FFFFFF',
        boxShadow: isDark ? 'none' : `0 4px 12px ${glow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </span>
  )
}

function GreetingBanner() {
  const { isDark, tr } = useUi()
  return (
    <div
      style={{
        ...getCardStyle(isDark),
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        background: '#FFFFFF',
      }}
    >
      <Image
        src="/icons/laporan-santri-banner.png"
        alt={tr('Banner Laporan Santri', 'Student Report Banner')}
        fill
        priority
        sizes="(max-width: 430px) 100vw, 430px"
        style={{ objectFit: 'contain', objectPosition: 'center', background: '#FFFFFF' }}
      />
    </div>
  )
}

function KataBanner() {
  const { isDark, t, tr } = useUi()
  return (
    <div
      style={{
        ...getCardStyle(isDark),
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: t.primarySoft,
            border: isDark ? '1px solid #22443A' : '1px solid #CFE6DA',
            color: t.primaryText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}
        >
          <IconQuote size={16} />
        </span>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, fontWeight: 600, fontStyle: 'italic', color: t.label }}>
          {tr(
            'Apapun yang anda lakukan, pasti ada resikonya. Jadi terimalah.',
            'Whatever you do, there will always be risks. So accept them.',
          )}
        </p>
      </div>
      <div style={{ flexShrink: 0 }}>
        <Image
          src="/icons/santri1.png"
          alt="Santri"
          width={96}
          height={96}
          style={{ borderRadius: 16, objectFit: 'cover', display: 'block' }}
        />
      </div>
    </div>
  )
}

function StatsCard({ items }: { items: LaporanItem[] }) {
  const { isDark, t, tr } = useUi()
  const stats = [
    { label: 'Total', n: items.length, Icon: IconChart },
    { label: tr('Berkas', 'Files'), n: items.filter(i => !!i.file_url).length, Icon: IconFile },
    { label: tr('Pelanggaran', 'Violations'), n: items.filter(i => getKategoriKey(i.judul) === 'pelanggaran').length, Icon: IconAlertTriangle },
  ]
  return (
    <div style={{ ...getCardStyle(isDark), padding: '16px 8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {stats.map((s, i) => (
          <div
            key={s.label}
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
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: t.primaryText }}>
              <s.Icon size={13} />
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LaporanCard({ item, onClick }: { item: LaporanItem; onClick: (i: LaporanItem) => void }) {
  const { isDark, isEn, t, tr } = useUi()
  const key = getKategoriKey(item.judul)
  const k = catTone(key, isDark, isEn)
  const sev = key === 'pelanggaran' ? sevTone(extractSeverityLevel(item), isDark, isEn) : null
  const tp = tipeTone(item.tipe, isDark, isEn)
  const desc = item.deskripsi?.trim() || k.desc

  return (
    <button
      type="button"
      className="lp-card"
      onClick={() => onClick(item)}
      style={{
        ...getCardStyle(isDark),
        width: '100%',
        textAlign: 'left',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'inherit',
        cursor: 'pointer',
      }}
    >
      {/* Baris atas */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <IconBubble grad={k.grad} glow={k.glow}>
          <k.Icon size={21} />
        </IconBubble>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 800,
              color: t.text,
              lineHeight: 1.35,
              letterSpacing: '-.01em',
              wordBreak: 'break-word',
            }}
          >
            {item.judul || k.label}
          </h3>
          {item.created_at && (
            <p style={{ margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: t.muted }}>
              <span style={{ display: 'flex', color: t.primaryText }}><IconCalendar size={13} /></span>
              {formatTanggal(item.created_at, isEn)}
            </p>
          )}
        </div>

        <span
          style={{
            width: 28,
            height: 28,
            minWidth: 28,
            borderRadius: '50%',
            background: t.surfaceAlt,
            border: `1px solid ${t.border}`,
            color: t.faint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          <IconChevronRight size={14} />
        </span>
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Chip fg={k.fg} soft={k.soft} line={k.line}>{k.label}</Chip>
        <Chip fg={tp.fg} soft={tp.soft} line={tp.line}>{tp.label}</Chip>
        {sev && <Chip fg={sev.fg} soft={sev.soft} line={sev.line} dot={sev.dot}>{sev.label}</Chip>}
      </div>

      {/* Deskripsi */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: t.muted,
          fontWeight: 500,
          lineHeight: 1.55,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {desc}
      </p>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingTop: 12,
          borderTop: `1px solid ${t.divider}`,
        }}
      >
        {item.file_url ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: t.muted }}>
            <span style={{ display: 'flex', color: t.primaryText }}><IconFile size={14} /></span>
            {tr('Berkas tersedia', 'File available')}
          </span>
        ) : (
          <span />
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 800, color: k.fg }}>
          {tr('Lihat detail', 'View details')}
          <IconArrowRight size={14} />
        </span>
      </div>
    </button>
  )
}

function SkeletonCard() {
  const { isDark, t } = useUi()
  const bar = (w: string, h: number, r = 6, mb = 0): React.CSSProperties => ({
    width: w, height: h, borderRadius: r, background: t.pendingBg, marginBottom: mb,
  })
  return (
    <div style={{ ...getCardStyle(isDark), padding: 16, animation: 'lp-pulse 1.5s ease-in-out infinite' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: t.pendingBg, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={bar('65%', 14, 6, 8)} />
          <div style={bar('35%', 11)} />
        </div>
      </div>
      <div style={bar('40%', 22, 999, 12)} />
      <div style={bar('90%', 11, 6, 6)} />
      <div style={bar('70%', 11)} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   DETAIL MODAL — bottom sheet
   ════════════════════════════════════════════════════════════════ */
function DetailModal({ item, onClose }: { item: LaporanItem; onClose: () => void }) {
  const { isDark, isEn, t, tr } = useUi()
  const key = getKategoriKey(item.judul)
  const k = catTone(key, isDark, isEn)
  const sev = key === 'pelanggaran' ? sevTone(extractSeverityLevel(item), isDark, isEn) : null
  const tp = tipeTone(item.tipe, isDark, isEn)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`${tr('Detail laporan', 'Report detail')}: ${item.judul}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(8,20,14,.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'lp-backdrop .22s ease forwards',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          background: t.surface,
          borderTop: `1px solid ${t.border}`,
          borderRadius: '28px 28px 0 0',
          padding: '0 20px calc(24px + env(safe-area-inset-bottom))',
          maxHeight: '88dvh',
          overflowY: 'auto',
          animation: 'lp-sheet .3s cubic-bezier(.32,.72,0,1) forwards',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 999, background: t.borderInput, margin: '12px auto 18px' }} />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Chip fg={k.fg} soft={k.soft} line={k.line}>{k.label}</Chip>
            <Chip fg={tp.fg} soft={tp.soft} line={tp.line}>{tp.label}</Chip>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr('Tutup', 'Close')}
            className="psmb-back"
            style={{
              width: 36,
              height: 36,
              minWidth: 36,
              borderRadius: '50%',
              background: t.primarySoft,
              border: isDark ? '1px solid #22443A' : '1px solid #CFE6DA',
              color: t.primaryText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <IconX size={15} />
          </button>
        </div>

        {/* Judul */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <IconBubble grad={k.grad} glow={k.glow} size={56}>
            <k.Icon size={26} />
          </IconBubble>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: t.text, lineHeight: 1.35, letterSpacing: '-.01em', wordBreak: 'break-word' }}>
              {item.judul}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {item.created_at && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 500, color: t.muted }}>
                  <span style={{ display: 'flex', color: t.primaryText }}><IconCalendar size={13} /></span>
                  {formatTanggal(item.created_at, isEn)}
                </span>
              )}
              {sev && <Chip fg={sev.fg} soft={sev.soft} line={sev.line} dot={sev.dot}>{sev.label}</Chip>}
            </div>
          </div>
        </div>

        {/* Keterangan */}
        {item.deskripsi && (
          <div
            style={{
              background: t.surfaceAlt,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              padding: '14px 16px',
              marginBottom: 16,
            }}
          >
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 800, color: t.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {tr('Keterangan', 'Description')}
            </p>
            <p style={{ margin: 0, fontSize: 14, color: t.label, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {item.deskripsi}
            </p>
          </div>
        )}

        {/* Unduh */}
        {item.file_url && (
          <a
            href={item.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              minHeight: 50,
              padding: '14px 18px',
              borderRadius: 14,
              background: t.gradient,
              boxShadow: t.shadowBtn,
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              marginBottom: 10,
            }}
          >
            <IconDownload size={16} />
            <span>{tr('Unduh Dokumen Laporan', 'Download Report Document')}</span>
            <IconExternal size={14} />
          </a>
        )}

        <button
          type="button"
          onClick={onClose}
          className="lp-btn"
          style={{
            width: '100%',
            minHeight: 50,
            padding: '14px 18px',
            borderRadius: 14,
            border: `1px solid ${t.borderInput}`,
            background: t.surface,
            color: t.label,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          {tr('Tutup', 'Close')}
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   FILTER
   ════════════════════════════════════════════════════════════════ */
const FILTER_OPTIONS = [
  { value: 'semua',   id: 'Semua',   en: 'All' },
  { value: 'bulanan', id: 'Bulanan', en: 'Monthly' },
  { value: 'tahunan', id: 'Tahunan', en: 'Annual' },
  { value: 'khusus',  id: 'Khusus',  en: 'Special' },
]

const PAGE_CSS = `
@keyframes lp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
@keyframes lp-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes lp-backdrop { from { opacity: 0; } to { opacity: 1; } }
@keyframes lp-sheet { from { transform: translateY(100%); opacity: .6; } to { transform: translateY(0); opacity: 1; } }
.psmb-back { transition: transform .12s ease, background-color .15s ease; -webkit-tap-highlight-color: transparent; }
.psmb-back:active { transform: scale(.94); }
.lp-btn { transition: transform .12s ease, filter .15s ease; -webkit-tap-highlight-color: transparent; }
.lp-btn:active { transform: scale(.98); }
.lp-tab { transition: background .15s ease, color .15s ease, box-shadow .15s ease, transform .12s ease; -webkit-tap-highlight-color: transparent; }
.lp-tab:active { transform: scale(.97); }
.lp-card { transition: transform .15s ease, box-shadow .15s ease; -webkit-tap-highlight-color: transparent; }
.lp-card:active { transform: scale(.985); }
@media (hover: hover) { .lp-card:hover { transform: translateY(-2px); } }
`

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function LaporanPage() {
  const { isDark, isEn, t, tr } = useUi()

  const [items, setItems] = useState<LaporanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('semua')
  const [selected, setSelected] = useState<LaporanItem | null>(null)

  const load = useCallback(async (tipe: string) => {
    setLoading(true)
    setError(null)
    try {
      const q = tipe !== 'semua' ? `?tipe=${tipe}` : ''
      const res = await fetch(`/api/siswa/laporan${q}`)
      const json = await res.json()
      if (res.ok) {
        setItems(json.data ?? [])
      } else {
        setError(json.error || tr('Gagal memuat laporan', 'Failed to load reports'))
      }
    } catch {
      setError(tr('Terjadi kesalahan saat memuat laporan', 'An error occurred while loading reports'))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEn])

  useEffect(() => {
    load(filter)
  }, [filter, load])

  const handleClose = useCallback(() => setSelected(null), [])
  const activeFilterLabel = FILTER_OPTIONS.find(f => f.value === filter)
  const activeLabel = activeFilterLabel ? (isEn ? activeFilterLabel.en : activeFilterLabel.id) : ''

  return (
    <>
      <style>{PAGE_CSS}</style>

      <div
        style={{
          position: 'relative',
          maxWidth: 430,
          margin: '0 auto',
          minHeight: '100dvh',
          background: t.bg,
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {/* ══ HEADER — identik dengan halaman Pendaftaran ══ */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: HEADER_HEIGHT,
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
            aria-label={tr('Kembali', 'Back')}
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
              {tr('Laporan Santri', 'Student Report')}
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
              {tr('Pantau perkembangan dan pencapaian santri', "Track the student's progress and achievements")}
            </p>
          </div>
        </div>

        {/* ══ BODY ══ */}
        <div
          style={{
            padding: '16px 16px',
            paddingBottom: SISWA_NAV_HEIGHT + 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <GreetingBanner />

          {/* Filter tabs */}
          <div
            role="tablist"
            style={{
              ...getCardStyle(isDark),
              borderRadius: 16,
              padding: 4,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 4,
            }}
          >
            {FILTER_OPTIONS.map(f => {
              const active = filter === f.value
              return (
                <button
                  key={f.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className="lp-tab"
                  onClick={() => setFilter(f.value)}
                  style={{
                    padding: '10px 2px',
                    minHeight: 40,
                    fontSize: 12.5,
                    fontWeight: active ? 800 : 600,
                    color: active ? '#FFFFFF' : t.muted,
                    background: active ? t.gradient : 'transparent',
                    boxShadow: active ? '0 4px 10px rgba(15,107,74,.24)' : 'none',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit',
                  }}
                >
                  {isEn ? f.en : f.id}
                </button>
              )
            })}
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                background: isDark ? '#2e1a1a' : '#FEECEC',
                border: `1px solid ${isDark ? '#4a1a1a' : '#F5A9A9'}`,
                borderRadius: 14,
                padding: '12px 14px',
                color: isDark ? '#fca5a5' : '#B42318',
                fontSize: 13.5,
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ display: 'flex', flexShrink: 0 }}><IconAlertTriangle size={17} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>{error}</span>
              <button
                type="button"
                onClick={() => load(filter)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  fontWeight: 800,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {tr('Coba lagi', 'Retry')}
              </button>
            </div>
          )}

          {/* Ringkasan */}
          {!loading && items.length > 0 && <StatsCard items={items} />}

          {/* Detail Laporan */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: t.text, letterSpacing: '-.01em' }}>
                {tr('Detail Laporan', 'Report Details')}
              </h2>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  background: t.primarySoft,
                  color: t.primaryText,
                }}
              >
                {items.length} {tr('laporan', 'reports')}
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  ...getCardStyle(isDark),
                  padding: '40px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  animation: 'lp-fade .3s ease both',
                }}
              >
                <span
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: t.primarySoft,
                    color: t.primaryText,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconInbox size={28} />
                </span>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: t.text }}>
                    {tr('Belum ada laporan', 'No reports yet')}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: t.muted, lineHeight: 1.5 }}>
                    {filter !== 'semua'
                      ? tr(`Tidak ada laporan dengan tipe "${activeLabel}"`, `No "${activeLabel}" reports found`)
                      : tr('Laporan akan muncul di sini saat tersedia', 'Reports will appear here when available')}
                  </p>
                </div>
                {filter !== 'semua' && (
                  <button
                    type="button"
                    className="lp-btn"
                    onClick={() => setFilter('semua')}
                    style={{
                      marginTop: 2,
                      padding: '10px 18px',
                      borderRadius: 999,
                      background: t.primarySoft,
                      border: isDark ? '1px solid #22443A' : '1px solid #CFE6DA',
                      color: t.primaryText,
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    {tr('Tampilkan semua', 'Show all')}
                  </button>
                )}
              </div>
            ) : (
              <div key={filter} style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'lp-fade .3s ease both' }}>
                {items.map(item => (
                  <LaporanCard key={item.id} item={item} onClick={setSelected} />
                ))}
              </div>
            )}
          </div>

          <KataBanner />
        </div>
      </div>

      {selected && <DetailModal item={selected} onClose={handleClose} />}
    </>
  )
}