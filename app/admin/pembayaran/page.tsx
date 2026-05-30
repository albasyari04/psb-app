'use client'

// app/(admin)/admin/pembayaran/page.tsx
// Full CRUD: Tambah, Edit, Hapus, Konfirmasi pembayaran

import { useState, useEffect, useCallback } from 'react'
import { Pembayaran, PembayaranFormData } from '@/types'

// ─── Konstanta ───────────────────────────────────────────────
const JENIS_OPTIONS = ['Formulir', 'SPP', 'Seragam', 'Lainnya']
const METODE_OPTIONS = ['Transfer Bank', 'Tunai', 'QRIS']
const STATUS_OPTIONS = ['menunggu', 'dikonfirmasi', 'ditolak']

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  dikonfirmasi: { label: 'Dikonfirmasi', color: '#059669', bg: '#d1fae5' },
  menunggu:     { label: 'Menunggu',     color: '#d97706', bg: '#fef3c7' },
  ditolak:      { label: 'Ditolak',      color: '#dc2626', bg: '#fee2e2' },
}

const EMPTY_FORM: PembayaranFormData = {
  user_id: '',
  nama_siswa: '',
  nominal: 0,
  jenis_pembayaran: 'Formulir',
  metode_pembayaran: 'Transfer Bank',
  no_referensi: '',
  status: 'menunggu',
  catatan: '',
  tanggal_bayar: '',
}

// ─── Helpers ─────────────────────────────────────────────────
function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

function formatTanggal(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Helper komponen ──────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6, letterSpacing: '0.04em' }}>
        {label}
      </p>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  border: '1.5px solid #e2e8f0',
  fontSize: 14,
  color: '#0f172a',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
}

// ─── Sub-komponen: Modal Form ─────────────────────────────────
function PembayaranModal({
  mode,
  data,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit'
  data?: Pembayaran
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState<PembayaranFormData>(
    mode === 'edit' && data
      ? {
          user_id: data.user_id,
          nama_siswa: data.nama_siswa,
          nominal: data.nominal,
          jenis_pembayaran: data.jenis_pembayaran,
          metode_pembayaran: data.metode_pembayaran ?? 'Transfer Bank',
          no_referensi: data.no_referensi ?? '',
          status: data.status,
          catatan: data.catatan ?? '',
          tanggal_bayar: data.tanggal_bayar ?? '',
        }
      : EMPTY_FORM
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!form.nama_siswa || !form.nominal || !form.user_id) {
      setError('User ID, nama siswa, dan nominal wajib diisi.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const url =
        mode === 'create'
          ? '/api/admin/pembayaran'
          : `/api/admin/pembayaran/${data!.id}`

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nominal: Number(form.nominal) }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal menyimpan data')

      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff', borderRadius: '28px 28px 0 0',
          padding: '24px 20px 36px', width: '100%', maxWidth: 480,
          maxHeight: '92vh', overflowY: 'auto',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, background: '#e2e8f0', borderRadius: 99, margin: '0 auto 20px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: mode === 'create' ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {mode === 'create' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              )}
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {mode === 'create' ? 'Tambah Pembayaran' : 'Edit Pembayaran'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#f1f5f9', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#dc2626' }}>
            ⚠ {error}
          </div>
        )}

        {/* Form Fields */}
        <div style={{ display: 'grid', gap: 14 }}>
          <FormField label="User ID Siswa *">
            <input name="user_id" value={form.user_id} onChange={handleChange} placeholder="UUID dari tabel auth.users" style={inputStyle} />
          </FormField>

          <FormField label="Nama Siswa *">
            <input name="nama_siswa" value={form.nama_siswa} onChange={handleChange} placeholder="Nama lengkap siswa" style={inputStyle} />
          </FormField>

          <FormField label="Nominal (Rp) *">
            <input type="number" name="nominal" value={form.nominal || ''} onChange={handleChange} placeholder="1250000" style={inputStyle} />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Jenis Pembayaran">
              <select name="jenis_pembayaran" value={form.jenis_pembayaran} onChange={handleChange} style={inputStyle}>
                {JENIS_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </FormField>
            <FormField label="Metode">
              <select name="metode_pembayaran" value={form.metode_pembayaran} onChange={handleChange} style={inputStyle}>
                {METODE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="No. Referensi">
              <input name="no_referensi" value={form.no_referensi} onChange={handleChange} placeholder="Opsional" style={inputStyle} />
            </FormField>
            <FormField label="Tanggal Bayar">
              <input type="date" name="tanggal_bayar" value={form.tanggal_bayar} onChange={handleChange} style={inputStyle} />
            </FormField>
          </div>

          <FormField label="Status">
            <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Catatan">
            <textarea name="catatan" value={form.catatan} onChange={handleChange} placeholder="Catatan tambahan (opsional)" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </FormField>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: 22, width: '100%', padding: '15px 0',
            background: loading ? '#c4b5fd' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            color: '#fff', fontWeight: 800, fontSize: 15,
            border: 'none', borderRadius: 16, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(124,58,237,0.4)',
          }}
        >
          {loading ? 'Menyimpan...' : mode === 'create' ? 'Simpan Pembayaran' : 'Update Pembayaran'}
        </button>
      </div>
    </div>
  )
}

// ─── Sub-komponen: Konfirmasi Hapus ──────────────────────────
function DeleteConfirmModal({
  item,
  onClose,
  onSuccess,
}: {
  item: Pembayaran
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/pembayaran/${item.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      onSuccess()
      onClose()
    } catch {
      // error diabaikan
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 340, textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60, borderRadius: 18, background: '#fff1f2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', border: '2px solid #fee2e2',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <p style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', margin: '0 0 6px' }}>Hapus Pembayaran?</p>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 4px', lineHeight: 1.6 }}>
          Data pembayaran <strong style={{ color: '#0f172a' }}>{item.nama_siswa}</strong>
        </p>
        <p style={{ fontSize: 16, fontWeight: 800, color: '#dc2626', margin: '0 0 8px' }}>
          {formatRupiah(item.nominal)}
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 22px', lineHeight: 1.6 }}>
          Data ini akan dihapus permanen dan tidak dapat dipulihkan.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '13px 0', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#475569' }}>
            Batal
          </button>
          <button onClick={handleDelete} disabled={loading} style={{ padding: '13px 0', background: loading ? '#fca5a5' : 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', boxShadow: loading ? 'none' : '0 4px 14px rgba(239,68,68,0.35)' }}>
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function PembayaranPage() {
  const [payments, setPayments] = useState<Pembayaran[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('semua')
  const [search, setSearch] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Pembayaran | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Pembayaran | null>(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'semua') params.set('status', filterStatus)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/pembayaran?${params.toString()}`)
      const json = await res.json()
      if (res.ok) setPayments(json.data ?? [])
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [filterStatus, search])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  // ── Stats ──
  const total        = payments.length
  const dikonfirmasi = payments.filter((p) => p.status === 'dikonfirmasi').length
  const menunggu     = payments.filter((p) => p.status === 'menunggu').length
  const ditolak      = payments.filter((p) => p.status === 'ditolak').length
  const totalNominal = payments.filter((p) => p.status === 'dikonfirmasi').reduce((sum, p) => sum + p.nominal, 0)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f0f8',
      paddingBottom: 80,
      maxWidth: 480,
      margin: '0 auto',
    }}>

      {/* ── Page Header ── */}
      <div style={{
        background: '#fff',
        padding: '20px 20px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Manajemen Pembayaran
            </h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, marginTop: 2 }}>
              Kelola tagihan &amp; konfirmasi transaksi pendaftar
            </p>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div style={{
            position: 'absolute', top: -2, right: -2, width: 8, height: 8,
            background: '#ef4444', borderRadius: '50%', border: '2px solid #fff',
          }} />
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Banner Total Dana Masuk ── */}
        <div style={{
          background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 60%, #8b5cf6 100%)',
          borderRadius: 22, padding: '22px 22px 20px',
          marginBottom: 22, color: '#fff',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(91,33,182,0.35)',
        }}>
          <div style={{
            position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)',
            opacity: 0.15,
          }}>
            <svg width="110" height="110" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
            </svg>
          </div>

          <p style={{ fontSize: 13, fontWeight: 500, opacity: 0.85, margin: '0 0 6px' }}>
            Total Dana Masuk (Dikonfirmasi)
          </p>
          <p style={{ fontSize: 34, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-1px' }}>
            {formatRupiah(totalNominal)}
          </p>
          <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 18px' }}>
            {dikonfirmasi} transaksi berhasil dikonfirmasi
          </p>

          <button
            onClick={() => setFilterStatus('dikonfirmasi')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)',
              borderRadius: 12, padding: '9px 18px',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            Lihat Detail
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* ── Ringkasan Transaksi ── */}
        <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
          Ringkasan Transaksi
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {/* Total Tagihan */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', margin: 0 }}>Total Tagihan</p>
            </div>
            <p style={{ fontSize: 30, fontWeight: 900, color: '#7c3aed', margin: '0 0 2px', lineHeight: 1 }}>{total}</p>
            <p style={{ fontSize: 11, color: '#a78bfa', margin: 0 }}>transaksi</p>
          </div>

          {/* Terkonfirmasi */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#059669', margin: 0 }}>Terkonfirmasi</p>
            </div>
            <p style={{ fontSize: 30, fontWeight: 900, color: '#059669', margin: '0 0 2px', lineHeight: 1 }}>{dikonfirmasi}</p>
            <p style={{ fontSize: 11, color: '#6ee7b7', margin: 0 }}>transaksi</p>
          </div>

          {/* Menunggu */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#d97706', margin: 0 }}>Menunggu</p>
            </div>
            <p style={{ fontSize: 30, fontWeight: 900, color: '#d97706', margin: '0 0 2px', lineHeight: 1 }}>{menunggu}</p>
            <p style={{ fontSize: 11, color: '#fbbf24', margin: 0 }}>transaksi</p>
          </div>

          {/* Ditolak */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', margin: 0 }}>Ditolak</p>
            </div>
            <p style={{ fontSize: 30, fontWeight: 900, color: '#dc2626', margin: '0 0 2px', lineHeight: 1 }}>{ditolak}</p>
            <p style={{ fontSize: 11, color: '#fca5a5', margin: 0 }}>transaksi</p>
          </div>
        </div>

        {/* ── Search + Tambah ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 16px', borderRadius: 50,
            border: '1.5px solid #e8ecf4',
            background: '#fff', boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama siswa, transaksi..."
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 13, color: '#0f172a', width: '100%',
              }}
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              border: 'none', borderRadius: 50,
              cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah
          </button>
        </div>

        {/* ── Filter Tabs ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { key: 'semua', label: 'Semua', count: total },
            { key: 'menunggu', label: 'Menunggu', count: menunggu },
            { key: 'dikonfirmasi', label: 'Dikonfirmasi', count: dikonfirmasi },
            { key: 'ditolak', label: 'Ditolak', count: ditolak },
          ].map(({ key, label, count }) => {
            const isActive = filterStatus === key
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: isActive ? '7px 14px' : '7px 12px',
                  borderRadius: 50, border: isActive ? 'none' : '1.5px solid #e2e8f0',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  background: isActive ? '#7c3aed' : '#fff',
                  color: isActive ? '#fff' : '#64748b',
                  boxShadow: isActive ? '0 3px 10px rgba(124,58,237,0.3)' : 'none',
                }}
              >
                {label}
                <span style={{
                  fontSize: 11, fontWeight: 800, minWidth: 18, textAlign: 'center',
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: isActive ? '#fff' : '#94a3b8',
                  borderRadius: 99, padding: '1px 6px',
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Daftar Transaksi ── */}
        {loading ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 20px',
            textAlign: 'center', color: '#94a3b8',
            boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Memuat data...</p>
            <p style={{ fontSize: 12, margin: 0 }}>Mohon tunggu sebentar</p>
          </div>
        ) : payments.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: '#ede9fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', margin: '0 0 6px' }}>Belum ada transaksi</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Data transaksi akan muncul di sini.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {payments.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] ?? { label: item.status, color: '#64748b', bg: '#f1f5f9' }
              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff', borderRadius: 18, padding: '16px',
                    boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 900, color: '#7c3aed', flexShrink: 0,
                      }}>
                        {item.nama_siswa?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {item.nama_siswa}
                        </p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0' }}>
                          {item.jenis_pembayaran} · {item.metode_pembayaran ?? '-'}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 11px',
                      borderRadius: 99, background: statusCfg.bg, color: statusCfg.color,
                    }}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <div style={{ height: 1, background: '#f8fafc', margin: '0 0 10px' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: item.no_referensi ? 10 : 12 }}>
                    <p style={{ fontSize: 17, fontWeight: 900, color: '#6d28d9', margin: 0 }}>
                      {formatRupiah(item.nominal)}
                    </p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                      {formatTanggal(item.tanggal_bayar ?? item.created_at)}
                    </p>
                  </div>

                  {item.no_referensi && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: '#f8fafc', borderRadius: 8, padding: '4px 10px',
                      marginBottom: 12, border: '1px solid #e2e8f0',
                    }}>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>#</span>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0, fontFamily: 'monospace' }}>
                        {item.no_referensi}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setEditTarget(item)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0', background: '#f5f3ff',
                        color: '#7c3aed', fontWeight: 700, fontSize: 12,
                        border: '1px solid #ede9fe', borderRadius: 12, cursor: 'pointer',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0', background: '#fff1f2',
                        color: '#dc2626', fontWeight: 700, fontSize: 12,
                        border: '1px solid #fee2e2', borderRadius: 12, cursor: 'pointer',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                      Hapus
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <PembayaranModal mode="create" onClose={() => setShowCreate(false)} onSuccess={fetchPayments} />
      )}
      {editTarget && (
        <PembayaranModal mode="edit" data={editTarget} onClose={() => setEditTarget(null)} onSuccess={fetchPayments} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal item={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={fetchPayments} />
      )}
    </div>
  )
}