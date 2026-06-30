'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './admin-chat.module.css'
import { useChatThreadsRealtime } from '@/lib/useChatRealtime'
import type { ChatThread } from '@/types/chat'

/* ════════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════════ */
function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
function IconVerified() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 1.2 2.6-.4 1.3 2.3 2.3 1.3-.4 2.6L21 12l-1.2 2.4.4 2.6-2.3 1.3-1.3 2.3-2.6-.4L12 22l-2.4-1.2-2.6.4-1.3-2.3-2.3-1.3.4-2.6L3 12l1.2-2.4-.4-2.6 2.3-1.3 1.3-2.3 2.6.4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function IconFilter() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" /><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
      <line x1="4" y1="12" x2="20" y2="12" /><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
      <line x1="4" y1="18" x2="20" y2="18" /><circle cx="11" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconChatEmpty() {
  return <span aria-hidden>💬</span>
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════ */
function formatRelativeTime(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin}m`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}j`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return diffDay === 1 ? 'Kemarin' : `${diffDay} hari lalu`
  const diffWeek = Math.floor(diffDay / 7)
  if (diffWeek < 4) return diffWeek === 1 ? '1 minggu lalu' : `${diffWeek} minggu lalu`
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}
function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}
const AVATAR_COLOR_CLASSES = ['avatarColor0', 'avatarColor1', 'avatarColor2', 'avatarColor3', 'avatarColor4', 'avatarColor5'] as const
function avatarColorClass(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  const key = AVATAR_COLOR_CLASSES[hash % AVATAR_COLOR_CLASSES.length]
  return styles[key]
}

type FilterKey = 'semua' | 'belum_dibaca' | 'ditutup'

// Tinggi headerCardWrap (perkiraan aman): padding atas 14 + tinggi headerCard (~72) + padding bawah 10
// Dipakai sebagai spacer pengganti supaya konten di bawah tidak ketutup header yang fixed.
const HEADER_HEIGHT = 96

export default function AdminChatClient() {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('semua')

  async function loadThreads() {
    try {
      const res = await fetch('/api/admin/chat')
      const json = await res.json()
      if (res.ok) setThreads(json.data ?? [])
    } catch (e) {
      console.error('Gagal memuat daftar chat:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadThreads()
  }, [])

  useChatThreadsRealtime(() => {
    loadThreads()
  })

  const unreadTotal = useMemo(() => threads.reduce((sum, t) => sum + (t.unread_by_admin ?? 0), 0), [threads])

  const filtered = useMemo(() => {
    let list = threads
    if (filter === 'belum_dibaca') list = list.filter((t) => t.unread_by_admin > 0)
    if (filter === 'ditutup') list = list.filter((t) => t.status === 'closed')
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((t) => t.siswa_nama.toLowerCase().includes(q))
    }
    return list
  }, [threads, filter, search])

  return (
    <div className={styles.page}>
      {/* ══ HEADER CARD — FIXED, tidak ikut ter-scroll ═══════════════ */}
      <div className={styles.headerCardWrap}>
        <div className={styles.headerCard}>
          <Link href="/admin" className={styles.backBtn} aria-label="Kembali">
            <IconBack />
          </Link>
          <div className={styles.headerTextWrap}>
            <p className={styles.headerTitle}>Chat Santri</p>
            <div className={styles.headerSubtitleRow}>
              <p className={styles.headerSubtitle}>
                {unreadTotal > 0 ? `${unreadTotal} pesan belum dibaca` : 'Semua pesan sudah dibalas'}
              </p>
              {unreadTotal === 0 && <span className={styles.headerVerifiedIcon}><IconVerified /></span>}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer pengganti — mengisi tempat headerCardWrap yang sekarang fixed,
          supaya search bar & list di bawah tidak ketutup / "loncat" ke atas. */}
      <div style={{ height: HEADER_HEIGHT }} />

      {/* ══ SEARCH & FILTER BUTTON ════════════════════════════════ */}
      <div className={styles.searchRow}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}><IconSearch /></span>
          <input
            className={styles.searchInput}
            placeholder="Cari nama santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="button" className={styles.filterBtn} aria-label="Filter lanjutan">
          <IconFilter />
        </button>
      </div>

      {/* ══ FILTER CHIPS ══════════════════════════════════════════ */}
      <div className={styles.filterRow}>
        {([
          { key: 'semua', label: 'Semua' },
          { key: 'belum_dibaca', label: 'Belum dibaca' },
          { key: 'ditutup', label: 'Ditutup' },
        ] as { key: FilterKey; label: string }[]).map((f) => (
          <button
            key={f.key}
            type="button"
            className={`${styles.filterChip} ${filter === f.key ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === 'belum_dibaca' && unreadTotal > 0 && (
              <span className={styles.filterChipBadge}>{unreadTotal}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ THREAD LIST ═══════════════════════════════════════════ */}
      {loading ? (
        <div className={styles.threadList}>
          {[1, 2, 3, 4].map((i) => <div key={i} className={styles.skelCard} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyWrap}>
          <span className={styles.emptyIcon}><IconChatEmpty /></span>
          <p className={styles.emptyTitle}>Belum ada percakapan</p>
          <p className={styles.emptyText}>
            {search ? 'Tidak ada santri dengan nama tersebut.' : 'Pesan dari santri akan muncul di sini.'}
          </p>
        </div>
      ) : (
        <div className={styles.threadList}>
          {filtered.map((thread) => {
            const isUnread = thread.unread_by_admin > 0
            const lastFromAdmin = thread.last_sender_role === 'admin'
            const isOnline = thread.status === 'open'
            return (
              <Link key={thread.id} href={`/admin/chat/${thread.id}`} className={`${styles.threadCard} ${isUnread ? styles.threadCardUnread : ''}`}>
                <div className={`${styles.threadAvatarWrap} ${avatarColorClass(thread.id)}`}>
                  {thread.siswa_avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thread.siswa_avatar_url} alt={thread.siswa_nama} className={styles.threadAvatarImg} />
                  ) : (
                    initials(thread.siswa_nama)
                  )}
                  <span className={`${styles.threadStatusDot} ${isOnline ? styles.threadStatusDotOpen : ''}`} />
                </div>
                <div className={styles.threadBody}>
                  <div className={styles.threadTopRow}>
                    <p className={styles.threadName}>{thread.siswa_nama}</p>
                    <span className={styles.threadTime}>{formatRelativeTime(thread.last_message_at)}</span>
                  </div>
                  <p className={`${styles.threadPreview} ${isUnread ? styles.threadPreviewUnread : ''} ${lastFromAdmin ? styles.threadPreviewFromMe : ''}`}>
                    {lastFromAdmin && 'Anda: '}{thread.last_message || 'Belum ada pesan'}
                  </p>
                  <div className={styles.threadBottomRow}>
                    <span className={`${styles.statusPill} ${isOnline ? styles.statusPillOnline : ''}`}>
                      <span className={styles.statusDotSmall} />
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {thread.status === 'closed' && <span className={styles.closedTag}>Ditutup</span>}
                      {isUnread && <span className={styles.unreadBadge}>{thread.unread_by_admin}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}