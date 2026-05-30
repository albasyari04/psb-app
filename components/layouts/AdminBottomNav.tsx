'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './AdminBottomNav.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────
interface NavItem {
  href:    string
  label:   string
  key:     string
  badge?:  number | null
  icon: (active: boolean) => React.ReactNode
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const navItems: NavItem[] = [
  {
    href:  '/admin/dashboard',
    label: 'Beranda',
    key:   'beranda',
    icon: (active) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          fill={active ? 'rgba(124,58,237,0.15)' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <rect
          x="10" y="15" width="4" height="6"
          fill={active ? '#7c3aed' : 'none'}
          rx="0.5"
        />
      </svg>
    ),
  },
  {
    href:  '/admin/pendaftar',
    label: 'Pendaftar',
    key:   'pendaftar',
    icon: (active) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
        <circle
          cx="9" cy="7" r="4"
          fill={active ? 'rgba(124,58,237,0.12)' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke={active ? '#a78bfa' : '#cbd5e1'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href:  '/admin/pembayaran',
    label: 'Pembayaran',
    key:   'pembayaran',
    icon: (active) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="7" width="18" height="10" rx="2"
          fill={active ? 'rgba(124,58,237,0.10)' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <line
          x1="3" y1="11" x2="21" y2="11"
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <rect x="6" y="14" width="4" height="2" rx="1" fill={active ? '#7c3aed' : '#94a3b8'} />
      </svg>
    ),
  },
  {
    href:  '/admin/laporan',
    label: 'Laporan',
    key:   'laporan',
    icon: (active) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="3" width="18" height="18" rx="3"
          fill={active ? 'rgba(124,58,237,0.10)' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path
          d="M7 8h10M7 12h10M7 16h6"
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href:  '/admin/profile',
    label: 'Profil',
    key:   'profil',
    icon: (active) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="8" r="4"
          fill={active ? 'rgba(124,58,237,0.12)' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path
          d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
  },
]

// ── Props ─────────────────────────────────────────────────────────────────────
interface AdminBottomNavProps {
  /** Badge counts: key = nav key, value = count */
  badges?: Partial<Record<string, number>>
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminBottomNav({ badges = {} }: AdminBottomNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Spacer so page content isn't hidden behind fixed nav */}
      <div className={styles.spacer} />

      <nav className={styles.nav} aria-label="Navigasi utama admin">
        {/* Glassmorphism background */}
        <div className={styles.navBg} />

        <div className={styles.navInner}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.key !== 'beranda' && pathname.startsWith(item.href))

            const badgeCount = badges[item.key] ?? item.badge ?? null

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navItem}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item.label}${badgeCount ? `, ${badgeCount} notifikasi` : ''}`}
              >
                {/* Icon + active top bar */}
                <span className={`${styles.iconWrap} ${isActive ? styles.iconWrapActive : ''}`}>
                  {/* Top indicator bar */}
                  {isActive && <span className={styles.activeBar} aria-hidden="true" />}

                  {/* Icon */}
                  {item.icon(isActive)}

                  {/* Notification badge */}
                  {badgeCount != null && badgeCount > 0 && (
                    <span className={styles.badge} aria-hidden="true">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </span>

                {/* Label */}
                <span className={`${styles.navLabel} ${isActive ? styles.navLabelActive : styles.navLabelInactive}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}