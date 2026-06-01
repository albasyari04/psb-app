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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD'

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

      // 3. Update session
      await update({ name: name.trim(), ...(avatarUrl ? { avatar_url: avatarUrl } : {}) })

      setSuccess(true)
      setPendingFile(null)
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
        body { background: #F3F4F8; font-family: 'Segoe UI', system-ui, sans-serif; }

        .ep-root {
          max-width: 430px; margin: 0 auto; min-height: 100vh;
          background: #F3F4F8;
        }

        /* Header */
        .ep-header {
          background: linear-gradient(135deg, #4C1D95 0%, #5B21B6 40%, #6D28D9 100%);
          padding: 56px 20px 100px;
          position: relative; overflow: hidden;
        }
        .ep-header-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .ep-header-orb {
          position: absolute; border-radius: 50%;
          background: rgba(167,139,250,0.15); filter: blur(30px);
        }
        .ep-header-top {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 12px; margin-bottom: 32px;
        }
        .ep-back-btn {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
          color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px); transition: background 0.2s;
          text-decoration: none;
        }
        .ep-back-btn:hover { background: rgba(255,255,255,0.25); }
        .ep-header-title { color: #fff; font-size: 20px; font-weight: 700; }
        .ep-header-sub { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 2px; }

        /* Avatar area (floating center) */
        .ep-avatar-zone {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
        }
        .ep-avatar-ring {
          width: 96px; height: 96px; border-radius: 50%;
          background: linear-gradient(135deg, #A78BFA, #7C3AED); padding: 3px;
        }
        .ep-avatar {
          width: 100%; height: 100%; border-radius: 50%;
          background: #EDE9FE; display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }
        .ep-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .ep-avatar-initials { font-size: 32px; font-weight: 700; color: #5B21B6; }
        .ep-camera-btn {
          position: absolute; bottom: 0; right: 0;
          width: 32px; height: 32px; border-radius: 50%;
          background: #7C3AED; border: 2.5px solid white;
          color: white; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: background 0.2s;
        }
        .ep-camera-btn:hover { background: #6D28D9; }
        .ep-file-input { display: none; }
        .ep-avatar-hint {
          margin-top: 10px; font-size: 12px; color: rgba(255,255,255,0.7); text-align: center;
        }
        .ep-avatar-hint span { color: rgba(167,139,250,0.9); font-weight: 600; }

        /* Float card */
        .ep-float-zone { padding: 0 16px; margin-top: -36px; position: relative; z-index: 10; }
        .ep-form-card {
          background: #fff; border-radius: 20px;
          box-shadow: 0 4px 24px rgba(91,33,182,0.12);
          border: 1px solid rgba(91,33,182,0.06);
          overflow: hidden;
        }

        /* Form fields */
        .ep-field-group { padding: 20px 20px 0; }
        .ep-field { margin-bottom: 20px; }
        .ep-field-label {
          font-size: 12px; font-weight: 700; color: #7C3AED;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;
          display: flex; align-items: center; gap: 6px;
        }
        .ep-field-input-wrap { position: relative; }
        .ep-field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #9CA3AF; pointer-events: none;
          display: flex; align-items: center;
        }
        .ep-field-input {
          width: 100%; padding: 14px 14px 14px 44px;
          border: 1.5px solid #E5E7EB; border-radius: 12px;
          font-size: 15px; color: #111827; background: #FAFAFA;
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
        .ep-field-hint { font-size: 11px; color: #9CA3AF; margin-top: 6px; }

        /* Error / Success */
        .ep-error {
          margin: 0 20px 16px; padding: 12px 16px;
          background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px;
          font-size: 13px; color: #EF4444; display: flex; align-items: center; gap: 8px;
        }
        .ep-success {
          margin: 0 20px 16px; padding: 12px 16px;
          background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px;
          font-size: 13px; color: #059669; display: flex; align-items: center; gap: 8px;
          font-weight: 600;
        }

        /* Save button */
        .ep-save-section { padding: 0 20px 20px; }
        .ep-save-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #5B21B6, #7C3AED);
          border: none; border-radius: 14px;
          color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.35);
          transition: opacity 0.2s, transform 0.1s;
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

        /* Divider */
        .ep-divider { height: 1px; background: #F3F4F6; margin: 4px 20px 20px; }

        /* Cancel */
        .ep-cancel-btn {
          width: 100%; padding: 13px;
          background: transparent; border: 1.5px solid #E5E7EB; border-radius: 14px;
          color: #6B7280; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: background 0.2s; margin-top: 12px;
          font-family: inherit;
        }
        .ep-cancel-btn:hover { background: #F9FAFB; }

        /* Info section */
        .ep-info-section { padding: 20px; border-top: 1px solid #F3F4F6; }
        .ep-info-title {
          font-size: 11px; font-weight: 700; color: #9CA3AF;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px;
        }
        .ep-info-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 0; border-bottom: 1px solid #F9FAFB;
        }
        .ep-info-row:last-child { border-bottom: none; }
        .ep-info-key { font-size: 13px; color: #9CA3AF; }
        .ep-info-val { font-size: 13px; color: #374151; font-weight: 600; }

        /* Preview badge */
        .ep-preview-badge {
          position: absolute; top: -6px; right: -6px;
          background: #10B981; border: 2px solid white;
          border-radius: 50%; width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: white; font-weight: 700;
        }
      `}</style>

      <div className="ep-root">
        {/* ── HEADER ── */}
        <div className="ep-header">
          <div className="ep-header-grid" />
          <div className="ep-header-orb" style={{ width: 200, height: 200, top: -80, right: -60 }} />
          <div className="ep-header-orb" style={{ width: 120, height: 120, bottom: 40, left: -40 }} />

          <div className="ep-header-top">
            <button onClick={() => router.back()} className="ep-back-btn" type="button">
              <IconArrowLeft />
            </button>
            <div>
              <div className="ep-header-title">Ubah Profil</div>
              <div className="ep-header-sub">Perbarui informasi akun Anda</div>
            </div>
          </div>

          {/* Avatar */}
          <div className="ep-avatar-zone">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div className="ep-avatar-ring">
                <div className="ep-avatar">
                  {photoSrc ? (
                    <Image src={photoSrc} alt="Avatar" width={96} height={96}
                      className="ep-avatar-img" unoptimized referrerPolicy="no-referrer" />
                  ) : (
                    <span className="ep-avatar-initials">{initials}</span>
                  )}
                </div>
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
        </div>

        {/* ── FORM CARD ── */}
        <div className="ep-float-zone">
          <div className="ep-form-card">

            <div className="ep-field-group">
              {/* Nama */}
              <div className="ep-field">
                <div className="ep-field-label">
                  <IconUser /> Nama Lengkap
                </div>
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
                  <div className="ep-field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
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
            <div className="ep-save-section">
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

            {/* Info readonly */}
            <div className="ep-info-section">
              <div className="ep-info-title">Informasi Akun</div>
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

          </div>
        </div>

        {/* Bottom spacing */}
        <div style={{ height: 32 }} />
      </div>
    </>
  )
}