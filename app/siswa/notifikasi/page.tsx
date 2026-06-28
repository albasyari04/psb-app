'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

type FilterKey = 'semua' | 'belum_dibaca' | 'transaksi' | 'info' | 'promo'
type SortKey = 'terbaru' | 'terlama'

/* ════════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════════ */
function IconArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

function IconCheckDouble() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12l4 4L15 6" />
      <path d="M9 16l1.5 1.5L21 7" />
    </svg>
  )
}
function IconChevronRight() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
function IconDocCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#0e7c5f" strokeWidth="1.8" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" stroke="#0e7c5f" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 14l1.8 1.8L15 12" stroke="#0e7c5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconCard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="#b45309" strokeWidth="1.8" />
      <path d="M2 10h20" stroke="#b45309" strokeWidth="1.8" />
    </svg>
  )
}
function IconInfo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#2563eb" strokeWidth="1.8" />
      <path d="M12 11v5" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="0.6" fill="#2563eb" stroke="#2563eb" strokeWidth="1.4" />
    </svg>
  )
}
function IconWarning() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l9.5 17H2.5L12 3z" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 10v4" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.6" fill="#d97706" stroke="#d97706" strokeWidth="1.4" />
    </svg>
  )
}
function IconError() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#dc2626" strokeWidth="1.8" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
function IconBellEmpty() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconTagEmpty() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
      <path d="M20.6 12.6L13 5H6a2 2 0 0 0-2 2v7l7.6 7.6a2 2 0 0 0 2.8 0l6.2-6.2a2 2 0 0 0 0-2.8z" stroke="#9ca3af" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="1.4" fill="#9ca3af" />
    </svg>
  )
}


/* ════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════ */

const TRANSAKSI_KEYWORDS = ['pembayaran', 'tagihan', 'transfer', 'spp', 'bayar']

/** Kategori turunan dari title/message + type, dipakai untuk filter chip */
function getCategory(item: NotificationItem): 'transaksi' | 'info' {
  const text = `${item.title} ${item.message}`.toLowerCase()
  const isTransaksi = TRANSAKSI_KEYWORDS.some((kw) => text.includes(kw))
  return isTransaksi ? 'transaksi' : 'info'
}

/** Pilih ikon & warna pastel berdasarkan tipe + kategori notifikasi */
function getTypeVisual(item: NotificationItem) {
  const category = getCategory(item)

  if (category === 'transaksi') {
    return { icon: <IconCard />, bg: '#fdecc8' }
  }

  switch (item.type) {
    case 'success':
      return { icon: <IconDocCheck />, bg: '#d8f0e3' }
    case 'warning':
      return { icon: <IconWarning />, bg: '#fef3c7' }
    case 'error':
      return { icon: <IconError />, bg: '#fee2e2' }
    case 'info':
    default:
      return { icon: <IconInfo />, bg: '#dbeafe' }
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
  if (diffMin < 60) return `${diffMin} menit yang lalu`
  if (diffHour < 24) return `${diffHour} jam yang lalu`
  if (diffDay === 1) return 'Kemarin'
  if (diffDay < 7) return `${diffDay} hari yang lalu`

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
  const visual = getTypeVisual(item)
  const isUnread = !item.is_read

  return (
    <button
      type="button"
      className={`${styles.notifCard} ${isUnread ? styles.notifCardUnread : ''}`}
      onClick={() => isUnread && onMarkRead(item.id)}
    >
      {isUnread && <span className={styles.notifSideBar} />}
      <div className={styles.notifIconWrap} style={{ background: visual.bg }}>
        {visual.icon}
      </div>
      <div className={styles.notifBody}>
        <p className={styles.notifTitle}>{item.title}</p>
        <p className={styles.notifMessage}>{item.message}</p>
        <p className={styles.notifTime}>{formatRelativeTime(item.created_at)}</p>
      </div>
      <span className={styles.notifChevron}>
        <IconChevronRight />
      </span>
      {isUnread && <span className={styles.notifDotIndicator} aria-hidden="true" />}
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
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('semua')
  const [sort, setSort] = useState<SortKey>('terbaru')
  const [sortOpen, setSortOpen] = useState(false)
  const [marking, setMarking] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
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
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Tutup dropdown sort saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = useMemo(() => items.filter((n) => !n.is_read).length, [items])

  const filteredItems = useMemo(() => {
    let result = items
    if (filter === 'belum_dibaca') result = result.filter((n) => !n.is_read)
    else if (filter === 'transaksi') result = result.filter((n) => getCategory(n) === 'transaksi')
    else if (filter === 'info') result = result.filter((n) => getCategory(n) === 'info')
    else if (filter === 'promo') result = [] // belum ada sumber data promo di sistem

    const sorted = [...result].sort((a, b) => {
      const tA = a.created_at ? new Date(a.created_at).getTime() : 0
      const tB = b.created_at ? new Date(b.created_at).getTime() : 0
      return sort === 'terbaru' ? tB - tA : tA - tB
    })

    return sorted
  }, [items, filter, sort])

  const grouped = useMemo(() => groupByDate(filteredItems), [filteredItems])

  const handleMarkRead = useCallback(async (id: string) => {
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

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'belum_dibaca', label: 'Belum dibaca' },
    { key: 'transaksi', label: 'Transaksi' },
    { key: 'info', label: 'Info' },
    { key: 'promo', label: 'Promo' },
  ]

  const emptyMessage = (() => {
    if (filter === 'belum_dibaca') {
      return { title: 'Tidak ada yang belum dibaca', sub: 'Semua pemberitahuan sudah kamu baca. Kerja bagus!', icon: <IconBellEmpty /> }
    }
    if (filter === 'promo') {
      return { title: 'Belum ada promo', sub: 'Saat ini belum ada penawaran atau promo yang tersedia untukmu.', icon: <IconTagEmpty /> }
    }
    if (filter === 'transaksi') {
      return { title: 'Belum ada notifikasi transaksi', sub: 'Pemberitahuan tentang pembayaran dan tagihan akan muncul di sini.', icon: <IconBellEmpty /> }
    }
    if (filter === 'info') {
      return { title: 'Belum ada informasi', sub: 'Pemberitahuan umum seperti pengumuman dan jadwal akan muncul di sini.', icon: <IconBellEmpty /> }
    }
    return { title: 'Belum ada notifikasi', sub: 'Pemberitahuan tentang pembayaran, pengumuman, dan status pendaftaran akan muncul di sini.', icon: <IconBellEmpty /> }
  })()

  return (
    <div className={styles.shell}>

      {/* ══ TOP BAR (gaya pengaturan: putih, kotak rounded) ══════════ */}
      <header className={`${styles.topBar} ${styles.topBarSticky}`}>
        <Link href="/siswa/pengaturan" className={styles.topBarBtn} aria-label="Kembali ke Pengaturan">
          <IconArrowLeft />
        </Link>
        <div className={styles.topBarCenter}>
          <h1 className={styles.topBarTitle}>Notifikasi</h1>
          <p className={styles.topBarSub}>Pemberitahuan penting untuk Anda</p>
        </div>
        <div className={styles.topBarBtn} style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image src="/icons/notif-icon.png" alt="Notifikasi" width={38} height={38} style={{ objectFit: 'contain' }} />
        </div>
      </header>

      {/* ══ PAGE BODY ══════════════════════════════════════════════ */}
      <div className={styles.pageBody}>

        {/* ── FILTER CHIPS ────────────────────────────────────────── */}
        <div className={styles.filterChipsRow}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.chip} ${filter === f.key ? styles.chipActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
              <span>{f.label}</span>
              {f.key === 'belum_dibaca' && unreadCount > 0 && (
                <span className={styles.chipCount}>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── CONTROL ROW: tandai semua + urutkan ─────────────────── */}
        <div className={styles.controlRow}>
          {unreadCount > 0 ? (
            <button
              type="button"
              className={styles.markAllBtn}
              onClick={handleMarkAllRead}
              disabled={marking}
            >
              <IconCheckDouble />
              <span>Tandai semua sebagai dibaca</span>
            </button>
          ) : <span />}

          <div className={styles.sortWrap} ref={sortRef}>
            <button
              type="button"
              className={styles.sortBtn}
              onClick={() => setSortOpen((v) => !v)}
            >
              <span>Urutkan {sort === 'terbaru' ? 'terbaru' : 'terlama'}</span>
              <IconChevronDown />
            </button>
            {sortOpen && (
              <div className={styles.sortMenu}>
                <button
                  type="button"
                  className={`${styles.sortMenuItem} ${sort === 'terbaru' ? styles.sortMenuItemActive : ''}`}
                  onClick={() => { setSort('terbaru'); setSortOpen(false) }}
                >
                  Terbaru
                </button>
                <button
                  type="button"
                  className={`${styles.sortMenuItem} ${sort === 'terlama' ? styles.sortMenuItemActive : ''}`}
                  onClick={() => { setSort('terlama'); setSortOpen(false) }}
                >
                  Terlama
                </button>
              </div>
            )}
          </div>
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
            <div className={styles.emptyIconWrap}>{emptyMessage.icon}</div>
            <p className={styles.emptyTitle}>{emptyMessage.title}</p>
            <p className={styles.emptySub}>{emptyMessage.sub}</p>
          </div>
        ) : (
          <>
            <div className={styles.groupsWrap}>
              {grouped.map((group) => (
                <div key={group.label} className={styles.group}>
                  <p className={styles.groupLabel}>{group.label.toUpperCase()}</p>
                  <div className={styles.cardList}>
                    {group.items.map((item) => (
                      <NotificationCard key={item.id} item={item} onMarkRead={handleMarkRead} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}