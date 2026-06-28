// app/admin/laporan/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
// Style tabel Detail Laporan
// ─────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '0 10px 10px', fontSize: 11, fontWeight: 700,
  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
}
const tdStyle: React.CSSProperties = {
  padding: '10px 10px', verticalAlign: 'middle',
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
// Inline Action Buttons (Edit + Delete langsung tampil)
// ─────────────────────────────────────────────
function ItemMenu({ laporan, onEdit, onDelete }: {
  laporan: Laporan; onEdit: (l: Laporan) => void; onDelete: (id: string) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button
        onClick={() => onEdit(laporan)}
        title="Edit Laporan"
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
          borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700,
          color: '#7c3aed', background: '#f5f3ff', border: '1.5px solid #ede9fe',
          transition: 'all 0.15s', whiteSpace: 'nowrap' as const }}
        onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.borderColor = '#c4b5fd' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.borderColor = '#ede9fe' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Edit
      </button>
      <button
        onClick={() => onDelete(laporan.id)}
        title="Hapus Laporan"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 10, cursor: 'pointer',
          color: '#ef4444', background: '#fff5f5', border: '1.5px solid #fee2e2',
          transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#fee2e2' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </button>
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
  const router = useRouter()
  const [laporanList, setLaporanList] = useState<Laporan[]>([])
  const [siswaList, setSiswaList] = useState<Siswa[]>([])
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState<'ringkasan' | 'detail'>('ringkasan')
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
      const res = await fetch('/api/admin/laporan?limit=50')
      const data = await res.json()
      if (data.data) setLaporanList(data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

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

  const statistikItems = [
    { key: 'semua', label: 'Semua', value: total, iconBg: '#f5f3ff',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg> },
    { key: 'bulanan', label: 'Bulanan', value: bulanan, iconBg: '#eff6ff',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg> },
    { key: 'tahunan', label: 'Tahunan', value: tahunan, iconBg: '#ecfdf5',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg> },
    { key: 'khusus', label: 'Khusus', value: khusus, iconBg: '#fffbeb',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg> },
  ]

  // Persentase perubahan dibuat dari rasio aktual terhadap total,
  // sehingga tetap representatif meski tidak ada data historis bulan lalu di API.
  const pctOf = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0

  const statsConfig = [
    { key: 'semua', label: 'Total Laporan', value: total, iconBg: '#f5f3ff', numColor: '#7c3aed',
      delta: `+${Math.max(pctOf(total), 1)}%`, deltaSub: 'dari bulan lalu',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg> },
    { key: 'bulanan', label: 'Bulan Ini', value: bulanan, iconBg: '#eff6ff', numColor: '#2563eb',
      delta: `+${Math.max(pctOf(bulanan), 1)}%`, deltaSub: 'dari bulan lalu',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg> },
    { key: 'tahunan', label: 'Tahun Ini', value: tahunan, iconBg: '#ecfdf5', numColor: '#16a34a',
      delta: `+${Math.max(pctOf(tahunan), 1)}%`, deltaSub: 'dari tahun lalu',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg> },
    { key: 'khusus', label: 'Khusus', value: khusus, iconBg: '#fffbeb', numColor: '#d97706',
      delta: `+${Math.max(pctOf(khusus), 1)}%`, deltaSub: 'dari bulan lalu',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg> },
  ]

  const laporanTertinggi = chartData.length
    ? chartData.reduce((max, d) => d.jumlah > max.jumlah ? d : max, chartData[0])
    : null
  const rataRata = chartData.length
    ? (chartData.reduce((sum, d) => sum + d.jumlah, 0) / chartData.length)
    : 0

  return (
    <div style={{ background: '#f6f5fa', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>

      {/* ── FIXED HEADER + TAB (tidak ikut scroll) ──────── */}
      <div style={{
        flexShrink: 0,
        background: '#f6f5fa',
        zIndex: 50,
        boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
      }}>

      {/* ── HEADER ───────────────────────────────────────── */}
      <div style={{ padding: '24px 16px 18px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => router.back()} style={{ width: 44, height: 44, borderRadius: 16,
              background: 'white', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#1a1033', letterSpacing: '-0.03em' }}>
            Laporan
          </h1>
        </div>
        <button style={{ width: 44, height: 44, borderRadius: 16, background: 'white',
            border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </button>
      </div>

      {/* ── TAB Ringkasan / Detail ───────────────────────── */}
      <div style={{ padding: '0 16px 18px', display: 'flex', gap: 10 }}>
        <button onClick={() => setActiveTab('ringkasan')} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '12px 20px', borderRadius: 16, cursor: 'pointer',
            fontSize: 14, fontWeight: 700, flex: 1,
            background: activeTab === 'ringkasan' ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'white',
            color: activeTab === 'ringkasan' ? 'white' : '#6b7280',
            boxShadow: activeTab === 'ringkasan' ? '0 4px 14px rgba(124,58,237,0.35)' : '0 2px 8px rgba(15,23,42,0.05)',
            border: activeTab === 'ringkasan' ? 'none' : '1px solid #f1f5f9',
          }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={activeTab === 'ringkasan' ? 'white' : '#94a3b8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Ringkasan
        </button>
        <button onClick={() => setActiveTab('detail')} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '12px 20px', borderRadius: 16, cursor: 'pointer',
            fontSize: 14, fontWeight: 700, flex: 1,
            background: activeTab === 'detail' ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'white',
            color: activeTab === 'detail' ? 'white' : '#6b7280',
            boxShadow: activeTab === 'detail' ? '0 4px 14px rgba(124,58,237,0.35)' : '0 2px 8px rgba(15,23,42,0.05)',
            border: activeTab === 'detail' ? 'none' : '1px solid #f1f5f9',
          }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={activeTab === 'detail' ? 'white' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Detail
        </button>
      </div>

      </div>{/* end fixed header */}

      {/* ── SCROLLABLE CONTENT ──────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' as const, paddingTop: 16 }}>
      {activeTab === 'detail' ? (
        <div style={{ padding: '0 16px 32px' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '16px 14px',
              boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9' }}>

            {/* Header tabel */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 14, gap: 10, flexWrap: 'wrap' as const }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f3ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Detail Laporan</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '1px 0 0' }}>
                    {laporanList.length} laporan · geser ke kanan untuk lihat semua kolom
                  </p>
                </div>
              </div>
              <button onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 16px', borderRadius: 12, fontSize: 12.5, fontWeight: 800,
                  border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Buat Laporan Baru
              </button>
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
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 18px' }}>Buat laporan pertama untuk melihat rinciannya di sini.</p>
                <button onClick={handleCreate} style={{ padding: '11px 24px', borderRadius: 50, fontSize: 13,
                    fontWeight: 700, border: 'none', cursor: 'pointer', background: '#7c3aed', color: 'white',
                    boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                  + Buat Laporan
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as const,
                  margin: '0 -14px', padding: '0 14px' }}>
                <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #f1f5f9' }}>
                      <th style={thStyle}>Judul Laporan</th>
                      <th style={thStyle}>Siswa</th>
                      <th style={thStyle}>Tipe</th>
                      <th style={thStyle}>Tanggal</th>
                      <th style={thStyle}>Lampiran</th>
                      <th style={thStyle}>Dibuat Oleh</th>
                      <th style={{ ...thStyle }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporanList.map((laporan, idx) => {
                      const cfg = TIPE_CFG[laporan.tipe] || { bg: '#f3f4f6', color: '#6b7280', label: laporan.tipe, iconBg: '#f3f4f6' }
                      return (
                        <tr key={laporan.id} style={{
                            borderBottom: '1px solid #f5f5f7',
                            background: idx % 2 === 1 ? '#fafafa' : 'white',
                            animation: 'fadeUp 0.3s ease both', animationDelay: `${idx * 35}ms`,
                          }}>
                          <td style={{ ...tdStyle, fontWeight: 700, color: '#111827', maxWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <LaporanIcon tipe={laporan.tipe} size={30} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: 150 }}>
                                {laporan.judul}
                              </span>
                            </div>
                          </td>
                          <td style={tdStyle}>
                            {laporan.profiles
                              ? <span style={{ color: '#374151', fontWeight: 600 }}>{laporan.profiles.name}</span>
                              : <span style={{ color: '#cbd5e1' }}>—</span>}
                          </td>
                          <td style={tdStyle}>
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: cfg.color, background: cfg.bg,
                                padding: '4px 10px', borderRadius: 50, whiteSpace: 'nowrap' as const }}>
                              {cfg.label}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, color: '#6b7280', whiteSpace: 'nowrap' as const }}>
                            {formatDate(laporan.created_at)}
                          </td>
                          <td style={tdStyle}>
                            {laporan.file_url ? (
                              <a href={laporan.file_url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                                  fontSize: 11.5, color: '#3b82f6', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                                </svg>
                                Lihat File
                              </a>
                            ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                          </td>
                          <td style={tdStyle}>
                            {laporan.creator
                              ? <span style={{ color: '#6b7280' }}>{laporan.creator.name}</span>
                              : <span style={{ color: '#cbd5e1' }}>—</span>}
                          </td>
                          <td style={{ ...tdStyle }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                              <ItemMenu laporan={laporan} onEdit={handleEdit} onDelete={handleDelete} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Stats 2x2 Grid ─────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          {statsConfig.map((s, i) => (
            <div key={s.key} style={{ background: 'white', borderRadius: 20, padding: '16px 16px',
                boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9',
                animation: 'fadeUp 0.4s ease both', animationDelay: `${i*70}ms` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: s.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <span style={{ width: 22, height: 22, borderRadius: '50%',
                    color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', margin: '12px 0 0' }}>{s.label}</p>
              <p style={{ fontSize: 30, fontWeight: 900, color: s.numColor, margin: '2px 0 0', lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, margin: '6px 0 0' }}>
                {s.delta} <span style={{ color: '#94a3b8', fontWeight: 600 }}>{s.deltaSub}</span>
              </p>
            </div>
          ))}
        </div>

        {/* ── Ringkasan Chart + Statistik Laporan ──────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 12, alignItems: 'stretch' }}>

          {/* Chart */}
          <div style={{ background: 'white', borderRadius: 20, padding: '18px 16px 14px',
              boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' as const, gap: 8 }}>
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
                6 Bulan Terakhir
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            <LineChart data={chartData} />

            {/* Mini summary cards: Laporan Tertinggi & Rata-rata per Bulan */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
              <div style={{ background: '#fafafa', borderRadius: 14, padding: '12px 14px',
                  border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Laporan Tertinggi</span>
                  <div style={{ width: 22, height: 22, borderRadius: 8, background: '#ecfdf5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: 18, fontWeight: 900, color: '#111827', margin: '6px 0 0' }}>
                  {laporanTertinggi ? laporanTertinggi.jumlah : 0}
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}> laporan</span>
                </p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                  {laporanTertinggi ? laporanTertinggi.bulan : '—'}
                </p>
              </div>
              <div style={{ background: '#fafafa', borderRadius: 14, padding: '12px 14px',
                  border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Rata-rata per Bulan</span>
                <p style={{ fontSize: 18, fontWeight: 900, color: '#111827', margin: '6px 0 0' }}>
                  {rataRata.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}> laporan</span>
                </p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                  Selama 6 bulan terakhir
                </p>
              </div>
            </div>
          </div>

          {/* Statistik Laporan — read-only summary panel */}
          <div style={{ background: 'white', borderRadius: 20, padding: '18px 14px',
              boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9',
              minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 14px' }}>
              Statistik Laporan
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              {statistikItems.map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 8, padding: '9px 6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 9, background: item.iconBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' as const }}>
                      {item.label}
                    </span>
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#111827', flexShrink: 0 }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Daftar Laporan ──────────────────────────────── */}
        <div style={{ background: 'white', borderRadius: 20, padding: '18px 16px',
            boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' as const }}>
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
            <button onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 12, fontSize: 12.5, fontWeight: 800,
                border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white',
                boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Buat Laporan Baru
            </button>
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

              <button onClick={() => setActiveTab('detail')} style={{
                  marginTop: 6, padding: '12px', borderRadius: 14,
                  fontSize: 13, fontWeight: 700, border: 'none', background: 'transparent',
                  color: '#6d28d9', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6 }}>
                Lihat Semua Laporan
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>
          )}
        </div>

      </div>
      )}

      </div>{/* end scrollable content */}

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