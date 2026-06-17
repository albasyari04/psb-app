'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Status saat ini:</span>
              <StatusBadge status={item.status ?? 'pending'} />
            </div>

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
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", minHeight: '100vh', background: '#F5F7FA' }}>
      <style>{adminCss}</style>

      {toast && (
        <div className={`ab-toast ${toast.ok ? 'ab-toast-ok' : 'ab-toast-err'}`}>
          {toast.ok ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onVerify={handleVerify}
        />
      )}

      {/* Header dengan Banner dan Gambar di kanan tanpa background - Ukuran besar */}
      <div className="ab-header">
        <div className="ab-header-banner">
          <div className="ab-header-content">
            <div className="ab-header-left">
              <div>
                <h1 className="ab-title">Berkas Santri</h1>
                <p className="ab-subtitle">Kelola dan verifikasi dokumen yang dikirim santri</p>
              </div>
            </div>
            <div className="ab-header-right">
              <Image 
                src="/icons/berkas-admin.png" 
                alt="Berkas Admin" 
                width={120} 
                height={120}
                className="ab-header-img"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="ab-body">
        {/* Stats Cards - Sederhana seperti desain */}
        <div className="ab-stats">
          <div className="ab-stat-card">
            <div className="ab-stat-label-top">Total Pengirim</div>
            <div className="ab-stat-value-large">{stats.total}</div>
          </div>
          <div className="ab-stat-card">
            <div className="ab-stat-label-top">Menunggu</div>
            <div className="ab-stat-value-large" style={{ color: '#F59E0B' }}>{stats.pending}</div>
          </div>
          <div className="ab-stat-card">
            <div className="ab-stat-label-top">Diverifikasi</div>
            <div className="ab-stat-value-large" style={{ color: '#10B981' }}>{stats.verified}</div>
          </div>
          <div className="ab-stat-card">
            <div className="ab-stat-label-top">Ditolak</div>
            <div className="ab-stat-value-large" style={{ color: '#EF4444' }}>{stats.rejected}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="ab-filter-bar">
          <div className="ab-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round">
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

        {/* Table / List - Seperti desain */}
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
            {filtered.map((item, i) => {
              const docCount = countDocs(item)
              const status = (item.status ?? 'pending') as BerkasStatus

              return (
                <div
                  key={item.user_id}
                  className="ab-row"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #E5E7EB' : 'none' }}
                >
                  <div className="ab-row-left">
                    <div className="ab-row-info">
                      <div className="ab-row-name">{item.users?.name ?? 'Nama tidak tersedia'}</div>
                      <div className="ab-row-email">{item.users?.email ?? '-'}</div>
                    </div>
                  </div>

                  <div className="ab-row-center">
                    <div className="ab-docs-info">
                      <span className="ab-docs-number">{docCount}</span>
                      <span className="ab-docs-label">dari 6 dok</span>
                    </div>
                  </div>

                  <div className="ab-row-status">
                    <StatusBadge status={status} />
                  </div>

                  <div className="ab-row-date">
                    {formatDate(item.updated_at)}
                  </div>

                  <div className="ab-row-action">
                    <button
                      onClick={() => setSelected(item)}
                      className="ab-detail-btn"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <p className="ab-footer-info">
            Menampilkan {filtered.length} dari {stats.total} data
          </p>
        )}
      </div>
    </div>
  )
}

// CSS
const adminCss = `
* { box-sizing: border-box; }

.ab-toast {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  z-index: 9999; padding: 12px 28px; border-radius: 30px;
  font-size: 13px; font-weight: 700; font-family: 'Inter', sans-serif;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  animation: abIn .3s cubic-bezier(.16,1,.3,1) both;
  white-space: nowrap; pointer-events: none;
}
@keyframes abIn {
  from { opacity:0; transform: translateX(-50%) translateY(-12px); }
  to   { opacity:1; transform: translateX(-50%) translateY(0); }
}
.ab-toast-ok  { background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; }
.ab-toast-err { background:#FEF2F2; color:#991B1B; border:1px solid #FECACA; }

/* ── Header ── */
.ab-header {
  background: linear-gradient(135deg, #065F46 0%, #0D9488 100%);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.ab-header::before {
  content: '';
  position: absolute;
  top: -60%;
  right: -5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
}
.ab-header-banner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}
.ab-header-content {
  padding: 20px 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.ab-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.ab-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}
.ab-header-img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.2));
  transition: transform 0.3s ease;
}
.ab-header-img:hover {
  transform: scale(1.08) rotate(-3deg);
}
.ab-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 2px;
  letter-spacing: -0.3px;
}
.ab-subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  margin: 0;
  font-weight: 500;
}

/* ── Body ── */
.ab-body {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Stats ── */
.ab-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.ab-stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  text-align: center;
  border: 1px solid #F0F0F0;
  transition: transform 0.2s, box-shadow 0.2s;
}
.ab-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.ab-stat-label-top {
  font-size: 12px;
  color: #6B7280;
  font-weight: 600;
  margin-bottom: 4px;
}
.ab-stat-value-large {
  font-size: 28px;
  font-weight: 900;
  color: #111827;
  line-height: 1.2;
}

/* ── Filter Bar ── */
.ab-filter-bar {
  background: #fff;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid #F0F0F0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ab-search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #F9FAFB;
  border: 1.5px solid #E5E7EB;
  border-radius: 8px;
  padding: 8px 12px;
  transition: border-color 0.2s;
}
.ab-search-wrap:focus-within {
  border-color: #0D9488;
}
.ab-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  color: #111827;
  outline: none;
}
.ab-search-input::placeholder {
  color: #9CA3AF;
}
.ab-search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: #9CA3AF;
  font-size: 13px;
  padding: 0 4px;
  display: flex;
  align-items: center;
}
.ab-filter-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.ab-filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1.5px solid #E5E7EB;
  background: #F9FAFB;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}
.ab-filter-tab:hover {
  border-color: #99F6E4;
  color: #0D9488;
}
.ab-filter-tab-active {
  background: #F0FDFA;
  border-color: #5EEAD4;
  color: #065F46;
  font-weight: 700;
}
.ab-tab-count {
  background: #E5E7EB;
  color: #6B7280;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 20px;
}
.ab-filter-tab-active .ab-tab-count {
  background: #99F6E4;
  color: #065F46;
}

/* ── Card / Row ── */
.ab-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid #F0F0F0;
  overflow: hidden;
}
.ab-row {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  gap: 12px;
  transition: background 0.15s;
}
.ab-row:hover {
  background: #FAFFFE;
}
.ab-row-left {
  flex: 2;
  min-width: 0;
}
.ab-row-info {
  min-width: 0;
}
.ab-row-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ab-row-email {
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}
.ab-row-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.ab-docs-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.ab-docs-number {
  font-size: 18px;
  font-weight: 900;
  color: #111827;
}
.ab-docs-label {
  font-size: 10px;
  color: #9CA3AF;
  font-weight: 600;
}
.ab-row-status {
  flex: 1;
  display: flex;
  justify-content: center;
}
.ab-row-date {
  flex: 1.2;
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
}
.ab-row-action {
  flex: 1;
  display: flex;
  justify-content: center;
}
.ab-detail-btn {
  background: linear-gradient(135deg, #0D9488, #14B8A6);
  border: none;
  border-radius: 8px;
  padding: 7px 18px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
}
.ab-detail-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
}

.ab-footer-info {
  text-align: center;
  font-size: 12px;
  color: #9CA3AF;
  margin: 4px 0 0;
}

/* ── Loading / Empty / Error ── */
.ab-loading, .ab-empty, .ab-error {
  background: #fff;
  border-radius: 12px;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid #F0F0F0;
  text-align: center;
  color: #6B7280;
  font-size: 13px;
  font-weight: 600;
}
.ab-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3.5px solid #D1FAE5;
  border-top-color: #0D9488;
  animation: abSpin 0.7s linear infinite;
}
@keyframes abSpin {
  to { transform: rotate(360deg); }
}
.ab-retry-btn {
  margin-top: 4px;
  padding: 10px 24px;
  border-radius: 8px;
  background: #FEF2F2;
  border: 1.5px solid #FECACA;
  color: #DC2626;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

/* ── Responsive ── */
@media (max-width: 992px) {
  .ab-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .ab-header-content {
    flex-direction: row;
    justify-content: space-between;
    padding: 16px 0 14px;
  }
  .ab-header-img {
    width: 80px;
    height: 80px;
  }
  .ab-stats {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .ab-stat-card {
    padding: 14px 16px;
  }
  .ab-stat-value-large {
    font-size: 22px;
  }
  .ab-row {
    flex-wrap: wrap;
    padding: 12px 14px;
    gap: 8px;
  }
  .ab-row-left {
    flex: 1;
    min-width: 120px;
  }
  .ab-row-center {
    flex: 0 0 auto;
  }
  .ab-row-status {
    flex: 0 0 auto;
  }
  .ab-row-date {
    flex: 0 0 auto;
    font-size: 11px;
  }
  .ab-row-action {
    flex: 1;
    justify-content: flex-end;
  }
  .ab-title {
    font-size: 19px;
  }
}
@media (max-width: 480px) {
  .ab-stats {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .ab-stat-card {
    padding: 12px;
  }
  .ab-stat-value-large {
    font-size: 20px;
  }
  .ab-stat-label-top {
    font-size: 11px;
  }
  .ab-row {
    padding: 10px 12px;
    gap: 6px;
  }
  .ab-row-name {
    font-size: 13px;
  }
  .ab-row-email {
    font-size: 11px;
  }
  .ab-detail-btn {
    padding: 5px 12px;
    font-size: 11px;
  }
  .ab-filter-bar {
    padding: 10px 12px;
  }
  .ab-filter-tab {
    padding: 4px 10px;
    font-size: 11px;
  }
  .ab-header-img {
    width: 64px;
    height: 64px;
  }
}
`