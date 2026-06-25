'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icon Components
// ─────────────────────────────────────────────────────────────────────────────

/** Chevron kiri untuk tombol back */
const IconChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 18l-6-6 6-6"
      stroke="#16A34A"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/** Gear / Settings */
const IconGear = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="#16A34A" strokeWidth="1.9" />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke="#16A34A"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/** User / person */
const IconUser = ({ color = '#16A34A' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.9" />
  </svg>
)

/** Envelope / email */
const IconMail = ({ color = '#16A34A' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.9" />
    <path d="M2 8l10 6 10-6" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
  </svg>
)

/** Padlock */
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="#94A3B8" strokeWidth="1.8" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

/** Checkmark */
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 13l4 4L19 7"
      stroke="white"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/** Camera */
const IconCamera = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke="white"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2" />
  </svg>
)

/** Image placeholder */
const IconImagePlaceholder = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#16A34A" strokeWidth="1.8" />
    <circle cx="8.5" cy="8.5" r="1.5" stroke="#16A34A" strokeWidth="1.8" />
    <path
      d="M21 15l-5-5L5 21"
      stroke="#16A34A"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// ── Bottom nav icons ──────────────────────────────────────────────────────────
const IconHome = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke={active ? '#16A34A' : '#94A3B8'}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 22V12h6v10"
      stroke={active ? '#16A34A' : '#94A3B8'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconClipboard = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect
      x="5" y="3" width="14" height="18" rx="2"
      stroke={active ? '#16A34A' : '#94A3B8'}
      strokeWidth="1.8"
    />
    <path
      d="M9 3h6v2H9z"
      stroke={active ? '#16A34A' : '#94A3B8'}
      strokeWidth="1.8"
    />
    <path
      d="M9 10h6M9 14h4"
      stroke={active ? '#16A34A' : '#94A3B8'}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const IconCard = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect
      x="2" y="5" width="20" height="14" rx="2"
      stroke={active ? '#16A34A' : '#94A3B8'}
      strokeWidth="1.8"
    />
    <path
      d="M2 10h20"
      stroke={active ? '#16A34A' : '#94A3B8'}
      strokeWidth="1.8"
    />
    <path
      d="M6 15h4"
      stroke={active ? '#16A34A' : '#94A3B8'}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const IconBarChart = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 20V10M12 20V4M6 20v-6"
      stroke={active ? '#16A34A' : '#94A3B8'}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const IconProfileNav = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12" cy="8" r="4"
      stroke={active ? '#16A34A' : '#94A3B8'}
      strokeWidth="1.8"
    />
    <path
      d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
      stroke={active ? '#16A34A' : '#94A3B8'}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────
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
  const [nameFocused, setNameFocused] = useState(false)

  // ── Toast auto-dismiss ────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // ── Fetch profil ──────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/siswa/profile')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memuat profil')
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
    if (status === 'authenticated') fetchProfile()
    else if (status === 'unauthenticated') router.replace('/login')
  }, [status, fetchProfile, router])

  // ── Upload foto ───────────────────────────────────────────────────────────
  const handlePickPhoto = () => fileInputRef.current?.click()

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setToast({ type: 'error', message: 'Format foto harus JPG, PNG, atau WebP' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Ukuran foto maksimal 2 MB' })
      return
    }

    setAvatarPreview(URL.createObjectURL(file))

    try {
      setUploadingPhoto(true)
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/siswa/profile/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah foto')
      setAvatarUrl(data.avatar_url)
      setToast({ type: 'success', message: 'Foto profil berhasil diperbarui' })
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

  // ── Simpan perubahan ──────────────────────────────────────────────────────
  const validate = () => {
    if (!name.trim()) { setNameError('Nama lengkap wajib diisi'); return false }
    if (name.trim().length < 3) { setNameError('Nama minimal 3 karakter'); return false }
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
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan perubahan')
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

  // ── Computed ──────────────────────────────────────────────────────────────
  const displayedAvatar = avatarPreview || avatarUrl
  const initials =
    (name || email || 'S')
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'S'

  // ── Bottom nav items ──────────────────────────────────────────────────────
  const navItems = [
    { label: 'Beranda', icon: <IconHome />, href: '/dashboard' },
    { label: 'Daftar', icon: <IconClipboard />, href: '/dashboard/formulir' },
    { label: 'Bayar', icon: <IconCard />, href: '/dashboard/bayar' },
    { label: 'Status', icon: <IconBarChart />, href: '/dashboard/status' },
    { label: 'Profil', icon: <IconProfileNav active />, href: '/dashboard/profil', active: true },
  ]

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.loadingWrap}>
          <div style={s.spinner} />
          <p style={s.loadingText}>Memuat profil…</p>
        </div>
        <style>{globalCss}</style>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>

      {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
      <div style={s.header}>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={s.iconBtn}
          type="button"
          aria-label="Kembali"
        >
          <IconChevronLeft />
        </button>

        {/* Title */}
        <div style={s.headerCenter}>
          <h1 style={s.headerTitle}>Edit Profil</h1>
          <p style={s.headerSub}>Perbarui foto dan informasi pribadimu</p>
        </div>

        {/* Settings button */}
        <button
          onClick={() => router.push('/dashboard/pengaturan')}
          style={s.iconBtn}
          type="button"
          aria-label="Pengaturan"
        >
          <IconGear />
        </button>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div style={s.body}>

        {/* ── FORM CARD ─────────────────────────────────────────────────── */}
        <div style={s.card}>

          {/* Card header: icon + title */}
          <div style={s.cardHeader}>
            <div style={s.cardIconWrap}>
              <IconUser />
            </div>
            <div>
              <h2 style={s.cardTitle}>Informasi Pribadi</h2>
              <p style={s.cardSubtitle}>Data ini akan tampil di seluruh portal siswa</p>
            </div>
          </div>

          <form onSubmit={handleSave} noValidate>

            {/* Nama Lengkap */}
            <div style={s.fieldGroup}>
              <label htmlFor="name" style={s.fieldLabel}>Nama Lengkap</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>
                  <IconUser color={nameFocused ? '#16A34A' : '#94A3B8'} />
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (nameError) setNameError(null) }}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="Masukkan nama lengkap"
                  style={{
                    ...s.input,
                    ...(nameError ? s.inputErr : {}),
                    ...(nameFocused ? s.inputFocused : {}),
                  }}
                  autoComplete="name"
                />
              </div>
              {nameError && <span style={s.errorText}>{nameError}</span>}
            </div>

            {/* Email */}
            <div style={s.fieldGroup}>
              <label htmlFor="email" style={s.fieldLabel}>Email</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>
                  <IconMail color="#16A34A" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  style={s.inputDisabled}
                />
                <span style={s.inputIconRight}>
                  <IconLock />
                </span>
              </div>
              <p style={s.helperText}>
                Email tidak dapat diubah. Hubungi admin jika perlu mengganti.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              style={{
                ...s.submitBtn,
                ...(saving ? s.submitBtnDisabled : {}),
              }}
            >
              {saving ? (
                <>
                  <span style={s.btnSpinner} />
                  <span>Menyimpan…</span>
                </>
              ) : (
                <>
                  <IconCheck />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* ── FOTO PROFIL INFO CARD ──────────────────────────────────────── */}
        <div style={s.infoCard}>
          <div style={s.infoCardIcon}>
            <IconImagePlaceholder />
          </div>
          <div>
            <p style={s.infoCardTitle}>Foto profil maksimal 2 MB</p>
            <p style={s.infoCardSub}>Format: JPG, PNG, atau WebP</p>
          </div>
          {/* Hidden avatar edit trigger – tapping icon area opens file picker */}
          <button
            onClick={handlePickPhoto}
            style={s.changePhotoBtn}
            type="button"
            disabled={uploadingPhoto}
            aria-label="Ganti foto profil"
          >
            {uploadingPhoto ? (
              <span style={s.miniSpinner} />
            ) : (
              <IconCamera />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
        </div>

      </div>

      {/* ── BOTTOM NAV ──────────────────────────────────────────────────── */}
      <nav style={s.bottomNav}>
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            type="button"
            style={s.navBtn}
            aria-label={item.label}
          >
            {item.icon}
            <span style={{ ...s.navLabel, ...(item.active ? s.navLabelActive : {}) }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* ── TOAST ──────────────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            ...s.toast,
            ...(toast.type === 'success' ? s.toastSuccess : s.toastError),
          }}
        >
          {toast.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
              <path
                d="M8.5 12.5l2.2 2.2 4.8-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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

// ─────────────────────────────────────────────────────────────────────────────
// Global CSS
// ─────────────────────────────────────────────────────────────────────────────
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    box-sizing: border-box;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translate(-50%, 14px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Input focus ring override */
  input:focus {
    outline: none;
    border-color: #16A34A !important;
    box-shadow: 0 0 0 3px rgba(22,163,74,0.12) !important;
  }
  input::placeholder { color: #CBD5E1; }
  input:disabled { cursor: not-allowed; }

  button { font-family: inherit; }
`

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {

  /* ── Page shell ── */
  page: {
    minHeight: '100vh',
    background: '#F0FDF4',
    maxWidth: 480,
    margin: '0 auto',
    position: 'relative',
    paddingBottom: 88,
  },

  /* ── Loading ── */
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 14,
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '3px solid #DCFCE7',
    borderTopColor: '#16A34A',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#64748B',
    margin: 0,
  },

  /* ── Header ── */
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '52px 20px 20px',
    background: '#F0FDF4',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1.5px solid #D1FAE5',
    background: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center' as const,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#14532D',
    margin: 0,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12.5,
    fontWeight: 500,
    color: '#6B7280',
    margin: '3px 0 0',
  },

  /* ── Body ── */
  body: {
    padding: '0 16px',
    animation: 'fadeUp 0.4s ease',
  },

  /* ── Form card ── */
  card: {
    background: '#FFFFFF',
    borderRadius: 20,
    padding: '22px 20px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
    border: '1px solid #E7F5EF',
    marginBottom: 16,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
    paddingBottom: 18,
    borderBottom: '1px solid #F0FDF4',
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: '#F0FDF4',
    border: '1.5px solid #D1FAE5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: 800,
    color: '#14532D',
    margin: '0 0 2px',
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: 500,
    color: '#94A3B8',
    margin: 0,
  },

  /* ── Field ── */
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: 8,
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 1,
  },
  inputIconRight: {
    position: 'absolute',
    right: 14,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    border: '1.5px solid #E2E8F0',
    padding: '0 14px 0 46px',
    fontSize: 14.5,
    fontWeight: 600,
    color: '#111827',
    background: '#FFFFFF',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  inputFocused: {
    borderColor: '#16A34A',
    boxShadow: '0 0 0 3px rgba(22,163,74,0.12)',
  },
  inputErr: {
    borderColor: '#FCA5A5',
    background: '#FFF5F5',
  },
  inputDisabled: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    border: '1.5px solid #E2E8F0',
    padding: '0 46px 0 46px',
    fontSize: 14.5,
    fontWeight: 600,
    color: '#6B7280',
    background: '#F9FAFB',
    transition: 'none',
  },
  errorText: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#EF4444',
    marginTop: 5,
  },
  helperText: {
    fontSize: 12,
    fontWeight: 500,
    color: '#9CA3AF',
    margin: '6px 0 0',
    lineHeight: 1.5,
  },

  /* ── Submit button ── */
  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    border: 'none',
    background: '#14532D',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    marginTop: 4,
    letterSpacing: 0.1,
    transition: 'opacity 0.15s, transform 0.1s',
    boxShadow: '0 4px 16px rgba(20,83,45,0.25)',
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  btnSpinner: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2.5px solid rgba(255,255,255,0.35)',
    borderTopColor: '#FFFFFF',
    animation: 'spin 0.7s linear infinite',
  },

  /* ── Info card (foto profil) ── */
  infoCard: {
    background: '#FFFFFF',
    borderRadius: 16,
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #E7F5EF',
    marginBottom: 16,
  },
  infoCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: '#F0FDF4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoCardTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 3px',
  },
  infoCardSub: {
    fontSize: 12,
    fontWeight: 500,
    color: '#9CA3AF',
    margin: 0,
  },
  changePhotoBtn: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 10,
    border: 'none',
    background: '#16A34A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
  },
  miniSpinner: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: '#FFFFFF',
    animation: 'spin 0.7s linear infinite',
  },

  /* ── Bottom nav ── */
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    background: '#FFFFFF',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    padding: '10px 0 14px',
    zIndex: 10,
  },
  navBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  navLabel: {
    fontSize: 10.5,
    fontWeight: 600,
    color: '#94A3B8',
  },
  navLabelActive: {
    color: '#16A34A',
  },

  /* ── Active nav dot ── */
  navActiveDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#16A34A',
    margin: '0 auto',
  },

  /* ── Toast ── */
  toast: {
    position: 'fixed',
    bottom: 96,
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
    whiteSpace: 'nowrap' as const,
    maxWidth: '92%',
  },
  toastSuccess: { background: '#16A34A' },
  toastError: { background: '#DC2626' },
}