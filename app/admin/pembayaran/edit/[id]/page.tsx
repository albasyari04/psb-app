'use client'

// app/(admin)/admin/pembayaran/edit/[id]/page.tsx
// Halaman full-page untuk edit data pembayaran (bukan modal/bottom-sheet)

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Pembayaran, PembayaranFormData } from '@/types'

// ─── Konstanta ───────────────────────────────────────────────
const HEADER_HEIGHT = 98

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

// ─── Helper ──────────────────────────────────────────────────
function formatNominalDisplay(value: number | string): string {
  const num = typeof value === 'string' ? Number(value.replace(/\D/g, '')) : value
  if (!num) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

function parseNominalInput(value: string): number {
  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly ? Number(digitsOnly) : 0
}

// ─── FIX: helper fetch yang aman — cek Content-Type sebelum .json() ──────────
async function safeFetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options)
  const contentType = res.headers.get('content-type') ?? ''

  // Jika bukan JSON (misal Next.js mengembalikan HTML 404), lempar error yang jelas
  if (!contentType.includes('application/json')) {
    const text = await res.text()
    throw new Error(
      res.status === 404
        ? `API route tidak ditemukan (404). Pastikan file route.ts ada di: app/api/admin/pembayaran/[id]/route.ts`
        : `Server mengembalikan respons tidak valid (${res.status}): ${text.slice(0, 120)}`
    )
  }

  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? `Request gagal dengan status ${res.status}`)
  return json
}

// ─── Icons ───────────────────────────────────────────────────
function WalletEditIcon({ size = 76 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="44" y="6" width="34" height="40" rx="5" fill="#ffffff" transform="rotate(8 44 6)" stroke="#e2e8f0" strokeWidth="1" />
      <line x1="52" y1="20" x2="68" y2="17" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" transform="rotate(8 52 20)" />
      <line x1="52" y1="27" x2="68" y2="24" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" transform="rotate(8 52 27)" />
      <rect x="60" y="2" width="5" height="18" rx="2.5" fill="#fbbf24" transform="rotate(35 60 2)" />
      <rect x="14" y="32" width="62" height="46" rx="11" fill="#7c3aed" />
      <rect x="14" y="32" width="62" height="19" rx="11" fill="#6d28d9" />
      <rect x="20" y="20" width="46" height="30" rx="7" fill="#c4b5fd" transform="rotate(-6 20 20)" />
      <path d="M14 49 Q45 45 76 49" stroke="#5b21b6" strokeWidth="1.4" fill="none" />
      <circle cx="45" cy="76" r="5.5" fill="#5b21b6" />
      <circle cx="45" cy="76" r="3.5" fill="#7c3aed" />
      <ellipse cx="28" cy="40" rx="7" ry="2.6" fill="rgba(255,255,255,0.22)" transform="rotate(-15 28 40)" />
      <circle cx="78" cy="74" r="15" fill="#16A34A" />
      <circle cx="78" cy="74" r="12.4" fill="#22c55e" />
      <polyline points="72,74 76,79 85,68" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// ─── FIX: LoadingSpinner dengan inline keyframes via style tag di <head> ──────
function LoadingCard() {
  return (
    <>
      {/* Inject CSS animation ke dalam document head agar @keyframes dikenali */}
      <style>{`
        @keyframes psb-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes psb-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .psb-spinner {
          animation: psb-spin 0.9s linear infinite;
        }
        .psb-skeleton {
          animation: psb-pulse 1.6s ease-in-out infinite;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          border-radius: 10px;
        }
      `}</style>

      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '36px 24px 40px',
        textAlign: 'center',
        boxShadow: '0 2px 14px rgba(15,23,42,0.06)',
      }}>
        {/* Spinner lingkaran */}
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          border: '3.5px solid #e2e8f0',
          borderTopColor: '#6366f1',
          margin: '0 auto 18px',
        }} className="psb-spinner" />

        <p style={{ fontWeight: 700, fontSize: 14.5, color: '#64748b', margin: '0 0 20px' }}>
          Memuat data...
        </p>

        {/* Skeleton fields */}
        {[100, 80, 60, 90, 70].map((w, i) => (
          <div
            key={i}
            className="psb-skeleton"
            style={{ height: 18, width: `${w}%`, margin: '0 auto 12px' }}
          />
        ))}
      </div>
    </>
  )
}

// ─── UI Components ────────────────────────────────────────────
function FieldRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
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
        <p style={{ fontSize: 13, fontWeight: 700, color: '#475569', margin: '0 0 8px' }}>{label}</p>
        {children}
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#475569', margin: '0 0 8px' }}>{label}</p>
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

const selectWrapperStyle: React.CSSProperties = { position: 'relative' }

function SelectChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.3"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

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

// =================================================================================
// KOMPONEN INDUK (PARENT) - Mengambil ID dari URL
// Ini adalah komponen yang diekspor sebagai halaman default.
// =================================================================================
export default function EditPembayaranPage() {
  const params = useParams()
  const id = params?.id as string

  // Triknya ada di sini: kita tunda rendering form sampai `id` benar-benar ada.
  // Selama `id` belum ada (saat render pertama di client), kita tampilkan loading.
  if (!id) {
    // Menggunakan beberapa style inline dari file asli untuk konsistensi UI
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f7f8fb',
        padding: '14px 18px 40px',
        maxWidth: 480,
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <div style={{ height: HEADER_HEIGHT, background: '#f7f8fb' }} />
        <LoadingCard />
      </div>
    )
  }

  // Setelah `id` tersedia, kita render komponen form dan memberikannya `id` sebagai prop.
  // `id` di sini dijamin valid.
  return <EditForm id={id} />
}


// =================================================================================
// KOMPONEN ANAK (CHILD) - Form UI dan Logika
// Komponen ini sekarang menerima `id` sebagai prop yang stabil.
// =================================================================================
function EditForm({ id }: { id: string }) {
  const router = useRouter()

  // `useParams` dan `id` dari params sudah tidak ada di sini.
  // Kita menggunakan `id` dari props.
  console.log('RENDER: Form dirender dengan prop id:', id);

  const [form, setForm] = useState<PembayaranFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    console.log('EFFECT: id:', id);
    // Pastikan `id` ada sebelum fetch, karena `params` bisa kosong di render awal
    if (id) {
      const fetchDetail = async () => {
        console.log('EFFECT: Mulai fetch untuk id:', id);
        setLoading(true)
        setError(null)
        try {
          const json = await safeFetchJson(`/api/admin/pembayaran/${id}`)
          const data: Pembayaran = json.data
          setForm({
            user_id:          data.user_id,
            nama_siswa:       data.nama_siswa,
            nominal:          data.nominal,
            jenis_pembayaran: data.jenis_pembayaran,
            metode_pembayaran: data.metode_pembayaran ?? 'Transfer Bank',
            no_referensi:     data.no_referensi ?? '',
            status:           data.status,
            catatan:          data.catatan ?? '',
            tanggal_bayar:    data.tanggal_bayar ? new Date(data.tanggal_bayar).toISOString().split('T')[0] : '',
          })
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message)
          } else {
            setError('Terjadi kesalahan yang tidak diketahui')
          }
        } finally {
          setLoading(false)
        }
      }
      fetchDetail()
    } else {
      console.log('EFFECT: id tidak ditemukan, fetch dibatalkan.');
    }
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    } catch { /* ignore */ }
  }

  const handleSubmit = async () => {
    if (!form.nama_siswa || !form.nominal || !form.user_id) {
      setError('User ID, nama siswa, dan nominal wajib diisi.')
      return
    }
    setLoadingSubmit(true)
    setError(null)
    try {
      await safeFetchJson(`/api/admin/pembayaran/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nominal: Number(form.nominal) }),
      })
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
      {/* ── Global styles (date picker, dll) ── */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
      `}</style>

      {/* ── Header fixed ── */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        maxWidth: 480, margin: '0 auto',
        height: HEADER_HEIGHT,
        background: '#ffffff',
        borderBottom: '1px solid #EDEAF6',
        boxShadow: '0 6px 20px rgba(109,61,245,0.06)',
        padding: '20px 18px 8px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 12,
        zIndex: 100,
        boxSizing: 'border-box',
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
        {/* Icon dompet ungu (WalletEditIcon) sudah dihapus sesuai permintaan */}
      </div>

      <div style={{ height: HEADER_HEIGHT }} />

      <div style={{ padding: '14px 18px 0' }}>
        {/* Error banner */}
        {error && (
          <div style={{
            background: '#fef2f2', borderRadius: 12, padding: '11px 14px',
            marginBottom: 16, fontSize: 13, color: '#dc2626',
            display: 'flex', alignItems: 'flex-start', gap: 8,
            border: '1px solid #fecaca',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── FIX: gunakan komponen LoadingCard yang animasinya benar ── */}
        {loading ? (
          <LoadingCard />
        ) : (
          <>
            {/* Card utama */}
            <div style={{
              background: '#fff', borderRadius: 24, padding: '24px 20px',
              boxShadow: '0 2px 16px rgba(15,23,42,0.05)', border: '1px solid #f1f3f9',
            }}>
              {/* User ID */}
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

              {/* Nominal */}
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

            {/* Card detail tambahan */}
            <div style={{
              background: '#fff', borderRadius: 24, padding: '22px 20px',
              marginTop: 16, boxShadow: '0 2px 16px rgba(15,23,42,0.05)',
              border: '1px solid #f1f3f9', display: 'grid', gap: 18,
            }}>
              {/* Jenis & Metode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Jenis Pembayaran">
                  <div style={selectWrapperStyle}>
                    <InlineIcon>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20" />
                      </svg>
                    </InlineIcon>
                    <select name="jenis_pembayaran" value={form.jenis_pembayaran} onChange={handleChange}
                      style={{ ...inputBaseStyle, paddingLeft: 40, paddingRight: 32, appearance: 'none' }}>
                      {JENIS_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                    </select>
                    <SelectChevron />
                  </div>
                </FormField>

                <FormField label="Metode Pembayaran">
                  <div style={selectWrapperStyle}>
                    <InlineIcon>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="21" x2="21" y2="21" /><path d="M5 21V10M19 21V10M3 10l9-6 9 6" />
                      </svg>
                    </InlineIcon>
                    <select name="metode_pembayaran" value={form.metode_pembayaran} onChange={handleChange}
                      style={{ ...inputBaseStyle, paddingLeft: 40, paddingRight: 32, appearance: 'none' }}>
                      {METODE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <SelectChevron />
                  </div>
                </FormField>
              </div>

              {/* No Referensi & Tanggal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="No. Referensi">
                  <div style={selectWrapperStyle}>
                    <InlineIcon><span style={{ fontSize: 14, fontWeight: 800 }}>#</span></InlineIcon>
                    <input name="no_referensi" value={form.no_referensi} onChange={handleChange}
                      placeholder="Opsional" style={{ ...inputBaseStyle, paddingLeft: 40 }} />
                  </div>
                </FormField>

                <FormField label="Tanggal Bayar">
                  <div style={selectWrapperStyle}>
                    <InlineIcon>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="3" />
                        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </InlineIcon>
                    <input type="date" name="tanggal_bayar" value={form.tanggal_bayar} onChange={handleChange}
                      style={{ ...inputBaseStyle, paddingLeft: 40 }} />
                  </div>
                </FormField>
              </div>

              {/* Status */}
              <FormField label="Status Pembayaran">
                <div style={selectWrapperStyle}>
                  <InlineIcon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
                    </svg>
                  </InlineIcon>
                  <select name="status" value={form.status} onChange={handleChange}
                    style={{ ...inputBaseStyle, paddingLeft: 40, paddingRight: 32, appearance: 'none' }}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>)}
                  </select>
                  <SelectChevron />
                </div>
              </FormField>

              {/* Catatan */}
              <FormField label="Catatan">
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: 14, color: '#6366f1', pointerEvents: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z" /><rect x="5" y="4" width="14" height="18" rx="2" />
                      <line x1="9" y1="11" x2="15" y2="11" /><line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <textarea name="catatan" value={form.catatan} onChange={handleChange}
                    placeholder="Catatan tambahan (opsional)" rows={3}
                    style={{ ...inputBaseStyle, paddingLeft: 40, resize: 'vertical', lineHeight: 1.6 }} />
                </div>
              </FormField>
            </div>

            {/* Tombol Update */}
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
              {loadingSubmit ? (
                <>
                  <div style={{
                    width: 18, height: 18,
                    border: '2.5px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                  }} className="psb-spinner" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Update Pembayaran
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}