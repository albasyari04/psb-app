'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Jadwal {
  id: string
  label: string
  tanggal: string
  tanggal_mulai: string | null
  tanggal_selesai: string | null
  status: 'Akan Datang' | 'Berlangsung' | 'Selesai'
  warna: string
  urutan: number
  lokasi?: string
  icon_url?: string
}

type FilterType = 'Semua' | 'Berlangsung' | 'Akan Datang' | 'Selesai'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch { return iso }
}

function getStatusConfig(status: string) {
  if (status === 'Berlangsung') return {
    bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE',
    chipBg: '#DBEAFE', chipText: '#1D4ED8',
    dot: '#3B82F6', iconBg: '#1D4ED8',
  }
  if (status === 'Selesai') return {
    bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0',
    chipBg: '#DCFCE7', chipText: '#15803D',
    dot: '#22C55E', iconBg: '#16A34A',
  }
  // Akan Datang
  return {
    bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE',
    chipBg: '#EDE9FE', chipText: '#6D28D9',
    dot: '#8B5CF6', iconBg: '#7C3AED',
  }
}

// Icon SVG per status
function StatusIconSVG({ status }: { status: string }) {
  if (status === 'Berlangsung') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
  if (status === 'Selesai') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
  // Akan Datang — bell
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function JadwalPage() {
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

  const tabs: FilterType[] = ['Semua', 'Berlangsung', 'Akan Datang', 'Selesai']

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#F5F3FF',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      maxWidth: 430,
      margin: '0 auto',
      position: 'relative',
      overflowX: 'hidden',
    }}>

      {/* ══════ TOP BAR (STICKY) — persis gaya Upload Berkas Santri ══════ */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '18px 20px 18px',
        }}>
          <Link
            href="/siswa"
            aria-label="Kembali"
            style={{
              width: 52, height: 52, borderRadius: 16,
              background: '#DCFCE7', color: '#16A34A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, textDecoration: 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </Link>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, color: '#1F2937', margin: '0 0 3px', letterSpacing: -0.3, lineHeight: 1.2 }}>
              Jadwal Penting
            </h1>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0, fontWeight: 500 }}>
              PSMB 2025/2026 - PON PES AL ISTIQOMAH
            </p>
          </div>
        </div>
      </div>

      {/* ─── FILTER TABS ─── persis desain: pill aktif ungu, sisanya teks biasa */}
      <div style={{
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 88,
        zIndex: 20,
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {tabs.map((tab) => {
            const isActive = filter === tab
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : '#64748B',
                  background: isActive ? '#5B21B6' : 'none',
                  borderTop: 'none',
                  borderRight: 'none',
                  borderLeft: 'none',
                  borderBottom: 'none',
                  borderRadius: isActive ? 20 : 20,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div style={{ padding: '16px 16px 120px' }}>

        {/* Section header */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1E293B' }}>
              Jadwal Kegiatan
            </h2>
          </div>
        )}

        {loading ? (
          /* Skeleton */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map((i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 16, padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                animation: 'pulse 1.5s ease-in-out infinite',
                display: 'flex', gap: 14, alignItems: 'center',
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F1F5F9', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: '55%', height: 14, borderRadius: 6, background: '#F1F5F9', marginBottom: 10 }} />
                  <div style={{ width: '75%', height: 11, borderRadius: 6, background: '#F1F5F9', marginBottom: 6 }} />
                  <div style={{ width: '40%', height: 11, borderRadius: 6, background: '#F1F5F9' }} />
                </div>
                <div style={{ width: 76, height: 26, borderRadius: 20, background: '#F1F5F9' }} />
              </div>
            ))}
          </div>

        ) : filtered.length === 0 ? (
          /* Empty */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: 60, gap: 14,
          }}>
            <div style={{ fontSize: 52 }}>📭</div>
            <p style={{ color: '#64748B', fontSize: 14, margin: 0, textAlign: 'center' }}>
              {filter === 'Semua' ? 'Belum ada jadwal tersedia' : `Tidak ada jadwal "${filter}"`}
            </p>
          </div>

        ) : (
          /* Cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
            {/* Vertical timeline line */}
            <div style={{
              position: 'absolute',
              left: 27,
              top: 52,
              bottom: 52,
              width: 2,
              background: 'linear-gradient(to bottom, #C4B5FD, #DDD6FE, transparent)',
              zIndex: 0,
            }} />

            {filtered.map((j) => {
              const cfg = getStatusConfig(j.status)
              const tanggalStr = j.tanggal_mulai && j.tanggal_selesai
                ? `${formatTanggal(j.tanggal_mulai)} – ${formatTanggal(j.tanggal_selesai)}`
                : formatTanggal(j.tanggal)

              return (
                <div key={j.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>

                  {/* Status icon circle */}
                  <div style={{
                    width: 54, height: 54,
                    borderRadius: 16,
                    background: cfg.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${cfg.iconBg}60`,
                  }}>
                    <StatusIconSVG status={j.status} />
                  </div>

                  {/* Card */}
                  <div style={{
                    flex: 1,
                    background: '#fff',
                    borderRadius: 16,
                    padding: '14px 14px 12px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    borderLeft: `3px solid ${j.warna || cfg.dot}`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Row: title + status badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <p style={{
                        margin: 0, fontWeight: 700, fontSize: 14,
                        color: '#1E293B', lineHeight: 1.3, flex: 1,
                      }}>
                        {j.label}
                      </p>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20,
                        fontSize: 11, fontWeight: 600,
                        background: cfg.chipBg, color: cfg.chipText,
                        flexShrink: 0, whiteSpace: 'nowrap',
                      }}>
                        {j.status}
                      </span>
                    </div>

                    {/* Tanggal */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: j.lokasi ? 5 : 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span style={{ color: '#64748B', fontSize: 12 }}>{tanggalStr}</span>
                    </div>

                    {/* Lokasi */}
                    {j.lokasi && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span style={{ color: '#64748B', fontSize: 12 }}>{j.lokasi}</span>
                      </div>
                    )}

                    {/* Status chip bottom */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 20,
                      background: cfg.chipBg,
                    }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: cfg.chipText }}>{j.status}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ─── BOTTOM BANNER "Jangan Lewatkan" ─── */}
        {!loading && (
          <div style={{
            marginTop: 24,
            borderRadius: 20,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            padding: '0',
            boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
            position: 'relative',
            minHeight: 100,
          }}>
            {/* Banner image */}
            {!bannerErr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/icons/jadwal banner1.png"
                alt="Jangan lewatkan jadwal penting"
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                onError={() => setBannerErr(true)}
              />
            ) : (
              /* Fallback jika banner gagal load */
              <>
                {/* Decorative */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -10, left: '40%', width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                {/* Left illustration */}
                <div style={{ padding: '18px 0 18px 16px', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 44 }}>📋</div>
                  <div style={{ fontSize: 24, marginTop: -12, marginLeft: 20 }}>🔔</div>
                </div>

                {/* Text */}
                <div style={{ padding: '18px 8px', flex: 1, position: 'relative', zIndex: 1 }}>
                  <p style={{ color: '#fff', fontWeight: 800, fontSize: 14, margin: '0 0 4px', lineHeight: 1.3 }}>
                    Jangan lewatkan jadwal penting!
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, margin: 0, lineHeight: 1.4 }}>
                    Pastikan kamu tidak ketinggalan informasi penting dari setiap tahapan.
                  </p>
                </div>

                {/* Arrow button */}
                <div style={{ padding: '18px 16px 18px 0', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ─── BOTTOM NAV ─── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#fff',
        borderTop: '1px solid #F1F5F9',
        display: 'flex',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {([
          { href: '/siswa',              label: 'Beranda', active: false },
          { href: '/siswa/pendaftaran',  label: 'Daftar',  active: false },
          { href: '/siswa/pembayaran',   label: 'Bayar',   active: false },
          { href: '/siswa/status',       label: 'Status',  active: false },
          { href: '/siswa/profile',      label: 'Profil',  active: false },
        ] as { href: string; label: string; active: boolean }[]).map((nav) => {
          const color = nav.active ? '#4F46E5' : '#94A3B8'
          return (
            <Link key={nav.href} href={nav.href} style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 0 14px', gap: 3,
              color, textDecoration: 'none',
              fontSize: 10, fontWeight: nav.active ? 600 : 400,
            }}>
              {nav.label === 'Beranda' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill={nav.active ? '#4F46E5' : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              )}
              {nav.label === 'Daftar' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              )}
              {nav.label === 'Bayar' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              )}
              {nav.label === 'Status' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              )}
              {nav.label === 'Profil' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
              <span>{nav.label}</span>
            </Link>
          )
        })}
      </nav>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}