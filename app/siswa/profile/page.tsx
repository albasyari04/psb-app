'use client'
// app/siswa/profile/page.tsx
import '@/app/style/siswa.css'
import Image         from 'next/image'
import { useState, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link          from 'next/link'

export default function ProfilePage() {
  const { data: session, update } = useSession()

  const [loggingOut,   setLoggingOut]   = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [uploadError,  setUploadError]  = useState<string | null>(null)
  const [uploadSuccess,setUploadSuccess]= useState(false)
  const [previewUrl,   setPreviewUrl]   = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const user     = session?.user
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  // ── Tampilkan preview lokal sebelum upload ────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploadSuccess(false)

    // Validasi di sisi klien
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 2 MB')
      return
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Format file harus JPG, PNG, atau WebP')
      return
    }

    // Tampilkan preview lokal
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Langsung upload
    handleUpload(file)
  }

  // ── Upload ke server ──────────────────────────────────────────────────────
  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res  = await fetch('/api/profile/upload', { method: 'POST', body: formData })
      const data = await res.json() as { success?: boolean; avatar_url?: string; error?: string }

      if (!res.ok || !data.success) {
        setUploadError(data.error ?? 'Gagal mengupload foto')
        setPreviewUrl(null)
        return
      }

      // Update session NextAuth agar avatar langsung berubah tanpa reload
      await update({ avatar_url: data.avatar_url })
      setUploadSuccess(true)

      // Reset success message setelah 3 detik
      setTimeout(() => setUploadSuccess(false), 3000)

    } catch {
      setUploadError('Terjadi kesalahan jaringan')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      // Reset input agar bisa pilih file yang sama lagi
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut({ callbackUrl: '/login' })
  }

  // Tentukan sumber foto: preview lokal → session → null
  const photoSrc = previewUrl ?? user?.avatar_url ?? null

  return (
    <div className="app-shell sp-bg">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div className="sp-hero">
        <div className="sp-hero-grid" />
        <div className="sp-hero-orb-1" />
        <div className="sp-hero-orb-2" />
        <div className="sp-hero-orb-3" />

        <div className="sp-hero-content">

          {/* ── Avatar + tombol upload ── */}
          <div className="sp-avatar-wrap">
            <div className="sp-avatar-ring">
              <div className="sp-avatar">
                {photoSrc ? (
                  <Image
                    src={photoSrc}
                    alt={user?.name ?? 'Avatar'}
                    width={80}
                    height={80}
                    className="sp-avatar-img"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  <span className="sp-avatar-initials">{initials}</span>
                )}

                {/* Overlay loading saat upload */}
                {uploading && (
                  <div className="sp-avatar-overlay">
                    <div className="sp-avatar-spinner" />
                  </div>
                )}
              </div>
            </div>

            {/* Tombol kamera */}
            <button
              className="sp-camera-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Ganti foto profil"
              type="button"
            >
              <CameraIcon />
            </button>

            {/* Input file tersembunyi */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="sp-file-input"
              onChange={handleFileChange}
              aria-label="Upload foto profil"
            />
          </div>

          {/* Feedback upload */}
          {uploadError && (
            <div className="sp-upload-error">
              ⚠️ {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="sp-upload-success">
              ✅ Foto berhasil diperbarui!
            </div>
          )}
          {uploading && (
            <p className="sp-upload-hint">Sedang mengupload...</p>
          )}

          {/* Name & Info */}
          <div>
            <h2 className="sp-hero-name">{user?.name ?? '-'}</h2>
            <p className="sp-hero-email">{user?.email ?? '-'}</p>
            <div className="sp-hero-badge">
              <div className="sp-hero-badge-dot" />
              SISWA AKTIF
            </div>
          </div>

        </div>
      </div>

      {/* ══ FLOATING STATS STRIP ═════════════════════════════════════════════ */}
      <div className="sp-float-zone">
        <div className="sp-stats-card">
          <div className="sp-stat-item">
            <span className="sp-stat-val">2025</span>
            <span className="sp-stat-label">T.A.</span>
          </div>
          <div className="sp-stat-item">
            <span className="sp-stat-val">SMA</span>
            <span className="sp-stat-label">Jenjang</span>
          </div>
          <div className="sp-stat-item">
            <span className="sp-stat-val">PSB</span>
            <span className="sp-stat-label">Program</span>
          </div>
        </div>
      </div>

      {/* ══ BODY ══════════════════════════════════════════════════════════════ */}
      <div className="sp-body">

        {/* ── Upload hint ── */}
        <div className="sp-upload-hint-card">
          <span className="sp-upload-hint-icon">📸</span>
          <div>
            <p className="sp-upload-hint-title">Foto Profil</p>
            <p className="sp-upload-hint-sub">
              Ketuk ikon kamera pada foto untuk menggantinya.
              Maks. 2 MB · JPG, PNG, WebP
            </p>
          </div>
        </div>

        {/* ── Informasi Akun ── */}
        <div className="sp-card">
          <div className="sp-card-header">
            <div className="sp-card-header-dot blue" />
            <p className="sp-card-header-title">Informasi Akun</p>
          </div>

          <div className="sp-info-row">
            <div className="sp-info-icon blue">👤</div>
            <div className="sp-info-text">
              <p className="sp-info-label">Nama Lengkap</p>
              <p className="sp-info-value">{user?.name ?? '-'}</p>
            </div>
          </div>

          <div className="sp-info-row">
            <div className="sp-info-icon violet">✉️</div>
            <div className="sp-info-text">
              <p className="sp-info-label">Email</p>
              <p className="sp-info-value">{user?.email ?? '-'}</p>
            </div>
          </div>

          <div className="sp-info-row">
            <div className="sp-info-icon green">🎓</div>
            <div className="sp-info-text">
              <p className="sp-info-label">Role</p>
              <p className="sp-info-value">Siswa</p>
            </div>
          </div>
        </div>

        {/* ── Menu Navigasi ── */}
        <div className="sp-card">
          <div className="sp-card-header">
            <div className="sp-card-header-dot violet" />
            <p className="sp-card-header-title">Navigasi</p>
          </div>

          <Link href="/siswa/dashboard" className="sp-menu-row">
            <div className="sp-menu-icon indigo">🏠</div>
            <div className="sp-menu-text">
              <p className="sp-menu-title">Beranda</p>
              <p className="sp-menu-sub">Kembali ke dashboard utama</p>
            </div>
            <span className="sp-menu-chevron">›</span>
          </Link>

          <Link href="/siswa/pendaftaran" className="sp-menu-row">
            <div className="sp-menu-icon blue">📝</div>
            <div className="sp-menu-text">
              <p className="sp-menu-title">Formulir Pendaftaran</p>
              <p className="sp-menu-sub">Isi atau edit data pendaftaran</p>
            </div>
            <span className="sp-menu-chevron">›</span>
          </Link>

          <Link href="/siswa/status" className="sp-menu-row">
            <div className="sp-menu-icon teal">📊</div>
            <div className="sp-menu-text">
              <p className="sp-menu-title">Status Pendaftaran</p>
              <p className="sp-menu-sub">Pantau progress proses seleksi</p>
            </div>
            <span className="sp-menu-chevron">›</span>
          </Link>
        </div>

        {/* ── Logout ── */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="sp-logout-btn"
          type="button"
        >
          {loggingOut ? (
            <>
              <span className="sp-logout-spinner">⏳</span>
              <span>Keluar dari akun...</span>
            </>
          ) : (
            <>
              <span>🚪</span>
              <span>Keluar dari Akun</span>
            </>
          )}
        </button>

        <p className="sp-footer-note">PSB App · Tahun Ajaran 2025/2026</p>

      </div>
    </div>
  )
}

// ── Camera SVG Icon ───────────────────────────────────────────────────────────
function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle
        cx="12" cy="13" r="4"
        stroke="currentColor" strokeWidth="2"
      />
    </svg>
  )
}