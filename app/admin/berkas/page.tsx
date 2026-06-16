'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
// Hapus import Image karena tidak digunakan
// import Image from 'next/image'

// ── Types ──────────────────────────────────────────────────────────────────
type BerkasStatus = 'pending' | 'diverifikasi' | 'ditolak'

interface SiswaBerkas {
  id: string
  user_id: string
  kk: string | null
  akte_lahir: string | null
  ijazah_smp: string | null
  raport_smp: string | null
  skhun: string | null
  sertifikat: string | null
  status: BerkasStatus
  catatan: string | null
  updated_at: string
  verified_at: string | null
  users: {
    id: string
    name: string
    email: string
  } | null
}

const DOC_LABELS: Record<string, string> = {
  kk: 'Kartu Keluarga',
  akte_lahir: 'Akte Kelahiran',
  ijazah_smp: 'Ijazah Terakhir',
  raport_smp: 'SKHU / Hasil Ujian',
  skhun: 'Surat Ket. Sehat',
  sertifikat: 'Sertifikat',
}

const DOC_KEYS = ['kk', 'akte_lahir', 'ijazah_smp', 'raport_smp', 'skhun', 'sertifikat'] as const

// ── Helper ─────────────────────────────────────────────────────────────────
function countDocs(b: SiswaBerkas) {
  return DOC_KEYS.filter(k => !!b[k]).length
}

function formatDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
  })
}

function initials(name: string) {
  if (!name) return 'U'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// ── Badge ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: BerkasStatus }) {
  const map = {
    pending:      { label: 'Menunggu',    bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    diverifikasi: { label: 'Diverifikasi', bg: '#DCFCE7', color: '#14532D', dot: '#16A34A' },
    ditolak:      { label: 'Ditolak',     bg: '#FEE2E2', color: '#991B1B', dot: '#DC2626' },
  }
  const s = map[status] ?? map.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, padding: '3px 10px',
      borderRadius: 20, letterSpacing: '.02em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  )
}

// ── Modal Detail ───────────────────────────────────────────────────────────
function DetailModal({
  item,
  onClose,
  onVerify,
}: {
  item: SiswaBerkas
  onClose: () => void
  onVerify: (userId: string, status: BerkasStatus, catatan?: string) => Promise<void>
}) {
  const [catatan, setCatatan] = useState(item.catatan ?? '')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  async function submit(status: BerkasStatus) {
    setLoading(true)
    await onVerify(item.user_id, status, catatan)
    setLoading(false)
    onClose()
  }

  const docs = DOC_KEYS.map(k => ({ key: k, label: DOC_LABELS[k], url: item[k] }))
  const uploaded = docs.filter(d => d.url)
  const missing  = docs.filter(d => !d.url)

  return (
    <>
      {/* Overlay */}
      <div 
        onClick={onClose} 
        style={{
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000, 
          backdropFilter: 'blur(3px)',
          cursor: 'pointer',
        }} 
      />

      {/* Preview lightbox */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1200, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              position: 'relative',
              cursor: 'default',
            }}
          >
            <button
              onClick={() => setPreview(null)}
              style={{
                position: 'absolute', 
                top: -14, 
                right: -14, 
                width: 32, 
                height: 32,
                borderRadius: '50%', 
                background: '#fff', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: 16, 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                zIndex: 10,
              }}
            >✕</button>
            {preview.endsWith('.pdf') || preview.includes('application/pdf') ? (
              <iframe 
                src={preview} 
                style={{ 
                  width: '80vw', 
                  height: '80vh', 
                  border: 'none', 
                  borderRadius: 12,
                  background: '#fff',
                }} 
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={preview} 
                alt="Preview dokumen" 
                style={{ 
                  maxWidth: '85vw', 
                  maxHeight: '85vh', 
                  borderRadius: 12, 
                  objectFit: 'contain',
                  background: '#fff',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icons/file-placeholder.png'
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Modal content - sama seperti sebelumnya */}
      <div style={{
        position: 'fixed', 
        inset: 0, 
        zIndex: 1100,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 16, 
        pointerEvents: 'none',
      }}>
        <div style={{
          background: '#fff', 
          borderRadius: 20, 
          width: '100%', 
          maxWidth: 620,
          maxHeight: '90vh', 
          overflow: 'auto', 
          pointerEvents: 'all',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1.5px solid #F3F4F6',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, 
                height: 44, 
                borderRadius: 12,
                background: 'linear-gradient(135deg,#16A34A,#4ADE80)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#fff', 
                fontWeight: 800, 
                fontSize: 16,
                flexShrink: 0,
              }}>
                {initials(item.users?.name ?? 'U')}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#111827' }}>
                  {item.users?.name ?? 'Nama tidak tersedia'}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                  {item.users?.email ?? '-'} &nbsp;·&nbsp; Dikirim {formatDate(item.updated_at)}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              style={{
                background: '#F3F4F6', 
                border: 'none', 
                borderRadius: 10,
                width: 34, 
                height: 34, 
                cursor: 'pointer', 
                fontSize: 16,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >✕</button>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* Status saat ini */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Status saat ini:</span>
              <StatusBadge status={item.status ?? 'pending'} />
            </div>

            {/* Dokumen yang diunggah */}
            <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>
              Dokumen Diunggah ({uploaded.length}/{DOC_KEYS.length})
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {uploaded.map(d => (
                <div key={d.key} style={{
                  background: '#F0FDF4', 
                  border: '1.5px solid #86EFAC',
                  borderRadius: 12, 
                  padding: '10px 12px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{
                      width: 30, 
                      height: 30, 
                      borderRadius: 8,
                      background: '#DCFCE7', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexShrink: 0,
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <span style={{ 
                      fontSize: 11.5, 
                      fontWeight: 700, 
                      color: '#14532D', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {d.label}
                    </span>
                  </div>
                  <button
                    onClick={() => setPreview(d.url!)}
                    style={{
                      background: '#fff', 
                      border: '1.5px solid #86EFAC',
                      borderRadius: 7, 
                      padding: '3px 9px',
                      fontSize: 10, 
                      fontWeight: 700, 
                      color: '#16A34A',
                      cursor: 'pointer', 
                      flexShrink: 0, 
                      fontFamily: 'inherit',
                    }}
                  >Lihat</button>
                </div>
              ))}
            </div>

            {/* Dokumen belum diunggah */}
            {missing.length > 0 && (
              <>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', margin: '0 0 8px' }}>
                  Belum Diunggah ({missing.length})
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {missing.map(d => (
                    <span key={d.key} style={{
                      background: '#FEF3C7', 
                      color: '#92400E',
                      fontSize: 11, 
                      fontWeight: 600, 
                      padding: '4px 10px',
                      borderRadius: 20, 
                      border: '1px solid #FDE68A',
                    }}>{d.label}</span>
                  ))}
                </div>
              </>
            )}

            {/* Catatan admin */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                Catatan Admin (opsional)
              </label>
              <textarea
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                placeholder="Tulis catatan untuk santri jika ada dokumen yang kurang atau perlu diperbaiki..."
                rows={3}
                style={{
                  width: '100%', 
                  borderRadius: 12, 
                  border: '1.5px solid #E5E7EB',
                  padding: '10px 12px', 
                  fontSize: 13, 
                  fontFamily: 'inherit',
                  resize: 'vertical', 
                  outline: 'none', 
                  boxSizing: 'border-box',
                  transition: 'border-color .2s',
                  color: '#374151',
                }}
                onFocus={e => e.target.style.borderColor = '#16A34A'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => submit('ditolak')}
                disabled={loading}
                style={{
                  flex: 1, 
                  padding: '13px', 
                  borderRadius: 12, 
                  border: '1.5px solid #FECACA',
                  background: '#FEF2F2', 
                  color: '#DC2626', 
                  fontWeight: 800, 
                  fontSize: 13,
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  fontFamily: 'inherit',
                  opacity: loading ? .6 : 1, 
                  transition: 'all .2s',
                }}
              >
                ✕ &nbsp;Tolak Berkas
              </button>
              <button
                onClick={() => submit('diverifikasi')}
                disabled={loading || uploaded.length === 0}
                style={{
                  flex: 1, 
                  padding: '13px', 
                  borderRadius: 12, 
                  border: 'none',
                  background: uploaded.length === 0 ? '#E5E7EB' : 'linear-gradient(135deg,#16A34A,#4ADE80)',
                  color: uploaded.length === 0 ? '#9CA3AF' : '#fff',
                  fontWeight: 800, 
                  fontSize: 13,
                  cursor: (loading || uploaded.length === 0) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', 
                  opacity: loading ? .6 : 1, 
                  transition: 'all .2s',
                  boxShadow: uploaded.length > 0 ? '0 4px 16px rgba(22,163,74,0.3)' : 'none',
                }}
              >
                ✓ &nbsp;Verifikasi Berkas
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminBerkasPage() {
  const [data, setData]       = useState<SiswaBerkas[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<BerkasStatus | 'semua'>('semua')
  const [selected, setSelected] = useState<SiswaBerkas | null>(null)
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/berkas')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal memuat data')
      setData(json.data || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleVerify(userId: string, status: BerkasStatus, catatan?: string) {
    try {
      const res = await fetch('/api/admin/berkas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, status, catatan }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal memperbarui status')
      showToast(json.message, true)
      await fetchData()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      showToast(errorMessage, false)
    }
  }

  const filtered = useMemo(() => {
    return data.filter(item => {
      const nama  = item.users?.name?.toLowerCase() ?? ''
      const email = item.users?.email?.toLowerCase() ?? ''
      const q     = search.toLowerCase()
      const matchSearch = !q || nama.includes(q) || email.includes(q)
      const matchFilter = filter === 'semua' || (item.status ?? 'pending') === filter
      return matchSearch && matchFilter
    })
  }, [data, search, filter])

  const stats = useMemo(() => {
    const total = data.length
    const pending = data.filter(d => (d.status ?? 'pending') === 'pending').length
    const verified = data.filter(d => d.status === 'diverifikasi').length
    const rejected = data.filter(d => d.status === 'ditolak').length
    return { total, pending, verified, rejected }
  }, [data])

  if (!isMounted) {
    return null
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#F8FAF9' }}>
      <style>{adminCss}</style>

      {/* Toast */}
      {toast && (
        <div className={`ab-toast ${toast.ok ? 'ab-toast-ok' : 'ab-toast-err'}`}>
          {toast.ok ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onVerify={handleVerify}
        />
      )}

      {/* Header */}
      <div className="ab-header">
        <div className="ab-header-inner">
          <div>
            <h1 className="ab-title">Berkas Santri</h1>
            <p className="ab-subtitle">Kelola dan verifikasi dokumen yang dikirim santri</p>
          </div>
          <button onClick={fetchData} className="ab-refresh-btn" title="Refresh data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="ab-body">
        {/* Stats Cards */}
        <div className="ab-stats">
          {[
            { label: 'Total Pengirim', value: stats.total,    color: '#3B82F6', bg: '#EFF6FF', icon: '📁' },
            { label: 'Menunggu',       value: stats.pending,   color: '#F59E0B', bg: '#FFFBEB', icon: '⏳' },
            { label: 'Diverifikasi',   value: stats.verified,  color: '#16A34A', bg: '#F0FDF4', icon: '✅' },
            { label: 'Ditolak',        value: stats.rejected,  color: '#DC2626', bg: '#FEF2F2', icon: '❌' },
          ].map(s => (
            <div key={s.label} className="ab-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <span style={{
                  fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1,
                }}>{s.value}</span>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6B7280', fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="ab-filter-bar">
          <div className="ab-search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Cari nama atau email santri..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ab-search-input"
            />
            {search && (
              <button onClick={() => setSearch('')} className="ab-search-clear">✕</button>
            )}
          </div>
          <div className="ab-filter-tabs">
            {(['semua', 'pending', 'diverifikasi', 'ditolak'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`ab-filter-tab ${filter === f ? 'ab-filter-tab-active' : ''}`}
              >
                {f === 'semua' ? 'Semua' : f === 'pending' ? 'Menunggu' : f === 'diverifikasi' ? 'Diverifikasi' : 'Ditolak'}
                <span className="ab-tab-count">
                  {f === 'semua' ? stats.total : f === 'pending' ? stats.pending : f === 'diverifikasi' ? stats.verified : stats.rejected}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="ab-loading">
            <div className="ab-spinner" />
            <p>Memuat data berkas santri...</p>
          </div>
        ) : error ? (
          <div className="ab-error">
            <span style={{ fontSize: 32 }}>⚠️</span>
            <p style={{ fontWeight: 700, color: '#991B1B' }}>{error}</p>
            <button onClick={fetchData} className="ab-retry-btn">Coba Lagi</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ab-empty">
            <span style={{ fontSize: 48 }}>📭</span>
            <p style={{ fontWeight: 700, color: '#374151', margin: '8px 0 4px' }}>Tidak ada data</p>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
              {search ? `Tidak ditemukan hasil untuk "${search}"` : 'Belum ada santri yang mengirim berkas'}
            </p>
          </div>
        ) : (
          <div className="ab-card">
            <div className="ab-table-head">
              <div className="ab-th" style={{ flex: 2 }}>Santri</div>
              <div className="ab-th" style={{ flex: 1, textAlign: 'center' }}>Dokumen</div>
              <div className="ab-th" style={{ flex: 1, textAlign: 'center' }}>Status</div>
              <div className="ab-th" style={{ flex: 1.2 }}>Dikirim</div>
              <div className="ab-th" style={{ flex: 1, textAlign: 'center' }}>Aksi</div>
            </div>

            {filtered.map((item, i) => {
              const docCount = countDocs(item)
              const status = (item.status ?? 'pending') as BerkasStatus

              return (
                <div
                  key={item.user_id}
                  className="ab-row"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                >
                  <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: 'linear-gradient(135deg,#16A34A,#86EFAC)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0,
                    }}>
                      {initials(item.users?.name ?? 'U')}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.users?.name ?? 'Nama tidak tersedia'}
                      </p>
                      <p style={{ margin: 0, fontSize: 11.5, color: '#9CA3AF', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.users?.email ?? '-'}
                      </p>
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{
                        fontSize: 18, fontWeight: 900,
                        color: docCount === 6 ? '#16A34A' : docCount >= 3 ? '#F59E0B' : '#EF4444',
                      }}>{docCount}</span>
                      <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>dari 6 dok</span>
                      <div style={{ width: 48, height: 4, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          width: `${(docCount / 6) * 100}%`,
                          background: docCount === 6 ? '#16A34A' : docCount >= 3 ? '#F59E0B' : '#EF4444',
                          transition: 'width .3s',
                        }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <StatusBadge status={status} />
                  </div>

                  <div style={{ flex: 1.2, display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                      {formatDate(item.updated_at)}
                    </span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                      onClick={() => setSelected(item)}
                      style={{
                        background: 'linear-gradient(135deg,#16A34A,#4ADE80)',
                        border: 'none', borderRadius: 10,
                        padding: '8px 16px', color: '#fff',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
                        boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                        transition: 'all .2s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                      onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Detail
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', margin: '8px 0 0' }}>
            Menampilkan {filtered.length} dari {stats.total} data
          </p>
        )}
      </div>
    </div>
  )
}

// CSS
const adminCss = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

* { box-sizing: border-box; }

.ab-toast {
  position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
  z-index: 9999; padding: 11px 24px; border-radius: 30px;
  font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;
  box-shadow: 0 8px 24px rgba(0,0,0,0.14);
  animation: abIn .3s cubic-bezier(.16,1,.3,1) both;
  white-space: nowrap; pointer-events: none;
}
@keyframes abIn {
  from { opacity:0; transform: translateX(-50%) translateY(-10px); }
  to   { opacity:1; transform: translateX(-50%) translateY(0); }
}
.ab-toast-ok  { background:#ECFDF5; color:#065F46; border:1px solid #BBF7D0; }
.ab-toast-err { background:#FEF2F2; color:#991B1B; border:1px solid #FECACA; }

.ab-header {
  background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
  padding: 0;
}
.ab-header-inner {
  max-width: 1100px; margin: 0 auto;
  padding: 28px 24px 24px;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 12;
}
.ab-title {
  font-size: 22px; font-weight: 900; color: #fff; margin: 0 0 4px;
  letter-spacing: -.4px;
}
.ab-subtitle {
  font-size: 13px; color: rgba(255,255,255,0.72); margin: 0; font-weight: 500;
}
.ab-refresh-btn {
  display: flex; align-items: center; gap: 7px;
  background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.2);
  border-radius: 10px; padding: 9px 16px;
  color: #fff; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all .2s; flex-shrink: 0;
}
.ab-refresh-btn:hover { background: rgba(255,255,255,0.2); }

.ab-body {
  max-width: 1100px; margin: 0 auto;
  padding: 24px 24px 48px;
  display: flex; flex-direction: column; gap: 16px;
}

.ab-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
.ab-stat-card {
  background: #fff; border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.ab-filter-bar {
  background: #fff; border-radius: 16px; padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; gap: 12px;
}
.ab-search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: #F9FAFB; border: 1.5px solid #E5E7EB;
  border-radius: 10px; padding: 9px 12px;
  transition: border-color .2s;
}
.ab-search-wrap:focus-within { border-color: #16A34A; }
.ab-search-input {
  flex: 1; border: none; background: transparent;
  font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
  color: #374151; outline: none;
}
.ab-search-input::placeholder { color: #9CA3AF; }
.ab-search-clear {
  background: none; border: none; cursor: pointer;
  color: #9CA3AF; font-size: 13px; padding: 0;
  display: flex; align-items: center;
}
.ab-filter-tabs {
  display: flex; gap: 6px; flex-wrap: wrap;
}
.ab-filter-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 10px;
  border: 1.5px solid #E5E7EB; background: #F9FAFB;
  font-size: 12.5px; font-weight: 600; color: #6B7280;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all .2s;
}
.ab-filter-tab:hover { border-color: #86EFAC; color: #16A34A; }
.ab-filter-tab-active {
  background: #F0FDF4; border-color: #86EFAC; color: #16A34A; font-weight: 800;
}
.ab-tab-count {
  background: #E5E7EB; color: #6B7280;
  font-size: 10px; font-weight: 800; padding: 1px 7px; border-radius: 20px;
}
.ab-filter-tab-active .ab-tab-count {
  background: #DCFCE7; color: #16A34A;
}

.ab-card {
  background: #fff; border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}
.ab-table-head {
  display: flex; align-items: center;
  padding: 12px 20px;
  background: #F9FAFB; border-bottom: 1.5px solid #F3F4F6;
}
.ab-th {
  font-size: 11px; font-weight: 800; color: #9CA3AF;
  text-transform: uppercase; letter-spacing: .06em;
}
.ab-row {
  display: flex; align-items: center;
  padding: 14px 20px; gap: 12px;
  transition: background .15s;
}
.ab-row:hover { background: #FAFFFE; }

.ab-loading, .ab-empty, .ab-error {
  background: #fff; border-radius: 16px; padding: 60px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  text-align: center; color: #6B7280; font-size: 13px; font-weight: 600;
}
.ab-spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid #DCFCE7; border-top-color: #16A34A;
  animation: abSpin .7s linear infinite;
}
@keyframes abSpin { to { transform: rotate(360deg); } }
.ab-retry-btn {
  margin-top: 4px; padding: 9px 20px; border-radius: 10px;
  background: #FEF2F2; border: 1.5px solid #FECACA;
  color: #DC2626; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
}

@media (max-width: 768px) {
  .ab-stats { grid-template-columns: repeat(2, 1fr); }
  .ab-table-head { display: none; }
  .ab-row { flex-wrap: wrap; padding: 14px 16px; }
  .ab-header-inner { flex-direction: column; align-items: flex-start; gap: 12px; }
}
`