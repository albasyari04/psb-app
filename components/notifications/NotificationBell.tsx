'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from 'next-auth/react'
import type { Notification } from '@/types'
import styles from './Notificationbell.module.css'

const MODULE_START_TIME = Date.now()

function formatTime(dateStr: string, nowMs: number): string {
  const diff  = nowMs - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'Baru saja'
  if (mins  < 60) return `${mins} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  return `${days} hari lalu`
}

function itemBgClass(isRead: boolean, type: string): string {
  if (isRead) return styles.notifRead as string
  const map: Record<string, string> = {
    success: styles.notifUnread_success as string,
    error:   styles.notifUnread_error   as string,
    info:    styles.notifUnread_info    as string,
  }
  return map[type] ?? (styles.notifUnread_info as string)
}

function dotColorClass(type: string): string {
  const map: Record<string, string> = {
    success: styles.dotSuccess as string,
    error:   styles.dotError   as string,
    info:    styles.dotInfo    as string,
  }
  return map[type] ?? (styles.dotInfo as string)
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

export default function NotificationBell() {
  const { data: session }       = useSession()
  const [notifs,  setNotifs]    = useState<Notification[]>([])
  const [open,    setOpen]      = useState(false)
  const [loading, setLoading]   = useState(true)
  // nowMs sebagai state biasa — inisialisasi dari MODULE_START_TIME (bukan Date.now())
  // Tidak ada impure call, tidak ada ref access saat render
  const [nowMs,   setNowMs]     = useState<number>(MODULE_START_TIME)

  const unreadCount = notifs.filter((n) => !n.is_read).length

  // Timer: setNowMs dipanggil HANYA dari setInterval callback (sistem eksternal)
  // Bukan synchronous di body effect — tidak melanggar react-hooks/set-state-in-effect
  useEffect(() => {
    const id = setInterval(() => {
      setNowMs(Date.now())
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  // Fetch + Realtime
  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) return

    const fetchNotifs = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(20)
      if (!error && data) setNotifs(data as Notification[])
      setLoading(false)
    }

    void fetchNotifs()

    const channel = supabase
      .channel(`notif-bell-${uid}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${uid}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const newNotif = payload.new as Notification
          setNotifs((prev) => [newNotif, ...prev])
          setOpen(true)
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [session?.user?.id])

  const markAllRead = async () => {
    const uid = session?.user?.id
    if (!uid || unreadCount === 0) return
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true } as never)
      .eq('user_id', uid)
      .eq('is_read', false)
    if (!error) {
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
    }
  }

  const markRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true } as never)
      .eq('id', id)
    if (!error) {
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    }
  }

  const handleBellClick = () => setOpen((v) => !v)
  const handleClose     = () => { setOpen(false); void markAllRead() }

  return (
    <>
      <button
        type="button"
        className={styles.bellBtn}
        onClick={handleBellClick}
        aria-label="Notifikasi"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={styles.overlay}
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`${styles.drawer} ${open ? styles.drawerOpen : styles.drawerClosed}`}
        role="dialog"
        aria-label="Panel Notifikasi"
        aria-modal="true"
      >
        <div className={styles.handleWrap}>
          <div className={styles.handle} />
        </div>

        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderLeft}>
            <span className={styles.drawerHeaderIcon}>&#128276;</span>
            <span className={styles.drawerHeaderTitle}>Notifikasi</span>
            {unreadCount > 0 && (
              <span className={styles.drawerHeaderBadge}>{unreadCount} baru</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              className={styles.markAllBtn}
              onClick={() => { void markAllRead() }}
            >
              Tandai semua dibaca
            </button>
          )}
        </div>

        <div className={styles.listArea}>
          {loading ? (
            <div className={styles.loadingState}>
              <span className={styles.loadingIcon}>&#9203;</span>
              <span className={styles.loadingText}>Memuat notifikasi...</span>
            </div>
          ) : notifs.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>&#128277;</span>
              <p className={styles.emptyTitle}>Belum ada notifikasi</p>
              <p className={styles.emptySub}>
                Notifikasi akan muncul saat ada update status pendaftaranmu
              </p>
            </div>
          ) : (
            <div className={styles.notifList}>
              {notifs.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`${styles.notifItem} ${itemBgClass(n.is_read, n.type)}`}
                  onClick={() => { void markRead(n.id) }}
                >
                  <div className={styles.dotWrap}>
                    <div
                      className={`${styles.dot} ${
                        n.is_read ? styles.dotRead : dotColorClass(n.type)
                      }`}
                    />
                  </div>
                  <div className={styles.notifContent}>
                    <p
                      className={`${styles.notifTitle} ${
                        n.is_read ? styles.notifTitleRead : styles.notifTitleUnread
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className={styles.notifMsg}>{n.message}</p>
                    <p className={styles.notifTime}>
                      {formatTime(n.created_at, nowMs)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div
                      className={`${styles.dotRight} ${styles.dot} ${dotColorClass(n.type)}`}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}