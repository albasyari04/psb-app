'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import styles from './peraturan.module.css'

// ── Types ──────────────────────────────────────────────────────────────────────
interface PeraturanItem {
  id: number
  title: string
  items: string[]
}

interface TabItem {
  id: string
  label: string
  icon: string
}

interface CategoryCard {
  id: string
  num: string
  title: string
  sub: string
  img: string
  numBg: string
  cardBg: string
}

// ── Data ───────────────────────────────────────────────────────────────────────
const TABS: TabItem[] = [
  { id: 'umum',      label: 'Umum',      icon: '📋' },
  { id: 'ibadah',   label: 'Ibadah',    icon: '🕌' },
  { id: 'akademik', label: 'Akademik',  icon: '📚' },
  { id: 'asrama',   label: 'Asrama',    icon: '🏠' },
]

// Kategori card: ditampilkan di view "umum" sebagai overview grid
const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'tata-tertib',
    num: '01',
    title: 'Tata Tertib Umum',
    sub: 'Aturan dasar yang wajib dipatuhi seluruh santri.',
    img: '/image/peraturan umum.png',
    numBg: '#2563eb',
    cardBg: 'linear-gradient(160deg, #f0f7ff 0%, #dbeafe 100%)',
  },
  {
    id: 'pakaian',
    num: '02',
    title: 'Pakaian & Penampilan',
    sub: 'Ketentuan berpakaian dan penampilan santri.',
    img: '/image/pakaian dan penampilan.png',
    numBg: '#059669',
    cardBg: 'linear-gradient(160deg, #f0fdf8 0%, #d1fae5 100%)',
  },
  {
    id: 'hp',
    num: '03',
    title: 'Penggunaan HP & Teknologi',
    sub: 'Aturan penggunaan perangkat elektronik dan akses internet.',
    img: '/image/penggunaan hp dan teknologi.png',
    numBg: '#d97706',
    cardBg: 'linear-gradient(160deg, #fffdf0 0%, #fef3c7 100%)',
  },
  {
    id: 'sanksi',
    num: '04',
    title: 'Sanksi Pelanggaran',
    sub: 'Tingkat pelanggaran dan sanksi yang berlaku.',
    img: '/image/sanksi pelanggaraan.png',
    numBg: '#7c3aed',
    cardBg: 'linear-gradient(160deg, #faf5ff 0%, #ede9fe 100%)',
  },
]

const PERATURAN: Record<string, PeraturanItem[]> = {
  umum: [
    {
      id: 1,
      title: 'Tata Tertib Umum',
      items: [
        'Santri wajib menjaga nama baik pondok pesantren di dalam maupun di luar lingkungan pesantren.',
        'Santri wajib bersikap sopan dan hormat kepada seluruh ustadz, ustadzah, pengurus, dan sesama santri.',
        'Santri dilarang membawa, menyimpan, dan menggunakan rokok, minuman keras, dan narkoba dalam bentuk apapun.',
        'Santri dilarang membawa senjata tajam atau benda berbahaya lainnya ke dalam lingkungan pesantren.',
        'Santri wajib menjaga kebersihan, ketertiban, dan keindahan lingkungan pesantren.',
        'Santri wajib mengikuti seluruh kegiatan yang telah dijadwalkan oleh pesantren.',
      ],
    },
    {
      id: 2,
      title: 'Pakaian & Penampilan',
      items: [
        'Santri putra wajib menggunakan pakaian yang menutup aurat: sarung/celana panjang, kemeja/kaos berkerah.',
        'Santri putri wajib menggunakan pakaian yang menutup aurat sesuai syariat Islam.',
        'Santri wajib menggunakan seragam pesantren saat kegiatan belajar mengajar.',
        'Santri dilarang menggunakan pakaian ketat, transparan, atau bergambar tidak islami.',
        'Santri putra dilarang memanjangkan rambut melebihi batas yang ditentukan.',
        'Santri dilarang menggunakan aksesoris yang berlebihan.',
      ],
    },
    {
      id: 3,
      title: 'Penggunaan HP & Teknologi',
      items: [
        'Penggunaan handphone diizinkan pada waktu yang telah ditentukan (15.00–17.00 WIB dan 20.00–21.00 WIB).',
        'Santri dilarang mengakses konten yang tidak sesuai dengan nilai-nilai Islam.',
        'Santri wajib menyerahkan HP kepada pengurus saat kegiatan belajar dan ibadah.',
        'Santri dilarang menggunakan media sosial untuk menyebarkan konten negatif terkait pesantren.',
        'Pelanggaran penggunaan HP akan dikenakan sanksi penyitaan sementara.',
      ],
    },
  ],
  ibadah: [
    {
      id: 1,
      title: 'Sholat Berjamaah',
      items: [
        'Santri wajib melaksanakan sholat lima waktu berjamaah di masjid pesantren.',
        'Santri wajib hadir di masjid sebelum iqomah dikumandangkan.',
        'Santri yang terlambat jamaah tanpa uzur akan dikenakan sanksi berupa hafalan atau tugas.',
        'Santri wajib memakai pakaian yang bersih dan rapi saat sholat berjamaah.',
        'Santri dilarang tidur atau berbicara saat adzan dan iqomah berkumandang.',
      ],
    },
    {
      id: 2,
      title: 'Kegiatan Keagamaan',
      items: [
        'Santri wajib mengikuti pengajian kitab kuning sesuai jadwal yang telah ditetapkan.',
        'Santri wajib mengikuti tahfidzul Quran minimal 1 juz per semester.',
        'Santri wajib menghadiri ceramah agama mingguan setiap Jum\'at malam.',
        'Santri wajib melaksanakan puasa sunnah Senin-Kamis (minimal 2x sebulan).',
        'Santri wajib aktif dalam kegiatan muhadharah (latihan pidato) bulanan.',
      ],
    },
    {
      id: 3,
      title: 'Adab & Akhlak',
      items: [
        'Santri wajib mengucapkan salam saat bertemu sesama santri dan ustadz/ustadzah.',
        'Santri wajib menjaga lisan dari ghibah, fitnah, dan perkataan yang tidak bermanfaat.',
        'Santri wajib menghormati dan mematuhi perintah ustadz/ustadzah selama tidak bertentangan dengan syariat.',
        'Santri wajib menjaga ukhuwah islamiyah dan menghindari perselisihan.',
        'Santri dilarang melakukan perundungan (bullying) dalam bentuk apapun.',
      ],
    },
  ],
  akademik: [
    {
      id: 1,
      title: 'Kehadiran & Disiplin Belajar',
      items: [
        'Santri wajib hadir dalam semua kegiatan belajar mengajar yang dijadwalkan.',
        'Ketidakhadiran harus disertai surat izin dari orang tua/wali yang sah.',
        'Santri yang tidak hadir lebih dari 3x tanpa keterangan dapat dikenakan sanksi.',
        'Santri wajib hadir tepat waktu; keterlambatan lebih dari 10 menit dianggap tidak hadir.',
        'Santri wajib membawa peralatan belajar yang lengkap setiap hari.',
      ],
    },
    {
      id: 2,
      title: 'Ujian & Evaluasi',
      items: [
        'Santri wajib mengikuti seluruh ujian yang diadakan oleh pesantren.',
        'Santri dilarang berbuat curang dalam bentuk apapun selama ujian berlangsung.',
        'Santri yang tidak mengikuti ujian tanpa izin dianggap tidak lulus pada mata pelajaran tersebut.',
        'Nilai minimal kelulusan adalah 70 untuk semua mata pelajaran.',
        'Santri yang tidak memenuhi KKM wajib mengikuti remedial.',
      ],
    },
    {
      id: 3,
      title: 'Tugas & Kewajiban Akademik',
      items: [
        'Santri wajib menyelesaikan seluruh tugas yang diberikan tepat waktu.',
        'Plagiarisme dalam tugas apapun akan dikenakan sanksi tegas.',
        'Santri wajib aktif berpartisipasi dalam diskusi dan kegiatan kelas.',
        'Santri wajib menjaga buku dan peralatan belajar milik pesantren dengan baik.',
        'Kerusakan fasilitas belajar yang disengaja wajib diganti oleh santri yang bersangkutan.',
      ],
    },
  ],
  asrama: [
    {
      id: 1,
      title: 'Jadwal Harian Asrama',
      items: [
        'Bangun pagi: 04.00 WIB (untuk persiapan sholat Subuh berjamaah).',
        'Belajar mandiri malam: 20.00–21.30 WIB (wajib di ruang belajar).',
        'Lampu asrama dipadamkan pukul 22.00 WIB.',
        'Santri dilarang keluar asrama setelah pukul 22.00 WIB tanpa izin pengurus.',
        'Waktu istirahat siang: 13.00–14.30 WIB (santri dianjurkan beristirahat).',
      ],
    },
    {
      id: 2,
      title: 'Kebersihan & Kerapian',
      items: [
        'Santri wajib merapikan tempat tidur dan kamar setiap hari sebelum berangkat belajar.',
        'Santri wajib melaksanakan piket kebersihan sesuai jadwal yang telah ditetapkan.',
        'Santri dilarang membuang sampah sembarangan di lingkungan pesantren.',
        'Pakaian kotor wajib disimpan di tempat yang telah disediakan.',
        'Kamar mandi dan toilet wajib dijaga kebersihannya setiap selesai digunakan.',
      ],
    },
    {
      id: 3,
      title: 'Izin & Kepulangan',
      items: [
        'Santri hanya diperbolehkan pulang pada hari yang telah ditentukan (liburan resmi pesantren).',
        'Izin pulang di luar jadwal harus mendapat persetujuan tertulis dari kepala pengasuhan.',
        'Orang tua/wali yang menjemput wajib melapor ke kantor pengasuhan.',
        'Santri wajib kembali ke pesantren tepat waktu sesuai jadwal yang telah ditetapkan.',
        'Keterlambatan kembali tanpa izin akan dikenakan sanksi yang berlaku.',
      ],
    },
  ],
}

const SANKSI = [
  {
    level: 'RINGAN',
    color: '#d97706',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef9ec 100%)',
    border: '#fde68a',
    iconBg: '#fef3c7',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    desc: 'Teguran lisan, hafalan doa/surat pendek, tugas kebersihan.',
  },
  {
    level: 'SEDANG',
    color: '#ef4444',
    bg: 'linear-gradient(135deg, #fff1f2 0%, #fef2f2 100%)',
    border: '#fecdd3',
    iconBg: '#fee2e2',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    desc: 'Surat peringatan tertulis, panggilan orang tua, skorsing kegiatan.',
  },
  {
    level: 'BERAT',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)',
    border: '#ddd6fe',
    iconBg: '#ede9fe',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    desc: 'Panggilan orang tua, skorsing, hingga pengembalian ke orang tua.',
  },
]

// ── Component ──────────────────────────────────────────────────────────────────
export default function PeraturanPage() {
  const [activeTab, setActiveTab] = useState<string>('umum')
  const [expandedSection, setExpandedSection] = useState<number | null>(null)

  const currentPeraturan = PERATURAN[activeTab] ?? []

  function toggleSection(id: number) {
    setExpandedSection(prev => prev === id ? null : id)
  }

  // Tab icon map for image icons
  const TAB_ICONS: Record<string, string> = {
    umum:     '/image/peraturan_umum.png',
    ibadah:   '/image/peraturan_umum.png',
    akademik: '/image/peraturan_umum.png',
    asrama:   '/image/peraturan_umum.png',
  }

  return (
    <div className={styles.shell}>

      {/* ══ HERO HEADER ══════════════════════════════════════════════════════ */}
      <div className={styles.hero}>
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />
        <div className={styles.heroOrb3} />

        {/* Star sparkles */}
        <div className={styles.starField}>
          {[...Array(6)].map((_, i) => (
            <span key={i} className={`${styles.star} ${styles[`star${i + 1}`]}`} />
          ))}
        </div>

        {/* Top bar */}
        <div className={styles.heroTopBar}>
          <Link href="/siswa" className={styles.backBtn} aria-label="Kembali">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <div className={styles.heroTitleGroup}>
            <h1 className={styles.heroTitle}>Peraturan Pondok</h1>
            <p className={styles.heroSub}>Pon-Pes Al Istiqomah</p>
          </div>
          <div className={styles.heroBadge}>
            <span>📜</span>
          </div>
        </div>

        {/* Description card */}
        <div className={styles.heroDescCard}>
          <p className={styles.heroDescText}>
            Setiap santri wajib membaca, memahami, dan mentaati seluruh peraturan yang berlaku demi terciptanya lingkungan pesantren yang kondusif dan berkah.
          </p>
        </div>

        {/* Masjid illustration */}
        <div className={styles.heroMasjidWrap}>
          <Image
            src="/image/bangunan.jpg"
            alt="Masjid Al Istiqomah"
            width={160}
            height={160}
            className={styles.heroMasjidImg}
            priority
          />
        </div>
      </div>

      {/* ══ TABS ═════════════════════════════════════════════════════════════ */}
      <div className={styles.tabsWrap}>
        <div className={styles.tabsScroll}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
              onClick={() => { setActiveTab(tab.id); setExpandedSection(null) }}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ═══════════════════════════════════════════════════════════ */}
      <div className={styles.content}>

        {/* ── Kategori Grid (hanya di tab Umum) ── */}
        {activeTab === 'umum' && (
          <>
            <div className={styles.sectionLabel}>
              <p className={styles.sectionLabelTitle}>Kategori Peraturan</p>
              <p className={styles.sectionLabelSub}>Pilih kategori untuk melihat daftar peraturan</p>
            </div>

            <div className={styles.categoryGrid}>
              {CATEGORY_CARDS.map((cat) => (
                <div
                  key={cat.id}
                  className={styles.categoryCard}
                  style={{ background: cat.cardBg }}
                >
                  <div className={styles.categoryNumRow}>
                    <span
                      className={styles.categoryNum}
                      style={{ background: cat.numBg }}
                    >
                      {cat.num}
                    </span>
                  </div>
                  <p className={styles.categoryTitle}>{cat.title}</p>
                  <p className={styles.categorySub}>{cat.sub}</p>
                  <div className={styles.categoryImgWrap}>
                    <Image
                      src={cat.img}
                      alt={cat.title}
                      width={120}
                      height={100}
                      className={styles.categoryImg}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className={styles.sectionDivider}>
              <span className={styles.sectionDividerText}>Detail Peraturan</span>
            </div>
          </>
        )}

        {/* ── Peraturan Accordion Cards ── */}
        {currentPeraturan.map((section, sIdx) => {
          const isExpanded = expandedSection === section.id
          // Tentukan warna berdasarkan index
          const colors = [
            { num: '#2563eb', light: '#eff6ff', border: '#bfdbfe', bullet: 'linear-gradient(135deg, #2563eb, #4f46e5)' },
            { num: '#059669', light: '#ecfdf5', border: '#a7f3d0', bullet: 'linear-gradient(135deg, #059669, #10b981)' },
            { num: '#d97706', light: '#fffbeb', border: '#fde68a', bullet: 'linear-gradient(135deg, #d97706, #f59e0b)' },
          ]
          const c = colors[sIdx % colors.length]

          return (
            <div key={section.id} className={styles.accordionCard}>
              {/* Card Header */}
              <button
                className={styles.accordionHeader}
                onClick={() => toggleSection(section.id)}
                aria-expanded={isExpanded}
              >
                <div className={styles.accordionHeaderLeft}>
                  <div
                    className={styles.accordionNum}
                    style={{ background: c.light, border: `1.5px solid ${c.border}`, color: c.num }}
                  >
                    {String(sIdx + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <p className={styles.accordionTitle}>{section.title}</p>
                    <p className={styles.accordionMeta}>{section.items.length} peraturan</p>
                  </div>
                </div>
                <div
                  className={`${styles.accordionChevron} ${isExpanded ? styles.accordionChevronOpen : ''}`}
                  style={{ color: c.num }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </button>

              {/* Preview (selalu tampil, 2 item pertama) */}
              {!isExpanded && (
                <div className={styles.accordionPreview}>
                  {section.items.slice(0, 2).map((item, iIdx) => (
                    <div key={iIdx} className={styles.ruleItemCompact}>
                      <div
                        className={styles.ruleBullet}
                        style={{ background: c.bullet }}
                      >
                        {iIdx + 1}
                      </div>
                      <p className={styles.ruleTextCompact}>{item}</p>
                    </div>
                  ))}
                  {section.items.length > 2 && (
                    <p className={styles.accordionMore} style={{ color: c.num }}>
                      + {section.items.length - 2} peraturan lainnya...
                    </p>
                  )}
                </div>
              )}

              {/* Full expanded content */}
              {isExpanded && (
                <div className={styles.ruleList}>
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className={styles.ruleItem}>
                      <div
                        className={styles.ruleBullet}
                        style={{ background: c.bullet }}
                      >
                        {iIdx + 1}
                      </div>
                      <p className={styles.ruleText}>{item}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* ── Sanksi Card ── */}
        <div className={styles.sanksiWrap}>
          <div className={styles.sanksiHeader}>
            <div className={styles.sanksiHeaderIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="16 12 12 8 8 12"/>
                <line x1="12" y1="16" x2="12" y2="8"/>
              </svg>
            </div>
            <div>
              <h2 className={styles.sanksiTitle}>Tingkatan Sanksi</h2>
              <p className={styles.sanksiSub}>Pelanggaran akan ditindak sesuai tingkat pelanggaran</p>
            </div>
          </div>
          <div className={styles.sanksiList}>
            {SANKSI.map((s) => (
              <div
                key={s.level}
                className={styles.sanksiCard}
                style={{ background: s.bg, borderColor: s.border }}
              >
                <div
                  className={styles.sanksiIconWrap}
                  style={{ background: s.iconBg }}
                >
                  {s.icon}
                </div>
                <div className={styles.sanksiBody}>
                  <p className={styles.sanksiLevel} style={{ color: s.color }}>{s.level}</p>
                  <p className={styles.sanksiDesc}>{s.desc}</p>
                </div>
                <div className={styles.sanksiArrow} style={{ color: s.color }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer Banner ── */}
        <div className={styles.footerBanner}>
          <div className={styles.footerBannerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className={styles.footerBannerText}>
            <p className={styles.footerBannerTitle}>Disiplin adalah kunci keberkahan</p>
            <p className={styles.footerBannerSub}>Mari kita bersama-sama menjaga aturan untuk kebaikan diri sendiri dan lingkungan pesantren.</p>
          </div>
          <div className={styles.footerBannerChevron}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        {/* Footer note */}
        <div className={styles.footerNote}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Peraturan ini berlaku sejak tanggal penerimaan santri dan dapat diperbarui sewaktu-waktu. Ketidaktahuan tidak dapat dijadikan alasan pelanggaran.</p>
        </div>

      </div>

      {/* ══ BOTTOM NAV ═══════════════════════════════════════════════════════ */}
      <nav className={styles.bottomNav}>
        <Link href="/siswa" className={styles.navItem}>
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
        <Link href="/siswa/pembayaran" className={styles.navItem}>
          <div className={styles.navIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <span>Bayar</span>
        </Link>
        <Link href="/siswa/status" className={styles.navItem}>
          <div className={styles.navIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
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

    </div>
  )
}