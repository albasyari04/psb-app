'use client'
// app/siswa/profile/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'

// ── Icons ──────────────────────────────────────────────────────────────────────
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
function IconClipboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2.2" />
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
// ── Main Page ──────────────────────────────────────────────────────────────────
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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0F1117; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

        /* ── Root ── */
        .sp-root {
          max-width: 430px; margin: 0 auto;
          min-height: 100vh; background: #0F1117;
          position: relative; padding-bottom: 90px;
        }

        /* ── Header ── */
        .sp-header {
          background: linear-gradient(160deg, #064E3B 0%, #065F46 50%, #0D9488 100%);
          padding: 52px 20px 80px;
          position: relative; overflow: hidden;
        }
        .sp-header::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 70% 20%, rgba(52,211,153,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .sp-header-mesh {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 40%),
            radial-gradient(circle at 80% 10%, rgba(255,255,255,0.06) 0%, transparent 40%);
        }
        .sp-header-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }
        .sp-header-top {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px;
        }
        .sp-header-label {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          border-radius: 20px; padding: 4px 10px;
          color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 600;
          letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 8px;
        }
        .sp-header-label-dot { width: 5px; height: 5px; border-radius: 50%; background: #34D399; }
        .sp-header-title { color: #fff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .sp-header-sub { color: rgba(167,243,208,0.8); font-size: 13px; margin-top: 2px; font-weight: 400; }
        .sp-header-edit-btn {
          width: 42px; height: 42px; border-radius: 12px;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18);
          color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(12px); text-decoration: none; transition: all 0.2s;
          flex-shrink: 0;
        }
        .sp-header-edit-btn:hover { background: rgba(255,255,255,0.22); transform: scale(1.05); }

        /* ── Hero card ── */
        .sp-hero-card {
          position: relative; z-index: 2;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 24px; padding: 20px;
          backdrop-filter: blur(16px);
          display: flex; align-items: center; gap: 16px;
        }
        .sp-avatar-wrap { position: relative; flex-shrink: 0; }
        .sp-avatar-ring {
          width: 84px; height: 84px; border-radius: 50%;
          background: linear-gradient(135deg, #34D399, #059669, #0D9488);
          padding: 3px;
        }
        .sp-avatar-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: #064E3B;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }
        .sp-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .sp-avatar-initials {
          font-size: 30px; font-weight: 800; color: #34D399;
          letter-spacing: -1px;
        }
        .sp-avatar-overlay {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(6,78,59,0.7);
          display: flex; align-items: center; justify-content: center;
        }
        .sp-avatar-spinner {
          width: 26px; height: 26px; border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.25);
          border-top-color: #34D399;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sp-camera-btn {
          position: absolute; bottom: 0; right: 0;
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #059669, #0D9488);
          border: 2.5px solid #0F1117;
          color: white; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(5,150,105,0.5);
          transition: transform 0.2s;
        }
        .sp-camera-btn:hover { transform: scale(1.1); }
        .sp-file-input { display: none; }

        .sp-hero-info { flex: 1; min-width: 0; }
        .sp-hero-name {
          color: #fff; font-size: 19px; font-weight: 700;
          letter-spacing: -0.3px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .sp-hero-email {
          color: rgba(167,243,208,0.75); font-size: 12px;
          margin-top: 3px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .sp-hero-badge {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 10px; padding: 5px 10px; border-radius: 20px;
          background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.25);
          color: #6EE7B7; font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.02em;
        }
        .sp-hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #34D399;
          box-shadow: 0 0 6px #34D399;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .sp-hero-verified {
          width: 32px; height: 32px; flex-shrink: 0;
          border-radius: 50%;
          background: rgba(52,211,153,0.15);
          border: 1.5px solid rgba(52,211,153,0.3);
          display: flex; align-items: center; justify-content: center;
        }

        /* ── Float zone (stats card) ── */
        .sp-float-zone {
          padding: 0 16px;
          margin-top: -56px;
          position: relative; z-index: 10;
        }
        .sp-stats-card {
          background: #1A1F2E;
          border-radius: 20px;
          padding: 18px 20px;
          display: flex; align-items: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .sp-stat-item {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
        }
        .sp-stat-divider {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent);
        }
        .sp-stat-icon {
          width: 38px; height: 38px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 6px;
        }
        .sp-stat-val { font-size: 13px; font-weight: 800; color: #F9FAFB; letter-spacing: -0.3px; }
        .sp-stat-label { font-size: 10px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

        /* ── Upload feedback ── */
        .sp-upload-feedback {
          margin: 12px 16px 0;
          padding: 10px 14px; border-radius: 12px;
          font-size: 12.5px; font-weight: 600;
          display: flex; align-items: center; gap: 8px;
        }
        .sp-upload-error {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
          color: #F87171;
        }
        .sp-upload-success {
          background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25);
          color: #34D399;
        }

        /* ── Body ── */
        .sp-body { padding: 16px; display: flex; flex-direction: column; gap: 6px; }

        .sp-section-label {
          font-size: 10px; font-weight: 700; color: #4B5563;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 16px 4px 8px;
        }

        /* ── Glass card ── */
        .sp-card {
          background: #1A1F2E;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }

        /* ── Info rows ── */
        .sp-info-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .sp-info-row:last-child { border-bottom: none; }
        .sp-icon-box {
          width: 38px; height: 38px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .sp-icon-green  { background: rgba(5,150,105,0.15); color: #34D399; }
        .sp-icon-blue   { background: rgba(37,99,235,0.15); color: #60A5FA; }
        .sp-icon-violet { background: rgba(124,58,237,0.15); color: #A78BFA; }
        .sp-icon-amber  { background: rgba(217,119,6,0.15); color: #FCD34D; }
        .sp-icon-teal   { background: rgba(13,148,136,0.15); color: #2DD4BF; }
        .sp-info-text { flex: 1; min-width: 0; }
        .sp-info-label { font-size: 11px; color: #6B7280; font-weight: 500; }
        .sp-info-value {
          font-size: 14px; color: #F3F4F6; font-weight: 600;
          margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sp-info-right { margin-left: auto; flex-shrink: 0; }
        .sp-badge-role {
          padding: 4px 12px; border-radius: 20px;
          background: rgba(5,150,105,0.15); border: 1px solid rgba(5,150,105,0.25);
          color: #34D399; font-size: 11px; font-weight: 700;
        }

        /* ── Photo hint ── */
        .sp-photo-hint {
          background: linear-gradient(135deg, rgba(5,150,105,0.08), rgba(13,148,136,0.06));
          border: 1px solid rgba(52,211,153,0.15);
          border-radius: 16px; padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 2px;
        }
        .sp-photo-hint-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: rgba(5,150,105,0.15); border: 1px solid rgba(52,211,153,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #34D399;
        }
        .sp-photo-hint-title { font-size: 13px; font-weight: 700; color: #E5E7EB; }
        .sp-photo-hint-sub { font-size: 11px; color: #6B7280; margin-top: 2px; line-height: 1.5; }

        /* ── Menu rows (navigation) ── */
        .sp-menu-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          text-decoration: none; cursor: pointer;
          transition: background 0.15s;
        }
        .sp-menu-row:last-child { border-bottom: none; }
        .sp-menu-row:hover { background: rgba(255,255,255,0.03); }
        .sp-menu-text { flex: 1; }
        .sp-menu-title { font-size: 14px; font-weight: 600; color: #F3F4F6; }
        .sp-menu-sub { font-size: 11px; color: #6B7280; margin-top: 1px; }
        .sp-menu-chevron { color: #374151; flex-shrink: 0; }

        /* ── Logout ── */
        .sp-logout-btn {
          width: 100%; padding: 16px;
          background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 18px; color: #F87171;
          font-size: 14px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer; transition: all 0.2s; margin-top: 10px;
          letter-spacing: 0.01em;
        }
        .sp-logout-btn:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.35); }
        .sp-logout-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Footer ── */
        .sp-footer {
          text-align: center; font-size: 11px; color: #374151;
          padding: 16px 0 4px; letter-spacing: 0.02em;
        }

        /* ── Bottom nav ── */
        .sp-bottom-nav {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 430px;
          background: #12161F;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: stretch;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          z-index: 100;
          box-shadow: 0 -8px 24px rgba(0,0,0,0.5);
        }
        .sp-nav-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; gap: 3px;
          text-decoration: none; color: #4B5563;
          font-size: 10px; font-weight: 600; padding: 10px 0 12px;
          transition: color 0.15s; letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .sp-nav-item.active { color: #34D399; }
        .sp-nav-item.active svg { filter: drop-shadow(0 0 4px rgba(52,211,153,0.6)); }
      `}</style>

      <div className="sp-root">

        {/* ── HEADER ── */}
        <div className="sp-header">
          <div className="sp-header-mesh" />
          <div className="sp-header-dots" />

          <div className="sp-header-top">
            <div>
              
              <div className="sp-header-title">Profil Saya</div>
              <div className="sp-header-sub">Kelola informasi akun Anda</div>
            </div>
            {/* ✅ FIX: Link ke halaman edit yang benar */}
            <Link href="/siswa/profile/edit" className="sp-header-edit-btn">
              <IconEdit />
            </Link>
          </div>

          {/* Hero profile card */}
          <div className="sp-hero-card">
            <div className="sp-avatar-wrap">
              <div className="sp-avatar-ring">
                <div className="sp-avatar-inner">
                  {photoSrc ? (
                    <Image src={photoSrc} alt={user?.name ?? 'Avatar'} width={84} height={84}
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
            </div>

            <div className="sp-hero-verified">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Upload feedback ── */}
        {uploadError && (
          <div className="sp-upload-feedback sp-upload-error">
            <span>⚠</span> {uploadError}
          </div>
        )}
        {uploadSuccess && (
          <div className="sp-upload-feedback sp-upload-success">
            <span>✓</span> Foto profil berhasil diperbarui!
          </div>
        )}

        {/* ── BODY ── */}
        <div className="sp-body">

          {/* Photo hint */}
          <div className="sp-photo-hint">
            <div className="sp-photo-hint-icon">
              <IconCamera />
            </div>
            <div>
              <div className="sp-photo-hint-title">Foto Profil</div>
              <div className="sp-photo-hint-sub">
                Ketuk ikon kamera di avatar untuk mengganti foto.<br />
                Maks. 2 MB · Format: JPG, PNG, WebP
              </div>
            </div>
          </div>

          {/* Informasi Akun */}
          <div className="sp-section-label">Informasi Akun</div>
          <div className="sp-card">
            <div className="sp-info-row">
              <div className="sp-icon-box sp-icon-green"><IconUser /></div>
              <div className="sp-info-text">
                <div className="sp-info-label">Nama Lengkap</div>
                <div className="sp-info-value">{user?.name ?? '-'}</div>
              </div>
            </div>
            <div className="sp-info-row">
              <div className="sp-icon-box sp-icon-blue"><IconMail /></div>
              <div className="sp-info-text">
                <div className="sp-info-label">Email</div>
                <div className="sp-info-value">{user?.email ?? '-'}</div>
              </div>
            </div>
            <div className="sp-info-row">
              <div className="sp-icon-box sp-icon-violet"><IconShield /></div>
              <div className="sp-info-text">
                <div className="sp-info-label">Role Akun</div>
                <div className="sp-info-value">Siswa</div>
              </div>
              <div className="sp-info-right">
                <span className="sp-badge-role">Aktif</span>
              </div>
            </div>
          </div>

          {/* Navigasi */}
          <div className="sp-section-label">Menu Utama</div>
          <div className="sp-card">
            <Link href="/siswa/dashboard" className="sp-menu-row">
              <div className="sp-icon-box" style={{ background: 'rgba(79,70,229,0.15)', color: '#818CF8' }}><IconHome /></div>
              <div className="sp-menu-text">
                <div className="sp-menu-title">Beranda</div>
                <div className="sp-menu-sub">Kembali ke dashboard utama</div>
              </div>
              <div className="sp-menu-chevron"><IconChevron /></div>
            </Link>
            <Link href="/siswa/pendaftaran" className="sp-menu-row">
              <div className="sp-icon-box sp-icon-blue"><IconClipboard /></div>
              <div className="sp-menu-text">
                <div className="sp-menu-title">Formulir Pendaftaran</div>
                <div className="sp-menu-sub">Isi atau lengkapi data pendaftaran</div>
              </div>
              <div className="sp-menu-chevron"><IconChevron /></div>
            </Link>
            <Link href="/siswa/status" className="sp-menu-row">
              <div className="sp-icon-box sp-icon-teal"><IconChart /></div>
              <div className="sp-menu-text">
                <div className="sp-menu-title">Status Pendaftaran</div>
                <div className="sp-menu-sub">Pantau progres proses seleksi</div>
              </div>
              <div className="sp-menu-chevron"><IconChevron /></div>
            </Link>
            <Link href="/siswa/profile/edit" className="sp-menu-row">
              <div className="sp-icon-box sp-icon-green"><IconEdit /></div>
              <div className="sp-menu-text">
                <div className="sp-menu-title">Edit Profil</div>
                <div className="sp-menu-sub">Ubah nama dan informasi akun</div>
              </div>
              <div className="sp-menu-chevron"><IconChevron /></div>
            </Link>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} disabled={loggingOut} className="sp-logout-btn" type="button">
            <IconLogout />
            {loggingOut ? 'Keluar dari akun...' : 'Keluar dari Akun'}
          </button>

        </div>

        {/* ── BOTTOM NAV ── */}
        <nav className="sp-bottom-nav">
          <Link href="/siswa/dashboard" className="sp-nav-item">
            <IconHome />
            Beranda
          </Link>
          <Link href="/siswa/pendaftaran" className="sp-nav-item">
            <IconClipboard />
            Daftar
          </Link>
          <Link href="/siswa/verifikasi" className="sp-nav-item">
            <IconCheck />
            Status
          </Link>
          <Link href="/siswa/pembayaran" className="sp-nav-item">
            <IconPayment />
            Bayar
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