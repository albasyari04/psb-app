'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactElement, MouseEvent as ReactMouseEvent } from 'react'
import Image from 'next/image'
import Link  from 'next/link'
import styles from './dashboard.module.css'
import { useSettings } from '@/contexts/SettingsContext'

/* ════════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════════ */
interface Props {
  fullName      : string
  avatarInitial : string
  avatarUrl     : string | null
}

interface JadwalItem {
  id               : string
  label            : string
  tanggal          : string
  tanggal_mulai    : string | null
  tanggal_selesai  : string | null
  status           : string
  warna            : string
  urutan?          : number
}

interface PembayaranItem {
  id     : string
  judul  : string
  jumlah : number
  status : 'lunas' | 'belum_lunas' | string
}

interface PembayaranData {
  total : number
  items : PembayaranItem[]
}

interface LaporanItem {
  id         : string
  judul      : string
  tipe       : 'bulanan' | 'tahunan' | 'khusus' | string
  deskripsi  : string | null
  file_url   : string | null
  created_at : string | null
}

interface Announcement {
  id           : string
  judul        : string
  tipe         : 'Penting' | 'Informasi' | 'Info' | 'Peringatan'
  konten       : string
  tanggal      : string
  lampiran_url : string | null
  lampiran_nama: string | null
  created_at   : string
}

interface PeraturanItem {
  id        : string
  judul     : string
  deskripsi : string
  kategori  : string
  tanggal   : string
}

// ── Notifikasi ──────────────────────────────────────────────────
interface NotifItem {
  id         : string
  title      : string
  message    : string
  type       : string
  is_read    : boolean
  created_at : string | null
}

/* ════════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════════ */
const HERO_SLIDES = [
  {
    eyebrow   : 'Rutinan Ahad Legi',
    titleBold : 'Ngaji Hikam,',
    titleLight: 'bersama K.H Thobroni Hanani',
    href      : '/siswa/galeri',
    image     : '/image/galeri/ngaji.jpeg',
  },
  {
    eyebrow   : 'Ziarah Wali Songo',
    titleBold : 'Sowan Ploso ',
    titleLight: 'K.H Nurul Huda \nDjazuli',
    href      : '/siswa/galeri',
    image     : '/image/galeri/Sowan ndalem kesepuhan K.H Nurul Huda Dzajuli.jpeg',
  },
  {
    eyebrow   : 'Masyayikh Ploso',
    titleBold : 'Halal Bihalal,',
    titleLight: 'Gus Kautsar & \nGus Fahim Ploso',
    href      : '/siswa/galeri',
    image     : '/image/galeri/ngaji1.jpeg',
  },
] as const

const QUICK_ITEMS = [
  { href: '/siswa/jadwal',     labelKey: 'menu_jadwal',     subKey: 'menu_jadwal_sub',     icon: '/icons/jadwal icon.png' },
  { href: '/siswa/berkas',     labelKey: 'menu_berkas',     subKey: 'menu_berkas_sub',     icon: '/icons/berkas icon.png' },
  { href: '/siswa/pembayaran', labelKey: 'menu_pembayaran', subKey: 'menu_pembayaran_sub', icon: '/icons/pembayaran icon.png' },
  { href: '/siswa/laporan',    labelKey: 'menu_laporan',    subKey: 'menu_laporan_sub',    icon: '/icons/laporan icon.png' },
  { href: '/siswa/pengumuman', labelKey: 'menu_pengumuman', subKey: 'menu_pengumuman_sub', icon: '/icons/pengumuman icon.png' },
  { href: '/siswa/chat',       labelKey: 'menu_chat',       subKey: 'menu_chat_sub',       icon: '/icons/chat icon.png' },
] as const

const TIPE_CONFIG: Record<string, { pill: string }> = {
  Penting   : { pill: styles.pillPenting },
  Informasi : { pill: styles.pillInformasi },
  Info      : { pill: styles.pillInfo },
  Peringatan: { pill: styles.pillPeringatan },
}

const KATEGORI_PERATURAN_CONFIG: Record<string, string> = {
  'Tata Tertib': styles.pillInfo,
  'Larangan'   : styles.pillPeringatan,
  'Kewajiban'  : styles.pillPenting,
  'Informasi'  : styles.pillInformasi,
}

const LAPORAN_TIPE_CONFIG: Record<string, {
  labelKey: 'laporan_tipe_bulanan' | 'laporan_tipe_tahunan' | 'laporan_tipe_khusus'
  badge: string
}> = {
  bulanan: { labelKey: 'laporan_tipe_bulanan', badge: styles.laporanBadgeBulanan },
  tahunan: { labelKey: 'laporan_tipe_tahunan', badge: styles.laporanBadgeTahunan },
  khusus : { labelKey: 'laporan_tipe_khusus',  badge: styles.laporanBadgeKhusus },
}

// Konfigurasi tampilan notifikasi per type: kotak ikon berwarna + ikon SVG + warna dot
type NotifTypeConfig = { box: string; dotColor: string; render: () => ReactElement }
const NOTIF_TYPE_CONFIG: Record<string, NotifTypeConfig> = {
  chat        : { box: styles.notifIconChat,        dotColor: '#7c3aed', render: () => <IconNotifChat /> },
  laporan     : { box: styles.notifIconLaporan,      dotColor: '#2563eb', render: () => <IconNotifDoc /> },
  jadwal      : { box: styles.notifIconJadwal,       dotColor: '#7c3aed', render: () => <IconNotifCalendar /> },
  pembayaran  : { box: styles.notifIconPembayaran,   dotColor: '#2563eb', render: () => <IconNotifCard /> },
  pengumuman  : { box: styles.notifIconPengumuman,   dotColor: '#db2777', render: () => <IconNotifMegaphone /> },
  pendaftaran : { box: styles.notifIconPendaftaran,  dotColor: '#d97706', render: () => <IconNotifBell /> },
  info        : { box: styles.notifIconInfo,         dotColor: '#16a34a', render: () => <IconNotifInfo /> },
}
const NOTIF_TYPE_DEFAULT: NotifTypeConfig = { box: styles.notifIconInfo, dotColor: '#16a34a', render: () => <IconNotifBell /> }

/* ════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════ */
function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n)
}
function formatTanggalShort(iso: string): string {
  try { return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return iso }
}
function formatTanggalRange(start: string, end: string | null): string {
  if (!end || end === start) return formatTanggalShort(start)
  return `${formatTanggalShort(start)} – ${formatTanggalShort(end)}`
}
function hexToRgba(hex: string, alpha: number): string {
  const fallback = `rgba(22, 163, 74, ${alpha})`
  if (!hex) return fallback
  const clean = hex.replace('#', '').trim()
  if (clean.length !== 3 && clean.length !== 6) return fallback
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const num  = parseInt(full, 16)
  if (Number.isNaN(num)) return fallback
  const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s
}
function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m    = Math.floor(diff / 60_000)
  if (m < 1)  return 'baru saja'
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hari lalu`
}

/* ════════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════════ */
function IconCardSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}
function IconCheckSmall() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconHomeFilled() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  )
}
function IconWalletOutline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  )
}
function IconDocumentOutline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  )
}
function IconPersonOutline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

// ── IKON LONCENG ──────────────────────────────────────────────────────────
function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

/* ── Ikon kotak notifikasi (sesuai desain pop-up) ──────────────── */
function IconNotifChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}
function IconNotifCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}
function IconNotifMegaphone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11v3a1 1 0 0 0 1 1h2l3.5 5v-15L6 9H4a1 1 0 0 0-1 1z" />
      <path d="M14 8a4 4 0 0 1 0 8" />
      <path d="M17.5 5a8.5 8.5 0 0 1 0 14" />
    </svg>
  )
}
function IconNotifBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IconNotifDoc() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  )
}
function IconNotifCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IconNotifInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}
function IconChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════
   NOTIFICATION BELL — ikon + dropdown panel
   ════════════════════════════════════════════════════════════════ */
function NotificationBell() {
  const [open,          setOpen         ] = useState(false)
  const [notifs,        setNotifs       ] = useState<NotifItem[]>([])
  const [unreadCount,   setUnreadCount  ] = useState(0)
  const [loading,       setLoading      ] = useState(true)
  const btnRef   = useRef<HTMLButtonElement>(null)

  /* Fetch notifikasi */
  const fetchNotifs = useCallback(async () => {
    try {
      const res  = await fetch('/api/notifications?limit=20')
      const json = await res.json()
      if (res.ok) {
        setNotifs(json.data ?? [])
        setUnreadCount(json.unreadCount ?? 0)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  /* Mount + polling 30 detik */
  useEffect(() => {
    fetchNotifs()
    const id = setInterval(fetchNotifs, 30_000)
    return () => clearInterval(id)
  }, [fetchNotifs])

  /* Tutup panel saat klik backdrop (di luar panel) */
  const handleBackdropClick = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false)
  }, [])

  /* Tandai satu sudah dibaca */
  const markRead = useCallback(async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    await fetch('/api/notifications', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ id }),
    }).catch(() => { /* silent */ })
  }, [])

  /* Tandai semua sudah dibaca */
  const markAllRead = useCallback(async () => {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
    await fetch('/api/notifications', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ markAllRead: true }),
    }).catch(() => { /* silent */ })
  }, [])

  const handleOpen = () => {
    setOpen(o => !o)
    if (!open) fetchNotifs() // refresh saat buka
  }

  return (
    <div className={styles.notifWrap}>
      {/* ── Tombol lonceng ── */}
      <button
        ref={btnRef}
        type="button"
        className={styles.iconBtn}
        onClick={handleOpen}
        aria-label="Notifikasi"
        aria-expanded={open}
      >
        <IconBell />
        {unreadCount > 0 && (
          <span className={styles.notifBadge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Modal panel (overlay tengah, sesuai desain) ── */}
      {open && (
        <div
          className={styles.notifBackdrop}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Panel Notifikasi"
        >
          <div className={styles.notifPanel}>
            {/* Header */}
            <div className={styles.notifPanelHeader}>
              <div className={styles.notifPanelHeaderLeft}>
                <span className={styles.notifPanelIconWrap}>
                  <IconBell />
                  {unreadCount > 0 && <span className={styles.notifPanelIconDot} aria-hidden />}
                </span>
                <div className={styles.notifPanelHeaderText}>
                  <span className={styles.notifPanelTitle}>Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className={styles.notifPanelSubtitle}>
                      {unreadCount} belum dibaca
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className={styles.notifCloseBtn}
                onClick={() => setOpen(false)}
                aria-label="Tutup panel notifikasi"
              >
                <IconClose />
              </button>
            </div>

            {/* Tandai semua dibaca (baris terpisah, tampil hanya jika ada yg belum dibaca) */}
            {unreadCount > 0 && (
              <div className={styles.notifMarkAllRow}>
                <button type="button" className={styles.notifMarkAllBtn} onClick={markAllRead}>
                  Tandai semua dibaca
                </button>
              </div>
            )}

            {/* Body */}
            <div className={styles.notifList}>
              {loading ? (
                <div className={styles.notifEmpty}>
                  <div className={styles.miniSkeleton} style={{ padding: '0.5rem 1rem' }}>
                    {[1, 2, 3].map(i => <div key={i} className={styles.skelBar} style={{ width: `${60 + i * 10}%` }} />)}
                  </div>
                </div>
              ) : notifs.length === 0 ? (
                <div className={styles.notifEmpty}>
                  <span style={{ fontSize: '1.8rem' }}>🔔</span>
                  <p className={styles.notifEmptyText}>Belum ada notifikasi</p>
                </div>
              ) : (
                notifs.map(n => {
                  const cfg = NOTIF_TYPE_CONFIG[n.type] ?? NOTIF_TYPE_DEFAULT
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className={`${styles.notifItem} ${!n.is_read ? styles.notifItemUnread : ''}`}
                      onClick={() => { if (!n.is_read) markRead(n.id) }}
                    >
                      {!n.is_read && (
                        <span
                          className={`${styles.notifDot} ${styles.notifDotLeft}`}
                          style={{ background: cfg.dotColor }}
                          aria-hidden
                        />
                      )}

                      <span className={`${styles.notifIcon} ${cfg.box}`}>
                        {cfg.render()}
                      </span>

                      <div className={styles.notifItemBody}>
                        <p className={styles.notifItemTitle}>{n.title}</p>
                        <p className={styles.notifItemMsg}>{n.message}</p>
                      </div>

                      <div className={styles.notifItemMeta}>
                        <span className={styles.notifItemTime}>{timeAgo(n.created_at)}</span>
                        {!n.is_read && (
                          <span
                            className={`${styles.notifDot} ${styles.notifDotRight}`}
                            style={{ background: cfg.dotColor }}
                            aria-hidden
                          />
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className={styles.notifPanelFooterWrap}>
              <Link href="/siswa/notifikasi" className={styles.notifPanelFooter} onClick={() => setOpen(false)}>
                Lihat semua notifikasi <IconChevronRight />
              </Link>

              <Link href="/siswa/pengaturan/notifikasi" className={styles.notifSettingsRow} onClick={() => setOpen(false)}>
                <span className={styles.notifSettingsIconWrap}>
                  <IconSettings />
                </span>
                <div className={styles.notifSettingsText}>
                  <span className={styles.notifSettingsTitle}>Pengaturan Notifikasi</span>
                  <span className={styles.notifSettingsSub}>Kelola preferensi dan pengingat kamu</span>
                </div>
                <span className={styles.notifSettingsChevron}><IconChevronRight /></span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   HERO BANNER — carousel dengan auto-rotate
   ════════════════════════════════════════════════════════════════ */
function HeroBanner() {
  const { t } = useSettings()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), 6000)
    return () => clearInterval(id)
  }, [])

  const slide = HERO_SLIDES[index]

  return (
    <div className={styles.heroBannerWrap}>
      <div className={styles.heroBannerBgPattern} />
      <div className={styles.heroBannerContent}>
        <div>
          <span className={styles.heroBannerEyebrow}>{slide.eyebrow}</span>
          <h2 className={styles.heroBannerTitle}>
            <span className={styles.heroTitleBold}>{slide.titleBold}</span>
            <span className={styles.heroTitleLight}>{slide.titleLight}</span>
          </h2>
        </div>
        <Link href={slide.href} className={styles.heroBannerBtn}>
          {t('dashboard_hero_cta')} <span aria-hidden>→</span>
        </Link>
      </div>
      <div className={styles.heroBannerImageWrap}>
        <Image src={slide.image} alt={slide.eyebrow} fill className={styles.heroBannerImg} priority key={index} />
      </div>
      <div className={styles.heroBannerDots}>
        {HERO_SLIDES.map((_, i) => (
          <button key={i} type="button" aria-label={`Slide ${i + 1}`}
            className={`${styles.heroBannerDot} ${i === index ? styles.heroBannerDotActive : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   JADWAL TERDEKAT
   ════════════════════════════════════════════════════════════════ */
function JadwalHariIniCard({ items, loading }: { items: JadwalItem[]; loading: boolean }) {
  const { t } = useSettings()
  return (
    <div className={styles.miniCard}>
      <div className={styles.miniCardHeader}>
        <p className={styles.miniCardTitle}>{t('dashboard_jadwal_title')}</p>
        <Link href="/siswa/jadwal" className={styles.miniCardLink}>{t('dashboard_jadwal_link')}</Link>
      </div>
      {loading ? (
        <div className={styles.miniSkeleton}>
          {[1, 2, 3, 4].map(i => <div key={i} className={styles.skelBar} style={{ width: `${60 + i * 8}%` }} />)}
        </div>
      ) : items.length === 0 ? (
        <p className={styles.timelineEmpty}>{t('dashboard_jadwal_empty')}</p>
      ) : (
        <ol className={styles.timeline}>
          {items.map((it, idx) => (
            <li key={it.id ?? idx} className={styles.timelineItem}>
              <div className={styles.timelineDotCol}>
                <span className={styles.timelineDot} style={{ background: it.warna || undefined }} />
                {idx < items.length - 1 && <span className={styles.timelineLine} />}
              </div>
              <div className={styles.timelineContent}>
                <p className={styles.timelineLabel}>{it.label}</p>
                <span className={styles.timelineTime}>
                  {it.tanggal_mulai
                    ? formatTanggalRange(it.tanggal_mulai, it.tanggal_selesai)
                    : formatTanggalShort(it.tanggal)}
                </span>
                {it.status && (
                  <span className={styles.jadwalStatusBadge}
                    style={{ color: it.warna || 'var(--green)', background: hexToRgba(it.warna, 0.14) }}>
                    {it.status}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   PEMBAYARAN
   ════════════════════════════════════════════════════════════════ */
function PembayaranCard({ data, loading }: { data: PembayaranData; loading: boolean }) {
  const { t } = useSettings()
  return (
    <div className={styles.miniCard}>
      <div className={styles.miniCardHeader}>
        <p className={styles.miniCardTitle}>{t('dashboard_payment_title')}</p>
        <Link href="/siswa/pembayaran" className={styles.miniCardLink}>{t('dashboard_payment_link')}</Link>
      </div>
      {loading ? (
        <div className={styles.miniSkeleton}>
          {[1, 2, 3, 4].map(i => <div key={i} className={styles.skelBar} style={{ width: `${55 + i * 9}%` }} />)}
        </div>
      ) : (
        <>
          <p className={styles.payCaption}>{t('dashboard_payment_caption')}</p>
          <div className={styles.payAmountRow}>
            <span className={styles.payAmount}>Rp {formatRupiah(data.total)}</span>
            <div className={styles.payIconWrap}>
              <div className={styles.payIconBg}><IconCardSmall /></div>
              <div className={styles.payIconBadge}><IconCheckSmall /></div>
            </div>
          </div>
          <Link href="/siswa/pembayaran/bayar" className={styles.payBtn}>{t('dashboard_payment_cta')}</Link>
          {data.items.length === 0 ? (
            <p className={styles.payEmpty}>{t('dashboard_payment_empty')}</p>
          ) : (
            <div className={styles.payList}>
              {data.items.map(item => (
                <div key={item.id} className={styles.payItem}>
                  <div className={styles.payItemText}>
                    <p className={styles.payItemTitle}>{item.judul}</p>
                    <p className={styles.payItemAmount}>Rp {formatRupiah(item.jumlah)}</p>
                  </div>
                  <span className={`${styles.payBadge} ${item.status === 'lunas' ? styles.payBadgeLunas : styles.payBadgeBelumLunas}`}>
                    {item.status === 'lunas' ? t('dashboard_payment_lunas') : t('dashboard_payment_belum_lunas')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   LAPORAN TERBARU
   ════════════════════════════════════════════════════════════════ */
function LaporanCard({ data, loading }: { data: LaporanItem[]; loading: boolean }) {
  const { t } = useSettings()
  return (
    <div className={styles.miniCard}>
      <div className={styles.miniCardHeader}>
        <p className={styles.miniCardTitle}>{t('dashboard_laporan_title')}</p>
        <Link href="/siswa/laporan" className={styles.miniCardLink}>{t('dashboard_laporan_link')}</Link>
      </div>
      {loading ? (
        <div className={styles.miniSkeleton}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skelBar} style={{ width: `${55 + i * 9}%` }} />)}
        </div>
      ) : data.length === 0 ? (
        <p className={styles.laporanMiniEmpty}>{t('dashboard_laporan_empty')}</p>
      ) : (
        <div className={styles.laporanMiniList}>
          {data.map(item => {
            const cfg = LAPORAN_TIPE_CONFIG[item.tipe] ?? { labelKey: 'laporan_tipe_khusus' as const, badge: styles.laporanBadgeKhusus }
            return (
              <Link key={item.id} href={`/siswa/laporan/${item.id}`} className={styles.laporanMiniItem}>
                <p className={styles.laporanMiniTitle}>{item.judul}</p>
                <div className={styles.laporanMiniMeta}>
                  <span className={styles.laporanMiniDate}>{item.created_at ? formatTanggalShort(item.created_at) : '-'}</span>
                  <span className={`${styles.laporanMiniBadge} ${cfg.badge}`}>{t(cfg.labelKey)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   PENGUMUMAN
   ════════════════════════════════════════════════════════════════ */
function isImageUrl(url: string) { return /\.(png|jpe?g|webp|gif)$/i.test(url) }

function AnnouncementCard({ item, onClick }: { item: Announcement; onClick: (a: Announcement) => void }) {
  const cfg = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG.Informasi
  return (
    <button type="button" className={styles.annCard} onClick={() => onClick(item)} aria-label={`Buka pengumuman: ${item.judul}`}>
      <div className={styles.annThumb}>
        {item.lampiran_url && isImageUrl(item.lampiran_url)
          ? <Image src={item.lampiran_url} alt="" fill className={styles.annThumbImg} />
          : <Image src="/icons/pengumuman icon.png" alt="Pengumuman" fill className={styles.annThumbImg} />
        }
      </div>
      <div className={styles.annBody}>
        <div className={styles.annTopRow}>
          <p className={styles.annTitle}>{item.judul}</p>
          <span className={styles.annDate}>{formatTanggalShort(item.tanggal)}</span>
        </div>
        <p className={styles.annPreview}>{truncate(item.konten, 90)}</p>
        <div className={styles.annBadgeRow}>
          <span className={`${styles.annBadge} ${cfg.pill}`}>{item.tipe}</span>
        </div>
      </div>
    </button>
  )
}

function AnnouncementModal({ item, onClose }: { item: Announcement; onClose: () => void }) {
  const { t } = useSettings()
  const cfg   = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG.Informasi

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className={styles.modalSheet}>
        <div className={styles.modalHandle} />
        <div className={styles.modalHeader}>
          <span className={`${styles.annBadge} ${cfg.pill}`}>{item.tipe}</span>
          <button className={styles.modalClose} onClick={onClose} aria-label={t('dashboard_close')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <h2 className={styles.modalTitle}>{item.judul}</h2>
        <div className={styles.modalDateRow}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formatTanggalShort(item.tanggal)}</span>
        </div>
        <div className={styles.modalDivider} />
        <p className={styles.modalContent}>{item.konten}</p>
        {item.lampiran_url && (
          <a href={item.lampiran_url} target="_blank" rel="noopener noreferrer" className={styles.modalAttachment}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>{item.lampiran_nama || t('dashboard_open_attachment')}</span>
            <span className={styles.modalAttachmentArrow}>↗</span>
          </a>
        )}
        <button className={styles.modalCloseBtn} onClick={onClose}>{t('dashboard_close')}</button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   PERATURAN CARD
   ════════════════════════════════════════════════════════════════ */
function PeraturanCard({ item }: { item: PeraturanItem }) {
  const pillClass = KATEGORI_PERATURAN_CONFIG[item.kategori] ?? styles.pillInfo
  return (
    <Link href="/siswa/peraturan" className={styles.annCard} aria-label={`Buka peraturan: ${item.judul}`}>
      <div className={styles.annThumb}>
        <Image src="/icons/tata-tertib-icon.png" alt="Peraturan" fill className={styles.annThumbImg} />
      </div>
      <div className={styles.annBody}>
        <div className={styles.annTopRow}>
          <p className={styles.annTitle}>{item.judul}</p>
          <span className={styles.annDate}>{formatTanggalShort(item.tanggal)}</span>
        </div>
        <p className={styles.annPreview}>{truncate(item.deskripsi, 90)}</p>
        <div className={styles.annBadgeRow}>
          <span className={`${styles.annBadge} ${pillClass}`}>{item.kategori}</span>
        </div>
      </div>
    </Link>
  )
}

/* ════════════════════════════════════════════════════════════════
   CTA BANNER
   ════════════════════════════════════════════════════════════════ */
function CtaBanner() {
  return (
    <div className={styles.bannerKataWrap}>
      <Image src="/icons/kata-banner.png" alt="Banner Motivasi Santri" width={1200} height={350}
        className={styles.bannerKataImage} priority />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function DashboardClient({ fullName, avatarInitial, avatarUrl }: Props) {
  const { t } = useSettings()
  const [jadwal,           setJadwal          ] = useState<JadwalItem[]>([])
  const [jadwalLoading,    setJadwalLoading   ] = useState(true)
  const [pembayaran,       setPembayaran      ] = useState<PembayaranData>({ total: 0, items: [] })
  const [pembayaranLoading,setPembayaranLoading] = useState(true)
  const [laporan,          setLaporan         ] = useState<LaporanItem[]>([])
  const [laporanLoading,   setLaporanLoading  ] = useState(true)
  const [announcements,    setAnnouncements   ] = useState<Announcement[]>([])
  const [annLoading,       setAnnLoading      ] = useState(true)
  const [selectedAnn,      setSelectedAnn     ] = useState<Announcement | null>(null)

  const [peraturan] = useState<PeraturanItem[]>([
    { id: '1', judul: 'Tata Tertib Umum',         deskripsi: 'Seluruh santri wajib menjaga adab, disiplin dan ketertiban pondok.', kategori: 'Tata Tertib', tanggal: '2026-06-15' },
    { id: '2', judul: 'Larangan Membawa HP',       deskripsi: 'Santri dilarang membawa alat elektronik tanpa izin pengurus.',       kategori: 'Larangan',    tanggal: '2026-06-08' },
    { id: '3', judul: 'Kewajiban Mengikuti Jamaah',deskripsi: 'Seluruh santri wajib mengikuti sholat berjamaah dan kegiatan pondok.',kategori: 'Kewajiban',   tanggal: '2026-06-01' },
  ])

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch('/api/siswa/jadwal')
        const json = await res.json()
        if (res.ok) {
          const mapped: JadwalItem[] = (json.data ?? []).slice(0, 5).map((row: Record<string, unknown>) => ({
            id             : row.id as string,
            label          : (row.label    ?? '') as string,
            tanggal        : (row.tanggal  ?? '') as string,
            tanggal_mulai  : (row.tanggal_mulai  ?? null) as string | null,
            tanggal_selesai: (row.tanggal_selesai ?? null) as string | null,
            status         : (row.status   ?? '') as string,
            warna          : (row.warna    ?? '#16a34a') as string,
            urutan         : row.urutan as number | undefined,
          }))
          setJadwal(mapped)
        }
      } catch (e) { console.error('Gagal memuat jadwal:', e) }
      finally      { setJadwalLoading(false) }
    }
    load()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch('/api/siswa/pembayaran/ringkasan')
        const json = await res.json()
        if (res.ok) setPembayaran(json.data ?? { total: 0, items: [] })
      } catch (e) { console.error('Gagal memuat ringkasan pembayaran:', e) }
      finally      { setPembayaranLoading(false) }
    }
    load()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch('/api/siswa/laporan/ringkasan')
        const json = await res.json()
        if (res.ok) setLaporan(json.data ?? [])
      } catch (e) { console.error('Gagal memuat ringkasan laporan:', e) }
      finally      { setLaporanLoading(false) }
    }
    load()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch('/api/siswa/announcements?limit=3')
        const json = await res.json()
        if (res.ok) setAnnouncements(json.data ?? [])
      } catch (e) { console.error('Gagal memuat pengumuman:', e) }
      finally      { setAnnLoading(false) }
    }
    load()
  }, [])

  return (
    <div className={styles.shell}>

      {/* ══ TOP HEADER ══════════════════════════════════════════════════ */}
      <header className={styles.topHeader}>
        <div className={styles.topHeaderLeft}>
          <div className={styles.avatarWrap}>
            {avatarUrl ? (
              <Image src={avatarUrl} alt={fullName} width={52} height={52}
                className={styles.avatarImg} referrerPolicy="no-referrer" unoptimized />
            ) : (
              <span className={styles.avatarInitialText}>{avatarInitial}</span>
            )}
          </div>
          <div className={styles.greetWrap}>
            <p className={styles.greetText}>{t('dashboard_greeting')}</p>
            <h1 className={styles.greetName}>{fullName}</h1>
            <p className={styles.greetSchool}>{t('dashboard_school')}</p>
          </div>
        </div>

        {/* ── Kanan: lonceng + settings ── */}
        <div className={styles.topHeaderRight}>
          {/* ✅ NOTIF: tombol lonceng notifikasi */}
          <NotificationBell />

          <Link href="/siswa/pengaturan" className={styles.iconBtn} aria-label={t('settings_title')}>
            <IconSettings />
          </Link>
        </div>
      </header>

      {/* Spacer: mengisi ruang yang ditinggalkan header karena position:fixed */}
      <div className={styles.topHeaderSpacer} aria-hidden="true" />

      {/* ══ PAGE BODY ═══════════════════════════════════════════════════ */}
      <div className={styles.pageBody}>
        <HeroBanner />

        {/* Akses Cepat */}
        <div className={styles.sectionWrap}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>{t('dashboard_quick_access')}</p>
            <Link href="/siswa/menu" className={styles.sectionLink}>{t('dashboard_see_all')}</Link>
          </div>
          <div className={styles.quickGrid}>
            {QUICK_ITEMS.map(({ href, labelKey, subKey, icon }) => (
              <Link key={labelKey} href={href} className={styles.quickCard}>
                <div className={styles.quickIconWrap}>
                  <Image src={icon} alt={t(labelKey)} width={52} height={52} className={styles.quickIconImage} />
                </div>
                <span className={styles.quickLabel}>{t(labelKey)}</span>
                <span className={styles.quickSub}>{t(subKey)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 3 Kartu */}
        <div className={styles.threeColGrid}>
          <JadwalHariIniCard  items={jadwal}    loading={jadwalLoading}    />
          <PembayaranCard     data={pembayaran} loading={pembayaranLoading} />
          <LaporanCard        data={laporan}    loading={laporanLoading}    />
        </div>

        {/* Pengumuman Terbaru */}
        <div className={styles.sectionWrap}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>{t('dashboard_announcement')}</p>
            <Link href="/siswa/pengumuman" className={styles.sectionLink}>{t('dashboard_see_all')}</Link>
          </div>
          {annLoading ? (
            <div className={styles.announcementList}>
              {[1, 2].map(i => (
                <div key={i} className={styles.annSkeletonCard}>
                  <div className={styles.miniSkeleton}>
                    <div className={styles.skelBar} style={{ width: '60%' }} />
                    <div className={styles.skelBar} style={{ width: '90%' }} />
                    <div className={styles.skelBar} style={{ width: '75%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className={styles.annEmpty}>
              <span className={styles.annEmptyIcon}>📭</span>
              <p className={styles.annEmptyText}>{t('dashboard_no_announcement')}</p>
            </div>
          ) : (
            <div className={styles.announcementList}>
              {announcements.map(ann => (
                <AnnouncementCard key={ann.id} item={ann} onClick={setSelectedAnn} />
              ))}
            </div>
          )}
        </div>

        {/* Peraturan */}
        <div className={styles.sectionWrap}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>Peraturan</p>
            <Link href="/siswa/peraturan" className={styles.sectionLink}>Lihat Semua →</Link>
          </div>
          {peraturan.length === 0 ? (
            <div className={styles.annEmpty}>
              <span className={styles.annEmptyIcon}>📋</span>
              <p className={styles.annEmptyText}>Belum ada peraturan.</p>
            </div>
          ) : (
            <div className={styles.announcementList}>
              {peraturan.map(item => <PeraturanCard key={item.id} item={item} />)}
            </div>
          )}
        </div>

        <CtaBanner />
      </div>

      {/* ══ BOTTOM NAV ══════════════════════════════════════════════════ */}
      <nav className={styles.bottomNav}>
        <Link href="/siswa" className={`${styles.navItem} ${styles.navItemActive}`}>
          <div className={styles.navIconWrap}><IconHomeFilled /></div>
          <span>{t('nav_beranda')}</span>
        </Link>
        <Link href="/siswa/pembayaran" className={styles.navItem}>
          <div className={styles.navIconWrap}><IconWalletOutline /></div>
          <span>{t('nav_bayar')}</span>
        </Link>
        <Link href="/siswa/laporan" className={styles.navItem}>
          <div className={styles.navIconWrap}><IconDocumentOutline /></div>
          <span>{t('nav_status')}</span>
        </Link>
        <Link href="/siswa/profile" className={styles.navItem}>
          <div className={styles.navIconWrap}><IconPersonOutline /></div>
          <span>{t('nav_profil')}</span>
        </Link>
      </nav>

      {/* Announcement Modal */}
      {selectedAnn && (
        <AnnouncementModal item={selectedAnn} onClose={() => setSelectedAnn(null)} />
      )}
    </div>
  )
}