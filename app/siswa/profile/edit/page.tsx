'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { CSSProperties, ChangeEvent, FormEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useSettings } from '@/contexts/SettingsContext'

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
// Theme — palet disamakan dengan Beranda (dashboard.module.css)
// ─────────────────────────────────────────────────────────────────────────────
const getTheme = (isDark: boolean) => ({
  isDark,
  bg: isDark ? '#15131F' : '#FFFFFF',
  surface: isDark ? '#15131F' : '#FFFFFF',
  field: isDark ? '#211D33' : '#F3F5F7',
  fieldDisabled: isDark ? '#1A1728' : '#F3F5F7',
  border: isDark ? '#2A2640' : '#E9EEF2',
  ink: isDark ? '#F1F0F5' : '#0F172A',
  gray: isDark ? '#9892AF' : '#64748B',
  grayLight: isDark ? '#6B6680' : '#94A3B8',
  green: isDark ? '#4ADE80' : '#16A34A',
  greenSoft: isDark ? 'rgba(22,163,74,0.20)' : '#ECFDF5',
  error: isDark ? '#F87171' : '#DC2626',
  heroGradient: 'linear-gradient(120deg, #0e7c5f 0%, #0a5c46 55%, #073d2f 100%)',
  tileBg: 'radial-gradient(circle at 32% 24%, #4b8a76 0%, #235347 52%, #153d32 100%)',
  toastSuccess: isDark ? '#065f46' : '#16A34A',
  toastError: isDark ? '#7f1d1d' : '#DC2626',
})
type Theme = ReturnType<typeof getTheme>

// ─────────────────────────────────────────────────────────────────────────────
// Icons — satu keluarga (stroke rounded)
// ─────────────────────────────────────────────────────────────────────────────
interface IconProps {
  size?: number
  color?: string
  stroke?: number
}
const Svg = ({ size = 20, color = 'currentColor', stroke = 1.8, children }: IconProps & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
)

const IconArrowLeft = (p: IconProps) => (
  <Svg {...p} stroke={p.stroke ?? 2}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
)
const IconCheck = (p: IconProps) => (
  <Svg {...p} stroke={p.stroke ?? 2.4}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
)
const IconCamera = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 4h-5L7.5 6.5H5a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-2.5L14.5 4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Svg>
)
const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2.5" />
    <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
  </Svg>
)
const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="m3 10.5 9-7 9 7V19a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2v-8.5z" />
  </Svg>
)
const IconClipboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="4" width="14" height="17" rx="2.5" />
    <path d="M9 4.5V3.8A.8.8 0 0 1 9.8 3h4.4a.8.8 0 0 1 .8.8v.7a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5z" />
    <path d="M9 11h6M9 15h4" />
  </Svg>
)
const IconCard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="3" />
    <path d="M2.5 10h19M6.5 15h3" />
  </Svg>
)
const IconBarChart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 20v-7M12 20V5M19 20v-10" />
  </Svg>
)
const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20.5c0-3.6 3.6-6 8-6s8 2.4 8 6" />
  </Svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function EditProfilePage() {
  const router = useRouter()
  const { status, update: updateSession } = useSession()
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'
  const c = getTheme(isDark)
  const s = makeStyles(c)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const [name, setName] = useState('')
  const [initialName, setInitialName] = useState('')
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

  // ── Bersihkan object URL preview ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  // ── Fetch profil ──────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/siswa/profile')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || (isEn ? 'Failed to load profile' : 'Gagal memuat profil'))
      const profile: ProfileData = data.profile
      setName(profile.name ?? '')
      setInitialName((profile.name ?? '').trim())
      setEmail(profile.email ?? '')
      setAvatarUrl(profile.avatar_url ?? null)
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : isEn ? 'Failed to load profile data' : 'Gagal memuat data profil',
      })
    } finally {
      setLoading(false)
    }
  }, [isEn])

  useEffect(() => {
    if (status === 'authenticated') fetchProfile()
    else if (status === 'unauthenticated') router.replace('/login')
  }, [status, fetchProfile, router])

  // ── Upload foto ───────────────────────────────────────────────────────────
  const handlePickPhoto = () => fileInputRef.current?.click()

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setToast({ type: 'error', message: isEn ? 'Photo format must be JPG, PNG, or WebP' : 'Format foto harus JPG, PNG, atau WebP' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'error', message: isEn ? 'Maximum photo size is 2 MB' : 'Ukuran foto maksimal 2 MB' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setAvatarPreview(URL.createObjectURL(file))

    try {
      setUploadingPhoto(true)
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/siswa/profile/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || (isEn ? 'Failed to upload photo' : 'Gagal mengunggah foto'))
      setAvatarUrl(data.avatar_url)
      setToast({ type: 'success', message: isEn ? 'Profile photo updated successfully' : 'Foto profil berhasil diperbarui' })
      await updateSession?.({ avatar_url: data.avatar_url })
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : isEn ? 'Failed to upload photo' : 'Gagal mengunggah foto',
      })
      setAvatarPreview(null)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Simpan perubahan ──────────────────────────────────────────────────────
  const validate = () => {
    const v = name.trim()
    if (!v) {
      setNameError(isEn ? 'Full name is required' : 'Nama lengkap wajib diisi')
      return false
    }
    if (v.length < 3) {
      setNameError(isEn ? 'Name must be at least 3 characters' : 'Nama minimal 3 karakter')
      return false
    }
    setNameError(null)
    return true
  }

  const dirty = name.trim() !== initialName
  const canSave = dirty && !saving

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    if (!dirty) {
      setToast({ type: 'success', message: isEn ? 'No changes to save' : 'Tidak ada perubahan untuk disimpan' })
      return
    }
    if (!validate()) return
    try {
      setSaving(true)
      const res = await fetch('/api/siswa/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || (isEn ? 'Failed to save changes' : 'Gagal menyimpan perubahan'))
      setInitialName(name.trim())
      setToast({ type: 'success', message: isEn ? 'Profile saved successfully' : 'Profil berhasil disimpan' })
      await updateSession?.({ name: name.trim() })
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : isEn ? 'Failed to save changes' : 'Gagal menyimpan perubahan',
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

  const navItems = [
    { Icon: IconHome, label: isEn ? 'Home' : 'Beranda', href: '/siswa' },
    { Icon: IconClipboard, label: isEn ? 'Register' : 'Daftar', href: '/siswa/pendaftaran' },
    { Icon: IconCard, label: isEn ? 'Pay' : 'Bayar', href: '/siswa/pembayaran' },
    { Icon: IconBarChart, label: 'Status', href: '/siswa/status' },
    { Icon: IconUser, label: isEn ? 'Profile' : 'Profil', href: '/siswa/profile', active: true },
  ]

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...s.page, background: c.bg }}>
        <div style={s.loadingWrap}>
          <div style={{ ...s.spinner, border: `3px solid ${isDark ? '#2A2640' : '#DCFCE7'}`, borderTopColor: c.green }} />
          <p style={{ ...s.loadingText, color: c.gray }}>{isEn ? 'Loading profile…' : 'Memuat profil…'}</p>
        </div>
        <style>{globalCss(c)}</style>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ ...s.page, background: c.bg }}>
      {/* ── HEADER: back · judul · simpan ─────────────────────────────────── */}
      <header style={s.header}>
        <button
          type="button"
          onClick={() => router.back()}
          style={s.headerBtn}
          aria-label={isEn ? 'Back' : 'Kembali'}
          className="tap"
        >
          <IconArrowLeft size={18} color={c.green} />
        </button>

        <h1 style={s.headerTitle}>{isEn ? 'Edit Profile' : 'Edit Profil'}</h1>

        <span aria-hidden="true" />
      </header>

      <main style={s.body}>
        {/* ── AVATAR ──────────────────────────────────────────────────────── */}
        <section style={s.avatarSection}>
          <div style={s.avatarWrap}>
            <div style={s.avatarRing}>
              <div style={s.avatarInner}>
                {displayedAvatar ? (
                  <Image
                    src={displayedAvatar}
                    alt={isEn ? 'Profile photo' : 'Foto profil'}
                    width={104}
                    height={104}
                    style={s.avatarImg}
                    unoptimized={displayedAvatar.startsWith('blob:') || displayedAvatar.startsWith('data:')}
                  />
                ) : (
                  <span style={s.avatarInitials}>{initials}</span>
                )}
                {uploadingPhoto && (
                  <div style={s.uploadOverlay}>
                    <div style={s.avatarSpinner} />
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handlePickPhoto}
              disabled={uploadingPhoto}
              style={s.cameraBtn}
              aria-label={isEn ? 'Change profile photo' : 'Ganti foto profil'}
              className="tap"
            >
              <IconCamera size={14} color="#FFFFFF" stroke={2} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>
          <p style={s.avatarHint}>
            {isEn ? 'Max 2 MB · JPG, PNG, or WebP' : 'Maks. 2 MB · JPG, PNG, atau WebP'}
          </p>
        </section>

        {/* ── FORM ────────────────────────────────────────────────────────── */}
        <form id="edit-profile-form" onSubmit={handleSave} noValidate>
          {/* Nama Lengkap */}
          <div style={s.fieldGroup}>
            <label htmlFor="name" style={s.fieldLabel}>
              {isEn ? 'Full Name' : 'Nama Lengkap'}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              maxLength={60}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(null)
              }}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder={isEn ? 'Enter full name' : 'Masukkan nama lengkap'}
              autoComplete="name"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? 'name-error' : undefined}
              style={{
                ...s.input,
                background: c.field,
                color: c.ink,
                border: `1.5px solid ${nameError ? c.error : nameFocused ? c.green : 'transparent'}`,
                boxShadow: nameFocused && !nameError ? `0 0 0 4px ${c.greenSoft}` : 'none',
              }}
            />
            {nameError && (
              <span id="name-error" role="alert" style={{ ...s.errorText, color: c.error }}>
                {nameError}
              </span>
            )}
          </div>

          {/* Email (read-only) */}
          <div style={s.fieldGroup}>
            <label htmlFor="email" style={s.fieldLabel}>
              Email
            </label>
            <div style={s.inputWrap}>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                readOnly
                style={{ ...s.input, background: c.fieldDisabled, color: c.gray, border: '1.5px solid transparent', paddingRight: 48 }}
              />
              <span style={s.inputIconRight}>
                <IconLock size={18} color={c.grayLight} />
              </span>
            </div>
            <p style={s.helperText}>
              {isEn
                ? 'Email cannot be changed. Contact admin if you need to update it.'
                : 'Email tidak dapat diubah. Hubungi admin jika perlu mengganti.'}
            </p>
          </div>

          {/* Tombol simpan */}
          <button
            type="submit"
            disabled={!canSave}
            className="tap"
            style={{ ...s.submitBtn, ...(canSave ? {} : s.submitBtnDisabled) }}
          >
            {saving ? (
              <>
                <span style={s.btnSpinnerLight} />
                <span>{isEn ? 'Saving…' : 'Menyimpan…'}</span>
              </>
            ) : (
              <>
                <IconCheck size={18} color="#FFFFFF" />
                <span>{isEn ? 'Save Changes' : 'Simpan Perubahan'}</span>
              </>
            )}
          </button>
        </form>
      </main>

      {/* ── BOTTOM NAV (sama dengan Beranda) ───────────────────────────────── */}
      <nav style={s.bottomNav} aria-label={isEn ? 'Main navigation' : 'Navigasi utama'}>
        {navItems.map(({ Icon, label, href, active }) => (
          <button
            key={href}
            type="button"
            onClick={() => router.push(href)}
            style={{ ...s.navItem, color: active ? c.green : c.grayLight }}
            aria-current={active ? 'page' : undefined}
          >
            <span style={{ ...s.navIconWrap, ...(active ? { background: c.greenSoft } : {}) }}>
              <Icon size={21} color="currentColor" stroke={active ? 2 : 1.8} />
            </span>
            <span style={s.navLabel}>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div role="status" style={{ ...s.toast, background: toast.type === 'success' ? c.toastSuccess : c.toastError }}>
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

      <style>{globalCss(c)}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Global CSS
// ─────────────────────────────────────────────────────────────────────────────
const globalCss = (c: Theme) => `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    box-sizing: border-box;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp {
    from { opacity: 0; transform: translate(-50%, 14px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  input:focus { outline: none; }
  input::placeholder { color: ${c.grayLight}; font-weight: 500; }
  input:disabled { cursor: not-allowed; -webkit-text-fill-color: ${c.gray}; opacity: 1; }

  button { font-family: inherit; -webkit-tap-highlight-color: transparent; }
  button:disabled { cursor: not-allowed; }
  .tap { transition: transform 0.12s ease, opacity 0.12s ease; }
  .tap:active:not(:disabled) { transform: scale(0.97); }
  button:focus-visible { outline: 2px solid #16A34A; outline-offset: 2px; }

  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const makeStyles = (c: Theme): Record<string, CSSProperties> => ({
  page: {
    minHeight: '100vh',
    maxWidth: 480,
    margin: '0 auto',
    position: 'relative',
    paddingBottom: 96,
  },

  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 14 },
  spinner: { width: 32, height: 32, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { fontSize: 13, fontWeight: 600, margin: 0 },

  // Header — tombol kembali melingkar · judul tengah
  header: {
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    gap: 8,
    padding: '48px 16px 8px',
    background: c.bg,
  },
  headerBtn: {
    width: 40,
    height: 40,
    minWidth: 40,
    borderRadius: '50%',
    background: c.greenSoft,
    border: c.isDark ? '1px solid #22443A' : '1px solid #CFE6DA',
    boxShadow: c.isDark ? 'none' : '0 1px 2px rgba(15,107,74,.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: c.ink,
    margin: 0,
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  body: { padding: '8px 24px 0', animation: 'fadeUp 0.4s ease' },

  // Avatar
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0 28px' },
  avatarWrap: { position: 'relative' },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: '50%',
    padding: 4,
    background: c.heroGradient,
    boxShadow: '0 8px 22px rgba(7,61,47,0.25)',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: `3px solid ${c.surface}`,
    background: 'linear-gradient(135deg, #0e7c5f, #0a5c46)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarInitials: { fontSize: 32, fontWeight: 800, color: '#FFFFFF' },
  uploadOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.42)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSpinner: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    border: '2.5px solid rgba(255,255,255,0.35)',
    borderTopColor: '#FFFFFF',
    animation: 'spin 0.8s linear infinite',
  },
  cameraBtn: {
    position: 'absolute',
    right: 2,
    bottom: 4,
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: c.tileBg,
    border: `2.5px solid ${c.surface}`,
    boxShadow: '0 3px 8px rgba(18,48,42,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  },
  avatarHint: { fontSize: 12, fontWeight: 500, color: c.gray, margin: '12px 0 0' },

  // Form
  fieldGroup: { marginBottom: 20 },
  fieldLabel: { display: 'block', fontSize: 14, fontWeight: 700, color: c.ink, marginBottom: 8 },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIconRight: { position: 'absolute', right: 16, display: 'flex', alignItems: 'center', pointerEvents: 'none' },
  input: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    padding: '0 16px',
    fontSize: 14.5,
    fontWeight: 600,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  errorText: { display: 'block', fontSize: 12, fontWeight: 600, marginTop: 6 },
  helperText: { fontSize: 12, fontWeight: 500, color: c.gray, margin: '7px 0 0', lineHeight: 1.5 },

  submitBtn: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    border: 'none',
    background: c.heroGradient,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    marginTop: 8,
    letterSpacing: 0.1,
    boxShadow: '0 8px 20px rgba(10,92,70,0.28)',
  },
  submitBtnDisabled: { opacity: 0.45, boxShadow: 'none', cursor: 'not-allowed' },
  btnSpinner: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: '2.5px solid',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  btnSpinnerLight: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2.5px solid rgba(255,255,255,0.35)',
    borderTopColor: '#FFFFFF',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },

  // Bottom nav — meniru .bottomNav di dashboard.module.css
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: 480,
    margin: '0 auto',
    zIndex: 100,
    background: c.surface,
    borderTop: `1px solid ${c.border}`,
    boxShadow: '0 -4px 20px rgba(15,23,42,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '8px 0 max(10px, env(safe-area-inset-bottom))',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0 8px',
    transition: 'color 0.2s',
  },
  navIconWrap: { width: 34, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  navLabel: { fontSize: 10, fontWeight: 600 },

  // Toast
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
    zIndex: 150,
    animation: 'slideUp 0.3s ease',
    maxWidth: '92%',
  },
})