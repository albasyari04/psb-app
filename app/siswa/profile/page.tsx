'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { CSSProperties, ChangeEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { useSettings } from '@/contexts/SettingsContext'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ProfileData {
  name: string
  email: string
  role?: string
  avatar_url: string | null
  is_verified?: boolean
  status?: string
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
  bg: isDark ? '#0D0D16' : '#F6F8FA',
  surface: isDark ? '#15131F' : '#FFFFFF',
  surfaceAlt: isDark ? '#1A1728' : '#FFFFFF',
  field: isDark ? '#211D33' : '#F3F5F7',
  border: isDark ? '#2A2640' : '#E9EEF2',
  divider: isDark ? '#2A2640' : '#F1F5F9',
  ink: isDark ? '#F1F0F5' : '#0F172A',
  slate: isDark ? '#C9C5D8' : '#475569',
  gray: isDark ? '#9892AF' : '#64748B',
  grayLight: isDark ? '#6B6680' : '#94A3B8',
  green: isDark ? '#4ADE80' : '#16A34A',
  greenSoft: isDark ? 'rgba(22,163,74,0.20)' : '#ECFDF5',
  greenText: isDark ? '#4ADE80' : '#15803D',
  danger: isDark ? '#F87171' : '#DC2626',
  dangerSoft: isDark ? 'rgba(220,38,38,0.12)' : '#FEF2F2',
  dangerBorder: isDark ? 'rgba(248,113,113,0.28)' : '#FECACA',
  shadow: isDark ? '0 4px 16px rgba(0,0,0,0.35)' : '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
  heroGradient: 'linear-gradient(120deg, #0e7c5f 0%, #0a5c46 55%, #073d2f 100%)',
  tileBg: 'radial-gradient(circle at 32% 24%, #4b8a76 0%, #235347 52%, #153d32 100%)',
  tileShadow: 'inset 0 1.5px 1.5px rgba(255,255,255,0.30), inset 0 -3px 4px rgba(0,0,0,0.30), 0 3px 8px rgba(18,48,42,0.28)',
  toastSuccess: isDark ? '#065f46' : '#16A34A',
  toastError: isDark ? '#7f1d1d' : '#DC2626',
})
type Theme = ReturnType<typeof getTheme>

// ─────────────────────────────────────────────────────────────────────────────
// Icons — satu keluarga (stroke 1.8, rounded) agar tampil konsisten
// ─────────────────────────────────────────────────────────────────────────────
interface SvgProps {
  size?: number
  color?: string
  stroke?: number
  children: ReactNode
}
const Svg = ({ size = 20, color = 'currentColor', stroke = 1.8, children }: SvgProps) => (
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

interface IconProps {
  size?: number
  color?: string
  stroke?: number
}

const IconCamera = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 4h-5L7.5 6.5H5a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-2.5L14.5 4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Svg>
)
const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20.5c0-3.6 3.6-6 8-6s8 2.4 8 6" />
  </Svg>
)
const IconMail = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3.5 7.5 12 13l8.5-5.5" />
  </Svg>
)
const IconShieldCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6L12 3z" />
    <path d="m9 12 2.2 2.2L15.2 10" />
  </Svg>
)
const IconIdCard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <circle cx="9" cy="11" r="2" />
    <path d="M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2M14.5 10h3.5M14.5 13.5H18" />
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
const IconPencil = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
    <path d="m13.5 6.5 4 4" />
  </Svg>
)
const IconChevronRight = (p: IconProps) => (
  <Svg {...p} stroke={p.stroke ?? 2}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
)
const IconLogout = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </Svg>
)
const IconImage = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3.5" width="18" height="17" rx="3" />
    <circle cx="8.5" cy="9" r="1.6" />
    <path d="m21 16-4.5-4.5L7 20.5" />
  </Svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable pieces
// ─────────────────────────────────────────────────────────────────────────────
const IconTile = ({ c, size = 40, children }: { c: Theme; size?: number; children: ReactNode }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size >= 40 ? 13 : 11,
      background: c.tileBg,
      boxShadow: c.tileShadow,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      color: '#FFFFFF',
    }}
  >
    {children}
  </div>
)

const Pill = ({ c, children, icon }: { c: Theme; children: ReactNode; icon?: ReactNode }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11.5,
      fontWeight: 700,
      lineHeight: 1,
      padding: '6px 10px',
      borderRadius: 999,
      background: c.greenSoft,
      color: c.greenText,
      whiteSpace: 'nowrap',
    }}
  >
    {icon}
    {children}
  </span>
)

interface FieldProps {
  c: Theme
  label: string
  value: string
  icon: ReactNode
  trailing?: ReactNode
}
const InfoField = ({ c, label, value, icon, trailing }: FieldProps) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: c.ink, marginBottom: 8 }}>{label}</div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 52,
        padding: '0 14px',
        borderRadius: 14,
        background: c.field,
      }}
    >
      <span style={{ display: 'flex', color: c.green, flexShrink: 0 }}>{icon}</span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 14.5,
          fontWeight: 600,
          color: c.ink,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value || '–'}
      </span>
      {trailing}
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter()
  const { status, update: updateSession } = useSession()
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'
  const c = getTheme(isDark)
  const s = makeStyles(c)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    role: 'Siswa',
    avatar_url: null,
    is_verified: true,
    status: 'Aktif',
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // ── Toast auto-dismiss ──────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // ── Bersihkan object URL preview agar tidak bocor memori ────────────────
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  // ── Fetch profil ────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/siswa/profile')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || (isEn ? 'Failed to load profile' : 'Gagal memuat profil'))
      setProfile({
        name: data.profile.name ?? '',
        email: data.profile.email ?? '',
        role: data.profile.role ?? 'Siswa',
        avatar_url: data.profile.avatar_url ?? null,
        is_verified: data.profile.is_verified ?? true,
        status: data.profile.status ?? 'Aktif',
      })
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

  // ── Upload foto ─────────────────────────────────────────────────────────
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
      setProfile((prev) => ({ ...prev, avatar_url: data.avatar_url }))
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

  // ── Helpers ─────────────────────────────────────────────────────────────
  const displayedAvatar = avatarPreview || profile.avatar_url

  const initials =
    (profile.name || profile.email || 'S')
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'S'

  const isActive = profile.status === 'Aktif' || profile.status === 'Active'
  const roleLabel = !profile.role || profile.role === 'Siswa' ? (isEn ? 'Student' : 'Siswa') : profile.role

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    await signOut({ callbackUrl: '/login' })
  }

  // ── Menu & nav ──────────────────────────────────────────────────────────
  const menuItems = [
    {
      icon: <IconHome size={20} color="#FFFFFF" />,
      label: isEn ? 'Home' : 'Beranda',
      desc: isEn ? 'Back to main dashboard' : 'Kembali ke dashboard utama',
      href: '/siswa',
    },
    {
      icon: <IconClipboard size={20} color="#FFFFFF" />,
      label: isEn ? 'Registration Form' : 'Formulir Pendaftaran',
      desc: isEn ? 'Fill or complete registration data' : 'Isi atau lengkapi data pendaftaran',
      href: '/siswa/pendaftaran',
    },
    {
      icon: <IconBarChart size={20} color="#FFFFFF" />,
      label: isEn ? 'Registration Status' : 'Status Pendaftaran',
      desc: isEn ? 'Track selection process progress' : 'Pantau progres proses seleksi',
      href: '/siswa/status',
    },
    {
      icon: <IconPencil size={20} color="#FFFFFF" />,
      label: isEn ? 'Edit Profile' : 'Edit Profil',
      desc: isEn ? 'Change name and account information' : 'Ubah nama dan informasi akun',
      href: '/siswa/profile/edit',
    },
  ]

  const navItems = [
    { Icon: IconHome, label: isEn ? 'Home' : 'Beranda', href: '/siswa' },
    { Icon: IconClipboard, label: isEn ? 'Register' : 'Daftar', href: '/siswa/pendaftaran' },
    { Icon: IconCard, label: isEn ? 'Pay' : 'Bayar', href: '/siswa/pembayaran' },
    { Icon: IconBarChart, label: 'Status', href: '/siswa/status' },
    { Icon: IconUser, label: isEn ? 'Profile' : 'Profil', href: '/siswa/profile', active: true },
  ]

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...s.page, background: c.bg }}>
        <div style={s.loadingWrap}>
          <div
            style={{
              ...s.spinner,
              border: `3px solid ${isDark ? '#2A2640' : '#DCFCE7'}`,
              borderTopColor: c.green,
            }}
          />
          <p style={{ ...s.loadingText, color: c.gray }}>{isEn ? 'Loading profile…' : 'Memuat profil…'}</p>
        </div>
        <style>{globalCss}</style>
      </div>
    )
  }

  return (
    <div style={{ ...s.page, background: c.bg }}>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={s.hero}>
        <div style={s.heroHeader}>
          <div style={{ minWidth: 0 }}>
            <h1 style={s.heroTitle}>{isEn ? 'My Profile' : 'Profil Saya'}</h1>
            <p style={s.heroSub}>{isEn ? 'Manage your account information' : 'Kelola informasi akun Anda'}</p>
          </div>
          <button
            onClick={() => router.push('/siswa/profile/edit')}
            style={s.editBtn}
            type="button"
            aria-label={isEn ? 'Edit Profile' : 'Edit Profil'}
            className="tap"
          >
            <IconPencil size={16} color="#FFFFFF" />
            <span style={s.editBtnText}>{isEn ? 'Edit' : 'Edit Profil'}</span>
          </button>
        </div>
      </div>

      {/* ── PROFILE CARD (overlap hero) ──────────────────────────────────── */}
      <div style={s.profileCard}>
        <div style={s.avatarWrap}>
          <div style={s.avatarRing}>
            <div style={s.avatarInner}>
              {displayedAvatar ? (
                <Image
                  src={displayedAvatar}
                  alt={isEn ? 'Profile photo' : 'Foto profil'}
                  width={96}
                  height={96}
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
            onClick={handlePickPhoto}
            style={s.cameraBtn}
            type="button"
            aria-label={isEn ? 'Change photo' : 'Ganti foto'}
            disabled={uploadingPhoto}
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

        <h2 style={s.profileName}>{profile.name || '–'}</h2>
        <p style={s.profileEmail}>{profile.email}</p>

        <div style={s.pillRow}>
          {isActive && (
            <Pill c={c} icon={<span style={s.dot} />}>
              {isEn ? 'Active' : 'Aktif'}
            </Pill>
          )}
          {profile.is_verified && (
            <Pill c={c} icon={<IconShieldCheck size={13} color={c.greenText} stroke={2.2} />}>
              {isEn ? 'Verified' : 'Terverifikasi'}
            </Pill>
          )}
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div style={s.body}>
        {/* Foto profil */}
        <button type="button" onClick={handlePickPhoto} disabled={uploadingPhoto} style={s.photoRow} className="tap">
          <IconTile c={c} size={44}>
            <IconImage size={21} color="#FFFFFF" />
          </IconTile>
          <div style={s.rowBody}>
            <span style={{ ...s.rowLabel, color: c.ink }}>{isEn ? 'Profile Photo' : 'Foto Profil'}</span>
            <span style={{ ...s.rowDesc, color: c.gray }}>
              {isEn ? 'Tap to choose a new photo' : 'Ketuk untuk memilih foto baru'}
            </span>
            <span style={{ ...s.rowDesc, color: c.grayLight }}>
              {isEn ? 'Max 2 MB · JPG, PNG, WebP' : 'Maks. 2 MB · JPG, PNG, WebP'}
            </span>
          </div>
          <IconChevronRight size={16} color={c.grayLight} />
        </button>

        {/* Informasi akun */}
        <p style={{ ...s.sectionTitle, color: c.green }}>{isEn ? 'ACCOUNT INFORMATION' : 'INFORMASI AKUN'}</p>
        <div style={s.fieldsCard}>
          <InfoField
            c={c}
            label={isEn ? 'Full Name' : 'Nama Lengkap'}
            value={profile.name}
            icon={<IconUser size={19} />}
          />
          <InfoField c={c} label="Email" value={profile.email} icon={<IconMail size={19} />} />
          <InfoField
            c={c}
            label={isEn ? 'Account Role' : 'Role Akun'}
            value={roleLabel}
            icon={<IconIdCard size={19} />}
            trailing={isActive ? <Pill c={c}>{isEn ? 'Active' : 'Aktif'}</Pill> : undefined}
          />
        </div>

        {/* Menu utama */}
        <p style={{ ...s.sectionTitle, color: c.green }}>{isEn ? 'MAIN MENU' : 'MENU UTAMA'}</p>
        <div style={s.menuCard}>
          {menuItems.map((item, i) => (
            <div key={item.href}>
              <button type="button" style={s.menuRow} onClick={() => router.push(item.href)} className="tap">
                <IconTile c={c} size={40}>
                  {item.icon}
                </IconTile>
                <div style={s.rowBody}>
                  <span style={{ ...s.menuLabel, color: c.ink }}>{item.label}</span>
                  <span style={{ ...s.rowDesc, color: c.gray }}>{item.desc}</span>
                </div>
                <IconChevronRight size={16} color={c.grayLight} />
              </button>
              {i < menuItems.length - 1 && <div style={{ ...s.divider, background: c.divider }} />}
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{ ...s.logoutBtn, background: c.dangerSoft, border: `1.5px solid ${c.dangerBorder}`, color: c.danger, opacity: loggingOut ? 0.7 : 1 }}
          type="button"
          className="tap"
        >
          <IconLogout size={18} color={c.danger} />
          <span>{isEn ? 'Sign Out' : 'Keluar dari Akun'}</span>
        </button>
      </div>

      {/* ── BOTTOM NAV (sama dengan Beranda) ─────────────────────────────── */}
      <nav style={s.bottomNav} aria-label={isEn ? 'Main navigation' : 'Navigasi utama'}>
        {navItems.map(({ Icon, label, href, active }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            style={{ ...s.navItem, color: active ? c.green : c.grayLight }}
            type="button"
            aria-current={active ? 'page' : undefined}
          >
            <span style={{ ...s.navIconWrap, ...(active ? { background: c.greenSoft } : {}) }}>
              <Icon size={21} color="currentColor" stroke={active ? 2 : 1.8} />
            </span>
            <span style={s.navLabel}>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── TOAST ────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          role="status"
          style={{ ...s.toast, background: toast.type === 'success' ? c.toastSuccess : c.toastError }}
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
  *, *::before, *::after { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  button { font-family: inherit; -webkit-tap-highlight-color: transparent; }
  button:disabled { cursor: not-allowed; }
  .tap { transition: transform 0.12s ease, opacity 0.12s ease; }
  .tap:active:not(:disabled) { transform: scale(0.98); opacity: 0.92; }
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
    paddingBottom: 96,
    maxWidth: 480,
    margin: '0 auto',
    position: 'relative',
  },

  // Loading
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 14 },
  spinner: { width: 32, height: 32, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { fontSize: 13, fontWeight: 600, margin: 0 },

  // Hero
  hero: {
    position: 'relative',
    background: c.heroGradient,
    padding: '52px 20px 84px',
    overflow: 'hidden',
  },
  heroHeader: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTitle: { fontSize: 22, fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: -0.3 },
  heroSub: { fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.78)', margin: '3px 0 0' },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    padding: '8px 13px',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.28)',
    backdropFilter: 'blur(6px)',
    flexShrink: 0,
  },
  editBtnText: { fontSize: 13, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' },

  // Profile card
  profileCard: {
    position: 'relative',
    zIndex: 3,
    margin: '-56px 16px 0',
    padding: '0 20px 20px',
    borderRadius: 24,
    background: c.surface,
    border: `1px solid ${c.border}`,
    boxShadow: c.shadow,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeIn 0.4s ease',
  },
  avatarWrap: { position: 'relative', marginTop: -48, flexShrink: 0 },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: '50%',
    padding: 4,
    background: c.surface,
    boxShadow: '0 6px 18px rgba(7,61,47,0.22)',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0e7c5f, #0a5c46)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarInitials: { fontSize: 30, fontWeight: 800, color: '#FFFFFF' },
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
    bottom: 2,
    right: 2,
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
  profileName: {
    fontSize: 19,
    fontWeight: 800,
    color: c.ink,
    margin: '12px 0 2px',
    letterSpacing: -0.2,
    textAlign: 'center',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  profileEmail: {
    fontSize: 13,
    fontWeight: 500,
    color: c.gray,
    margin: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  pillRow: { display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: '50%', background: c.green, display: 'inline-block' },

  // Body
  body: { padding: '22px 16px 0', animation: 'fadeIn 0.45s ease' },

  photoRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    marginBottom: 22,
    borderRadius: 18,
    background: c.surface,
    border: `1px solid ${c.border}`,
    boxShadow: c.shadow,
    cursor: 'pointer',
    textAlign: 'left',
  },
  rowBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 },
  rowLabel: { fontSize: 14, fontWeight: 700 },
  rowDesc: { fontSize: 12, fontWeight: 500, lineHeight: 1.4 },

  sectionTitle: { fontSize: 11, fontWeight: 800, letterSpacing: 1.1, margin: '0 0 10px 4px' },

  fieldsCard: {
    padding: '18px 16px 2px',
    marginBottom: 22,
    borderRadius: 20,
    background: c.surface,
    border: `1px solid ${c.border}`,
    boxShadow: c.shadow,
  },

  menuCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    background: c.surface,
    border: `1px solid ${c.border}`,
    boxShadow: c.shadow,
  },
  menuRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  menuLabel: { fontSize: 14, fontWeight: 700 },
  divider: { height: 1, marginLeft: 70 },

  logoutBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    fontSize: 14.5,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    marginBottom: 24,
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
    maxWidth: '90%',
  },
})