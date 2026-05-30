'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from 'next-auth/react'
import styles from './SiswaBottomNav.module.css'

// ── Nav items ─────────────────────────────────────────────────────────────────
const navItems = [
  {
    href:  '/siswa/dashboard',
    label: 'Beranda',
    key:   'beranda',
    icon: (active: boolean) => (
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
    href:  '/siswa/pendaftaran',
    label: 'Daftar',
    key:   'daftar',
    icon: (active: boolean) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
        <rect
          x="4" y="3" width="16" height="18" rx="2.5"
          fill={active ? 'rgba(124,58,237,0.10)' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path
          d="M8 8H16M8 12H16M8 16H12"
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href:  '/siswa/pembayaran',
    label: 'Bayar',
    key:   'pembayaran',
    icon: (active: boolean) => (
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
    href:  '/siswa/status',
    label: 'Status',
    key:   'status',
    icon: (active: boolean) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="3" width="18" height="18" rx="3"
          fill={active ? 'rgba(124,58,237,0.10)' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path
          d="M7 16L10 12L13 14L17 9"
          stroke={active ? '#7c3aed' : '#94a3b8'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href:  '/siswa/profile',
    label: 'Profil',
    key:   'profil',
    icon: (active: boolean) => (
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
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const

// ── Component ─────────────────────────────────────────────────────────────────
export default function SiswaBottomNav() {
  const pathname          = usePathname()
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) return

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('is_read', false)
      setUnreadCount(count ?? 0)
    }

    void fetchUnread()

    const channel = supabase
      .channel(`nav-notif-${uid}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${uid}`,
        },
        () => { void fetchUnread() }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [session?.user?.id])

  return (
    <>
      <div className={styles.spacer} />

      <nav className={styles.nav} aria-label="Navigasi utama siswa">
        {/* Glassmorphism background */}
        <div className={styles.navBg} />

        <div className={styles.navInner}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.key !== 'beranda' && pathname.startsWith(item.href))

            const showBadge = item.key === 'beranda' && unreadCount > 0

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navItem}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item.label}${showBadge ? `, ${unreadCount} notifikasi` : ''}`}
              >
                <span className={`${styles.iconWrap} ${isActive ? styles.iconWrapActive : ''}`}>
                  {isActive && <span className={styles.activeBar} aria-hidden="true" />}
                  {item.icon(isActive)}
                  {showBadge && (
                    <span className={styles.badge} aria-hidden="true">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
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