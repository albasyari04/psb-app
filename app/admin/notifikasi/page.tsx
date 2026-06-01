'use client'
// app/admin/notifikasi/page.tsx

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Notif {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info'
  is_read: boolean
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)  return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} jam lalu`
  return `${Math.floor(hrs / 24)} hari lalu`
}

const TYPE_CONFIG = {
  success: { bg: '#d1fae5', color: '#059669', icon: '✅' },
  error:   { bg: '#fee2e2', color: '#dc2626', icon: '❌' },
  info:    { bg: '#dbeafe', color: '#2563eb', icon: '🔔' },
}

export default function NotifikasiPage() {
  const [notifs, setNotifs]     = useState<Notif[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'all' | 'unread'>('all')

  const fetchNotifs = useCallback(async () => {
    setLoading(true)
    try {
      const url = filter === 'unread'
        ? '/api/notifications?unread=true'
        : '/api/notifications?limit=50'
      const res  = await fetch(url)
      const json = await res.json()
      if (Array.isArray(json.data)) setNotifs(json.data)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchNotifs() }, [fetchNotifs])

  async function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  async function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
  }

  const unreadCount = notifs.filter(n => !n.is_read).length

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      background: '#f4f4f8', minHeight: '100dvh',
      maxWidth: 430, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '52px 20px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f3f4f6',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/dashboard" style={{
            width: 36, height: 36, borderRadius: 12,
            background: '#f9fafb', border: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </Link>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Notifikasi</p>
            {unreadCount > 0 && (
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{unreadCount} belum dibaca</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            fontSize: 11, fontWeight: 700, color: '#6d28d9',
            background: '#ede9fe', border: 'none', borderRadius: 20,
            padding: '5px 12px', cursor: 'pointer',
          }}>
            Baca Semua
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 8 }}>
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontSize: 12, fontWeight: 700,
            padding: '6px 16px', borderRadius: 99, border: 'none', cursor: 'pointer',
            background: filter === f ? '#6d28d9' : '#fff',
            color: filter === f ? '#fff' : '#6b7280',
            boxShadow: filter === f ? '0 2px 8px rgba(109,40,217,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'all 0.15s',
          }}>
            {f === 'all' ? 'Semua' : 'Belum Dibaca'}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '12px 14px 100px' }}>
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, padding: '14px 16px',
              marginBottom: 8, display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f3f4f6', flexShrink: 0 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ height: 11, background: '#f3f4f6', borderRadius: 5, width: '60%', marginBottom: 8 }}/>
                <div style={{ height: 9, background: '#f9fafb', borderRadius: 4, width: '85%' }}/>
              </div>
            </div>
          ))
        ) : notifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>🔔</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>
              {filter === 'unread' ? 'Semua sudah dibaca!' : 'Belum ada notifikasi'}
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              Notifikasi pendaftaran akan muncul di sini
            </p>
          </div>
        ) : (
          notifs.map(n => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                style={{
                  background: n.is_read ? '#fff' : '#faf5ff',
                  borderRadius: 16, padding: '14px 16px',
                  marginBottom: 8,
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  cursor: n.is_read ? 'default' : 'pointer',
                  border: n.is_read ? '1.5px solid transparent' : '1.5px solid #ede9fe',
                  transition: 'all 0.15s',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: cfg.bg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {cfg.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <p style={{
                      fontSize: 13, fontWeight: n.is_read ? 600 : 800,
                      color: '#111827', margin: '0 0 4px',
                    }}>{n.title}</p>
                    {!n.is_read && (
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6d28d9', flexShrink: 0, marginTop: 4 }}/>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <p style={{ fontSize: 10.5, color: '#9ca3af', margin: 0 }}>
                    {n.created_at ? timeAgo(n.created_at) : ''}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}