// app/admin/laporan/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/contexts/SettingsContext'

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
// Diagram dua garis (gaya "Overview": garis tebal + penanda bulat + legenda)
// ─────────────────────────────────────────────
function OverviewChart({
  labels, a, b, dark = false, emptyText,
}: { labels: string[]; a: number[]; b: number[]; dark?: boolean; emptyText: string }) {
  const W = 360, H = 210, pL = 34, pR = 14, pT = 14, pB = 30
  const colA      = dark ? '#60a5fa' : '#3b82f6'
  const colB      = dark ? '#34d399' : '#22c55e'
  const gridColor = dark ? '#2e2a40' : '#EEF1F6'
  const textColor = dark ? '#8b86a3' : '#9ca3af'
  const dotFill   = dark ? '#1e1b2e' : '#ffffff'

  if (!labels.length) return (
    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: textColor, fontSize: 13, margin: 0 }}>{emptyText}</p>
    </div>
  )

  const n      = labels.length
  const maxVal = Math.max(...a, ...b, 1)
  const step   = Math.max(1, Math.ceil(maxVal / 4))
  const yMax   = step * 4
  const ticks  = [0, 1, 2, 3, 4].map(i => i * step)
  const x0     = pL + 12
  const x1     = W - pR - 12
  const xS     = (i: number) => (n === 1 ? (x0 + x1) / 2 : x0 + (i / (n - 1)) * (x1 - x0))
  const yS     = (v: number) => pT + (1 - v / yMax) * (H - pT - pB)

  const smooth = (vals: number[]) => {
    const pts = vals.map((v, i) => ({ x: xS(i), y: yS(v) }))
    const d = pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const cp = (pts[i - 1].x + p.x) / 2
      return `${acc} C ${cp} ${pts[i - 1].y}, ${cp} ${p.y}, ${p.x} ${p.y}`
    }, '')
    const base = H - pB
    const area = `${d} L ${pts[pts.length - 1].x} ${base} L ${pts[0].x} ${base} Z`
    return { pts, d, area }
  }
  const A = smooth(a)
  const B = smooth(b)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="ovAreaA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={colA} stopOpacity={dark ? 0.32 : 0.28} />
          <stop offset="100%" stopColor={colA} stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id="ovAreaB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={colB} stopOpacity={dark ? 0.28 : 0.24} />
          <stop offset="100%" stopColor={colB} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {ticks.map(v => (
        <g key={v}>
          <line x1={pL} y1={yS(v)} x2={W - pR} y2={yS(v)} stroke={gridColor} strokeWidth={1} />
          <text x={pL - 8} y={yS(v) + 3.5} textAnchor="end" fontSize={10} fontWeight={600} fill={textColor}>{v}</text>
        </g>
      ))}

      {/* Arsiran (area) di bawah garis */}
      <path d={B.area} fill="url(#ovAreaB)" />
      <path d={A.area} fill="url(#ovAreaA)" />

      <path d={B.d} fill="none" stroke={colB} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d={A.d} fill="none" stroke={colA} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

      {B.pts.map((p, i) => (
        <circle key={`b${i}`} cx={p.x} cy={p.y} r={4} fill={dotFill} stroke={colB} strokeWidth={2.5} />
      ))}
      {A.pts.map((p, i) => (
        <circle key={`a${i}`} cx={p.x} cy={p.y} r={4} fill={dotFill} stroke={colA} strokeWidth={2.5} />
      ))}

      {labels.map((l, i) => (
        <text key={i} x={xS(i)} y={H - 8} textAnchor="middle" fontSize={10} fontWeight={600} fill={textColor}>{l}</text>
      ))}
    </svg>
  )
}

// ─────────────────────────────────────────────
// Tipe Config
// ─────────────────────────────────────────────
const TIPE_CFG: Record<string, { bg: string; bgDark: string; color: string; iconBg: string; iconBgDark: string; label: string; labelEn: string }> = {
  bulanan: { 
    bg: '#ede9fe', bgDark: '#2e2a40', color: '#6d28d9', 
    iconBg: '#f5f3ff', iconBgDark: '#3d3655', 
    label: 'Bulanan', labelEn: 'Monthly' 
  },
  tahunan: { 
    bg: '#dbeafe', bgDark: '#1e2a3d', color: '#1d4ed8', 
    iconBg: '#eff6ff', iconBgDark: '#1e2a3d', 
    label: 'Tahunan', labelEn: 'Yearly' 
  },
  khusus: { 
    bg: '#fef3c7', bgDark: '#2e2a1a', color: '#b45309', 
    iconBg: '#fffbeb', iconBgDark: '#2e2a1a', 
    label: 'Khusus', labelEn: 'Special' 
  },
}

// ─────────────────────────────────────────────
// Style tabel Detail Laporan
// ─────────────────────────────────────────────
function getThStyle(dark: boolean): React.CSSProperties {
  return {
    textAlign: 'left', padding: '0 10px 10px', fontSize: 11, fontWeight: 700,
    color: dark ? '#94a3b8' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
  }
}
function getTdStyle(): React.CSSProperties {
  return {
    padding: '10px 10px', verticalAlign: 'middle',
  }
}

// ─────────────────────────────────────────────
// Laporan Icon
// ─────────────────────────────────────────────
function LaporanIcon({ tipe, size = 44, dark = false }: { tipe: string; size?: number; dark?: boolean }) {
  const cfg = TIPE_CFG[tipe] || { 
    iconBg: '#f3f4f6', iconBgDark: '#2e2a40', 
    color: '#6b7280' 
  }
  const iconBg = dark ? cfg.iconBgDark : cfg.iconBg
  const iconColor = dark ? '#a5b4fc' : cfg.color
  
  const iconMap: Record<string, React.ReactNode> = {
    bulanan: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    tahunan: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    khusus: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  }
  return (
    <div style={{ 
      width: size, height: size, borderRadius: 14, 
      background: iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
    }}>
      {iconMap[tipe] || (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Inline Action Buttons
// ─────────────────────────────────────────────
function ItemMenu({ 
  laporan, onEdit, onDelete, dark = false, isEn = false 
}: {
  laporan: Laporan; 
  onEdit: (l: Laporan) => void; 
  onDelete: (id: string) => void;
  dark?: boolean;
  isEn?: boolean;
}) {
  const editBg = dark ? '#2e2a40' : '#f5f3ff'
  const editBorder = dark ? '#3d3655' : '#ede9fe'
  const editColor = dark ? '#a5b4fc' : '#7c3aed'
  const deleteBg = dark ? '#2e2a40' : '#fff5f5'
  const deleteBorder = dark ? '#3d3655' : '#fee2e2'
  const deleteColor = dark ? '#fca5a5' : '#ef4444'
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button
        onClick={() => onEdit(laporan)}
        title={isEn ? 'Edit Report' : 'Edit Laporan'}
        style={{ 
          display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
          borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700,
          color: editColor, background: editBg, border: `1.5px solid ${editBorder}`,
          transition: 'all 0.15s', whiteSpace: 'nowrap' as const 
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={editColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        {isEn ? 'Edit' : 'Edit'}
      </button>
      <button
        onClick={() => onDelete(laporan.id)}
        title={isEn ? 'Delete Report' : 'Hapus Laporan'}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 10, cursor: 'pointer',
          color: deleteColor, background: deleteBg, border: `1.5px solid ${deleteBorder}`,
          transition: 'all 0.15s' 
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={deleteColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
function LaporanModal({ 
  open, onClose, onSubmit, editing, submitting, siswaList, dark = false, isEn = false 
}: {
  open: boolean; onClose: () => void
  onSubmit: (data: { judul: string; deskripsi: string; tipe: string; user_id: string; file_url: string }) => void
  editing: Laporan | null; submitting: boolean; siswaList: Siswa[]
  dark?: boolean; isEn?: boolean
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
  
  const bgColor = dark ? '#1e1b2e' : 'white'
  const textColor = dark ? '#f1f0f5' : '#111827'
  const mutedColor = dark ? '#94a3b8' : '#94a3b8'
  const inputBg = dark ? '#15131f' : '#fafafa'
  const inputBorder = dark ? '#2e2a40' : '#e5e7eb'
  const inputColor = dark ? '#f1f0f5' : '#111827'
  
  const inp: React.CSSProperties = { 
    width: '100%', padding: '11px 14px', 
    border: `1.5px solid ${inputBorder}`,
    borderRadius: 12, fontSize: 14, outline: 'none', 
    boxSizing: 'border-box', color: inputColor, background: inputBg 
  }
  const lbl: React.CSSProperties = { 
    display: 'block', fontSize: 11, fontWeight: 700, 
    color: dark ? '#94a3b8' : '#6b7280',
    marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' 
  }
  
  return (
    <div style={{ 
      position: 'fixed', inset: 0, 
      background: dark ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.55)', 
      display: 'flex',
      alignItems: 'flex-end', justifyContent: 'center', 
      zIndex: 999, backdropFilter: 'blur(4px)' 
    }} onClick={onClose}>
      <div style={{ 
        background: bgColor, borderRadius: '28px 28px 0 0', 
        width: '100%', maxWidth: 480, maxHeight: '92vh', 
        overflowY: 'auto', paddingBottom: 36,
        borderTop: dark ? '1px solid #2e2a40' : 'none'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: 44, height: 4, borderRadius: 99, background: dark ? '#3d3655' : '#e5e7eb' }} />
        </div>
        <div style={{ padding: '18px 24px 0' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: textColor, margin: 0 }}>
            {editing ? (isEn ? 'Edit Report' : 'Edit Laporan') : (isEn ? 'Create New Report' : 'Buat Laporan Baru')}
          </h2>
          <p style={{ fontSize: 13, color: mutedColor, margin: '4px 0 0' }}>
            {editing 
              ? (isEn ? 'Update report information' : 'Ubah informasi laporan')
              : (isEn ? 'Fill out the form to create a new report' : 'Isi form berikut untuk membuat laporan baru')}
          </p>
        </div>
        <div style={{ padding: '20px 24px 0', display: 'grid', gap: 16 }}>
          <div>
            <label style={lbl}>
              {isEn ? 'Report Title' : 'Judul Laporan'} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              style={inp} 
              placeholder={isEn ? 'Example: Student Violation Report' : 'Contoh: Laporan Pelanggaran Santri'}
              value={form.judul} 
              onChange={e => setForm(f => ({ ...f, judul: e.target.value }))} 
            />
          </div>
          <div>
            <label style={lbl}>
              {isEn ? 'Student' : 'Siswa'} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select 
              style={inp} 
              value={form.user_id} 
              onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
            >
              <option value="">{isEn ? 'Select Student' : 'Pilih Siswa'}</option>
              {siswaList.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>
              {isEn ? 'Report Type' : 'Tipe Laporan'} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['bulanan','tahunan','khusus'] as const).map(t => {
                const cfg = TIPE_CFG[t]
                const active = form.tipe === t
                const label = isEn ? cfg.labelEn : cfg.label
                return (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tipe: t }))} style={{
                    flex: 1, padding: '10px 6px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                    border: active ? `2px solid ${cfg.color}` : `2px solid ${dark ? '#2e2a40' : 'transparent'}`,
                    background: active ? (dark ? cfg.bgDark : cfg.bg) : (dark ? '#15131f' : '#f8fafc'),
                    color: active ? cfg.color : (dark ? '#6b6885' : '#94a3b8'),
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>{label}</button>
                )
              })}
            </div>
          </div>
          <div>
            <label style={lbl}>{isEn ? 'Description' : 'Deskripsi'}</label>
            <textarea rows={3} style={{ ...inp, resize: 'none' } as React.CSSProperties}
              placeholder={isEn ? 'Describe the report content...' : 'Deskripsikan isi laporan...'}
              value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>{isEn ? 'Attachment URL (optional)' : 'URL Lampiran (opsional)'}</label>
            <input type="url" style={inp} placeholder="https://drive.google.com/..."
              value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} />
            <p style={{ fontSize: 11, color: dark ? '#6b6885' : '#94a3b8', marginTop: 4 }}>
              {isEn ? 'Link to PDF, DOC, or Google Drive' : 'Link PDF, DOC, atau Google Drive'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ 
              flex: 1, padding: '13px', 
              border: `1.5px solid ${dark ? '#2e2a40' : '#e5e7eb'}`,
              borderRadius: 14, fontSize: 14, fontWeight: 600, 
              color: dark ? '#94a3b8' : '#374151', 
              background: dark ? '#15131f' : 'white', 
              cursor: 'pointer' 
            }}>
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button type="button" disabled={submitting || !form.judul || !form.user_id} onClick={() => onSubmit(form)} style={{
              flex: 2, padding: '13px', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700,
              color: 'white', cursor: submitting || !form.judul || !form.user_id ? 'not-allowed' : 'pointer',
              background: submitting || !form.judul || !form.user_id ? (dark ? '#2e2a40' : '#a78bfa') : '#7c3aed',
              boxShadow: '0 4px 14px rgba(124,58,237,0.3)' 
            }}>
              {submitting 
                ? (isEn ? 'Saving...' : 'Menyimpan...') 
                : editing 
                  ? (isEn ? 'Save Changes' : 'Simpan Perubahan') 
                  : (isEn ? 'Save Report' : 'Simpan Laporan')}
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
function SkeletonCard({ dark = false }: { dark?: boolean }) {
  const bg = dark ? '#1e1b2e' : 'white'
  const border = dark ? '1px solid #2e2a40' : '1px solid #f1f5f9'
  const shimmerBg = dark ? '#2e2a40' : '#f1f5f9'
  const shimmerBg2 = dark ? '#3d3655' : '#e2e8f0'
  
  return (
    <div style={{ 
      background: bg, borderRadius: 18, padding: '14px 16px', 
      display: 'flex', alignItems: 'center', gap: 12, 
      border: border 
    }}>
      <div style={{ 
        width: 44, height: 44, borderRadius: 14, 
        background: shimmerBg, flexShrink: 0,
        animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%',
        backgroundImage: `linear-gradient(90deg,${shimmerBg} 25%,${shimmerBg2} 50%,${shimmerBg} 75%)` 
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ 
          height: 13, width: '60%', borderRadius: 6, marginBottom: 8,
          background: shimmerBg, animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%',
          backgroundImage: `linear-gradient(90deg,${shimmerBg} 25%,${shimmerBg2} 50%,${shimmerBg} 75%)` 
        }} />
        <div style={{ 
          height: 10, width: '40%', borderRadius: 6,
          background: shimmerBg, animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%',
          backgroundImage: `linear-gradient(90deg,${shimmerBg} 25%,${shimmerBg2} 50%,${shimmerBg} 75%)` 
        }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function LaporanPage() {
  const router = useRouter()
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'

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
      const months = isEn ? ['Jan','Feb','Mar','Apr','May','Jun'] : ['Jan','Feb','Mar','Apr','Mei','Jun']
      setChartData(months.map(m => ({ bulan: m, jumlah: 0 })))
    }
  }, [isEn])

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
      else { const e = await res.json(); alert(e.error || (isEn ? 'An error occurred' : 'Terjadi kesalahan')) }
    } catch { alert(isEn ? 'An error occurred' : 'Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isEn ? 'Delete this report?' : 'Hapus laporan ini?')) return
    try {
      const res = await fetch(`/api/admin/laporan/${id}`, { method: 'DELETE' })
      if (res.ok) { fetchLaporan(); fetchChart() }
      else alert(isEn ? 'Failed to delete' : 'Gagal menghapus')
    } catch { alert(isEn ? 'An error occurred' : 'Terjadi kesalahan') }
  }

  const handleEdit   = (l: Laporan) => { setEditing(l); setShowModal(true) }
  const handleCreate = () => { setEditing(null); setShowModal(true) }

  const formatDate = (s: string | null) => {
    if (!s) return '—'
    const locale = isEn ? 'en-US' : 'id-ID'
    return new Date(s).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const total   = laporanList.length
  const bulanan = laporanList.filter(l => l.tipe === 'bulanan').length
  const tahunan = laporanList.filter(l => l.tipe === 'tahunan').length
  const khusus  = laporanList.filter(l => l.tipe === 'khusus').length

  const pctOf = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0

  const buildDelta = (value: number, subKey: 'bulan' | 'tahun') => {
    const sub = subKey === 'bulan'
      ? (isEn ? 'from last month' : 'dari bulan lalu')
      : (isEn ? 'from last year' : 'dari tahun lalu')
    if (value === 0) return { text: '~0%', sub, positive: false }
    return { text: `+${Math.max(pctOf(value), 1)}%`, sub, positive: true }
  }

  const statsConfig = [
    { key: 'semua', label: isEn ? 'Total Reports' : 'Total Laporan', value: total, 
      iconBg: isDark ? '#2e2a40' : '#f5f3ff', numColor: isDark ? '#a5b4fc' : '#7c3aed',
      ...buildDelta(total, 'bulan'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#a5b4fc' : '#7c3aed'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg> },
    { key: 'bulanan', label: isEn ? 'This Month' : 'Bulan Ini', value: bulanan, 
      iconBg: isDark ? '#1e2a3d' : '#eff6ff', numColor: isDark ? '#60a5fa' : '#2563eb',
      ...buildDelta(bulanan, 'bulan'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#60a5fa' : '#2563eb'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg> },
    { key: 'tahunan', label: isEn ? 'This Year' : 'Tahun Ini', value: tahunan, 
      iconBg: isDark ? '#1a2e1a' : '#ecfdf5', numColor: isDark ? '#34d399' : '#16a34a',
      ...buildDelta(tahunan, 'tahun'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#34d399' : '#16a34a'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg> },
    { key: 'khusus', label: isEn ? 'Special' : 'Khusus', value: khusus, 
      iconBg: isDark ? '#2e2a1a' : '#fffbeb', numColor: isDark ? '#fbbf24' : '#d97706',
      ...buildDelta(khusus, 'bulan'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#fbbf24' : '#d97706'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg> },
  ]

  const laporanTertinggi = chartData.length
    ? chartData.reduce((max, d) => d.jumlah > max.jumlah ? d : max, chartData[0])
    : null
  const rataRata = chartData.length
    ? (chartData.reduce((sum, d) => sum + d.jumlah, 0) / chartData.length)
    : 0

  // Seri diagram: laporan per bulan + akumulasinya
  const chartLabels = chartData.map(d => d.bulan)
  const perBulan    = chartData.map(d => d.jumlah)
  let   runTotal    = 0
  const akumulasi   = perBulan.map(v => (runTotal += v))

  // Gaya kartu pembungkus (sama dengan halaman Pendaftar)
  const wrapBg     = isDark ? 'linear-gradient(180deg,#262239 0%,#1e1b2e 100%)' : 'linear-gradient(180deg,#ffffff 0%,#FAFBFF 100%)'
  const wrapBorder = isDark ? '1px solid #322d49' : '1px solid #EBEEF5'
  const wrapShadow = isDark
    ? '0 1px 0 rgba(255,255,255,0.05) inset, 0 1px 2px rgba(0,0,0,0.45), 0 8px 20px -6px rgba(0,0,0,0.55)'
    : '0 1px 0 rgba(255,255,255,0.95) inset, 0 1px 2px rgba(16,24,40,0.05), 0 6px 16px -4px rgba(16,24,40,0.08), 0 18px 34px -14px rgba(16,24,40,0.12)'
  const innerBg     = isDark ? '#241f38' : '#F7F8FC'
  const innerBorder = isDark ? '1.5px solid #322d49' : '1.5px solid #EEF0F6'
  const TILE_TINT: Record<string, string> = { semua: '#DDD6FE', bulanan: '#BFDBFE', tahunan: '#A7F3D0', khusus: '#FDE68A' }

  const bgColor = isDark ? '#15131f' : '#f6f5fa'
  const cardBg = isDark ? '#1e1b2e' : 'white'
  const cardBorder = isDark ? '1px solid #2e2a40' : '1px solid #f1f5f9'
  const textColor = isDark ? '#f1f0f5' : '#1a1033'
  const mutedColor = isDark ? '#94a3b8' : '#94a3b8'
  const headerBg = isDark ? '#15131f' : '#f6f5fa'

  return (
    <div style={{ 
      background: bgColor, height: '100dvh', display: 'flex', 
      flexDirection: 'column', overflow: 'hidden' 
    }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>

      {/* ─── FIXED HEADER + TAB ──────── */}
      <div style={{
        flexShrink: 0,
        background: headerBg,
        zIndex: 50,
        boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(15,23,42,0.06)',
        borderBottom: isDark ? '1px solid #2e2a40' : 'none',
      }}>

      {/* ── HEADER ───────────────────────────────────────── */}
      <div style={{ 
        padding: '18px 18px 14px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <button 
            onClick={() => router.back()} 
            style={{ 
              width: 40, height: 40, borderRadius: '50%',
              background: isDark ? '#2e2a40' : '#f5f3ff',
              border: isDark ? '1px solid #3d3655' : '1px solid #ede9fe',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(109,40,217,0.08)',
              color: isDark ? '#a5b4fc' : '#7c3aed',
            }}
            aria-label={isEn ? 'Back' : 'Kembali'}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div>
            <h1 style={{
              fontSize: 18, fontWeight: 800, color: textColor, margin: 0, letterSpacing: '-0.3px',
            }}>
              {isEn ? 'Reports' : 'Laporan'}
            </h1>
            <p style={{ fontSize: 11.5, color: mutedColor, margin: '2px 0 0', fontWeight: 500 }}>
              {isEn ? 'System app preferences' : 'Buat Laporan untuk santri'}
            </p>
          </div>
        </div>
      </div>

      </div>{/* end fixed header */}

      {/* ── SCROLLABLE CONTENT ──────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' as const, paddingTop: 16 }}>
      {activeTab === 'detail' ? (
        <div style={{ padding: '0 16px 32px' }}>
          <div style={{ 
            background: cardBg, borderRadius: 20, padding: '16px 14px',
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(15,23,42,0.06)',
            border: cardBorder 
          }}>

            {/* Header tabel */}
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 14, gap: 10, flexWrap: 'wrap' as const 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ 
                  width: 36, height: 36, borderRadius: 10, 
                  background: isDark ? '#2e2a40' : '#f5f3ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isDark ? '#a5b4fc' : '#7c3aed',
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: textColor, margin: 0 }}>
                    {isEn ? 'Report Details' : 'Detail Laporan'}
                  </p>
                  <p style={{ fontSize: 11, color: mutedColor, margin: '1px 0 0' }}>
                    {laporanList.length} {isEn ? 'reports · scroll right to see all columns' : 'laporan · geser ke kanan untuk lihat semua kolom'}
                  </p>
                </div>
              </div>
              <button onClick={handleCreate} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 12, fontSize: 12.5, fontWeight: 800,
                border: 'none', cursor: 'pointer', flexShrink: 0,
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white',
                boxShadow: '0 4px 14px rgba(124,58,237,0.35)' 
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {isEn ? 'Create Report' : 'Buat Laporan Baru'}
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} dark={isDark} />)}
              </div>
            ) : laporanList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ 
                  width: 72, height: 72, borderRadius: 22, 
                  background: isDark ? '#2e2a40' : '#f5f3ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  margin: '0 auto 14px',
                  color: isDark ? '#a5b4fc' : '#7c3aed',
                }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: textColor, margin: 0 }}>
                  {isEn ? 'No reports yet' : 'Belum ada laporan'}
                </p>
                <p style={{ fontSize: 12, color: mutedColor, margin: '6px 0 18px' }}>
                  {isEn ? 'Create your first report to see details here.' : 'Buat laporan pertama untuk melihat rinciannya di sini.'}
                </p>
                <button onClick={handleCreate} style={{ 
                  padding: '11px 24px', borderRadius: 50, fontSize: 13,
                  fontWeight: 700, border: 'none', cursor: 'pointer', 
                  background: '#7c3aed', color: 'white',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.3)' 
                }}>
                  {isEn ? '+ Create Report' : '+ Buat Laporan'}
                </button>
              </div>
            ) : (
              <div style={{ 
                overflowX: 'auto', WebkitOverflowScrolling: 'touch' as const,
                margin: '0 -14px', padding: '0 14px' 
              }}>
                <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: `1.5px solid ${isDark ? '#2e2a40' : '#f1f5f9'}` }}>
                      <th style={getThStyle(isDark)}>{isEn ? 'Report Title' : 'Judul Laporan'}</th>
                      <th style={getThStyle(isDark)}>{isEn ? 'Student' : 'Siswa'}</th>
                      <th style={getThStyle(isDark)}>{isEn ? 'Type' : 'Tipe'}</th>
                      <th style={getThStyle(isDark)}>{isEn ? 'Date' : 'Tanggal'}</th>
                      <th style={getThStyle(isDark)}>{isEn ? 'Attachment' : 'Lampiran'}</th>
                      <th style={getThStyle(isDark)}>{isEn ? 'Created By' : 'Dibuat Oleh'}</th>
                      <th style={{ ...getThStyle(isDark) }}>{isEn ? 'Actions' : 'Aksi'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporanList.map((laporan, idx) => {
                      const cfg = TIPE_CFG[laporan.tipe] || { 
                        bg: '#f3f4f6', bgDark: '#2e2a40', color: '#6b7280', 
                        label: laporan.tipe, labelEn: laporan.tipe, 
                        iconBg: '#f3f4f6', iconBgDark: '#2e2a40' 
                      }
                      const label = isEn ? cfg.labelEn : cfg.label
                      const rowBg = idx % 2 === 1 ? (isDark ? '#15131f' : '#fafafa') : (isDark ? '#1e1b2e' : 'white')
                      return (
                        <tr key={laporan.id} style={{
                          borderBottom: `1px solid ${isDark ? '#2e2a40' : '#f5f5f7'}`,
                          background: rowBg,
                          animation: 'fadeUp 0.3s ease both', animationDelay: `${idx * 35}ms`,
                        }}>
                          <td style={{ ...getTdStyle(), fontWeight: 700, color: textColor, maxWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <LaporanIcon tipe={laporan.tipe} size={30} dark={isDark} />
                              <span style={{ 
                                whiteSpace: 'nowrap', overflow: 'hidden', 
                                textOverflow: 'ellipsis', display: 'block', maxWidth: 150 
                              }}>
                                {laporan.judul}
                              </span>
                            </div>
                          </td>
                          <td style={getTdStyle()}>
                            {laporan.profiles
                              ? <span style={{ color: textColor, fontWeight: 600 }}>{laporan.profiles.name}</span>
                              : <span style={{ color: isDark ? '#6b6885' : '#cbd5e1' }}>—</span>}
                          </td>
                          <td style={getTdStyle()}>
                            <span style={{ 
                              fontSize: 10.5, fontWeight: 700, color: cfg.color, 
                              background: isDark ? cfg.bgDark : cfg.bg,
                              padding: '4px 10px', borderRadius: 50, whiteSpace: 'nowrap' as const 
                            }}>
                              {label}
                            </span>
                          </td>
                          <td style={{ ...getTdStyle(), color: isDark ? '#94a3b8' : '#6b7280', whiteSpace: 'nowrap' as const }}>
                            {formatDate(laporan.created_at)}
                          </td>
                          <td style={getTdStyle()}>
                            {laporan.file_url ? (
                              <a href={laporan.file_url} target="_blank" rel="noopener noreferrer"
                                style={{ 
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  fontSize: 11.5, color: '#3b82f6', fontWeight: 700, 
                                  textDecoration: 'none', whiteSpace: 'nowrap' as const 
                                }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                                </svg>
                                {isEn ? 'View File' : 'Lihat File'}
                              </a>
                            ) : <span style={{ color: isDark ? '#6b6885' : '#cbd5e1' }}>—</span>}
                          </td>
                          <td style={getTdStyle()}>
                            {laporan.creator
                              ? <span style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>{laporan.creator.name}</span>
                              : <span style={{ color: isDark ? '#6b6885' : '#cbd5e1' }}>—</span>}
                          </td>
                          <td style={{ ...getTdStyle() }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                              <ItemMenu 
                                laporan={laporan} 
                                onEdit={handleEdit} 
                                onDelete={handleDelete} 
                                dark={isDark}
                                isEn={isEn}
                              />
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

        {/* ── Stats: satu kartu menampung ke-4 kartu (gaya Pendaftar) ── */}
        <div style={{
          background: wrapBg, border: wrapBorder, borderRadius: 22,
          boxShadow: wrapShadow, padding: '16px 12px 12px',
        }}>
          <div style={{ padding: '0 4px' }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: textColor, margin: 0, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              {isEn ? 'Report Overview' : 'Ikhtisar Laporan'}
            </p>
            <p style={{ fontSize: 11, fontWeight: 500, color: mutedColor, margin: '2px 0 0' }}>
              {isEn ? 'Report totals by period' : 'Total laporan berdasarkan periode'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, marginTop: 14 }}>
            {statsConfig.map((s, i) => (
              <div key={s.key} style={{
                background: innerBg, border: innerBorder, borderRadius: 16,
                padding: '12px 6px 10px', minWidth: 0, textAlign: 'center' as const,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 70}ms`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: isDark ? s.iconBg : `radial-gradient(circle at 35% 25%, #ffffff 0%, ${TILE_TINT[s.key]} 100%)`,
                  border: isDark ? '1px solid #3d3655' : '1px solid rgba(255,255,255,0.9)',
                  boxShadow: isDark ? 'none' : '0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 14px -8px rgba(16,24,40,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 21, fontWeight: 900, color: textColor, lineHeight: 1.1, marginTop: 2 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: isDark ? '#94a3b8' : '#374151', lineHeight: 1.3 }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: 9, fontWeight: 800, lineHeight: 1.2,
                  color: s.positive ? '#16a34a' : mutedColor,
                  display: 'flex', alignItems: 'center', gap: 2,
                }}>
                  {s.positive && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/>
                    </svg>
                  )}
                  {s.text}
                </div>
                <div style={{ fontSize: 8, fontWeight: 500, color: isDark ? '#6b6885' : '#94a3b8', lineHeight: 1.2 }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ringkasan Laporan: diagram dua garis ───────── */}
        <div style={{
          background: wrapBg, border: wrapBorder, borderRadius: 22,
          boxShadow: wrapShadow, padding: '18px 16px 16px', minWidth: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' as const }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: textColor, margin: 0, letterSpacing: '-0.3px' }}>
              {isEn ? 'Report Summary' : 'Ringkasan Laporan'}
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: isDark ? '#15131f' : '#ffffff',
              border: `1px solid ${isDark ? '#2e2a40' : '#e5e7eb'}`,
              borderRadius: 10, padding: '5px 10px',
              fontSize: 11, color: mutedColor, fontWeight: 600,
            }}>
              {isEn ? 'Last 6 Months' : '6 Bulan Terakhir'}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#6b6885' : '#94a3b8'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          {/* Legenda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0 14px', flexWrap: 'wrap' as const }}>
            {[
              { color: isDark ? '#60a5fa' : '#3b82f6', label: isEn ? 'Reports per Month' : 'Laporan per Bulan' },
              { color: isDark ? '#34d399' : '#22c55e', label: isEn ? 'Cumulative' : 'Akumulasi' },
            ].map(l => (
              <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: isDark ? '#b3aec4' : '#6b7280' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                {l.label}
              </span>
            ))}
          </div>

          <OverviewChart
            labels={chartLabels}
            a={perBulan}
            b={akumulasi}
            dark={isDark}
            emptyText={isEn ? 'No data available' : 'Belum ada data laporan'}
          />

          {/* Ringkas: tertinggi & rata-rata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
            <div style={{ background: innerBg, border: innerBorder, borderRadius: 14, padding: '10px 12px' }}>
              <p style={{ fontSize: 10.5, fontWeight: 600, color: mutedColor, margin: 0 }}>
                {isEn ? 'Highest Report' : 'Laporan Tertinggi'}
              </p>
              <p style={{ fontSize: 17, fontWeight: 900, color: textColor, margin: '4px 0 0', lineHeight: 1.1 }}>
                {laporanTertinggi ? laporanTertinggi.jumlah : 0}
                <span style={{ fontSize: 11, fontWeight: 700, color: mutedColor }}> {isEn ? 'reports' : 'laporan'}</span>
              </p>
              <p style={{ fontSize: 10.5, color: mutedColor, margin: '2px 0 0' }}>
                {laporanTertinggi ? laporanTertinggi.bulan : '—'}
              </p>
            </div>
            <div style={{ background: innerBg, border: innerBorder, borderRadius: 14, padding: '10px 12px' }}>
              <p style={{ fontSize: 10.5, fontWeight: 600, color: mutedColor, margin: 0 }}>
                {isEn ? 'Monthly Average' : 'Rata-rata per Bulan'}
              </p>
              <p style={{ fontSize: 17, fontWeight: 900, color: textColor, margin: '4px 0 0', lineHeight: 1.1 }}>
                {rataRata.toLocaleString(isEn ? 'en-US' : 'id-ID', { maximumFractionDigits: 1 })}
                <span style={{ fontSize: 11, fontWeight: 700, color: mutedColor }}> {isEn ? 'reports' : 'laporan'}</span>
              </p>
              <p style={{ fontSize: 10.5, color: mutedColor, margin: '2px 0 0' }}>
                {isEn ? 'Last 6 months' : '6 bulan terakhir'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Daftar Laporan ──────────────────────────────── */}
        <div style={{ 
          background: cardBg, borderRadius: 20, padding: '18px 16px',
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(15,23,42,0.06)',
          border: cardBorder 
        }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            marginBottom: 16, gap: 10, flexWrap: 'wrap' as const 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ 
                width: 36, height: 36, borderRadius: 10, 
                background: isDark ? '#2e2a40' : '#f5f3ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isDark ? '#a5b4fc' : '#7c3aed',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: textColor, margin: 0 }}>
                {isEn ? 'Report List' : 'Daftar Laporan'}
              </p>
            </div>
            <button onClick={handleCreate} style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 12, fontSize: 12.5, fontWeight: 800,
              border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white',
              boxShadow: '0 4px 14px rgba(124,58,237,0.35)' 
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {isEn ? 'Create Report' : 'Buat Laporan Baru'}
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} dark={isDark} />)}
            </div>
          ) : laporanList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ 
                width: 72, height: 72, borderRadius: 22, 
                background: isDark ? '#2e2a40' : '#f5f3ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 14px',
                color: isDark ? '#a5b4fc' : '#7c3aed',
              }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: textColor, margin: 0 }}>
                {isEn ? 'No reports yet' : 'Belum ada laporan'}
              </p>
              <p style={{ fontSize: 12, color: mutedColor, margin: '6px 0 18px' }}>
                {isEn ? 'Create your first report to see analysis data.' : 'Buat laporan pertama untuk melihat analisis data.'}
              </p>
              <button onClick={handleCreate} style={{ 
                padding: '11px 24px', borderRadius: 50, fontSize: 13,
                fontWeight: 700, border: 'none', cursor: 'pointer', 
                background: '#7c3aed', color: 'white',
                boxShadow: '0 4px 12px rgba(124,58,237,0.3)' 
              }}>
                {isEn ? '+ Create Report' : '+ Buat Laporan'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {laporanList.map((laporan, idx) => {
                const cfg = TIPE_CFG[laporan.tipe] || { 
                  bg: '#f3f4f6', bgDark: '#2e2a40', color: '#6b7280', 
                  label: laporan.tipe, labelEn: laporan.tipe,
                  iconBg: '#f3f4f6', iconBgDark: '#2e2a40' 
                }
                const label = isEn ? cfg.labelEn : cfg.label
                const itemBg = isDark ? '#15131f' : '#fafafa'
                const itemBorder = isDark ? '1px solid #2e2a40' : '1.5px solid #f1f5f9'
                return (
                  <div key={laporan.id} style={{ 
                    background: itemBg, borderRadius: 18, padding: '14px 14px',
                    display: 'flex', alignItems: 'center', gap: 12, 
                    border: itemBorder,
                    animation: 'fadeUp 0.35s ease both', animationDelay: `${idx * 50}ms`,
                    transition: 'box-shadow 0.15s' 
                  }}>
                    <LaporanIcon tipe={laporan.tipe} dark={isDark} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ 
                        fontWeight: 700, fontSize: 13, color: textColor, margin: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                      }}>
                        {laporan.judul}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 10, color: mutedColor, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {formatDate(laporan.created_at)}
                        </span>
                        {laporan.profiles && (
                          <>
                            <span style={{ color: isDark ? '#2e2a40' : '#e2e8f0' }}>·</span>
                            <span style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#6b7280', display: 'flex', alignItems: 'center', gap: 3 }}>
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
                            <span style={{ color: isDark ? '#2e2a40' : '#e2e8f0' }}>·</span>
                            <span style={{ fontSize: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                              </svg>
                              {isEn ? 'Has attachment' : 'Ada lampiran'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: 10, fontWeight: 700, color: cfg.color, 
                      background: isDark ? cfg.bgDark : cfg.bg,
                      padding: '4px 10px', borderRadius: 50, 
                      flexShrink: 0, whiteSpace: 'nowrap' as const 
                    }}>
                      {label}
                    </span>
                    <ItemMenu 
                      laporan={laporan} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                      dark={isDark}
                      isEn={isEn}
                    />
                  </div>
                )
              })}

              <button onClick={() => setActiveTab('detail')} style={{
                marginTop: 6, padding: '12px', borderRadius: 14,
                fontSize: 13, fontWeight: 700, border: 'none', 
                background: 'transparent', color: '#6d28d9', 
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 6 
              }}>
                {isEn ? 'View All Reports' : 'Lihat Semua Laporan'}
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
        dark={isDark}
        isEn={isEn}
      />
    </div>
  )
}