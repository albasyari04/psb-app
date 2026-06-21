'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './galeri.module.css'

/* ════════════════════════════════════════════════════════════════
   DATA GALERI
   Sesuaikan src dengan nama file asli di public/image/galeri/ Anda.
   `category` menentukan icon badge yang tampil di atas thumbnail.
   `photoCount` = jumlah foto dalam album ini (ganti dengan data asli,
   angka di bawah ini hanya contoh mengikuti mockup desain).
   ════════════════════════════════════════════════════════════════ */
type GalleryCategory = 'people' | 'mosque' | 'book' | 'sparkle' | 'tower' | 'camera'

interface GalleryItem {
  src: string
  title: string
  desc: string
  category: GalleryCategory
  photoCount: number
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: '/image/galeri/ziarah.jpeg',
    title: 'Ziarah Wali Songo',
    desc: 'Rombongan santri ziarah ke Masjid Agung & Makam Wali Songo',
    category: 'people',
    photoCount: 22,
  },
  {
    src: '/image/galeri/Rombongan Ziarah Wali Songo1.jpeg',
    title: 'Rombongan Ziarah Wali 9',
    desc: 'Foto bersama rombongan santri putra di depan masjid',
    category: 'mosque',
    photoCount: 22,
  },
  {
    src: '/image/galeri/ngaji.jpeg',
    title: 'Ngaji Hikam',
    desc: 'Rutinan Ahad Legi, lelenggahan sareng Guru',
    category: 'book',
    photoCount: 22,
  },
  {
    src: '/image/galeri/ngaji1.jpeg',
    title: 'Ngaji Bersama Masyayikh Ploso',
    desc: 'Halal Bihalal Alumni, Santri, dan Wali Santri bersama Gus Kautsar & Gus Fahim Ploso',
    category: 'people',
    photoCount: 22,
  },
  {
    src: '/image/galeri/hadroh.jpeg',
    title: 'Hadroh di Pernikahan Alumni',
    desc: 'Kegiatan Sholawatan di Pernikahan Alumni',
    category: 'sparkle',
    photoCount: 22,
  },
  {
    src: '/image/galeri/komplek masjid.jpeg',
    title: 'Ziarah Wali 9 — Santriwati',
    desc: 'Rombongan santriwati di depan kompleks masjid',
    category: 'mosque',
    photoCount: 22,
  },
  {
    src: '/image/galeri/menara kudus.jpeg',
    title: 'Menara Kudus',
    desc: 'Kunjungan rombongan santri di kawasan Menara Kudus',
    category: 'tower',
    photoCount: 22,
  },
  {
    src: '/image/galeri/menara-kudus-putri.jpeg',
    title: 'Menara Kudus — Santriwati',
    desc: 'Foto bersama santriwati di area Menara Kudus',
    category: 'camera',
    photoCount: 22,
  },
  {
    src: '/image/galeri/Sowan ndalem kesepuhan K.H Nurul Huda Dzajuli.jpeg',
    title: 'Sowan ndalem Kesepuhan (Ploso)',
    desc: 'Sowan ndalem Kesepuhan K.H. Nurul Huda Djazuli',
    category: 'camera',
    photoCount: 26,
  },
  {
    src: '/image/galeri/Fastabiqul Khairat.jpeg',
    title: 'Acara Fastabiqul Khairat',
    desc: 'Foto bersama dalam Kegiatan Lomba2 Fastabiqul Khairat',
    category: 'camera',
    photoCount: 22,
  },
  {
    src: '/image/galeri/Harlah PonPes 40 th.jpeg',
    title: 'Acara Harlah Pondok Pesantren',
    desc: 'Foto bersama K.H Anwar Zahid dari Bojonegoro, Jawa Timur',
    category: 'camera',
    photoCount: 22,
  },
]

/* ════════════════════════════════════════════════════════════════
   BANNER CAROUSEL
   Tambahkan objek baru ke array ini untuk banner lain — dots &
   auto-rotate menyesuaikan otomatis dengan jumlah item.
   ════════════════════════════════════════════════════════════════ */
interface BannerItem {
  src: string
  alt: string
}

const BANNER_ITEMS: BannerItem[] = [
  {
    src: '/icons/galeri-banner.jpeg',
    alt: 'Dokumentasi Momen Penuh Makna — Pondok Pesantren Al-Istiqomah',
  },
]

/* Background foto header — foto pondok sendiri (public/image/pondok.jpeg) */
const HEADER_BG_SRC = '/image/pondok.jpeg'

/* ════════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════════ */
function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
function IconImageFallback({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}
function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function IconFilter() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="9" cy="6" r="2" fill="white" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="16" cy="12" r="2" fill="white" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="11" cy="18" r="2" fill="white" />
    </svg>
  )
}
function IconChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
function IconStar() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17l-6.1 3.5 1.5-6.8L2.2 9l6.9-.7L12 2z" />
    </svg>
  )
}
function IconSend() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconMosque() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2.5" />
      <path d="M7 9.5a5 5 0 0 1 10 0V12H7V9.5z" />
      <path d="M3 21v-6.5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3V21" />
      <path d="M10 21v-4.5a2 2 0 0 1 4 0V21" />
      <line x1="2" y1="21" x2="22" y2="21" />
    </svg>
  )
}
function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
function IconSparkle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M11 2l1.7 5.3L18 9l-5.3 1.7L11 16l-1.7-5.3L4 9l5.3-1.7L11 2z" />
      <path d="M19 13l.85 2.4L22.3 16.3l-2.45.85L19 19.6l-.85-2.45L15.7 16.3l2.45-.9L19 13z" />
    </svg>
  )
}
function IconTower() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.2 3.2H9.8L12 2z" />
      <rect x="9" y="5.2" width="6" height="3.8" />
      <path d="M10 9h4v10.5h-4z" />
      <path d="M7.5 22h9" />
      <path d="M8.7 19h6.6" />
    </svg>
  )
}
function IconCamera() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function CategoryIcon({ category }: { category: GalleryCategory }) {
  switch (category) {
    case 'people': return <IconUsers />
    case 'mosque': return <IconMosque />
    case 'book': return <IconBook />
    case 'sparkle': return <IconSparkle />
    case 'tower': return <IconTower />
    case 'camera': return <IconCamera />
    default: return <IconImageFallback size={18} />
  }
}

/* ════════════════════════════════════════════════════════════════
   BANNER — carousel sederhana dengan auto-rotate + dot indicator
   ════════════════════════════════════════════════════════════════ */
function BannerCarousel({ items }: { items: BannerItem[] }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length)
    }, 4500)
    return () => clearInterval(t)
  }, [items.length])

  if (items.length === 0) return null

  return (
    <div className={styles.bannerSection}>
      <div className={styles.bannerCard}>
        <Image
          src={items[active].src}
          alt={items[active].alt}
          fill
          className={styles.bannerImg}
          priority
        />
      </div>
      {items.length > 1 && (
        <div className={styles.bannerDots}>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Banner ${i + 1}`}
              className={i === active ? styles.dotActive : styles.dot}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   KARTU FOTO — dengan badge kategori & fallback jika gambar gagal load
   ════════════════════════════════════════════════════════════════ */
function GalleryCard({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  const [imgError, setImgError] = useState(false)

  return (
    <button type="button" className={styles.galleryCard} onClick={onOpen}>
      <div className={styles.galleryThumbWrap}>
        {imgError ? (
          <div className={styles.galleryThumbFallback}>
            <IconImageFallback />
          </div>
        ) : (
          <Image
            src={item.src}
            alt={item.title}
            fill
            className={styles.galleryThumbImg}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <div className={styles.galleryBadge}>
        <CategoryIcon category={item.category} />
      </div>

      <div className={styles.galleryCardBody}>
        <p className={styles.galleryCardTitle}>{item.title}</p>
        {item.desc && <p className={styles.galleryCardDesc}>{item.desc}</p>}
        <div className={styles.galleryCardFooter}>
          <IconImageFallback size={13} />
          <span className={styles.galleryCardFooterText}>{item.photoCount} Foto</span>
        </div>
      </div>
    </button>
  )
}

/* ════════════════════════════════════════════════════════════════
   LIGHTBOX — preview foto ukuran besar
   ════════════════════════════════════════════════════════════════ */
function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.lightboxCloseBtn} onClick={onClose} aria-label="Tutup">
          <IconClose />
        </button>
        <div className={styles.lightboxImageWrap}>
          {imgError ? (
            <div className={styles.galleryThumbFallback}>
              <IconImageFallback />
            </div>
          ) : (
            <Image
              src={item.src}
              alt={item.title}
              fill
              className={styles.lightboxImg}
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div className={styles.lightboxCaption}>
          <p className={styles.lightboxTitle}>{item.title}</p>
          {item.desc && <p className={styles.lightboxDesc}>{item.desc}</p>}
          <div className={styles.lightboxFooter}>
            <CategoryIcon category={item.category} />
            <span className={styles.lightboxFooterText}>{item.photoCount} Foto dalam album ini</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════════════ */
export default function GaleriClient() {
  const [selected, setSelected] = useState<GalleryItem | null>(null)
  const [query, setQuery] = useState('')
  const gridRef = useRef<HTMLDivElement>(null)

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GALLERY_ITEMS
    return GALLERY_ITEMS.filter(
      (item) => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    )
  }, [query])

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.shell}>
      {/* ══ TOP HEADER ══════════════════════════════════════════ */}
      <header className={styles.topHeader}>
        <Image
          src={HEADER_BG_SRC}
          alt=""
          fill
          className={styles.headerBgImg}
          priority
        />
        <div className={styles.headerOverlay} />

        <div className={styles.headerInner}>
          <div className={styles.headerTopRow}>
            <Link href="/siswa/dashboard" className={styles.backBtn} aria-label="Kembali ke Beranda">
              <IconBack />
            </Link>
          </div>
          <div className={styles.headerTextWrap}>
            <h1 className={styles.headerTitle}>Galeri Kegiatan</h1>
            <p className={styles.headerSub}>Dokumentasi kegiatan Pondok Pesantren Al-Istiqomah</p>
          </div>
        </div>
      </header>

      {/* ══ SEARCH BAR (mengambang di atas header) ═════════════ */}
      <div className={styles.pageBody}>
        <div className={styles.searchBarCard}>
          <div className={styles.searchInputWrap}>
            <IconSearch />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari kegiatan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {/* TODO: hubungkan dengan logika filter kategori bila dibutuhkan */}
          <button type="button" className={styles.filterBtn}>
            <IconFilter />
            Filter
          </button>
        </div>

        {/* ══ BANNER CAROUSEL ═══════════════════════════════════ */}
        <BannerCarousel items={BANNER_ITEMS} />

        {/* ══ SECTION HEADER ════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderLeft}>
            <div className={styles.sectionIconBox}>
              <IconImageFallback size={19} />
            </div>
            <div className={styles.sectionTitleWrap}>
              <p className={styles.sectionTitle}>Galeri Kegiatan</p>
              <p className={styles.sectionSubtitle}>Jelajahi berbagai kegiatan kami</p>
            </div>
          </div>
          <button type="button" className={styles.seeAllLink} onClick={scrollToGrid}>
            Lihat Semua
            <IconChevronRight />
          </button>
        </div>

        {/* ══ GRID GALERI ═══════════════════════════════════════ */}
        <div ref={gridRef}>
          {filteredItems.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🖼️</span>
              <p className={styles.emptyText}>
                {GALLERY_ITEMS.length === 0 ? 'Belum ada foto kegiatan' : 'Kegiatan tidak ditemukan'}
              </p>
              {GALLERY_ITEMS.length > 0 && (
                <p className={styles.emptyHint}>Coba kata kunci pencarian lain</p>
              )}
            </div>
          ) : (
            <div className={styles.galleryGrid}>
              {filteredItems.map((item, i) => (
                <GalleryCard key={`${item.src}-${i}`} item={item} onOpen={() => setSelected(item)} />
              ))}
            </div>
          )}
        </div>

        {/* ══ CTA — KIRIM DOKUMENTASI ═══════════════════════════ */}
        <div className={styles.ctaBanner}>
          <div className={styles.ctaIconBox}>
            <IconStar />
          </div>
          <div className={styles.ctaTextWrap}>
            <p className={styles.ctaTitle}>Punya Dokumentasi Kegiatan?</p>
            <p className={styles.ctaDesc}>Kirimkan dokumentasi kegiatan Anda untuk ditampilkan di galeri.</p>
          </div>
          {/* TODO: arahkan ke link/route pengiriman dokumentasi yang sebenarnya */}
          <a href="#" className={styles.ctaButton}>
            <IconSend />
            Kirim
          </a>
        </div>
      </div>

      {/* ══ LIGHTBOX ════════════════════════════════════════════ */}
      {selected && <Lightbox item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}