'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

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
// Icons (inline SVG components)
// ─────────────────────────────────────────────────────────────────────────────
const IconCamera = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8" />
  </svg>
)

const IconShield = ({ color = '#16A34A' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="7" r="4" stroke="#16A34A" strokeWidth="1.8" />
  </svg>
)

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#16A34A" strokeWidth="1.8" />
    <path d="M2 8l10 6 10-6" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconRole = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#16A34A" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
)

const IconHome = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={active ? '#16A34A' : '#94A3B8'} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 22V12h6v10" stroke={active ? '#16A34A' : '#94A3B8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconClipboard = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="8" y="2" width="8" height="4" rx="1" stroke={active ? '#16A34A' : '#94A3B8'} strokeWidth="1.8" />
    <path d="M5 4h-1a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1" stroke={active ? '#16A34A' : '#94A3B8'} strokeWidth="1.8" />
    <path d="M9 12h6M9 16h4" stroke={active ? '#16A34A' : '#94A3B8'} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconCard = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke={active ? '#16A34A' : '#94A3B8'} strokeWidth="1.8" />
    <path d="M2 10h20" stroke={active ? '#16A34A' : '#94A3B8'} strokeWidth="1.8" />
    <path d="M6 15h4" stroke={active ? '#16A34A' : '#94A3B8'} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconBarChart = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M18 20V10M12 20V4M6 20v-6" stroke={active ? '#16A34A' : '#94A3B8'} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconProfileNav = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={active ? '#16A34A' : '#94A3B8'} strokeWidth="1.8" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? '#16A34A' : '#94A3B8'} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M9 18l6-6-6-6" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17l5-5-5-5" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12H9" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter()
  const { status } = useSession()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

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

  // ── Fetch profil ────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/siswa/profile')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memuat profil')
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

  // ── Upload foto ─────────────────────────────────────────────────────────
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
      setProfile((prev) => ({ ...prev, avatar_url: data.avatar_url }))
      setToast({ type: 'success', message: 'Foto profil berhasil diperbarui' })
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Gagal mengunggah foto' })
      setAvatarPreview(null)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  const displayedAvatar = avatarPreview || profile.avatar_url

  const initials = (profile.name || profile.email || 'S')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'S'

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  // ── Menu items ──────────────────────────────────────────────────────────
  const menuItems = [
    {
      icon: <IconHome />,
      label: 'Beranda',
      desc: 'Kembali ke dashboard utama',
      href: '/siswa',
    },
    {
      icon: <IconClipboard />,
      label: 'Formulir Pendaftaran',
      desc: 'Isi atau lengkapi data pendaftaran',
      href: '/siswa/pendaftaran',
    },
    {
      icon: <IconBarChart />,
      label: 'Status Pendaftaran',
      desc: 'Pantau progres proses seleksi',
      href: '/siswa/status',
    },
    {
      icon: <IconEdit />,
      label: 'Edit Profil',
      desc: 'Ubah nama dan informasi akun',
      href: '/siswa/profile/edit',
    },
  ]

  // ── Loading ──────────────────────────────────────────────────────────────
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

  return (
    <div style={s.page}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={s.hero}>
        <div style={s.heroOverlay} />

        {/* Header row */}
        <div style={s.heroHeader}>
          <div>
            <h1 style={s.heroTitle}>Profil Saya</h1>
            <p style={s.heroSub}>Kelola informasi akun Anda</p>
          </div>
          <button
            onClick={() => router.push('/siswa/profile/edit')}
            style={s.editBtn}
            type="button"
            aria-label="Edit Profil"
          >
            <IconEdit />
            <span style={s.editBtnText}>Edit Profil</span>
          </button>
        </div>

        {/* Profile card inside hero */}
        <div style={s.heroCard}>
          {/* Avatar */}
          <div style={s.avatarWrap}>
            <div style={s.avatarRing}>
              <div style={s.avatarInner}>
                {displayedAvatar ? (
                  <Image
                    src={displayedAvatar}
                    alt="Foto profil"
                    width={80}
                    height={80}
                    style={s.avatarImg}
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
              aria-label="Ganti foto"
              disabled={uploadingPhoto}
            >
              <IconCamera />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Name & Email */}
          <div style={s.heroCardInfo}>
            <h2 style={s.heroName}>{profile.name || '–'}</h2>
            <div style={s.heroBadgeRow}>
              {profile.status === 'Aktif' && (
                <span style={s.badgeActive}>{profile.status}</span>
              )}
            </div>
            <p style={s.heroEmail}>{profile.email}</p>
          </div>

          {/* Verification badge */}
          {profile.is_verified && (
            <div style={s.veriBadge}>
              <IconShield color="#16A34A" />
              <div>
                <div style={s.veriLabel}>Verifikasi</div>
                <div style={s.veriValue}>Terverifikasi</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div style={s.body}>

        {/* Foto Profil row */}
        <div style={s.rowCard}>
          <div style={s.rowIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                stroke="#16A34A" strokeWidth="1.8" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="4" stroke="#16A34A" strokeWidth="1.8" />
            </svg>
          </div>
          <div style={s.rowBody}>
            <span style={s.rowLabel}>Foto Profil</span>
            <span style={s.rowDesc}>
              Ketuk ikon kamera di avatar untuk mengganti foto.
            </span>
            <span style={s.rowDesc}>Maks. 2 MB · JPG, PNG, WebP</span>
          </div>
          <IconChevronRight />
        </div>

        {/* INFORMASI AKUN */}
        <p style={s.sectionTitle}>INFORMASI AKUN</p>
        <div style={s.groupCard}>
          {/* Nama */}
          <div style={s.infoRow}>
            <div style={s.infoIconWrap}><IconUser /></div>
            <div style={s.infoBody}>
              <span style={s.infoFieldLabel}>Nama Lengkap</span>
              <span style={s.infoFieldValue}>{profile.name || '–'}</span>
            </div>
            <IconChevronRight />
          </div>
          <div style={s.divider} />
          {/* Email */}
          <div style={s.infoRow}>
            <div style={s.infoIconWrap}><IconMail /></div>
            <div style={s.infoBody}>
              <span style={s.infoFieldLabel}>Email</span>
              <span style={s.infoFieldValue}>{profile.email || '–'}</span>
            </div>
            <IconChevronRight />
          </div>
          <div style={s.divider} />
          {/* Role */}
          <div style={s.infoRow}>
            <div style={s.infoIconWrap}><IconRole /></div>
            <div style={s.infoBody}>
              <span style={s.infoFieldLabel}>Role Akun</span>
              <span style={s.infoFieldValue}>{profile.role ?? 'Siswa'}</span>
            </div>
            {profile.status === 'Aktif' && (
              <span style={s.badgeActiveSmall}>Aktif</span>
            )}
            <IconChevronRight />
          </div>
        </div>

        {/* MENU UTAMA */}
        <p style={s.sectionTitle}>MENU UTAMA</p>
        <div style={s.groupCard}>
          {menuItems.map((item, i) => (
            <div key={item.href}>
              <div
                style={s.menuRow}
                onClick={() => router.push(item.href)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && router.push(item.href)}
              >
                <div style={s.menuIconWrap}>{item.icon}</div>
                <div style={s.menuBody}>
                  <span style={s.menuLabel}>{item.label}</span>
                  <span style={s.menuDesc}>{item.desc}</span>
                </div>
                <IconChevronRight />
              </div>
              {i < menuItems.length - 1 && <div style={s.divider} />}
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={s.logoutBtn} type="button">
          <IconLogout />
          <span style={s.logoutText}>Keluar dari Akun</span>
        </button>

      </div>

      {/* ── BOTTOM NAV ───────────────────────────────────────────────────── */}
      <nav style={s.bottomNav}>
        {[
          { icon: <IconHome />, label: 'Beranda', href: '/siswa' },
          { icon: <IconClipboard />, label: 'Daftar', href: '/siswa/pendaftaran' },
          { icon: <IconCard />, label: 'Bayar', href: '/siswa/pembayaran' },
          { icon: <IconBarChart />, label: 'Status', href: '/siswa/status' },
          { icon: <IconProfileNav active />, label: 'Profil', href: '/siswa/profile', active: true },
        ].map((nav) => (
          <button
            key={nav.href}
            onClick={() => router.push(nav.href)}
            style={{ ...s.navItem, ...(nav.active ? s.navItemActive : {}) }}
            type="button"
          >
            {nav.icon}
            <span style={{ ...s.navLabel, ...(nav.active ? s.navLabelActive : {}) }}>
              {nav.label}
            </span>
          </button>
        ))}
      </nav>

      {/* ── TOAST ────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ ...s.toast, ...(toast.type === 'success' ? s.toastSuccess : s.toastError) }}>
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
  * { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  button { font-family: inherit; }
  [role="button"] { cursor: pointer; }
  [role="button"]:hover { opacity: 0.88; }
`

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#F0FDF4',
    paddingBottom: 80,
    maxWidth: 480,
    margin: '0 auto',
    position: 'relative',
  },

  // Loading
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

  // Hero
  hero: {
    position: 'relative',
    background: 'linear-gradient(150deg, #14532D 0%, #16A34A 60%, #22C55E 100%)',
    paddingTop: 52,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle at 80% 10%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 5% 90%, rgba(255,255,255,0.08) 0%, transparent 40%)',
    pointerEvents: 'none',
  },
  heroHeader: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#FFFFFF',
    margin: 0,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.75)',
    margin: '3px 0 0',
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 12,
    padding: '8px 14px',
    cursor: 'pointer',
    backdropFilter: 'blur(6px)',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#FFFFFF',
  },

  // Hero card
  heroCard: {
    position: 'relative',
    zIndex: 2,
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: 20,
    padding: '16px 16px 16px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    backdropFilter: 'blur(8px)',
    animation: 'fadeIn 0.4s ease',
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #A7F3D0, #059669)',
    padding: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 0 3px rgba(255,255,255,0.3)',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: '#1A4731',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    border: '2px solid rgba(255,255,255,0.2)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: 800,
    color: '#FFFFFF',
  },
  uploadOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSpinner: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '2.5px solid rgba(255,255,255,0.35)',
    borderTopColor: '#FFFFFF',
    animation: 'spin 0.8s linear infinite',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#16A34A',
    border: '2px solid #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  },
  heroCardInfo: {
    flex: 1,
    minWidth: 0,
  },
  heroName: {
    fontSize: 17,
    fontWeight: 800,
    color: '#FFFFFF',
    margin: '0 0 4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  heroBadgeRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 4,
  },
  badgeActive: {
    fontSize: 11,
    fontWeight: 700,
    color: '#16A34A',
    background: '#DCFCE7',
    borderRadius: 6,
    padding: '2px 8px',
  },
  badgeActiveSmall: {
    fontSize: 11,
    fontWeight: 700,
    color: '#16A34A',
    background: '#DCFCE7',
    borderRadius: 6,
    padding: '2px 8px',
    whiteSpace: 'nowrap',
    marginRight: 4,
  },
  heroEmail: {
    fontSize: 12.5,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  veriBadge: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 12,
    padding: '8px 12px',
    flexShrink: 0,
  },
  veriLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center' as const,
  },
  veriValue: {
    fontSize: 11.5,
    fontWeight: 700,
    color: '#86EFAC',
    textAlign: 'center' as const,
  },

  // Body
  body: {
    padding: '20px 16px 0',
    animation: 'fadeIn 0.4s ease',
  },

  // Row card (foto profil)
  rowCard: {
    background: '#FFFFFF',
    borderRadius: 16,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
    marginBottom: 16,
    cursor: 'pointer',
  },
  rowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: '#F0FDF4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0F172A',
  },
  rowDesc: {
    fontSize: 12,
    fontWeight: 500,
    color: '#94A3B8',
    lineHeight: 1.4,
  },

  // Section title
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.1,
    color: '#16A34A',
    margin: '0 0 8px 4px',
  },

  // Group card
  groupCard: {
    background: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
    marginBottom: 20,
  },

  // Info rows
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    cursor: 'pointer',
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: '#F0FDF4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 1,
  },
  infoFieldLabel: {
    fontSize: 11.5,
    fontWeight: 500,
    color: '#94A3B8',
  },
  infoFieldValue: {
    fontSize: 14.5,
    fontWeight: 600,
    color: '#0F172A',
  },

  // Divider
  divider: {
    height: 1,
    background: '#F1F5F9',
    marginLeft: 64,
  },

  // Menu rows
  menuRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#F0FDF4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0F172A',
  },
  menuDesc: {
    fontSize: 12,
    fontWeight: 500,
    color: '#94A3B8',
  },

  // Logout
  logoutBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    border: '1.5px solid #FECACA',
    background: '#FFF5F5',
    color: '#EF4444',
    fontSize: 14.5,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    marginBottom: 24,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14.5,
    fontWeight: 700,
  },

  // Bottom nav
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
    padding: '8px 0 12px',
    zIndex: 10,
  },
  navItem: {
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
  navItemActive: {},
  navLabel: {
    fontSize: 10.5,
    fontWeight: 600,
    color: '#94A3B8',
  },
  navLabelActive: {
    color: '#16A34A',
  },

  // Toast
  toast: {
    position: 'fixed',
    bottom: 92,
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
    whiteSpace: 'nowrap',
  },
  toastSuccess: { background: '#16A34A' },
  toastError: { background: '#DC2626' },
}