'use client'

/**
 * app/siswa/dashboard/DashboardClient.tsx
 *
 * PERBAIKAN:
 * 1. Import CSS: './dashboard.module.css' → './dashboard_module.css'
 *    (sesuaikan dengan nama file CSS yang sebenarnya di folder Anda)
 * 2. payBtn href "/siswa/pembayaran/bayar" → sudah benar,
 *    tapi halaman /siswa/pembayaran/bayar/page.tsx BELUM ADA → itulah 404.
 *    Solusi: buat app/siswa/pembayaran/bayar/page.tsx (sudah disediakan).
 * 3. Image layout prop deprecated Next.js 13+ → hapus layout="fill",
 *    gunakan fill prop langsung.
 * 4. Tombol "Selengkapnya" di HERO_SLIDES sebelumnya mengarah ke
 *    '/siswa/tentang', '/siswa/kegiatan', '/siswa/prestasi' yang BELUM ADA
 *    halamannya → itulah penyebab 404 di /siswa/tentang.
 *    Solusi: semua slide sekarang diarahkan ke halaman galeri kegiatan
 *    yang baru dibuat: '/siswa/galeri' (lihat app/siswa/galeri/page.tsx).
 */

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './dashboard.module.css'

/* ════════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════════ */
interface Props {
  fullName: string
  avatarInitial: string
  avatarUrl: string | null
}

interface JadwalItem {
  id: string
  label: string
  tanggal: string
  tanggal_mulai: string | null
  tanggal_selesai: string | null
  status: string
  warna: string
  urutan?: number
}

interface PembayaranItem {
  id: string
  judul: string
  jumlah: number
  status: 'lunas' | 'belum_lunas' | string
}

interface PembayaranData {
  total: number
  items: PembayaranItem[]
}

interface LaporanItem {
  id: string
  judul: string
  tipe: 'bulanan' | 'tahunan' | 'khusus' | string
  deskripsi: string | null
  file_url: string | null
  created_at: string | null
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

/* ════════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════════ */
const HERO_SLIDES = [
  {
    eyebrow: 'Rutinan Ahad Legi',
    titleBold: 'Ngaji Hikam,',
    titleLight: 'lalenggahan sareng Guru',
    href: '/siswa/galeri',
    image: '/image/galeri/ngaji.jpeg',
  },
  {
    eyebrow: 'Ziarah Wali Songo',
    titleBold: 'Sowan Ploso,',
    titleLight: 'K.H Nurul Huda Djazuli',
    href: '/siswa/galeri',
    image: '/image/galeri/Sowan ndalem kesepuhan K.H Nurul Huda Dzajuli.jpeg',
  },
  {
    eyebrow: 'Masyayikh Ploso',
    titleBold: 'Halal Bihalal,',
    titleLight: 'bersama Gus Kautsar & Gus Fahim Ploso',
    href: '/siswa/galeri',
    image: '/image/galeri/ngaji1.jpeg',
  },
] as const

const QUICK_ITEMS = [
  { href: '/siswa/jadwal',      label: 'Jadwal',      sub: 'Lihat kegiatan & jadwal harian',  icon: '/icons/jadwal icon.png' },
  { href: '/siswa/berkas',      label: 'Berkas',      sub: 'Isi Berkas yang di butuhkan',      icon: '/icons/berkas icon.png' },
  { href: '/siswa/pembayaran',  label: 'Pembayaran',  sub: 'Cek tagihan & lakukan bayar',      icon: '/icons/pembayaran icon.png' },
  { href: '/siswa/laporan',     label: 'Laporan',     sub: 'Lihat laporan perkembangan',       icon: '/icons/laporan icon.png' },
  { href: '/siswa/pengumuman',  label: 'Pengumuman',  sub: 'Info terbaru dari pesantren',      icon: '/icons/pengumuman icon.png' },
  { href: '/siswa/formulir',    label: 'Formulir',    sub: 'Isi formulir data diri',           icon: '/icons/formulir icon.png' },
]

const TIPE_CONFIG: Record<string, { pill: string }> = {
  Penting:    { pill: styles.pillPenting },
  Informasi:  { pill: styles.pillInformasi },
  Info:       { pill: styles.pillInfo },
  Peringatan: { pill: styles.pillPeringatan },
}

const LAPORAN_TIPE_CONFIG: Record<string, { label: string; badge: string }> = {
  bulanan: { label: 'Bulanan', badge: styles.laporanBadgeBulanan },
  tahunan: { label: 'Tahunan', badge: styles.laporanBadgeTahunan },
  khusus:  { label: 'Khusus',  badge: styles.laporanBadgeKhusus },
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════ */
function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n)
}
function formatTanggalShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
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
  const num = parseInt(full, 16)
  if (Number.isNaN(num)) return fallback
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s
}

/* ════════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════════ */
function IconCardSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
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
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  )
}
function IconDocumentOutline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  )
}
function IconPersonOutline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════
   HERO BANNER — carousel dengan auto-rotate
   ════════════════════════════════════════════════════════════════ */
function HeroBanner() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [])

  const slide = HERO_SLIDES[index]

  return (
    <div className={styles.heroBannerWrap}>
      <div className={styles.heroBannerBgPattern} />
      <div className={styles.heroBannerContent}>
        <span className={styles.heroBannerEyebrow}>{slide.eyebrow}</span>
        <h2 className={styles.heroBannerTitle}>
          <span className={styles.heroTitleBold}>{slide.titleBold}</span>
          <span className={styles.heroTitleLight}>{slide.titleLight}</span>
        </h2>
        <Link href={slide.href} className={styles.heroBannerBtn}>
          Selengkapnya <span aria-hidden>→</span>
        </Link>
      </div>
      <div className={styles.heroBannerImageWrap}>
        {/* FIX: hapus layout="fill" (deprecated Next.js 13+), gunakan fill prop */}
        <Image src={slide.image} alt={slide.eyebrow} fill className={styles.heroBannerImg} priority key={index} />
      </div>
      <div className={styles.heroBannerDots}>
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
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
  return (
    <div className={styles.miniCard}>
      <div className={styles.miniCardHeader}>
        <p className={styles.miniCardTitle}>Jadwal Ter...</p>
        <Link href="/siswa/jadwal" className={styles.miniCardLink}>Lihat Jadwal</Link>
      </div>
      {loading ? (
        <div className={styles.miniSkeleton}>
          {[1, 2, 3, 4].map((i) => <div key={i} className={styles.skelBar} style={{ width: `${60 + i * 8}%` }} />)}
        </div>
      ) : items.length === 0 ? (
        <p className={styles.timelineEmpty}>Belum ada jadwal.</p>
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
                  <span
                    className={styles.jadwalStatusBadge}
                    style={{ color: it.warna || 'var(--green)', background: hexToRgba(it.warna, 0.14) }}
                  >
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
  return (
    <div className={styles.miniCard}>
      <div className={styles.miniCardHeader}>
        <p className={styles.miniCardTitle}>Pembayar...</p>
        <Link href="/siswa/pembayaran" className={styles.miniCardLink}>Lihat Semua</Link>
      </div>
      {loading ? (
        <div className={styles.miniSkeleton}>
          {[1, 2, 3, 4].map((i) => <div key={i} className={styles.skelBar} style={{ width: `${55 + i * 9}%` }} />)}
        </div>
      ) : (
        <>
          <p className={styles.payCaption}>Tagihan Bulan Ini</p>
          <div className={styles.payAmountRow}>
            <span className={styles.payAmount}>Rp {formatRupiah(data.total)}</span>
            <div className={styles.payIconWrap}>
              <div className={styles.payIconBg}><IconCardSmall /></div>
              <div className={styles.payIconBadge}><IconCheckSmall /></div>
            </div>
          </div>
          {/*
           * FIX UTAMA: href="/siswa/pembayaran/bayar"
           * Route ini butuh file: app/siswa/pembayaran/bayar/page.tsx
           * File tersebut sudah dibuat sebagai bagian dari perbaikan ini.
           */}
          <Link href="/siswa/pembayaran/bayar" className={styles.payBtn}>Bayar Sekarang</Link>

          {data.items.length === 0 ? (
            <p className={styles.payEmpty}>Tidak ada tagihan tertunda.</p>
          ) : (
            <div className={styles.payList}>
              {data.items.map((item) => (
                <div key={item.id} className={styles.payItem}>
                  <div className={styles.payItemText}>
                    <p className={styles.payItemTitle}>{item.judul}</p>
                    <p className={styles.payItemAmount}>Rp {formatRupiah(item.jumlah)}</p>
                  </div>
                  <span className={`${styles.payBadge} ${item.status === 'lunas' ? styles.payBadgeLunas : styles.payBadgeBelumLunas}`}>
                    {item.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
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
  return (
    <div className={styles.miniCard}>
      <div className={styles.miniCardHeader}>
        <p className={styles.miniCardTitle}>Laporan T...</p>
        <Link href="/siswa/laporan" className={styles.miniCardLink}>Lihat Semua</Link>
      </div>
      {loading ? (
        <div className={styles.miniSkeleton}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skelBar} style={{ width: `${55 + i * 9}%` }} />)}
        </div>
      ) : data.length === 0 ? (
        <p className={styles.laporanMiniEmpty}>Belum ada laporan.</p>
      ) : (
        <div className={styles.laporanMiniList}>
          {data.map((item) => {
            const cfg = LAPORAN_TIPE_CONFIG[item.tipe] ?? { label: item.tipe, badge: styles.laporanBadgeKhusus }
            return (
              <Link key={item.id} href={`/siswa/laporan/${item.id}`} className={styles.laporanMiniItem}>
                <p className={styles.laporanMiniTitle}>{item.judul}</p>
                <div className={styles.laporanMiniMeta}>
                  <span className={styles.laporanMiniDate}>
                    {item.created_at ? formatTanggalShort(item.created_at) : '-'}
                  </span>
                  <span className={`${styles.laporanMiniBadge} ${cfg.badge}`}>{cfg.label}</span>
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
function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif)$/i.test(url)
}

function AnnouncementCard({ item, onClick }: { item: Announcement; onClick: (a: Announcement) => void }) {
  const cfg = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG.Informasi
  return (
    <button type="button" className={styles.annCard} onClick={() => onClick(item)} aria-label={`Buka pengumuman: ${item.judul}`}>
      <div className={styles.annThumb}>
        {item.lampiran_url && isImageUrl(item.lampiran_url) ? (
          <Image src={item.lampiran_url} alt="" fill className={styles.annThumbImg} />
        ) : (
          <Image src="/icons/pengumuman icon.png" alt="Pengumuman" fill className={styles.annThumbImg} />
        )}
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
  const cfg = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG.Informasi

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className={styles.modalSheet}>
        <div className={styles.modalHandle} />
        <div className={styles.modalHeader}>
          <span className={`${styles.annBadge} ${cfg.pill}`}>{item.tipe}</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Tutup">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <h2 className={styles.modalTitle}>{item.judul}</h2>
        <div className={styles.modalDateRow}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
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
            <span>{item.lampiran_nama || 'Buka Lampiran'}</span>
            <span className={styles.modalAttachmentArrow}>↗</span>
          </a>
        )}
        <button className={styles.modalCloseBtn} onClick={onClose}>Tutup</button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   CTA BANNER
   ════════════════════════════════════════════════════════════════ */
function CtaBanner() {
  return (
    <div className={styles.bannerKataWrap}>
      <Image
        src="/icons/kata-banner.png"
        alt="Banner Motivasi Santri"
        width={1200}
        height={350}
        className={styles.bannerKataImage}
        priority
      />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function DashboardClient({ fullName, avatarInitial, avatarUrl }: Props) {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([])
  const [jadwalLoading, setJadwalLoading] = useState(true)
  const [pembayaran, setPembayaran] = useState<PembayaranData>({ total: 0, items: [] })
  const [pembayaranLoading, setPembayaranLoading] = useState(true)
  const [laporan, setLaporan] = useState<LaporanItem[]>([])
  const [laporanLoading, setLaporanLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [annLoading, setAnnLoading] = useState(true)
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/siswa/jadwal')
        const json = await res.json()
        if (res.ok) {
          const mapped: JadwalItem[] = (json.data ?? []).slice(0, 5).map((row: Record<string, unknown>) => ({
            id: row.id as string,
            label: (row.label ?? '') as string,
            tanggal: (row.tanggal ?? '') as string,
            tanggal_mulai: (row.tanggal_mulai ?? null) as string | null,
            tanggal_selesai: (row.tanggal_selesai ?? null) as string | null,
            status: (row.status ?? '') as string,
            warna: (row.warna ?? '#16a34a') as string,
            urutan: row.urutan as number | undefined,
          }))
          setJadwal(mapped)
        }
      } catch (e) {
        console.error('Gagal memuat jadwal:', e)
      } finally {
        setJadwalLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/siswa/pembayaran/ringkasan')
        const json = await res.json()
        if (res.ok) setPembayaran(json.data ?? { total: 0, items: [] })
      } catch (e) {
        console.error('Gagal memuat ringkasan pembayaran:', e)
      } finally {
        setPembayaranLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/siswa/laporan/ringkasan')
        const json = await res.json()
        if (res.ok) setLaporan(json.data ?? [])
      } catch (e) {
        console.error('Gagal memuat ringkasan laporan:', e)
      } finally {
        setLaporanLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/siswa/announcements?limit=3')
        const json = await res.json()
        if (res.ok) setAnnouncements(json.data ?? [])
      } catch (e) {
        console.error('Gagal memuat pengumuman:', e)
      } finally {
        setAnnLoading(false)
      }
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
              <Image
                src={avatarUrl}
                alt={fullName}
                width={52}
                height={52}
                className={styles.avatarImg}
                referrerPolicy="no-referrer"
                unoptimized
              />
            ) : (
              <span className={styles.avatarInitialText}>{avatarInitial}</span>
            )}
          </div>
          <div className={styles.greetWrap}>
            <p className={styles.greetText}>Assalamu&apos;alaikum,</p>
            <h1 className={styles.greetName}>{fullName}</h1>
            <p className={styles.greetSchool}>Santri Pondok Pesantren Al-Istiqomah</p>
          </div>
        </div>
      </header>

      {/* ══ PAGE BODY ═══════════════════════════════════════════════════ */}
      <div className={styles.pageBody}>
        <HeroBanner />

        {/* Akses Cepat */}
        <div className={styles.sectionWrap}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>Akses Cepat</p>
            <Link href="/siswa/menu" className={styles.sectionLink}>Lihat Semua →</Link>
          </div>
          <div className={styles.quickGrid}>
            {QUICK_ITEMS.map(({ href, label, sub, icon }) => (
              <Link key={label} href={href} className={styles.quickCard}>
                <div className={styles.quickIconWrap}>
                  <Image src={icon} alt={label} width={52} height={52} className={styles.quickIconImage} />
                </div>
                <span className={styles.quickLabel}>{label}</span>
                <span className={styles.quickSub}>{sub}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 3 Kartu */}
        <div className={styles.threeColGrid}>
          <JadwalHariIniCard items={jadwal} loading={jadwalLoading} />
          <PembayaranCard data={pembayaran} loading={pembayaranLoading} />
          <LaporanCard data={laporan} loading={laporanLoading} />
        </div>

        {/* Pengumuman */}
        <div className={styles.sectionWrap}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>Pengumuman Terbaru</p>
            <Link href="/siswa/pengumuman" className={styles.sectionLink}>Lihat Semua →</Link>
          </div>
          {annLoading ? (
            <div className={styles.announcementList}>
              {[1, 2].map((i) => (
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

        {/* Banner Peraturan */}
        <div style={{ padding: '0 16px', marginTop: '16px' }}>
          <Link href="/siswa/peraturan" style={{ display: 'block', position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <Image
              src="/icons/hi.jpeg"
              alt="Banner Peraturan"
              width={1200}
              height={430}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(20, 20, 20, 0.5)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}>
              Lihat Selengkapnya →
            </div>
          </Link>
        </div>

        <CtaBanner />
      </div>

      {/* ══ BOTTOM NAV ══════════════════════════════════════════════════ */}
      <nav className={styles.bottomNav}>
        <Link href="/siswa" className={`${styles.navItem} ${styles.navItemActive}`}>
          <div className={styles.navIconWrap}><IconHomeFilled /></div>
          <span>Beranda</span>
        </Link>
        <Link href="/siswa/pembayaran" className={styles.navItem}>
          <div className={styles.navIconWrap}><IconWalletOutline /></div>
          <span>Bayar</span>
        </Link>
        <Link href="/siswa/laporan" className={styles.navItem}>
          <div className={styles.navIconWrap}><IconDocumentOutline /></div>
          <span>Status</span>
        </Link>
        <Link href="/siswa/profile" className={styles.navItem}>
          <div className={styles.navIconWrap}><IconPersonOutline /></div>
          <span>Profil</span>
        </Link>
      </nav>

      {/* Announcement Modal */}
      {selectedAnn && (
        <AnnouncementModal item={selectedAnn} onClose={() => setSelectedAnn(null)} />
      )}
    </div>
  )
}