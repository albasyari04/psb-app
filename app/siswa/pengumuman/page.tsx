'use client'

// app/(siswa)/siswa/pengumuman/page.tsx

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Announcement {
  id: string
  judul: string
  tipe: 'Penting' | 'Informasi' | 'Kegiatan' | 'Pengumuman'
  konten: string
  tanggal: string
  lampiran_url: string | null
  lampiran_nama: string | null
  created_at: string
}

// ── Tipe Config ────────────────────────────────────────────────────────────────
const TIPE_CONFIG: Record<string, {
  label: string; bg: string; border: string; color: string
  iconBg: string; iconSvg: string
}> = {
  Penting: {
    label: 'PENTING',
    bg: '#fff1f2', border: '#fecdd3', color: '#e11d48',
    iconBg: 'linear-gradient(135deg, #ff6b6b 0%, #e11d48 100%)',
    iconSvg: `<circle cx="12" cy="12" r="9" fill="none" stroke="white" stroke-width="2.2"/>
      <line x1="12" y1="8" x2="12" y2="13" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="12" cy="16.5" r="1.3" fill="white"/>`,
  },
  Informasi: {
    label: 'INFORMASI',
    bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb',
    iconBg: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
    iconSvg: `<rect x="5" y="3" width="14" height="18" rx="2.5" fill="none" stroke="white" stroke-width="1.9"/>
      <line x1="8.5" y1="8" x2="15.5" y2="8" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="8.5" y1="11.5" x2="15.5" y2="11.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="8.5" y1="15" x2="13" y2="15" stroke="white" stroke-width="1.8" stroke-linecap="round"/>`,
  },
  Kegiatan: {
    label: 'KEGIATAN',
    bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a',
    iconBg: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
    iconSvg: `<rect x="3" y="4" width="18" height="18" rx="2.5" fill="none" stroke="white" stroke-width="1.9"/>
      <line x1="3" y1="9.5" x2="21" y2="9.5" stroke="white" stroke-width="1.8"/>
      <line x1="8" y1="2" x2="8" y2="6.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="2" x2="16" y2="6.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <rect x="7" y="13" width="3" height="3" rx="0.8" fill="white"/>
      <rect x="10.5" y="13" width="3" height="3" rx="0.8" fill="white"/>`,
  },
  Pengumuman: {
    label: 'PENGUMUMAN',
    bg: '#faf5ff', border: '#e9d5ff', color: '#9333ea',
    iconBg: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)',
    iconSvg: `<path d="M20 6.5L4 12L20 17.5V6.5Z" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>
      <path d="M4 12V18.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M4 18.5C5.2 19.5 6.8 19.5 8 18.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/>`,
  },
}

const FILTER_TABS = ['Semua', 'Penting', 'Informasi', 'Kegiatan', 'Pengumuman'] as const

const FILTER_ICON_SVG: Record<string, string> = {
  Semua: `<rect x="3" y="3" width="7.5" height="7.5" rx="1.5" fill="currentColor"/>
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" fill="currentColor"/>
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" fill="currentColor"/>
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" fill="currentColor"/>`,
  Penting: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/>
    <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="12" cy="16.5" r="1.3" fill="currentColor"/>`,
  Informasi: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/>
    <line x1="12" y1="11" x2="12" y2="16.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="12" cy="7.5" r="1.3" fill="currentColor"/>`,
  Kegiatan: `<rect x="3" y="4" width="18" height="18" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="3" y1="9.5" x2="21" y2="9.5" stroke="currentColor" stroke-width="1.8"/>
    <line x1="8" y1="2" x2="8" y2="6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="16" y1="2" x2="16" y2="6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  Pengumuman: `<path d="M19 6L5 12L19 18V6Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <line x1="5" y1="12" x2="5" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
}

const FILTER_ACTIVE_COLOR: Record<string, string> = {
  Semua:      '#475569',
  Penting:    '#e11d48',
  Informasi:  '#2563eb',
  Kegiatan:   '#16a34a',
  Pengumuman: '#9333ea',
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch { return iso }
}
function formatShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

// ── Icon Box ───────────────────────────────────────────────────────────────────
function TipeIcon({ tipe, size = 48 }: { tipe: string; size?: number }) {
  const cfg = TIPE_CONFIG[tipe] ?? TIPE_CONFIG.Pengumuman
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.3),
      background: cfg.iconBg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 6px 16px ${cfg.color}35`,
    }}>
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none"
        dangerouslySetInnerHTML={{ __html: cfg.iconSvg }} />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
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
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchData() }, [fetchData])

  const countByTipe = announcements.reduce<Record<string, number>>((acc, a) => {
    acc[a.tipe] = (acc[a.tipe] ?? 0) + 1; return acc
  }, {})
  const totalAll    = announcements.length
  const visibleList = filter === 'Semua' ? announcements : announcements.filter(a => a.tipe === filter)

  return (
    <div style={S.shell}>

      {/* ════════════════════════════════════════════════════════
          HERO HEADER  —  sesuai desain_pengumuman.png
          ════════════════════════════════════════════════════════ */}
      <div style={S.hero}>
        {/* dekorasi orb */}
        <div style={S.orbA} /><div style={S.orbB} /><div style={S.orbC} />

        {/* ── TOP NAV ROW: Logo kiri | Bell kanan ── */}
        <div style={S.navRow}>
          {/* Logo + Nama Sekolah */}
          <div style={S.schoolInfo}>
            <div style={S.logoBox}>
              <Image
                src="/image/logo.png"
                alt="Logo"
                width={36}
                height={36}
                style={{ objectFit: 'contain', borderRadius: 8 }}
              />
            </div>
            <div>
              <p style={S.schoolName}>Pon-Pes Al Istiqomah</p>
              <p style={S.schoolTagline}>Berakhlak, Berilmu, Berprestasi</p>
            </div>
          </div>

          {/* Bell notifikasi */}
          <button style={S.notifBtn} aria-label="Notifikasi">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {totalAll > 0 && (
              <span style={S.notifBadge}>{totalAll > 9 ? '9+' : totalAll}</span>
            )}
          </button>
        </div>

        {/* ── HERO BODY: Teks kiri | Megaphone kanan ── */}
        <div style={S.heroBody}>
          <div style={S.heroText}>
            <h1 style={S.heroTitle}>Pengumuman</h1>
            <p style={S.heroSub}>Informasi &amp; pengumuman dari sekolah</p>
          </div>

          {/* Megaphone 3D besar di kanan */}
          <div style={S.heroImgWrap}>
            <Image
              src="/icons/icon pengumuman.png"
              alt=""
              width={140}
              height={140}
              priority
              style={{
                objectFit: 'contain',
                filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.35))',
              }}
            />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          FILTER TABS  —  kartu putih mengambang
          ════════════════════════════════════════════════════════ */}
      <div style={S.filterOuter}>
        <div style={S.filterCard}>
          {FILTER_TABS.map((t) => {
            const isActive = filter === t
            const count    = t === 'Semua' ? totalAll : (countByTipe[t] ?? 0)
            const acColor  = FILTER_ACTIVE_COLOR[t]
            return (
              <button
                key={t}
                style={{
                  ...S.filterTab,
                  background: 'transparent',
                  borderBottom: isActive ? `2.5px solid ${acColor}` : '2.5px solid transparent',
                }}
                onClick={() => setFilter(t)}
              >
                {/* icon — hanya SVG, warna berubah saat aktif */}
                <svg
                  width="22" height="22" viewBox="0 0 24 24" fill="none"
                  style={{ color: isActive ? acColor : '#94a3b8', transition: 'color 0.18s' }}
                  dangerouslySetInnerHTML={{ __html: FILTER_ICON_SVG[t] }}
                />
                {/* label */}
                <span style={{
                  fontSize: 9.5, fontWeight: isActive ? 800 : 600,
                  color: isActive ? acColor : '#94a3b8',
                  whiteSpace: 'nowrap' as const,
                  transition: 'color 0.18s',
                }}>
                  {t}
                </span>
                {/* count */}
                <span style={{
                  fontSize: 12, fontWeight: 800,
                  color: isActive ? acColor : '#cbd5e1',
                  lineHeight: 1,
                  transition: 'color 0.18s',
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          WELCOME BANNER  —  pengumuman_banner.png
          ════════════════════════════════════════════════════════ */}
      <div style={S.bannerOuter}>
        <div style={S.bannerWrap}>
          {/* gambar latar belakang banner */}
          <Image
            src="/icons/pengumuman banner.png"
            alt="Banner Pengumuman"
            fill
            style={{ objectFit: 'cover', objectPosition: 'right center' }}
          />
          {/* overlay gradasi agar teks terbaca */}
          <div style={S.bannerGradient} />
          {/* konten teks */}
          <div style={S.bannerContent}>
            <p style={S.bannerPre}>Selamat Datang di</p>
            <h2 style={S.bannerTitle}>Pon-Pes Al Istiqomah</h2>
            <p style={S.bannerSub}>Membentuk Generasi Qur&apos;ani{'\n'}yang Unggul dan Berakhlak Mulia</p>
            <Link href="/siswa/profil-sekolah" style={S.bannerBtn}>
              Lihat Profil Sekolah →
            </Link>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          SECTION HEADER
          ════════════════════════════════════════════════════════ */}
      <div style={S.sectionRow}>
        <span style={S.sectionTitle}>Pengumuman Terbaru</span>
        {filter !== 'Semua' && (
          <button style={S.sectionLink} onClick={() => setFilter('Semua')}>
            Lihat semua →
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          CARD LIST
          ════════════════════════════════════════════════════════ */}
      <div style={S.listWrap}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={S.skelCard}>
                <div style={S.skelIcon} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 7 }}>
                  <div style={{ ...S.skelLine, width: 65, height: 9, borderRadius: 99 }} />
                  <div style={{ ...S.skelLine, width: '88%', height: 13 }} />
                  <div style={{ ...S.skelLine, width: '62%', height: 11 }} />
                </div>
              </div>
            ))}
          </div>
        ) : visibleList.length === 0 ? (
          <div style={S.emptyBox}>
            <span style={{ fontSize: 46, lineHeight: 1 }}>📭</span>
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
            {visibleList.map((ann, idx) => {
              const cfg = TIPE_CONFIG[ann.tipe] ?? TIPE_CONFIG.Pengumuman
              return (
                <button
                  key={ann.id}
                  className="ann-card"
                  style={{ ...S.card, animationDelay: `${idx * 0.05}s` }}
                  onClick={() => setSelected(ann)}
                >
                  <TipeIcon tipe={ann.tipe} size={50} />

                  <div style={S.cardBody}>
                    <div style={S.cardTopRow}>
                      <span style={{ ...S.tipePill, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        ● {cfg.label}
                      </span>
                      <span style={{ ...S.cardDate, color: cfg.color }}>
                        {formatShort(ann.tanggal)}
                      </span>
                    </div>
                    <p style={S.cardTitle}>{ann.judul}</p>
                    <p style={S.cardPreview}>
                      {ann.konten.length > 95 ? ann.konten.slice(0, 95) + '…' : ann.konten}
                    </p>
                    {ann.lampiran_url && (
                      <span style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>
                        🔗 {ann.lampiran_nama || 'Lampiran tersedia'}
                      </span>
                    )}
                  </div>

                  <div style={S.chevronBox}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          BOTTOM SHEET MODAL
          ════════════════════════════════════════════════════════ */}
      {selected && (() => {
        const cfg = TIPE_CONFIG[selected.tipe] ?? TIPE_CONFIG.Pengumuman
        return (
          <div
            style={S.backdrop}
            onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
            role="dialog" aria-modal="true"
          >
            <div style={S.sheet}>
              {/* handle */}
              <div style={S.handle} />

              {/* colored top bar */}
              <div style={{ ...S.sheetTopBar, background: cfg.iconBg }}>
                <TipeIcon tipe={selected.tipe} size={50} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <span style={S.sheetTipePill}>● {cfg.label}</span>
                  <p style={S.sheetBarDate}>📅 {formatTanggal(selected.tanggal)}</p>
                </div>
                <button style={S.closeBtn} onClick={() => setSelected(null)} aria-label="Tutup">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2.8" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* body */}
              <div style={S.sheetBody}>
                <h2 style={S.sheetTitle}>{selected.judul}</h2>
                <div style={S.sheetDivider} />
                <p style={S.sheetContent}>{selected.konten}</p>

                {selected.lampiran_url && (
                  <a
                    href={selected.lampiran_url}
                    target="_blank" rel="noopener noreferrer"
                    style={{ ...S.sheetAtt, background: cfg.bg, border: `1.5px solid ${cfg.border}`, color: cfg.color }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <span style={{ flex: 1 }}>{selected.lampiran_nama || 'Buka Lampiran'}</span>
                    <span>↗</span>
                  </a>
                )}

                <button style={S.sheetCloseBtn} onClick={() => setSelected(null)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes bdIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shUp  {
          from { transform: translateY(100%); opacity: 0.5; }
          to   { transform: translateY(0);    opacity: 1;   }
        }
        @keyframes shimmer { 0%,100%{ opacity:1; } 50%{ opacity:.35; } }

        .ann-card {
          animation: fadeUp 0.38s ease both;
          opacity: 0;
        }
        .ann-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 28px rgba(30,58,138,0.13) !important;
        }
        .ann-card:active { transform: scale(0.98) !important; }
      `}</style>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {

  shell: {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    background: '#eef2fb',
    minHeight: '100vh',
    paddingBottom: '6rem',
  },

  /* ─ HERO ─ */
  hero: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0b1e5b 0%, #1e3a8a 50%, #2563eb 100%)',
    /* padding: top kecil, samping, bawah cukup agar megaphone tidak terpotong */
    padding: '0.9rem 1.25rem 2.2rem',
    borderRadius: '0 0 2.5rem 2.5rem',
  },
  orbA: {
    position: 'absolute', width: 260, height: 260, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)',
    top: -80, right: -80, pointerEvents: 'none',
  },
  orbB: {
    position: 'absolute', width: 180, height: 180, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(129,140,248,0.14) 0%, transparent 70%)',
    bottom: -60, left: -50, pointerEvents: 'none',
  },
  orbC: {
    position: 'absolute', width: 100, height: 100, borderRadius: '50%',
    background: 'rgba(251,191,36,0.06)',
    top: '45%', left: '42%', pointerEvents: 'none',
  },

  /* ── TOP NAV ROW ── */
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.4rem',
    position: 'relative',
    zIndex: 2,
  },

  /* Logo + nama sekolah (kiri) */
  schoolInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
    background: 'rgba(255,255,255,0.12)',
    border: '1.5px solid rgba(255,255,255,0.22)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolName: {
    fontSize: 13,
    fontWeight: 800,
    color: 'white',
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
  },
  schoolTagline: {
    fontSize: 10,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.60)',
    marginTop: 1,
  },

  /* Bell notifikasi (kanan) */
  notifBtn: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 13,
    background: 'rgba(255,255,255,0.14)',
    border: '1.5px solid rgba(255,255,255,0.22)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    flexShrink: 0,
  },
  notifBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    background: '#ef4444',
    color: 'white',
    fontSize: 8.5,
    fontWeight: 900,
    borderRadius: 999,
    padding: '1px 5px',
    border: '2px solid #1e3a8a',
    lineHeight: 1.6,
  },

  /* ── HERO BODY ── */
  heroBody: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroText: {
    flex: 1,
    paddingBottom: '0.3rem',
  },
  heroTitle: {
    fontSize: '2.35rem',
    fontWeight: 900,
    color: 'white',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    marginBottom: '0.5rem',
  },
  heroSub: {
    fontSize: '0.78rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.62)',
  },
  heroImgWrap: {
    flexShrink: 0,
    marginBottom: '-1.2rem', /* megaphone sedikit overflow ke bawah hero */
  },

  /* ─ FILTER TABS ─ */
  filterOuter: {
    padding: '0',           /* flush ke kiri & kanan, tidak ada padding samping */
    marginTop: '-0.5rem',
    position: 'relative',
    zIndex: 10,
  },
  filterCard: {
    background: 'white',
    borderRadius: 0,        /* lurus / tanpa lengkungan */
    boxShadow: '0 4px 16px rgba(30,58,138,0.08)',
    padding: '0.6rem 0.25rem',
    display: 'flex',
    gap: 0,
    overflowX: 'auto' as const,
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
  },
  filterTab: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 3,
    padding: '0.45rem 0.5rem',
    borderRadius: '0.5rem', /* sedikit saja agar icon tidak kaku, tab tetap lurus */
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
    flexShrink: 0,
    fontFamily: 'inherit',
    minWidth: 62,
  },

  /* ─ BANNER ─ */
  bannerOuter: { padding: '1.2rem 1rem 0' },
  bannerWrap: {
    position: 'relative',
    borderRadius: '1.5rem',
    overflow: 'hidden',
    minHeight: 170,
    background: 'linear-gradient(135deg, #0b1e5b, #1e3a8a)',
    display: 'flex',
    alignItems: 'center',
  },
  bannerGradient: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, rgba(11,30,91,0.97) 0%, rgba(11,30,91,0.85) 40%, rgba(11,30,91,0.45) 70%, transparent 100%)',
    zIndex: 1,
  },
  bannerContent: {
    position: 'relative',
    zIndex: 2,
    padding: '1.4rem 1.4rem',
  },
  bannerPre: {
    fontSize: 10.5,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 3,
    letterSpacing: '0.03em',
  },
  bannerTitle: {
    fontSize: '1.22rem',
    fontWeight: 900,
    color: 'white',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    marginBottom: '0.42rem',
  },
  bannerSub: {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.6,
    marginBottom: '0.9rem',
    whiteSpace: 'pre-line' as const,
  },
  bannerBtn: {
    display: 'inline-block',
    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
    color: 'white',
    fontSize: 11,
    fontWeight: 800,
    padding: '0.48rem 1.1rem',
    borderRadius: 999,
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(245,158,11,0.45)',
    letterSpacing: '0.01em',
  },

  /* ─ SECTION ─ */
  sectionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.3rem 1rem 0.65rem',
  },
  sectionTitle: { fontSize: 15.5, fontWeight: 900, color: '#0f172a' },
  sectionLink: {
    fontSize: 12,
    fontWeight: 700,
    color: '#2563eb',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  /* ─ LIST ─ */
  listWrap: { padding: '0 1rem' },

  /* ─ CARD ─ */
  card: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    borderRadius: '1.3rem',
    border: '1.5px solid #e8edf5',
    background: 'white',
    cursor: 'pointer',
    textAlign: 'left' as const,
    padding: '13px 10px 13px 13px',
    boxShadow: '0 2px 12px rgba(30,58,138,0.055)',
    transition: 'transform 0.18s, box-shadow 0.18s',
    fontFamily: 'inherit',
  },
  cardBody: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  tipePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 8.5,
    fontWeight: 800,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    padding: '0.22rem 0.55rem',
    borderRadius: 999,
  },
  cardDate: { fontSize: 10, fontWeight: 700, flexShrink: 0 },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.35,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  cardPreview: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 1.58,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* ─ SKELETON ─ */
  skelCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    borderRadius: '1.3rem',
    background: 'white',
    border: '1.5px solid #f1f5f9',
    padding: '13px',
    animation: 'shimmer 1.6s ease-in-out infinite',
  },
  skelIcon: { width: 50, height: 50, borderRadius: 15, background: '#f1f5f9', flexShrink: 0 },
  skelLine: { background: '#f1f5f9', borderRadius: 6 },

  /* ─ EMPTY ─ */
  emptyBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3.5rem 1rem',
    gap: '0.6rem',
    background: 'white',
    borderRadius: '1.5rem',
    border: '1.5px dashed #e2e8f0',
    textAlign: 'center' as const,
  },
  emptyTitle: { fontSize: 15, fontWeight: 800, color: '#334155' },
  emptySub:   { fontSize: 13, color: '#94a3b8', lineHeight: 1.6 },
  emptyBtn: {
    marginTop: 8,
    padding: '0.65rem 1.5rem',
    borderRadius: 999,
    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    color: 'white',
    fontSize: 13,
    fontWeight: 800,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
  },

  /* ─ MODAL ─ */
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    background: 'rgba(10,18,40,0.58)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    animation: 'bdIn 0.22s ease forwards',
    backdropFilter: 'blur(6px)',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    background: 'white',
    borderRadius: '2.2rem 2.2rem 0 0',
    animation: 'shUp 0.3s cubic-bezier(0.32,0.72,0,1) forwards',
    maxHeight: '91vh',
    overflowY: 'auto' as const,
  },
  handle: {
    width: 42,
    height: 4.5,
    borderRadius: 999,
    background: '#e2e8f0',
    margin: '1rem auto 0',
  },
  sheetTopBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    padding: '1.1rem 1.25rem 1.3rem',
    borderRadius: '0 0 1.5rem 1.5rem',
    margin: '0 0 0.2rem',
  },
  sheetTipePill: {
    display: 'inline-block',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    padding: '0.22rem 0.6rem',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.22)',
    color: 'white',
    marginBottom: 5,
  },
  sheetBarDate: { fontSize: 11, color: 'rgba(255,255,255,0.78)', fontWeight: 600 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: '1.5px solid rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    alignSelf: 'flex-start' as const,
    backdropFilter: 'blur(4px)',
  },
  sheetBody: { padding: '0.4rem 1.25rem 2rem' },
  sheetTitle: {
    fontSize: '1.12rem',
    fontWeight: 900,
    color: '#0f172a',
    lineHeight: 1.38,
    marginBottom: '0.5rem',
    letterSpacing: '-0.01em',
  },
  sheetDivider: { height: 1, background: '#f1f5f9', margin: '0.7rem 0 1rem' },
  sheetContent: {
    fontSize: 13.5,
    color: '#374151',
    lineHeight: 1.85,
    whiteSpace: 'pre-wrap' as const,
    marginBottom: '1.25rem',
  },
  sheetAtt: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '0.9rem 1rem',
    borderRadius: '1rem',
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
    marginBottom: '1.25rem',
  },
  sheetCloseBtn: {
    width: '100%',
    padding: '0.95rem',
    borderRadius: '1.1rem',
    border: '1.5px solid #e8edf5',
    background: '#f8fafc',
    fontSize: 14,
    fontWeight: 700,
    color: '#64748b',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}