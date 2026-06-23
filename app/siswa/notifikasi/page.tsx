'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './notifikasi.module.css'

/* ════════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════════ */
type NotifType = 'success' | 'error' | 'info' | 'warning' | string

interface NotificationItem {
  id: string
  user_id: string
  title: string
  message: string
  type: NotifType
  is_read: boolean
  created_at: string | null
}

type FilterKey = 'semua' | 'belum_dibaca'

/* ════════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════════ */
function IconArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}
function IconBellHero() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function IconCheckDouble() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12.5l4 4 4-4M8 16.5L18 5.5" opacity="0" />
      <path d="M1 12l4 4L15 6" />
      <path d="M9 16l1.5 1.5L21 7" />
    </svg>
  )
}
function IconSuccess() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 12l2 2 4-4" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="9" stroke="#16a34a" strokeWidth="1.8" />
    </svg>
  )
}
function IconInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#2563eb" strokeWidth="1.8" />
      <path d="M12 11v5" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="0.6" fill="#2563eb" stroke="#2563eb" strokeWidth="1.4" />
    </svg>
  )
}
function IconWarning() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l9.5 17H2.5L12 3z" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 10v4" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.6" fill="#d97706" stroke="#d97706" strokeWidth="1.4" />
    </svg>
  )
}
function IconError() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#dc2626" strokeWidth="1.8" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
function IconBellEmpty() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconRefresh() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 1 2.6 6.3M3 12V7M3 12h5" />
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════ */

/** Pilih ikon & warna berdasarkan tipe notifikasi */
function getTypeVisual(type: NotifType) {
  switch (type) {
    case 'success':
      return { icon: <IconSuccess />, bg: '#dcfce7', accent: '#16a34a', label: 'Berhasil' }
    case 'warning':
      return { icon: <IconWarning />, bg: '#fef3c7', accent: '#d97706', label: 'Perhatian' }
    case 'error':
      return { icon: <IconError />, bg: '#fee2e2', accent: '#dc2626', label: 'Penting' }
    case 'info':
    default:
      return { icon: <IconInfo />, bg: '#dbeafe', accent: '#2563eb', label: 'Info' }
  }
}

/** Format "5 menit lalu", "2 jam lalu", "Kemarin", atau tanggal penuh */
function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  if (diffHour < 24) return `${diffHour} jam lalu`
  if (diffDay === 1) return 'Kemarin'
  if (diffDay < 7) return `${diffDay} hari lalu`

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: diffDay > 365 ? 'numeric' : undefined,
  })
}

/** Kelompokkan notifikasi: Hari Ini / Kemarin / Sebelumnya */
function groupByDate(items: NotificationItem[]) {
  const groups: { label: string; items: NotificationItem[] }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayItems: NotificationItem[] = []
  const yestItems: NotificationItem[] = []
  const olderItems: NotificationItem[] = []

  for (const item of items) {
    if (!item.created_at) {
      olderItems.push(item)
      continue
    }
    const d = new Date(item.created_at)
    d.setHours(0, 0, 0, 0)
    if (d.getTime() === today.getTime()) todayItems.push(item)
    else if (d.getTime() === yesterday.getTime()) yestItems.push(item)
    else olderItems.push(item)
  }

  if (todayItems.length) groups.push({ label: 'Hari Ini', items: todayItems })
  if (yestItems.length) groups.push({ label: 'Kemarin', items: yestItems })
  if (olderItems.length) groups.push({ label: 'Sebelumnya', items: olderItems })

  return groups
}

/* ════════════════════════════════════════════════════════════════
   SUB-COMPONENT — Kartu Notifikasi
   ════════════════════════════════════════════════════════════════ */
function NotificationCard({
  item,
  onMarkRead,
}: {
  item: NotificationItem
  onMarkRead: (id: string) => void
}) {
  const visual = getTypeVisual(item.type)

  return (
    <button
      type="button"
      className={`${styles.notifCard} ${!item.is_read ? styles.notifCardUnread : ''}`}
      style={{ '--accent-color': visual.accent } as React.CSSProperties}
      onClick={() => !item.is_read && onMarkRead(item.id)}
    >
      <div className={styles.notifAccentBar} />
      <div className={styles.notifIconWrap} style={{ background: visual.bg }}>
        {visual.icon}
      </div>
      <div className={styles.notifBody}>
        <div className={styles.notifTopRow}>
          <p className={styles.notifTitle}>{item.title}</p>
          {!item.is_read && <span className={styles.unreadDot} aria-label="Belum dibaca" />}
        </div>
        <p className={styles.notifMessage}>{item.message}</p>
        <p className={styles.notifTime}>{formatRelativeTime(item.created_at)}</p>
      </div>
    </button>
  )
}

/* ════════════════════════════════════════════════════════════════
   SUB-COMPONENT — Skeleton Loading
   ════════════════════════════════════════════════════════════════ */
function NotifSkeleton() {
  return (
    <div className={styles.skeletonWrap}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonIcon} />
          <div className={styles.skeletonLines}>
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
            <div className={styles.skeletonLine} style={{ width: '90%' }} />
            <div className={styles.skeletonLine} style={{ width: '35%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════ */
export default function NotifikasiPage() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('semua')
  const [marking, setMarking] = useState(false)

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/notifications?limit=100', { cache: 'no-store' })
      if (!res.ok) throw new Error('Gagal memuat notifikasi')
      const json = await res.json()
      setItems(Array.isArray(json.data) ? json.data : [])
    } catch (err) {
      console.error('[notifikasi] fetch error:', err)
      setError('Tidak bisa memuat notifikasi. Periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = useMemo(() => items.filter((n) => !n.is_read).length, [items])

  const filteredItems = useMemo(() => {
    if (filter === 'belum_dibaca') return items.filter((n) => !n.is_read)
    return items
  }, [items, filter])

  const grouped = useMemo(() => groupByDate(filteredItems), [filteredItems])

  const handleMarkRead = useCallback(async (id: string) => {
    // Optimistic update
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Gagal menandai dibaca')
    } catch (err) {
      console.error('[notifikasi] mark read error:', err)
      // revert kalau gagal
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)))
    }
  }, [])

  const handleMarkAllRead = useCallback(async () => {
    if (unreadCount === 0 || marking) return
    setMarking(true)
    const prevItems = items
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      if (!res.ok) throw new Error('Gagal menandai semua dibaca')
    } catch (err) {
      console.error('[notifikasi] mark all read error:', err)
      setItems(prevItems)
    } finally {
      setMarking(false)
    }
  }, [items, unreadCount, marking])

  return (
    <div className={styles.shell}>

      {/* ══ HERO / TOP BAR ══════════════════════════════════════════ */}
      <header className={styles.hero}>
        <div className={styles.heroTopRow}>
          <Link href="/siswa/pengaturan" className={styles.backBtn} aria-label="Kembali ke Pengaturan">
            <IconArrowLeft />
          </Link>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            aria-label="Muat ulang"
          >
            <span className={refreshing ? styles.spinning : ''}>
              <IconRefresh />
            </span>
          </button>
        </div>

        <div className={styles.heroMain}>
          <div className={styles.heroIconWrap}>
            <IconBellHero />
            {unreadCount > 0 && (
              <span className={styles.heroBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </div>
          <div>
            <h1 className={styles.heroTitle}>Notifikasi</h1>
            <p className={styles.heroSub}>
              {unreadCount > 0
                ? `${unreadCount} pemberitahuan belum dibaca`
                : 'Semua pemberitahuan sudah dibaca'}
            </p>
          </div>
        </div>
      </header>

      {/* ══ PAGE BODY ══════════════════════════════════════════════ */}
      <div className={styles.pageBody}>

        {/* ── FILTER CHIPS + AKSI ────────────────────────────────── */}
        <div className={styles.controlRow}>
          <div className={styles.filterChips}>
            <button
              type="button"
              className={`${styles.chip} ${filter === 'semua' ? styles.chipActive : ''}`}
              onClick={() => setFilter('semua')}
            >
              Semua
            </button>
            <button
              type="button"
              className={`${styles.chip} ${filter === 'belum_dibaca' ? styles.chipActive : ''}`}
              onClick={() => setFilter('belum_dibaca')}
            >
              Belum dibaca
              {unreadCount > 0 && <span className={styles.chipCount}>{unreadCount}</span>}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className={styles.markAllBtn}
              onClick={handleMarkAllRead}
              disabled={marking}
            >
              <IconCheckDouble />
              <span>Tandai semua</span>
            </button>
          )}
        </div>

        {/* ── KONTEN ──────────────────────────────────────────────── */}
        {loading ? (
          <NotifSkeleton />
        ) : error ? (
          <div className={styles.errorState}>
            <p className={styles.errorText}>{error}</p>
            <button type="button" className={styles.retryBtn} onClick={() => fetchNotifications()}>
              Coba lagi
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <IconBellEmpty />
            </div>
            <p className={styles.emptyTitle}>
              {filter === 'belum_dibaca' ? 'Tidak ada yang belum dibaca' : 'Belum ada notifikasi'}
            </p>
            <p className={styles.emptySub}>
              {filter === 'belum_dibaca'
                ? 'Semua pemberitahuan sudah kamu baca. Kerja bagus!'
                : 'Pemberitahuan tentang pembayaran, pengumuman, dan status pendaftaran akan muncul di sini.'}
            </p>
          </div>
        ) : (
          <div className={styles.groupsWrap}>
            {grouped.map((group) => (
              <div key={group.label} className={styles.group}>
                <p className={styles.groupLabel}>{group.label}</p>
                <div className={styles.cardList}>
                  {group.items.map((item) => (
                    <NotificationCard key={item.id} item={item} onMarkRead={handleMarkRead} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}