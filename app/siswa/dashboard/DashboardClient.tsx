'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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

// 4 Quick Access items (like the design: Formulir, Berkas, Status, Bayar)
const QUICK_ITEMS = [
  {
    href: '/siswa/pendaftaran',
    icon: '/image/icon formulir.jpg',
    title: 'Formulir',
    sub: 'Isi & edit data diri',
    colorClass: 'quickIconWrap_blue',
  },
  {
    href: '/siswa/berkas',
    icon: '/image/icon berkas.jpg',
    title: 'Berkas',
    sub: 'Upload dokumen',
    colorClass: 'quickIconWrap_amber',
  },
  {
    href: '/siswa/status',
    icon: '/image/icon status.webp',
    title: 'Status',
    sub: 'Pantau seleksi',
    colorClass: 'quickIconWrap_green',
  },
  {
    href: '/siswa/pembayaran',
    icon: '/image/icon pembayaran.avif',
    title: 'Bayar',
    sub: 'Biaya pendaftaran',
    colorClass: 'quickIconWrap_violet',
  },
] as const

const JADWAL = [
  { label: 'Batas Pendaftaran', date: '28 Feb 2026',   dotClass: 'dotRed',   icon: '📅', statusLabel: 'Selesai',     statusClass: 'jadwalDone'    },
  { label: 'Pengumuman Hasil',  date: '15 Maret 2026', dotClass: 'dotBlue',  icon: '📢', statusLabel: 'Selesai',     statusClass: 'jadwalDone'    },
  { label: 'Daftar Ulang',      date: '1–15 Apr 2026', dotClass: 'dotGreen', icon: '🚩', statusLabel: 'Berlangsung', statusClass: 'jadwalOngoing' },
] as const

const TIPE_CONFIG: Record<string, {
  badge: string; icon: string; accent: string; pill: string;
}> = {
  Penting:    { badge: styles.badgePenting,    icon: '🔴', accent: styles.accentPenting,    pill: styles.pillPenting    },
  Informasi:  { badge: styles.badgeInformasi,  icon: '🔵', accent: styles.accentInformasi,  pill: styles.pillInformasi  },
  Info:       { badge: styles.badgeInfo,       icon: '🟢', accent: styles.accentInfo,       pill: styles.pillInfo       },
  Peringatan: { badge: styles.badgePeringatan, icon: '🟡', accent: styles.accentPeringatan, pill: styles.pillPeringatan },
}

// ── Promo Top Slider (Wujudkan Impianmu style) ────────────────────────────────
interface PromoTopSlide {
  id: number
  eyebrow: string
  title: string
  highlight: string
  sub: string
  btnLabel: string
  btnHref: string
  image: string
  imageAlt: string
}

const PROMO_TOP_SLIDES: PromoTopSlide[] = [
  {
    id: 0,
    eyebrow: 'Berprestasi, Berakhlak, Berilmu',
    title: 'Wujudkan Impianmu\nBersama ',
    highlight: 'Al Istiqomah',
    sub: 'Belajar • Berkarya • Berkontribusi',
    btnLabel: 'Lihat Program →',
    btnHref: '/siswa/program',
    image: '/image/buku.png',
    imageAlt: 'Ilustrasi buku dan tas santri',
  },
  {
    id: 1,
    eyebrow: 'PSMB Al Istiqomah',
    title: 'Mujahidah: Urungkan\nNiatmu, Niscaya ',
    highlight: 'Allah Berikan',
    sub: 'Kemudahan Jalannya.',
    btnLabel: 'Lihat Selengkapnya →',
    btnHref: '/siswa/peraturan',
    image: '/image/ilustrasi santri.png',
    imageAlt: 'Ilustrasi santri membaca',
  },
]

const CAROUSEL_INTERVAL = 5000

// ── Banner Carousel (bottom) ──────────────────────────────────────────────────


// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting(hour: number): string {
  if (hour >= 4  && hour < 11) return 'Selamat Pagi'
  if (hour >= 11 && hour < 15) return 'Selamat Siang'
  if (hour >= 15 && hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}
function getGreetingEmoji(hour: number): string {
  if (hour >= 4  && hour < 11) return '🌤️'
  if (hour >= 11 && hour < 15) return '☀️'
  if (hour >= 15 && hour < 18) return '🌤️'
  return '🌙'
}
function formatTanggalShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

// ── PromoTopCarousel ──────────────────────────────────────────────────────────
function PromoTopCarousel() {
  const [activeIdx, setActiveIdx]       = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((idx: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveIdx(idx)
      setIsTransitioning(false)
    }, 280)
  }, [isTransitioning])

  const goNext = useCallback(() => {
    goTo((activeIdx + 1) % PROMO_TOP_SLIDES.length)
  }, [activeIdx, goTo])

  useEffect(() => {
    timerRef.current = setInterval(goNext, CAROUSEL_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [goNext])

  function handleDotClick(idx: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    goTo(idx)
    timerRef.current = setInterval(goNext, CAROUSEL_INTERVAL)
  }

  const slide = PROMO_TOP_SLIDES[activeIdx]

  return (
    <div className={styles.promoSliderCard}>
      <div
        className={styles.promoSliderInner}
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateX(-6px)' : 'translateX(0)',
          transition: 'opacity 0.28s ease, transform 0.28s ease',
        }}
      >
        {/* bg decorative circles */}
        <div className={styles.promoSliderBg}>
          <div className={styles.promoSliderBgCircle1} />
          <div className={styles.promoSliderBgCircle2} />
        </div>

        {/* Text content */}
        <div className={styles.promoSliderContent}>
          <span className={styles.promoSliderEyebrow}>{slide.eyebrow}</span>
          <h2 className={styles.promoSliderTitle}>
            {slide.title}
            <span className={styles.promoSliderTitleHighlight}>{slide.highlight}</span>
          </h2>
          <p className={styles.promoSliderSub}>{slide.sub}</p>
          <Link href={slide.btnHref} className={styles.promoSliderBtn}>
            {slide.btnLabel}
          </Link>
        </div>

        {/* Illustration */}
        <div className={styles.promoSliderImageWrap}>
          <Image
            src={slide.image}
            alt={slide.imageAlt}
            fill
            className={styles.promoSliderImg}
            priority={slide.id === 0}
          />
        </div>
      </div>

      {/* Dots */}
      <div className={styles.promoSliderDots}>
        {PROMO_TOP_SLIDES.map((_, i) => (
          <button
            key={i}
            className={`${styles.promoSliderDot} ${i === activeIdx ? styles.promoSliderDotActive : ''}`}
            onClick={() => handleDotClick(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// ── StaticBanner ──────────────────────────────────────────────────────────────
function StaticBanner() {
  return (
    <div className={styles.promoBanner}>
      <div className={styles.promoBannerImgWrap}>
        <Image
          src="/image/banner1.png"
          alt="Banner Wujudkan Lingkungan Nyaman"
          fill
          className={styles.promoBannerImg}
          priority
        />
      </div>
      <div className={styles.promoBannerOverlay} />
      <div className={styles.promoBannerFooter}>
        <Link href="/siswa/peraturan" className={styles.promoBannerBtn}>
          Lihat Selengkapnya →
        </Link>
      </div>
    </div>
  )
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
        <Image
          src="/image/laporan.jpg"
          alt=""
          width={36}
          height={36}
          className={styles.annIcon}
        />
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardClient({
  fullName, avatarInitial, avatarUrl, pendaftaran, status,
}: Props) {
  const [now, setNow]                   = useState<Date>(() => new Date())
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [annLoading, setAnnLoading]     = useState(true)
  const [selectedAnn, setSelectedAnn]   = useState<Announcement | null>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res  = await fetch('/api/siswa/announcements?limit=5')
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

  const hour          = now.getHours()
  const greetingText  = getGreeting(hour)
  const greetingEmoji = getGreetingEmoji(hour)
  const progressClass = status ? (PROGRESS_CLASS[status] ?? styles.progress25) : styles.progress25

  return (
    <div className={styles.shell}>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div className={styles.hero}>
        <div className={styles.orbA} />
        <div className={styles.orbB} />
        <div className={styles.orbC} />
        <div className={styles.starField}>
          {[...Array(8)].map((_, i) => (
            <span key={i} className={`${styles.star} ${styles[`star${i + 1}` as keyof typeof styles]}`} />
          ))}
        </div>

        {/* Top bar */}
        <div className={styles.heroTopBar}>
          <div className={styles.heroTopLeft}>
            <div className={styles.greetingBadge}>
              <span>{greetingEmoji}</span>
              <span>{greetingText}</span>
            </div>
            <h1 className={styles.heroName}>{fullName}</h1>
            <p className={styles.heroSchool}>Santri Pondok Pesantren Al Istiqomah</p>
          </div>

          <div className={styles.heroTopRight}>
            <NotificationBell />
            <Link href="/siswa/profile" className={styles.topbarAvatar} aria-label="Profil saya">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={fullName} width={42} height={42}
                  className={styles.avatarImg} referrerPolicy="no-referrer" unoptimized
                />
              ) : (
                <span className={styles.avatarInitialText}>{avatarInitial}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Character */}
        <div className={styles.heroCharacter}>
          <Image
            src="/image/ilustrasi santri.png"
            alt="Santri"
            width={155}
            height={185}
            className={styles.heroCharacterImg}
            priority
          />
        </div>

        {/* Masjid silhouette */}
        <div className={styles.heroMasjid}>
          <Image
            src="/image/ilustrasi masjid.png"
            alt=""
            width={200}
            height={120}
            className={styles.heroMasjidImg}
            priority
          />
        </div>
      </div>

      {/* ══ FLOAT ZONE ════════════════════════════════════════════════════════ */}
      <div className={styles.floatZone}>

        {/* Promo top slider */}
        <PromoTopCarousel />

        {/* Quick access — 4 icons */}
        <div className={styles.quickSection}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>Akses Cepat</p>
            <Link href="/siswa/menu" className={styles.sectionLink}>Lihat Semua →</Link>
          </div>
          <div className={styles.quickGrid}>
            {QUICK_ITEMS.map((item) => (
              <Link key={item.title} href={item.href} className={styles.quickCard}>
                <div className={`${styles.quickIconWrap} ${styles[item.colorClass as keyof typeof styles]}`}>
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={28}
                    height={28}
                    className={styles.quickIconImg}
                  />
                </div>
                <span className={styles.quickLabel}>{item.title}</span>
                <span className={styles.quickSub}>{item.sub}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Status / Empty card */}
        {pendaftaran && status ? (
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <div className={styles.statusLeft}>
                {status === 'diterima' ? (
                  <div className={styles.statusCheckCircle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                ) : (
                  <div className={`${styles.statusDot} ${styles[`statusDot_${status}` as keyof typeof styles]}`} />
                )}
                <div>
                  <p className={styles.statusLabelSm}>STATUS PENDAFTARAN</p>
                  <p className={`${styles.statusLabelLg} ${styles[`statusLg_${status}` as keyof typeof styles]}`}>
                    {STATUS_LABEL[status]}
                  </p>
                </div>
              </div>
              <Link href="/siswa/status" className={styles.detailBtn}>
                Lihat Detail →
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

            <div className={styles.infoRow3}>
              <div className={styles.infoCol}>
                <div className={styles.infoColIconWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <p className={styles.infoKey}>Nama Lengkap</p>
                <p className={styles.infoVal}>{pendaftaran.nama_lengkap}</p>
              </div>
              <div className={styles.infoColDivider} />
              <div className={styles.infoCol}>
                <div className={styles.infoColIconWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <p className={styles.infoKey}>No. Registrasi</p>
                <p className={styles.infoValMono}>PSB-2026-{pendaftaran.id.slice(0, 4).toUpperCase()}</p>
              </div>
              <div className={styles.infoColDivider} />
              <div className={styles.infoCol}>
                <div className={styles.infoColIconWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <p className={styles.infoKey}>Tanggal Daftar</p>
                <p className={styles.infoVal}>{formatTanggalShort(pendaftaran.created_at ?? '')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.emptyCard}>
            <div className={styles.emptyRow}>
              <div className={styles.emptyIconBox}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
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

      {/* ══ MAIN CONTENT ══════════════════════════════════════════════════════ */}
      <div className={styles.mainContent}>

        {/* ── Jadwal Penting ─────────────────────────────────────────────── */}
        <div className={styles.sectionWrap}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>Jadwal Penting</p>
            <Link href="/siswa/jadwal" className={styles.sectionLink}>Lihat Semua →</Link>
          </div>
          <div className={styles.jadwalGrid}>
            {JADWAL.map((j) => (
              <div
                key={j.label}
                className={`${styles.jadwalItem} ${styles[`jadwalBorder_${j.dotClass}` as keyof typeof styles]}`}
              >
                <div className={styles.jadwalItemTop}>
                  <span className={styles.jadwalItemIcon}>{j.icon}</span>
                  <span className={`${styles.jadwalDotSmall} ${styles[j.dotClass as keyof typeof styles]}`} />
                </div>
                <p className={`${styles.jadwalItemLabel} ${
                  j.dotClass === 'dotRed'   ? styles.jadwalLabelRed   :
                  j.dotClass === 'dotBlue'  ? styles.jadwalLabelBlue  :
                                              styles.jadwalLabelGreen
                }`}>
                  {j.label}
                </p>
                <p className={styles.jadwalItemDate}>{j.date}</p>
                <div className={`${styles.jadwalStatus} ${styles[j.statusClass as keyof typeof styles]}`}>
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

        {/* ── Banner Carousel ─────────────────────────────────────────────── */}
        <StaticBanner />

        {/* ── Pengumuman Terbaru ──────────────────────────────────────────── */}
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

      {/* ══ BOTTOM NAV ════════════════════════════════════════════════════════ */}
      <nav className={styles.bottomNav}>
        <Link href="/siswa" className={`${styles.navItem} ${styles.navItemActive}`}>
          <div className={styles.navIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <span>Beranda</span>
        </Link>
        <Link href="/siswa/pendaftaran" className={styles.navItem}>
          <div className={styles.navIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <span>Daftar</span>
        </Link>
        <Link href="/siswa/berkas" className={styles.navItem}>
          <div className={styles.navIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span>Berkas</span>
        </Link>
        <Link href="/siswa/status" className={styles.navItem}>
          <div className={styles.navIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <span>Status</span>
        </Link>
        <Link href="/siswa/profile" className={styles.navItem}>
          <div className={styles.navIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span>Profil</span>
        </Link>
      </nav>

      {/* ══ ANNOUNCEMENT MODAL ════════════════════════════════════════════════ */}
      {selectedAnn && (
        <AnnouncementModal
          item={selectedAnn}
          onClose={() => setSelectedAnn(null)}
        />
      )}
    </div>
  )
}