'use client'

import { useState, useEffect, useCallback } from 'react'

interface Jadwal {
  id: string
  label: string
  tanggal: string
  tanggal_mulai: string | null
  tanggal_selesai: string | null
  status: string
  warna: string
  urutan: number
}

type StatusOption = 'Selesai' | 'Berlangsung' | 'Akan Datang'
type FilterOption = 'Semua Tahapan' | StatusOption

const STATUS_OPTIONS: StatusOption[] = ['Akan Datang', 'Berlangsung', 'Selesai']

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  Selesai:       { color: '#10b981', bg: '#ecfdf5' },
  Berlangsung:   { color: '#f59e0b', bg: '#fef3c7' },
  'Akan Datang': { color: '#6d28d9', bg: '#ede9fe' },
}

const WARNA_PRESETS = [
  '#7c3aed','#10b981','#3b82f6','#ef4444',
  '#f59e0b','#ec4899','#0ea5e9','#14b8a6',
]

const emptyForm = () => ({
  label: '',
  tanggal: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  status: 'Akan Datang' as StatusOption,
  warna: '#7c3aed',
  urutan: 0,
})

// ─────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────
const IconCalendar = ({ size = 24, color = '#7c3aed' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const IconCheck = ({ size = 24, color = '#10b981' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const IconClock = ({ size = 24, color = '#f59e0b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconUser = ({ size = 24, color = '#3b82f6' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const IconEdit = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const IconTrash = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
)
const IconFilter = ({ size = 13, color = '#64748b' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)
const IconPlus = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

// ─────────────────────────────────────────────
// Modal Tambah/Edit
// ─────────────────────────────────────────────
function JadwalModal({
  open, onClose, onSave, editing, submitting,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: ReturnType<typeof emptyForm>) => void
  editing: Jadwal | null
  submitting: boolean
}) {
  const [form, setForm] = useState<ReturnType<typeof emptyForm>>(() =>
    editing
      ? { label: editing.label, tanggal: editing.tanggal, tanggal_mulai: editing.tanggal_mulai || '',
          tanggal_selesai: editing.tanggal_selesai || '', status: editing.status as StatusOption,
          warna: editing.warna, urutan: editing.urutan }
      : emptyForm()
  )
  if (!open) return null
  const set = (key: string, val: string | number) => setForm(f => ({ ...f, [key]: val }))

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 12, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    color: '#111827', background: '#fafafa', transition: 'border-color 0.15s',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex',
        alignItems: 'flex-end', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', width: '100%',
          maxWidth: 480, maxHeight: '92vh', overflowY: 'auto', padding: '0 0 36px' }}
        onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: 44, height: 4, borderRadius: 99, background: '#e5e7eb' }} />
        </div>
        <div style={{ padding: '18px 24px 0' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
            {editing ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
            {editing ? 'Ubah informasi jadwal ini' : 'Isi form untuk menambah jadwal baru'}
          </p>
        </div>
        <div style={{ padding: '20px 24px 0', display: 'grid', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nama Jadwal <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} placeholder="contoh: Pembukaan Pendaftaran"
              value={form.label} onChange={e => set('label', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Tampilan Tanggal <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} placeholder="contoh: 01 – 20 Jun 2026"
              value={form.tanggal} onChange={e => set('tanggal', e.target.value)} />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Teks ini yang ditampilkan di timeline.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Tanggal Mulai</label>
              <input type="date" style={inputStyle} value={form.tanggal_mulai} onChange={e => set('tanggal_mulai', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Tanggal Selesai</label>
              <input type="date" style={inputStyle} value={form.tanggal_selesai} onChange={e => set('tanggal_selesai', e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {STATUS_OPTIONS.map(s => {
                const st = STATUS_STYLE[s]
                const active = form.status === s
                return (
                  <button key={s} type="button" onClick={() => set('status', s)} style={{
                    flex: 1, padding: '9px 6px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                    border: active ? `2px solid ${st.color}` : '2px solid transparent',
                    background: active ? st.bg : '#f8fafc', color: active ? st.color : '#94a3b8',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>{s}</button>
                )
              })}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Warna Label</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {WARNA_PRESETS.map(c => (
                <button key={c} type="button" onClick={() => set('warna', c)} style={{
                  width: 32, height: 32, borderRadius: 9, background: c, cursor: 'pointer',
                  border: form.warna === c ? '3px solid #111827' : '3px solid transparent',
                  boxShadow: form.warna === c ? '0 0 0 2px white inset' : 'none',
                  transition: 'all 0.1s',
                }} />
              ))}
              <input style={{ ...inputStyle, flex: 1, minWidth: 100, padding: '6px 10px', fontSize: 12 }}
                placeholder="#7c3aed" value={form.warna} onChange={e => set('warna', e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Urutan Tampil</label>
            <input type="number" style={inputStyle} placeholder="1" value={form.urutan}
              onChange={e => set('urutan', parseInt(e.target.value) || 0)} min={0} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '13px', border: '1.5px solid #e5e7eb', borderRadius: 14,
              fontSize: 14, fontWeight: 600, color: '#374151', background: 'white', cursor: 'pointer',
            }}>Batal</button>
            <button type="button" disabled={submitting || !form.label || !form.tanggal}
              onClick={() => onSave(form)} style={{
                flex: 2, padding: '13px', border: 'none', borderRadius: 14, fontSize: 14,
                fontWeight: 700, color: 'white', cursor: submitting ? 'not-allowed' : 'pointer',
                background: submitting || !form.label || !form.tanggal ? '#a78bfa' : '#7c3aed',
                boxShadow: '0 4px 14px rgba(124,58,237,0.3)', transition: 'all 0.15s',
              }}>
              {submitting ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Jadwal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm, label, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; label: string; loading: boolean
}) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24, backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 24, padding: 28, width: '100%', maxWidth: 340, textAlign: 'center' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: '#fef2f2', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Hapus Jadwal?</h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', lineHeight: 1.5 }}>
          Jadwal <strong>&ldquo;{label}&rdquo;</strong> akan dihapus permanen.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', border: '1.5px solid #e5e7eb',
            borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#374151', background: 'white', cursor: 'pointer' }}>
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: '12px', border: 'none',
            borderRadius: 12, fontSize: 14, fontWeight: 700, color: 'white',
            background: loading ? '#fca5a5' : '#ef4444', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Timeline Item
// ─────────────────────────────────────────────
function TimelineItem({ jadwal, isLast, onEdit, onDelete }: {
  jadwal: Jadwal; isLast: boolean; onEdit: (j: Jadwal) => void; onDelete: (j: Jadwal) => void
}) {
  const st = STATUS_STYLE[jadwal.status] || STATUS_STYLE['Akan Datang']
  return (
    <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
      {/* Dot + vertical line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: jadwal.warna,
          border: '2.5px solid white', boxShadow: `0 0 0 3px ${jadwal.warna}30`,
          marginTop: 20, flexShrink: 0, zIndex: 1,
        }} />
        {!isLast && <div style={{ width: 2, flex: 1, background: '#e5e7eb', marginTop: 4, minHeight: 20, borderRadius: 1 }} />}
      </div>

      {/* Card */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 14 }}>
        <div style={{
          background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 20,
          padding: '16px 16px', display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 10,
          boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
          transition: 'box-shadow 0.2s',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
              {jadwal.label}
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '5px 0 0', fontWeight: 500 }}>
              {jadwal.tanggal}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{
              fontSize: 11, color: st.color, fontWeight: 700, background: st.bg,
              padding: '4px 12px', borderRadius: 50, whiteSpace: 'nowrap',
            }}>{jadwal.status}</span>
            <button onClick={() => onEdit(jadwal)} title="Edit" style={{
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10, border: 'none', background: '#ede9fe', color: '#7c3aed', cursor: 'pointer',
            }}><IconEdit /></button>
            <button onClick={() => onDelete(jadwal)} title="Hapus" style={{
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer',
            }}><IconTrash /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
function StatCard({ icon, iconBg, value, label, sub, subColor }: {
  icon: React.ReactNode; iconBg: string; value: number; label: string; sub: string; subColor: string
}) {
  return (
    <div style={{
      background: 'white', border: '1.5px solid #f1f5f9', borderRadius: 18,
      padding: '16px 8px 14px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 6, flex: 1,
      boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 14, background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <p style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 10, color: '#64748b', margin: 0, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>{label}</p>
      <p style={{ fontSize: 9, color: subColor, margin: 0, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{sub}</p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function JadwalPage() {
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Jadwal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Jadwal | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [filter, setFilter] = useState<FilterOption>('Semua Tahapan')

  const fetchJadwal = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/jadwal')
      const data = await res.json()
      if (data.data) setJadwalList(data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchJadwal() }, [fetchJadwal])

  const handleSave = async (form: ReturnType<typeof emptyForm>) => {
    setSubmitting(true)
    try {
      const url = editing ? `/api/admin/jadwal/${editing.id}` : '/api/admin/jadwal'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { fetchJadwal(); setShowModal(false); setEditing(null) }
      else { const err = await res.json(); alert(err.error || 'Terjadi kesalahan') }
    } catch { alert('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/jadwal/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) { fetchJadwal(); setDeleteTarget(null) }
      else alert('Gagal menghapus jadwal')
    } catch { alert('Terjadi kesalahan') }
    finally { setDeleting(false) }
  }

  const openCreate = () => { setEditing(null); setShowModal(true) }
  const openEdit = (j: Jadwal) => { setEditing(j); setShowModal(true) }

  const total       = jadwalList.length
  const selesai     = jadwalList.filter(j => j.status === 'Selesai').length
  const berlangsung = jadwalList.filter(j => j.status === 'Berlangsung').length
  const mendatang   = jadwalList.filter(j => j.status === 'Akan Datang').length
  const filteredList = filter === 'Semua Tahapan' ? jadwalList : jadwalList.filter(j => j.status === filter)

  return (
    <div style={{ background: '#f4f2fb', minHeight: '100vh' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* ── HERO HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: '#f4f2fb',
        padding: '32px 20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative calendar illustration — pojok kanan atas */}
        <div style={{
          position: 'absolute', right: 12, top: 16,
          width: 110, height: 110, opacity: 0.85,
          pointerEvents: 'none',
        }}>
          {/* 3D-style calendar SVG */}
          <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shadow */}
            <ellipse cx="55" cy="100" rx="38" ry="6" fill="#c4b5fd" opacity="0.3"/>
            {/* Body */}
            <rect x="10" y="20" width="80" height="72" rx="14" fill="#7c3aed"/>
            <rect x="10" y="20" width="80" height="72" rx="14" fill="url(#calGrad)"/>
            {/* Top strip */}
            <rect x="10" y="20" width="80" height="28" rx="14" fill="#6d28d9"/>
            <rect x="10" y="34" width="80" height="14" fill="#6d28d9"/>
            {/* Ring left */}
            <rect x="30" y="12" width="8" height="18" rx="4" fill="#a78bfa"/>
            {/* Ring right */}
            <rect x="72" y="12" width="8" height="18" rx="4" fill="#a78bfa"/>
            {/* White page */}
            <rect x="18" y="50" width="64" height="36" rx="8" fill="white" opacity="0.95"/>
            {/* Grid dots */}
            <rect x="25" y="58" width="10" height="8" rx="2" fill="#ede9fe"/>
            <rect x="40" y="58" width="10" height="8" rx="2" fill="#ede9fe"/>
            <rect x="55" y="58" width="10" height="8" rx="2" fill="#7c3aed" opacity="0.4"/>
            <rect x="70" y="58" width="10" height="8" rx="2" fill="#ede9fe"/>
            <rect x="25" y="70" width="10" height="8" rx="2" fill="#ede9fe"/>
            <rect x="40" y="70" width="10" height="8" rx="2" fill="#ede9fe"/>
            <rect x="55" y="70" width="10" height="8" rx="2" fill="#ede9fe"/>
            <rect x="70" y="70" width="10" height="8" rx="2" fill="#ede9fe"/>
            {/* Clock circle overlay */}
            <circle cx="82" cy="78" r="16" fill="#fff" stroke="#e0d9f7" strokeWidth="2"/>
            <circle cx="82" cy="78" r="13" fill="#7c3aed" opacity="0.08"/>
            <line x1="82" y1="71" x2="82" y2="78" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round"/>
            <line x1="82" y1="78" x2="87" y2="81" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round"/>
            {/* Leaf accent */}
            <ellipse cx="22" cy="85" rx="7" ry="3" fill="#34d399" opacity="0.7" transform="rotate(-30 22 85)"/>
            <ellipse cx="26" cy="90" rx="5" ry="2.5" fill="#10b981" opacity="0.5" transform="rotate(-20 26 90)"/>
            <defs>
              <linearGradient id="calGrad" x1="10" y1="20" x2="90" y2="92" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" stopOpacity="0.3"/>
                <stop offset="1" stopColor="#7c3aed" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title */}
        <div style={{ maxWidth: 'calc(100% - 130px)' }}>
          <h1 style={{
            margin: 0, fontSize: 30, fontWeight: 900,
            color: '#1a1033', letterSpacing: '-0.04em', lineHeight: 1.1,
          }}>
            Jadwal<br />Pendaftaran
          </h1>
          <p style={{
            margin: '10px 0 0', fontSize: 13, color: '#7c6fa0',
            fontWeight: 400, lineHeight: 1.5, maxWidth: 240,
          }}>
            Pantau semua tanggal penting pendaftaran dan seleksi dalam satu tampilan.
          </p>
        </div>
      </div>

      {/* ── CONTENT AREA ────────────────────────────────────────── */}
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Card: Tambah + Stats ───────────────────────────────── */}
        <div style={{
          background: 'white', borderRadius: 24, padding: 16,
          boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9',
        }}>
          {/* Tombol Tambah Jadwal */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={openCreate} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '11px 22px', borderRadius: 50, fontSize: 14,
              fontWeight: 700, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: 'white', boxShadow: '0 6px 18px rgba(124,58,237,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}>
              <IconPlus size={15} /> Tambah Jadwal
            </button>
          </div>

          {/* 4 Stat Cards */}
          <div style={{ display: 'flex', gap: 10 }}>
            <StatCard icon={<IconCalendar size={20} color="#7c3aed" />} iconBg="#f5f3ff"
              value={total} label="Total Jadwal" sub="Semua tahapan" subColor="#94a3b8" />
            <StatCard icon={<IconCheck size={20} color="#10b981" />} iconBg="#ecfdf5"
              value={selesai} label="Selesai" sub="Tahapan selesai" subColor="#10b981" />
            <StatCard icon={<IconClock size={20} color="#f59e0b" />} iconBg="#fef9ec"
              value={berlangsung} label="Berlangsung" sub="Sedang berjalan" subColor="#f59e0b" />
            <StatCard icon={<IconUser size={20} color="#3b82f6" />} iconBg="#eff6ff"
              value={mendatang} label="Mendatang" sub="Akan datang" subColor="#3b82f6" />
          </div>
        </div>

        {/* ── Card: Timeline ─────────────────────────────────────── */}
        <div style={{
          background: 'white', borderRadius: 24, padding: '18px 16px 16px',
          boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9',
        }}>
          {/* Header timeline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: '#ede9fe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCalendar size={19} color="#7c3aed" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                Timeline Pendaftaran
              </p>
            </div>
            {/* Filter */}
            <div style={{ position: 'relative' }}>
              <select value={filter} onChange={e => setFilter(e.target.value as FilterOption)} style={{
                appearance: 'none', padding: '7px 30px 7px 11px', borderRadius: 10,
                border: '1.5px solid #e5e7eb', fontSize: 12, fontWeight: 600, color: '#374151',
                background: '#f8fafc', cursor: 'pointer', outline: 'none',
              }}>
                <option value="Semua Tahapan">Semua Tahapan</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <IconFilter size={12} />
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ padding: '36px 0', textAlign: 'center' }}>
              <div style={{
                display: 'inline-block', width: 30, height: 30,
                border: '3px solid #ede9fe', borderTopColor: '#7c3aed',
                borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              }} />
              <p style={{ marginTop: 12, color: '#94a3b8', fontSize: 13 }}>Memuat jadwal...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: '#ede9fe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <IconCalendar size={28} color="#7c3aed" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: 0 }}>Belum ada jadwal</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 16px' }}>Tambahkan jadwal untuk memulai.</p>
              <button onClick={openCreate} style={{
                padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700,
                border: 'none', cursor: 'pointer', background: '#7c3aed', color: 'white',
                boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
              }}>+ Tambah Jadwal</button>
            </div>
          ) : (
            <div>
              {filteredList.map((j, idx) => (
                <TimelineItem key={j.id} jadwal={j} isLast={idx === filteredList.length - 1}
                  onEdit={openEdit} onDelete={setDeleteTarget} />
              ))}
            </div>
          )}

          {/* Tombol tambah tahapan bawah */}
          {!loading && (
            <button onClick={openCreate} style={{
              width: '100%', marginTop: filteredList.length > 0 ? 16 : 8, padding: '13px',
              borderRadius: 14, fontSize: 13, fontWeight: 700,
              border: '1.5px dashed #d1d5db', background: 'white',
              color: '#7c3aed', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'background 0.15s',
            }}>
              <IconPlus size={14} /> Tambah Tahapan
            </button>
          )}
        </div>

      </div>

      {/* Modals */}
      <JadwalModal
        key={editing ? editing.id : 'new'}
        open={showModal}
        onClose={() => { setShowModal(false); setEditing(null) }}
        onSave={handleSave}
        editing={editing}
        submitting={submitting}
      />
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        label={deleteTarget?.label || ''}
        loading={deleting}
      />
    </div>
  )
}