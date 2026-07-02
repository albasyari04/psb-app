'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { useSettings } from '@/contexts/SettingsContext'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface AdminProfileData {
  name: string
  email: string
  role: string
  system: string
  academic_year: string
  avatar_url: string | null
  last_login: string | null
  is_active: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icon Components
// ─────────────────────────────────────────────────────────────────────────────

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="var(--purple)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconGear = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="var(--purple)" strokeWidth="1.8" />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke="var(--purple)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2l8 3.5v6c0 5-3.4 8-8 10.5-4.6-2.5-8-5.5-8-10.5v-6L12 2z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 12l2 2 4-4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      stroke="var(--purple)"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <circle cx="12" cy="7" r="4" stroke="var(--purple)" strokeWidth="1.9" />
  </svg>
)

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="var(--purple)" strokeWidth="1.9" />
    <path d="M2 8l10 6 10-6" stroke="var(--purple)" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
)

const IconBadge = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="5" stroke="var(--purple)" strokeWidth="1.9" />
    <path
      d="M8.5 13.5L7 22l5-2.5 5 2.5-1.5-8.5"
      stroke="var(--purple)"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke="var(--purple)"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 22V12h6v10"
      stroke="var(--purple)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="var(--purple)" strokeWidth="1.8" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="var(--purple)" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
      stroke="var(--purple)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" stroke="var(--purple)" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke="var(--violet-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      stroke="#DC2626"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17l5-5-5-5M21 12H9"
      stroke="#DC2626"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconLayers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l9 5-9 5-9-5z" stroke="var(--purple)" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M3 12l9 5 9-5" stroke="var(--purple)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 16.5l9 5 9-5" stroke="var(--purple)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="var(--purple)" strokeWidth="1.8" />
    <path d="M12 7v5l3.5 2" stroke="var(--purple)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ── Bottom nav icons ──────────────────────────────────────────────────────────
const IconNavHome = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke={active ? 'var(--purple)' : 'var(--gray-light)'}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 22V12h6v10"
      stroke={active ? 'var(--purple)' : 'var(--gray-light)'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconNavClipboard = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="3" width="14" height="18" rx="2" stroke={active ? 'var(--purple)' : 'var(--gray-light)'} strokeWidth="1.8" />
    <path d="M9 3h6v2H9z" stroke={active ? 'var(--purple)' : 'var(--gray-light)'} strokeWidth="1.8" />
    <path d="M9 10h6M9 14h4" stroke={active ? 'var(--purple)' : 'var(--gray-light)'} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconNavCard = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke={active ? 'var(--purple)' : 'var(--gray-light)'} strokeWidth="1.8" />
    <path d="M2 10h20" stroke={active ? 'var(--purple)' : 'var(--gray-light)'} strokeWidth="1.8" />
    <path d="M6 15h4" stroke={active ? 'var(--purple)' : 'var(--gray-light)'} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const IconNavBarChart = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 20V10M12 20V4M6 20v-6"
      stroke={active ? 'var(--purple)' : 'var(--gray-light)'}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const IconNavProfile = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={active ? 'var(--purple)' : 'var(--gray-light)'} strokeWidth="1.8" />
    <path
      d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
      stroke={active ? 'var(--purple)' : 'var(--gray-light)'}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminProfilePage() {
  const router = useRouter()
  const { status } = useSession()
  const { t } = useSettings()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<AdminProfileData | null>(null)

  // ── Fetch profil admin ───────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/profile')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memuat profil')
      setProfile(data.profile)
    } catch {
      // fallback aman bila API belum tersedia, jangan blok render
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') fetchProfile()
    else if (status === 'unauthenticated') router.replace('/login')
  }, [status, fetchProfile, router])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const name = profile?.name ?? 'Admin PSB'
  const email = profile?.email ?? 'adminpsb@gmail.com'
  const role = profile?.role ?? 'Admin'
  const system = profile?.system ?? 'PSB 2025/2026'
  const lastLogin = profile?.last_login ?? '-'
  const isActive = profile?.is_active ?? true

  const initials =
    name
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'A'

  // ── Bottom nav items ──────────────────────────────────────────────────────
  const navItems = [
    { label: 'Beranda', icon: <IconNavHome />, href: '/admin/dashboard' },
    { label: 'Pendaftar', icon: <IconNavClipboard />, href: '/admin/pendaftar' },
    { label: 'Pembayaran', icon: <IconNavCard />, href: '/admin/pembayaran' },
    { label: 'Laporan', icon: <IconNavBarChart />, href: '/admin/laporan' },
    { label: 'Profil', icon: <IconNavProfile active />, href: '/admin/profile', active: true },
  ]

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.page} className="admin-zoom-scope">
        <div style={s.loadingWrap}>
          <div style={s.spinner} />
          <p style={s.loadingText}>{t('profile_loading')}</p>
        </div>
        <style>{globalCss}</style>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.page} className="admin-zoom-scope">

      {/* ── HEADER (putih simpel, sama pola dgn halaman Pengaturan) ───────── */}
      <div style={s.header}>
        <button
          onClick={() => router.back()}
          style={s.iconBtn}
          type="button"
          aria-label={t('chat_back')}
        >
          <IconArrowLeft />
        </button>

        <div style={s.headerCenter}>
          <h1 style={s.headerTitle}>{t('profile_header_title')}</h1>
          <p style={s.headerSub}>{t('profile_header_sub')}</p>
        </div>

        <button
          onClick={() => router.push('/admin/profile/edit')}
          style={s.iconBtn}
          type="button"
          aria-label={t('profile_edit_aria')}
        >
          <IconGear />
        </button>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div style={s.body}>

        {/* ── KARTU IDENTITAS (avatar, nama, email, badge) ───────────────── */}
        <div style={s.identityCard}>
          <div style={s.avatarWrap}>
            <div style={s.avatarCircle}>
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={name} style={s.avatarImg} />
              ) : (
                <span style={s.avatarInitials}>{initials}</span>
              )}
            </div>
            <button
              style={s.avatarCameraBtn}
              type="button"
              aria-label={t('profile_photo_aria')}
              onClick={() => router.push('/admin/profile/edit')}
            >
              <IconCamera />
            </button>
          </div>

          <div style={s.identityText}>
            <h2 style={s.identityName}>{name}</h2>
            <p style={s.identityEmail}>{email}</p>
            <span style={s.roleBadge}>
              <IconShield />
              {role} &middot; {system}
            </span>
          </div>

          <button
            onClick={() => router.push('/admin/profile/edit')}
            style={s.editProfileBtn}
            type="button"
            aria-label={t('profile_edit_aria')}
          >
            <IconEdit />
          </button>
        </div>

        {/* ── INFORMASI AKUN ─────────────────────────────────────────────── */}
        <p style={s.sectionLabel}>{t('profile_section_akun')}</p>
        <div style={s.card}>
          <InfoRow icon={<IconUser />} label={t('profile_label_nama')} value={name} />
          <InfoRow icon={<IconMail />} label={t('profile_label_email')} value={email} />
          <InfoRow icon={<IconBadge />} label={t('profile_label_peran')} value={<span style={s.pillViolet}>{role}</span>} />
          <InfoRow icon={<IconLayers />} label={t('profile_label_sistem')} value={system} />
          <InfoRow icon={<IconClock />} label={t('profile_label_login')} value={lastLogin} />
          <InfoRow
            icon={<IconShield />}
            label={t('profile_label_status')}
            value={
              <span style={isActive ? s.pillGreen : s.pillGray}>
                {isActive ? t('profile_status_aktif') : t('profile_status_nonaktif')}
              </span>
            }
            isLast
          />
        </div>

        {/* ── MENU UTAMA (sama struktur dgn "Menu Utama" siswa) ──────────── */}
        <p style={s.sectionLabel}>{t('profile_section_menu')}</p>
        <div style={s.card}>
          <MenuRow
            icon={<IconHome />}
            title={t('nav_beranda')}
            subtitle={t('profile_menu_beranda_sub')}
            onClick={() => router.push('/admin/dashboard')}
          />
          <MenuRow
            icon={<IconEdit />}
            title={t('profile_menu_ubahprofil')}
            subtitle={t('profile_menu_ubahprofil_sub')}
            onClick={() => router.push('/admin/profile/edit')}
          />
          <MenuRow
            icon={<IconLock />}
            title={t('profile_menu_ubahpassword')}
            subtitle={t('profile_menu_ubahpassword_sub')}
            onClick={() => router.push('/admin/profile/password')}
          />
          <MenuRow
            icon={<IconBell />}
            title={t('settings_notif_title')}
            subtitle={t('profile_menu_notifikasi_sub')}
            onClick={() => router.push('/admin/notifikasi')}
            isLast
          />
        </div>

        {/* ── LOGOUT ──────────────────────────────────────────────────────── */}
        <button onClick={handleLogout} style={s.logoutBtn} type="button">
          <IconLogout />
          <span>{t('profile_logout')}</span>
        </button>

        <p style={s.footerVersion}>PSB App v1.0 &middot; Admin Panel</p>
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

      <style>{globalCss}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  isLast,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  isLast?: boolean
}) {
  return (
    <div style={{ ...s.infoRow, ...(isLast ? { borderBottom: 'none' } : {}) }}>
      <div style={s.infoRowIconWrap}>{icon}</div>
      <div style={s.infoRowTextWrap}>
        <span style={s.infoRowLabel}>{label}</span>
        <div style={s.infoRowValue}>{value}</div>
      </div>
    </div>
  )
}

function MenuRow({
  icon,
  title,
  subtitle,
  onClick,
  isLast,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick: () => void
  isLast?: boolean
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{ ...s.menuRow, ...(isLast ? { borderBottom: 'none' } : {}) }}
    >
      <div style={s.menuRowIconWrap}>{icon}</div>
      <div style={s.menuRowTextWrap}>
        <span style={s.menuRowTitle}>{title}</span>
        <span style={s.menuRowSubtitle}>{subtitle}</span>
      </div>
      <IconChevronRight />
    </button>
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
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  button { font-family: inherit; }
`

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {

  /* ── Page shell ── */
  page: {
    minHeight: '100vh',
    background: 'var(--purple-lighter)',
    maxWidth: 430,
    margin: '0 auto',
    position: 'relative',
    paddingBottom: 96,
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
    border: '3px solid var(--purple-light)',
    borderTopColor: 'var(--purple)',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--gray)',
    margin: 0,
  },

  /* ── Header (putih simpel, sticky agar tetap di atas saat scroll) ── */
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '20px 20px 16px',
    background: 'var(--purple-lighter)',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    border: '1.5px solid var(--purple-light)',
    background: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center' as const,
  },
  headerTitle: {
    fontSize: 18.5,
    fontWeight: 800,
    color: 'var(--ink)',
    margin: 0,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--gray-light)',
    margin: '2px 0 0',
  },

  /* ── Kartu identitas (avatar, nama, email, badge) ── */
  identityCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: 'var(--white)',
    borderRadius: 18,
    padding: '18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 6px 18px rgba(109,40,217,0.06)',
    marginBottom: 22,
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'var(--purple-lighter)',
    border: '2px solid var(--purple-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarInitials: {
    fontSize: 21,
    fontWeight: 800,
    color: 'var(--purple)',
  },
  avatarCameraBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'var(--purple)',
    border: '2px solid var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  identityName: {
    fontSize: 15.5,
    fontWeight: 800,
    color: 'var(--ink)',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  identityEmail: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--gray-light)',
    margin: '2px 0 7px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--purple-lighter)',
    borderRadius: 20,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--purple)',
  },
  editProfileBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    border: 'none',
    background: 'var(--purple-lighter)',
    color: 'var(--purple)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },

  /* ── Body ── */
  body: {
    padding: '0 16px',
    animation: 'fadeUp 0.4s ease',
  },

  /* ── Quick stats card ── */
  quickStatsCard: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--white)',
    borderRadius: 20,
    padding: '18px 8px',
    boxShadow: '0 4px 20px rgba(109,40,217,0.12)',
    marginBottom: 22,
  },
  quickStatItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  quickStatIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'var(--purple-lighter)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatValue: {
    fontSize: 13,
    fontWeight: 800,
    color: 'var(--ink)',
  },
  quickStatLabel: {
    fontSize: 10.5,
    fontWeight: 600,
    color: 'var(--gray-light)',
  },
  quickStatDivider: {
    width: 1,
    height: 38,
    background: 'var(--purple-light)',
  },

  /* ── Section label ── */
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: 800,
    color: 'var(--purple)',
    letterSpacing: 0.6,
    margin: '0 4px 10px',
  },

  /* ── Card ── */
  card: {
    background: 'var(--white)',
    borderRadius: 18,
    padding: '4px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 6px 18px rgba(109,40,217,0.06)',
    marginBottom: 22,
  },

  /* ── Info row ── */
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '15px 0',
    borderBottom: '1px solid var(--purple-lighter)',
  },
  infoRowIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    background: 'var(--purple-lighter)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoRowTextWrap: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  infoRowLabel: {
    fontSize: 12.5,
    fontWeight: 500,
    color: 'var(--gray-light)',
  },
  infoRowValue: {
    fontSize: 13.5,
    fontWeight: 700,
    color: 'var(--ink)',
    textAlign: 'right' as const,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  pillViolet: {
    display: 'inline-block',
    background: 'var(--purple-light)',
    color: 'var(--violet-1)',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 20,
    padding: '3px 12px',
  },
  pillGreen: {
    display: 'inline-block',
    background: '#DCFCE7',
    color: '#15803D',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 20,
    padding: '3px 12px',
  },
  pillGray: {
    display: 'inline-block',
    background: 'var(--border)',
    color: 'var(--gray)',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 20,
    padding: '3px 12px',
  },

  /* ── Menu row ── */
  menuRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 0',
    borderBottom: '1px solid var(--purple-lighter)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  menuRowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'var(--purple-lighter)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuRowTextWrap: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--ink)',
  },
  menuRowSubtitle: {
    fontSize: 11.5,
    fontWeight: 500,
    color: 'var(--gray-light)',
  },

  /* ── Logout button ── */
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: '#FEF2F2',
    border: '1.5px solid #FECACA',
    borderRadius: 16,
    padding: '15px 0',
    color: '#DC2626',
    fontSize: 14.5,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 18,
  },

  footerVersion: {
    textAlign: 'center' as const,
    fontSize: 11.5,
    fontWeight: 500,
    color: 'var(--purple-light)',
    marginBottom: 8,
  },

  /* ── Bottom nav ── */
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    background: 'var(--white)',
    borderTop: '1px solid var(--purple-light)',
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
    color: 'var(--gray-light)',
  },
  navLabelActive: {
    color: 'var(--purple)',
  },
}