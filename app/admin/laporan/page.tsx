// app/admin/laporan/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Laporan {
  id: string
  judul: string
  deskripsi: string | null
  tipe: string
  user_id: string | null
  file_url: string | null
  created_at: string | null
  profiles?: {
    id: string
    name: string
    email: string
    avatar_url: string | null
  }
  creator?: {
    id: string
    name: string
    email: string
  }
}

interface Siswa {
  id: string
  name: string
  email: string
  avatar_url: string | null
}

interface ChartData {
  bulan: string
  jumlah: number
}

// ─────────────────────────────────────────────
// SVG Line Chart
// ─────────────────────────────────────────────
function LineChart({ data }: { data: ChartData[] }) {
  const W = 600, H = 160, pL = 36, pR = 16, pT = 16, pB = 36
  if (!data.length) return (
    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>Belum ada data pendaftaran</p>
    </div>
  )
  const maxVal = Math.max(...data.map(d => d.jumlah), 1)
  const yMax   = Math.ceil(maxVal / 10) * 10 + 10
  const xS     = (i: number) => pL + (i / (data.length - 1)) * (W - pL - pR)
  const yS     = (v: number) => pT + ((yMax - v) / yMax) * (H - pT - pB)
  const pts    = data.map((d, i) => ({ x: xS(i), y: yS(d.jumlah) }))
  const line   = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const cp = (pts[i - 1].x + p.x) / 2
    return `${acc} C ${cp} ${pts[i-1].y}, ${cp} ${p.y}, ${p.x} ${p.y}`
  }, '')
  const area   = `${line} L ${pts[pts.length-1].x} ${H-pB} L ${pts[0].x} ${H-pB} Z`
  const yTicks = [0, Math.round(yMax*0.25), Math.round(yMax*0.5), Math.round(yMax*0.75), yMax]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {yTicks.map(v => (
        <g key={v}>
          <line x1={pL} y1={yS(v)} x2={W-pR} y2={yS(v)} stroke="#f1f5f9" strokeWidth={1} />
          <text x={pL-6} y={yS(v)+4} textAnchor="end" fontSize={9} fill="#cbd5e1">{v}</text>
        </g>
      ))}
      <path d={area} fill="url(#lg1)" />
      <path d={line} fill="none" stroke="#7c3aed" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4.5} fill="white" stroke="#7c3aed" strokeWidth={2.5} />
      ))}
      {data.map((d, i) => (
        <text key={i} x={xS(i)} y={H-5} textAnchor="middle" fontSize={10} fill="#94a3b8" fontWeight="600">{d.bulan}</text>
      ))}
    </svg>
  )
}

// ─────────────────────────────────────────────
// Tipe Config
// ─────────────────────────────────────────────
const TIPE_CFG: Record<string, { bg: string; color: string; iconBg: string; label: string }> = {
  bulanan: { bg: '#ede9fe', color: '#6d28d9', iconBg: '#f5f3ff', label: 'Bulanan' },
  tahunan: { bg: '#dbeafe', color: '#1d4ed8', iconBg: '#eff6ff', label: 'Tahunan' },
  khusus:  { bg: '#fef3c7', color: '#b45309', iconBg: '#fffbeb', label: 'Khusus'  },
}

// ─────────────────────────────────────────────
// Laporan Icon
// ─────────────────────────────────────────────
function LaporanIcon({ tipe, size = 44 }: { tipe: string; size?: number }) {
  const cfg = TIPE_CFG[tipe] || { iconBg: '#f3f4f6', color: '#6b7280' }
  const iconMap: Record<string, React.ReactNode> = {
    bulanan: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    tahunan: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    khusus: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 14, background: cfg.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {iconMap[tipe] || (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Item Dropdown Menu
// ─────────────────────────────────────────────
function ItemMenu({ laporan, onEdit, onDelete }: {
  laporan: Laporan; onEdit: (l: Laporan) => void; onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} style={{ background: '#f8fafc', border: '1px solid #f1f5f9',
          padding: '6px 8px', borderRadius: 10, cursor: 'pointer', color: '#94a3b8',
          display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '110%', background: 'white',
            border: '1px solid #f1f5f9', borderRadius: 14, boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
            zIndex: 99, minWidth: 150, overflow: 'hidden' }}>
          <button onClick={() => { onEdit(laporan); setOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '11px 16px',
              textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#374151' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Laporan
          </button>
          {laporan.file_url && (
            <a href={laporan.file_url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px',
                fontSize: 13, color: '#374151', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
              Lihat File
            </a>
          )}
          <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
          <button onClick={() => { onDelete(laporan.id); setOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '11px 16px',
              textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#ef4444' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Hapus
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Modal Create/Edit
// ─────────────────────────────────────────────
function LaporanModal({ open, onClose, onSubmit, editing, submitting, siswaList }: {
  open: boolean; onClose: () => void
  onSubmit: (data: { judul: string; deskripsi: string; tipe: string; user_id: string; file_url: string }) => void
  editing: Laporan | null; submitting: boolean; siswaList: Siswa[]
}) {
  const initialForm = editing
    ? { 
        judul: editing.judul, 
        deskripsi: editing.deskripsi || '', 
        tipe: editing.tipe, 
        user_id: editing.user_id || '',
        file_url: editing.file_url || '' 
      }
    : { judul: '', deskripsi: '', tipe: 'bulanan', user_id: '', file_url: '' }
  const [form, setForm] = useState(initialForm)
  if (!open) return null
  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 12, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fafafa' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280',
    marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex',
        alignItems: 'flex-end', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', width: '100%',
          maxWidth: 480, maxHeight: '92vh', overflowY: 'auto', paddingBottom: 36 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: 44, height: 4, borderRadius: 99, background: '#e5e7eb' }} />
        </div>
        <div style={{ padding: '18px 24px 0' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
            {editing ? 'Edit Laporan' : 'Buat Laporan Baru'}
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
            {editing ? 'Ubah informasi laporan' : 'Isi form berikut untuk membuat laporan baru'}
          </p>
        </div>
        <div style={{ padding: '20px 24px 0', display: 'grid', gap: 16 }}>
          <div>
            <label style={lbl}>Judul Laporan <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inp} placeholder="Contoh: Laporan Pelanggaran Santri"
              value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>Siswa <span style={{ color: '#ef4444' }}>*</span></label>
            <select style={inp} value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}>
              <option value="">Pilih Siswa</option>
              {siswaList.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>Tipe Laporan <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['bulanan','tahunan','khusus'] as const).map(t => {
                const cfg = TIPE_CFG[t]
                const active = form.tipe === t
                return (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tipe: t }))} style={{
                    flex: 1, padding: '10px 6px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                    border: active ? `2px solid ${cfg.color}` : '2px solid transparent',
                    background: active ? cfg.bg : '#f8fafc', color: active ? cfg.color : '#94a3b8',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>{cfg.label}</button>
                )
              })}
            </div>
          </div>
          <div>
            <label style={lbl}>Deskripsi</label>
            <textarea rows={3} style={{ ...inp, resize: 'none' } as React.CSSProperties}
              placeholder="Deskripsikan isi laporan..."
              value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>URL Lampiran (opsional)</label>
            <input type="url" style={inp} placeholder="https://drive.google.com/..."
              value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Link PDF, DOC, atau Google Drive</p>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '13px', border: '1.5px solid #e5e7eb',
                borderRadius: 14, fontSize: 14, fontWeight: 600, color: '#374151', background: 'white', cursor: 'pointer' }}>
              Batal
            </button>
            <button type="button" disabled={submitting || !form.judul || !form.user_id} onClick={() => onSubmit(form)} style={{
                flex: 2, padding: '13px', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700,
                color: 'white', cursor: submitting || !form.judul || !form.user_id ? 'not-allowed' : 'pointer',
                background: submitting || !form.judul || !form.user_id ? '#a78bfa' : '#7c3aed',
                boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
              {submitting ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Simpan Laporan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: 18, padding: '14px 16px', display: 'flex',
        alignItems: 'center', gap: 12, border: '1px solid #f1f5f9' }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f1f5f9', flexShrink: 0,
          animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%',
          backgroundImage: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)' }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 13, width: '60%', borderRadius: 6, marginBottom: 8,
            background: '#f1f5f9', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%',
            backgroundImage: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)' }} />
        <div style={{ height: 10, width: '40%', borderRadius: 6,
            background: '#f1f5f9', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%',
            backgroundImage: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)' }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function LaporanPage() {
  const [laporanList, setLaporanList] = useState<Laporan[]>([])
  const [siswaList, setSiswaList] = useState<Siswa[]>([])
  const [loading, setLoading]         = useState(true)
  const [filterTipe, setFilterTipe]   = useState('semua')
  const [filterSiswa, setFilterSiswa] = useState('semua')
  const [showModal, setShowModal]     = useState(false)
  const [editingLaporan, setEditing]  = useState<Laporan | null>(null)
  const [chartData, setChartData]     = useState<ChartData[]>([])
  const [submitting, setSubmitting]   = useState(false)

  const fetchSiswa = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/siswa')
      const data = await res.json()
      if (data.data) setSiswaList(data.data)
    } catch (e) { console.error(e) }
  }, [])

  const fetchLaporan = useCallback(async () => {
    setLoading(true)
    try {
      let url = '/api/admin/laporan?'
      const params = new URLSearchParams()
      if (filterTipe !== 'semua') params.append('tipe', filterTipe)
      if (filterSiswa !== 'semua') params.append('user_id', filterSiswa)
      url += params.toString()
      
      const res = await fetch(url)
      const data = await res.json()
      if (data.data) setLaporanList(data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filterTipe, filterSiswa])

  const fetchChart = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/laporan/statistik')
      const data = await res.json()
      if (data.data) setChartData(data.data)
    } catch {
      setChartData([
        { bulan: 'Jan', jumlah: 0 }, { bulan: 'Feb', jumlah: 0 }, { bulan: 'Mar', jumlah: 0 },
        { bulan: 'Apr', jumlah: 0 }, { bulan: 'Mei', jumlah: 0 }, { bulan: 'Jun', jumlah: 0 },
      ])
    }
  }, [])

  useEffect(() => { 
    fetchSiswa()
    fetchLaporan() 
    fetchChart() 
  }, [fetchSiswa, fetchLaporan, fetchChart])

  const handleSubmit = async (form: { judul: string; deskripsi: string; tipe: string; user_id: string; file_url: string }) => {
    setSubmitting(true)
    try {
      const url    = editingLaporan ? `/api/admin/laporan/${editingLaporan.id}` : '/api/admin/laporan'
      const method = editingLaporan ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { fetchLaporan(); fetchChart(); setShowModal(false); setEditing(null) }
      else { const e = await res.json(); alert(e.error || 'Terjadi kesalahan') }
    } catch { alert('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus laporan ini?')) return
    try {
      const res = await fetch(`/api/admin/laporan/${id}`, { method: 'DELETE' })
      if (res.ok) { fetchLaporan(); fetchChart() }
      else alert('Gagal menghapus')
    } catch { alert('Terjadi kesalahan') }
  }

  const handleEdit   = (l: Laporan) => { setEditing(l); setShowModal(true) }
  const handleCreate = () => { setEditing(null); setShowModal(true) }

  const formatDate = (s: string | null) => {
    if (!s) return '—'
    return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const total   = laporanList.length
  const bulanan = laporanList.filter(l => l.tipe === 'bulanan').length
  const tahunan = laporanList.filter(l => l.tipe === 'tahunan').length
  const khusus  = laporanList.filter(l => l.tipe === 'khusus').length

  const filters = [
    { key: 'semua',   label: 'Semua',   count: total   },
    { key: 'bulanan', label: 'Bulanan', count: bulanan },
    { key: 'tahunan', label: 'Tahunan', count: tahunan },
    { key: 'khusus',  label: 'Khusus',  count: khusus  },
  ]

  const statsConfig = [
    { label: 'Total Laporan', value: total,   iconBg: '#f5f3ff', numColor: '#7c3aed',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg> },
    { label: 'Bulanan',       value: bulanan, iconBg: '#eff6ff', numColor: '#2563eb',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg> },
    { label: 'Tahunan',       value: tahunan, iconBg: '#ecfdf5', numColor: '#16a34a',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg> },
    { label: 'Khusus',        value: khusus,  iconBg: '#fffbeb', numColor: '#d97706',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg> },
  ]

  return (
    <div style={{ background: '#f4f2fb', minHeight: '100vh' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>

      {/* ── HERO HEADER ───────────────────────────────────── */}
      <div style={{ background: '#f4f2fb', padding: '32px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 14, top: 14, width: 110, height: 110,
            opacity: 0.9, pointerEvents: 'none' }}>
          <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="55" cy="102" rx="36" ry="5" fill="#c4b5fd" opacity="0.25"/>
            <rect x="18" y="8" width="60" height="78" rx="10" fill="#7c3aed"/>
            <rect x="18" y="8" width="60" height="78" rx="10" fill="url(#docGrad)"/>
            <path d="M62 8 L78 24 L62 24 Z" fill="#6d28d9"/>
            <path d="M62 8 L78 24 H62 Z" fill="rgba(0,0,0,0.12)"/>
            <rect x="26" y="28" width="44" height="50" rx="5" fill="white" opacity="0.95"/>
            <rect x="31" y="57" width="7" height="14" rx="2" fill="#7c3aed" opacity="0.7"/>
            <rect x="42" y="50" width="7" height="21" rx="2" fill="#7c3aed"/>
            <rect x="53" y="54" width="7" height="17" rx="2" fill="#7c3aed" opacity="0.6"/>
            <rect x="64" y="47" width="7" height="24" rx="2" fill="#10b981" opacity="0.8"/>
            <line x1="31" y1="72" x2="71" y2="72" stroke="#e5e7eb" strokeWidth="1"/>
            <circle cx="43" cy="42" r="11" fill="#ede9fe" stroke="white" strokeWidth="1.5"/>
            <path d="M43 42 L43 31 A11 11 0 0 1 54 42 Z" fill="#7c3aed"/>
            <path d="M43 42 L54 42 A11 11 0 0 1 36.2 51.5 Z" fill="#a78bfa"/>
            <rect x="57" y="36" width="10" height="2" rx="1" fill="#e5e7eb"/>
            <rect x="57" y="40" width="7" height="2" rx="1" fill="#e5e7eb"/>
            <rect x="57" y="44" width="9" height="2" rx="1" fill="#e5e7eb"/>
            <defs>
              <linearGradient id="docGrad" x1="18" y1="8" x2="78" y2="86" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" stopOpacity="0.2"/>
                <stop offset="1" stopColor="#7c3aed" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div style={{ maxWidth: 'calc(100% - 130px)' }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: '#1a1033',
              letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Laporan
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 13, color: '#7c6fa0', lineHeight: 1.5, maxWidth: 230 }}>
            Kelola laporan per siswa, buat laporan baru, edit, atau hapus laporan yang sudah ada.
          </p>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────── */}
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Stats 2x2 Grid ─────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {statsConfig.map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 20, padding: '16px 16px',
                boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                animation: 'fadeUp 0.4s ease both', animationDelay: `${i*70}ms` }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.07em',
                    textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 34, fontWeight: 900, color: s.numColor, margin: '4px 0 0', lineHeight: 1 }}>
                  {s.value}
                </p>
              </div>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: s.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs + Buat Laporan ──────────────────── */}
        <div style={{ background: 'white', borderRadius: 20, padding: '14px 16px',
            boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                {filters.map(f => (
                  <button key={f.key} onClick={() => setFilterTipe(f.key)} style={{
                      padding: '7px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700,
                      border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                      background: filterTipe === f.key ? '#7c3aed' : '#f1f5f9',
                      color: filterTipe === f.key ? 'white' : '#64748b' }}>
                    {f.label}
                    {f.count > 0 && (
                      <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.8 }}>({f.count})</span>
                    )}
                  </button>
                ))}
              </div>
              <button onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 50, fontSize: 12, fontWeight: 800,
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const,
                  background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Buat Laporan Baru
              </button>
            </div>
            {/* Filter Siswa */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Filter Siswa:</label>
              <select 
                value={filterSiswa} 
                onChange={e => setFilterSiswa(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 50, fontSize: 12, border: '1.5px solid #e5e7eb',
                  background: 'white', color: '#374151', outline: 'none', cursor: 'pointer' }}
              >
                <option value="semua">Semua Siswa</option>
                {siswaList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {filterSiswa !== 'semua' && (
                <button 
                  onClick={() => setFilterSiswa('semua')}
                  style={{ padding: '4px 10px', borderRadius: 50, fontSize: 11, border: 'none',
                    background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}
                >
                  × Hapus Filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Ringkasan Chart ─────────────────────────────── */}
        <div style={{ background: 'white', borderRadius: 20, padding: '18px 16px 14px',
            boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f3ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Ringkasan Laporan</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f8fafc',
                border: '1px solid #e5e7eb', borderRadius: 10, padding: '5px 10px',
                fontSize: 11, color: '#64748b', fontWeight: 600 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              6 Bulan Terakhir
            </div>
          </div>
          <LineChart data={chartData} />
        </div>

        {/* ── Daftar Laporan ──────────────────────────────── */}
        <div style={{ background: 'white', borderRadius: 20, padding: '18px 16px',
            boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f3ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Daftar Laporan</p>
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
              {laporanList.length} laporan
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : laporanList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ width: 72, height: 72, borderRadius: 22, background: '#f5f3ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: 0 }}>Belum ada laporan</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 18px' }}>Buat laporan pertama untuk melihat analisis data.</p>
              <button onClick={handleCreate} style={{ padding: '11px 24px', borderRadius: 50, fontSize: 13,
                  fontWeight: 700, border: 'none', cursor: 'pointer', background: '#7c3aed', color: 'white',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                + Buat Laporan
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {laporanList.map((laporan, idx) => {
                const cfg = TIPE_CFG[laporan.tipe] || { bg: '#f3f4f6', color: '#6b7280', label: laporan.tipe, iconBg: '#f3f4f6' }
                return (
                  <div key={laporan.id} style={{ background: '#fafafa', borderRadius: 18, padding: '14px 14px',
                      display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid #f1f5f9',
                      animation: 'fadeUp 0.35s ease both', animationDelay: `${idx * 50}ms`,
                      transition: 'box-shadow 0.15s' }}>
                    <LaporanIcon tipe={laporan.tipe} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', margin: 0,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {laporan.judul}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {formatDate(laporan.created_at)}
                        </span>
                        {laporan.profiles && (
                          <>
                            <span style={{ color: '#e2e8f0' }}>·</span>
                            <span style={{ fontSize: 10, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                              {laporan.profiles.name}
                            </span>
                          </>
                        )}
                        {laporan.file_url && (
                          <>
                            <span style={{ color: '#e2e8f0' }}>·</span>
                            <span style={{ fontSize: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                              </svg>
                              Ada lampiran
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg,
                        padding: '4px 10px', borderRadius: 50, flexShrink: 0, whiteSpace: 'nowrap' as const }}>
                      {cfg.label}
                    </span>
                    <ItemMenu laporan={laporan} onEdit={handleEdit} onDelete={handleDelete} />
                  </div>
                )
              })}

              <button onClick={handleCreate} style={{ marginTop: 4, padding: '13px', borderRadius: 14,
                  fontSize: 13, fontWeight: 700, border: '1.5px dashed #d1d5db', background: 'white',
                  color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6, transition: 'background 0.15s' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Buat Laporan Baru
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Modal */}
      <LaporanModal
        key={editingLaporan ? editingLaporan.id : 'new'}
        open={showModal}
        onClose={() => { setShowModal(false); setEditing(null) }}
        onSubmit={handleSubmit}
        editing={editingLaporan}
        submitting={submitting}
        siswaList={siswaList}
      />
    </div>
  )
}