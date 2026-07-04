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

// ─── Icon Config per Type ─────────────────────────────────────────────────────
export const typeConfig: Record<
  AktivitasType,
  { icon: string; bg: string; color: string; dot: string }
> = {
  pendaftar_baru: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>`,
    bg: '#ede9fe', color: '#6d28d9', dot: '#7c3aed',
  },
  diverifikasi: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>`,
    bg: '#d1fae5', color: '#059669', dot: '#10b981',
  },
  diterima: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`,
    bg: '#d1fae5', color: '#059669', dot: '#10b981',
  },
  berkas_update: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>`,
    bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6',
  },
  pembayaran: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>`,
    bg: '#fef3c7', color: '#d97706', dot: '#f59e0b',
  },
  ditolak: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`,
    bg: '#fee2e2', color: '#dc2626', dot: '#ef4444',
  },
  diproses: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>`,
    bg: '#e0e7ff', color: '#4338ca', dot: '#6366f1',
  },
}

// ─── Skeleton Component ───────────────────────────────────────────────────────
export function SkeletonItem() {
  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'center',
      padding: '14px 14px', borderRadius: 16,
      background: '#fff', border: '1px solid #f1f5f9',
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          height: 14, width: '65%', borderRadius: 6, marginBottom: 8,
          background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
        <div style={{
          height: 11, width: '40%', borderRadius: 6,
          background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
      </div>
      <div style={{
        height: 11, width: 50, borderRadius: 6,
        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
    </div>
  )
}

// ─── Activity Row ─────────────────────────────────────────────────────────────
export function ActivityRow({ item, index }: { item: AktivitasItem; index: number }) {
  const cfg = typeConfig[item.type] ?? typeConfig.diproses
  return (
    <div
      className="activity-row"
      style={{
        display: 'flex', gap: 14, alignItems: 'flex-start',
        padding: '14px 14px',
        borderRadius: 16,
        background: '#fff',
        border: '1px solid #f1f5f9',
        animation: 'fadeSlideIn 0.4s ease both',
        animationDelay: `${index * 50}ms`,
        transition: 'background 0.15s',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{ width: 22, height: 22, color: cfg.color }}
          dangerouslySetInnerHTML={{ __html: cfg.icon }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <p style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 700,
          color: '#1e1b4b',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
        }}>
          {item.name}
        </p>
        <p style={{
          margin: '4px 0 0', fontSize: 12.5,
          color: '#94a3b8', fontWeight: 500, lineHeight: 1.4,
        }}>
          {item.sub}
        </p>
      </div>

      {/* Time + dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0, paddingTop: 2 }}>
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' as const }}>{item.time}</span>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: cfg.dot,
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
  .activity-row:hover {
    background: #fafbff !important;
    box-shadow: 0 2px 10px rgba(15,23,42,0.05);
  }
`