'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from 'next-auth/react'
import styles from './SiswaBottomNav.module.css'

/* ════════════════════════════════════════════════════════════════
   ICON SET — duotone konsisten (24×24, rounded stroke)
   - Warna diwarisi dari CSS lewat currentColor, jadi light/dark mode
     dan tema cukup diatur di SiswaBottomNav.module.css.
   - Saat aktif: stroke sedikit lebih tebal + isian lembut (duotone).
   ════════════════════════════════════════════════════════════════ */
interface IconProps { active: boolean }

function IconSvg({ active, children }: IconProps & { children: ReactElement | ReactElement[] }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

// Isian duotone: transparan saat non-aktif, lembut saat aktif
const tone = (active: boolean) => ({ fill: 'currentColor', fillOpacity: active ? 0.18 : 0 })

/* Beranda — rumah dengan pintu */
function IconHome({ active }: IconProps) {
  return (
    <IconSvg active={active}>
      <path d="M3 10.5 12 3l9 7.5V19a2 2 0 0 1-2 2h-3.5v-5.5a1.5 1.5 0 0 0-1.5-1.5h-4a1.5 1.5 0 0 0-1.5 1.5V21H5a2 2 0 0 1-2-2z" {...tone(active)} />
    </IconSvg>
  )
}

/* Daftar — papan formulir dengan centang */
function IconRegister({ active }: IconProps) {
  return (
    <IconSvg active={active}>
      <rect x="4.5" y="4" width="15" height="17" rx="3" {...tone(active)} />
      <path d="M9 4V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V4" />
      <path d="m8.8 13.2 2.2 2.2 4.2-4.4" />
    </IconSvg>
  )
}

/* Bayar — dompet dengan kartu */
function IconPay({ active }: IconProps) {
  return (
    <IconSvg active={active}>
      <rect x="2.5" y="5.5" width="19" height="14" rx="3" {...tone(active)} />
      <path d="M2.5 10h19" />
      <path d="M6.5 15h3.5" />
      <path d="M16.5 15h1" />
    </IconSvg>
  )
}

/* Status — grafik batang */
function IconStatus({ active }: IconProps) {
  return (
    <IconSvg active={active}>
      <rect x="3.5" y="12" width="4.5" height="8.5" rx="1.5" {...tone(active)} />
      <rect x="9.75" y="4" width="4.5" height="16.5" rx="1.5" {...tone(active)} />
      <rect x="16" y="8.5" width="4.5" height="12" rx="1.5" {...tone(active)} />
    </IconSvg>
  )
}

/* Profil — kepala dan bahu */
function IconProfile({ active }: IconProps) {
  return (
    <IconSvg active={active}>
      <circle cx="12" cy="7.5" r="4" {...tone(active)} />
      <path d="M4 21v-.5a8 8 0 0 1 16 0v.5z" {...tone(active)} />
    </IconSvg>
  )
}

/* ════════════════════════════════════════════════════════════════
   NAV ITEMS
   ════════════════════════════════════════════════════════════════ */
interface NavItem {
  href  : string
  label : string
  key   : 'beranda' | 'daftar' | 'pembayaran' | 'status' | 'profil'
  Icon  : (props: IconProps) => ReactElement
}

const navItems: readonly NavItem[] = [
  { href: '/siswa/dashboard',   label: 'Beranda', key: 'beranda',    Icon: IconHome },
  { href: '/siswa/pendaftaran', label: 'Daftar',  key: 'daftar',     Icon: IconRegister },
  { href: '/siswa/pembayaran',  label: 'Bayar',   key: 'pembayaran', Icon: IconPay },
  { href: '/siswa/status',      label: 'Status',  key: 'status',     Icon: IconStatus },
  { href: '/siswa/profile',     label: 'Profil',  key: 'profil',     Icon: IconProfile },
]

/* ════════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════════ */
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
        {/* Background solid */}
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
                  <item.Icon active={isActive} />
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