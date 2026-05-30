'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link  from 'next/link'
import type { Pendaftaran } from '@/types'
import styles from './dashboard.module.css'
import NotificationBell from '@/components/notifications/NotificationBell'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  fullName:      string
  avatarInitial: string
  avatarUrl:     string | null
  pendaftaran:   Pendaftaran | null
  status:        Pendaftaran['status'] | null
}

interface Announcement {
  id: string
  judul: string
  tipe: 'Penting' | 'Informasi' | 'Info' | 'Peringatan'
  konten: string
  tanggal: string
  lampiran_url: string | null
  lampiran_nama: string | null
  created_at: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PROGRESS_VALUE: Record<string, number> = {
  menunggu: 25, diproses: 60, diterima: 100, ditolak: 100,
}
const STATUS_LABEL: Record<string, string> = {
  menunggu: 'Menunggu Review',
  diproses: 'Sedang Diproses',
  diterima: 'Diterima! 🎉',
  ditolak:  'Tidak Diterima',
}
const PROGRESS_CLASS: Record<string, string> = {
  menunggu: styles.progress25,
  diproses: styles.progress60,
  diterima: styles.progress100,
  ditolak:  styles.progress100red,
}

// 6 menu Akses Cepat sesuai desain
const MENU_ITEMS = [
  { href: '/siswa/pendaftaran', icon: '/image/icon formulir.jpg',    title: 'Formulir',    sub: 'Isi & edit data diri',   bgClass: 'menuBgBlue',   iconClass: 'iconBgBlue'   },
  { href: '/siswa/berkas',      icon: '/image/icon berkas.jpg',      title: 'Berkas',      sub: 'Upload dokumen',         bgClass: 'menuBgAmber',  iconClass: 'iconBgAmber'  },
  { href: '/siswa/status',      icon: '/image/icon status.webp',      title: 'Status',      sub: 'Pantau seleksi',         bgClass: 'menuBgGreen',  iconClass: 'iconBgGreen'  },
  { href: '/siswa/pembayaran',  icon: '/image/icon dompet.png',      title: 'Bayar',       sub: 'Biaya pendaftaran',      bgClass: 'menuBgViolet', iconClass: 'iconBgViolet' },
  { href: '/siswa/pengumuman',  icon: '/image/icon pengumuman.png',  title: 'Pengumuman',  sub: 'Info terbaru',           bgClass: 'menuBgRed',    iconClass: 'iconBgRed'    },
  { href: '/siswa/bantuan',     icon: '/image/icon bantuan.png',     title: 'Bantuan',     sub: 'Pusat bantuan',          bgClass: 'menuBgCyan',   iconClass: 'iconBgCyan'   },
] as const

// Jadwal penting
const JADWAL = [
  { label: 'Batas Pendaftaran', date: '28 Feb 2025',   dotClass: 'dotRed',   icon: '📅', statusLabel: 'Selesai', statusClass: 'jadwalDone'   },
  { label: 'Pengumuman Hasil',  date: '15 Maret 2025', dotClass: 'dotBlue',  icon: '📢', statusLabel: 'Selesai', statusClass: 'jadwalDone'   },
  { label: 'Daftar Ulang',      date: '1–15 Apr 2025', dotClass: 'dotGreen', icon: '🚩', statusLabel: 'Berlangsung', statusClass: 'jadwalOngoing' },
] as const

// Tipe pengumuman config
const TIPE_CONFIG: Record<string, {
  badge: string; icon: string; accent: string; pill: string;
}> = {
  Penting:    { badge: styles.badgePenting,    icon: '🔴', accent: styles.accentPenting,    pill: styles.pillPenting    },
  Informasi:  { badge: styles.badgeInformasi,  icon: '🔵', accent: styles.accentInformasi,  pill: styles.pillInformasi  },
  Info:       { badge: styles.badgeInfo,       icon: '🟢', accent: styles.accentInfo,       pill: styles.pillInfo       },
  Peringatan: { badge: styles.badgePeringatan, icon: '🟡', accent: styles.accentPeringatan, pill: styles.pillPeringatan },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting(hour: number): string {
  if (hour >= 4  && hour < 11) return 'Selamat pagi'
  if (hour >= 11 && hour < 15) return 'Selamat Siang'
  if (hour >= 15 && hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}
function formatTanggalShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

// ── AnnouncementCard ──────────────────────────────────────────────────────────
function AnnouncementCard({
  item,
  onClick,
}: {
  item: Announcement
  onClick: (a: Announcement) => void
}) {
  const cfg = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG.Informasi
  return (
    <button
      className={`${styles.announcementCard} ${cfg.accent}`}
      onClick={() => onClick(item)}
      aria-label={`Buka pengumuman: ${item.judul}`}
    >
      <div className={styles.annIconWrap}>
        <Image src="/icons/icon_pengumuman.png" alt="" width={36} height={36} className={styles.annIcon} />
      </div>
      <div className={styles.annCardLeft}>
        <span className={`${styles.annTypePill} ${cfg.pill}`}>
          {item.tipe.toUpperCase()}
        </span>
        <p className={styles.annCardTitle}>{item.judul}</p>
        <p className={styles.annCardPreview}>
          {item.konten.length > 70 ? item.konten.slice(0, 70) + '…' : item.konten}
        </p>
      </div>
      <div className={styles.annCardMeta}>
        <span className={styles.annCardDate}>{formatTanggalShort(item.tanggal)}</span>
        <svg className={styles.annChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </button>
  )
}

// ── AnnouncementModal ─────────────────────────────────────────────────────────
function AnnouncementModal({
  item,
  onClose,
}: {
  item: Announcement
  onClose: () => void
}) {
  const cfg = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG.Informasi

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className={styles.modalSheet}>
        <div className={styles.modalHandle} />
        <div className={styles.modalHeader}>
          <span className={`${styles.annTypePill} ${cfg.pill}`}>
            {cfg.icon} {item.tipe}
          </span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Tutup">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <h2 className={styles.modalTitle}>{item.judul}</h2>
        <div className={styles.modalDateRow}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{formatTanggalShort(item.tanggal)}</span>
        </div>
        <div className={styles.modalDivider} />
        <p className={styles.modalContent}>{item.konten}</p>
        {item.lampiran_url && (
          <a href={item.lampiran_url} target="_blank" rel="noopener noreferrer" className={styles.modalAttachment}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span>{item.lampiran_nama || 'Buka Lampiran'}</span>
            <span className={styles.modalAttachmentArrow}>↗</span>
          </a>
        )}
        <button className={styles.modalCloseBtn} onClick={onClose}>Tutup</button>
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardClient({
  fullName, avatarInitial, avatarUrl, pendaftaran, status,
}: Props) {
  const [now, setNow] = useState<Date>(() => new Date())
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [annLoading, setAnnLoading] = useState(true)
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null)

  useEffect(() => {
    const timerInterval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timerInterval)
  }, [])

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch('/api/siswa/announcements?limit=5')
        const json = await res.json()
        if (res.ok) setAnnouncements(json.data ?? [])
      } catch (e) {
        console.error('Failed to fetch announcements', e)
      } finally {
        setAnnLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  const hour         = now.getHours()
  const greetingText = getGreeting(hour)
  const progressClass = status ? (PROGRESS_CLASS[status] ?? styles.progress25) : styles.progress25

  return (
    <div className={styles.shell}>

      {/* ══ HERO HEADER ══════════════════════════════════════════════════════ */}
      <div className={styles.hero}>
        {/* Decorative orbs */}
        <div className={styles.orbA} />
        <div className={styles.orbB} />
        <div className={styles.orbC} />

        {/* Top nav: greeting + bell + avatar */}
        <div className={styles.heroTopBar}>
          <div className={styles.heroTopLeft}>
            <p className={styles.greetingText}>{greetingText}, 👋</p>
            <h1 className={styles.heroName}>{fullName}</h1>
            <p className={styles.heroSchool}>SPMB 2026/2027 • PON-PES AL ISTIQOMAH</p>
          </div>
          <div className={styles.heroTopRight}>
            <NotificationBell />
            <Link href="/siswa/profile" className={styles.topbarAvatar} aria-label="Profil saya">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={fullName} width={38} height={38}
                  className={styles.avatarImg} referrerPolicy="no-referrer" unoptimized
                />
              ) : (
                <span className={styles.avatarInitialText}>{avatarInitial}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Santri character image */}
        <div className={styles.heroCharacter}>
          <Image
            src="/image/icon santri.png"
            alt="Santri"
            width={180}
            height={200}
            className={styles.heroCharacterImg}
            priority
          />
        </div>
      </div>

      {/* ══ STATUS CARD (float over hero) ══════════════════════════════════ */}
      <div className={styles.floatZone}>
        {pendaftaran && status ? (
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <div className={styles.statusLeft}>
                {/* Green checkmark for diterima, else dot */}
                {status === 'diterima' ? (
                  <div className={styles.statusCheckCircle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                ) : (
                  <div className={`${styles.statusDot} ${styles[`statusDot_${status}`]}`} />
                )}
                <div>
                  <p className={styles.statusLabelSm}>STATUS PENDAFTARAN</p>
                  <p className={`${styles.statusLabelLg} ${styles[`statusLg_${status}`]}`}>
                    {STATUS_LABEL[status]}
                  </p>
                </div>
              </div>
              <Link href="/siswa/status" className={styles.detailBtn}>
                Lihat Detail <span>›</span>
              </Link>
            </div>
            <div className={styles.progressMeta}>
              <span>Progress Seleksi</span>
              <span className={styles.progressPct}>{PROGRESS_VALUE[status]}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={progressClass} />
            </div>
            <div className={styles.infoDivider} />
            {/* Info row: 3 kolom */}
            <div className={styles.infoRow3}>
              <div className={styles.infoCol}>
                <div className={styles.infoColIcon}>👤</div>
                <p className={styles.infoKey}>Nama Lengkap</p>
                <p className={styles.infoVal}>{pendaftaran.nama_lengkap}</p>
              </div>
              <div className={styles.infoColDivider} />
              <div className={styles.infoCol}>
                <div className={styles.infoColIcon}>🛡️</div>
                <p className={styles.infoKey}>No. Reg</p>
                <p className={styles.infoValMono}>{pendaftaran.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className={styles.infoColDivider} />
              <div className={styles.infoCol}>
                <div className={styles.infoColIcon}>📅</div>
                <p className={styles.infoKey}>Tanggal Daftar</p>
                <p className={styles.infoVal}>{formatTanggalShort(pendaftaran.created_at ?? '')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.emptyCard}>
            <div className={styles.emptyRow}>
              <div className={styles.emptyIconBox}>📋</div>
              <div>
                <p className={styles.emptyTitle}>Belum Mendaftar</p>
                <p className={styles.emptySub}>Lengkapi formulir untuk memulai proses seleksi.</p>
              </div>
            </div>
            <Link href="/siswa/pendaftaran" className={styles.ctaBtn}>
              <span>Mulai Pendaftaran Sekarang</span>
              <span>→</span>
            </Link>
          </div>
        )}
      </div>

      {/* ══ MAIN CONTENT ═══════════════════════════════════════════════════ */}
      <div className={styles.mainContent}>

        {/* ── Akses Cepat (6 menu, 3x2 grid) ──────────────────────────── */}
        <div className={styles.sectionWrap}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>Akses Cepat</p>
            <Link href="/siswa" className={styles.sectionLink}>Lihat Semua →</Link>
          </div>
          <div className={styles.menuGrid6}>
            {MENU_ITEMS.map((item) => (
              <Link key={item.title} href={item.href}
                className={`${styles.menuCard} ${styles[item.bgClass]}`}
              >
                <div className={`${styles.menuIconBox} ${styles[item.iconClass]}`}>
                  <Image src={item.icon} alt={item.title} width={28} height={28} className={styles.menuIconImg} />
                </div>
                <p className={styles.menuTitle}>{item.title}</p>
                <p className={styles.menuSub}>{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Jadwal Penting (3 kolom horizontal) ──────────────────────── */}
        <div className={styles.sectionWrap}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>Jadwal Penting</p>
            <Link href="/siswa/jadwal" className={styles.sectionLink}>Lihat Semua →</Link>
          </div>
          <div className={styles.jadwalGrid}>
            {JADWAL.map((j) => (
              <div key={j.label} className={styles.jadwalItem}>
                <div className={styles.jadwalItemTop}>
                  <span className={styles.jadwalItemIcon}>{j.icon}</span>
                  <span className={`${styles.jadwalDotSmall} ${styles[j.dotClass]}`} />
                </div>
                <p className={`${styles.jadwalItemLabel} ${styles[j.dotClass === 'dotRed' ? 'jadwalLabelRed' : j.dotClass === 'dotBlue' ? 'jadwalLabelBlue' : 'jadwalLabelGreen']}`}>
                  {j.label}
                </p>
                <p className={styles.jadwalItemDate}>{j.date}</p>
                <div className={`${styles.jadwalStatus} ${styles[j.statusClass]}`}>
                  {j.statusClass === 'jadwalDone' ? (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {j.statusLabel}
                    </>
                  ) : (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {j.statusLabel}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Banner Promo ──────────────────────────────────────────────── */}
        <div className={styles.promoBanner}>
          <div className={styles.promoBannerLeft}>
            <div className={styles.promoBannerImg}>
              {/* Graduation icon using emoji / you can replace with actual image */}
              <span style={{ fontSize: '3rem' }}>🎓</span>
            </div>
          </div>
          <div className={styles.promoBannerContent}>
            <p className={styles.promoBannerTitle}>Persiapkan dirimu menjadi santri berprestasi!</p>
            <p className={styles.promoBannerSub}>Raih masa depan gemilang bersama Pondok Pesantren Al Istiqomah</p>
            <button className={styles.promoBannerBtn}>Selengkapnya ›</button>
          </div>
          {/* Dot indicators */}
          <div className={styles.promoDots}>
            <span className={`${styles.promoDot} ${styles.promoDotActive}`} />
            <span className={styles.promoDot} />
            <span className={styles.promoDot} />
          </div>
        </div>

        {/* ── Pengumuman Terbaru ────────────────────────────────────────── */}
        <div className={styles.sectionWrap}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>Pengumuman Terbaru</p>
            <Link href="/siswa/pengumuman" className={styles.sectionLink}>Lihat Semua →</Link>
          </div>

          {annLoading ? (
            <div className={styles.annSkeletonWrap}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.annSkeleton}>
                  <div className={styles.skelPill} />
                  <div className={styles.skelTitle} />
                  <div className={styles.skelBody} />
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className={styles.annEmpty}>
              <span className={styles.annEmptyIcon}>📭</span>
              <p className={styles.annEmptyText}>Belum ada pengumuman</p>
            </div>
          ) : (
            <div className={styles.announcementList}>
              {announcements.map((ann) => (
                <AnnouncementCard key={ann.id} item={ann} onClick={setSelectedAnn} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ══ BOTTOM NAV ═══════════════════════════════════════════════════════ */}
      <nav className={styles.bottomNav}>
        <Link href="/siswa" className={`${styles.navItem} ${styles.navItemActive}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>Beranda</span>
        </Link>
        <Link href="/siswa/pendaftaran" className={styles.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>Daftar</span>
        </Link>
        <Link href="/siswa/pembayaran" className={styles.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span>Bayar</span>
        </Link>
        <Link href="/siswa/status" className={styles.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>Status</span>
        </Link>
        <Link href="/siswa/profile" className={styles.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Profil</span>
        </Link>
      </nav>

      {/* ══ ANNOUNCEMENT MODAL ══════════════════════════════════════════════ */}
      {selectedAnn && (
        <AnnouncementModal
          item={selectedAnn}
          onClose={() => setSelectedAnn(null)}
        />
      )}
    </div>
  )
}