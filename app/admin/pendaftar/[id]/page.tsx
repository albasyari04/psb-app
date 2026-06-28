'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import type { Pendaftaran } from '@/types'

type Action = 'diterima' | 'ditolak' | 'diproses' | null

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; dot: string;
  borderColor: string;
}> = {
  menunggu: { label: 'Menunggu Verifikasi', color: '#d97706', bg: '#fef3c7', dot: '#f59e0b', borderColor: '#fde68a' },
  diproses: { label: 'Sedang Diproses',     color: '#2563eb', bg: '#dbeafe', dot: '#3b82f6', borderColor: '#bfdbfe' },
  diterima: { label: 'Diterima',            color: '#059669', bg: '#d1fae5', dot: '#10b981', borderColor: '#a7f3d0' },
  ditolak:  { label: 'Ditolak',             color: '#dc2626', bg: '#fee2e2', dot: '#ef4444', borderColor: '#fca5a5' },
}

const CONFIRM_CONFIG: Record<string, { label: string; icon: string; btnBg: string; btnText: string }> = {
  diterima: { label: 'Terima Pendaftar',   icon: '🎉', btnBg: 'linear-gradient(135deg,#059669,#10b981)', btnText: '#fff' },
  ditolak:  { label: 'Tolak Pendaftar',    icon: '❌', btnBg: 'linear-gradient(135deg,#dc2626,#ef4444)', btnText: '#fff' },
  diproses: { label: 'Tandai Diproses',    icon: '🔄', btnBg: 'linear-gradient(135deg,#2563eb,#3b82f6)', btnText: '#fff' },
}

const AV_BG = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const IconDotsVertical = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>
  </svg>
)

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10 12 5 2 10l10 5 10-5Z"/>
    <path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/>
  </svg>
)

const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IconRefresh = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

const IconSchool = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 22v-4a2 2 0 1 0-4 0v4"/>
    <path d="M18 10v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-9"/>
    <path d="M12 2 2 8.5 12 15l10-6.5L12 2Z"/>
  </svg>
)

const IconMars = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="14" r="6"/>
    <line x1="14.5" y1="9.5" x2="21" y2="3"/>
    <polyline points="15 3 21 3 21 9"/>
  </svg>
)

const IconVenus = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <line x1="12" y1="14" x2="12" y2="22"/>
    <line x1="9" y1="19" x2="15" y2="19"/>
  </svg>
)

const IconInfoCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="11"/>
    <line x1="12" y1="8" x2="12" y2="8.01"/>
  </svg>
)

const IconCheckCircleFill = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.7 7.7-5.4 5.4a1 1 0 0 1-1.4 0l-2.6-2.6a1 1 0 1 1 1.4-1.4l1.9 1.9 4.7-4.7a1 1 0 1 1 1.4 1.4Z"/>
  </svg>
)

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({
  label, value, valueIcon, valueIconBg, valueIconColor, multiline,
}: {
  label: string
  value?: string | number | null
  valueIcon?: React.ReactNode
  valueIconBg?: string
  valueIconColor?: string
  multiline?: boolean
}) {
  return (
    <div className={`det-info-row${multiline ? ' det-info-row--multiline' : ''}`}>
      <span className="det-info-label">{label}</span>
      <span className="det-info-val">
        {valueIcon && (
          <span
            className="det-info-val-icon"
            style={{ background: valueIconBg, color: valueIconColor }}
          >
            {valueIcon}
          </span>
        )}
        {value ?? '—'}
      </span>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  icon, title, accent, children,
}: {
  icon: React.ReactNode; title: string; accent: string; children: React.ReactNode
}) {
  return (
    <div className="det-section-card">
      <div className="det-section-header">
        <div className="det-section-icon" style={{ background: accent + '1c', color: accent }}>
          {icon}
        </div>
        <span className="det-section-title">{title}</span>
        <span className="det-section-chevron" style={{ color: accent }}>
          <IconChevronDown />
        </span>
      </div>
      <div className="det-section-body">
        {children}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DetailPendaftarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }   = use(params)
  const router   = useRouter()

  const [data,     setData]     = useState<Pendaftaran | null>(null)
  const [catatan,  setCatatan]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [confirm,  setConfirm]  = useState<Action>(null)
  const [fetchErr, setFetchErr] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res  = await fetch(`/api/admin/pendaftaran?id=${id}`)
        const json = await res.json()
        if (!res.ok) { setFetchErr(json.error ?? 'Gagal memuat data'); return }
        setData(json.data as Pendaftaran)
        setCatatan(json.data?.catatan_admin || '')
      } catch { setFetchErr('Gagal memuat data') }
    })()
  }, [id])

  const updateStatus = async (action: Action) => {
    if (!action) return
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/pendaftaran', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, status: action, catatan_admin: catatan }),
      })
      const json = await res.json()
      if (!res.ok) { console.error('Update error:', json.error); return }
      setConfirm(null)
      router.push('/admin/pendaftar')
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // ── Loading ──
  if (!data && !fetchErr) return (
    <div className="det-splash">
      <div className="det-spinner" />
      <p className="det-splash-text">Memuat data pendaftar...</p>
    </div>
  )

  // ── Error ──
  if (fetchErr) return (
    <div className="det-splash">
      <div style={{ fontSize: 48 }}>⚠️</div>
      <p className="det-splash-text">{fetchErr}</p>
      <button className="det-back-link" onClick={() => router.back()}>← Kembali</button>
    </div>
  )

  const isFinished = data!.status === 'diterima' || data!.status === 'ditolak'
  const sc         = STATUS_CONFIG[data!.status] ?? STATUS_CONFIG.menunggu

  const jenisKelamin   = (data!.jenis_kelamin ?? '').toLowerCase()
  const isLaki         = jenisKelamin.startsWith('l')
  const jenisKelaminLabel =
    !data!.jenis_kelamin ? undefined :
    isLaki ? 'Laki-laki' : 'Perempuan'

  const infoRowsTop: [string, string | number | undefined | null][] = [
    ['NISN',          data!.nisn],
    ['NIK',           data!.nik],
    ['Tempat Lahir',  data!.tempat_lahir],
    ['Tanggal Lahir', data!.tanggal_lahir
      ? new Date(data!.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : undefined],
  ]
  const infoRowsBottom: [string, string | number | undefined | null][] = [
    ['Agama',       data!.agama],
    ['No. HP / WA', data!.no_hp],
  ]

  const akademikRows: [string, string | number | undefined | null][] = [
    ['Asal Sekolah',    data!.asal_sekolah],
    ['NPSN',            data!.npsn],
    ['Jurusan Pilihan', (data as Pendaftaran & { jurusan_pilihan?: string }).jurusan_pilihan],
  ]

  const orangtuaRows: [string, string | number | undefined | null][] = [
    ['Nama Ayah',        data!.nama_ayah],
    ['Nama Ibu',         data!.nama_ibu],
    ['Pekerjaan Ayah',   data!.pekerjaan_ayah],
    ['Pekerjaan Ibu',    data!.pekerjaan_ibu],
    ['No. HP Orang Tua', data!.no_hp_ortu],
  ]

  return (
    <>
      <style>{`
        /* ── Base ── */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .det-root {
          height: 100dvh;
          background: #f0f1f8;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 430px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Splash ── */
        .det-splash {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px;
          background: #f0f1f8;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .det-splash-text { font-size: 15px; font-weight: 600; color: #64748b; }
        .det-spinner {
          width: 42px; height: 42px;
          border: 3px solid #e2e8f0;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .det-back-link {
          display: inline-flex; align-items: center; gap: 6px;
          background: #6366f1; color: #fff;
          border: none; border-radius: 10px;
          padding: 10px 20px; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: inherit; margin-top: 8px;
        }

        /* ── Topbar (sticky, tidak ikut scroll) ── */
        .det-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.9rem 1rem 0.85rem;
          position: relative;
          flex-shrink: 0;
          background: #ffffff;
          border-bottom: 1px solid #e9eef2;
          box-shadow: 0 2px 12px rgba(109, 40, 217, 0.06);
          z-index: 50;
        }
        .det-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          width: 40px; height: 40px;
          background: #f5f3ff;
          border: 1.5px solid #ede9fe;
          border-radius: 12px;
          color: #6d28d9;
          padding: 0;
          justify-content: center;
          cursor: pointer; font-family: inherit;
          flex-shrink: 0;
          transition: background 0.18s, transform 0.18s;
        }
        .det-back-btn:hover { background: #ede9fe; transform: translateX(-2px); }
        .det-topbar-title {
          font-size: 1.05rem; font-weight: 800; color: #0f172a;
          letter-spacing: -0.02em; line-height: 1.2;
          flex: 1; text-align: center;
        }
        .det-menu-btn {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1.5px solid #e9eef2;
          display: flex; align-items: center; justify-content: center;
          color: #6d28d9;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.18s;
        }
        .det-menu-btn:hover { background: #ede9fe; }

        /* ── Hero Card ── */
        .det-hero {
          margin: 0 16px;
          background: linear-gradient(135deg, #818cf8 0%, #a78bfa 55%, #c4b5fd 100%);
          border-radius: 24px;
          padding: 20px 18px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(99,102,241,0.22);
        }
        .det-hero-deco {
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 85% 15%, rgba(255,255,255,0.18) 0%, transparent 45%),
            radial-gradient(circle at 10% 90%, rgba(255,255,255,0.12) 0%, transparent 40%);
          pointer-events: none;
        }

        /* Identity */
        .det-identity {
          display: flex; align-items: flex-start; gap: 14px;
          position: relative; z-index: 2;
        }
        .det-av {
          width: 58px; height: 58px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 800; color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(0,0,0,0.18);
        }
        .det-id-info { padding-top: 2px; }
        .det-id-name {
          font-size: 18px; font-weight: 800; color: #1e1b3a; line-height: 1.25;
        }
        .det-id-school {
          display: flex; align-items: center; gap: 6px;
          font-size: 12.5px; color: rgba(30,27,58,0.65); font-weight: 600;
          margin-top: 4px;
        }
        .det-status-chip {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 20px; padding: 5px 12px 5px 10px;
          font-size: 12px; font-weight: 700;
          margin-top: 9px;
          border: 1px solid transparent;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }

        /* Banner (diterima/ditolak) */
        .det-final-banner {
          margin-top: 16px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 16px;
          padding: 13px 14px;
          display: flex; align-items: center; gap: 12px;
          position: relative; z-index: 2;
        }
        .det-final-banner-icon {
          font-size: 24px;
          width: 42px; height: 42px;
          background: rgba(255,255,255,0.6);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .det-final-banner-title {
          font-size: 13.5px; font-weight: 800; color: #4338ca;
        }
        .det-final-banner-sub {
          font-size: 11.5px; color: #4b4470; margin-top: 2px; font-weight: 500;
          line-height: 1.4;
        }

        /* ── Content ── */
        /* ── Scrollable area ── */
        .det-scroll-content {
          flex: 1;
          overflow-y: auto;
          padding-top: 16px;
          padding-bottom: 120px;
        }

        .det-content {
          padding: 16px 16px 0;
          display: flex; flex-direction: column; gap: 14px;
        }

        /* ── Section Card ── */
        .det-section-card {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .det-section-header {
          display: flex; align-items: center; gap: 10px;
          padding: 15px 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .det-section-icon {
          width: 32px; height: 32px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .det-section-title {
          font-size: 14.5px; font-weight: 800; color: #1e293b;
          flex: 1;
        }
        .det-section-chevron {
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .det-section-body { padding: 6px 0 4px; }

        /* Info Row */
        .det-info-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px;
          gap: 16px;
        }
        .det-info-row--multiline { align-items: flex-start; }
        .det-info-label {
          font-size: 12.5px; font-weight: 600; color: #94a3b8;
          flex-shrink: 0;
        }
        .det-info-val {
          font-size: 13.5px; font-weight: 700; color: #1e293b;
          text-align: right; flex: 1;
          word-break: break-word;
          display: flex; align-items: center; justify-content: flex-end; gap: 6px;
          line-height: 1.5;
        }
        .det-info-row--multiline .det-info-val { text-align: right; }
        .det-info-val-icon {
          width: 20px; height: 20px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── Catatan ── */
        .det-textarea {
          width: 100%; border: 1.5px solid #e2e8f0;
          border-radius: 12px; padding: 12px 14px;
          font-size: 14px; color: #1e293b; font-family: inherit;
          resize: vertical; outline: none; background: #fff;
          transition: border-color 0.2s;
          min-height: 90px;
        }
        .det-textarea:focus { border-color: #6366f1; }
        .det-catatan-inner { padding: 10px 16px 16px; }
        .det-catatan-info {
          display: flex; align-items: center; gap: 10px;
          background: #f8fafc;
          border: 1px dashed #e2e8f0;
          border-radius: 12px;
          padding: 13px 14px;
          color: #94a3b8;
          font-size: 12.5px; font-weight: 600;
          line-height: 1.4;
        }
        .det-catatan-info svg { flex-shrink: 0; }
        .det-catatan-readonly {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 13px 14px;
          color: #475569;
          font-size: 13px; font-weight: 600;
          line-height: 1.6;
        }

        /* ── Actions ── */
        .det-actions {
          display: flex; flex-direction: column; gap: 10px;
          padding: 4px 0;
        }
        .det-act-btn {
          width: 100%; border: none; border-radius: 14px;
          padding: 15px; font-size: 15px; font-weight: 800;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .det-act-btn:active { transform: scale(0.98); }
        .det-act-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .det-act-process {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #fff;
        }
        .det-act-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .det-act-accept {
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
        }
        .det-act-reject {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: #fff;
        }

        /* ── Bottom Sheet ── */
        .det-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.6);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex; align-items: flex-end;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .det-sheet {
          width: 100%;
          background: #fff;
          border-radius: 24px 24px 0 0;
          padding: 20px 24px 40px;
          animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes slideUp {
          from { transform: translateY(100%) }
          to   { transform: translateY(0) }
        }
        .det-sheet-handle {
          width: 40px; height: 4px;
          background: #e2e8f0; border-radius: 2px;
          margin: 0 auto 20px;
        }
        .det-sheet-emoji  { text-align: center; font-size: 48px; margin-bottom: 10px; }
        .det-sheet-title  { text-align: center; font-size: 18px; font-weight: 900; color: #1e293b; }
        .det-sheet-sub    {
          text-align: center; font-size: 14px; color: #64748b; margin-top: 8px;
          line-height: 1.6;
        }
        .det-sheet-btns   { display: flex; gap: 10px; margin-top: 24px; }
        .det-sheet-cancel {
          flex: 1; padding: 14px; border-radius: 12px;
          background: #f1f5f9; border: none;
          font-size: 15px; font-weight: 700; color: #64748b;
          cursor: pointer; font-family: inherit;
        }
        .det-sheet-confirm {
          flex: 2; padding: 14px; border-radius: 12px;
          border: none;
          font-size: 15px; font-weight: 800; color: #fff;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          transition: opacity 0.15s;
        }
        .det-sheet-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
      `}</style>

      <div className="det-root">

        {/* ── Topbar ── */}
        <div className="det-topbar">
          <button className="det-back-btn" onClick={() => router.back()} aria-label="Kembali">
            <IconChevronLeft />
          </button>
          <span className="det-topbar-title">Detail Pendaftar</span>
          <div className="det-menu-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="det-scroll-content">

        {/* ── Hero Card ── */}
        <div className="det-hero">
          <div className="det-hero-deco" />

          {/* Identity */}
          <div className="det-identity">
            <div className="det-av" style={{ background: AV_BG }}>
              {data!.nama_lengkap?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="det-id-info">
              <div className="det-id-name">{data!.nama_lengkap}</div>
              <div className="det-id-school">
                <IconSchool />
                {data!.asal_sekolah ?? '—'}
              </div>
              <div
                className="det-status-chip"
                style={{ background: '#fff', color: sc.color, borderColor: sc.borderColor }}
              >
                <IconCheckCircleFill />
                {sc.label}
              </div>
            </div>
          </div>

          {/* Final banners */}
          {data!.status === 'diterima' && (
            <div className="det-final-banner">
              <div className="det-final-banner-icon">🎉</div>
              <div>
                <div className="det-final-banner-title">Pendaftar Diterima</div>
                <div className="det-final-banner-sub">Keputusan sudah final dan tidak dapat diubah</div>
              </div>
            </div>
          )}
          {data!.status === 'ditolak' && (
            <div className="det-final-banner">
              <div className="det-final-banner-icon">📋</div>
              <div>
                <div className="det-final-banner-title">Pendaftar Ditolak</div>
                <div className="det-final-banner-sub">Keputusan sudah final dan tidak dapat diubah</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="det-content">

          {/* Data Pribadi */}
          <SectionCard icon={<IconUser />} title="Data Pribadi" accent="#6366f1">
            {infoRowsTop.map(([k, v]) => (
              <InfoRow key={String(k)} label={String(k)} value={v} />
            ))}
            <InfoRow
              label="Jenis Kelamin"
              value={jenisKelaminLabel}
              valueIcon={isLaki ? <IconMars /> : <IconVenus />}
              valueIconBg={isLaki ? '#eef2ff' : '#fce7f3'}
              valueIconColor={isLaki ? '#6366f1' : '#db2777'}
            />
            {infoRowsBottom.map(([k, v]) => (
              <InfoRow key={String(k)} label={String(k)} value={v} />
            ))}
            <InfoRow label="Alamat" value={data!.alamat} multiline />
          </SectionCard>

          {/* Akademik */}
          <SectionCard icon={<IconBook />} title="Informasi Akademik" accent="#10b981">
            {akademikRows.map(([k, v]) => (
              <InfoRow key={String(k)} label={String(k)} value={v} />
            ))}
          </SectionCard>

          {/* Orang Tua */}
          <SectionCard icon={<IconUsers />} title="Data Orang Tua" accent="#8b5cf6">
            {orangtuaRows.map(([k, v]) => (
              <InfoRow key={String(k)} label={String(k)} value={v} />
            ))}
          </SectionCard>

          {/* Catatan */}
          <SectionCard icon={<IconEdit />} title="Catatan Panitia" accent="#f59e0b">
            <div className="det-catatan-inner">
              {isFinished ? (
                catatan ? (
                  <p className="det-catatan-readonly">{catatan}</p>
                ) : (
                  <div className="det-catatan-info">
                    <IconInfoCircle />
                    <span>Tidak dapat diubah setelah keputusan final.</span>
                  </div>
                )
              ) : (
                <textarea
                  className="det-textarea"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  rows={3}
                  placeholder="Tambahkan catatan untuk pendaftar ini..."
                />
              )}
            </div>
          </SectionCard>

          {/* Actions */}
          {!isFinished && (
            <div className="det-actions">
              {data!.status === 'menunggu' && (
                <button
                  className="det-act-btn det-act-process"
                  disabled={loading}
                  onClick={() => setConfirm('diproses')}
                >
                  <IconRefresh />
                  Tandai Sedang Diproses
                </button>
              )}
              <div className="det-act-grid">
                <button
                  className="det-act-btn det-act-accept"
                  disabled={loading}
                  onClick={() => setConfirm('diterima')}
                >
                  <IconCheck />
                  Terima
                </button>
                <button
                  className="det-act-btn det-act-reject"
                  disabled={loading}
                  onClick={() => setConfirm('ditolak')}
                >
                  <IconX />
                  Tolak
                </button>
              </div>
            </div>
          )}
        </div>
        </div>{/* end det-scroll-content */}
      </div>

      {/* ── Confirm Bottom Sheet ── */}
      {confirm && (() => {
        const cc = CONFIRM_CONFIG[confirm]
        return (
          <div className="det-overlay" onClick={() => setConfirm(null)}>
            <div className="det-sheet" onClick={e => e.stopPropagation()}>
              <div className="det-sheet-handle" />
              <div className="det-sheet-emoji">{cc.icon}</div>
              <div className="det-sheet-title">{cc.label}</div>
              <div className="det-sheet-sub">
                Apakah Anda yakin ingin{' '}
                <strong>
                  {confirm === 'diterima' ? 'menerima' : confirm === 'ditolak' ? 'menolak' : 'memproses'}
                </strong>{' '}
                pendaftaran <strong>{data!.nama_lengkap}</strong>?
                {confirm !== 'diproses' && ' Keputusan ini tidak dapat diubah.'}
              </div>
              <div className="det-sheet-btns">
                <button className="det-sheet-cancel" onClick={() => setConfirm(null)}>
                  Batal
                </button>
                <button
                  className="det-sheet-confirm"
                  style={{ background: cc.btnBg, color: cc.btnText }}
                  disabled={loading}
                  onClick={() => updateStatus(confirm)}
                >
                  {loading ? 'Menyimpan...' : 'Ya, Konfirmasi'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}