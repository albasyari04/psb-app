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
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch { return iso }
}

function getStatusStyle(status: string): { bg: string; text: string; dot: string } {
  if (status === 'Berlangsung') return { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6' }
  if (status === 'Selesai')     return { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e' }
  return                               { bg: '#faf5ff', text: '#7c3aed', dot: '#a855f7' }
}

function getStatusIcon(status: string): string {
  if (status === 'Berlangsung') return '⏳'
  if (status === 'Selesai')     return '✅'
  return '🔔'
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function JadwalPage() {
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<'Semua' | 'Akan Datang' | 'Berlangsung' | 'Selesai'>('Semua')

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

  const tabs: Array<typeof filter> = ['Semua', 'Berlangsung', 'Akan Datang', 'Selesai']

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      maxWidth: 480,
      margin: '0 auto',
      position: 'relative',
    }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        padding: '52px 20px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: '30%',
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />

        {/* Back button */}
        <Link href="/siswa" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.85)',
          fontSize: 14, textDecoration: 'none',
          marginBottom: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Kembali
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            📅
          </div>
          <div>
            <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              Jadwal Penting
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, margin: '4px 0 0' }}>
              SPMB 2026/2027 • PON-PES AL ISTIQOMAH
            </p>
          </div>
        </div>

        {/* Stats chips */}
        {!loading && (
          <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            {[
              { label: 'Total',        count: jadwalList.length,                                    color: 'rgba(255,255,255,0.2)' },
              { label: 'Berlangsung',  count: jadwalList.filter(j => j.status === 'Berlangsung').length, color: 'rgba(59,130,246,0.35)' },
              { label: 'Akan Datang', count: jadwalList.filter(j => j.status === 'Akan Datang').length,  color: 'rgba(168,85,247,0.35)' },
              { label: 'Selesai',      count: jadwalList.filter(j => j.status === 'Selesai').length,      color: 'rgba(34,197,94,0.35)' },
            ].map((s) => (
              <div key={s.label} style={{
                background: s.color,
                borderRadius: 20, padding: '4px 12px',
                display: 'flex', gap: 6, alignItems: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{s.count}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{
        padding: '0 16px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{
          display: 'flex', gap: 4,
          overflowX: 'auto',
          paddingBottom: 0,
          scrollbarWidth: 'none',
        }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '12px 14px',
                fontSize: 13,
                fontWeight: filter === tab ? 600 : 400,
                color: filter === tab ? '#4f46e5' : '#64748b',
                background: 'none',
                border: 'none',
                borderBottom: filter === tab ? '2.5px solid #4f46e5' : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '16px 16px 100px' }}>

        {loading ? (
          /* Skeleton */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: 16,
                padding: '18px 16px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '60%', height: 14, borderRadius: 6, background: '#f1f5f9', marginBottom: 8 }} />
                    <div style={{ width: '40%', height: 12, borderRadius: 6, background: '#f1f5f9' }} />
                  </div>
                  <div style={{ width: 72, height: 24, borderRadius: 20, background: '#f1f5f9' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: 60, gap: 12,
          }}>
            <div style={{ fontSize: 48 }}>📭</div>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
              {filter === 'Semua' ? 'Belum ada jadwal tersedia' : `Tidak ada jadwal "${filter}"`}
            </p>
          </div>
        ) : (
          /* Timeline */
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute',
              left: 31,
              top: 22,
              bottom: 22,
              width: 2,
              background: 'linear-gradient(to bottom, #e2e8f0, transparent)',
              zIndex: 0,
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
              {filtered.map((j, idx) => {
                const s           = getStatusStyle(j.status)
                const icon        = getStatusIcon(j.status)
                const tanggalStr  = j.tanggal_mulai && j.tanggal_selesai
                  ? `${formatTanggal(j.tanggal_mulai)} – ${formatTanggal(j.tanggal_selesai)}`
                  : formatTanggal(j.tanggal)
                const isLast = idx === filtered.length - 1

                return (
                  <div key={j.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

                    {/* Timeline dot */}
                    <div style={{
                      width: 44, height: 44,
                      borderRadius: 12,
                      background: s.bg,
                      border: `2px solid ${s.dot}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                      position: 'relative', zIndex: 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                      {icon}
                      {/* Connector dot */}
                      {!isLast && (
                        <div style={{
                          position: 'absolute',
                          bottom: -13, left: '50%',
                          transform: 'translateX(-50%)',
                          width: 6, height: 6,
                          borderRadius: '50%',
                          background: s.dot,
                        }} />
                      )}
                    </div>

                    {/* Card */}
                    <div style={{
                      flex: 1,
                      background: '#fff',
                      borderRadius: 16,
                      padding: '14px 16px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      borderLeft: `3px solid ${j.warna}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <p style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#1e293b',
                          lineHeight: 1.3,
                          flex: 1,
                        }}>
                          {j.label}
                        </p>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: s.bg,
                          color: s.text,
                          flexShrink: 0,
                        }}>
                          {j.status}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        marginTop: 8,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span style={{ color: '#64748b', fontSize: 12 }}>{tanggalStr}</span>
                      </div>

                      {/* Color chip */}
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        marginTop: 8,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: `${j.warna}15`,
                      }}>
                        <div style={{
                          width: 8, height: 8,
                          borderRadius: '50%',
                          background: j.warna,
                        }} />
                        <span style={{ fontSize: 11, color: j.warna, fontWeight: 600 }}>
                          {j.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: '#fff',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        zIndex: 100,
      }}>
        {[
          { href: '/siswa',           label: 'Beranda', active: false, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
          { href: '/siswa/pendaftaran', label: 'Daftar', active: false, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
          { href: '/siswa/pembayaran',  label: 'Bayar',  active: false, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
          { href: '/siswa/status',      label: 'Status', active: false, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
          { href: '/siswa/profile',     label: 'Profil', active: false, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ].map((nav) => (
          <Link key={nav.href} href={nav.href} style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 0 14px',
            gap: 3,
            color: nav.active ? '#4f46e5' : '#94a3b8',
            textDecoration: 'none',
            fontSize: 10,
            fontWeight: nav.active ? 600 : 400,
          }}>
            {nav.icon}
            <span>{nav.label}</span>
          </Link>
        ))}
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