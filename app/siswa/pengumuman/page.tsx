'use client'

// app/(siswa)/siswa/pengumuman/page.tsx
// Halaman daftar lengkap pengumuman untuk siswa.
// Menggunakan Client Component karena ada state filter & modal.

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Announcement {
  id: string
  judul: string
  tipe: 'Penting' | 'Informasi' | 'Info' | 'Peringatan'
  konten: string
  tanggal: string
  lampiran_url: string | null
  lampiran_nama: string | null
  created_at: string
}

// ── Config ─────────────────────────────────────────────────────────────────────
const TIPE_FILTERS = ['Semua', 'Penting', 'Informasi', 'Info', 'Peringatan'] as const

const TIPE_STYLE: Record<string, {
  pill: string; bar: string; icon: string;
  bg: string; border: string; color: string;
}> = {
  Penting:    { pill: 'bg-red-50 text-red-600 border border-red-200',       bar: '#e11d48', icon: '🔴', bg: '#fff1f2', border: '#fecdd3', color: '#e11d48'  },
  Informasi:  { pill: 'bg-blue-50 text-blue-600 border border-blue-200',     bar: '#2563eb', icon: '🔵', bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb'  },
  Info:       { pill: 'bg-green-50 text-green-600 border border-green-200',  bar: '#16a34a', icon: '🟢', bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a'  },
  Peringatan: { pill: 'bg-amber-50 text-amber-600 border border-amber-200',  bar: '#d97706', icon: '🟡', bg: '#fffbeb', border: '#fde68a', color: '#d97706'  },
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch { return iso }
}
function formatTanggalShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PengumumanSiswaPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState<string>('Semua')
  const [selected, setSelected]           = useState<Announcement | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (filter !== 'Semua') params.set('tipe', filter)
      const res  = await fetch(`/api/siswa/announcements?${params}`)
      const json = await res.json()
      if (res.ok) setAnnouncements(json.data ?? [])
    } catch (e) {
      console.error('Failed to fetch announcements', e)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchData() }, [fetchData])

  // Group by tipe count
  const countByTipe = announcements.reduce<Record<string, number>>((acc, a) => {
    acc[a.tipe] = (acc[a.tipe] ?? 0) + 1
    return acc
  }, {})

  return (
    <div style={S.shell}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={S.header}>
        <div style={S.orbA} />
        <div style={S.orbB} />
        <div style={S.headerContent}>
          <Link href="/siswa/dashboard" style={S.backBtn}>
            ← Beranda
          </Link>
          <h1 style={S.headerTitle}>📢 Pengumuman</h1>
          <p style={S.headerSub}>Informasi & pengumuman dari sekolah</p>
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────────── */}
      <div style={S.statsRow}>
        {(['Penting', 'Informasi', 'Info', 'Peringatan'] as const).map((t) => {
          const cfg = TIPE_STYLE[t]
          return (
            <button
              key={t}
              style={{
                ...S.statChip,
                background: cfg.bg,
                border: `1.5px solid ${cfg.border}`,
                color: cfg.color,
                ...(filter === t ? S.statChipActive : {}),
              }}
              onClick={() => setFilter(t)}
            >
              <span style={{ fontSize: 12 }}>{cfg.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{t}</span>
              {countByTipe[t] ? (
                <span style={{ ...S.statBadge, background: cfg.color }}>
                  {countByTipe[t]}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────── */}
      <div style={S.filterRow}>
        {TIPE_FILTERS.map((t) => (
          <button
            key={t}
            style={{
              ...S.filterBtn,
              ...(filter === t ? S.filterBtnActive : {}),
            }}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div style={S.content}>
        {loading ? (
          /* Skeleton */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4].map((i) => (
              <div key={i} style={S.skeleton}>
                <div style={S.skelAccent} />
                <div style={{ flex: 1, padding: '14px 14px 14px 0' }}>
                  <div style={{ ...S.skelLine, width: 70, height: 16, borderRadius: 999 }} />
                  <div style={{ ...S.skelLine, width: '80%', height: 13, marginTop: 8 }} />
                  <div style={{ ...S.skelLine, width: '55%', height: 11, marginTop: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div style={S.emptyWrap}>
            <span style={{ fontSize: 40 }}>📭</span>
            <p style={S.emptyTitle}>Belum ada pengumuman</p>
            <p style={S.emptySub}>
              {filter !== 'Semua'
                ? `Tidak ada pengumuman bertipe "${filter}" saat ini.`
                : 'Belum ada pengumuman dari sekolah.'}
            </p>
            {filter !== 'Semua' && (
              <button style={S.emptyBtn} onClick={() => setFilter('Semua')}>
                Tampilkan Semua
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {announcements.map((ann, idx) => {
              const cfg = TIPE_STYLE[ann.tipe] ?? TIPE_STYLE.Informasi
              return (
                <button
                  key={ann.id}
                  style={{
                    ...S.card,
                    animationDelay: `${idx * 0.04}s`,
                  }}
                  onClick={() => setSelected(ann)}
                  className="ann-card-btn"
                >
                  {/* Left accent bar */}
                  <div style={{ ...S.cardBar, background: cfg.bar }} />

                  {/* Body */}
                  <div style={S.cardBody}>
                    {/* Pill + date row */}
                    <div style={S.cardTopRow}>
                      <span style={{ ...S.tipeChip, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.icon} {ann.tipe}
                      </span>
                      <span style={S.cardDate}>{formatTanggalShort(ann.tanggal)}</span>
                    </div>

                    {/* Title */}
                    <p style={S.cardTitle}>{ann.judul}</p>

                    {/* Preview */}
                    <p style={S.cardPreview}>
                      {ann.konten.length > 100 ? ann.konten.slice(0, 100) + '…' : ann.konten}
                    </p>

                    {/* Attachment hint */}
                    {ann.lampiran_url && (
                      <span style={S.cardAtt}>
                        🔗 {ann.lampiran_nama || 'Lampiran tersedia'}
                      </span>
                    )}
                  </div>

                  {/* Chevron */}
                  <svg style={S.cardChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      {selected && (
        <div
          style={S.backdrop}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null) }}
          role="dialog"
          aria-modal="true"
        >
          <div style={S.sheet}>
            {/* Handle */}
            <div style={S.handle} />

            {/* Header row */}
            {(() => {
              const cfg = TIPE_STYLE[selected.tipe] ?? TIPE_STYLE.Informasi
              return (
                <>
                  <div style={S.sheetHeaderRow}>
                    <span style={{ ...S.tipeChip, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.icon} {selected.tipe}
                    </span>
                    <button style={S.closeBtn} onClick={() => setSelected(null)} aria-label="Tutup">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>

                  {/* Title */}
                  <h2 style={S.sheetTitle}>{selected.judul}</h2>

                  {/* Date */}
                  <p style={S.sheetDate}>
                    📅 {formatTanggal(selected.tanggal)}
                  </p>

                  <div style={S.sheetDivider} />

                  {/* Content */}
                  <p style={S.sheetContent}>{selected.konten}</p>

                  {/* Attachment */}
                  {selected.lampiran_url && (
                    <a
                      href={selected.lampiran_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={S.sheetAtt}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                      <span>{selected.lampiran_nama || 'Buka Lampiran'}</span>
                      <span style={{ marginLeft: 'auto' }}>↗</span>
                    </a>
                  )}

                  {/* Close button */}
                  <button style={S.sheetCloseBtn} onClick={() => setSelected(null)}>
                    Tutup
                  </button>
                </>
              )
            })()}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sheetUp {
          from { transform: translateY(100%); opacity: 0.6; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; } 50% { opacity: 0.45; }
        }
        .ann-card-btn { animation: fadeSlideUp 0.4s ease forwards; opacity: 0; }
        .ann-card-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,58,138,0.1) !important; }
      `}</style>
    </div>
  )
}

// ── Inline styles object ──────────────────────────────────────────────────────
// (Satu file, no external CSS dependencies, mudah di-copy)
const S: Record<string, React.CSSProperties> = {
  shell: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: '#f0f4ff',
    minHeight: '100vh',
    paddingBottom: '5rem',
  },

  // Header hero
  header: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1e3a8a, #2563eb, #4f46e5)',
    padding: '3rem 1.25rem 3.5rem',
    borderRadius: '0 0 2rem 2rem',
  },
  orbA: {
    position: 'absolute', width: 200, height: 200, borderRadius: '50%',
    background: '#60a5fa', filter: 'blur(50px)', opacity: 0.25,
    top: -60, right: -50, pointerEvents: 'none',
  },
  orbB: {
    position: 'absolute', width: 130, height: 130, borderRadius: '50%',
    background: '#818cf8', filter: 'blur(35px)', opacity: 0.2,
    bottom: -40, left: -30, pointerEvents: 'none',
  },
  headerContent: { position: 'relative', zIndex: 2 },
  backBtn: {
    display: 'inline-block', fontSize: 13, fontWeight: 700,
    color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
    marginBottom: '1rem',
    padding: '0.3rem 0.8rem',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    backdropFilter: 'blur(4px)',
  },
  headerTitle: {
    fontSize: '1.7rem', fontWeight: 800, color: 'white',
    letterSpacing: '-0.02em', margin: '0 0 0.35rem',
  },
  headerSub: {
    fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', margin: 0,
  },

  // Stats
  statsRow: {
    display: 'flex', gap: 8, padding: '1rem 1rem 0.5rem',
    overflowX: 'auto' as const,
    msOverflowStyle: 'none',
    scrollbarWidth: 'none' as const,
  },
  statChip: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '0.4rem 0.7rem', borderRadius: 999,
    cursor: 'pointer', whiteSpace: 'nowrap' as const,
    fontFamily: 'inherit', transition: 'transform 0.15s',
    flexShrink: 0,
  },
  statChipActive: { transform: 'scale(1.04)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  statBadge: {
    color: 'white', fontSize: 9, fontWeight: 800,
    borderRadius: 999, padding: '1px 5px', minWidth: 16, textAlign: 'center' as const,
  },

  // Filter tabs
  filterRow: {
    display: 'flex', gap: 6, padding: '0.5rem 1rem 0.75rem',
    overflowX: 'auto' as const, scrollbarWidth: 'none' as const,
  },
  filterBtn: {
    padding: '0.4rem 0.9rem', borderRadius: 999,
    border: '1.5px solid #e2e8f0', background: 'white',
    fontSize: 12, fontWeight: 600, color: '#64748b',
    cursor: 'pointer', whiteSpace: 'nowrap' as const,
    fontFamily: 'inherit', transition: 'all 0.15s', flexShrink: 0,
  },
  filterBtnActive: {
    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    color: 'white', border: '1.5px solid transparent',
    boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
  },

  // Content
  content: { padding: '0 1rem' },

  // Card
  card: {
    width: '100%', display: 'flex', alignItems: 'stretch',
    borderRadius: '1rem', border: '1.5px solid #e2e8f0',
    background: 'white', cursor: 'pointer', textAlign: 'left' as const,
    overflow: 'hidden', boxShadow: '0 2px 8px rgba(30,58,138,0.05)',
    transition: 'transform 0.18s, box-shadow 0.18s',
    fontFamily: 'inherit',
  },
  cardBar: { width: 5, flexShrink: 0 },
  cardBody: {
    flex: 1, padding: '14px 12px 14px 12px',
    display: 'flex', flexDirection: 'column' as const, gap: 5,
  },
  cardTopRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 8,
  },
  tipeChip: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
    textTransform: 'uppercase' as const, padding: '0.2rem 0.5rem',
    borderRadius: 999,
  },
  cardDate: { fontSize: 10, fontWeight: 600, color: '#94a3b8', flexShrink: 0 },
  cardTitle: {
    fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.35, margin: 0,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
  },
  cardPreview: {
    fontSize: 12, color: '#64748b', lineHeight: 1.55, margin: 0,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
  },
  cardAtt: {
    fontSize: 11, color: '#2563eb', fontWeight: 600, marginTop: 2,
  },
  cardChevron: { color: '#cbd5e1', alignSelf: 'center', marginRight: 12, flexShrink: 0 },

  // Skeleton
  skeleton: {
    display: 'flex', borderRadius: '1rem', background: 'white',
    border: '1.5px solid #f1f5f9', overflow: 'hidden',
    animation: 'shimmer 1.6s ease-in-out infinite',
  },
  skelAccent: { width: 5, background: '#f1f5f9', flexShrink: 0 },
  skelLine:   { background: '#f1f5f9', borderRadius: 6, height: 12 },

  // Empty
  emptyWrap: {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
    justifyContent: 'center', padding: '3rem 1rem', gap: '0.5rem',
    background: 'white', borderRadius: '1.25rem',
    border: '1.5px dashed #e2e8f0', textAlign: 'center' as const,
  },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: '#334155', margin: 0 },
  emptySub:   { fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.55 },
  emptyBtn: {
    marginTop: 8, padding: '0.6rem 1.2rem', borderRadius: 999,
    background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white',
    fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // Modal / sheet
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(15,23,42,0.5)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    animation: 'backdropIn 0.22s ease forwards',
    backdropFilter: 'blur(4px)',
  },
  sheet: {
    width: '100%', maxWidth: 480,
    background: 'white', borderRadius: '1.75rem 1.75rem 0 0',
    padding: '0 1.25rem 2.5rem',
    animation: 'sheetUp 0.28s cubic-bezier(0.32,0.72,0,1) forwards',
    maxHeight: '88vh', overflowY: 'auto' as const,
  },
  handle: {
    width: 40, height: 4, borderRadius: 999, background: '#e2e8f0',
    margin: '1rem auto 1.25rem',
  },
  sheetHeaderRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '0.9rem',
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 10,
    border: '1.5px solid #e2e8f0', background: '#f8fafc',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#64748b', fontFamily: 'inherit',
  },
  sheetTitle: {
    fontSize: '1.18rem', fontWeight: 800, color: '#0f172a',
    lineHeight: 1.35, margin: '0 0 0.5rem', letterSpacing: '-0.01em',
  },
  sheetDate: { fontSize: 12, color: '#94a3b8', fontWeight: 600, margin: '0 0 0' },
  sheetDivider: { height: 1, background: '#f1f5f9', margin: '1rem 0' },
  sheetContent: {
    fontSize: 14, color: '#374151', lineHeight: 1.8,
    whiteSpace: 'pre-wrap' as const, margin: '0 0 1.25rem',
  },
  sheetAtt: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '0.85rem 1rem', borderRadius: '1rem',
    background: '#eff6ff', border: '1.5px solid #bfdbfe',
    color: '#2563eb', fontSize: 13, fontWeight: 700,
    textDecoration: 'none', marginBottom: '1.25rem',
  },
  sheetCloseBtn: {
    width: '100%', padding: '0.9rem', borderRadius: '1rem',
    border: '1.5px solid #e2e8f0', background: '#f8fafc',
    fontSize: 14, fontWeight: 700, color: '#64748b',
    cursor: 'pointer', fontFamily: 'inherit',
  },
}