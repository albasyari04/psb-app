// app/admin/aktivitas/_components/shared.tsx
'use client'

// ─── Types ────────────────────────────────────────────────────────────────────
export type AktivitasType =
  | 'pendaftar_baru'
  | 'diverifikasi'
  | 'berkas_update'
  | 'pembayaran'
  | 'ditolak'
  | 'diterima'
  | 'diproses'

export interface AktivitasItem {
  id:     string
  type:   AktivitasType
  name:   string
  sub:    string
  time:   string
  raw_at: string
}

// ─── Icon Config per Type (dengan dukungan dark mode) ─────────────────────
export const typeConfig: Record<
  AktivitasType,
  { icon: string; bg: string; bgDark: string; color: string; colorDark: string; dot: string; dotDark: string; label: string; labelEn: string }
> = {
  pendaftar_baru: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>`,
    bg: '#ede9fe', bgDark: '#2e2a40',
    color: '#6d28d9', colorDark: '#a5b4fc',
    dot: '#7c3aed', dotDark: '#7c3aed',
    label: 'Pendaftar Baru', labelEn: 'New Applicant',
  },
  diverifikasi: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>`,
    bg: '#d1fae5', bgDark: '#1a2e1a',
    color: '#059669', colorDark: '#34d399',
    dot: '#10b981', dotDark: '#34d399',
    label: 'Diverifikasi', labelEn: 'Verified',
  },
  diterima: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`,
    bg: '#d1fae5', bgDark: '#1a2e1a',
    color: '#059669', colorDark: '#34d399',
    dot: '#10b981', dotDark: '#34d399',
    label: 'Diterima', labelEn: 'Accepted',
  },
  berkas_update: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>`,
    bg: '#dbeafe', bgDark: '#1a2a3d',
    color: '#1d4ed8', colorDark: '#60a5fa',
    dot: '#3b82f6', dotDark: '#60a5fa',
    label: 'Berkas Update', labelEn: 'Document Update',
  },
  pembayaran: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>`,
    bg: '#fef3c7', bgDark: '#2e2a1a',
    color: '#d97706', colorDark: '#fbbf24',
    dot: '#f59e0b', dotDark: '#fbbf24',
    label: 'Pembayaran', labelEn: 'Payment',
  },
  ditolak: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`,
    bg: '#fee2e2', bgDark: '#2e1a1a',
    color: '#dc2626', colorDark: '#fca5a5',
    dot: '#ef4444', dotDark: '#fca5a5',
    label: 'Ditolak', labelEn: 'Rejected',
  },
  diproses: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>`,
    bg: '#e0e7ff', bgDark: '#1a1a3d',
    color: '#4338ca', colorDark: '#818cf8',
    dot: '#6366f1', dotDark: '#818cf8',
    label: 'Diproses', labelEn: 'Processing',
  },
}

// ─── Helper: Format relative time with i18n ─────────────────────────────────
export function formatRelativeTime(dateStr: string, isEn: boolean): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return isEn ? 'Just now' : 'Baru saja'
  if (diffMin < 60) return isEn ? `${diffMin}m ago` : `${diffMin} menit lalu`
  if (diffHour < 24) return isEn ? `${diffHour}h ago` : `${diffHour} jam lalu`
  if (diffDay < 7) return isEn ? `${diffDay}d ago` : `${diffDay} hari lalu`
  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7)
    return isEn ? `${weeks}w ago` : `${weeks} minggu lalu`
  }
  if (diffDay < 365) {
    const months = Math.floor(diffDay / 30)
    return isEn ? `${months}mo ago` : `${months} bulan lalu`
  }
  const years = Math.floor(diffDay / 365)
  return isEn ? `${years}y ago` : `${years} tahun lalu`
}

// ─── Skeleton Component ───────────────────────────────────────────────────────
export function SkeletonItem({ dark = false }: { dark?: boolean }) {
  const cardBg = dark ? '#1e1b2e' : '#fff'
  const cardBorder = dark ? '1px solid #2e2a40' : '1px solid #f1f5f9'
  const shimmerBg = dark ? '#2e2a40' : '#f1f5f9'
  const shimmerBg2 = dark ? '#3d3655' : '#e2e8f0'

  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'center',
      padding: '14px 14px', borderRadius: 16,
      background: cardBg, border: cardBorder,
      boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        backgroundImage: `linear-gradient(90deg, ${shimmerBg} 25%, ${shimmerBg2} 50%, ${shimmerBg} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          height: 14, width: '65%', borderRadius: 6, marginBottom: 8,
          backgroundImage: `linear-gradient(90deg, ${shimmerBg} 25%, ${shimmerBg2} 50%, ${shimmerBg} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
        <div style={{
          height: 11, width: '40%', borderRadius: 6,
          backgroundImage: `linear-gradient(90deg, ${shimmerBg} 25%, ${shimmerBg2} 50%, ${shimmerBg} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
      </div>
      <div style={{
        height: 11, width: 50, borderRadius: 6,
        backgroundImage: `linear-gradient(90deg, ${shimmerBg} 25%, ${shimmerBg2} 50%, ${shimmerBg} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
    </div>
  )
}

// ─── Activity Row ─────────────────────────────────────────────────────────────
export function ActivityRow({ 
  item, 
  index, 
  dark = false,
  isEn = false
}: { 
  item: AktivitasItem; 
  index: number;
  dark?: boolean;
  isEn?: boolean;
}) {
  const cfg = typeConfig[item.type] ?? typeConfig.diproses
  
  const cardBg = dark ? '#1e1b2e' : '#fff'
  const cardBorder = dark ? '1px solid #2e2a40' : '1px solid #f1f5f9'
  const textColor = dark ? '#f1f0f5' : '#1e1b4b'
  const subColor = dark ? '#94a3b8' : '#94a3b8'
  const timeColor = dark ? '#6b6885' : '#94a3b8'
  const iconBg = dark ? cfg.bgDark : cfg.bg
  const iconColor = dark ? cfg.colorDark : cfg.color
  const dotColor = dark ? cfg.dotDark : cfg.dot
  const hoverBg = dark ? '#2e2a40' : '#fafbff'

  // Get label based on language
  const typeLabel = isEn ? cfg.labelEn : cfg.label

  return (
    <div
      className="activity-row"
      style={{
        display: 'flex', gap: 14, alignItems: 'flex-start',
        padding: '14px 14px',
        borderRadius: 16,
        background: cardBg,
        border: cardBorder,
        boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(15,23,42,0.05)',
        animation: 'fadeSlideIn 0.4s ease both',
        animationDelay: `${index * 50}ms`,
        transition: 'background 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBg
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = cardBg
      }}
    >
      {/* Icon */}
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{ width: 22, height: 22, color: iconColor }}
          dangerouslySetInnerHTML={{ __html: cfg.icon }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <p style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 700,
          color: textColor,
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
        }}>
          {item.name}
        </p>
        <p style={{
          margin: '4px 0 0',
          fontSize: 12.5,
          color: subColor,
          fontWeight: 500,
          lineHeight: 1.4,
        }}>
          {item.sub}
        </p>
        {/* Type badge */}
        <span style={{
          display: 'inline-block',
          marginTop: 5,
          fontSize: 9.5,
          fontWeight: 700,
          color: iconColor,
          background: dark ? `${iconColor}22` : iconBg,
          padding: '2px 10px',
          borderRadius: 20,
          letterSpacing: '0.02em',
        }}>
          {typeLabel}
        </span>
      </div>

      {/* Time + dot */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-end', 
        gap: 8, 
        flexShrink: 0, 
        paddingTop: 2 
      }}>
        <span style={{ 
          fontSize: 11.5, 
          color: timeColor, 
          fontWeight: 500, 
          whiteSpace: 'nowrap' as const 
        }}>
          {formatRelativeTime(item.raw_at, isEn)}
        </span>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: dotColor,
        }} />
      </div>
    </div>
  )
}

// ─── Shared page chrome bits ───────────────────────────────────────────────────
export const globalKeyframes = `
  @keyframes shimmer {
    0%   { background-position: 200% 0 }
    100% { background-position: -200% 0 }
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(8px) }
    to   { opacity: 1; transform: translateY(0) }
  }
`