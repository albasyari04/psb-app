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
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} jam lalu`
  return `${Math.floor(hrs / 24)} hari lalu`
}

const TYPE_CONFIG = {
  success: { bg: '#ede9fe', color: '#5b4fcf', icon: '✅' },
  error:   { bg: '#fee2e2', color: '#dc2626', icon: '❌' },
  info:    { bg: '#ede9fe', color: '#5b4fcf', icon: '🔔' },
}

// ── SVG Icons ────────────────────────────────────────────────────────────────

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#5b4fcf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#5b4fcf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33
        1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06
        a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
        A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06
        A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51
        a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9
        a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconBell({ color = '#5b4fcf', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconMail({ color = '#9ca3af', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

// ── Bottom Nav Icons ─────────────────────────────────────────────────────────

function IconHome({ active }: { active?: boolean }) {
  const c = active ? '#5b4fcf' : '#9ca3af'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconUsers({ active }: { active?: boolean }) {
  const c = active ? '#5b4fcf' : '#9ca3af'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconCard({ active }: { active?: boolean }) {
  const c = active ? '#5b4fcf' : '#9ca3af'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

function IconClipboard({ active }: { active?: boolean }) {
  const c = active ? '#5b4fcf' : '#9ca3af'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  )
}

function IconUser({ active }: { active?: boolean }) {
  const c = active ? '#5b4fcf' : '#9ca3af'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// ── Ilustrasi Lonceng 3D SVG ─────────────────────────────────────────────────

function BellIllustration({ count }: { count: number }) {
  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
      {/* Gambar ilustrasi lonceng notifikasi */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/notif-icon.png"
        alt="Notifikasi"
        width={200}
        height={200}
        style={{
          width: '100%', height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />

      {/* Badge angka dinamis — menimpa angka "0" statis pada gambar */}
      <div style={{
        position: 'absolute',
        top: 42, right: 38,
        width: 34, height: 34,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
        border: '3px solid #fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color: '#fff',
        boxShadow: '0 2px 8px rgba(109,40,217,0.4)',
        zIndex: 2,
      }}>
        {count}
      </div>
    </div>
  )
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────

function SkeletonItem() {
  return (
    <div style={{
      background: '#fff', borderRadius: 20, padding: '16px 18px',
      marginBottom: 10, display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: '#f3f4f6', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, background: '#f3f4f6', borderRadius: 6, width: '55%', marginBottom: 10 }} />
        <div style={{ height: 9,  background: '#f9fafb', borderRadius: 5, width: '80%', marginBottom: 6 }} />
        <div style={{ height: 9,  background: '#f9fafb', borderRadius: 5, width: '60%' }} />
      </div>
    </div>
  )
}

// ── Notif Item ───────────────────────────────────────────────────────────────

function NotifItem({ n, onRead }: { n: Notif; onRead: (id: string) => void }) {
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info
  return (
    <div
      onClick={() => !n.is_read && onRead(n.id)}
      style={{
        background: n.is_read ? '#fff' : '#faf8ff',
        borderRadius: 20,
        padding: '16px 18px',
        marginBottom: 10,
        display: 'flex', gap: 14, alignItems: 'flex-start',
        cursor: n.is_read ? 'default' : 'pointer',
        border: n.is_read ? '1.5px solid #f3f4f6' : '1.5px solid #ddd6fe',
        boxShadow: n.is_read ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 12px rgba(91,79,207,0.08)',
        transition: 'all 0.15s',
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: cfg.bg, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        {cfg.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <p style={{
            fontSize: 13.5, fontWeight: n.is_read ? 600 : 800,
            color: '#1e1b4b', margin: '0 0 4px', lineHeight: 1.4,
          }}>
            {n.title}
          </p>
          {!n.is_read && (
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#5b4fcf', flexShrink: 0, marginTop: 4,
            }} />
          )}
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px', lineHeight: 1.55 }}>
          {n.message}
        </p>
        <p style={{ fontSize: 10.5, color: '#9ca3af', margin: 0, fontWeight: 500 }}>
          {n.created_at ? timeAgo(n.created_at) : ''}
        </p>
      </div>
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ isUnread }: { isUnread: boolean }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 24,
      padding: '32px 24px 28px',
      margin: '0 0 16px',
      textAlign: 'center',
    }}>
      {/* Ilustrasi lonceng */}
      <BellIllustration count={0} />

      {/* Teks */}
      <p style={{
        fontSize: 22, fontWeight: 800, color: '#1e1b4b',
        margin: '8px 0 10px', letterSpacing: '-0.3px',
      }}>
        {isUnread ? 'Semua sudah dibaca!' : 'Belum ada notifikasi'}
      </p>
      <p style={{ fontSize: 13.5, color: '#9ca3af', margin: '0 0 24px', lineHeight: 1.6 }}>
        Notifikasi pendaftaran akan muncul di sini<br />setelah ada aktivitas terbaru.
      </p>

      {/* Divider dots */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
        <div style={{ width: 28, height: 3, borderRadius: 2, background: '#ddd6fe' }} />
        <div style={{ width: 6,  height: 6, borderRadius: '50%', background: '#a78bfa' }} />
      </div>

      {/* Card Tetap update */}
      <div style={{
        background: '#f9f8ff',
        border: '1px solid #ede9fe',
        borderRadius: 16,
        padding: '16px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
        textAlign: 'left',
      }}>
        {/* Shield Bell Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: '#ede9fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            {/* Shield */}
            <path
              d="M15 3 L26 7 L26 15 C26 21 15 27 15 27 C15 27 4 21 4 15 L4 7 Z"
              fill="#ddd6fe" stroke="#5b4fcf" strokeWidth="1.5" strokeLinejoin="round"
            />
            {/* Bell inside shield */}
            <path d="M12 14.5c0-1.66 1.34-3 3-3s3 1.34 3 3v3h-6v-3z" fill="#5b4fcf" opacity="0.85" />
            <line x1="11.5" y1="17.5" x2="18.5" y2="17.5" stroke="#5b4fcf" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="15" cy="19.2" r="1" fill="#5b4fcf" />
            <path d="M13.5 11.8 C13.5 11.8 14 10.5 15 10.5 C16 10.5 16.5 11.8 16.5 11.8"
              stroke="#5b4fcf" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e1b4b', margin: '0 0 4px' }}>
            Tetap update
          </p>
          <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.55 }}>
            Kami akan mengirimkan informasi penting<br />seputar pendaftaran dan aktivitas Anda.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Bottom Navigation ────────────────────────────────────────────────────────

function BottomNav({ active }: { active: string }) {
  const items = [
    { key: 'beranda',    label: 'Beranda',    href: '/admin/dashboard',  Icon: IconHome },
    { key: 'pendaftar',  label: 'Pendaftar',  href: '/admin/pendaftar',  Icon: IconUsers },
    { key: 'pembayaran', label: 'Pembayaran', href: '/admin/pembayaran', Icon: IconCard },
    { key: 'laporan',    label: 'Laporan',    href: '/admin/laporan',    Icon: IconClipboard },
    { key: 'profil',     label: 'Profil',     href: '/admin/profile',    Icon: IconUser },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: '#fff',
      borderTop: '1px solid #f3f4f6',
      display: 'flex', alignItems: 'center',
      padding: '10px 0 20px',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    }}>
      {items.map(({ key, label, href, Icon }) => {
        const isActive = active === key
        return (
          <Link key={key} href={href} style={{
            flex: 1, textDecoration: 'none',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4,
          }}>
            <Icon active={isActive} />
            <span style={{
              fontSize: 10.5, fontWeight: isActive ? 700 : 500,
              color: isActive ? '#5b4fcf' : '#9ca3af',
            }}>
              {label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function NotifikasiPage() {
  const [notifs, setNotifs]   = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<'all' | 'unread'>('all')

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
      background: '#f4f3fa',
      minHeight: '100dvh',
      maxWidth: 430,
      margin: '0 auto',
      paddingBottom: 80,
    }}>

      {/* ── Header ── */}
      <div style={{
        background: '#fff',
        padding: '14px 20px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: '0 1px 0 #f3f4f6',
      }}>
        {/* Tombol back */}
        <Link href="/admin/dashboard" style={{
          width: 40, height: 40, borderRadius: 14,
          background: '#f9f8ff', border: '1px solid #ede9fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <IconBack />
        </Link>

        {/* Judul tengah */}
        <p style={{
          fontSize: 20, fontWeight: 800, color: '#1e1b4b',
          margin: 0, letterSpacing: '-0.3px',
        }}>
          Notifikasi
        </p>

        {/* Tombol settings */}
        <button style={{
          width: 40, height: 40, borderRadius: 14,
          background: '#f9f8ff', border: '1px solid #ede9fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>
          <IconSettings />
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ padding: '16px 20px 0', display: 'flex', gap: 12 }}>
        {/* Tab Semua */}
        <button
          onClick={() => setFilter('all')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', borderRadius: 99, border: 'none',
            cursor: 'pointer',
            background: filter === 'all'
              ? 'linear-gradient(135deg, #6d28d9, #5b4fcf)'
              : '#fff',
            color: filter === 'all' ? '#fff' : '#6b7280',
            fontWeight: 700, fontSize: 14,
            boxShadow: filter === 'all'
              ? '0 4px 14px rgba(91,79,207,0.35)'
              : '0 1px 4px rgba(0,0,0,0.07)',
            transition: 'all 0.2s',
          }}
        >
          <IconBell color={filter === 'all' ? '#fff' : '#9ca3af'} size={16} />
          Semua
          {unreadCount > 0 && filter === 'all' && (
            <span style={{
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 800,
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Tab Belum Dibaca */}
        <button
          onClick={() => setFilter('unread')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', borderRadius: 99, border: '1.5px solid #e5e7eb',
            cursor: 'pointer',
            background: filter === 'unread'
              ? 'linear-gradient(135deg, #6d28d9, #5b4fcf)'
              : '#fff',
            color: filter === 'unread' ? '#fff' : '#6b7280',
            fontWeight: 700, fontSize: 14,
            boxShadow: filter === 'unread'
              ? '0 4px 14px rgba(91,79,207,0.35)'
              : '0 1px 4px rgba(0,0,0,0.07)',
            transition: 'all 0.2s',
          }}
        >
          <IconMail color={filter === 'unread' ? '#fff' : '#9ca3af'} size={16} />
          Belum Dibaca
          {unreadCount > 0 && filter === 'unread' && (
            <span style={{
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 800,
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Tombol Baca Semua — muncul jika ada unread */}
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            marginLeft: 'auto',
            fontSize: 11, fontWeight: 700, color: '#5b4fcf',
            background: '#ede9fe', border: 'none', borderRadius: 99,
            padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            Baca Semua
          </button>
        )}
      </div>

      {/* ── Content List ── */}
      <div style={{ padding: '16px 16px 20px' }}>
        {loading ? (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        ) : notifs.length === 0 ? (
          <EmptyState isUnread={filter === 'unread'} />
        ) : (
          notifs.map(n => (
            <NotifItem key={n.id} n={n} onRead={markRead} />
          ))
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <BottomNav active="beranda" />
    </div>
  )
}