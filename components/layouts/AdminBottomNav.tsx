'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import styles from './AdminBottomNav.module.css'

// ── Warna ─────────────────────────────────────────────────────────────────────
const ACTIVE   = '#2F6BFF'                          // biru saat aktif / ditekan
const INACTIVE = 'var(--gray-light, #9CA3AF)'
const TINT     = 'rgba(47, 107, 255, 0.16)'         // isi lembut ikon aktif

// ── Types ─────────────────────────────────────────────────────────────────────
interface NavItem {
  href:      string
  labelKey:  'nav_beranda' | 'nav_pendaftar' | 'nav_pembayaran' | 'nav_laporan' | 'nav_profil'
  key:       string
  badge?:    number | null
  /** Tombol tengah: gayanya sama, ukurannya sedikit lebih besar */
  center?:   boolean
  icon: (active: boolean) => ReactNode
}

/** Pembungkus SVG: gaya outline yang konsisten untuk semua ikon */
function Svg({
  stroke, size = 24, strokeWidth = 1.8, children,
}: { stroke: string; size?: number; strokeWidth?: number; children: ReactNode }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const navItems: NavItem[] = [
  {
    href:     '/admin/dashboard',
    labelKey: 'nav_beranda',
    key:      'beranda',
    icon: (active) => (
      <Svg stroke={active ? ACTIVE : INACTIVE}>
        <path
          d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
          fill={active ? TINT : 'none'}
        />
      </Svg>
    ),
  },
  {
    href:     '/admin/pendaftar',
    labelKey: 'nav_pendaftar',
    key:      'pendaftar',
    icon: (active) => (
      <Svg stroke={active ? ACTIVE : INACTIVE}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" fill={active ? TINT : 'none'} />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Svg>
    ),
  },
  {
    href:     '/admin/pembayaran',
    labelKey: 'nav_pembayaran',
    key:      'pembayaran',
    center:   true,
    icon: (active) => {
      const c = active ? ACTIVE : INACTIVE
      return (
        <Svg stroke={c} size={26}>
          <path d="M17 6 14.3 3.6a1.6 1.6 0 0 0-2.1-.1L6 6" />
          <rect x="3" y="6" width="18" height="14" rx="3.5" fill={active ? TINT : 'none'} />
          <path d="M21 11h-4a2 2 0 0 0 0 4h4" />
          <circle cx="17.2" cy="13" r="0.7" fill={c} stroke="none" />
        </Svg>
      )
    },
  },
  {
    href:     '/admin/laporan',
    labelKey: 'nav_laporan',
    key:      'laporan',
    icon: (active) => (
      <Svg stroke={active ? ACTIVE : INACTIVE}>
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <rect x="7"  y="13" width="3" height="5"  rx="0.8" fill={active ? TINT : 'none'} />
        <rect x="12" y="8"  width="3" height="10" rx="0.8" fill={active ? TINT : 'none'} />
        <rect x="17" y="11" width="3" height="7"  rx="0.8" fill={active ? TINT : 'none'} />
      </Svg>
    ),
  },
  {
    href:     '/admin/profile',
    labelKey: 'nav_profil',
    key:      'profil',
    icon: (active) => (
      <Svg stroke={active ? ACTIVE : INACTIVE}>
        <circle cx="12" cy="8" r="4" fill={active ? TINT : 'none'} />
        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
      </Svg>
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
  const { t } = useSettings()

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
            const label      = t(item.labelKey)

            const wrapClass = [
              styles.iconWrap,
              item.center ? styles.iconWrapCenter : '',
              isActive ? styles.iconWrapActive : '',
            ].join(' ')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navItem}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${label}${badgeCount ? `, ${badgeCount} notifikasi` : ''}`}
              >
                <span className={wrapClass}>
                  {item.icon(isActive)}

                  {badgeCount != null && badgeCount > 0 && (
                    <span className={styles.badge} aria-hidden="true">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </span>

                <span className={`${styles.navLabel} ${isActive ? styles.navLabelActive : styles.navLabelInactive}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}