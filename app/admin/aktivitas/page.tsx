'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
type AktivitasType =
  | 'pendaftar_baru'
  | 'diverifikasi'
  | 'berkas_update'
  | 'pembayaran'
  | 'ditolak'
  | 'diterima'
  | 'diproses'

interface AktivitasItem {
  id:     string
  type:   AktivitasType
  name:   string
  sub:    string
  time:   string
  raw_at: string
}

// ─── Icon Config per Type ─────────────────────────────────────────────────────
const typeConfig: Record<
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
function SkeletonItem() {
  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'center',
      padding: '14px 0', borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
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
function ActivityRow({ item, index }: { item: AktivitasItem; index: number }) {
  const cfg = typeConfig[item.type] ?? typeConfig.diproses
  return (
    <div
      style={{
        display: 'flex', gap: 14, alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid #f8fafc',
        animation: 'fadeSlideIn 0.4s ease both',
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 2px 8px ${cfg.bg}`,
      }}>
        <div style={{ width: 22, height: 22, color: cfg.color }}
          dangerouslySetInnerHTML={{ __html: cfg.icon }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: '#0f172a',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.name}
        </p>
        <p style={{
          margin: '3px 0 0', fontSize: 12,
          color: '#94a3b8', fontWeight: 500,
        }}>
          {item.sub}
        </p>
      </div>

      {/* Time + dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{item.time}</span>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: cfg.dot,
          boxShadow: `0 0 6px ${cfg.dot}80`,
        }} />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AktivitasPage() {
  const [items, setItems]     = useState<AktivitasItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/aktivitas?limit=20')
      .then(r => r.json())
      .then(d => {
        setItems(d.data ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError('Gagal memuat aktivitas')
        setLoading(false)
      })
  }, [])

  // Derived stats
  const totalAktivitas  = items.length
  const pendaftarBaru   = items.filter(i => i.type === 'pendaftar_baru').length
  const verifikasi      = items.filter(i => ['diverifikasi', 'diterima'].includes(i.type)).length
  const pembayaranCount = items.filter(i => i.type === 'pembayaran').length

  const stats = [
    { icon: '📋', value: totalAktivitas,  label: 'Total Aktivitas' },
    { icon: '👤', value: pendaftarBaru,   label: 'Pendaftar Baru'  },
    { icon: '✅', value: verifikasi,       label: 'Verifikasi'      },
    { icon: '💳', value: pembayaranCount, label: 'Pembayaran'      },
  ]

  return (
    <div>
      <style>{`
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
          border-radius: 12px;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Hero Banner — sama persis desain_aktivitas.png ───────── */}
        <div style={{
          background: 'linear-gradient(135deg, #eeeaf8 0%, #e9e4f6 50%, #ece7f7 100%)',
          borderRadius: 0,
          padding: '28px 24px',
          display: 'flex', alignItems: 'center', gap: 20,
          position: 'relative', overflow: 'hidden',
          minHeight: 112,
          marginLeft: -16,
          marginRight: -16,
          marginTop: -16,
        }}>
          {/* Dekorasi garis gelombang di pojok kanan */}
          <svg
            style={{
              position: 'absolute', right: 0, top: 0,
              height: '100%', width: 210,
              opacity: 0.22, pointerEvents: 'none',
            }}
            viewBox="0 0 210 120" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMaxYMid slice"
          >
            <path d="M250 5 C220 30, 190 20, 200 55 C210 90, 170 100, 160 118" stroke="#7c3aed" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
            <path d="M270 -5 C240 22, 210 15, 220 50 C230 85, 188 98, 178 120" stroke="#7c3aed" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
            <path d="M290 -15 C258 14, 228 10, 240 46 C252 80, 208 96, 196 122" stroke="#7c3aed" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M310 -25 C276 6, 246 5, 258 42 C270 75, 226 94, 214 124" stroke="#7c3aed" strokeWidth="1.0" fill="none" strokeLinecap="round"/>
            <path d="M330 -35 C294 -2, 264 0, 276 38 C288 70, 244 92, 232 126" stroke="#7c3aed" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
            <path d="M350 -45 C312 -10, 282 -5, 294 34 C306 65, 262 90, 250 128" stroke="#7c3aed" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
          </svg>

          {/* Icon clipboard — kotak putih rounded */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 16px rgba(109,40,217,0.10)',
            zIndex: 1,
          }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Clipboard body */}
              <rect x="4" y="4" width="16" height="17" rx="2" fill="#7c3aed"/>
              {/* Clip tab at top */}
              <rect x="8" y="2" width="8" height="4" rx="1.5" fill="#7c3aed"/>
              <rect x="8.5" y="2.5" width="7" height="3" rx="1" fill="#c4b5fd"/>
              {/* Lines on clipboard */}
              <rect x="7" y="9"  width="6" height="1.5" rx="0.75" fill="white"/>
              <rect x="7" y="12" width="10" height="1.5" rx="0.75" fill="white"/>
              <rect x="7" y="15" width="8" height="1.5" rx="0.75" fill="white"/>
            </svg>
          </div>

          {/* Teks */}
          <div style={{ zIndex: 1 }}>
            <h1 style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: '#1a1033',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}>
              Aktivitas
            </h1>
            <p style={{
              margin: '6px 0 0',
              fontSize: 13,
              color: '#7c6fa0',
              fontWeight: 400,
              lineHeight: 1.4,
            }}>
              Log aktivitas terbaru dan tindakan admin
            </p>
          </div>
        </div>

        {/* ── Section Header ──────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#ede9fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1e1b4b' }}>Aktivitas Terbaru</span>
          </div>
          <Link href="/admin/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: '#7c3aed', textDecoration: 'none',
            fontWeight: 700, fontSize: 13,
          }}>
            Lihat semua
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        </div>

        {/* ── Activity List Card ───────────────────────────────────── */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '4px 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9',
        }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
          ) : error ? (
            <div style={{
              textAlign: 'center', padding: '40px 0',
              color: '#ef4444', fontSize: 14, fontWeight: 500,
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
              {error}
            </div>
          ) : items.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 0',
              color: '#94a3b8', fontSize: 14,
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
              Belum ada aktivitas
            </div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id}
                className="activity-row"
                style={{ transition: 'background 0.15s' }}
              >
                <ActivityRow item={item} index={i} />
              </div>
            ))
          )}
        </div>

        {/* ── Stats Summary Card ───────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
          borderRadius: 20,
          padding: '20px 16px',
          boxShadow: '0 8px 32px rgba(109,40,217,0.25)',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
          }}>
            {stats.map((s, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: 14,
                  padding: '12px 8px',
                  textAlign: 'center',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                  animation: 'fadeSlideIn 0.5s ease both',
                  animationDelay: `${i * 80 + 200}ms`,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}>
                  {loading ? '—' : s.value}
                </div>
                <div style={{
                  fontSize: 10, color: 'rgba(255,255,255,0.75)',
                  fontWeight: 600, marginTop: 4,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}