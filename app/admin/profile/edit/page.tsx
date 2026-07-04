'use client'
// app/admin/profile/edit/page.tsx
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'

function IconArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconCamera() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
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
function IconUserBig() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill="white" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="white" />
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
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconShieldCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AdminProfileEditPage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const user = session?.user
  const currentAvatar = (user as { avatar_url?: string } & typeof user)?.avatar_url ?? null

  const [name, setName] = useState(user?.name ?? '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const photoSrc = previewUrl ?? currentAvatar ?? null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    if (file.size > 2 * 1024 * 1024) { setError('Ukuran file maksimal 2 MB'); return }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Format file harus JPG, PNG, atau WebP'); return
    }
    setPreviewUrl(URL.createObjectURL(file))
    setPendingFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Nama tidak boleh kosong'); return }
    setError(null)
    setSaving(true)

    try {
      let avatarUrl: string | undefined

      // 1. Upload foto dulu jika ada file baru
      if (pendingFile) {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', pendingFile)
        const uploadRes = await fetch('/api/profile/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json() as { success?: boolean; avatar_url?: string; error?: string }
        setUploading(false)
        if (!uploadRes.ok || !uploadData.success) {
          setError(uploadData.error ?? 'Gagal upload foto')
          setSaving(false)
          return
        }
        avatarUrl = uploadData.avatar_url
      }

      // 2. Simpan nama (dan avatar_url jika ada)
      const body: { name: string; avatar_url?: string } = { name: name.trim() }
      if (avatarUrl) body.avatar_url = avatarUrl

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { success?: boolean; error?: string }

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Gagal menyimpan perubahan')
        setSaving(false)
        return
      }

      // 3. Update session (NextAuth JWT) — supaya avatar/nama di navbar dsb ikut berubah
      await update({ name: name.trim(), ...(avatarUrl ? { avatar_url: avatarUrl } : {}) })

      setSuccess(true)
      setPendingFile(null)

      // ✅ FIX: router.refresh() memaksa Next.js membuang client-side router
      // cache untuk halaman ini & halaman tujuan, supaya saat pindah ke
      // /admin/profile, halaman itu fetch ulang data terbaru dari
      // /api/admin/profile — bukan menampilkan versi lama yang sempat
      // di-cache sebelum edit ini disimpan.
      router.refresh()
      setTimeout(() => router.push('/admin/profile'), 1200)

    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F7F7FB; font-family: 'Segoe UI', system-ui, sans-serif; }

        .ep-root {
          max-width: 430px; margin: 0 auto; min-height: 100vh;
          background: #F7F7FB;
        }

        /* Header */
        .ep-header {
          background: #fff;
          padding: 18px 20px 16px;
          display: flex; align-items: center; gap: 12px;
          border-bottom: 1px solid #F1EEF9;
        }
        .ep-back-btn {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: #EDE9FE; border: none;
          color: #7C3AED; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .ep-back-btn:hover { background: #DDD6FE; }
        .ep-header-title { color: #111827; font-size: 19px; font-weight: 700; }
        .ep-header-sub { color: #9CA3AF; font-size: 12.5px; margin-top: 2px; }

        /* Main card */
        .ep-main-card {
          background: #fff; margin: 16px 16px 12px; border-radius: 20px;
          box-shadow: 0 2px 14px rgba(17,24,39,0.06);
          padding: 28px 20px 20px;
        }
        .ep-card-title { font-size: 21px; font-weight: 800; color: #111827; text-align: center; }
        .ep-card-sub { font-size: 13px; color: #9CA3AF; text-align: center; margin-top: 4px; margin-bottom: 26px; }

        /* Avatar */
        .ep-avatar-zone { display: flex; flex-direction: column; align-items: center; margin-bottom: 4px; }
        .ep-avatar {
          width: 100px; height: 100px; border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          box-shadow: 0 6px 16px rgba(124,58,237,0.28);
        }
        .ep-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .ep-avatar-initials { font-size: 30px; font-weight: 700; color: #fff; }
        .ep-camera-btn {
          position: absolute; bottom: -2px; right: -2px;
          width: 34px; height: 34px; border-radius: 50%;
          background: #7C3AED; border: 3px solid #fff;
          color: white; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25); transition: background 0.2s;
        }
        .ep-camera-btn:hover { background: #6D28D9; }
        .ep-file-input { display: none; }
        .ep-avatar-hint { margin-top: 12px; font-size: 12.5px; color: #9CA3AF; text-align: center; }
        .ep-avatar-hint span { color: #7C3AED; font-weight: 600; }
        .ep-preview-badge {
          position: absolute; top: -4px; right: -4px;
          background: #10B981; border: 2px solid white;
          border-radius: 50%; width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: white; font-weight: 700;
        }

        /* Field box (bordered group) */
        .ep-field-box {
          border: 1.5px solid #EDE9FE; border-radius: 16px;
          padding: 18px 16px; margin-top: 24px;
        }
        .ep-field-box-title {
          display: flex; align-items: center; gap: 7px;
          font-size: 13.5px; font-weight: 700; color: #7C3AED;
          margin-bottom: 18px;
        }

        .ep-field { margin-bottom: 18px; }
        .ep-field:last-child { margin-bottom: 0; }
        .ep-field-label { font-size: 13.5px; font-weight: 600; color: #111827; margin-bottom: 8px; }
        .ep-field-input-wrap { position: relative; }
        .ep-field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #9CA3AF; pointer-events: none;
          display: flex; align-items: center;
        }
        .ep-field-input {
          width: 100%; padding: 13px 14px 13px 42px;
          border: 1.5px solid #E5E7EB; border-radius: 12px;
          font-size: 14.5px; color: #111827; background: #F9FAFB;
          outline: none; transition: border-color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .ep-field-input:focus {
          border-color: #7C3AED; background: #fff;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }
        .ep-field-input:disabled {
          background: #F3F4F6; color: #9CA3AF; cursor: not-allowed;
        }
        .ep-field-hint { font-size: 11.5px; color: #9CA3AF; margin-top: 6px; }

        /* Error / Success */
        .ep-error {
          margin: 18px 0 0; padding: 12px 16px;
          background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px;
          font-size: 13px; color: #EF4444; display: flex; align-items: center; gap: 8px;
        }
        .ep-success {
          margin: 18px 0 0; padding: 12px 16px;
          background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px;
          font-size: 13px; color: #059669; display: flex; align-items: center; gap: 8px;
          font-weight: 600;
        }

        /* Buttons */
        .ep-save-btn {
          width: 100%; padding: 15px; margin-top: 22px;
          background: linear-gradient(135deg, #6D28D9, #7C3AED);
          border: none; border-radius: 14px;
          color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 14px rgba(124,58,237,0.32);
          transition: opacity 0.2s, transform 0.1s;
          font-family: inherit;
        }
        .ep-save-btn:hover { opacity: 0.92; transform: translateY(-1px); }
        .ep-save-btn:active { transform: translateY(0); }
        .ep-save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .ep-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ep-cancel-btn {
          width: 100%; padding: 13.5px; margin-top: 10px;
          background: #fff; border: 1.5px solid #E5E7EB; border-radius: 14px;
          color: #374151; font-size: 14.5px; font-weight: 600;
          cursor: pointer; transition: background 0.2s;
          font-family: inherit;
        }
        .ep-cancel-btn:hover { background: #F9FAFB; }

        /* Info Akun card */
        .ep-info-card {
          background: #fff; margin: 0 16px 16px; border-radius: 20px;
          box-shadow: 0 2px 14px rgba(17,24,39,0.06);
          padding: 20px;
        }
        .ep-info-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 14.5px; font-weight: 700; color: #111827;
          margin-bottom: 14px;
        }
        .ep-info-title svg { color: #7C3AED; }
        .ep-info-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; border-bottom: 1px solid #F3F4F6;
        }
        .ep-info-row:last-child { border-bottom: none; }
        .ep-info-key { font-size: 13.5px; color: #9CA3AF; }
        .ep-info-val { font-size: 13.5px; color: #111827; font-weight: 600; }
      `}</style>

      <div className="ep-root">
        {/* ── HEADER ── */}
        <div className="ep-header">
          <button onClick={() => router.back()} className="ep-back-btn" type="button">
            <IconArrowLeft />
          </button>
          <div>
            <div className="ep-header-title">Edit Profile</div>
            <div className="ep-header-sub">Perbarui informasi akun Anda</div>
          </div>
        </div>

        {/* ── MAIN CARD ── */}
        <div className="ep-main-card">
          <div className="ep-card-title">Edit Profil</div>
          <div className="ep-card-sub">Perbarui informasi akun Anda</div>

          {/* Avatar */}
          <div className="ep-avatar-zone">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div className="ep-avatar">
                {photoSrc ? (
                  <Image src={photoSrc} alt="Avatar" width={100} height={100}
                    className="ep-avatar-img" unoptimized referrerPolicy="no-referrer" />
                ) : (
                  <IconUserBig />
                )}
              </div>
              {previewUrl && <div className="ep-preview-badge">✓</div>}
              <button className="ep-camera-btn" onClick={() => fileInputRef.current?.click()}
                type="button" aria-label="Ganti foto">
                <IconCamera />
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                className="ep-file-input" onChange={handleFileChange} />
            </div>
            <p className="ep-avatar-hint">
              {previewUrl
                ? <><span>Foto baru dipilih</span> · simpan untuk menerapkan</>
                : <>Ketuk ikon kamera untuk <span>ganti foto</span></>
              }
            </p>
          </div>

          {/* Field box */}
          <div className="ep-field-box">
            <div className="ep-field-box-title">
              <IconUser /> Informasi Pribadi
            </div>

            {/* Nama */}
            <div className="ep-field">
              <div className="ep-field-label">Nama Lengkap</div>
              <div className="ep-field-input-wrap">
                <div className="ep-field-icon"><IconUser /></div>
                <input
                  className="ep-field-input"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null) }}
                  placeholder="Masukkan nama lengkap"
                  maxLength={80}
                  disabled={saving}
                  autoComplete="name"
                />
              </div>
              <div className="ep-field-hint">{name.length}/80 karakter</div>
            </div>

            {/* Email (readonly) */}
            <div className="ep-field">
              <div className="ep-field-label">Email</div>
              <div className="ep-field-input-wrap">
                <div className="ep-field-icon"><IconMail /></div>
                <input
                  className="ep-field-input"
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  readOnly
                />
              </div>
              <div className="ep-field-hint">Email tidak dapat diubah</div>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="ep-error">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="ep-success">
              <IconCheck /> Perubahan berhasil disimpan! Mengalihkan...
            </div>
          )}

          {/* Buttons */}
          <button
            className="ep-save-btn"
            onClick={handleSave}
            disabled={saving || success}
            type="button"
          >
            {saving ? (
              <><div className="ep-spinner" />{uploading ? 'Mengupload foto...' : 'Menyimpan...'}</>
            ) : success ? (
              <><IconCheck /> Tersimpan!</>
            ) : (
              <><IconCheck /> Simpan Perubahan</>
            )}
          </button>
          <button
            className="ep-cancel-btn"
            onClick={() => router.push('/admin/profile')}
            type="button"
            disabled={saving}
          >
            Batal
          </button>
        </div>

        {/* ── INFO AKUN CARD ── */}
        <div className="ep-info-card">
          <div className="ep-info-title">
            <IconShieldCheck /> Informasi Akun
          </div>
          <div className="ep-info-row">
            <span className="ep-info-key">Peran</span>
            <span className="ep-info-val">Admin</span>
          </div>
          <div className="ep-info-row">
            <span className="ep-info-key">Sistem</span>
            <span className="ep-info-val">PSB 2025/2026</span>
          </div>
          <div className="ep-info-row">
            <span className="ep-info-key">Status</span>
            <span className="ep-info-val" style={{ color: '#059669' }}>Aktif ✓</span>
          </div>
        </div>

        {/* Bottom spacing (untuk bottom nav bar dari layout) */}
        <div style={{ height: 16 }} />
      </div>
    </>
  )
}