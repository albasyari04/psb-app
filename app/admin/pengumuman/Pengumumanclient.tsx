'use client'

import { useState, useEffect, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Announcement {
  id: string
  judul: string
  tipe: 'Penting' | 'Informasi' | 'Info' | 'Peringatan'
  konten: string
  tanggal: string
  lampiran_url: string | null
  lampiran_nama: string | null
  created_at: string
  updated_at: string
}

interface FormData {
  judul: string
  tipe: string
  konten: string
  tanggal: string
  lampiran_url: string
  lampiran_nama: string
}

const EMPTY_FORM: FormData = {
  judul: '', tipe: 'Informasi', konten: '',
  tanggal: new Date().toISOString().split('T')[0],
  lampiran_url: '', lampiran_nama: '',
}

const TIPE_OPTIONS = ['Penting', 'Informasi', 'Info', 'Peringatan'] as const

const TIPE_CONFIG: Record<string, {
  bg: string; color: string; border: string;
  lightBg: string; icon: string; gradient: string;
}> = {
  Penting:    { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', lightBg: '#fff5f6', icon: '🔴', gradient: 'linear-gradient(135deg, #e11d48, #be123c)' },
  Informasi:  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', lightBg: '#f0f7ff', icon: '🔵', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
  Info:       { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', lightBg: '#f2fef5', icon: '🟢', gradient: 'linear-gradient(135deg, #16a34a, #15803d)' },
  Peringatan: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', lightBg: '#fffdf0', icon: '🟡', gradient: 'linear-gradient(135deg, #d97706, #b45309)' },
}

function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
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

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IcPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IcEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IcTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const IcEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IcLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)
const IcX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IcSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IcFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)
const IcCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IcBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const IcChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function PengumumanClient() {
  const [list, setList]           = useState<Announcement[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)

  const [modal, setModal]         = useState<'none' | 'form' | 'detail' | 'confirm-delete'>('none')
  const [editTarget, setEditTarget]     = useState<Announcement | null>(null)
  const [detailTarget, setDetailTarget] = useState<Announcement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)

  const [form, setForm]           = useState<FormData>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [filterTipe, setFilterTipe] = useState('')
  const [searchQ, setSearchQ]       = useState('')

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterTipe) params.set('tipe', filterTipe)
      if (searchQ)    params.set('q', searchQ)
      params.set('limit', '50')
      const res = await fetch(`/api/admin/announcements?${params}`)
      const json = await res.json()
      if (res.ok) { setList(json.data ?? []); setTotal(json.total ?? 0) }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filterTipe, searchQ])

  useEffect(() => { fetchList() }, [fetchList])

  function openCreate() { setEditTarget(null); setForm(EMPTY_FORM); setFormError(''); setModal('form') }

  function openEdit(item: Announcement) {
    setEditTarget(item)
    setForm({ judul: item.judul, tipe: item.tipe, konten: item.konten, tanggal: item.tanggal, lampiran_url: item.lampiran_url ?? '', lampiran_nama: item.lampiran_nama ?? '' })
    setFormError(''); setModal('form')
  }

  function openDetail(item: Announcement) { setDetailTarget(item); setModal('detail') }
  function openDelete(item: Announcement) { setDeleteTarget(item); setModal('confirm-delete') }

  function closeModal() {
    setModal('none'); setEditTarget(null); setDetailTarget(null); setDeleteTarget(null); setFormError('')
  }

  async function handleSubmit() {
    setFormError('')
    if (!form.judul.trim())   { setFormError('Judul wajib diisi'); return }
    if (!form.tipe)           { setFormError('Tipe wajib dipilih'); return }
    if (!form.konten.trim())  { setFormError('Konten wajib diisi'); return }
    if (!form.tanggal)        { setFormError('Tanggal wajib diisi'); return }
    if (form.lampiran_url && !/^https?:\/\/.+/.test(form.lampiran_url.trim())) {
      setFormError('Lampiran URL harus diawali https:// atau http://'); return
    }
    setSaving(true)
    try {
      const url    = editTarget ? `/api/admin/announcements/${editTarget.id}` : '/api/admin/announcements'
      const method = editTarget ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: form.judul.trim(), tipe: form.tipe, konten: form.konten.trim(),
          tanggal: form.tanggal,
          lampiran_url:  form.lampiran_url.trim()  || null,
          lampiran_nama: form.lampiran_nama.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setFormError(json.error ?? 'Terjadi kesalahan'); return }
      closeModal(); fetchList()
    } catch { setFormError('Gagal menyimpan. Periksa koneksi internet.') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(deleteTarget.id)
    try {
      const res = await fetch(`/api/admin/announcements/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) { closeModal(); fetchList() }
    } catch (e) { console.error(e) }
    finally { setDeleting(null) }
  }

  // Stats per tipe
  const tipeCount = TIPE_OPTIONS.reduce((acc, t) => {
    acc[t] = list.filter(i => i.tipe === t).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ fontFamily: "'DM Sans', 'Nunito', 'Plus Jakarta Sans', sans-serif" }}>

      {/* ── GLOBAL STYLES ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap');

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .ann-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeUp 0.35s ease both;
        }
        .ann-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important;
        }
        .btn-action {
          transition: all 0.15s ease;
        }
        .btn-action:hover {
          transform: translateY(-1px);
          filter: brightness(0.95);
        }
        .btn-action:active {
          transform: translateY(0);
        }
        .input-field {
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-field:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
          background: #fff !important;
          outline: none;
        }
        .tipe-pill {
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .tipe-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .tipe-pill.active {
          transform: translateY(-1px);
        }
        .modal-sheet {
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .live-dot {
          animation: pulse-dot 2s ease infinite;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
      `}</style>

      {/* ── STATS ROW ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>

        {/* Total card */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          borderRadius: 20, padding: '18px 16px',
          boxShadow: '0 8px 24px rgba(99,102,241,0.28)',
          gridColumn: '1 / -1',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', right: -20, top: -20,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute', right: 20, bottom: -30,
            width: 70, height: 70, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                }}>
                  <IcBell />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Total Pengumuman
                </span>
              </div>
              <p style={{ fontSize: 38, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>
                {loading ? '–' : total}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '6px 0 0' }}>
                {loading ? 'Memuat data...' : 'pengumuman aktif terkelola'}
              </p>
            </div>
            <button
              onClick={openCreate}
              className="btn-action"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 14,
                border: '1.5px solid rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                flexShrink: 0,
              }}
            >
              <IcPlus /> Buat
            </button>
          </div>
        </div>

        {/* Mini stats per tipe */}
        {TIPE_OPTIONS.slice(0, 4).map((tipe, i) => {
          const cfg = TIPE_CONFIG[tipe]
          return (
            <div
              key={tipe}
              className="tipe-pill"
              onClick={() => setFilterTipe(filterTipe === tipe ? '' : tipe)}
              style={{
                background: filterTipe === tipe ? cfg.bg : '#fff',
                border: `1.5px solid ${filterTipe === tipe ? cfg.border : '#f1f5f9'}`,
                borderRadius: 16, padding: '12px 14px',
                boxShadow: filterTipe === tipe
                  ? `0 4px 16px rgba(0,0,0,0.08)`
                  : '0 2px 8px rgba(15,23,42,0.04)',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {tipe}
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: filterTipe === tipe ? cfg.color : '#1e293b', margin: 0, lineHeight: 1 }}>
                {loading ? '–' : tipeCount[tipe] ?? 0}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── SEARCH & FILTER BAR ───────────────────────────────────────────── */}
      <div style={{
        background: '#fff', borderRadius: 18, padding: '12px 14px',
        boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
        border: '1px solid #f1f5f9',
        display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center',
      }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 11, pointerEvents: 'none', display: 'flex' }}>
            <IcSearch />
          </span>
          <input
            className="input-field"
            placeholder="Cari judul pengumuman..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            style={{
              width: '100%', paddingLeft: 34, paddingRight: 12,
              paddingTop: 9, paddingBottom: 9,
              borderRadius: 12, border: '1.5px solid #e2e8f0',
              fontSize: 12.5, background: '#f8fafc',
              boxSizing: 'border-box', color: '#1e293b',
            }}
          />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 10, display: 'flex', color: '#94a3b8' }}>
            <IcFilter />
          </span>
          <select
            className="input-field"
            value={filterTipe}
            onChange={e => setFilterTipe(e.target.value)}
            style={{
              paddingLeft: 28, paddingRight: 12,
              paddingTop: 9, paddingBottom: 9,
              borderRadius: 12, border: '1.5px solid #e2e8f0',
              fontSize: 12.5, background: '#f8fafc',
              color: filterTipe ? '#1e293b' : '#94a3b8',
              cursor: 'pointer', appearance: 'none',
            }}
          >
            <option value="">Semua</option>
            {TIPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* ── LIST SECTION ──────────────────────────────────────────────────── */}
      <section style={{
        background: '#fff', borderRadius: 24,
        boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
      }}>
        {/* Section header */}
        <div style={{
          padding: '16px 18px 12px',
          borderBottom: '1px solid #f8fafc',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>
              Daftar Pengumuman
            </p>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
              {loading ? 'Memuat...' : `${total} pengumuman ditemukan`}
            </p>
          </div>
          {!loading && total > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 99,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
            }}>
              <span className="live-dot" style={{
                width: 6, height: 6, borderRadius: '50%', background: '#16a34a',
              }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', letterSpacing: '0.04em' }}>
                LIVE
              </span>
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: '12px 18px', display: 'grid', gap: 10 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                height: 90, borderRadius: 18,
                background: 'linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%)',
                backgroundSize: '400px 100%',
                animation: `shimmer 1.6s ease infinite`,
                animationDelay: `${i * 0.15}s`,
              }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, margin: '0 auto 16px',
            }}>
              📭
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', margin: '0 0 6px' }}>
              Belum ada pengumuman
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 20px' }}>
              {filterTipe || searchQ ? 'Coba ubah filter pencarian' : 'Klik "Buat" untuk menambahkan pengumuman pertama'}
            </p>
            {!filterTipe && !searchQ && (
              <button
                onClick={openCreate}
                className="btn-action"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 12,
                  border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                  boxShadow: '0 6px 16px rgba(99,102,241,0.3)',
                }}
              >
                <IcPlus /> Buat Pengumuman Pertama
              </button>
            )}
          </div>
        )}

        {/* List items */}
        {!loading && list.length > 0 && (
          <div style={{ padding: '10px 12px', display: 'grid', gap: 8 }}>
            {list.map((item, idx) => {
              const cfg = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG['Informasi']
              return (
                <div
                  key={item.id}
                  className="ann-card"
                  style={{
                    padding: '14px 15px', borderRadius: 18,
                    border: '1.5px solid #f1f5f9',
                    background: '#fafbfd',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                    animationDelay: `${idx * 0.06}s`,
                  }}
                >
                  {/* Top row: badge + tanggal */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', gap: 8, marginBottom: 9,
                  }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 10, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 999,
                      background: cfg.bg, color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                      <span style={{ fontSize: 8 }}>●</span>
                      {item.tipe}
                    </span>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 10.5, color: '#94a3b8', flexShrink: 0,
                    }}>
                      <IcCalendar />
                      {formatTanggalShort(item.tanggal)}
                    </span>
                  </div>

                  {/* Judul */}
                  <p style={{
                    fontSize: 13.5, fontWeight: 700, color: '#0f172a',
                    margin: '0 0 5px', lineHeight: 1.4,
                  }}>
                    {item.judul}
                  </p>

                  {/* Preview konten */}
                  <p style={{
                    fontSize: 12, color: '#64748b', margin: '0 0 10px',
                    lineHeight: 1.55, display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.konten}
                  </p>

                  {/* Lampiran badge */}
                  {item.lampiran_url && (
                    <a
                      href={item.lampiran_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', borderRadius: 999,
                        background: '#eff6ff', border: '1px solid #bfdbfe',
                        color: '#2563eb', fontSize: 10.5, fontWeight: 600,
                        textDecoration: 'none', marginBottom: 10,
                      }}
                    >
                      <IcLink />
                      {item.lampiran_nama || 'Lihat Lampiran'}
                      <IcChevronRight />
                    </a>
                  )}

                  {/* Divider */}
                  <div style={{ height: 1, background: '#f1f5f9', margin: '10px 0 10px' }} />

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => openDetail(item)}
                      className="btn-action"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 13px', borderRadius: 10,
                        border: '1.5px solid #e2e8f0', background: '#fff',
                        fontSize: 11.5, fontWeight: 600, color: '#475569',
                        cursor: 'pointer', flex: 1, justifyContent: 'center',
                      }}
                    >
                      <IcEye /> Detail
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="btn-action"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 13px', borderRadius: 10,
                        border: '1.5px solid #ddd6fe', background: '#f5f3ff',
                        fontSize: 11.5, fontWeight: 600, color: '#6d28d9',
                        cursor: 'pointer', flex: 1, justifyContent: 'center',
                      }}
                    >
                      <IcEdit /> Edit
                    </button>
                    <button
                      onClick={() => openDelete(item)}
                      className="btn-action"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 13px', borderRadius: 10,
                        border: '1.5px solid #fecaca', background: '#fff5f5',
                        fontSize: 11.5, fontWeight: 600, color: '#dc2626',
                        cursor: 'pointer', flex: 1, justifyContent: 'center',
                      }}
                    >
                      <IcTrash /> Hapus
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL BACKDROP
          ══════════════════════════════════════════════════════════════════ */}
      {modal !== 'none' && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(2,6,23,0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 200,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >

          {/* ── FORM MODAL ────────────────────────────────────────────────── */}
          {modal === 'form' && (
            <div
              onClick={e => e.stopPropagation()}
              className="modal-sheet"
              style={{
                width: '100%', maxWidth: 440,
                background: '#fff',
                borderRadius: '28px 28px 0 0',
                padding: '8px 20px 40px',
                maxHeight: '94dvh',
                overflowY: 'auto',
              }}
            >
              {/* Handle */}
              <div style={{ width: 36, height: 4, borderRadius: 999, background: '#e2e8f0', margin: '14px auto 20px' }} />

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 99,
                    background: editTarget ? '#faf5ff' : '#eef2ff',
                    border: `1px solid ${editTarget ? '#e9d5ff' : '#c7d2fe'}`,
                    marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: editTarget ? '#7c3aed' : '#4f46e5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {editTarget ? '✏️ Mode Edit' : '✨ Buat Baru'}
                    </span>
                  </div>
                  <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', margin: '0 0 3px', fontFamily: "'DM Serif Display', serif" }}>
                    {editTarget ? 'Edit Pengumuman' : 'Buat Pengumuman'}
                  </h2>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    {editTarget ? 'Ubah isi pengumuman yang sudah ada.' : 'Isi detail pengumuman baru.'}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="btn-action"
                  style={{
                    width: 36, height: 36, borderRadius: 12,
                    border: '1.5px solid #e2e8f0', background: '#f8fafc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#64748b', flexShrink: 0,
                  }}
                >
                  <IcX />
                </button>
              </div>

              {/* Error */}
              {formError && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 14px', borderRadius: 14,
                  background: '#fef2f2', border: '1.5px solid #fecaca',
                  color: '#dc2626', fontSize: 12, fontWeight: 600,
                  marginBottom: 18,
                }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  {formError}
                </div>
              )}

              {/* Fields */}
              <div style={{ display: 'grid', gap: 16 }}>

                {/* Judul */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 7 }}>
                    Judul <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <input
                    className="input-field"
                    value={form.judul}
                    onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                    placeholder="Contoh: Penutupan pendaftaran gelombang 1"
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 14,
                      border: '1.5px solid #e2e8f0', fontSize: 13,
                      boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a',
                    }}
                  />
                </div>

                {/* Tipe + Tanggal */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 7 }}>
                      Tipe <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <select
                      className="input-field"
                      value={form.tipe}
                      onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))}
                      style={{
                        width: '100%', padding: '11px 12px', borderRadius: 14,
                        border: '1.5px solid #e2e8f0', fontSize: 13,
                        background: '#f8fafc', boxSizing: 'border-box', cursor: 'pointer',
                        color: '#0f172a',
                      }}
                    >
                      {TIPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 7 }}>
                      Tanggal <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <input
                      className="input-field"
                      type="date"
                      value={form.tanggal}
                      onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                      style={{
                        width: '100%', padding: '11px 12px', borderRadius: 14,
                        border: '1.5px solid #e2e8f0', fontSize: 13,
                        background: '#f8fafc', boxSizing: 'border-box', color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                {/* Tipe preview badge */}
                {form.tipe && (() => {
                  const cfg = TIPE_CONFIG[form.tipe]
                  return cfg ? (
                    <div style={{
                      padding: '10px 14px', borderRadius: 12,
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>
                        Tipe <strong>{form.tipe}</strong> dipilih
                      </span>
                    </div>
                  ) : null
                })()}

                {/* Konten */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 7 }}>
                    Isi Konten <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <textarea
                    className="input-field"
                    value={form.konten}
                    onChange={e => setForm(f => ({ ...f, konten: e.target.value }))}
                    placeholder="Tulis isi pengumuman secara lengkap dan jelas..."
                    rows={5}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 14,
                      border: '1.5px solid #e2e8f0', fontSize: 13,
                      resize: 'vertical', boxSizing: 'border-box',
                      background: '#f8fafc', lineHeight: 1.65, color: '#0f172a',
                    }}
                  />
                </div>

                {/* Lampiran section */}
                <div style={{
                  padding: '14px', borderRadius: 16,
                  background: '#f8fafc', border: '1.5px dashed #e2e8f0',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    📎 Lampiran <span style={{ fontWeight: 400, color: '#94a3b8' }}>(opsional)</span>
                  </p>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <input
                      className="input-field"
                      value={form.lampiran_url}
                      onChange={e => setForm(f => ({ ...f, lampiran_url: e.target.value }))}
                      placeholder="https://drive.google.com/..."
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 12,
                        border: '1.5px solid #e2e8f0', fontSize: 12.5,
                        boxSizing: 'border-box', background: '#fff', color: '#0f172a',
                      }}
                    />
                    <input
                      className="input-field"
                      value={form.lampiran_nama}
                      onChange={e => setForm(f => ({ ...f, lampiran_nama: e.target.value }))}
                      placeholder="Nama tampilan (cth: Download PDF Jadwal)"
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 12,
                        border: '1.5px solid #e2e8f0', fontSize: 12.5,
                        boxSizing: 'border-box', background: '#fff', color: '#0f172a',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button
                  onClick={closeModal}
                  className="btn-action"
                  style={{
                    flex: 1, padding: '13px', borderRadius: 16,
                    border: '1.5px solid #e2e8f0', background: '#f8fafc',
                    fontSize: 13, fontWeight: 700, color: '#64748b', cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="btn-action"
                  style={{
                    flex: 2, padding: '13px', borderRadius: 16,
                    border: 'none',
                    background: saving ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    fontSize: 13, fontWeight: 700, color: '#fff',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: saving ? 'none' : '0 6px 20px rgba(99,102,241,0.35)',
                  }}
                >
                  {saving ? '⏳ Menyimpan...' : editTarget ? '💾 Simpan Perubahan' : '✨ Buat Pengumuman'}
                </button>
              </div>
            </div>
          )}

          {/* ── DETAIL MODAL ──────────────────────────────────────────────── */}
          {modal === 'detail' && detailTarget && (() => {
            const cfg = TIPE_CONFIG[detailTarget.tipe] ?? TIPE_CONFIG['Informasi']
            return (
              <div
                onClick={e => e.stopPropagation()}
                className="modal-sheet"
                style={{
                  width: '100%', maxWidth: 440,
                  background: '#fff',
                  borderRadius: '28px 28px 0 0',
                  padding: '8px 20px 44px',
                  maxHeight: '90dvh', overflowY: 'auto',
                }}
              >
                {/* Handle */}
                <div style={{ width: 36, height: 4, borderRadius: 999, background: '#e2e8f0', margin: '14px auto 20px' }} />

                {/* Color accent strip */}
                <div style={{
                  height: 4, borderRadius: 99,
                  background: cfg.gradient,
                  marginBottom: 20,
                  boxShadow: `0 2px 8px ${cfg.color}33`,
                }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 10, fontWeight: 700,
                    padding: '5px 12px', borderRadius: 999,
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    <span style={{ fontSize: 8 }}>●</span>
                    {detailTarget.tipe}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                      <IcCalendar /> {formatTanggal(detailTarget.tanggal)}
                    </span>
                    <button
                      onClick={closeModal}
                      className="btn-action"
                      style={{
                        width: 32, height: 32, borderRadius: 10,
                        border: '1.5px solid #e2e8f0', background: '#f8fafc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#64748b',
                      }}
                    >
                      <IcX />
                    </button>
                  </div>
                </div>

                {/* Judul */}
                <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', lineHeight: 1.3, fontFamily: "'DM Serif Display', serif" }}>
                  {detailTarget.judul}
                </h2>

                <div style={{ height: 1, background: '#f1f5f9', marginBottom: 16 }} />

                {/* Konten */}
                <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.8, margin: '0 0 20px', whiteSpace: 'pre-wrap' }}>
                  {detailTarget.konten}
                </p>

                {/* Lampiran */}
                {detailTarget.lampiran_url && (
                  <a
                    href={detailTarget.lampiran_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '13px 16px', borderRadius: 16,
                      background: '#eff6ff', border: '1.5px solid #bfdbfe',
                      color: '#2563eb', fontSize: 13, fontWeight: 600,
                      textDecoration: 'none', marginBottom: 18,
                    }}
                  >
                    <IcLink />
                    {detailTarget.lampiran_nama || 'Buka Lampiran'}
                    <span style={{ marginLeft: 'auto', fontSize: 14 }}>↗</span>
                  </a>
                )}

                {/* Meta info */}
                <div style={{
                  padding: '12px 14px', borderRadius: 14,
                  background: '#f8fafc', border: '1px solid #f1f5f9',
                }}>
                  <p style={{ fontSize: 10.5, fontWeight: 600, color: '#94a3b8', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Informasi Rekaman
                  </p>
                  <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 3px' }}>
                    📅 Dibuat: {new Date(detailTarget.created_at).toLocaleString('id-ID')}
                  </p>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
                    🔄 Diperbarui: {new Date(detailTarget.updated_at).toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button
                    onClick={() => { closeModal(); setTimeout(() => openEdit(detailTarget), 10) }}
                    className="btn-action"
                    style={{
                      flex: 1, padding: '13px', borderRadius: 16,
                      border: '1.5px solid #ddd6fe', background: '#f5f3ff',
                      fontSize: 13, fontWeight: 700, color: '#6d28d9', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <IcEdit /> Edit
                  </button>
                  <button
                    onClick={() => { closeModal(); setTimeout(() => openDelete(detailTarget), 10) }}
                    className="btn-action"
                    style={{
                      flex: 1, padding: '13px', borderRadius: 16,
                      border: '1.5px solid #fecaca', background: '#fff5f5',
                      fontSize: 13, fontWeight: 700, color: '#dc2626', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <IcTrash /> Hapus
                  </button>
                </div>
              </div>
            )
          })()}

          {/* ── CONFIRM DELETE MODAL ──────────────────────────────────────── */}
          {modal === 'confirm-delete' && deleteTarget && (
            <div
              onClick={e => e.stopPropagation()}
              className="modal-sheet"
              style={{
                width: '100%', maxWidth: 440,
                background: '#fff',
                borderRadius: '28px 28px 0 0',
                padding: '8px 20px 44px',
              }}
            >
              {/* Handle */}
              <div style={{ width: 36, height: 4, borderRadius: 999, background: '#e2e8f0', margin: '14px auto 24px' }} />

              {/* Icon */}
              <div style={{
                width: 64, height: 64, borderRadius: 22,
                background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
                border: '2px solid #fecdd3',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 18px',
                boxShadow: '0 8px 24px rgba(225,29,72,0.15)',
              }}>
                🗑️
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '0 0 8px', fontFamily: "'DM Serif Display', serif" }}>
                Hapus Pengumuman?
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', margin: '0 0 6px', lineHeight: 1.55 }}>
                Pengumuman berikut akan dihapus secara permanen:
              </p>
              <p style={{
                fontSize: 13, fontWeight: 700, color: '#e11d48',
                textAlign: 'center', margin: '0 0 24px',
                padding: '10px 16px', borderRadius: 12,
                background: '#fff1f2', border: '1px solid #fecdd3',
              }}>
                &ldquo;{deleteTarget.judul}&rdquo;
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={closeModal}
                  className="btn-action"
                  style={{
                    flex: 1, padding: '13px', borderRadius: 16,
                    border: '1.5px solid #e2e8f0', background: '#f8fafc',
                    fontSize: 13, fontWeight: 700, color: '#64748b', cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!!deleting}
                  className="btn-action"
                  style={{
                    flex: 2, padding: '13px', borderRadius: 16,
                    border: 'none',
                    background: deleting ? '#fca5a5' : 'linear-gradient(135deg, #e11d48, #be123c)',
                    fontSize: 13, fontWeight: 700, color: '#fff',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    boxShadow: deleting ? 'none' : '0 6px 20px rgba(225,29,72,0.3)',
                  }}
                >
                  {deleting ? '⏳ Menghapus...' : '🗑️ Ya, Hapus Sekarang'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}