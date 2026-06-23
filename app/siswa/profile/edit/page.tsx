'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────
interface ProfileData {
  name: string
  email: string
  avatar_url: string | null
}

type ToastType = 'success' | 'error'
interface Toast {
  type: ToastType
  message: string
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────
export default function EditProfilePage() {
  const router = useRouter()
  const { status, update: updateSession } = useSession()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [nameError, setNameError] = useState<string | null>(null)

  // ── Toast auto-dismiss ──────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // ── Fetch profil saat mount ─────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/siswa/profile')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memuat profil')
      }

      const profile: ProfileData = data.profile
      setName(profile.name ?? '')
      setEmail(profile.email ?? '')
      setAvatarUrl(profile.avatar_url ?? null)
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal memuat data profil',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
    } else if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, fetchProfile, router])

  // ── Handle pilih foto ───────────────────────────────────────────────────
  const handlePickPhoto = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setToast({ type: 'error', message: 'Format foto harus JPG, PNG, atau WebP' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Ukuran foto maksimal 2 MB' })
      return
    }

    // Preview instan
    const localPreview = URL.createObjectURL(file)
    setAvatarPreview(localPreview)

    try {
      setUploadingPhoto(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/siswa/profile/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah foto')
      }

      setAvatarUrl(data.avatar_url)
      setToast({ type: 'success', message: 'Foto profil berhasil diperbarui' })

      // Sinkronkan foto baru ke session NextAuth (untuk navbar dsb)
      await updateSession?.({ avatar_url: data.avatar_url })
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal mengunggah foto',
      })
      setAvatarPreview(null)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Handle simpan data ──────────────────────────────────────────────────
  const validate = () => {
    if (!name.trim()) {
      setNameError('Nama lengkap wajib diisi')
      return false
    }
    if (name.trim().length < 3) {
      setNameError('Nama minimal 3 karakter')
      return false
    }
    setNameError(null)
    return true
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setSaving(true)
      const res = await fetch('/api/siswa/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan perubahan')
      }

      setToast({ type: 'success', message: 'Profil berhasil disimpan' })
      await updateSession?.({ name: name.trim() })
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal menyimpan perubahan',
      })
    } finally {
      setSaving(false)
    }
  }

  const displayedAvatar = avatarPreview || avatarUrl
  const initials = (name || email || 'S')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'S'

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.hero}>
          <div style={styles.heroMesh} />
        </div>
        <div style={{ ...styles.container, ...styles.loadingContainer }}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Memuat profil…</p>
        </div>
        <style>{globalCss}</style>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* ── HERO BANNER ──────────────────────────────────────────────── */}
      <div style={styles.hero}>
        <div style={styles.heroMesh} />
        <button
          onClick={() => router.back()}
          style={styles.backButton}
          aria-label="Kembali"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div style={styles.heroLabelRow}>
          <span style={styles.heroEyebrow}>Pengaturan Akun</span>
        </div>
        <h1 style={styles.heroTitle}>Edit Profil</h1>
        <p style={styles.heroSubtitle}>Perbarui foto dan informasi pribadimu</p>

        {/* Avatar signature element — overlap antara hero & card */}
        <div style={styles.avatarWrap}>
          <div style={styles.avatarRing}>
            <div style={styles.avatarInner}>
              {displayedAvatar ? (
                <Image
                  src={displayedAvatar}
                  alt="Foto profil"
                  width={96}
                  height={96}
                  style={styles.avatarImg}
                />
              ) : (
                <span style={styles.avatarInitials}>{initials}</span>
              )}
              {uploadingPhoto && (
                <div style={styles.avatarUploadOverlay}>
                  <div style={styles.avatarSpinner} />
                </div>
              )}
            </div>
            <button
              onClick={handlePickPhoto}
              style={styles.cameraButton}
              aria-label="Ganti foto profil"
              disabled={uploadingPhoto}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 8h2.5l1.3-2h8.4l1.3 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="13.5" r="3.2" stroke="white" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* ── FORM CARD ────────────────────────────────────────────────── */}
      <div style={styles.container}>
        <form onSubmit={handleSave} style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconBadge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="7" r="4" stroke="#6366F1" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h2 style={styles.cardTitle}>Informasi Pribadi</h2>
              <p style={styles.cardSubtitle}>Data ini akan tampil di seluruh portal siswa</p>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="name" style={styles.label}>
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(null)
              }}
              placeholder="Masukkan nama lengkap"
              style={{
                ...styles.input,
                ...(nameError ? styles.inputError : {}),
              }}
            />
            {nameError && <span style={styles.errorText}>{nameError}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <div style={styles.inputDisabledWrap}>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                style={styles.inputDisabled}
              />
              <span style={styles.lockIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="#94A3B8" strokeWidth="1.8" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#94A3B8" strokeWidth="1.8" />
                </svg>
              </span>
            </div>
            <span style={styles.helperText}>Email tidak dapat diubah. Hubungi admin jika perlu mengganti.</span>
          </div>

          <button type="submit" disabled={saving} style={styles.submitButton}>
            {saving ? (
              <>
                <span style={styles.btnSpinner} />
                Menyimpan…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Simpan Perubahan
              </>
            )}
          </button>
        </form>

        <p style={styles.footerNote}>
          Foto profil maksimal 2&nbsp;MB · format JPG, PNG, atau WebP
        </p>
      </div>

      {/* ── TOAST ────────────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            ...(toast.type === 'success' ? styles.toastSuccess : styles.toastError),
          }}
        >
          {toast.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
              <path d="M8.5 12.5l2.2 2.2 4.8-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
              <path d="M12 8v5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="white" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <style>{globalCss}</style>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Global CSS (keyframes — tidak bisa lewat inline style)
// ────────────────────────────────────────────────────────────────────────────
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  input:focus { outline: none; border-color: #6366F1 !important; box-shadow: 0 0 0 4px rgba(99,102,241,0.12) !important; }
  input::placeholder { color: #94A3B8; }
`

// ────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#F8FAFC',
    paddingBottom: 48,
  },
  hero: {
    position: 'relative',
    background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 55%, #818CF8 100%)',
    paddingTop: 28,
    paddingBottom: 76,
    paddingLeft: 20,
    paddingRight: 20,
    overflow: 'hidden',
    maxWidth: 480,
    margin: '0 auto',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroMesh: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.18) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(255,255,255,0.12) 0%, transparent 40%)',
    pointerEvents: 'none',
  },
  backButton: {
    position: 'relative',
    zIndex: 2,
    width: 38,
    height: 38,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.16)',
    border: '1px solid rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginBottom: 18,
    backdropFilter: 'blur(6px)',
  },
  heroLabelRow: { position: 'relative', zIndex: 2 },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.75)',
  },
  heroTitle: {
    position: 'relative',
    zIndex: 2,
    fontSize: 28,
    fontWeight: 800,
    color: '#FFFFFF',
    margin: '6px 0 4px',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    position: 'relative',
    zIndex: 2,
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
  },
  avatarWrap: {
    position: 'absolute',
    bottom: -44,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 3,
  },
  avatarRing: {
    position: 'relative',
    width: 112,
    height: 112,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #C7D2FE, #6366F1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(67,56,202,0.35)',
    padding: 4,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: '#EEF2FF',
    border: '3px solid #FFFFFF',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarInitials: {
    fontSize: 34,
    fontWeight: 800,
    color: '#4338CA',
  },
  avatarUploadOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(15,23,42,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSpinner: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.35)',
    borderTopColor: '#FFFFFF',
    animation: 'spin 0.8s linear infinite',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: '#4338CA',
    border: '3px solid #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(67,56,202,0.4)',
  },
  container: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '0 20px',
    marginTop: 64,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: 14,
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '3px solid #E2E8F0',
    borderTopColor: '#6366F1',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#64748B',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 1px 3px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.06)',
    border: '1px solid #F1F5F9',
    animation: 'fadeIn 0.4s ease',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 22,
  },
  cardIconBadge: {
    width: 36,
    height: 36,
    minWidth: 36,
    borderRadius: 10,
    background: '#EEF2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0F172A',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: 12.5,
    fontWeight: 500,
    color: '#94A3B8',
    margin: '2px 0 0',
  },
  fieldGroup: {
    marginBottom: 18,
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 7,
  },
  input: {
    height: 46,
    borderRadius: 12,
    border: '1.5px solid #E2E8F0',
    padding: '0 14px',
    fontSize: 14.5,
    fontWeight: 500,
    color: '#0F172A',
    background: '#FFFFFF',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  inputError: {
    borderColor: '#FCA5A5',
  },
  inputDisabledWrap: {
    position: 'relative',
  },
  inputDisabled: {
    height: 46,
    width: '100%',
    borderRadius: 12,
    border: '1.5px solid #E2E8F0',
    padding: '0 40px 0 14px',
    fontSize: 14.5,
    fontWeight: 500,
    color: '#94A3B8',
    background: '#F8FAFC',
    cursor: 'not-allowed',
    boxSizing: 'border-box',
  },
  lockIcon: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
  },
  errorText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#EF4444',
    marginTop: 6,
  },
  helperText: {
    fontSize: 11.5,
    fontWeight: 500,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 1.4,
  },
  submitButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg, #4338CA, #6366F1)',
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    marginTop: 6,
    boxShadow: '0 8px 20px rgba(67,56,202,0.28)',
  },
  btnSpinner: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2.5px solid rgba(255,255,255,0.4)',
    borderTopColor: '#FFFFFF',
    animation: 'spin 0.7s linear infinite',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: 500,
    color: '#94A3B8',
    marginTop: 16,
  },
  toast: {
    position: 'fixed',
    bottom: 28,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '13px 20px',
    borderRadius: 14,
    fontSize: 13.5,
    fontWeight: 600,
    color: '#FFFFFF',
    boxShadow: '0 10px 28px rgba(15,23,42,0.22)',
    zIndex: 50,
    animation: 'slideUp 0.3s ease',
    maxWidth: '90%',
  },
  toastSuccess: {
    background: '#16A34A',
  },
  toastError: {
    background: '#DC2626',
  },
}