'use client'

import React, { useState, useEffect, useCallback, ReactNode } from 'react'
import { useSettings } from '@/contexts/SettingsContext'

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

// Disesuaikan dengan pengumuman-desain.png:
// PENGUMUMAN(ungu), INFORMASI(biru), PERATURAN(kuning/orange), INFO(hijau)
// Mapping tipe ke desain
const TIPE_CONFIG: Record<string, {
  bg: string; color: string; border: string;
  lightBg: string; iconBg: string; gradient: string; dotColor: string;
}> = {
  Penting:    {
    bg: 'var(--purple-lighter)', color: 'var(--purple)', border: 'var(--purple-light)',
    lightBg: 'var(--purple-lighter)', iconBg: 'linear-gradient(135deg, var(--purple), var(--violet-1))',
    gradient: 'linear-gradient(135deg, var(--purple), var(--violet-1))', dotColor: 'var(--purple)',
  },
  Informasi:  {
    bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe',
    lightBg: '#f0f7ff', iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', dotColor: '#3b82f6',
  },
  Info:       {
    bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0',
    lightBg: '#f2fef5', iconBg: 'linear-gradient(135deg, #22c55e, #16a34a)',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', dotColor: '#22c55e',
  },
  Peringatan: {
    bg: 'var(--white)beb', color: '#d97706', border: '#fde68a',
    lightBg: 'var(--white)df0', iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', dotColor: '#f59e0b',
  },
}

// Icon SVG per tipe (sesuai desain)
const TIPE_ICONS: Record<string, ReactNode> = {
  Penting: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
  Informasi: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Info: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  Peringatan: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
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
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gray-light)" strokeWidth="2" strokeLinecap="round">
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
const IcBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IcChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function PengumumanClient() {
  const { t } = useSettings()
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
  const [sortBy, setSortBy]         = useState('Terbaru')

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

  // Stat cards config sesuai pengumuman-desain.png
  const statCards = [
    { label: t('pengumuman_stat_penting'), tipe: 'Penting',    iconBg: 'var(--purple-light)', iconColor: 'var(--purple)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg> },
    { label: t('pengumuman_stat_informasi'), tipe: 'Informasi',  iconBg: '#dbeafe', iconColor: '#2563eb',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> },
    { label: t('pengumuman_stat_peraturan'), tipe: 'Peringatan', iconBg: '#fef3c7', iconColor: '#d97706',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
    { label: t('pengumuman_stat_info'), tipe: 'Info',       iconBg: '#dcfce7', iconColor: '#16a34a',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg> },
  ]

  return (
    <div className="admin-zoom-scope" style={{ fontFamily: "'DM Sans', 'Nunito', 'Plus Jakarta Sans', sans-serif", background: 'var(--purple-lighter)', minHeight: '100vh' }}>

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
          box-shadow: 0 10px 28px rgba(15,23,42,0.10) !important;
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
          border-color: var(--violet-2) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
          background: var(--white) !important;
          outline: none;
        }
        .stat-card {
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.08) !important;
        }
        .modal-sheet {
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .live-dot {
          animation: pulse-dot 2s ease infinite;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
        .header-back-btn:hover { background: var(--border) !important; }
        .sort-btn:hover { background: var(--border) !important; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          HEADER — Style seperti halaman Pengaturan (back arrow + judul tengah + tombol buat)
          ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          height: 56, position: 'relative',
        }}>
          {/* Back button kiri */}
          <button
            className="header-back-btn btn-action"
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: '1.5px solid var(--border)',
              background: 'var(--admin-page-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--ink)',
              flexShrink: 0,
            }}
          >
            <IcBack />
          </button>

          {/* Judul kiri — setelah back button, rata kiri */}
          <div style={{
            marginLeft: 12, flex: 1,
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: 0, lineHeight: 1.2 }}>
              {t('pengumuman_page_title')}
            </p>
            <p style={{ fontSize: 11, color: 'var(--gray-light)', margin: 0 }}>
              {t('pengumuman_page_sub')}
            </p>
          </div>

          {/* Tombol Buat kanan — seperti desain: ungu/indigo dengan ikon bell */}
          <button
            onClick={openCreate}
            className="btn-action"
            style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, var(--violet-2), var(--violet-2))',
              color: 'var(--white)', fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              flexShrink: 0,
            }}
          >
            <IcBell />
            {t('pengumuman_create_btn')}
          </button>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 14px', maxWidth: 480, margin: '0 auto' }}>

        {/* ── STAT CARDS — 4 kolom sesuai desain ──────────────────────── */}
        <div style={{
          background: 'var(--white)', borderRadius: 20, padding: '14px 10px',
          boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
          border: '1px solid var(--border)',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8, marginBottom: 14,
        }}>
          {statCards.map((sc, i) => (
            <div
              key={sc.tipe}
              className="stat-card"
              onClick={() => setFilterTipe(filterTipe === sc.tipe ? '' : sc.tipe)}
              style={{
                background: filterTipe === sc.tipe ? TIPE_CONFIG[sc.tipe].bg : 'var(--purple-lighter)',
                border: `1.5px solid ${filterTipe === sc.tipe ? TIPE_CONFIG[sc.tipe].border : 'var(--border)'}`,
                borderRadius: 14, padding: '12px 8px 10px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {/* Icon bulat */}
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: sc.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sc.icon}
              </div>
              <p style={{
                fontSize: 9, fontWeight: 700, color: 'var(--gray-light)',
                margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em',
                textAlign: 'center', lineHeight: 1.2,
              }}>
                {sc.label}
              </p>
              <p style={{
                fontSize: 22, fontWeight: 800,
                color: filterTipe === sc.tipe ? TIPE_CONFIG[sc.tipe].color : 'var(--ink)',
                margin: 0, lineHeight: 1,
              }}>
                {loading ? '–' : tipeCount[sc.tipe] ?? 0}
              </p>
            </div>
          ))}
        </div>

        {/* ── SEARCH & FILTER ──────────────────────────────────────────── */}
        <div style={{
          background: 'var(--white)', borderRadius: 18, padding: '10px 12px',
          boxShadow: '0 2px 10px rgba(15,23,42,0.05)',
          border: '1px solid var(--border)',
          display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center',
        }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 10, pointerEvents: 'none', display: 'flex' }}>
              <IcSearch />
            </span>
            <input
              className="input-field"
              placeholder={t('pengumuman_search_ph')}
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{
                width: '100%', paddingLeft: 32, paddingRight: 10,
                paddingTop: 9, paddingBottom: 9,
                borderRadius: 12, border: '1.5px solid var(--border)',
                fontSize: 12.5, background: 'var(--admin-page-bg)',
                boxSizing: 'border-box', color: 'var(--ink)',
              }}
            />
          </div>
          {/* Filter pill — sesuai desain (tulisan "Semua" dengan ikon filter) */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 10, display: 'flex', color: 'var(--gray)', pointerEvents: 'none' }}>
              <IcFilter />
            </span>
            <select
              className="input-field"
              value={filterTipe}
              onChange={e => setFilterTipe(e.target.value)}
              style={{
                paddingLeft: 28, paddingRight: 10,
                paddingTop: 9, paddingBottom: 9,
                borderRadius: 12, border: '1.5px solid var(--border)',
                fontSize: 12.5, background: 'var(--admin-page-bg)',
                color: filterTipe ? 'var(--ink)' : 'var(--gray)',
                cursor: 'pointer', appearance: 'none',
                minWidth: 80,
              }}
            >
              <option value="">{t('pengumuman_filter_all')}</option>
              {TIPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        {/* ── LIST SECTION ─────────────────────────────────────────────── */}
        <section style={{
          background: 'var(--white)', borderRadius: 20,
          boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
          border: '1px solid var(--border)', overflow: 'hidden',
        }}>
          {/* Section header */}
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid var(--admin-page-bg)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* doc icon kecil */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                  {t('pengumuman_list_title')}
                </p>
                <p style={{ fontSize: 10.5, color: 'var(--gray-light)', margin: 0 }}>
                  {loading ? t('pengumuman_loading') : `${total} ${t('pengumuman_count_found')}`}
                </p>
              </div>
            </div>

            {/* Sort dropdown sesuai desain "Terbaru ▾" */}
            <button
              className="sort-btn btn-action"
              onClick={() => setSortBy(sortBy === 'Terbaru' ? 'Terlama' : 'Terbaru')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 10,
                border: '1.5px solid var(--border)', background: 'var(--admin-page-bg)',
                fontSize: 11.5, fontWeight: 600, color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              {sortBy === 'Terbaru' ? t('pengumuman_sort_newest') : t('pengumuman_sort_oldest')}
              <IcChevronDown />
            </button>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ padding: '12px 14px', display: 'grid', gap: 10 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height: 110, borderRadius: 16,
                  background: 'linear-gradient(90deg, var(--admin-page-bg) 25%, var(--border) 50%, var(--admin-page-bg) 75%)',
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
                background: 'linear-gradient(135deg, var(--border), var(--border))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px',
              }}>
                📭
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate)', margin: '0 0 6px' }}>
                {t('pengumuman_empty_title')}
              </p>
              <p style={{ fontSize: 12, color: 'var(--gray-light)', margin: '0 0 20px' }}>
                {filterTipe || searchQ ? t('pengumuman_empty_filtered') : t('pengumuman_empty_default')}
              </p>
              {!filterTipe && !searchQ && (
                <button
                  onClick={openCreate}
                  className="btn-action"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '10px 18px', borderRadius: 12,
                    border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, var(--violet-2), var(--violet-2))',
                    color: 'var(--white)', fontSize: 12, fontWeight: 700,
                    boxShadow: '0 6px 16px rgba(99,102,241,0.3)',
                  }}
                >
                  <IcPlus /> {t('pengumuman_create_first')}
                </button>
              )}
            </div>
          )}

          {/* List items — sesuai pengumuman-desain.png */}
          {!loading && list.length > 0 && (
            <div style={{ padding: '10px 12px', display: 'grid', gap: 10 }}>
              {list.map((item, idx) => {
                const cfg = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG['Informasi']
                const icon = TIPE_ICONS[item.tipe] ?? TIPE_ICONS['Informasi']
                return (
                  <div
                    key={item.id}
                    className="ann-card"
                    style={{
                      padding: '14px 14px 12px',
                      borderRadius: 18,
                      border: '1.5px solid var(--border)',
                      background: 'var(--white)',
                      boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                      animationDelay: `${idx * 0.06}s`,
                    }}
                  >
                    {/* Top row: icon box + konten + tanggal */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>

                      {/* Icon box gradient — sesuai desain */}
                      <div style={{
                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                        background: cfg.iconBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 12px ${cfg.dotColor}30`,
                      }}>
                        {icon}
                      </div>

                      {/* Kanan: tipe badge + tanggal + judul + konten */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Badge tipe + tanggal */}
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: 4,
                        }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: cfg.color,
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>
                            {item.tipe}
                          </span>
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: 3,
                            fontSize: 10, color: 'var(--gray-light)', flexShrink: 0,
                          }}>
                            <IcCalendar />
                            {formatTanggalShort(item.tanggal)}
                          </span>
                        </div>

                        {/* Judul */}
                        <p style={{
                          fontSize: 13.5, fontWeight: 700, color: 'var(--ink)',
                          margin: '0 0 3px', lineHeight: 1.35,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {item.judul}
                        </p>

                        {/* Preview konten */}
                        <p style={{
                          fontSize: 11.5, color: 'var(--gray)', margin: 0,
                          lineHeight: 1.5, display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {item.konten}
                        </p>
                      </div>
                    </div>

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
                      </a>
                    )}

                    {/* Divider */}
                    <div style={{ height: 1, background: 'var(--border)', margin: '10px 0 10px' }} />

                    {/* Action buttons — sesuai desain: Detail | Edit | Hapus */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => openDetail(item)}
                        className="btn-action"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          padding: '8px 0', borderRadius: 10,
                          border: '1.5px solid var(--border)', background: 'var(--white)',
                          fontSize: 12, fontWeight: 600, color: 'var(--ink)',
                          cursor: 'pointer', flex: 1,
                        }}
                      >
                        <IcEye /> {t('pengumuman_btn_detail')}
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="btn-action"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          padding: '8px 0', borderRadius: 10,
                          border: '1.5px solid var(--purple-light)', background: 'var(--purple-lighter)',
                          fontSize: 12, fontWeight: 600, color: 'var(--violet-1)',
                          cursor: 'pointer', flex: 1,
                        }}
                      >
                        <IcEdit /> {t('pengumuman_btn_edit')}
                      </button>
                      <button
                        onClick={() => openDelete(item)}
                        className="btn-action"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          padding: '8px 0', borderRadius: 10,
                          border: '1.5px solid #fecaca', background: 'var(--white)5f5',
                          fontSize: 12, fontWeight: 600, color: '#dc2626',
                          cursor: 'pointer', flex: 1,
                        }}
                      >
                        <IcTrash /> {t('pengumuman_btn_delete')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

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
          {/* ── FORM MODAL — desain buat_pengumuman_desain.png ──────────── */}
          {modal === 'form' && (
            <div
              onClick={e => e.stopPropagation()}
              className="modal-sheet"
              style={{
                width: '100%', maxWidth: 480,
                background: 'var(--white)',
                borderRadius: '24px 24px 0 0',
                padding: '0 0 0 0',
                maxHeight: '96dvh',
                overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Handle bar */}
              <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--gray-light)', margin: '12px auto 0', flexShrink: 0 }} />

              {/* Scrollable content */}
              <div style={{ padding: '18px 20px 0', flex: 1, overflowY: 'auto' }}>

                {/* ── Row 1: Badge kiri + X kanan ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  {/* Badge "BUAT BARU" / "MODE EDIT" — pill dengan icon */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '6px 14px', borderRadius: 999,
                    background: editTarget ? 'var(--purple-lighter)' : 'var(--purple-lighter)',
                    border: `1.5px solid ${editTarget ? 'var(--purple-light)' : 'var(--purple-light)'}`,
                  }}>
                    {/* icon kecil di dalam badge */}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke={editTarget ? 'var(--purple)' : 'var(--violet-2)'} strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      {editTarget
                        ? <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>
                        : <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>
                      }
                    </svg>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: editTarget ? 'var(--purple)' : 'var(--violet-2)',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>
                      {editTarget ? 'Mode Edit' : 'Buat Baru'}
                    </span>
                  </div>

                  {/* X button */}
                  <button
                    onClick={closeModal}
                    className="btn-action"
                    style={{
                      width: 38, height: 38, borderRadius: 12,
                      border: '1.5px solid var(--border)', background: 'var(--admin-page-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--gray)',
                    }}
                  >
                    <IcX />
                  </button>
                </div>

                {/* ── Judul halaman ── */}
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '0 0 4px', lineHeight: 1.2 }}>
                  {editTarget ? 'Edit Pengumuman' : 'Buat Pengumuman'}
                </h2>
                <p style={{ fontSize: 12.5, color: 'var(--gray-light)', margin: '0 0 22px' }}>
                  {editTarget ? 'Ubah isi pengumuman yang sudah ada.' : 'Sampaikan informasi penting dengan jelas dan tepat.'}
                </p>

                {/* ── Error banner ── */}
                {formError && (
                  <div style={{
                    padding: '12px 14px', borderRadius: 14, marginBottom: 16,
                    background: 'var(--white)1f2', border: '1.5px solid #fecdd3',
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 12.5, color: '#e11d48', fontWeight: 500,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {formError}
                  </div>
                )}

                {/* ══ JUDUL FIELD ══ */}
                <div style={{
                  background: 'var(--white)', borderRadius: 18, padding: '16px',
                  border: '1.5px solid var(--border)',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                  marginBottom: 14,
                }}>
                  {/* Icon + label row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: 'var(--purple-lighter)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--violet-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <path d="M11 17H8"/><path d="M16 17h-2"/>
                        {/* pen overlay */}
                        <path d="M17.5 14.5l1.5 1.5-3 3-2 .5.5-2z" fill="var(--violet-2)" stroke="var(--violet-2)" strokeWidth="0.5"/>
                      </svg>
                    </div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                      Judul <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                  </div>
                  <input
                    className="input-field"
                    value={form.judul}
                    onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                    placeholder="Contoh: Penutupan pendaftaran gelombang 1"
                    style={{
                      width: '100%', padding: '13px 16px', borderRadius: 14,
                      border: '1.5px solid var(--border)', fontSize: 13.5,
                      background: 'var(--admin-page-bg)', boxSizing: 'border-box', color: 'var(--ink)',
                    }}
                  />
                </div>

                {/* ══ TIPE + TANGGAL ROW ══ */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                  marginBottom: 14,
                }}>
                  {/* Tipe card */}
                  <div style={{
                    background: 'var(--white)', borderRadius: 18, padding: '14px',
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, background: 'var(--purple-lighter)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--violet-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                      </div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                        Tipe <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <select
                        className="input-field"
                        value={form.tipe}
                        onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 32px 10px 12px',
                          borderRadius: 12, border: '1.5px solid var(--border)',
                          fontSize: 13, background: 'var(--admin-page-bg)',
                          color: 'var(--ink)', cursor: 'pointer', appearance: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        {TIPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--gray-light)' }}>
                        <IcChevronDown />
                      </span>
                    </div>
                  </div>

                  {/* Tanggal card */}
                  <div style={{
                    background: 'var(--white)', borderRadius: 18, padding: '14px',
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, background: 'var(--purple-lighter)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--violet-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                        Tanggal <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="input-field"
                        type="date"
                        value={form.tanggal}
                        onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 12px',
                          borderRadius: 12, border: '1.5px solid var(--border)',
                          fontSize: 13, background: 'var(--admin-page-bg)',
                          color: 'var(--ink)', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ══ TIPE PREVIEW BANNER ══ */}
                {form.tipe && (() => {
                  const cfg = TIPE_CONFIG[form.tipe]
                  if (!cfg) return null
                  // icon bulat solid sesuai tipe
                  const dotColor = cfg.dotColor
                  return (
                    <div style={{
                      padding: '14px 16px', borderRadius: 16, marginBottom: 14,
                      background: cfg.bg, border: `1.5px solid ${cfg.border}`,
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      {/* Solid dot besar */}
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: dotColor, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: cfg.color, margin: '0 0 2px' }}>
                          Tipe {form.tipe} dipilih
                        </p>
                        <p style={{ fontSize: 11.5, color: 'var(--gray)', margin: 0 }}>
                          Pengumuman ini akan dikategorikan sebagai {form.tipe}.
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* ══ ISI KONTEN ══ */}
                <div style={{
                  background: 'var(--white)', borderRadius: 18, padding: '16px',
                  border: '1.5px solid var(--border)',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                  marginBottom: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                      Isi Konten <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {/* icon kiri textarea */}
                    <div style={{
                      width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                      background: 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      alignSelf: 'flex-start', marginTop: 2,
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gray)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <line x1="10" y1="9" x2="8" y2="9"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <textarea
                        className="input-field"
                        value={form.konten}
                        onChange={e => setForm(f => ({ ...f, konten: e.target.value }))}
                        placeholder="Tulis isi pengumuman secara lengkap dan jelas..."
                        maxLength={2000}
                        rows={6}
                        style={{
                          width: '100%', padding: '12px 14px 28px',
                          borderRadius: 14, border: '1.5px solid var(--border)',
                          fontSize: 13, resize: 'vertical',
                          boxSizing: 'border-box', background: 'var(--admin-page-bg)',
                          lineHeight: 1.65, color: 'var(--ink)',
                        }}
                      />
                      {/* Counter */}
                      <span style={{
                        position: 'absolute', bottom: 10, right: 14,
                        fontSize: 11, color: 'var(--gray-light)', fontWeight: 500,
                      }}>
                        {form.konten.length}/2000
                      </span>
                    </div>
                  </div>
                </div>

                {/* ══ LAMPIRAN ══ */}
                <div style={{
                  borderRadius: 18, padding: '16px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--white)',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                  marginBottom: 20,
                }}>
                  {/* Header lampiran */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gray)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Lampiran
                    </p>
                    <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--gray-light)' }}>(Opsional)</span>
                  </div>

                  {/* Row 1: Upload file */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 14, border: '1.5px solid var(--border)', background: 'var(--admin-page-bg)',
                    marginBottom: 10,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, background: 'var(--purple-lighter)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--violet-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', margin: '0 0 2px' }}>Unggah file atau masukkan link</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-light)', margin: 0 }}>PDF, DOC, JPG, PNG (maks. 10MB)</p>
                    </div>
                    <button
                      className="btn-action"
                      style={{
                        padding: '8px 16px', borderRadius: 10,
                        border: '1.5px solid var(--violet-2)', background: 'var(--white)',
                        fontSize: 12, fontWeight: 700, color: 'var(--violet-2)',
                        cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                      }}
                    >
                      Pilih File
                    </button>
                  </div>

                  {/* Row 2: Link input */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 14, border: '1.5px solid var(--border)', background: 'var(--admin-page-bg)',
                    marginBottom: 10,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, background: 'var(--purple-lighter)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--violet-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', margin: '0 0 2px' }}>
                        Atau masukkan link <span style={{ color: 'var(--gray-light)', fontWeight: 400 }}>(opsional)</span>
                      </p>
                      <input
                        className="input-field"
                        value={form.lampiran_url}
                        onChange={e => setForm(f => ({ ...f, lampiran_url: e.target.value }))}
                        placeholder="https://drive.google.com/..."
                        style={{
                          width: '100%', padding: '0', border: 'none',
                          fontSize: 12, background: 'transparent',
                          color: 'var(--gray)', outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <button
                      className="btn-action"
                      onClick={() => {/* tambah link logic */}}
                      style={{
                        padding: '8px 14px', borderRadius: 10,
                        border: '1.5px solid var(--violet-2)', background: 'var(--white)',
                        fontSize: 12, fontWeight: 700, color: 'var(--violet-2)',
                        cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                      }}
                    >
                      Tambah Link
                    </button>
                  </div>

                  {/* Row 3: Nama tampilan */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 14, border: '1.5px solid var(--border)', background: 'var(--admin-page-bg)',
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, background: 'var(--border)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gray)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                      </svg>
                    </div>
                    <input
                      className="input-field"
                      value={form.lampiran_nama}
                      onChange={e => setForm(f => ({ ...f, lampiran_nama: e.target.value }))}
                      placeholder="Nama tampilan (cth: Download PDF Jadwal)"
                      style={{
                        flex: 1, padding: '0', border: 'none',
                        fontSize: 13, background: 'transparent',
                        color: 'var(--ink)', outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* ══ ACTION BUTTONS ══ */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <button
                    onClick={closeModal}
                    className="btn-action"
                    style={{
                      flex: 1, padding: '15px', borderRadius: 16,
                      border: '1.5px solid var(--border)', background: 'var(--admin-page-bg)',
                      fontSize: 14, fontWeight: 700, color: 'var(--gray)', cursor: 'pointer',
                    }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="btn-action"
                    style={{
                      flex: 2, padding: '15px', borderRadius: 16, border: 'none',
                      background: saving ? '#a5b4fc' : 'linear-gradient(135deg, var(--violet-2), var(--violet-2))',
                      fontSize: 14, fontWeight: 700, color: 'var(--white)',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: saving ? 'none' : '0 6px 24px rgba(79,70,229,0.4)',
                    }}
                  >
                    {saving ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Menyimpan...
                      </>
                    ) : editTarget ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                          <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                        </svg>
                        Simpan Perubahan
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
                          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                        </svg>
                        Buat Pengumuman
                      </>
                    )}
                  </button>
                </div>

                {/* ══ FOOTER INFO BANNER ══ */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 16,
                  background: 'var(--purple-lighter)', border: '1px solid var(--purple-light)',
                  marginBottom: 24, position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, background: 'var(--violet-2)', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', margin: '0 0 2px' }}>
                      Pastikan informasi sudah benar
                    </p>
                    <p style={{ fontSize: 11.5, color: 'var(--gray)', margin: 0, lineHeight: 1.5 }}>
                      Pengumuman yang dibuat akan langsung dikirim ke penerima sesuai pengaturan.
                    </p>
                  </div>
                  {/* dekoratif icon kanan */}
                  <div style={{ position: 'relative', width: 54, flexShrink: 0 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--violet-2), var(--purple))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <div style={{
                      position: 'absolute', bottom: -2, right: -2,
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#f59e0b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid var(--white)',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                    </div>
                  </div>
                </div>

              </div>{/* end scrollable content */}
            </div>
          )}

          {/* ── DETAIL MODAL ──────────────────────────────────────────────── */}
          {modal === 'detail' && detailTarget && (() => {
            const cfg = TIPE_CONFIG[detailTarget.tipe] ?? TIPE_CONFIG['Informasi']
            const icon = TIPE_ICONS[detailTarget.tipe] ?? TIPE_ICONS['Informasi']
            return (
              <div
                onClick={e => e.stopPropagation()}
                className="modal-sheet"
                style={{
                  width: '100%', maxWidth: 480, background: 'var(--white)',
                  borderRadius: '28px 28px 0 0',
                  padding: '8px 20px 44px',
                  maxHeight: '90dvh', overflowY: 'auto',
                }}
              >
                <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--border)', margin: '14px auto 20px' }} />

                {/* Color strip */}
                <div style={{
                  height: 4, borderRadius: 99,
                  background: cfg.gradient, marginBottom: 20,
                  boxShadow: `0 2px 8px ${cfg.dotColor}33`,
                }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: cfg.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ transform: 'scale(0.75)' }}>{icon}</div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: cfg.color,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {detailTarget.tipe}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--gray-light)' }}>
                      <IcCalendar /> {formatTanggal(detailTarget.tanggal)}
                    </span>
                    <button
                      onClick={closeModal}
                      className="btn-action"
                      style={{
                        width: 32, height: 32, borderRadius: 10,
                        border: '1.5px solid var(--border)', background: 'var(--admin-page-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--gray)',
                      }}
                    >
                      <IcX />
                    </button>
                  </div>
                </div>

                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', margin: '0 0 14px', lineHeight: 1.3 }}>
                  {detailTarget.judul}
                </h2>

                <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />

                <p style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.8, margin: '0 0 20px', whiteSpace: 'pre-wrap' }}>
                  {detailTarget.konten}
                </p>

                {detailTarget.lampiran_url && (
                  <a
                    href={detailTarget.lampiran_url} target="_blank" rel="noopener noreferrer"
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

                <div style={{
                  padding: '12px 14px', borderRadius: 14,
                  background: 'var(--admin-page-bg)', border: '1px solid var(--border)',
                }}>
                  <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--gray-light)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Informasi Rekaman
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--gray)', margin: '0 0 3px' }}>
                    📅 Dibuat: {new Date(detailTarget.created_at).toLocaleString('id-ID')}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--gray)', margin: 0 }}>
                    🔄 Diperbarui: {new Date(detailTarget.updated_at).toLocaleString('id-ID')}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button
                    onClick={() => { closeModal(); setTimeout(() => openEdit(detailTarget), 10) }}
                    className="btn-action"
                    style={{
                      flex: 1, padding: '13px', borderRadius: 16,
                      border: '1.5px solid var(--purple-light)', background: 'var(--purple-lighter)',
                      fontSize: 13, fontWeight: 700, color: 'var(--violet-1)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <IcEdit /> {t('pengumuman_btn_edit')}
                  </button>
                  <button
                    onClick={() => { closeModal(); setTimeout(() => openDelete(detailTarget), 10) }}
                    className="btn-action"
                    style={{
                      flex: 1, padding: '13px', borderRadius: 16,
                      border: '1.5px solid #fecaca', background: 'var(--white)5f5',
                      fontSize: 13, fontWeight: 700, color: '#dc2626', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <IcTrash /> {t('pengumuman_btn_delete')}
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
                width: '100%', maxWidth: 480,
                background: 'var(--white)', borderRadius: '28px 28px 0 0',
                padding: '8px 20px 44px',
              }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--border)', margin: '14px auto 24px' }} />

              <div style={{
                width: 64, height: 64, borderRadius: 22,
                background: 'linear-gradient(135deg, var(--white)1f2, #ffe4e6)',
                border: '2px solid #fecdd3',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 18px',
                boxShadow: '0 8px 24px rgba(225,29,72,0.15)',
              }}>
                🗑️
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', textAlign: 'center', margin: '0 0 8px' }}>
                Hapus Pengumuman?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--gray)', textAlign: 'center', margin: '0 0 6px', lineHeight: 1.55 }}>
                Pengumuman berikut akan dihapus secara permanen:
              </p>
              <p style={{
                fontSize: 13, fontWeight: 700, color: '#e11d48',
                textAlign: 'center', margin: '0 0 24px',
                padding: '10px 16px', borderRadius: 12,
                background: 'var(--white)1f2', border: '1px solid #fecdd3',
              }}>
                &ldquo;{deleteTarget.judul}&rdquo;
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={closeModal}
                  className="btn-action"
                  style={{
                    flex: 1, padding: '13px', borderRadius: 16,
                    border: '1.5px solid var(--border)', background: 'var(--admin-page-bg)',
                    fontSize: 13, fontWeight: 700, color: 'var(--gray)', cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!!deleting}
                  className="btn-action"
                  style={{
                    flex: 2, padding: '13px', borderRadius: 16, border: 'none',
                    background: deleting ? '#fca5a5' : 'linear-gradient(135deg, #e11d48, #be123c)',
                    fontSize: 13, fontWeight: 700, color: 'var(--white)',
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