'use client'

// app/(admin)/admin/pembayaran/edit/[id]/page.tsx
// Halaman full-page untuk edit data pembayaran (bukan modal/bottom-sheet)
// Sesuai desain: edit-pembayaran-desain.png

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Pembayaran, PembayaranFormData } from '@/types'

// ─── Konstanta ───────────────────────────────────────────────
const JENIS_OPTIONS = ['Formulir', 'SPP', 'Seragam', 'Pendaftaran Anama', 'Lainnya']
const METODE_OPTIONS = ['Transfer Bank', 'Tunai', 'QRIS']
const STATUS_OPTIONS = ['menunggu', 'dikonfirmasi', 'ditolak']

const STATUS_LABEL: Record<string, string> = {
  menunggu: 'Menunggu',
  dikonfirmasi: 'Dikonfirmasi',
  ditolak: 'Ditolak',
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

// ─── Helper: format angka ribuan untuk tampilan nominal ──────
function formatNominalDisplay(value: number | string): string {
  const num = typeof value === 'string' ? Number(value.replace(/\D/g, '')) : value
  if (!num) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

function parseNominalInput(value: string): number {
  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly ? Number(digitsOnly) : 0
}

// ─── Wallet + Document Illustration (ungu-hijau, sesuai desain) ──
function WalletEditIcon({ size = 76 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dokumen di belakang dompet */}
      <rect x="44" y="6" width="34" height="40" rx="5" fill="#ffffff" transform="rotate(8 44 6)" stroke="#e2e8f0" strokeWidth="1" />
      <line x1="52" y1="20" x2="68" y2="17" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" transform="rotate(8 52 20)" />
      <line x1="52" y1="27" x2="68" y2="24" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" transform="rotate(8 52 27)" />
      {/* Pensil kecil */}
      <rect x="60" y="2" width="5" height="18" rx="2.5" fill="#fbbf24" transform="rotate(35 60 2)" />

      {/* Wallet body */}
      <rect x="14" y="32" width="62" height="46" rx="11" fill="#7c3aed" />
      <rect x="14" y="32" width="62" height="19" rx="11" fill="#6d28d9" />
      {/* kartu mengintip */}
      <rect x="20" y="20" width="46" height="30" rx="7" fill="#c4b5fd" transform="rotate(-6 20 20)" />
      {/* strap */}
      <path d="M14 49 Q45 45 76 49" stroke="#5b21b6" strokeWidth="1.4" fill="none" />
      {/* clasp */}
      <circle cx="45" cy="76" r="5.5" fill="#5b21b6" />
      <circle cx="45" cy="76" r="3.5" fill="#7c3aed" />
      {/* shine */}
      <ellipse cx="28" cy="40" rx="7" ry="2.6" fill="rgba(255,255,255,0.22)" transform="rotate(-15 28 40)" />

      {/* Checkmark badge hijau (status berhasil) */}
      <circle cx="78" cy="74" r="15" fill="#16A34A" />
      <circle cx="78" cy="74" r="12.4" fill="#22c55e" />
      <polyline points="72,74 76,79 85,68" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

// ─── Icon orang (untuk avatar field User ID / Nama) ──────────
function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// ─── FieldRow: label + input dengan avatar icon bulat di kiri ─
function FieldRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: '#eef0fb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 13, fontWeight: 700, color: '#475569',
          margin: '0 0 8px',
        }}>
          {label}
        </p>
        {children}
      </div>
    </div>
  )
}

// ─── FormField (tanpa avatar, untuk grid bawah) ───────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#475569', margin: '0 0 8px' }}>
        {label}
      </p>
      {children}
    </div>
  )
}

const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 14,
  border: '1.5px solid #e6e9f2',
  fontSize: 14.5,
  color: '#0f172a',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const selectWrapperStyle: React.CSSProperties = {
  position: 'relative',
}

function SelectChevron() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.3"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// icon kecil di dalam select/input (jenis, metode, no.ref, tanggal, status, catatan)
function InlineIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#6366f1', pointerEvents: 'none',
    }}>
      {children}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function EditPembayaranPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [form, setForm] = useState<PembayaranFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchDetail = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/pembayaran/${id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal memuat data')
      const data: Pembayaran = json.data
      setForm({
        user_id: data.user_id,
        nama_siswa: data.nama_siswa,
        nominal: data.nominal,
        jenis_pembayaran: data.jenis_pembayaran,
        metode_pembayaran: data.metode_pembayaran ?? 'Transfer Bank',
        no_referensi: data.no_referensi ?? '',
        status: data.status,
        catatan: data.catatan ?? '',
        tanggal_bayar: data.tanggal_bayar ?? '',
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetchDetail()
  }, [id, fetchDetail])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, nominal: parseNominalInput(e.target.value) }))
  }

  const handleCopyUserId = async () => {
    try {
      await navigator.clipboard.writeText(form.user_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const handleSubmit = async () => {
    if (!form.nama_siswa || !form.nominal || !form.user_id) {
      setError('User ID, nama siswa, dan nominal wajib diisi.')
      return
    }
    setLoadingSubmit(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/pembayaran/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nominal: Number(form.nominal) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal menyimpan data')
      router.push('/admin/pembayaran')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f8fb',
      paddingBottom: 40,
      maxWidth: 480,
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '20px 18px 8px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <button
            onClick={() => router.push('/admin/pembayaran')}
            style={{
              width: 42, height: 42, borderRadius: 14,
              background: '#fff', border: '1.5px solid #eef0f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
            }}
            aria-label="Kembali"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Edit Pembayaran
            </h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '3px 0 0' }}>
              Perbarui detail pembayaran siswa
            </p>
          </div>
        </div>

        <div style={{ flexShrink: 0, marginTop: -4 }}>
          <WalletEditIcon size={76} />
        </div>
      </div>

      <div style={{ padding: '14px 18px 0' }}>
        {error && (
          <div style={{
            background: '#fef2f2', borderRadius: 12, padding: '11px 14px',
            marginBottom: 16, fontSize: 13, color: '#dc2626',
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid #fecaca',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{
            background: '#fff', borderRadius: 24, padding: '60px 20px',
            textAlign: 'center', color: '#94a3b8',
            boxShadow: '0 2px 14px rgba(15,23,42,0.06)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', animation: 'spin 1s linear infinite',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.22-8.56" />
              </svg>
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#64748b', margin: 0 }}>Memuat data...</p>
          </div>
        ) : (
          <>
            {/* ── Card utama ── */}
            <div style={{
              background: '#fff',
              borderRadius: 24,
              padding: '24px 20px',
              boxShadow: '0 2px 16px rgba(15,23,42,0.05)',
              border: '1px solid #f1f3f9',
            }}>
              {/* User ID Siswa */}
              <FieldRow icon={<PersonIcon />} label="User ID Siswa">
                <div style={{ position: 'relative' }}>
                  <input
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                    placeholder="UUID dari tabel auth.users"
                    style={{ ...inputBaseStyle, paddingRight: 46 }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyUserId}
                    title="Salin User ID"
                    style={{
                      position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                      width: 34, height: 34, borderRadius: 10,
                      background: copied ? '#ecfdf5' : '#eef0fb',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: copied ? '#059669' : '#6366f1',
                    }}
                  >
                    {copied ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </FieldRow>

              <div style={{ height: 20 }} />

              {/* Nama Siswa */}
              <FieldRow icon={<PersonIcon />} label="Nama Siswa">
                <input
                  name="nama_siswa"
                  value={form.nama_siswa}
                  onChange={handleChange}
                  placeholder="Nama lengkap siswa"
                  style={inputBaseStyle}
                />
              </FieldRow>

              <div style={{ height: 20 }} />

              {/* Nominal Pembayaran */}
              <FieldRow
                icon={<span style={{ fontSize: 13, fontWeight: 800, color: '#6366f1' }}>Rp</span>}
                label="Nominal Pembayaran"
              >
                <input
                  inputMode="numeric"
                  value={formatNominalDisplay(form.nominal)}
                  onChange={handleNominalChange}
                  placeholder="150.000"
                  style={inputBaseStyle}
                />
              </FieldRow>
            </div>

            {/* ── Card kedua: detail tambahan ── */}
            <div style={{
              background: '#fff',
              borderRadius: 24,
              padding: '22px 20px',
              marginTop: 16,
              boxShadow: '0 2px 16px rgba(15,23,42,0.05)',
              border: '1px solid #f1f3f9',
              display: 'grid',
              gap: 18,
            }}>
              {/* Jenis & Metode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Jenis Pembayaran">
                  <div style={selectWrapperStyle}>
                    <InlineIcon>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="3" />
                        <path d="M2 10h20" />
                      </svg>
                    </InlineIcon>
                    <select
                      name="jenis_pembayaran"
                      value={form.jenis_pembayaran}
                      onChange={handleChange}
                      style={{ ...inputBaseStyle, paddingLeft: 40, paddingRight: 32, appearance: 'none' }}
                    >
                      {JENIS_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                    </select>
                    <SelectChevron />
                  </div>
                </FormField>

                <FormField label="Metode Pembayaran">
                  <div style={selectWrapperStyle}>
                    <InlineIcon>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="21" x2="21" y2="21" />
                        <path d="M5 21V10M19 21V10M3 10l9-6 9 6" />
                      </svg>
                    </InlineIcon>
                    <select
                      name="metode_pembayaran"
                      value={form.metode_pembayaran}
                      onChange={handleChange}
                      style={{ ...inputBaseStyle, paddingLeft: 40, paddingRight: 32, appearance: 'none' }}
                    >
                      {METODE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <SelectChevron />
                  </div>
                </FormField>
              </div>

              {/* No Referensi & Tanggal Bayar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="No. Referensi">
                  <div style={selectWrapperStyle}>
                    <InlineIcon>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>#</span>
                    </InlineIcon>
                    <input
                      name="no_referensi"
                      value={form.no_referensi}
                      onChange={handleChange}
                      placeholder="Opsional"
                      style={{ ...inputBaseStyle, paddingLeft: 40 }}
                    />
                  </div>
                </FormField>

                <FormField label="Tanggal Bayar">
                  <div style={selectWrapperStyle}>
                    <InlineIcon>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="3" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </InlineIcon>
                    <input
                      type="date"
                      name="tanggal_bayar"
                      value={form.tanggal_bayar}
                      onChange={handleChange}
                      style={{ ...inputBaseStyle, paddingLeft: 40 }}
                    />
                  </div>
                </FormField>
              </div>

              {/* Status Pembayaran */}
              <FormField label="Status Pembayaran">
                <div style={selectWrapperStyle}>
                  <InlineIcon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  </InlineIcon>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    style={{ ...inputBaseStyle, paddingLeft: 40, paddingRight: 32, appearance: 'none' }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </FormField>

              {/* Catatan */}
              <FormField label="Catatan">
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: 14, color: '#6366f1', pointerEvents: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z" />
                      <rect x="5" y="4" width="14" height="18" rx="2" />
                      <line x1="9" y1="11" x2="15" y2="11" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <textarea
                    name="catatan"
                    value={form.catatan}
                    onChange={handleChange}
                    placeholder="Catatan tambahan (opsional)"
                    rows={3}
                    style={{ ...inputBaseStyle, paddingLeft: 40, resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>
              </FormField>
            </div>

            {/* ── Tombol Update ── */}
            <button
              onClick={handleSubmit}
              disabled={loadingSubmit}
              style={{
                marginTop: 20, width: '100%', padding: '16px 0',
                background: loadingSubmit
                  ? '#a5b4fc'
                  : 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                color: '#fff', fontWeight: 800, fontSize: 15.5,
                border: 'none', borderRadius: 18,
                cursor: loadingSubmit ? 'not-allowed' : 'pointer',
                boxShadow: loadingSubmit ? 'none' : '0 10px 28px rgba(67,56,202,0.38)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                fontFamily: 'inherit',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {loadingSubmit ? 'Menyimpan...' : 'Update Pembayaran'}
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}