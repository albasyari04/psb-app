'use client'
// app/admin/pendaftar/page.tsx
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Pendaftaran } from '@/types'

const STATUS_FILTERS = ['semua', 'menunggu', 'diproses', 'diterima', 'ditolak'] as const

const filterLabel: Record<string, string> = {
  semua: 'Semua', menunggu: 'Menunggu',
  diproses: 'Diproses', diterima: 'Diterima', ditolak: 'Ditolak',
}

const AVATAR_CLS = [
  'pnd-av pnd-av-indigo', 'pnd-av pnd-av-teal',
  'pnd-av pnd-av-amber',  'pnd-av pnd-av-rose', 'pnd-av pnd-av-violet',
]

const pillCls: Record<string, string> = {
  menunggu: 'pnd-pill pnd-pill-menunggu',
  diproses: 'pnd-pill pnd-pill-diproses',
  diterima: 'pnd-pill pnd-pill-diterima',
  ditolak:  'pnd-pill pnd-pill-ditolak',
}
const pillLabel: Record<string, string> = {
  menunggu: 'Menunggu', diproses: 'Diproses', diterima: 'Diterima', ditolak: 'Ditolak',
}

export default function PendaftarPage() {
  const [list,    setList]    = useState<Pendaftaran[]>([])
  const [filter,  setFilter]  = useState('semua')
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 20

  // ✅ Hapus fetchData dari dependency, gunakan string params langsung
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString(),
        ...(filter !== 'semua' && { status: filter })
      })
      const res  = await fetch(`/api/admin/pendaftaran?${params}`)
      const json = await res.json()
      setList((json.data as Pendaftaran[]) || [])
      setTotal(json.total || 0)
    } catch (err) {
      console.error('Fetch pendaftar error:', err)
      setList([])
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = list.filter(p =>
    p.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
    p.nisn?.includes(search) ||
    p.asal_sekolah?.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    semua:    total,
    menunggu: list.filter(p => p.status === 'menunggu').length,
    diproses: list.filter(p => p.status === 'diproses').length,
    diterima: list.filter(p => p.status === 'diterima').length,
    ditolak:  list.filter(p => p.status === 'ditolak').length,
  }

  // ✅ Reset ke page 1 ketika filter berubah
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    setPage(1)
  }

  return (
    <div className="pnd-page-bg">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="pnd-hero">
        <div className="pnd-hero-noise" />
        <div className="pnd-hero-glow" />
        <div className="pnd-hero-glow2" />
        <div className="pnd-hero-inner">
          <div className="pnd-eyebrow">
            <span className="pnd-eyebrow-dot" />
            <span className="pnd-eyebrow-text">ADMIN · PSB 2025/2026</span>
          </div>
          <h1 className="pnd-hero-title">
            Daftar <span>Pendaftar</span>
          </h1>
          <p className="pnd-hero-sub">
            {loading ? 'Memuat data...' : `${list.length} pendaftar terdaftar`}
          </p>
          <div className="pnd-stats-strip">
            <div className="pnd-stat-pill is-indigo">
              <div className="pnd-stat-pill-val">{counts.semua}</div>
              <div className="pnd-stat-pill-label">TOTAL</div>
            </div>
            <div className="pnd-stat-pill is-amber">
              <div className="pnd-stat-pill-val">{counts.menunggu}</div>
              <div className="pnd-stat-pill-label">TUNGGU</div>
            </div>
            <div className="pnd-stat-pill is-green">
              <div className="pnd-stat-pill-val">{counts.diterima}</div>
              <div className="pnd-stat-pill-label">TERIMA</div>
            </div>
            <div className="pnd-stat-pill is-rose">
              <div className="pnd-stat-pill-val">{counts.ditolak}</div>
              <div className="pnd-stat-pill-label">TOLAK</div>
            </div>
          </div>
          <div className="pnd-search-wrap">
            <span className="pnd-search-icon-wrap">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, NISN, atau sekolah..."
              className="pnd-search-input"
            />
            {search && (
              <button className="pnd-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter Chips ──────────────────────────────────────────────── */}
      <div className="pnd-filter-bar">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`pnd-chip ${filter === f ? 'pnd-chip-on' : 'pnd-chip-off'}`}
          >
            {filterLabel[f]}
            <span className={filter === f ? 'pnd-chip-count-on' : 'pnd-chip-count-off'}>
              {counts[f as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="pnd-content">

        {/* Skeleton */}
        {loading && (
          <div className="pnd-list-card">
            {[1, 2, 3, 4].map((n, i) => (
              <div key={n} className={i > 0 ? 'pnd-skeleton-row pnd-skeleton-row--border' : 'pnd-skeleton-row'}>
                <div className="pnd-shimmer pnd-skeleton-av" />
                <div className="pnd-skeleton-lines">
                  <div className="pnd-shimmer pnd-skeleton-line pnd-skeleton-line--a" />
                  <div className="pnd-shimmer pnd-skeleton-line pnd-skeleton-line--b" />
                  <div className="pnd-shimmer pnd-skeleton-line pnd-skeleton-line--c" />
                </div>
                <div className="pnd-shimmer pnd-skeleton-badge" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="pnd-empty">
            <div className="pnd-empty-icon">{search ? '🔎' : '📭'}</div>
            <p className="pnd-empty-title">
              {search ? 'Tidak ditemukan' : 'Belum ada pendaftar'}
            </p>
            <p className="pnd-empty-sub">
              {search
                ? `Tidak ada hasil untuk "${search}"`
                : 'Data akan muncul saat siswa mulai mendaftar'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="pnd-btn-clear-search">
                Hapus Pencarian
              </button>
            )}
          </div>
        )}

        {/* List */}
        {!loading && filtered.length > 0 && (
          <>
            <p className="pnd-result-count">
              <strong>{filtered.length}</strong> pendaftar ditemukan
            </p>
            <div className="pnd-list-card">
              {filtered.map((p, i) => {
                const date = new Date(p.created_at).toLocaleDateString('id-ID', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
                return (
                  <Link key={p.id} href={`/admin/pendaftar/${p.id}`} className="pnd-list-row">
                    <div className={AVATAR_CLS[i % AVATAR_CLS.length]}>
                      {p.nama_lengkap?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div className="pnd-row-info">
                      <p className="pnd-row-name">{p.nama_lengkap}</p>
                      <p className="pnd-row-school">🏫 {p.asal_sekolah ?? '-'}</p>
                      <div className="pnd-row-meta">
                        <span className="pnd-row-jurusan">📚 {p.jurusan_pilihan ?? '-'}</span>
                        {p.nisn && <span className="pnd-row-nisn">NISN: {p.nisn}</span>}
                      </div>
                    </div>
                    <div className="pnd-row-right">
                      <div className={pillCls[p.status] ?? 'pnd-pill pnd-pill-menunggu'}>
                        <div className="pnd-pill-dot" />
                        {pillLabel[p.status] ?? p.status}
                      </div>
                      <span className="pnd-row-date">{date}</span>
                    </div>
                    <span className="pnd-chevron">›</span>
                  </Link>
                )
              })}
            </div>
            
            {/* ✅ Pagination Controls */}
            <div className="pnd-pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="pnd-page-btn"
              >
                ← Sebelumnya
              </button>
              <span className="pnd-page-info">
                Halaman {page} dari {Math.ceil(total / LIMIT) || 1}
              </span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page * LIMIT >= total}
                className="pnd-page-btn"
              >
                Berikutnya →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}