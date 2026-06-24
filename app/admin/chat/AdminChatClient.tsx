'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminPageShell from '../AdminPageShell'
import styles from './admin-chat.module.css'
import { useChatThreadsRealtime } from '@/lib/useChatRealtime'
import type { ChatThread } from '@/types/chat'

/* ════════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════════ */
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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
  if (diffDay < 7) return `${diffDay}h`
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}
function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

type FilterKey = 'semua' | 'belum_dibaca' | 'ditutup'

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
    <AdminPageShell
      title="Chat Santri"
      subtitle={unreadTotal > 0 ? `${unreadTotal} pesan belum dibaca` : 'Semua pesan sudah dibalas'}
    >
      <div className={styles.wrap}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}><IconSearch /></span>
          <input
            className={styles.searchInput}
            placeholder="Cari nama santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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
              return (
                <Link key={thread.id} href={`/admin/chat/${thread.id}`} className={`${styles.threadCard} ${isUnread ? styles.threadCardUnread : ''}`}>
                  <div className={styles.threadAvatarWrap}>
                    {thread.siswa_avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thread.siswa_avatar_url} alt={thread.siswa_nama} className={styles.threadAvatarImg} />
                    ) : (
                      initials(thread.siswa_nama)
                    )}
                    <span className={`${styles.threadStatusDot} ${thread.status === 'open' ? styles.threadStatusDotOpen : ''}`} />
                  </div>
                  <div className={styles.threadBody}>
                    <div className={styles.threadTopRow}>
                      <p className={styles.threadName}>{thread.siswa_nama}</p>
                      <span className={styles.threadTime}>{formatRelativeTime(thread.last_message_at)}</span>
                    </div>
                    <div className={styles.threadBottomRow}>
                      <p className={`${styles.threadPreview} ${isUnread ? styles.threadPreviewUnread : ''} ${lastFromAdmin ? styles.threadPreviewFromMe : ''}`}>
                        {lastFromAdmin && 'Anda: '}{thread.last_message || 'Belum ada pesan'}
                      </p>
                      {thread.status === 'closed' && <span className={styles.closedTag}>Ditutup</span>}
                      {isUnread && <span className={styles.unreadBadge}>{thread.unread_by_admin}</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AdminPageShell>
  )
}
