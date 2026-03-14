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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          fill={active ? '#2563eb' : 'none'}
          stroke={active ? '#2563eb' : '#94a3b8'}
          strokeWidth="1.8" strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href:  '/siswa/pendaftaran',
    label: 'Daftar',
    key:   'daftar',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2.5"
          fill={active ? '#4f46e5' : 'none'}
          stroke={active ? '#4f46e5' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path d="M8 8H16M8 12H16M8 16H12"
          stroke={active ? '#ffffff' : '#94a3b8'}
          strokeWidth="1.6" strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href:  '/siswa/status',
    label: 'Status',
    key:   'status',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3"
          fill={active ? '#059669' : 'none'}
          stroke={active ? '#059669' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path d="M7 16L10 12L13 14L17 9"
          stroke={active ? '#ffffff' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href:  '/siswa/profile',
    label: 'Profil',
    key:   'profil',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4"
          fill={active ? '#d97706' : 'none'}
          stroke={active ? '#d97706' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
          stroke={active ? '#d97706' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round"
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

    // Fungsi fetch didefinisikan DALAM effect — tidak perlu useRef/useCallback
    // setState dipanggil dari dalam fungsi async ini, bukan dari body effect langsung
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
        () => {
          // setState dipanggil dari Realtime callback = sistem eksternal = valid
          void fetchUnread()
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [session?.user?.id])

  return (
    <>
      <div className={styles.spacer} />
      <nav className={styles.nav} aria-label="Navigasi utama siswa">
        <div className={styles.navBg} />
        <div className={styles.navInner}>
          {navItems.map((item) => {
            const isActive  = pathname === item.href
            const showBadge = item.key === 'beranda' && unreadCount > 0

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
                  {showBadge && (
                    <span className={styles.navBadge}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
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