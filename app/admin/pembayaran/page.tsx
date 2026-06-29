'use client'

// app/(admin)/admin/pembayaran/page.tsx
// Full CRUD: Tambah (modal), Edit (halaman terpisah), Hapus, Konfirmasi pembayaran

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Pembayaran, PembayaranFormData } from '@/types'

// ─── Konstanta ───────────────────────────────────────────────
const JENIS_OPTIONS = ['Formulir', 'SPP', 'Seragam', 'Pendaftaran Anama', 'Lainnya']
const METODE_OPTIONS = ['Transfer Bank', 'Tunai', 'QRIS']
const STATUS_OPTIONS = ['menunggu', 'dikonfirmasi', 'ditolak']

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  dikonfirmasi: { label: 'Dikonfirmasi', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  menunggu:     { label: 'Menunggu',     color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  ditolak:      { label: 'Ditolak',      color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
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

// ─── Avatar Initials ─────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name?.charAt(0)?.toUpperCase() ?? '?'
  const colors = [
    ['#ede9fe', '#7c3aed'],
    ['#dbeafe', '#2563eb'],
    ['#d1fae5', '#059669'],
    ['#fce7f3', '#db2777'],
    ['#fff7ed', '#ea580c'],
  ]
  const idx = name.charCodeAt(0) % colors.length
  const [bg, fg] = colors[idx]
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 14,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 17, fontWeight: 900, color: fg, flexShrink: 0,
      border: `2px solid ${fg}22`,
    }}>
      {initials}
    </div>
  )
}

// ─── Bar Chart Decoration ──────────────────────────────────
function BarChartDecor() {
  return (
    <svg width="52" height="40" viewBox="0 0 52 40" fill="none">
      <rect x="0" y="24" width="8" height="16" rx="3" fill="rgba(255,255,255,0.25)" />
      <rect x="11" y="14" width="8" height="26" rx="3" fill="rgba(255,255,255,0.35)" />
      <rect x="22" y="6" width="8" height="34" rx="3" fill="rgba(255,255,255,0.45)" />
      <rect x="33" y="16" width="8" height="24" rx="3" fill="rgba(255,255,255,0.30)" />
      <rect x="44" y="20" width="8" height="20" rx="3" fill="rgba(255,255,255,0.20)" />
    </svg>
  )
}

// ─── FormField ───────────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </p>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1.5px solid #e2e8f0',
  fontSize: 14,
  color: '#0f172a',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

// ─── Modal Form (HANYA untuk mode create / Tambah Pembayaran) ─
// Edit kini menggunakan halaman terpisah: /admin/pembayaran/edit/[id]
function PembayaranCreateModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState<PembayaranFormData>(EMPTY_FORM)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
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
    setLoadingSubmit(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/pembayaran', {
        method: 'POST',
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
      setLoadingSubmit(false)
    }
  }

  const accentColor = '#7c3aed'
  const accentGrad  = 'linear-gradient(135deg, #7c3aed, #5b21b6)'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff',
        borderRadius: '28px 28px 0 0',
        padding: '0 20px 36px',
        width: '100%', maxWidth: 480,
        maxHeight: '94vh', overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(15,23,42,0.18)',
      }}>
        {/* Drag handle */}
        <div style={{ padding: '14px 0 0', textAlign: 'center' }}>
          <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 99, display: 'inline-block' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: accentGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px ${accentColor}44`,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Tambah Pembayaran
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                Input data transaksi baru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#f1f5f9', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', fontSize: 16, flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', borderRadius: 12, padding: '11px 14px',
            marginBottom: 16, fontSize: 13, color: '#dc2626',
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid #fecaca',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gap: 14 }}>
          <FormField label="User ID Siswa *">
            <input name="user_id" value={form.user_id} onChange={handleChange}
              placeholder="UUID dari tabel auth.users" style={inputStyle} />
          </FormField>

          <FormField label="Nama Siswa *">
            <input name="nama_siswa" value={form.nama_siswa} onChange={handleChange}
              placeholder="Nama lengkap siswa" style={inputStyle} />
          </FormField>

          <FormField label="Nominal (Rp) *">
            <input type="number" name="nominal" value={form.nominal || ''}
              onChange={handleChange} placeholder="150000" style={inputStyle} />
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
              <input name="no_referensi" value={form.no_referensi} onChange={handleChange}
                placeholder="Opsional" style={inputStyle} />
            </FormField>
            <FormField label="Tanggal Bayar">
              <input type="date" name="tanggal_bayar" value={form.tanggal_bayar}
                onChange={handleChange} style={inputStyle} />
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
            <textarea name="catatan" value={form.catatan} onChange={handleChange}
              placeholder="Catatan tambahan (opsional)" rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
          </FormField>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loadingSubmit}
          style={{
            marginTop: 22, width: '100%', padding: '15px 0',
            background: loadingSubmit ? '#c4b5fd' : accentGrad,
            color: '#fff', fontWeight: 800, fontSize: 15,
            border: 'none', borderRadius: 16,
            cursor: loadingSubmit ? 'not-allowed' : 'pointer',
            boxShadow: loadingSubmit ? 'none' : `0 6px 20px ${accentColor}44`,
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
        >
          {loadingSubmit ? 'Menyimpan...' : '+ Simpan Pembayaran'}
        </button>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ────────────────────────────────────
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
      // error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 26, padding: '28px 24px',
        width: '100%', maxWidth: 340, textAlign: 'center',
        boxShadow: '0 20px 60px rgba(15,23,42,0.2)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'linear-gradient(135deg, #fee2e2, #fef2f2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          border: '2px solid #fecaca',
          boxShadow: '0 4px 16px rgba(239,68,68,0.15)',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <p style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', margin: '0 0 6px' }}>Hapus Pembayaran?</p>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 4px', lineHeight: 1.6 }}>
          Data pembayaran <strong style={{ color: '#0f172a' }}>{item.nama_siswa}</strong>
        </p>
        <p style={{ fontSize: 17, fontWeight: 800, color: '#dc2626', margin: '0 0 6px' }}>
          {formatRupiah(item.nominal)}
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 22px', lineHeight: 1.6 }}>
          Data ini akan dihapus permanen dan tidak dapat dipulihkan.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '13px 0', background: '#f8fafc',
              border: '1.5px solid #e2e8f0', borderRadius: 14,
              fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#475569',
              fontFamily: 'inherit',
            }}
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding: '13px 0',
              background: loading ? '#fca5a5' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none', borderRadius: 14,
              fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#fff',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(239,68,68,0.35)',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function PembayaranPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Pembayaran[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('semua')
  const [search, setSearch] = useState('')

  const [showCreate, setShowCreate] = useState(false)
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

  const total        = payments.length
  const dikonfirmasi = payments.filter((p) => p.status === 'dikonfirmasi').length
  const menunggu     = payments.filter((p) => p.status === 'menunggu').length
  const ditolak      = payments.filter((p) => p.status === 'ditolak').length
  const totalNominal = payments
    .filter((p) => p.status === 'dikonfirmasi')
    .reduce((sum, p) => sum + p.nominal, 0)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0eef8',
      paddingBottom: 90,
      maxWidth: 480,
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* ── Page Header ── */}
      <div style={{
        background: '#fff',
        padding: '18px 18px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 0 #f1f5f9',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          {/* Tombol Back */}
          <button
            onClick={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#f5f3ff',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Kembali"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Manajemen Pembayaran
            </h1>
            <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0' }}>
              Kelola tagihan &amp; konfirmasi transaksi
            </p>
          </div>
        </div>

        {/* Icon dompet — pojok kanan atas, tanpa background, ukuran lebih besar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Image
            src="/icons/dompet-icon.png"
            alt="Dompet"
            width={48}
            height={48}
            style={{ display: 'block', objectFit: 'contain' }}
          />
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Hero Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 55%, #8b5cf6 100%)',
          borderRadius: 22, padding: '22px 22px 20px',
          marginBottom: 20, color: '#fff',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(91,33,182,0.38)',
        }}>
          {/* Wave decoration */}
          <svg
            viewBox="0 0 400 120" preserveAspectRatio="none"
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 60, opacity: 0.12 }}
          >
            <path d="M0,60 C80,20 160,100 240,50 C320,0 360,80 400,40 L400,120 L0,120 Z" fill="white" />
          </svg>

          {/* Bar chart decorative */}
          <div style={{ position: 'absolute', right: 96, bottom: 18, opacity: 0.5 }}>
            <BarChartDecor />
          </div>

          {/* 3D Wallet illustration — diperbesar sesuai desain */}
          <div style={{ position: 'absolute', right: -6, bottom: -10 }}>
            <Image
              src="/icons/dompet-icon.png"
              alt=""
              width={148}
              height={162}
              style={{ display: 'block', objectFit: 'contain' }}
            />
          </div>

          <p style={{ fontSize: 12.5, fontWeight: 500, opacity: 0.85, margin: '0 0 5px', letterSpacing: '0.01em' }}>
            Total Dana Masuk (Dikonfirmasi)
          </p>
          <p style={{ fontSize: 33, fontWeight: 900, margin: '0 0 3px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            {formatRupiah(totalNominal)}
          </p>
          <p style={{ fontSize: 12, opacity: 0.72, margin: '0 0 18px' }}>
            {dikonfirmasi} transaksi berhasil dikonfirmasi
          </p>

          <button
            onClick={() => setFilterStatus('dikonfirmasi')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              backdropFilter: 'blur(8px)',
              borderRadius: 12, padding: '9px 18px',
              color: '#fff', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Lihat Detail
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* ── Ringkasan Transaksi ── */}
        <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.2px' }}>
          Ringkasan Transaksi
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, marginBottom: 20 }}>
          {/* Total Tagihan */}
          <StatCard
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
            iconBg="#f5f3ff"
            label="Total Tagihan"
            labelColor="#7c3aed"
            count={total}
            countColor="#7c3aed"
            subColor="#c4b5fd"
          />

          {/* Terkonfirmasi */}
          <StatCard
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            }
            iconBg="#ecfdf5"
            label="Terkonfirmasi"
            labelColor="#059669"
            count={dikonfirmasi}
            countColor="#059669"
            subColor="#6ee7b7"
          />

          {/* Menunggu */}
          <StatCard
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            }
            iconBg="#fef3c7"
            label="Menunggu"
            labelColor="#d97706"
            count={menunggu}
            countColor="#d97706"
            subColor="#fbbf24"
          />

          {/* Ditolak */}
          <StatCard
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            }
            iconBg="#fee2e2"
            label="Ditolak"
            labelColor="#dc2626"
            count={ditolak}
            countColor="#dc2626"
            subColor="#fca5a5"
          />
        </div>

        {/* ── Search + Tambah ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 9,
            padding: '11px 16px', borderRadius: 50,
            border: '1.5px solid #e8ecf4',
            background: '#fff',
            boxShadow: '0 1px 6px rgba(15,23,42,0.06)',
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
                fontSize: 13, color: '#0f172a', width: '100%', fontFamily: 'inherit',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', lineHeight: 1, padding: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '11px 18px',
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              color: '#fff', fontWeight: 700, fontSize: 13,
              border: 'none', borderRadius: 50,
              cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(124,58,237,0.42)',
              fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah
          </button>
        </div>

        {/* ── Filter Tabs ── */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 14,
          overflowX: 'auto', paddingBottom: 2,
          scrollbarWidth: 'none',
        }}>
          {[
            { key: 'semua',       label: 'Semua',       count: total },
            { key: 'menunggu',    label: 'Menunggu',    count: menunggu },
            { key: 'dikonfirmasi',label: 'Dikonfirmasi',count: dikonfirmasi },
            { key: 'ditolak',     label: 'Ditolak',     count: ditolak },
          ].map(({ key, label, count }) => {
            const isActive = filterStatus === key
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: isActive ? '8px 16px' : '7px 13px',
                  borderRadius: 50,
                  border: isActive ? 'none' : '1.5px solid #e2e8f0',
                  fontSize: 12.5, fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  background: isActive ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : '#fff',
                  color: isActive ? '#fff' : '#64748b',
                  boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.32)' : '0 1px 3px rgba(15,23,42,0.06)',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {label}
                <span style={{
                  fontSize: 11, fontWeight: 800, minWidth: 18, textAlign: 'center',
                  background: isActive ? 'rgba(255,255,255,0.24)' : '#f1f5f9',
                  color: isActive ? '#fff' : '#94a3b8',
                  borderRadius: 99, padding: '1px 6px',
                }}>
                  {count}
                </span>
              </button>
            )
          })}

          {/* Filter icon */}
          <button style={{
            marginLeft: 'auto', flexShrink: 0,
            width: 36, height: 36, borderRadius: 10,
            background: '#fff', border: '1.5px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Daftar Transaksi ── */}
        {loading ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 20px',
            textAlign: 'center', color: '#94a3b8',
            boxShadow: '0 2px 14px rgba(15,23,42,0.06)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', animation: 'spin 1s linear infinite',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
              </svg>
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Memuat data...</p>
            <p style={{ fontSize: 12, margin: 0 }}>Mohon tunggu sebentar</p>
          </div>
        ) : payments.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 14px rgba(15,23,42,0.06)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 6px 20px rgba(124,58,237,0.15)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', margin: '0 0 6px' }}>Belum ada transaksi</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Data transaksi akan muncul di sini.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {payments.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] ?? { label: item.status, color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' }
              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    borderRadius: 20,
                    padding: '16px',
                    boxShadow: '0 2px 12px rgba(15,23,42,0.07)',
                    border: '1px solid #f1f5f9',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {/* Row 1: Avatar + Name + Status badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <Avatar name={item.nama_siswa ?? '?'} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {item.nama_siswa}
                        </p>
                        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '3px 0 0' }}>
                          {item.jenis_pembayaran}
                          {item.metode_pembayaran && (
                            <> &bull; <span style={{ color: '#b0b8c8' }}>{item.metode_pembayaran}</span></>
                          )}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '4px 12px',
                        borderRadius: 99,
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        border: `1px solid ${statusCfg.border}`,
                      }}>
                        {statusCfg.label}
                      </span>
                      <span style={{ fontSize: 10.5, color: '#b0b8c8', marginRight: 2 }}>
                        {formatTanggal(item.tanggal_bayar ?? item.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: '#f8fafc', margin: '0 0 11px' }} />

                  {/* Row 2: Nominal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: item.no_referensi ? 10 : 12 }}>
                    <p style={{
                      fontSize: 19, fontWeight: 900, color: '#6d28d9', margin: 0,
                      letterSpacing: '-0.5px',
                    }}>
                      {formatRupiah(item.nominal)}
                    </p>
                  </div>

                  {/* Ref tag */}
                  {item.no_referensi && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: '#f8fafc', borderRadius: 8, padding: '4px 10px',
                      marginBottom: 12, border: '1px solid #e8ecf4',
                    }}>
                      <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>#</span>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0, fontFamily: 'monospace' }}>
                        {item.no_referensi}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => router.push(`/admin/pembayaran/edit/${item.id}`)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0',
                        background: '#f5f3ff',
                        color: '#7c3aed',
                        fontWeight: 700, fontSize: 12.5,
                        border: '1.5px solid #ede9fe',
                        borderRadius: 12, cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0',
                        background: '#fff1f2',
                        color: '#dc2626',
                        fontWeight: 700, fontSize: 12.5,
                        border: '1.5px solid #fee2e2',
                        borderRadius: 12, cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
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
        <PembayaranCreateModal onClose={() => setShowCreate(false)} onSuccess={fetchPayments} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal item={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={fetchPayments} />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

// ─── StatCard sub-component ───────────────────────────────────
function StatCard({
  icon, iconBg, label, labelColor, count, countColor, subColor,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  labelColor: string
  count: number
  countColor: string
  subColor: string
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '10px 8px',
      boxShadow: '0 2px 14px rgba(15,23,42,0.07)',
      border: '1px solid #f1f5f9',
      minWidth: 0,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 9,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
      }}>
        {icon}
      </div>
      <p style={{ fontSize: 9.5, fontWeight: 700, color: labelColor, margin: '0 0 8px', lineHeight: 1.25 }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 900, color: countColor, margin: '0 0 2px', lineHeight: 1 }}>
        {count}
      </p>
      <p style={{ fontSize: 9.5, color: subColor, margin: 0 }}>transaksi</p>
    </div>
  )
}