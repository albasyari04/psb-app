'use client'
// app/admin/profile/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconLayers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l9 4.5L12 11 3 6.5 12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12l9 4.5L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17l9 4.5L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconKey() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M11.5 11.5L20 3m-4 0h4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconCreditCard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M1 10h22" stroke="currentColor" strokeWidth="2" />
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
function IconVerify() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

// ── Verified badge ─────────────────────────────────────────────────────────────
function VerifiedBadge() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: 'rgba(124,58,237,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1.5px solid rgba(124,58,237,0.25)',
      flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.2L12 14l-4.8 2.5.9-5.2-3.8-3.7 5.3-.8L12 2z"
          fill="#7C3AED" />
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminProfilePage() {
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
    : 'AD'

  const photoSrc = previewUrl ?? (user as { avatar_url?: string } & typeof user)?.avatar_url ?? null

  const now = new Date()
  const lastLogin = now.toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' WIB'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadSuccess(false)
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

        .ap-root {
          max-width: 430px;
          margin: 0 auto;
          min-height: 100vh;
          background: #F3F4F8;
          position: relative;
          padding-bottom: 80px;
        }

        /* ── Header ── */
        .ap-header {
          background: linear-gradient(135deg, #4C1D95 0%, #5B21B6 40%, #6D28D9 100%);
          padding: 56px 20px 68px;
          position: relative;
          overflow: hidden;
        }
        .ap-header::before {
          content: '';
          position: absolute; inset: 0;
          background-image: url('/masjid.jpg');
          background-size: cover; background-position: center;
          opacity: 0.12;
        }
        .ap-header-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .ap-header-orb {
          position: absolute; border-radius: 50%;
          background: rgba(167,139,250,0.15);
          filter: blur(30px);
        }
        .ap-header-top {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .ap-header-title { color: #fff; font-size: 22px; font-weight: 700; line-height: 1.2; }
        .ap-header-sub { color: rgba(255,255,255,0.65); font-size: 13px; margin-top: 2px; }
        .ap-header-edit-btn {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
          color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px); transition: background 0.2s;
        }
        .ap-header-edit-btn:hover { background: rgba(255,255,255,0.25); }

        /* ── Profile card inside hero ── */
        .ap-hero-card {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(12px);
          display: flex; align-items: center; gap: 16px;
        }
        .ap-avatar-wrap { position: relative; flex-shrink: 0; }
        .ap-avatar-ring {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, #A78BFA, #7C3AED);
          padding: 3px;
        }
        .ap-avatar {
          width: 100%; height: 100%; border-radius: 50%;
          background: #EDE9FE;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }
        .ap-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .ap-avatar-initials { font-size: 28px; font-weight: 700; color: #5B21B6; }
        .ap-avatar-overlay {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(91,33,182,0.6);
          display: flex; align-items: center; justify-content: center;
        }
        .ap-avatar-spinner {
          width: 24px; height: 24px; border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ap-online-dot {
          position: absolute; bottom: 4px; right: 4px;
          width: 14px; height: 14px; border-radius: 50%;
          background: #10B981; border: 2px solid white;
        }
        .ap-camera-btn {
          position: absolute; bottom: -2px; right: -2px;
          width: 26px; height: 26px; border-radius: 50%;
          background: #7C3AED; border: 2px solid white;
          color: white; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .ap-file-input { display: none; }
        .ap-hero-info { flex: 1; min-width: 0; }
        .ap-hero-name { color: #fff; font-size: 20px; font-weight: 700; }
        .ap-hero-email { color: rgba(196,181,253,0.9); font-size: 13px; margin-top: 3px; }
        .ap-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 10px; padding: 5px 10px; border-radius: 20px;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.9); font-size: 11px; font-weight: 600;
        }
        .ap-hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #34D399;
        }

        /* ── Stats strip (floating) ── */
        .ap-float-zone {
          padding: 0 16px;
          margin-top: -52px;
          position: relative; z-index: 10;
        }
        .ap-stats-card {
          background: #fff;
          border-radius: 18px;
          padding: 16px 20px;
          display: flex; align-items: center;
          box-shadow: 0 4px 24px rgba(91,33,182,0.12);
          border: 1px solid rgba(91,33,182,0.06);
        }
        .ap-stat-item {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .ap-stat-divider {
          width: 1px; height: 36px; background: #E5E7EB;
        }
        .ap-stat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
        }
        .ap-stat-val { font-size: 13px; font-weight: 700; color: #1F2937; }
        .ap-stat-label { font-size: 11px; color: #9CA3AF; font-weight: 500; }

        /* ── Body ── */
        .ap-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

        /* ── Section title ── */
        .ap-section-title {
          font-size: 11px; font-weight: 700; color: #7C3AED;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 0 4px; margin-bottom: 2px;
        }

        /* ── Card ── */
        .ap-card {
          background: #fff; border-radius: 18px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.04);
          overflow: hidden;
        }

        /* ── Info rows ── */
        .ap-info-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px;
          border-bottom: 1px solid #F3F4F6;
        }
        .ap-info-row:last-child { border-bottom: none; }
        .ap-info-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ap-info-icon.violet { background: #EDE9FE; color: #7C3AED; }
        .ap-info-icon.blue   { background: #DBEAFE; color: #2563EB; }
        .ap-info-icon.green  { background: #D1FAE5; color: #059669; }
        .ap-info-icon.orange { background: #FEF3C7; color: #D97706; }
        .ap-info-icon.teal   { background: #CCFBF1; color: #0D9488; }
        .ap-info-icon.indigo { background: #E0E7FF; color: #4F46E5; }
        .ap-info-label { font-size: 12px; color: #9CA3AF; font-weight: 500; }
        .ap-info-value { font-size: 14px; color: #111827; font-weight: 600; margin-top: 1px; }
        .ap-info-value-right { margin-left: auto; text-align: right; }
        .ap-info-badge-admin {
          padding: 3px 12px; border-radius: 20px;
          background: #EDE9FE; color: #6D28D9;
          font-size: 12px; font-weight: 700;
        }
        .ap-info-badge-active {
          padding: 3px 12px; border-radius: 20px;
          background: #D1FAE5; color: #059669;
          font-size: 12px; font-weight: 700;
          border: 1px solid #6EE7B7;
        }

        /* ── Menu rows ── */
        .ap-menu-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px;
          border-bottom: 1px solid #F3F4F6;
          text-decoration: none; cursor: pointer;
          transition: background 0.15s;
        }
        .ap-menu-row:last-child { border-bottom: none; }
        .ap-menu-row:hover { background: #FAFAFA; }
        .ap-menu-title { font-size: 14px; font-weight: 600; color: #111827; }
        .ap-menu-sub { font-size: 12px; color: #9CA3AF; margin-top: 1px; }
        .ap-menu-chevron { margin-left: auto; color: #D1D5DB; flex-shrink: 0; }

        /* ── Logout ── */
        .ap-logout-btn {
          width: 100%; padding: 16px;
          background: #FFF5F5; border: 1px solid #FECACA;
          border-radius: 16px; color: #EF4444;
          font-size: 15px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer; transition: background 0.2s;
        }
        .ap-logout-btn:hover { background: #FEE2E2; }
        .ap-logout-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Upload feedback ── */
        .ap-upload-error {
          background: #FEF2F2; border: 1px solid #FECACA;
          border-radius: 10px; padding: 8px 14px;
          font-size: 12px; color: #EF4444;
          text-align: center; margin: -6px 16px 0;
        }
        .ap-upload-success {
          background: #F0FDF4; border: 1px solid #BBF7D0;
          border-radius: 10px; padding: 8px 14px;
          font-size: 12px; color: #059669;
          text-align: center; margin: -6px 16px 0;
        }

        /* ── Footer ── */
        .ap-footer { text-align: center; font-size: 11px; color: #9CA3AF; padding: 8px 0 4px; }

        /* ── Bottom Nav ── */
        .ap-bottom-nav {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 430px;
          background: #fff;
          border-top: 1px solid #F3F4F6;
          display: flex; align-items: center;
          padding: 8px 0 16px;
          z-index: 100;
          box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
        }
        .ap-nav-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; gap: 4px;
          text-decoration: none; color: #9CA3AF;
          font-size: 11px; font-weight: 500;
          padding: 4px 0;
          transition: color 0.15s;
        }
        .ap-nav-item.active { color: #7C3AED; }
        .ap-nav-item.active svg { stroke: #7C3AED; }
      `}</style>

      <div className="ap-root">

        {/* ── HEADER ── */}
        <div className="ap-header">
          <div className="ap-header-grid" />
          <div className="ap-header-orb" style={{ width: 180, height: 180, top: -60, right: -40 }} />
          <div className="ap-header-orb" style={{ width: 120, height: 120, bottom: 20, left: -30 }} />

          <div className="ap-header-top">
            <div>
              <div className="ap-header-title">Profil Saya</div>
              <div className="ap-header-sub">Panel Admin</div>
            </div>
            <Link href="/admin/profile/edit" className="ap-header-edit-btn">
              <IconEdit />
            </Link>
          </div>

          {/* Profile card */}
          <div className="ap-hero-card">
            <div className="ap-avatar-wrap">
              <div className="ap-avatar-ring">
                <div className="ap-avatar">
                  {photoSrc ? (
                    <Image src={photoSrc} alt={user?.name ?? 'Avatar'} width={80} height={80}
                      className="ap-avatar-img" unoptimized referrerPolicy="no-referrer" />
                  ) : (
                    <span className="ap-avatar-initials">{initials}</span>
                  )}
                  {uploading && (
                    <div className="ap-avatar-overlay">
                      <div className="ap-avatar-spinner" />
                    </div>
                  )}
                </div>
              </div>
              <div className="ap-online-dot" />
              <button className="ap-camera-btn" onClick={() => fileInputRef.current?.click()}
                disabled={uploading} aria-label="Ganti foto" type="button">
                <IconCamera />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*"
                className="ap-file-input" onChange={handleFileChange} />
            </div>

            <div className="ap-hero-info">
              <div className="ap-hero-name">{user?.name ?? 'Admin PSB'}</div>
              <div className="ap-hero-email">{user?.email ?? 'admin@psb.com'}</div>
              <div className="ap-hero-badge">
                <div className="ap-hero-badge-dot" />
                Admin · PSB 2025/2026
              </div>
            </div>

            <VerifiedBadge />
          </div>
        </div>

        {/* Upload feedback */}
        {uploadError && <div className="ap-upload-error">⚠️ {uploadError}</div>}
        {uploadSuccess && <div className="ap-upload-success">✅ Foto berhasil diperbarui!</div>}

        {/* ── STATS STRIP ── */}
        <div className="ap-float-zone">
          <div className="ap-stats-card">
            <div className="ap-stat-item">
              <div className="ap-stat-icon" style={{ background: '#EDE9FE' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="#7C3AED" strokeWidth="2" />
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="#7C3AED" strokeWidth="2" />
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="#7C3AED" strokeWidth="2" />
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="#7C3AED" strokeWidth="2" />
                </svg>
              </div>
              <div className="ap-stat-val">PSB</div>
              <div className="ap-stat-label">Sistem</div>
            </div>
            <div className="ap-stat-divider" />
            <div className="ap-stat-item">
              <div className="ap-stat-icon" style={{ background: '#DBEAFE' }}>
                <IconUser />
              </div>
              <div className="ap-stat-val">Admin</div>
              <div className="ap-stat-label">Peran</div>
            </div>
            <div className="ap-stat-divider" />
            <div className="ap-stat-item">
              <div className="ap-stat-icon" style={{ background: '#D1FAE5' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#059669" strokeWidth="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="ap-stat-val">2025/2026</div>
              <div className="ap-stat-label">Tahun Ajaran</div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="ap-body">

          {/* Informasi Akun */}
          <div className="ap-section-title">Informasi Akun</div>
          <div className="ap-card">
            <div className="ap-info-row">
              <div className="ap-info-icon violet"><IconUser /></div>
              <div>
                <div className="ap-info-label">Nama Lengkap</div>
                <div className="ap-info-value">{user?.name ?? 'Admin PSB'}</div>
              </div>
              <div className="ap-info-value-right ap-info-value" style={{ color: '#6B7280' }}>
                {user?.name ?? 'Admin PSB'}
              </div>
            </div>
            <div className="ap-info-row">
              <div className="ap-info-icon blue"><IconMail /></div>
              <div>
                <div className="ap-info-label">Email</div>
              </div>
              <div className="ap-info-value-right">
                <div className="ap-info-value">{user?.email ?? 'admin@psb.com'}</div>
              </div>
            </div>
            <div className="ap-info-row">
              <div className="ap-info-icon violet"><IconShield /></div>
              <div>
                <div className="ap-info-label">Peran</div>
              </div>
              <div className="ap-info-value-right">
                <span className="ap-info-badge-admin">Admin</span>
              </div>
            </div>
            <div className="ap-info-row">
              <div className="ap-info-icon indigo"><IconLayers /></div>
              <div>
                <div className="ap-info-label">Sistem</div>
              </div>
              <div className="ap-info-value-right">
                <div className="ap-info-value">PSB 2025/2026</div>
              </div>
            </div>
            <div className="ap-info-row">
              <div className="ap-info-icon orange"><IconClock /></div>
              <div>
                <div className="ap-info-label">Terakhir Login</div>
              </div>
              <div className="ap-info-value-right">
                <div className="ap-info-value" style={{ fontSize: 12 }}>{lastLogin}</div>
              </div>
            </div>
            <div className="ap-info-row">
              <div className="ap-info-icon green"><IconCheck /></div>
              <div>
                <div className="ap-info-label">Status Akun</div>
              </div>
              <div className="ap-info-value-right">
                <span className="ap-info-badge-active">Aktif</span>
              </div>
            </div>
          </div>

          {/* Pengaturan Akun */}
          <div className="ap-section-title">Pengaturan Akun</div>
          <div className="ap-card">
            <Link href="/admin/profile/edit" className="ap-menu-row">
              <div className="ap-info-icon violet"><IconEdit /></div>
              <div>
                <div className="ap-menu-title">Ubah Profil</div>
                <div className="ap-menu-sub">Perbarui informasi profil Anda</div>
              </div>
              <div className="ap-menu-chevron"><IconChevron /></div>
            </Link>
            <Link href="/admin/profile/password" className="ap-menu-row">
              <div className="ap-info-icon orange"><IconKey /></div>
              <div>
                <div className="ap-menu-title">Ubah Password</div>
                <div className="ap-menu-sub">Atur ulang password akun</div>
              </div>
              <div className="ap-menu-chevron"><IconChevron /></div>
            </Link>
            <Link href="/admin/settings/notifications" className="ap-menu-row">
              <div className="ap-info-icon green"><IconBell /></div>
              <div>
                <div className="ap-menu-title">Notifikasi</div>
                <div className="ap-menu-sub">Kelola preferensi notifikasi</div>
              </div>
              <div className="ap-menu-chevron"><IconChevron /></div>
            </Link>
            <Link href="/admin/settings/security" className="ap-menu-row">
              <div className="ap-info-icon" style={{ background: '#FEE2E2', color: '#EF4444' }}><IconLock /></div>
              <div>
                <div className="ap-menu-title">Keamanan</div>
                <div className="ap-menu-sub">Kelola keamanan akun Anda</div>
              </div>
              <div className="ap-menu-chevron"><IconChevron /></div>
            </Link>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} disabled={loggingOut} className="ap-logout-btn" type="button">
            <IconLogout />
            {loggingOut ? 'Keluar dari akun...' : 'Keluar dari Akun'}
          </button>

          <div className="ap-footer">PSB App v1.0 · Admin Panel</div>
        </div>

        {/* ── BOTTOM NAV ── */}
        <nav className="ap-bottom-nav">
          <Link href="/admin/dashboard" className="ap-nav-item">
            <IconHome />
            Beranda
          </Link>
          <Link href="/admin/pendaftar" className="ap-nav-item">
            <IconUsers />
            Pendaftar
          </Link>
          <Link href="/admin/verifikasi" className="ap-nav-item">
            <IconVerify />
            Verifikasi
          </Link>
          <Link href="/admin/pembayaran" className="ap-nav-item">
            <IconCreditCard />
            Pembayaran
          </Link>
          <Link href="/admin/profile" className="ap-nav-item active">
            <IconProfile />
            Profil
          </Link>
        </nav>

      </div>
    </>
  )
}