'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import type { Pendaftaran } from '@/types'

type Action = 'diterima' | 'ditolak' | 'diproses' | null

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; dot: string;
  borderColor: string; icon: string;
}> = {
  menunggu: { label: 'Menunggu Verifikasi', color: '#d97706', bg: '#fef3c7', dot: '#f59e0b', borderColor: '#fde68a', icon: '⏳' },
  diproses: { label: 'Sedang Diproses',     color: '#2563eb', bg: '#dbeafe', dot: '#3b82f6', borderColor: '#bfdbfe', icon: '🔄' },
  diterima: { label: 'Diterima',            color: '#059669', bg: '#d1fae5', dot: '#10b981', borderColor: '#a7f3d0', icon: '✅' },
  ditolak:  { label: 'Ditolak',             color: '#dc2626', bg: '#fee2e2', dot: '#ef4444', borderColor: '#fca5a5', icon: '❌' },
}

const CONFIRM_CONFIG: Record<string, { label: string; icon: string; btnBg: string; btnText: string }> = {
  diterima: { label: 'Terima Pendaftar',   icon: '🎉', btnBg: 'linear-gradient(135deg,#059669,#10b981)', btnText: '#fff' },
  ditolak:  { label: 'Tolak Pendaftar',    icon: '❌', btnBg: 'linear-gradient(135deg,#dc2626,#ef4444)', btnText: '#fff' },
  diproses: { label: 'Tandai Diproses',    icon: '🔄', btnBg: 'linear-gradient(135deg,#2563eb,#3b82f6)', btnText: '#fff' },
}

const AV_COLORS = [
  { bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#10b981,#34d399)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#ec4899,#f472b6)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#14b8a6,#2dd4bf)', text: '#fff' },
]

function getAvatarGrad(name: string) {
  return AV_COLORS[(name.charCodeAt(0) ?? 0) % AV_COLORS.length]
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
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
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
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

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="det-info-row">
      <span className="det-info-label">{label}</span>
      <span className="det-info-val">{value ?? '—'}</span>
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
      <div className="det-section-header" style={{ borderLeftColor: accent }}>
        <div className="det-section-icon" style={{ background: accent + '20', color: accent }}>
          {icon}
        </div>
        <span className="det-section-title">{title}</span>
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
  const av         = getAvatarGrad(data!.nama_lengkap ?? 'A')

  const infoRows: [string, string | number | undefined | null][] = [
    ['NISN',          data!.nisn],
    ['NIK',           data!.nik],
    ['Tempat Lahir',  data!.tempat_lahir],
    ['Tanggal Lahir', data!.tanggal_lahir
      ? new Date(data!.tanggal_lahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
      : undefined],
    ['Jenis Kelamin', data!.jenis_kelamin],
    ['Agama',         data!.agama],
    ['No. HP / WA',   data!.no_hp],
    ['Alamat',        data!.alamat],
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
          min-height: 100vh;
          background: #f5f6fa;
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding-bottom: 120px;
        }

        /* ── Splash ── */
        .det-splash {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px;
          background: #f5f6fa;
          font-family: 'Nunito', sans-serif;
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

        /* ── Hero ── */
        .det-hero {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%);
          padding: 0 0 24px;
          position: relative;
          overflow: hidden;
        }
        .det-hero::before {
          content: '';
          position: absolute; top: -80px; right: -80px;
          width: 220px; height: 220px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
        }
        .det-hero::after {
          content: '';
          position: absolute; bottom: -60px; left: -60px;
          width: 180px; height: 180px;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
        }

        /* Back bar */
        .det-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 16px 0;
          position: relative; z-index: 2;
        }
        .det-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          color: #fff; font-size: 13px; font-weight: 700;
          padding: 8px 14px;
          cursor: pointer; font-family: inherit;
          transition: background 0.15s;
        }
        .det-back-btn:hover { background: rgba(255,255,255,0.3); }
        .det-topbar-title {
          font-size: 15px; font-weight: 800; color: #fff;
          position: absolute; left: 50%; transform: translateX(-50%);
        }

        /* Identity */
        .det-identity {
          display: flex; align-items: center; gap: 14px;
          padding: 20px 16px 0;
          position: relative; z-index: 2;
        }
        .det-av {
          width: 64px; height: 64px;
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; font-weight: 900; color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          border: 3px solid rgba(255,255,255,0.4);
        }
        .det-id-name {
          font-size: 20px; font-weight: 900; color: #fff; line-height: 1.2;
        }
        .det-id-school {
          font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 3px;
        }
        .det-status-chip {
          display: inline-flex; align-items: center; gap: 5px;
          border-radius: 20px; padding: 4px 12px;
          font-size: 12px; font-weight: 700;
          margin-top: 6px;
        }
        .det-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
        }

        /* Banner (diterima/ditolak) */
        .det-final-banner {
          margin: 14px 16px 0;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          position: relative; z-index: 2;
        }
        .det-final-banner-icon { font-size: 28px; }
        .det-final-banner-title {
          font-size: 14px; font-weight: 800; color: #fff;
        }
        .det-final-banner-sub {
          font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 2px;
        }
        .det-banner-green { background: rgba(16,185,129,0.35); border: 1px solid rgba(16,185,129,0.5); }
        .det-banner-red   { background: rgba(239, 68, 68,0.35); border: 1px solid rgba(239,68,68,0.5);  }

        /* ── Content ── */
        .det-content {
          padding: 16px 16px 0;
          display: flex; flex-direction: column; gap: 12px;
        }

        /* ── Section Card ── */
        .det-section-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 8px rgba(0,0,0,0.07);
        }
        .det-section-header {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px 12px;
          border-left: 4px solid transparent;
          border-bottom: 1px solid #f1f5f9;
        }
        .det-section-icon {
          width: 32px; height: 32px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .det-section-title {
          font-size: 14px; font-weight: 800; color: #1e293b;
        }
        .det-section-body { padding: 4px 0; }

        /* Info Row */
        .det-info-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 10px 16px;
          gap: 16px;
          border-bottom: 1px solid #f8fafc;
        }
        .det-info-row:last-child { border-bottom: none; }
        .det-info-label {
          font-size: 12px; font-weight: 700; color: #94a3b8;
          flex-shrink: 0; min-width: 110px;
        }
        .det-info-val {
          font-size: 13px; font-weight: 600; color: #1e293b;
          text-align: right; flex: 1;
          word-break: break-word;
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
        .det-textarea:focus   { border-color: #6366f1; }
        .det-textarea:disabled {
          background: #f8fafc; color: #94a3b8; cursor: not-allowed;
        }
        .det-catatan-inner { padding: 12px 16px 14px; }

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

      <div className="det-root">

        {/* ── Hero ── */}
        <div className="det-hero">
          <div className="det-topbar">
            <button className="det-back-btn" onClick={() => router.back()}>
              <IconChevronLeft />
              Kembali
            </button>
            <span className="det-topbar-title">Detail Pendaftar</span>
          </div>

          {/* Identity */}
          <div className="det-identity">
            <div className="det-av" style={{ background: av.bg }}>
              {data!.nama_lengkap?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div className="det-id-name">{data!.nama_lengkap}</div>
              <div className="det-id-school">🏫 {data!.asal_sekolah ?? '—'}</div>
              <div
                className="det-status-chip"
                style={{ background: sc.bg, color: sc.color }}
              >
                <div className="det-status-dot" style={{ background: sc.dot }} />
                {sc.label}
              </div>
            </div>
          </div>

          {/* Final banners */}
          {data!.status === 'diterima' && (
            <div className="det-final-banner det-banner-green">
              <div className="det-final-banner-icon">🎉</div>
              <div>
                <div className="det-final-banner-title">Pendaftar Diterima</div>
                <div className="det-final-banner-sub">Keputusan sudah final dan tidak dapat diubah</div>
              </div>
            </div>
          )}
          {data!.status === 'ditolak' && (
            <div className="det-final-banner det-banner-red">
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
            {infoRows.map(([k, v]) => (
              <InfoRow key={String(k)} label={String(k)} value={v} />
            ))}
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
              <textarea
                className="det-textarea"
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                rows={3}
                disabled={isFinished}
                placeholder={
                  isFinished
                    ? 'Tidak dapat diubah setelah keputusan final'
                    : 'Tambahkan catatan untuk pendaftar ini...'
                }
              />
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