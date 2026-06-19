'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './galeri.module.css'

/* ════════════════════════════════════════════════════════════════
   DATA GALERI
   Sesuaikan src dengan nama file asli di public/image/ Anda.
   ════════════════════════════════════════════════════════════════ */
interface GalleryItem {
  src: string
  title: string
  desc: string
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: '/image/galeri/ziarah.jpeg',
    title: 'Ziarah Wali Songo',
    desc: 'Rombongan santri ziarah ke Masjid Agung & Makam Wali Songo',
  },
  {
    src: '/image/galeri/rombongan ziarah wali songo1.jpeg',
    title: 'Rombongan Ziarah Wali 9',
    desc: 'Foto bersama rombongan santri putra di depan masjid',
  },
  {
    src: '/image/galeri/ngaji.jpeg',
    title: 'Ngaji Hikam',
    desc: 'Rutinan Ahad Legi, lelenggahan sareng Guru',
  },
  {
    src: '/image/galeri/ngaji1.jpeg',
    title: 'Ngaji Bersama Masyayikh Ploso',
    desc: 'Halal Bihalal Alumni, Santri, dan Wali Santri bersama Gus Kautsar & Gus Fahim Ploso',
  },
  {
    src: '/image/galeri/hadroh.jpeg',
    title: 'Hadroh di Pernikahan Alumni',
    desc: 'Kegiatan Sholawatan di Pernikan Alumni',
  },
  {
    src: '/image/galeri/komplek masjid.jpeg',
    title: 'Ziarah Wali 9 — Santriwati',
    desc: 'Rombongan santriwati di depan kompleks masjid',
  },
  {
    src: '/image/galeri/menara kudus.jpeg',
    title: 'Menara Kudus',
    desc: 'Kunjungan rombongan santri di kawasan Menara Kudus',
  },
  {
    src: '/image/galeri/menara-kudus-putri.jpeg',
    title: 'Menara Kudus — Santriwati',
    desc: 'Foto bersama santriwati di area Menara Kudus',
  },
]

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
function IconImageFallback() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

/* ════════════════════════════════════════════════════════════════
   KARTU FOTO — dengan fallback jika gambar gagal load
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
      <div className={styles.galleryCardBody}>
        <p className={styles.galleryCardTitle}>{item.title}</p>
        {item.desc && <p className={styles.galleryCardDesc}>{item.desc}</p>}
      </div>
    </button>
  )
}

/* ════════════════════════════════════════════════════════════════
   LIGHTBOX — preview foto ukuran besar
   ════════════════════════════════════════════════════════════════ */
function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const [imgError, setImgError] = useState(false)

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

  return (
    <div className={styles.shell}>
      {/* ══ TOP HEADER ══════════════════════════════════════════ */}
      <header className={styles.topHeader}>
        <Link href="/siswa/dashboard" className={styles.backBtn} aria-label="Kembali ke Beranda">
          <IconBack />
        </Link>
        <div className={styles.headerTextWrap}>
          <h1 className={styles.headerTitle}>Galeri Kegiatan</h1>
          <p className={styles.headerSub}>Dokumentasi kegiatan Pondok Pesantren Al-Istiqomah</p>
        </div>
      </header>

      {/* ══ GRID GALERI ═════════════════════════════════════════ */}
      <div className={styles.pageBody}>
        {GALLERY_ITEMS.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🖼️</span>
            <p className={styles.emptyText}>Belum ada foto kegiatan</p>
          </div>
        ) : (
          <div className={styles.galleryGrid}>
            {GALLERY_ITEMS.map((item, i) => (
              <GalleryCard key={`${item.src}-${i}`} item={item} onOpen={() => setSelected(item)} />
            ))}
          </div>
        )}
      </div>

      {/* ══ LIGHTBOX ════════════════════════════════════════════ */}
      {selected && <Lightbox item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}