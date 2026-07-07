'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
// SVG Icon Components dengan dukungan dark mode
// ─────────────────────────────────────────────────────────────────────────────

const IconChevronLeft = ({ color = '#16A34A' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconGear = ({ color = '#16A34A' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.9" />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconUser = ({ color = '#16A34A' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.9" />
  </svg>
)

const IconMail = ({ color = '#16A34A' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.9" />
    <path d="M2 8l10 6 10-6" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
  </svg>
)

const IconLock = ({ color = '#94A3B8' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.8" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

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

const IconImagePlaceholder = ({ color = '#16A34A' }: { color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8" />
    <circle cx="8.5" cy="8.5" r="1.5" stroke={color} strokeWidth="1.8" />
    <path d="M21 15l-5-5L5 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ── Bottom nav icons ──────────────────────────────────────────────────────────
const IconHome = ({ active, color = '#94A3B8', activeColor = '#16A34A' }: { active?: boolean; color?: string; activeColor?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={active ? activeColor : color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 22V12h6v10" stroke={active ? activeColor : color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconClipboard = ({ active, color = '#94A3B8', activeColor = '#16A34A' }: { active?: boolean; color?: string; activeColor?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="3" width="14" height="18" rx="2" stroke={active ? activeColor : color} strokeWidth="1.8" />
    <path d="M9 3h6v2H9z" stroke={active ? activeColor : color} strokeWidth="1.8" />
    <path d="M9 10h6M9 14h4" stroke={active ? activeColor : color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconCard = ({ active, color = '#94A3B8', activeColor = '#16A34A' }: { active?: boolean; color?: string; activeColor?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke={active ? activeColor : color} strokeWidth="1.8" />
    <path d="M2 10h20" stroke={active ? activeColor : color} strokeWidth="1.8" />
    <path d="M6 15h4" stroke={active ? activeColor : color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconBarChart = ({ active, color = '#94A3B8', activeColor = '#16A34A' }: { active?: boolean; color?: string; activeColor?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M18 20V10M12 20V4M6 20v-6" stroke={active ? activeColor : color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconProfileNav = ({ active, color = '#94A3B8', activeColor = '#16A34A' }: { active?: boolean; color?: string; activeColor?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={active ? activeColor : color} strokeWidth="1.8" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? activeColor : color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function EditProfilePage() {
  const router = useRouter()
  const { status, update: updateSession } = useSession()
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'

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
      if (!res.ok) throw new Error(data.error || (isEn ? 'Failed to load profile' : 'Gagal memuat profil'))
      const profile: ProfileData = data.profile
      setName(profile.name ?? '')
      setEmail(profile.email ?? '')
      setAvatarUrl(profile.avatar_url ?? null)
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : (isEn ? 'Failed to load profile data' : 'Gagal memuat data profil'),
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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setToast({ type: 'error', message: isEn ? 'Photo format must be JPG, PNG, or WebP' : 'Format foto harus JPG, PNG, atau WebP' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'error', message: isEn ? 'Maximum photo size is 2 MB' : 'Ukuran foto maksimal 2 MB' })
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
        message: err instanceof Error ? err.message : (isEn ? 'Failed to upload photo' : 'Gagal mengunggah foto'),
      })
      setAvatarPreview(null)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Simpan perubahan ──────────────────────────────────────────────────────
  const validate = () => {
    if (!name.trim()) { 
      setNameError(isEn ? 'Full name is required' : 'Nama lengkap wajib diisi')
      return false 
    }
    if (name.trim().length < 3) { 
      setNameError(isEn ? 'Name must be at least 3 characters' : 'Nama minimal 3 karakter')
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
      if (!res.ok) throw new Error(data.error || (isEn ? 'Failed to save changes' : 'Gagal menyimpan perubahan'))
      setToast({ type: 'success', message: isEn ? 'Profile saved successfully' : 'Profil berhasil disimpan' })
      await updateSession?.({ name: name.trim() })
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : (isEn ? 'Failed to save changes' : 'Gagal menyimpan perubahan'),
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

  // ── Dark mode colors ──────────────────────────────────────────────────────
  const pageBg = isDark ? '#15131f' : '#F0FDF4'
  const cardBg = isDark ? '#1e1b2e' : '#FFFFFF'
  const cardBorder = isDark ? '1px solid #2e2a40' : '1px solid #E7F5EF'
  const textColor = isDark ? '#f1f0f5' : '#14532D'
  const mutedColor = isDark ? '#94a3b8' : '#6B7280'
  const subColor = isDark ? '#94a3b8' : '#94A3B8'
  const iconBg = isDark ? '#2e2a40' : '#F0FDF4'
  const iconBorder = isDark ? '1px solid #2e2a40' : '1.5px solid #D1FAE5'
  const iconColor = isDark ? '#a5b4fc' : '#16A34A'
  const dividerColor = isDark ? '#2e2a40' : '#F0FDF4'
  const navBg = isDark ? '#1e1b2e' : '#FFFFFF'
  const navBorder = isDark ? '1px solid #2e2a40' : '1px solid #E2E8F0'
  const navColor = isDark ? '#6b6885' : '#94A3B8'
  const navActiveColor = isDark ? '#a5b4fc' : '#16A34A'
  const inputBg = isDark ? '#1e1b2e' : '#FFFFFF'
  const inputBorder = isDark ? '1px solid #2e2a40' : '1.5px solid #E2E8F0'
  const inputDisabledBg = isDark ? '#15131f' : '#F9FAFB'
  const inputDisabledColor = isDark ? '#6b6885' : '#6B7280'
  const inputTextColor = isDark ? '#f1f0f5' : '#111827'
  const inputPlaceholderColor = isDark ? '#6b6885' : '#CBD5E1'
  const submitBg = isDark ? '#065f46' : '#14532D'
  const headerBg = isDark ? '#15131f' : '#F0FDF4'
  const backBtnBg = isDark ? '#1e1b2e' : '#FFFFFF'
  const backBtnBorder = isDark ? '1px solid #2e2a40' : '1.5px solid #D1FAE5'
  const toastSuccessBg = isDark ? '#065f46' : '#16A34A'
  const toastErrorBg = isDark ? '#7f1d1d' : '#DC2626'
  const infoCardBg = isDark ? '#1e1b2e' : '#FFFFFF'
  const infoCardBorder = isDark ? '1px solid #2e2a40' : '1px solid #E7F5EF'
  const helperTextColor = isDark ? '#6b6885' : '#9CA3AF'
  const errorColor = isDark ? '#fca5a5' : '#EF4444'
  const labelColor = isDark ? '#94a3b8' : '#1F2937'
  const cardTitleColor = isDark ? '#f1f0f5' : '#14532D'

  // ── Bottom nav items with i18n ──────────────────────────────────────────
  const navItems = [
    { label: isEn ? 'Home' : 'Beranda', icon: <IconHome color={isDark ? '#6b6885' : '#94A3B8'} activeColor={isDark ? '#a5b4fc' : '#16A34A'} />, href: '/siswa' },
    { label: isEn ? 'Register' : 'Daftar', icon: <IconClipboard color={isDark ? '#6b6885' : '#94A3B8'} activeColor={isDark ? '#a5b4fc' : '#16A34A'} />, href: '/siswa/pendaftaran' },
    { label: isEn ? 'Pay' : 'Bayar', icon: <IconCard color={isDark ? '#6b6885' : '#94A3B8'} activeColor={isDark ? '#a5b4fc' : '#16A34A'} />, href: '/siswa/pembayaran' },
    { label: isEn ? 'Status' : 'Status', icon: <IconBarChart color={isDark ? '#6b6885' : '#94A3B8'} activeColor={isDark ? '#a5b4fc' : '#16A34A'} />, href: '/siswa/status' },
    { label: isEn ? 'Profile' : 'Profil', icon: <IconProfileNav active color={isDark ? '#6b6885' : '#94A3B8'} activeColor={isDark ? '#a5b4fc' : '#16A34A'} />, href: '/siswa/profile', active: true },
  ]

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    const spinnerColor = isDark ? '#2e2a40' : '#DCFCE7'
    const spinnerTopColor = isDark ? '#a5b4fc' : '#16A34A'
    return (
      <div style={{ ...s.page, background: pageBg }}>
        <div style={s.loadingWrap}>
          <div style={{ ...s.spinner, border: `3px solid ${spinnerColor}`, borderTopColor: spinnerTopColor }} />
          <p style={{ ...s.loadingText, color: mutedColor }}>
            {isEn ? 'Loading profile...' : 'Memuat profil…'}
          </p>
        </div>
        <style>{globalCss}</style>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ ...s.page, background: pageBg }}>

      {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
      <div style={{ ...s.header, background: headerBg }}>
        <button
          onClick={() => router.back()}
          style={{ ...s.iconBtn, background: backBtnBg, border: backBtnBorder }}
          type="button"
          aria-label={isEn ? 'Back' : 'Kembali'}
        >
          <IconChevronLeft color={isDark ? '#a5b4fc' : '#16A34A'} />
        </button>

        <div style={s.headerCenter}>
          <h1 style={{ ...s.headerTitle, color: textColor }}>
            {isEn ? 'Edit Profile' : 'Edit Profil'}
          </h1>
          <p style={{ ...s.headerSub, color: mutedColor }}>
            {isEn ? 'Update photo and personal information' : 'Perbarui foto dan informasi pribadimu'}
          </p>
        </div>

        <button
          onClick={() => router.push('/siswa/pengaturan')}
          style={{ ...s.iconBtn, background: backBtnBg, border: backBtnBorder }}
          type="button"
          aria-label={isEn ? 'Settings' : 'Pengaturan'}
        >
          <IconGear color={isDark ? '#a5b4fc' : '#16A34A'} />
        </button>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div style={s.body}>

        {/* ── FORM CARD ─────────────────────────────────────────────────── */}
        <div style={{ ...s.card, background: cardBg, border: cardBorder, boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)' }}>

          <div style={{ ...s.cardHeader, borderBottomColor: dividerColor }}>
            <div style={{ ...s.cardIconWrap, background: iconBg, border: iconBorder }}>
              <IconUser color={iconColor} />
            </div>
            <div>
              <h2 style={{ ...s.cardTitle, color: cardTitleColor }}>
                {isEn ? 'Personal Information' : 'Informasi Pribadi'}
              </h2>
              <p style={{ ...s.cardSubtitle, color: subColor }}>
                {isEn ? 'This data will appear across the student portal' : 'Data ini akan tampil di seluruh portal siswa'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} noValidate>

            {/* Nama Lengkap */}
            <div style={s.fieldGroup}>
              <label htmlFor="name" style={{ ...s.fieldLabel, color: labelColor }}>
                {isEn ? 'Full Name' : 'Nama Lengkap'}
              </label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>
                  <IconUser color={nameFocused ? (isDark ? '#a5b4fc' : '#16A34A') : (isDark ? '#6b6885' : '#94A3B8')} />
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (nameError) setNameError(null) }}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder={isEn ? 'Enter full name' : 'Masukkan nama lengkap'}
                  style={{
                    ...s.input,
                    background: inputBg,
                    border: `1.5px solid ${nameError ? (isDark ? '#6b1a1a' : '#FCA5A5') : (isDark ? '#2e2a40' : '#E2E8F0')}`,
                    color: inputTextColor,
                    ...(nameFocused ? { borderColor: isDark ? '#a5b4fc' : '#16A34A', boxShadow: isDark ? '0 0 0 3px rgba(165,180,252,0.12)' : '0 0 0 3px rgba(22,163,74,0.12)' } : {}),
                  }}
                  autoComplete="name"
                />
              </div>
              {nameError && <span style={{ ...s.errorText, color: errorColor }}>{nameError}</span>}
            </div>

            {/* Email */}
            <div style={s.fieldGroup}>
              <label htmlFor="email" style={{ ...s.fieldLabel, color: labelColor }}>
                {isEn ? 'Email' : 'Email'}
              </label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>
                  <IconMail color={isDark ? '#a5b4fc' : '#16A34A'} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  style={{
                    ...s.inputDisabled,
                    background: inputDisabledBg,
                    border: `1.5px solid ${isDark ? '#2e2a40' : '#E2E8F0'}`,
                    color: inputDisabledColor,
                    padding: '0 46px 0 46px',
                  }}
                />
                <span style={s.inputIconRight}>
                  <IconLock color={isDark ? '#6b6885' : '#94A3B8'} />
                </span>
              </div>
              <p style={{ ...s.helperText, color: helperTextColor }}>
                {isEn ? 'Email cannot be changed. Contact admin if you need to update it.' : 'Email tidak dapat diubah. Hubungi admin jika perlu mengganti.'}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              style={{
                ...s.submitBtn,
                background: submitBg,
                boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(20,83,45,0.25)',
                ...(saving ? s.submitBtnDisabled : {}),
              }}
            >
              {saving ? (
                <>
                  <span style={s.btnSpinner} />
                  <span>{isEn ? 'Saving…' : 'Menyimpan…'}</span>
                </>
              ) : (
                <>
                  <IconCheck />
                  <span>{isEn ? 'Save Changes' : 'Simpan Perubahan'}</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* ── FOTO PROFIL INFO CARD ──────────────────────────────────────── */}
        <div style={{ ...s.infoCard, background: infoCardBg, border: infoCardBorder }}>
          <div style={{ ...s.infoCardIcon, background: iconBg }}>
            <IconImagePlaceholder color={iconColor} />
          </div>
          <div>
            <p style={{ ...s.infoCardTitle, color: textColor }}>
              {isEn ? 'Profile photo max 2 MB' : 'Foto profil maksimal 2 MB'}
            </p>
            <p style={{ ...s.infoCardSub, color: mutedColor }}>
              {isEn ? 'Format: JPG, PNG, or WebP' : 'Format: JPG, PNG, atau WebP'}
            </p>
          </div>
          <button
            onClick={handlePickPhoto}
            style={s.changePhotoBtn}
            type="button"
            disabled={uploadingPhoto}
            aria-label={isEn ? 'Change profile photo' : 'Ganti foto profil'}
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
      <nav style={{ ...s.bottomNav, background: navBg, borderTop: navBorder }}>
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            type="button"
            style={s.navBtn}
            aria-label={item.label}
          >
            {item.icon}
            <span style={{ ...s.navLabel, ...(item.active ? { ...s.navLabelActive, color: navActiveColor } : { color: navColor }) }}>
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
            ...(toast.type === 'success' ? { ...s.toastSuccess, background: toastSuccessBg } : { ...s.toastError, background: toastErrorBg }),
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

  input:focus {
    outline: none;
  }
  input::placeholder { 
    color: #CBD5E1; 
  }
  input:disabled { 
    cursor: not-allowed; 
  }

  button { 
    font-family: inherit; 
  }
`

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {

  page: {
    minHeight: '100vh',
    maxWidth: 480,
    margin: '0 auto',
    position: 'relative',
    paddingBottom: 88,
  },

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
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: 600,
    margin: 0,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '52px 20px 20px',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    margin: 0,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12.5,
    fontWeight: 500,
    margin: '3px 0 0',
  },

  body: {
    padding: '0 16px',
    animation: 'fadeUp 0.4s ease',
  },

  card: {
    borderRadius: 20,
    padding: '22px 20px 20px',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: 800,
    margin: '0 0 2px',
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: 500,
    margin: 0,
  },

  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
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
    padding: '0 14px 0 46px',
    fontSize: 14.5,
    fontWeight: 600,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  inputDisabled: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    fontSize: 14.5,
    fontWeight: 600,
    transition: 'none',
  },
  errorText: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    marginTop: 5,
  },
  helperText: {
    fontSize: 12,
    fontWeight: 500,
    margin: '6px 0 0',
    lineHeight: 1.5,
  },

  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    border: 'none',
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

  infoCard: {
    borderRadius: 16,
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  infoCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoCardTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    margin: '0 0 3px',
  },
  infoCardSub: {
    fontSize: 12,
    fontWeight: 500,
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

  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
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
  },
  navLabelActive: {},

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
  toastSuccess: {},
  toastError: {},
}