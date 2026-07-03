'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import type { Pendaftaran } from '@/types'
import { useSettings } from '@/contexts/SettingsContext'

type Action = 'diterima' | 'ditolak' | 'diproses' | null

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string; labelEn: string; color: string; bg: string; dot: string;
  borderColor: string;
}> = {
  menunggu: { label: 'Menunggu Verifikasi', labelEn: 'Pending Verification', color: '#d97706', bg: '#fef3c7', dot: '#f59e0b', borderColor: '#fde68a' },
  diproses: { label: 'Sedang Diproses', labelEn: 'Processing', color: '#2563eb', bg: '#dbeafe', dot: '#3b82f6', borderColor: '#bfdbfe' },
  diterima: { label: 'Diterima', labelEn: 'Accepted', color: '#059669', bg: '#d1fae5', dot: '#10b981', borderColor: '#a7f3d0' },
  ditolak:  { label: 'Ditolak', labelEn: 'Rejected', color: '#dc2626', bg: '#fee2e2', dot: '#ef4444', borderColor: '#fca5a5' },
}

const CONFIRM_CONFIG: Record<string, { label: string; labelEn: string; icon: string; btnBg: string; btnText: string }> = {
  diterima: { label: 'Terima Pendaftar', labelEn: 'Accept Applicant', icon: '🎉', btnBg: 'linear-gradient(135deg,#059669,#10b981)', btnText: '#fff' },
  ditolak:  { label: 'Tolak Pendaftar', labelEn: 'Reject Applicant', icon: '❌', btnBg: 'linear-gradient(135deg,#dc2626,#ef4444)', btnText: '#fff' },
  diproses: { label: 'Tandai Diproses', labelEn: 'Mark as Processing', icon: '🔄', btnBg: 'linear-gradient(135deg,#2563eb,#3b82f6)', btnText: '#fff' },
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
  label, value, valueIcon, valueIconBg, valueIconColor, multiline, dark = false,
}: {
  label: string
  value?: string | number | null
  valueIcon?: React.ReactNode
  valueIconBg?: string
  valueIconColor?: string
  multiline?: boolean
  dark?: boolean
}) {
  return (
    <div className={`det-info-row${multiline ? ' det-info-row--multiline' : ''}`}>
      <span className="det-info-label" style={{ color: dark ? '#94a3b8' : '#94a3b8' }}>
        {label}
      </span>
      <span className="det-info-val" style={{ color: dark ? '#f1f0f5' : '#1e293b' }}>
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
  icon, title, accent, children, dark = false,
}: {
  icon: React.ReactNode; title: string; accent: string; children: React.ReactNode; dark?: boolean
}) {
  return (
    <div className="det-section-card" style={{ background: dark ? '#1e1b2e' : '#fff', borderColor: dark ? '#2e2a40' : '#f1f5f9' }}>
      <div className="det-section-header" style={{ borderBottomColor: dark ? '#2e2a40' : '#f1f5f9' }}>
        <div className="det-section-icon" style={{ background: accent + '1c', color: accent }}>
          {icon}
        </div>
        <span className="det-section-title" style={{ color: dark ? '#f1f0f5' : '#1e293b' }}>
          {title}
        </span>
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
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'

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

  // ── Helper: get status label based on language ──
  const getStatusLabel = (status: string) => {
    const config = STATUS_CONFIG[status]
    if (!config) return status
    return language === 'en' ? config.labelEn : config.label
  }

  // ── Helper: get confirm label based on language ──
  const getConfirmLabel = (action: Action) => {
    if (!action) return ''
    const config = CONFIRM_CONFIG[action]
    if (!config) return ''
    return language === 'en' ? config.labelEn : config.label
  }

  // ── Loading ──
  if (!data && !fetchErr) return (
    <div className="det-splash" style={{ background: isDark ? '#15131f' : '#f0f1f8' }}>
      <div className="det-spinner" />
      <p className="det-splash-text" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
        {language === 'en' ? 'Loading applicant data...' : 'Memuat data pendaftar...'}
      </p>
    </div>
  )

  // ── Error ──
  if (fetchErr) return (
    <div className="det-splash" style={{ background: isDark ? '#15131f' : '#f0f1f8' }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <p className="det-splash-text" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{fetchErr}</p>
      <button className="det-back-link" onClick={() => router.back()}>
        {language === 'en' ? '← Back' : '← Kembali'}
      </button>
    </div>
  )

  const isFinished = data!.status === 'diterima' || data!.status === 'ditolak'
  const sc         = STATUS_CONFIG[data!.status] ?? STATUS_CONFIG.menunggu

  const jenisKelamin   = (data!.jenis_kelamin ?? '').toLowerCase()
  const isLaki         = jenisKelamin.startsWith('l')
  const jenisKelaminLabel =
    !data!.jenis_kelamin ? undefined :
    isLaki ? (language === 'en' ? 'Male' : 'Laki-laki') : (language === 'en' ? 'Female' : 'Perempuan')

  const infoRowsTop: [string, string | number | undefined | null][] = [
    ['NISN',          data!.nisn],
    ['NIK',           data!.nik],
    [language === 'en' ? 'Place of Birth' : 'Tempat Lahir', data!.tempat_lahir],
    [language === 'en' ? 'Date of Birth' : 'Tanggal Lahir', data!.tanggal_lahir
      ? new Date(data!.tanggal_lahir).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : undefined],
  ]
  const infoRowsBottom: [string, string | number | undefined | null][] = [
    [language === 'en' ? 'Religion' : 'Agama', data!.agama],
    [language === 'en' ? 'Phone / WA' : 'No. HP / WA', data!.no_hp],
  ]

  const akademikRows: [string, string | number | undefined | null][] = [
    [language === 'en' ? 'School Origin' : 'Asal Sekolah', data!.asal_sekolah],
    ['NPSN',            data!.npsn],
    [language === 'en' ? 'Major Choice' : 'Jurusan Pilihan', (data as Pendaftaran & { jurusan_pilihan?: string }).jurusan_pilihan],
  ]

  const orangtuaRows: [string, string | number | undefined | null][] = [
    [language === 'en' ? "Father's Name" : 'Nama Ayah', data!.nama_ayah],
    [language === 'en' ? "Mother's Name" : 'Nama Ibu', data!.nama_ibu],
    [language === 'en' ? "Father's Occupation" : 'Pekerjaan Ayah', data!.pekerjaan_ayah],
    [language === 'en' ? "Mother's Occupation" : 'Pekerjaan Ibu', data!.pekerjaan_ibu],
    [language === 'en' ? "Parent's Phone" : 'No. HP Orang Tua', data!.no_hp_ortu],
  ]

  return (
    <>
      <style>{`
        /* ── Base ── */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .det-root {
          height: 100dvh;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 430px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Dark mode overrides ── */
        [data-theme='dark'] .det-root {
          background: #15131f;
        }
        [data-theme='dark'] .det-topbar {
          background: #1e1b2e !important;
          border-bottom-color: #2e2a40 !important;
        }
        [data-theme='dark'] .det-topbar-title {
          color: #f1f0f5 !important;
        }
        [data-theme='dark'] .det-back-btn {
          background: #2e2a40 !important;
          border-color: #3d3655 !important;
          color: #a5b4fc !important;
        }
        [data-theme='dark'] .det-back-btn:hover {
          background: #3d3655 !important;
        }
        [data-theme='dark'] .det-menu-btn {
          background: #2e2a40 !important;
          border-color: #3d3655 !important;
          color: #a5b4fc !important;
        }
        [data-theme='dark'] .det-menu-btn:hover {
          background: #3d3655 !important;
        }
        [data-theme='dark'] .det-section-card {
          background: #1e1b2e !important;
          border: 1px solid #2e2a40 !important;
        }
        [data-theme='dark'] .det-section-header {
          border-bottom-color: #2e2a40 !important;
        }
        [data-theme='dark'] .det-section-title {
          color: #f1f0f5 !important;
        }
        [data-theme='dark'] .det-info-row {
          border-bottom: 1px solid #2e2a40;
        }
        [data-theme='dark'] .det-info-label {
          color: #94a3b8 !important;
        }
        [data-theme='dark'] .det-info-val {
          color: #f1f0f5 !important;
        }
        [data-theme='dark'] .det-textarea {
          background: #1e1b2e !important;
          border-color: #2e2a40 !important;
          color: #f1f0f5 !important;
        }
        [data-theme='dark'] .det-textarea:focus {
          border-color: #6366f1 !important;
        }
        [data-theme='dark'] .det-textarea::placeholder {
          color: #6b6885 !important;
        }
        [data-theme='dark'] .det-catatan-info {
          background: #2e2a40 !important;
          border-color: #3d3655 !important;
          color: #94a3b8 !important;
        }
        [data-theme='dark'] .det-catatan-readonly {
          background: #2e2a40 !important;
          border-color: #3d3655 !important;
          color: #94a3b8 !important;
        }
        [data-theme='dark'] .det-sheet {
          background: #1e1b2e !important;
        }
        [data-theme='dark'] .det-sheet-title {
          color: #f1f0f5 !important;
        }
        [data-theme='dark'] .det-sheet-sub {
          color: #94a3b8 !important;
        }
        [data-theme='dark'] .det-sheet-cancel {
          background: #2e2a40 !important;
          color: #94a3b8 !important;
        }
        [data-theme='dark'] .det-sheet-handle {
          background: #3d3655 !important;
        }
        [data-theme='dark'] .det-id-name {
          color: #1e1b3a !important;
        }
        [data-theme='dark'] .det-id-school {
          color: rgba(30,27,58,0.65) !important;
        }
        [data-theme='dark'] .det-hero {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #a78bfa 100%) !important;
        }
        [data-theme='dark'] .det-final-banner {
          background: rgba(255,255,255,0.55) !important;
        }
        [data-theme='dark'] .det-final-banner-title {
          color: #4338ca !important;
        }
        [data-theme='dark'] .det-final-banner-sub {
          color: #4b4470 !important;
        }

        /* ── Splash ── */
        .det-splash {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .det-splash-text { font-size: 15px; font-weight: 600; }
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

        /* ── Topbar (sticky) ── */
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
          border: 1px solid #f1f5f9;
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
          border-bottom: 1px solid #f5f6fa;
        }
        .det-info-row:last-child {
          border-bottom: none;
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

      <div className="det-root" style={{ background: isDark ? '#15131f' : '#f0f1f8' }}>

        {/* ── Topbar ── */}
        <div className="det-topbar" style={{ background: isDark ? '#1e1b2e' : '#ffffff', borderBottomColor: isDark ? '#2e2a40' : '#e9eef2' }}>
          <button 
            className="det-back-btn" 
            onClick={() => router.back()} 
            aria-label={language === 'en' ? 'Back' : 'Kembali'}
            style={{ background: isDark ? '#2e2a40' : '#f5f3ff', borderColor: isDark ? '#3d3655' : '#ede9fe', color: isDark ? '#a5b4fc' : '#6d28d9' }}
          >
            <IconChevronLeft />
          </button>
          <span className="det-topbar-title" style={{ color: isDark ? '#f1f0f5' : '#0f172a' }}>
            {language === 'en' ? 'Applicant Details' : 'Detail Pendaftar'}
          </span>
          <div className="det-menu-btn" style={{ background: isDark ? '#2e2a40' : '#f8fafc', borderColor: isDark ? '#3d3655' : '#e9eef2', color: isDark ? '#a5b4fc' : '#6d28d9' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                {getStatusLabel(data!.status)}
              </div>
            </div>
          </div>

          {/* Final banners */}
          {data!.status === 'diterima' && (
            <div className="det-final-banner">
              <div className="det-final-banner-icon">🎉</div>
              <div>
                <div className="det-final-banner-title">
                  {language === 'en' ? 'Applicant Accepted' : 'Pendaftar Diterima'}
                </div>
                <div className="det-final-banner-sub">
                  {language === 'en' ? 'Final decision cannot be changed' : 'Keputusan sudah final dan tidak dapat diubah'}
                </div>
              </div>
            </div>
          )}
          {data!.status === 'ditolak' && (
            <div className="det-final-banner">
              <div className="det-final-banner-icon">📋</div>
              <div>
                <div className="det-final-banner-title">
                  {language === 'en' ? 'Applicant Rejected' : 'Pendaftar Ditolak'}
                </div>
                <div className="det-final-banner-sub">
                  {language === 'en' ? 'Final decision cannot be changed' : 'Keputusan sudah final dan tidak dapat diubah'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="det-content">

          {/* Data Pribadi */}
          <SectionCard 
            icon={<IconUser />} 
            title={language === 'en' ? 'Personal Data' : 'Data Pribadi'} 
            accent="#6366f1" 
            dark={isDark}
          >
            {infoRowsTop.map(([k, v]) => (
              <InfoRow key={String(k)} label={String(k)} value={v} dark={isDark} />
            ))}
            <InfoRow
              label={language === 'en' ? 'Gender' : 'Jenis Kelamin'}
              value={jenisKelaminLabel}
              valueIcon={isLaki ? <IconMars /> : <IconVenus />}
              valueIconBg={isLaki ? '#eef2ff' : '#fce7f3'}
              valueIconColor={isLaki ? '#6366f1' : '#db2777'}
              dark={isDark}
            />
            {infoRowsBottom.map(([k, v]) => (
              <InfoRow key={String(k)} label={String(k)} value={v} dark={isDark} />
            ))}
            <InfoRow 
              label={language === 'en' ? 'Address' : 'Alamat'} 
              value={data!.alamat} 
              multiline 
              dark={isDark} 
            />
          </SectionCard>

          {/* Akademik */}
          <SectionCard 
            icon={<IconBook />} 
            title={language === 'en' ? 'Academic Information' : 'Informasi Akademik'} 
            accent="#10b981" 
            dark={isDark}
          >
            {akademikRows.map(([k, v]) => (
              <InfoRow key={String(k)} label={String(k)} value={v} dark={isDark} />
            ))}
          </SectionCard>

          {/* Orang Tua */}
          <SectionCard 
            icon={<IconUsers />} 
            title={language === 'en' ? "Parent's Data" : 'Data Orang Tua'} 
            accent="#8b5cf6" 
            dark={isDark}
          >
            {orangtuaRows.map(([k, v]) => (
              <InfoRow key={String(k)} label={String(k)} value={v} dark={isDark} />
            ))}
          </SectionCard>

          {/* Catatan */}
          <SectionCard 
            icon={<IconEdit />} 
            title={language === 'en' ? 'Committee Notes' : 'Catatan Panitia'} 
            accent="#f59e0b" 
            dark={isDark}
          >
            <div className="det-catatan-inner">
              {isFinished ? (
                catatan ? (
                  <p className="det-catatan-readonly" style={{ background: isDark ? '#2e2a40' : '#f8fafc', borderColor: isDark ? '#3d3655' : '#f1f5f9', color: isDark ? '#94a3b8' : '#475569' }}>
                    {catatan}
                  </p>
                ) : (
                  <div className="det-catatan-info" style={{ background: isDark ? '#2e2a40' : '#f8fafc', borderColor: isDark ? '#3d3655' : '#e2e8f0', color: isDark ? '#94a3b8' : '#94a3b8' }}>
                    <IconInfoCircle />
                    <span>
                      {language === 'en' ? 'Cannot be changed after final decision.' : 'Tidak dapat diubah setelah keputusan final.'}
                    </span>
                  </div>
                )
              ) : (
                <textarea
                  className="det-textarea"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  rows={3}
                  placeholder={language === 'en' ? 'Add notes for this applicant...' : 'Tambahkan catatan untuk pendaftar ini...'}
                  style={{ background: isDark ? '#1e1b2e' : '#fff', borderColor: isDark ? '#2e2a40' : '#e2e8f0', color: isDark ? '#f1f0f5' : '#1e293b' }}
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
                  {language === 'en' ? 'Mark as Processing' : 'Tandai Sedang Diproses'}
                </button>
              )}
              <div className="det-act-grid">
                <button
                  className="det-act-btn det-act-accept"
                  disabled={loading}
                  onClick={() => setConfirm('diterima')}
                >
                  <IconCheck />
                  {language === 'en' ? 'Accept' : 'Terima'}
                </button>
                <button
                  className="det-act-btn det-act-reject"
                  disabled={loading}
                  onClick={() => setConfirm('ditolak')}
                >
                  <IconX />
                  {language === 'en' ? 'Reject' : 'Tolak'}
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
        const actionLabels = {
          diterima: language === 'en' ? 'accept' : 'menerima',
          ditolak: language === 'en' ? 'reject' : 'menolak',
          diproses: language === 'en' ? 'process' : 'memproses',
        }
        return (
          <div className="det-overlay" onClick={() => setConfirm(null)}>
            <div className="det-sheet" onClick={e => e.stopPropagation()} style={{ background: isDark ? '#1e1b2e' : '#fff' }}>
              <div className="det-sheet-handle" style={{ background: isDark ? '#3d3655' : '#e2e8f0' }} />
              <div className="det-sheet-emoji">{cc.icon}</div>
              <div className="det-sheet-title" style={{ color: isDark ? '#f1f0f5' : '#1e293b' }}>
                {getConfirmLabel(confirm)}
              </div>
              <div className="det-sheet-sub" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                {language === 'en' 
                  ? `Are you sure you want to ${actionLabels[confirm]} the registration of ` 
                  : `Apakah Anda yakin ingin ${actionLabels[confirm]} pendaftaran `}
                <strong>{data!.nama_lengkap}</strong>?
                {confirm !== 'diproses' && (
                  language === 'en' 
                    ? ' This decision cannot be undone.'
                    : ' Keputusan ini tidak dapat diubah.'
                )}
              </div>
              <div className="det-sheet-btns">
                <button 
                  className="det-sheet-cancel" 
                  onClick={() => setConfirm(null)}
                  style={{ background: isDark ? '#2e2a40' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b' }}
                >
                  {language === 'en' ? 'Cancel' : 'Batal'}
                </button>
                <button
                  className="det-sheet-confirm"
                  style={{ background: cc.btnBg, color: cc.btnText }}
                  disabled={loading}
                  onClick={() => updateStatus(confirm)}
                >
                  {loading 
                    ? (language === 'en' ? 'Saving...' : 'Menyimpan...') 
                    : (language === 'en' ? 'Yes, Confirm' : 'Ya, Konfirmasi')}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}