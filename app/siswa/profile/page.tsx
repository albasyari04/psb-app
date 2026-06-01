'use client'
// app/siswa/profile/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconGraduate() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22 10v6M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v5c0 2.2 2.7 4 6 4s6-1.8 6-4v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconPayment() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M1 10h22" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
function IconProfile() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconCamera() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Verified Badge ─────────────────────────────────────────────────────────────
function StudentBadge() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: 'rgba(16,185,129,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1.5px solid rgba(16,185,129,0.3)',
      flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M22 10v6M12 2L2 7l10 5 10-5-10-5z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10v5c0 2.2 2.7 4 6 4s6-1.8 6-4v-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SiswaProfilePage() {
  const { data: session, update } = useSession()
  const [loggingOut, setLoggingOut] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const user = session?.user
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SI'

  const photoSrc = previewUrl ?? (user as { avatar_url?: string } & typeof user)?.avatar_url ?? null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null); setUploadSuccess(false)
    if (file.size > 2 * 1024 * 1024) { setUploadError('Ukuran file maksimal 2 MB'); return }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Format file harus JPG, PNG, atau WebP'); return
    }
    setPreviewUrl(URL.createObjectURL(file))
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/profile/upload', { method: 'POST', body: formData })
      const data = await res.json() as { success?: boolean; avatar_url?: string; error?: string }
      if (!res.ok || !data.success) { setUploadError(data.error ?? 'Gagal upload'); setPreviewUrl(null); return }
      await update({ avatar_url: data.avatar_url })
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch { setUploadError('Kesalahan jaringan'); setPreviewUrl(null) }
    finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleLogout = async () => { setLoggingOut(true); await signOut({ callbackUrl: '/login' }) }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F3F4F8; font-family: 'Segoe UI', system-ui, sans-serif; }

        .sp-root {
          max-width: 430px; margin: 0 auto;
          min-height: 100vh; background: #F3F4F8;
          position: relative; padding-bottom: 80px;
        }

        /* ── Header ── */
        .sp-header {
          background: linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 100%);
          padding: 56px 20px 68px;
          position: relative; overflow: hidden;
        }
        .sp-header::before {
          content: '';
          position: absolute; inset: 0;
          background-image: url('/masjid.jpg');
          background-size: cover; background-position: center top;
          opacity: 0.1;
        }
        .sp-header-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .sp-header-orb {
          position: absolute; border-radius: 50%;
          background: rgba(52,211,153,0.15); filter: blur(30px);
        }
        .sp-header-top {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .sp-header-title { color: #fff; font-size: 22px; font-weight: 700; }
        .sp-header-sub { color: rgba(255,255,255,0.65); font-size: 13px; margin-top: 2px; }
        .sp-header-edit-btn {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
          color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
          text-decoration: none; transition: background 0.2s;
        }
        .sp-header-edit-btn:hover { background: rgba(255,255,255,0.25); }

        /* ── Profile card ── */
        .sp-hero-card {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px; padding: 20px;
          backdrop-filter: blur(12px);
          display: flex; align-items: center; gap: 16px;
        }
        .sp-avatar-wrap { position: relative; flex-shrink: 0; }
        .sp-avatar-ring {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, #6EE7B7, #059669); padding: 3px;
        }
        .sp-avatar {
          width: 100%; height: 100%; border-radius: 50%;
          background: #D1FAE5;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }
        .sp-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .sp-avatar-initials { font-size: 28px; font-weight: 700; color: #065F46; }
        .sp-avatar-overlay {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(6,95,70,0.6);
          display: flex; align-items: center; justify-content: center;
        }
        .sp-avatar-spinner {
          width: 24px; height: 24px; border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sp-online-dot {
          position: absolute; bottom: 4px; right: 4px;
          width: 14px; height: 14px; border-radius: 50%;
          background: #34D399; border: 2px solid white;
        }
        .sp-camera-btn {
          position: absolute; bottom: -2px; right: -2px;
          width: 26px; height: 26px; border-radius: 50%;
          background: #059669; border: 2px solid white;
          color: white; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .sp-file-input { display: none; }
        .sp-hero-info { flex: 1; min-width: 0; }
        .sp-hero-name { color: #fff; font-size: 20px; font-weight: 700; }
        .sp-hero-email { color: rgba(167,243,208,0.9); font-size: 13px; margin-top: 3px; }
        .sp-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 10px; padding: 5px 10px; border-radius: 20px;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.9); font-size: 11px; font-weight: 600;
        }
        .sp-hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #34D399; }

        /* ── Stats strip ── */
        .sp-float-zone {
          padding: 0 16px; margin-top: -52px; position: relative; z-index: 10;
        }
        .sp-stats-card {
          background: #fff; border-radius: 18px; padding: 16px 20px;
          display: flex; align-items: center;
          box-shadow: 0 4px 24px rgba(5,150,105,0.12);
          border: 1px solid rgba(5,150,105,0.06);
        }
        .sp-stat-item {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .sp-stat-divider { width: 1px; height: 36px; background: #E5E7EB; }
        .sp-stat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
        }
        .sp-stat-val { font-size: 13px; font-weight: 700; color: #1F2937; }
        .sp-stat-label { font-size: 11px; color: #9CA3AF; font-weight: 500; }

        /* ── Body ── */
        .sp-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

        .sp-section-title {
          font-size: 11px; font-weight: 700; color: #059669;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 0 4px; margin-bottom: 2px;
        }

        .sp-card {
          background: #fff; border-radius: 18px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.04); overflow: hidden;
        }

        /* ── Info rows ── */
        .sp-info-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; border-bottom: 1px solid #F3F4F6;
        }
        .sp-info-row:last-child { border-bottom: none; }
        .sp-info-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .sp-info-icon.green  { background: #D1FAE5; color: #059669; }
        .sp-info-icon.blue   { background: #DBEAFE; color: #2563EB; }
        .sp-info-icon.violet { background: #EDE9FE; color: #7C3AED; }
        .sp-info-icon.teal   { background: #CCFBF1; color: #0D9488; }
        .sp-info-label { font-size: 12px; color: #9CA3AF; font-weight: 500; }
        .sp-info-value { font-size: 14px; color: #111827; font-weight: 600; margin-top: 1px; }
        .sp-info-value-right { margin-left: auto; text-align: right; }
        .sp-info-badge-role {
          padding: 3px 12px; border-radius: 20px;
          background: #D1FAE5; color: #059669;
          font-size: 12px; font-weight: 700;
        }

        /* ── Menu rows ── */
        .sp-menu-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; border-bottom: 1px solid #F3F4F6;
          text-decoration: none; cursor: pointer; transition: background 0.15s;
        }
        .sp-menu-row:last-child { border-bottom: none; }
        .sp-menu-row:hover { background: #FAFAFA; }
        .sp-menu-title { font-size: 14px; font-weight: 600; color: #111827; }
        .sp-menu-sub { font-size: 12px; color: #9CA3AF; margin-top: 1px; }
        .sp-menu-chevron { margin-left: auto; color: #D1D5DB; flex-shrink: 0; }

        /* ── Upload hint card ── */
        .sp-hint-card {
          background: linear-gradient(135deg, #ECFDF5, #F0FDF4);
          border: 1px solid #6EE7B7; border-radius: 14px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
        }
        .sp-hint-icon { font-size: 24px; flex-shrink: 0; }
        .sp-hint-title { font-size: 13px; font-weight: 700; color: #065F46; }
        .sp-hint-sub { font-size: 11px; color: #6EE7B7; color: #047857; margin-top: 2px; line-height: 1.4; }

        /* ── Logout ── */
        .sp-logout-btn {
          width: 100%; padding: 16px;
          background: #FFF5F5; border: 1px solid #FECACA;
          border-radius: 16px; color: #EF4444;
          font-size: 15px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer; transition: background 0.2s;
        }
        .sp-logout-btn:hover { background: #FEE2E2; }
        .sp-logout-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Upload feedback ── */
        .sp-upload-error {
          background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px;
          padding: 8px 14px; font-size: 12px; color: #EF4444;
          text-align: center; margin: -6px 16px 0;
        }
        .sp-upload-success {
          background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px;
          padding: 8px 14px; font-size: 12px; color: #059669;
          text-align: center; margin: -6px 16px 0;
        }

        /* ── Footer ── */
        .sp-footer { text-align: center; font-size: 11px; color: #9CA3AF; padding: 8px 0 4px; }

        /* ── Bottom Nav ── */
        .sp-bottom-nav {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 430px;
          background: #fff; border-top: 1px solid #F3F4F6;
          display: flex; align-items: center;
          padding: 8px 0 16px; z-index: 100;
          box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
        }
        .sp-nav-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; gap: 4px;
          text-decoration: none; color: #9CA3AF;
          font-size: 11px; font-weight: 500; padding: 4px 0;
          transition: color 0.15s;
        }
        .sp-nav-item.active { color: #059669; }
      `}</style>

      <div className="sp-root">

        {/* ── HEADER ── */}
        <div className="sp-header">
          <div className="sp-header-grid" />
          <div className="sp-header-orb" style={{ width: 180, height: 180, top: -60, right: -40 }} />
          <div className="sp-header-orb" style={{ width: 120, height: 120, bottom: 20, left: -30 }} />

          <div className="sp-header-top">
            <div>
              <div className="sp-header-title">Profil Saya</div>
              <div className="sp-header-sub">Portal Siswa</div>
            </div>
            <Link href="/siswa/profile/edit" className="sp-header-edit-btn">
              <IconEdit />
            </Link>
          </div>

          <div className="sp-hero-card">
            <div className="sp-avatar-wrap">
              <div className="sp-avatar-ring">
                <div className="sp-avatar">
                  {photoSrc ? (
                    <Image src={photoSrc} alt={user?.name ?? 'Avatar'} width={80} height={80}
                      className="sp-avatar-img" unoptimized referrerPolicy="no-referrer" />
                  ) : (
                    <span className="sp-avatar-initials">{initials}</span>
                  )}
                  {uploading && (
                    <div className="sp-avatar-overlay">
                      <div className="sp-avatar-spinner" />
                    </div>
                  )}
                </div>
              </div>
              <div className="sp-online-dot" />
              <button className="sp-camera-btn" onClick={() => fileInputRef.current?.click()}
                disabled={uploading} aria-label="Ganti foto" type="button">
                <IconCamera />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*"
                className="sp-file-input" onChange={handleFileChange} />
            </div>

            <div className="sp-hero-info">
              <div className="sp-hero-name">{user?.name ?? 'Nama Siswa'}</div>
              <div className="sp-hero-email">{user?.email ?? 'siswa@psb.com'}</div>
              <div className="sp-hero-badge">
                <div className="sp-hero-badge-dot" />
                Siswa Aktif · PSB 2025/2026
              </div>
            </div>

            <StudentBadge />
          </div>
        </div>

        {/* Upload feedback */}
        {uploadError && <div className="sp-upload-error">⚠️ {uploadError}</div>}
        {uploadSuccess && <div className="sp-upload-success">✅ Foto berhasil diperbarui!</div>}

        {/* ── STATS STRIP ── */}
        <div className="sp-float-zone">
          <div className="sp-stats-card">
            <div className="sp-stat-item">
              <div className="sp-stat-icon" style={{ background: '#FEF3C7' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#D97706" strokeWidth="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="sp-stat-val">2025</div>
              <div className="sp-stat-label">T.A.</div>
            </div>
            <div className="sp-stat-divider" />
            <div className="sp-stat-item">
              <div className="sp-stat-icon" style={{ background: '#D1FAE5' }}>
                <IconGraduate />
              </div>
              <div className="sp-stat-val">SMA</div>
              <div className="sp-stat-label">Jenjang</div>
            </div>
            <div className="sp-stat-divider" />
            <div className="sp-stat-item">
              <div className="sp-stat-icon" style={{ background: '#DBEAFE' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="#2563EB" strokeWidth="2" />
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="#2563EB" strokeWidth="2" />
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="#2563EB" strokeWidth="2" />
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="#2563EB" strokeWidth="2" />
                </svg>
              </div>
              <div className="sp-stat-val">PSB</div>
              <div className="sp-stat-label">Program</div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="sp-body">

          {/* Upload hint */}
          <div className="sp-hint-card">
            <div className="sp-hint-icon">📸</div>
            <div>
              <div className="sp-hint-title">Foto Profil</div>
              <div className="sp-hint-sub">
                Ketuk ikon kamera pada foto untuk menggantinya. Maks. 2 MB · JPG, PNG, WebP
              </div>
            </div>
          </div>

          {/* Informasi Akun */}
          <div className="sp-section-title">Informasi Akun</div>
          <div className="sp-card">
            <div className="sp-info-row">
              <div className="sp-info-icon green"><IconUser /></div>
              <div>
                <div className="sp-info-label">Nama Lengkap</div>
                <div className="sp-info-value">{user?.name ?? '-'}</div>
              </div>
            </div>
            <div className="sp-info-row">
              <div className="sp-info-icon blue"><IconMail /></div>
              <div>
                <div className="sp-info-label">Email</div>
              </div>
              <div className="sp-info-value-right">
                <div className="sp-info-value">{user?.email ?? '-'}</div>
              </div>
            </div>
            <div className="sp-info-row">
              <div className="sp-info-icon violet"><IconGraduate /></div>
              <div>
                <div className="sp-info-label">Role</div>
              </div>
              <div className="sp-info-value-right">
                <span className="sp-info-badge-role">Siswa</span>
              </div>
            </div>
          </div>

          {/* Navigasi */}
          <div className="sp-section-title">Navigasi</div>
          <div className="sp-card">
            <Link href="/siswa/dashboard" className="sp-menu-row">
              <div className="sp-info-icon" style={{ background: '#E0E7FF', color: '#4F46E5' }}><IconHome /></div>
              <div>
                <div className="sp-menu-title">Beranda</div>
                <div className="sp-menu-sub">Kembali ke dashboard utama</div>
              </div>
              <div className="sp-menu-chevron"><IconChevron /></div>
            </Link>
            <Link href="/siswa/pendaftaran" className="sp-menu-row">
              <div className="sp-info-icon blue"><IconClipboard /></div>
              <div>
                <div className="sp-menu-title">Formulir Pendaftaran</div>
                <div className="sp-menu-sub">Isi atau edit data pendaftaran</div>
              </div>
              <div className="sp-menu-chevron"><IconChevron /></div>
            </Link>
            <Link href="/siswa/status" className="sp-menu-row">
              <div className="sp-info-icon teal"><IconChart /></div>
              <div>
                <div className="sp-menu-title">Status Pendaftaran</div>
                <div className="sp-menu-sub">Pantau progress proses seleksi</div>
              </div>
              <div className="sp-menu-chevron"><IconChevron /></div>
            </Link>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} disabled={loggingOut} className="sp-logout-btn" type="button">
            <IconLogout />
            {loggingOut ? 'Keluar dari akun...' : 'Keluar dari Akun'}
          </button>

          <div className="sp-footer">PSB App · Tahun Ajaran 2025/2026</div>
        </div>

        {/* ── BOTTOM NAV ── */}
        <nav className="sp-bottom-nav">
          <Link href="/siswa/dashboard" className="sp-nav-item">
            <IconHome />
            Beranda
          </Link>
          <Link href="/siswa/pendaftaran" className="sp-nav-item">
            <IconClipboard />
            Pendaftaran
          </Link>
          <Link href="/siswa/verifikasi" className="sp-nav-item">
            <IconCheck />
            Verifikasi
          </Link>
          <Link href="/siswa/pembayaran" className="sp-nav-item">
            <IconPayment />
            Pembayaran
          </Link>
          <Link href="/siswa/profile" className="sp-nav-item active">
            <IconProfile />
            Profil
          </Link>
        </nav>

      </div>
    </>
  )
}