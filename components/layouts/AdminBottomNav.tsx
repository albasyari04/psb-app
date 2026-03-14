'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './AdminBottomNav.module.css'

// ── Nav items ─────────────────────────────────────────────────────────────────
const navItems = [
  {
    href:  '/admin/dashboard',
    label: 'Beranda',
    key:   'beranda',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          fill={active ? '#7c3aed' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8" strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href:  '/admin/pendaftar',
    label: 'Pendaftar',
    key:   'pendaftar',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          fill={active ? '#7c3aed' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
        <circle cx="9" cy="7" r="4"
          fill={active ? '#7c3aed' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href:  '/admin/verifikasi',
    label: 'Verifikasi',
    key:   'verifikasi',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 11l3 3L22 4"
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
          fill={active ? 'rgba(124,58,237,0.1)' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href:  '/admin/profile',
    label: 'Profil',
    key:   'profil',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4"
          fill={active ? '#7c3aed' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <>
      <div className={styles.spacer} />
      <nav className={styles.nav} aria-label="Navigasi utama admin">
        <div className={styles.navBg} />
        <div className={styles.navInner}>
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.key !== 'beranda' && pathname.startsWith(item.href))

            const iconActiveClass  = isActive
              ? (styles[`iconActive_${item.key}`]     as string | undefined) ?? ''
              : ''
            const activeBarClass   = isActive
              ? (styles[`activeBar_${item.key}`]      as string | undefined) ?? ''
              : ''
            const labelActiveClass = isActive
              ? (styles[`navLabelActive_${item.key}`] as string | undefined) ?? ''
              : styles.navLabelInactive

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navItem}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={`${styles.iconWrap} ${iconActiveClass}`}>
                  {isActive && (
                    <span className={`${styles.activeBar} ${activeBarClass}`} />
                  )}
                  {item.icon(isActive)}
                </span>
                <span className={`${styles.navLabel} ${labelActiveClass}`}>
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