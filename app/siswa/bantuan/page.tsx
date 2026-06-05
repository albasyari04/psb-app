'use client'

import Image from 'next/image'
import Link  from 'next/link'
import { useState } from 'react'
import styles from './bantuan.module.css'

// ── Types ──────────────────────────────────────────────────────────────────────
interface FaqItem { q: string; a: string }

// ── Data ───────────────────────────────────────────────────────────────────────
const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Bagaimana cara mendaftar sebagai santri baru?',
    a: 'Klik menu "Formulir" pada dashboard, isi data diri lengkap, lalu klik tombol Simpan. Pastikan semua field wajib sudah terisi dengan benar sebelum menyimpan.',
  },
  {
    q: 'Dokumen apa saja yang perlu di-upload?',
    a: 'Dokumen yang diperlukan: Foto 3×4 terbaru, Akta Kelahiran, Kartu Keluarga, Ijazah/Rapor terakhir, dan Surat Keterangan Sehat dari dokter.',
  },
  {
    q: 'Bagaimana cara melakukan pembayaran biaya pendaftaran?',
    a: 'Buka menu "Bayar" pada dashboard, pilih metode pembayaran (Transfer Bank / QRIS), lalu upload bukti pembayaran. Verifikasi dilakukan dalam 1×24 jam.',
  },
  {
    q: 'Kapan pengumuman hasil seleksi diumumkan?',
    a: 'Pengumuman hasil seleksi akan diumumkan pada 15 Maret 2026 melalui menu "Pengumuman" dan dikirim ke email yang terdaftar.',
  },
  {
    q: 'Apa yang harus dilakukan jika lupa password?',
    a: 'Klik "Lupa Password" pada halaman login, masukkan email yang terdaftar, lalu ikuti instruksi reset password yang dikirim ke email Anda.',
  },
  {
    q: 'Bagaimana cara mengecek status pendaftaran?',
    a: 'Buka menu "Status" pada dashboard untuk melihat progres pendaftaran secara real-time, mulai dari Menunggu Review, Diproses, hingga hasil akhir.',
  },
]

const GUIDE_ITEMS = [
  {
    label: 'Cara Mendaftar',
    icon: '/image/icon formulir.jpg',
    href: '/siswa/pendaftaran',
    iconBg: '#EFF6FF',
  },
  {
    label: 'Upload Berkas',
    icon: '/image/icon berkas.jpg',
    href: '/siswa/berkas',
    iconBg: '#FFFBEB',
  },
  {
    label: 'Cara Bayar',
    icon: '/image/icon pembayaran.avif',
    href: '/siswa/pembayaran',
    iconBg: '#F0FDF4',
  },
  {
    label: 'Cek Status',
    icon: '/image/icon status.webp',
    href: '/siswa/status',
    iconBg: '#FFF7ED',
  },
]

// ── FaqCard ────────────────────────────────────────────────────────────────────
function FaqCard({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`${styles.faqCard} ${open ? styles.faqOpen : ''}`}>
      <button
        className={styles.faqBtn}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className={styles.faqQ}>{item.q}</span>
        <span className={`${styles.faqChevron} ${open ? styles.faqChevronOpen : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>
      <div className={`${styles.faqBody} ${open ? styles.faqBodyOpen : ''}`}>
        <p className={styles.faqA}>{item.a}</p>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function BantuanPage() {
  return (
    <div className={styles.shell}>

      {/* ══ TOP BAR ═══════════════════════════════════════════════════════════ */}
      <header className={styles.topBar}>
        <Link href="/siswa" className={styles.topBack} aria-label="Kembali">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <h1 className={styles.topTitle}>Pusat Bantuan</h1>
        <div className={styles.topSearch}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      </header>

      {/* ══ SCROLL BODY ═══════════════════════════════════════════════════════ */}
      <main className={styles.main}>

        {/* ── Hero Card "Butuh Bantuan?" ── */}
        <div className={styles.heroCard}>
          {/* Left text */}
          <div className={styles.heroLeft}>
            <h2 className={styles.heroTitle}>Butuh Bantuan?</h2>
            <p className={styles.heroSub}>
              Temukan jawaban cepat atau hubungi tim support kami.
            </p>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroBtn}
            >
              Hubungi Kami
            </a>
          </div>
          {/* Right illustration — headset image */}
          <div className={styles.heroRight}>
            <div className={styles.heroImgBubble}>
              <Image
                src="/image/bantuan.jpg"
                alt="Support"
                width={100}
                height={100}
                className={styles.heroImg}
              />
            </div>
          </div>
        </div>

        {/* ── Panduan Cepat ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Panduan Cepat</h2>
          <div className={styles.guideGrid}>
            {GUIDE_ITEMS.map((g) => (
              <Link key={g.label} href={g.href} className={styles.guideCard}>
                <div className={styles.guideIconWrap} style={{ background: g.iconBg }}>
                  <Image
                    src={g.icon}
                    alt={g.label}
                    width={36}
                    height={36}
                    className={styles.guideIcon}
                  />
                </div>
                <span className={styles.guideLabel}>{g.label}</span>
                <span className={styles.guideArrow}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Hubungi Kami (3 kartu kontak) ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hubungi Kami</h2>
          <div className={styles.contactRow}>

            {/* Telepon */}
            <a href="tel:+6281234567890" className={styles.contactCard}>
              <div className={styles.contactIconWrap} style={{ background: '#FEF2F2' }}>
                <Image src="/image/telepon.png" alt="Telepon" width={28} height={28} className={styles.contactIconImg} />
              </div>
              <p className={styles.contactLabel}>Telepon</p>
              <p className={styles.contactVal}>+62 812-3456-7890</p>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
              <div className={styles.contactIconWrap} style={{ background: '#F0FDF4' }}>
                <Image src="/image/icon wa.webp" alt="WhatsApp" width={28} height={28} className={styles.contactIconImg} />
              </div>
              <p className={styles.contactLabel}>WhatsApp</p>
              <p className={styles.contactVal}>Chat Sekarang</p>
            </a>

            {/* Email */}
            <a href="mailto:psb@aliistiqomah.ac.id" className={styles.contactCard}>
              <div className={styles.contactIconWrap} style={{ background: '#EFF6FF' }}>
                <Image src="/image/email.png" alt="Email" width={28} height={28} className={styles.contactIconImg} />
              </div>
              <p className={styles.contactLabel}>Email</p>
              <p className={styles.contactVal}>psb@aliistiqomah</p>
            </a>

          </div>
        </section>

        {/* ── Jam Layanan ── */}
        <div className={styles.jamCard}>
          <div className={styles.jamIconWrap}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className={styles.jamBody}>
            <p className={styles.jamTitle}>Jam Layanan</p>
            <p className={styles.jamRow}>
              <span>Senin – Jumat</span>
              <span className={styles.jamTime}>08.00 – 16.00 WIB</span>
            </p>
            <p className={styles.jamRow}>
              <span>Sabtu</span>
              <span className={styles.jamTime}>08.00 – 12.00 WIB</span>
            </p>
          </div>
          <div className={styles.jamOnline}>
            <span className={styles.jamDot} />
            Online
          </div>
        </div>

        {/* ── FAQ ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pertanyaan Lainnya</h2>
          <div className={styles.faqList}>
            {FAQ_ITEMS.map((item, i) => (
              <FaqCard key={i} item={item} />
            ))}
          </div>
        </section>

      </main>

      {/* ══ BOTTOM NAV ════════════════════════════════════════════════════════ */}
      <nav className={styles.bottomNav}>
        <Link href="/siswa" className={`${styles.navItem} ${styles.navActive}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>Beranda</span>
        </Link>
        <Link href="/siswa/pendaftaran" className={styles.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span>Daftar</span>
        </Link>
        <Link href="/siswa/pembayaran" className={styles.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span>Bayar</span>
        </Link>
        <Link href="/siswa/status" className={styles.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>Status</span>
        </Link>
        <Link href="/siswa/profile" className={styles.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Profil</span>
        </Link>
      </nav>

    </div>
  )
}