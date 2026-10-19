'use client'
// app/siswa/peraturan/page.tsx

import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import { useSettings } from '@/contexts/SettingsContext'

// ════════════════════════════════════════════════════════════════════════
// KONSTANTA — ganti di sini bila nama file icon berbeda
// ════════════════════════════════════════════════════════════════════════
const PERATURAN_ICON = '/icons/peraturan-icon-santri.png'
const HEADER_HEIGHT = 84
const NAV_HEIGHT = 68

// ════════════════════════════════════════════════════════════════════════
// Icon set — SVG line-style (gaya sama dengan halaman Pendaftaran)
// ════════════════════════════════════════════════════════════════════════
type IconProps = { size?: number; color?: string; strokeWidth?: number }

const Svg = ({
  size, color, strokeWidth, children,
}: Required<IconProps> & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

// Ikon panah kembali — IDENTIK dengan halaman Pendaftaran / Jadwal / Laporan / Pengumuman
const IconArrowLeft = ({ size = 18, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </Svg>
)

const IconChevronRight = ({ size = 14, color = 'currentColor', strokeWidth = 2.3 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
)

const IconChevronDown = ({ size = 14, color = 'currentColor', strokeWidth = 2.4 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)

const IconAlertTriangle = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M12 3.5 21.5 20H2.5L12 3.5Z" />
    <path d="M12 10v4" />
    <path d="M12 17.2h.01" />
  </Svg>
)

const IconInfo = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 7.8h.01" />
  </Svg>
)

// Ikon palu (cadangan bila PNG gagal dimuat)
const IconGavel = ({ size = 22, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="m14 13-8.4 8.4a1.4 1.4 0 0 1-2-2L12 11" />
    <path d="m13.5 4.5 6 6" />
    <path d="m9.5 8.5 6 6" />
    <rect x="9.6" y="2.4" width="7" height="5" rx="1" transform="rotate(45 13.1 4.9)" />
    <rect x="14.6" y="7.4" width="7" height="5" rx="1" transform="rotate(45 18.1 9.9)" />
  </Svg>
)

// ════════════════════════════════════════════════════════════════════════
// Theme (identik dengan halaman Pendaftaran & lainnya)
// ════════════════════════════════════════════════════════════════════════
function getTheme(isDark: boolean) {
  return {
    bg:          isDark ? '#0E1512' : '#F5F8F6',
    surface:     isDark ? '#15201B' : '#FFFFFF',
    surfaceAlt:  isDark ? '#101A16' : '#F6F9F7',
    border:      isDark ? '#22332B' : '#E7EEE9',
    borderInput: isDark ? '#2A3D34' : '#DCE6DF',
    divider:     isDark ? '#22332B' : '#EAF0EC',
    text:        isDark ? '#EEF5F1' : '#14231C',
    label:       isDark ? '#CFE0D6' : '#1B2E25',
    muted:       isDark ? '#8FA89B' : '#6B7F74',
    faint:       isDark ? '#5E7569' : '#A3B3AA',
    primary:     '#0F6B4A',
    primaryDark: '#0A4F37',
    primaryText: isDark ? '#4ADE98' : '#0F6B4A',
    primarySoft: isDark ? '#16302A' : '#E8F4EE',
    accent:      '#F2B705',
    pendingBg:   isDark ? '#22332B' : '#EDF2EF',
    line:        isDark ? '#22332B' : '#DCE6DF',
    gradient:    'linear-gradient(135deg, #0F6B4A 0%, #0A4F37 100%)',
    shadowBtn:   '0 8px 20px rgba(15,107,74,.26)',
  }
}

function useUi() {
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'
  return {
    isDark,
    isEn,
    t: getTheme(isDark),
    tr: (id: string, en: string) => (isEn ? en : id),
  }
}

function getCardStyle(isDark: boolean): React.CSSProperties {
  const t = getTheme(isDark)
  return {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 22,
    boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,60,40,.04), 0 10px 28px rgba(15,60,40,.06)',
  }
}

// Teks rata kanan-kiri
const JUSTIFY: React.CSSProperties = {
  textAlign: 'justify',
  textJustify: 'inter-word',
  hyphens: 'auto',
  WebkitHyphens: 'auto',
  wordBreak: 'break-word',
}

// ════════════════════════════════════════════════════════════════════════
// Tone per kategori & sanksi
// ════════════════════════════════════════════════════════════════════════
interface ToneDef {
  fg: string; fgDark: string
  soft: string; softDark: string
  line: string; lineDark: string
  grad: string; glow: string
}

const TONES: Record<string, ToneDef> = {
  'tata-tertib': {
    fg: '#0A4F37', fgDark: '#4ADE98', soft: '#E8F4EE', softDark: '#16302A',
    line: '#BFE0CE', lineDark: '#22443A',
    grad: 'linear-gradient(135deg, #0F6B4A 0%, #0A4F37 100%)', glow: 'rgba(15,107,74,.26)',
  },
  'kewajiban': {
    fg: '#0E6E83', fgDark: '#5CC8DB', soft: '#E3F4F8', softDark: '#12303A',
    line: '#B5DEE8', lineDark: '#1F4654',
    grad: 'linear-gradient(135deg, #0E8FA8 0%, #0B6F83 100%)', glow: 'rgba(14,143,168,.26)',
  },
  'larangan': {
    fg: '#B42318', fgDark: '#fca5a5', soft: '#FEECEC', softDark: '#2e1a1a',
    line: '#F5A9A9', lineDark: '#4a1a1a',
    grad: 'linear-gradient(135deg, #E5484D 0%, #B42318 100%)', glow: 'rgba(220,38,38,.26)',
  },
  'sanksi': {
    fg: '#5B3FC4', fgDark: '#B7A6FF', soft: '#EFEBFD', softDark: '#231F3D',
    line: '#D4C9F7', lineDark: '#373064',
    grad: 'linear-gradient(135deg, #7C5CE0 0%, #5B3FC4 100%)', glow: 'rgba(124,92,224,.26)',
  },
  'lain': {
    fg: '#8A6200', fgDark: '#fbbf24', soft: '#FFF6D6', softDark: '#2e2a1a',
    line: '#F2D77A', lineDark: '#4a3a1a',
    grad: 'linear-gradient(135deg, #F2B705 0%, #D99A00 100%)', glow: 'rgba(242,183,5,.30)',
  },
  'wali-santri': {
    fg: '#2456B8', fgDark: '#93B4F5', soft: '#E8EFFD', softDark: '#18233D',
    line: '#BFD1F5', lineDark: '#27375F',
    grad: 'linear-gradient(135deg, #3B74E0 0%, #2456B8 100%)', glow: 'rgba(59,116,224,.26)',
  },
}

function toneOf(id: string, isDark: boolean) {
  const m = TONES[id] ?? TONES['tata-tertib']
  return {
    fg: isDark ? m.fgDark : m.fg,
    soft: isDark ? m.softDark : m.soft,
    line: isDark ? m.lineDark : m.line,
    grad: m.grad,
    glow: m.glow,
  }
}

function sanksiTone(key: 'ringan' | 'sedang' | 'berat', isDark: boolean) {
  const map = {
    ringan: {
      fg: isDark ? '#fbbf24' : '#8A6200', soft: isDark ? '#2e2a1a' : '#FFF6D6',
      line: isDark ? '#4a3a1a' : '#F2D77A', bar: '#F2B705',
    },
    sedang: {
      fg: isDark ? '#fdba74' : '#C2410C', soft: isDark ? '#3a2412' : '#FFEDD5',
      line: isDark ? '#5a3716' : '#FDC99B', bar: '#F97316',
    },
    berat: {
      fg: isDark ? '#fca5a5' : '#B42318', soft: isDark ? '#2e1a1a' : '#FEECEC',
      line: isDark ? '#4a1a1a' : '#F5A9A9', bar: '#EF4444',
    },
  }
  return map[key]
}

// ════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════
interface PasalItem {
  pasal: number
  title: string
  items: string[]
}

interface CategoryDef {
  id: string
  title: string
  desc: string
  bab: string
  babTitle: string
  pasalCount: number
  pasal: PasalItem[]
}

interface SanksiLevel {
  key: 'ringan' | 'sedang' | 'berat'
  level: { id: string; en: string }
  pill: { id: string; en: string }
  barWidth: string
  pasalRef: string
  hukuman: string[]
}

// ════════════════════════════════════════════════════════════════════════
// Data peraturan
// ════════════════════════════════════════════════════════════════════════
const CATEGORIES: CategoryDef[] = [
  {
    id: 'tata-tertib',
    title: 'Tata Tertib Umum',
    desc: 'Aturan dasar dan umum yang wajib diikuti seluruh santri.',
    bab: 'BAB I',
    babTitle: 'Ketentuan Umum',
    pasalCount: 2,
    pasal: [
      {
        pasal: 1,
        title: 'Komponen',
        items: [
          'Pondok Pesantren Al-Istiqomah adalah lembaga yang berada di bawah naungan Yayasan Pon Pes Al-Istiqomah.',
          'Pelindung/Pengasuh adalah dzuriah yang bertanggung jawab atas Pondok Pesantren Al-Istiqomah Sumber Harjo.',
          'Penasehat adalah dzuriah dan alumni yang masih aktif memberikan bimbingan dan masukan terhadap Pondok Pesantren Al-Istiqomah.',
          'Pengurus adalah badan pelaksana yang struktural dan personalianya telah diatur serta ditunjuk oleh Dewan Formatur Pondok Pesantren Al-Istiqomah Sumber Harjo Buay Madang Timur dengan persetujuan Pengasuh.',
          'Santri adalah siapa saja yang berdomisili dan terdaftar di Yayasan Pon Pes Al-Istiqomah Sumber Harjo Buay Madang Timur.',
        ],
      },
      {
        pasal: 2,
        title: 'Aturan',
        items: [
          'Ketentuan yang ada berlaku bagi semua santri Pondok Pesantren Al-Istiqomah Sumber Harjo Buay Madang Timur.',
        ],
      },
    ],
  },
  {
    id: 'kewajiban',
    title: 'Kewajiban & Ketentuan',
    desc: 'Kewajiban santri dalam menjalankan kegiatan di pondok.',
    bab: 'BAB II',
    babTitle: 'Kewajiban Santri',
    pasalCount: 5,
    pasal: [
      {
        pasal: 3,
        title: 'Administrasi',
        items: [
          'Mendaftarkan diri di Kantor Pondok Pesantren Al-Istiqomah Sumber Harjo Buay Madang Timur.',
          'Membayar administrasi yang telah ditentukan Pondok Pesantren Al-Istiqomah.',
          'Melunasi iuran yang telah ditentukan, selambat-lambatnya 40 hari setelah menetap di pondok (santri baru).',
          'Memiliki KTS (Kartu Tanda Santri) dan BPS (Buku Pegangan Santri) Pondok Pesantren Al-Istiqomah.',
          'Santri yang keluar atau pindah harus mendapatkan izin dan restu dari Pengasuh dan Pengurus, serta menyelesaikan administrasi apabila memiliki tanggungan di Pondok Pesantren.',
        ],
      },
      {
        pasal: 4,
        title: 'Pendidikan',
        items: [
          'Mengikuti sholat jama\u2019ah sampai selesai wiridan.',
          'Mengikuti sekolah diniah, syawir, pengajian sorogan, dan seluruh kegiatan yang diadakan Pondok Pesantren dan Madrasah dengan disiplin dan tepat waktu.',
          'Mengaji sesuai dengan kemampuan.',
          'Meminta izin ketika berhalangan mengikuti kegiatan belajar mengajar.',
        ],
      },
      {
        pasal: 5,
        title: 'Keamanan',
        items: [
          'Mentaati tata tertib dan semua keputusan Pengasuh dan Pengurus, baik tertulis maupun tidak tertulis (lisan).',
          'Menetap di dalam Pondok Pesantren.',
          'Menjaga keamanan dan ketertiban Pondok Pesantren.',
          'Meminta izin kepada keamanan apabila keluar dari lingkungan atau pulang, dan melapor bila kembali ke Pondok Pesantren.',
          'Membawa, meminjam, dan mengendarai alat transportasi dengan izin pengurus.',
          'Menerima tamu (mahrom) sesuai dengan waktu yang telah ditentukan.',
          'Melapor kepada keamanan bila kehilangan/menemukan barang.',
          'Melapor kepada pengurus jika menemukan santri yang melanggar.',
          'Menjaga almamater Pondok Pesantren Al-Istiqomah Sumber Harjo Buay Madang Timur.',
          'Melapor kepada pengurus jika menemui tamu di luar waktu yang telah ditentukan.',
          'Memenuhi panggilan pengurus apabila diperlukan.',
          'Keluar dengan memakai pakaian yang sopan syar\u2019an wa \u2018adatan dan berkopyah.',
          'Melaksanakan jaga malam.',
        ],
      },
      {
        pasal: 6,
        title: 'Etika',
        items: [
          'Sowan (memohon do\u2019a dan restu kepada Pengasuh).',
          'Menjaga etika, prestasi, serta menjunjung tinggi nama baik Pondok Pesantren.',
          'Mengikuti sholat jama\u2019ah dan pengajian dengan memakai sarung, baju lengan panjang, dan berkopyah.',
          'Menghormati dewan masyayikh, asatidz, kepengurusan, dan sesama santri serta tamu.',
          'Membudayakan hidup sederhana.',
          'Berpakaian sopan syar\u2019an wa \u2018adatan baik di dalam maupun di luar Pondok Pesantren.',
          'Menjaga adabiyah di hadapan guru dan teman, baik ucapan maupun tingkah laku.',
          'Mengucapkan salam dan berpakaian sopan ketika masuk ke kantor dan kamar.',
          'Memohon izin pengasuh disertai walinya bagi santri yang mengakhiri/boyong.',
        ],
      },
      {
        pasal: 7,
        title: 'Kebersihan, Kesehatan & Fasilitas',
        items: [
          'Menjaga kebersihan, kesehatan, dan keindahan lingkungan Pondok Pesantren.',
          'Memelihara gedung, bangunan, peralatan, dan fasilitas yang ada di Pondok Pesantren.',
          'Mengikuti ro\u2019an sesuai dengan jadwal yang telah ditentukan.',
          'Membuang sampah pada tempatnya.',
          'Menggunakan fasilitas MCK (mandi, cuci, kakus, jeding) sesuai dengan kegunaannya.',
          'Melaporkan kepada pengurus kesehatan apabila sakit.',
          'Menghemat penggunaan energi listrik.',
        ],
      },
    ],
  },
  {
    id: 'larangan',
    title: 'Larangan & Pelanggaran',
    desc: 'Pelanggaran yang tidak boleh dilakukan santri di lingkungan pondok.',
    bab: 'BAB III',
    babTitle: 'Larangan',
    pasalCount: 5,
    pasal: [
      {
        pasal: 8,
        title: 'Administrasi',
        items: [
          'Merubah foto atau identitas KTS (Kartu Tanda Santri) dan BPS (Buku Pegangan Santri) Pondok Pesantren Al-Istiqomah.',
          'Membuat seragam/atribut tanpa seizin pengurus.',
        ],
      },
      {
        pasal: 9,
        title: 'Organisasi',
        items: [
          'Menjadi anggota organisasi atau mengikuti kegiatan ekstra yang tidak ada kaitan langsung dengan pondok pesantren, madrasah, dan sekolah, kecuali mendapat izin pengasuh.',
          'Mengadakan hubungan dengan lingkungan luar pondok.',
          'Menyalahgunakan izin organisasi.',
        ],
      },
      {
        pasal: 10,
        title: 'Pendidikan & Keamanan',
        items: [
          'Melakukan larangan syar\u2019i seperti zina, mencuri, taruhan, menggosob, mentato, dan lain-lain.',
          'Membawa, mengkonsumsi, memiliki, menyimpan, atau mengedarkan miras dan narkoba serta sejenisnya.',
          'Bermain PS, bilyard, karambol, remi, dan sejenisnya.',
          'Mengakses jejaring sosial dan situs-situs yang berbau pornografi.',
          'Membawa, menyimpan, atau menitipkan senjata tajam (sajam).',
          'Mengganggu, berkenalan dengan anak putri, atau menerimanya sebagai tamu yang bukan mahromnya.',
          'Bertengkar dan segala jenis permusuhan lainnya.',
          'Berambut gondrong, bersemir, berkuku panjang, memakai anting, gelang, dan aksesoris sejenis.',
          'Renang, rekreasi, melihat konser, pertunjukan bazar, dan sejenisnya.',
          'Membawa/mengendarai alat transportasi tanpa mendapat izin.',
          'Merokok bagi santri berumur di bawah 18 tahun.',
          'Mandi atau mencuci ketika kegiatan pondok atau madrasah berlangsung.',
          'Tidur di tempat yang tidak pada semestinya.',
          'Menyalahgunakan surat izin.',
          'Surat-menyurat antar lawan jenis yang bukan mahromnya.',
          'Berada di luar lingkungan pondok tanpa izin.',
          'Memakai celana pensil, tiga perempat, dan sejenisnya.',
          'Memiliki, menyimpan, melihat, membaca, dan mengedarkan buku atau gambar yang tidak ada kaitannya dengan Pondok Pesantren.',
          'Mengikuti atau mengadakan demonstrasi, unjuk rasa, dan sejenisnya.',
          'Menyimpan, membawa, atau menitipkan flashdisk, SIM card HP, alat musik dan sejenisnya seperti radio, tape recorder, handphone, dan alat elektronik lainnya.',
          'Membuka wirausaha atau bisnis tanpa seizin pengasuh.',
        ],
      },
      {
        pasal: 11,
        title: 'Etika',
        items: [
          'Berpakaian tidak rapi.',
          'Berpenampilan/berbicara mengikuti gaya orang kafir.',
          'Bergurau atau duduk di tepi jalan dan tempat-tempat yang tidak semestinya.',
          'Menghina atau melawan pengurus.',
          'Mencaci atau menghina tamu.',
          'Berbohong, mengumpat/berkata jorok (misuh), dan memanggil dengan kata yang tidak pantas.',
          'Membuat gaduh pada saat sholat berjamaah, pengajian, dan waktu istirahat.',
          'Berpenampilan tidak rapi dan tidak sopan.',
          'Menaruh kitab tidak pada tempatnya.',
          'Mengamalkan segala amalan tanpa seizin kyai.',
        ],
      },
      {
        pasal: 12,
        title: 'Kebersihan, Kesehatan & Fasilitas',
        items: [
          'Membuang sampah tidak pada tempatnya.',
          'Buang air kecil/besar di selain tempat yang sudah disediakan.',
          'Mencorat-coret dinding, lantai, lemari, dan lain-lain.',
          'Memelihara binatang.',
          'Menelantarkan pakaian.',
          'Membuat laporan palsu.',
          'Menggunakan kamar mandi dan WC secara berlebihan.',
          'Memasukkan sesuatu ke dalam air yang dapat mengubah warna, rasa, dan bau.',
          'Membuang bekas peralatan mandi di dalam jeding.',
          'Merubah, menambah, dan merusak tegangan listrik atau fasilitas lain.',
        ],
      },
    ],
  },
  {
    id: 'sanksi',
    title: 'Sanksi & Hukuman',
    desc: 'Jenis pelanggaran dan sanksi sesuai tingkat pelanggaran.',
    bab: 'BAB IV',
    babTitle: 'Sanksi & Pelaksanaan',
    pasalCount: 4,
    pasal: [
      {
        pasal: 15,
        title: 'Pelaksanaan Hukuman',
        items: [
          'Semua jenis hukuman ditentukan dan dilaksanakan oleh pengurus yang bersangkutan sesuai dengan kategori hukuman.',
          'Hukuman yang tidak diindahkan akan ditindaklanjuti dengan hukuman yang lebih berat.',
        ],
      },
      {
        pasal: 16,
        title: 'Ketentuan Pengulangan Pelanggaran',
        items: [
          'Dihukum dengan hukuman berat bagi santri yang melakukan pelanggaran lebih dari 3 (tiga) kali.',
          'Dihukum dengan hukuman sedang bagi santri yang masih melakukan pelanggaran setelah diperingatkan dan menjalani hukuman ringan.',
          'Dihukum dengan hukuman ringan sebagai peringatan.',
        ],
      },
    ],
  },
  {
    id: 'lain',
    title: 'Tujuan & Aturan Tambahan',
    desc: 'Tujuan tata tertib serta aturan tambahan bagi santri.',
    bab: 'BAB V & VI',
    babTitle: 'Ketentuan Lain',
    pasalCount: 3,
    pasal: [
      {
        pasal: 17,
        title: 'Tujuan Tata Tertib',
        items: [
          'Meningkatkan wawasan atau pandangan, serta pemahaman pengurus dan santri.',
          'Menjadi pedoman bagi pengurus dalam menentukan dan mengambil suatu keputusan atau hukum yang jujur dan adil serta dapat dipertanggungjawabkan.',
          'Memberikan perlindungan hukum.',
          'Membentuk manusia yang beradab dan sadar hukum.',
        ],
      },
      {
        pasal: 18,
        title: 'Aturan Tambahan',
        items: [
          'Santri tidak diperkenankan menerima telepon dan tamu pada saat jam kegiatan berjalan.',
          'Santri tidak diperkenankan menelepon dan menerima telepon dari selain mahromnya.',
          'Santri yang tidak kembali sesuai dengan batas waktunya harus membawa surat keterangan.',
          'Santri dianggap boyong apabila dalam 1 bulan tidak kembali ke pondok pesantren tanpa keterangan/pemberitahuan izin, dan wajib melakukan pendaftaran ulang.',
        ],
      },
      {
        pasal: 19,
        title: 'Hal-Hal yang Belum Tertulis',
        items: [
          'Hal-hal yang belum tertulis dalam tata tertib ini akan diatur kemudian oleh Pengasuh dan Pengurus Pondok Pesantren.',
        ],
      },
    ],
  },
  {
    id: 'wali-santri',
    title: 'Tata Tertib Wali Santri',
    desc: 'Ketentuan dan etika bertamu bagi wali/orang tua santri.',
    bab: 'Lampiran',
    babTitle: 'Wali Santri & Etika Bertamu',
    pasalCount: 2,
    pasal: [
      {
        pasal: 0,
        title: 'Ketentuan Umum Wali Santri',
        items: [
          'Memberikan hak penuh kepada pengasuh dan pengurus dalam proses pendidikan.',
          'Bertanggung jawab sepenuhnya mengenai kebutuhan anak saat berada di pesantren.',
          'Berpakaian sopan dan melapor ke kantor saat menyambang.',
          'Melapor/konsultasi kepada pihak kantor apabila anak mengadukan hal-hal yang tidak diinginkan.',
        ],
      },
      {
        pasal: 20,
        title: 'Etika Bertamu',
        items: [
          'Tamu wajib melapor ke kantor sebelum menemui putranya.',
          'Masuk dengan mengucap salam.',
          'Mengisi daftar buku tamu.',
          'Menunjukkan kartu tanda mahrom atau bukti lain yang menunjukkan hubungan keluarga.',
          'Waktu sambang (berkunjung): Jum\u2019at sore pukul 14.00\u201316.00 WIB, dan Minggu pagi pukul 08.00\u201311.00 WIB.',
          'Dilarang menyambang di luar tempat yang telah disediakan pesantren, seperti di pinggir jalan, pos ronda, atau tempat lain di luar area pesantren.',
          'Dilarang meninggalkan kendaraan di luar lingkungan pesantren dan meninggalkan kunci pada kendaraan.',
          'Bertutur kata yang sopan.',
          'Berpakaian sopan: laki-laki memakai songkok/kopyah (bukan topi), baju lengan panjang/pendek, serta sarung/celana panjang. Perempuan berkerudung, baju lengan panjang (bukan kaos), serta memakai rok (bukan celana).',
        ],
      },
    ],
  },
]

const SANKSI_LEVELS: SanksiLevel[] = [
  {
    key: 'ringan',
    level: { id: 'RINGAN', en: 'MILD' },
    pill: { id: 'Pelanggaran Ringan', en: 'Mild Violation' },
    barWidth: '33%',
    pasalRef: 'Pasal 10 ayat 11, 12, 13, 14 · Pasal 11 ayat 1, 3, 8 · Pasal 12 ayat 1, 4, 5',
    hukuman: ['Diperingatkan', 'Pernyataan diri tidak mengulangi', 'Disiram dengan air'],
  },
  {
    key: 'sedang',
    level: { id: 'SEDANG', en: 'MODERATE' },
    pill: { id: 'Pelanggaran Sedang', en: 'Moderate Violation' },
    barWidth: '66%',
    pasalRef: 'Pasal 8 ayat 1–2 · Pasal 9 ayat 2 · Pasal 10 ayat 8, 10, 15–19, 21 · Pasal 11 ayat 2, 6, 7 · Pasal 12 ayat 2, 3, 7, 8, 9',
    hukuman: ['Nadhofah / bersih-bersih', 'Membaca atau menulis surat pilihan di lapangan', 'Membuat surat perjanjian'],
  },
  {
    key: 'berat',
    level: { id: 'BERAT', en: 'SEVERE' },
    pill: { id: 'Pelanggaran Berat', en: 'Severe Violation' },
    barWidth: '100%',
    pasalRef: 'Pasal 9 ayat 1, 3 · Pasal 10 ayat 1–7, 9, 20 · Pasal 11 ayat 4, 5, 9 · Pasal 12 ayat 6, 10',
    hukuman: ['Dicukur', 'Ganti rugi', 'Penyitaan barang tanpa dikembalikan', 'Denda', 'Disowankan kepada pengasuh', 'Dikembalikan kepada wali/orang tua'],
  },
]

// Teks ringkasan (i18n)
const RINGKASAN_TEXT: Record<string, { title: { id: string; en: string }; desc: { id: string; en: string } }> = {
  'tata-tertib': {
    title: { id: 'BAB I — Ketentuan Umum', en: 'Chapter I — General Provisions' },
    desc: { id: 'Aturan dasar dan umum yang berlaku.', en: 'Basic rules and general provisions.' },
  },
  'kewajiban': {
    title: { id: 'BAB II — Kewajiban Santri', en: 'Chapter II — Student Obligations' },
    desc: { id: 'Kewajiban santri dalam keseluruhan.', en: 'Student obligations in general.' },
  },
  'larangan': {
    title: { id: 'BAB III — Pelanggaran', en: 'Chapter III — Prohibitions' },
    desc: { id: 'Pelanggaran yang tidak boleh dilakukan.', en: 'Prohibitions that must not be violated.' },
  },
  'sanksi': {
    title: { id: 'BAB IV — Sanksi & Pelaksanaan', en: 'Chapter IV — Sanctions & Implementation' },
    desc: { id: 'Jenis pelanggaran dan sanksi yang diterapkan.', en: 'Types of violations and applicable sanctions.' },
  },
  'lain': {
    title: { id: 'BAB V & VI — Ketentuan Lain', en: 'Chapter V & VI — Other Provisions' },
    desc: { id: 'Tujuan tata tertib serta aturan tambahan.', en: 'Purpose of regulations and additional rules.' },
  },
  'wali-santri': {
    title: { id: 'Lampiran — Wali Santri & Lainnya', en: 'Appendix — Parents & Others' },
    desc: { id: 'Ketentuan dan etika bersama wali santri.', en: 'Provisions and etiquette for parents.' },
  },
}

// ════════════════════════════════════════════════════════════════════════
// Sub-komponen umum
// ════════════════════════════════════════════════════════════════════════

// Gambar dari /public/icons — otomatis fallback ke ikon vektor jika file gagal dimuat
function AssetIcon({
  src, alt, size, fallback,
}: {
  src: string
  alt: string
  size: number
  fallback: React.ReactNode
}) {
  const [err, setErr] = useState(false)
  if (err) return <>{fallback}</>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={encodeURI(src)}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block', userSelect: 'none' }}
    />
  )
}

// Card BUNDAR berisi icon peraturan (palu)
function PeraturanBubble({
  categoryId, size, imgSize,
}: {
  categoryId: string
  size: number
  imgSize: number
}) {
  const { isDark } = useUi()
  const tone = toneOf(categoryId, isDark)
  return (
    <span
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        background: tone.soft,
        border: `1.5px solid ${tone.line}`,
        boxSizing: 'border-box',
        boxShadow: isDark ? 'none' : `0 4px 12px ${tone.glow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <AssetIcon
        src={PERATURAN_ICON}
        alt="Peraturan"
        size={imgSize}
        fallback={
          <span style={{ display: 'flex', color: tone.fg }}>
            <IconGavel size={Math.round(imgSize * 0.8)} />
          </span>
        }
      />
    </span>
  )
}

function Chip({
  fg, soft, line, children,
}: {
  fg: string; soft: string; line: string; children: React.ReactNode
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: soft,
        color: fg,
        border: `1px solid ${line}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.3,
      }}
    >
      {children}
    </span>
  )
}

// ════════════════════════════════════════════════════════════════════════
// Detail satu kategori
// ════════════════════════════════════════════════════════════════════════
function CategoryDetail({
  category, expandedKey, toggle,
}: {
  category: CategoryDef
  expandedKey: string | null
  toggle: (key: string) => void
}) {
  const { isDark, isEn, t, tr } = useUi()
  const tone = toneOf(category.id, isDark)

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header kategori */}
      <div style={{ ...getCardStyle(isDark), padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <PeraturanBubble categoryId={category.id} size={60} imgSize={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: '0 0 6px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              color: tone.fg,
              lineHeight: 1.4,
            }}
          >
            {category.bab} — {category.babTitle}
          </p>
          <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: t.text, lineHeight: 1.3, letterSpacing: '-.01em' }}>
            {category.title}
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: t.muted, lineHeight: 1.6, fontWeight: 500, ...JUSTIFY }}>
            {category.desc}
          </p>
        </div>
      </div>

      {/* Kartu tingkat sanksi */}
      {category.id === 'sanksi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SANKSI_LEVELS.map((s) => {
            const st = sanksiTone(s.key, isDark)
            return (
              <div key={s.key} style={{ ...getCardStyle(isDark), padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 46,
                    height: 46,
                    minWidth: 46,
                    borderRadius: '50%',
                    background: st.soft,
                    border: `1.5px solid ${st.line}`,
                    boxSizing: 'border-box',
                    color: st.fg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconAlertTriangle size={20} />
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: st.fg, letterSpacing: '.02em' }}>
                      {isEn ? s.level.en : s.level.id}
                    </p>
                    <Chip fg={st.fg} soft={st.soft} line={st.line}>
                      {isEn ? s.pill.en : s.pill.id}
                    </Chip>
                  </div>

                  <div style={{ height: 6, borderRadius: 999, background: t.pendingBg, overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ width: s.barWidth, height: '100%', borderRadius: 999, background: st.bar, transition: 'width .6s ease' }} />
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: 12.5, color: t.muted, lineHeight: 1.6, ...JUSTIFY }}>
                    <strong style={{ color: t.label, fontWeight: 700 }}>{tr('Berlaku untuk:', 'Applies to:')}</strong> {s.pasalRef}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {s.hukuman.map((h) => (
                      <span
                        key={h}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '5px 11px',
                          borderRadius: 999,
                          background: st.soft,
                          border: `1px solid ${st.line}`,
                          color: st.fg,
                          lineHeight: 1.35,
                        }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Accordion pasal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {category.pasal.map((p) => {
          const key = `${category.id}-${p.pasal}-${p.title}`
          const isOpen = expandedKey === key
          const countText = isEn ? `${p.items.length} provisions` : `${p.items.length} ketentuan`
          const pasalText = p.pasal > 0 ? (isEn ? `Article ${p.pasal}` : `Pasal ${p.pasal}`) : tr('Umum', 'General')

          return (
            <div
              key={key}
              style={{
                ...getCardStyle(isDark),
                overflow: 'hidden',
                borderColor: isOpen ? tone.line : t.border,
                transition: 'border-color .2s ease',
              }}
            >
              <button
                type="button"
                className="prt-acc"
                onClick={() => toggle(key)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  background: isOpen ? tone.soft : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: 'background-color .2s ease',
                }}
              >
                <span
                  style={{
                    width: 42,
                    height: 42,
                    minWidth: 42,
                    borderRadius: '50%',
                    background: isOpen ? t.surface : tone.soft,
                    border: `1.5px solid ${tone.line}`,
                    boxSizing: 'border-box',
                    color: tone.fg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {p.pasal > 0 ? p.pasal : '\u2022'}
                </span>

                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 800, color: t.text, lineHeight: 1.35, letterSpacing: '-.01em' }}>
                    {p.title}
                  </span>
                  <span style={{ alignSelf: 'flex-start' }}>
                    <Chip fg={tone.fg} soft={tone.soft} line={tone.line}>
                      {pasalText} · {countText}
                    </Chip>
                  </span>
                </span>

                <span
                  style={{
                    width: 30,
                    height: 30,
                    minWidth: 30,
                    borderRadius: '50%',
                    background: t.surfaceAlt,
                    border: `1px solid ${t.border}`,
                    color: tone.fg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform .25s ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <IconChevronDown size={15} />
                </span>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '14px 16px 18px',
                    borderTop: `1px solid ${t.divider}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    animation: 'prt-fade .22s ease both',
                  }}
                >
                  {p.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          minWidth: 24,
                          borderRadius: '50%',
                          background: tone.grad,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 800,
                          marginTop: 1,
                        }}
                      >
                        {i + 1}
                      </span>
                      <p
                        style={{
                          flex: 1,
                          minWidth: 0,
                          margin: 0,
                          fontSize: 13.5,
                          lineHeight: 1.7,
                          color: t.label,
                          fontWeight: 500,
                          ...JUSTIFY,
                        }}
                      >
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════════
// CSS halaman
// ════════════════════════════════════════════════════════════════════════
const PAGE_CSS = `
@keyframes prt-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.psmb-back { transition: transform .12s ease, background-color .15s ease; -webkit-tap-highlight-color: transparent; }
.psmb-back:active { transform: scale(.94); }
.prt-btn { transition: transform .12s ease, filter .15s ease; -webkit-tap-highlight-color: transparent; }
.prt-btn:active { transform: scale(.97); }
.prt-chip { transition: background .15s ease, color .15s ease, box-shadow .15s ease, transform .12s ease; -webkit-tap-highlight-color: transparent; }
.prt-chip:active { transform: scale(.96); }
.prt-row { transition: transform .15s ease; -webkit-tap-highlight-color: transparent; }
.prt-row:active { transform: scale(.985); }
@media (hover: hover) { .prt-row:hover { transform: translateY(-2px); } }
.prt-acc { -webkit-tap-highlight-color: transparent; }
.prt-chips::-webkit-scrollbar { display: none; height: 0; width: 0; }
.prt-chips { scrollbar-width: none; -ms-overflow-style: none; }
`

// ════════════════════════════════════════════════════════════════════════
// Komponen utama
// ════════════════════════════════════════════════════════════════════════
export default function PeraturanPage() {
  const { isDark, t, tr } = useUi()

  const [activeFilter, setActiveFilter] = useState<string>('semua')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  function toggle(key: string) {
    setExpandedKey((prev) => (prev === key ? null : key))
  }

  function selectCategory(id: string) {
    setActiveFilter(id)
    setExpandedKey(null)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isSemua = activeFilter === 'semua'
  const isLengkap = activeFilter === 'lengkap'
  const activeCategory = CATEGORIES.find((c) => c.id === activeFilter) ?? null

  const filterTabs = [
    { id: 'semua',       label: tr('Semua', 'All') },
    { id: 'tata-tertib', label: tr('Tata Tertib', 'Rules') },
    { id: 'kewajiban',   label: tr('Kewajiban', 'Obligations') },
    { id: 'larangan',    label: tr('Larangan', 'Prohibitions') },
    { id: 'sanksi',      label: tr('Sanksi', 'Sanctions') },
    { id: 'lain',        label: tr('Ketentuan Lain', 'Other Provisions') },
    { id: 'wali-santri', label: tr('Wali Santri', 'Parents') },
  ]

  const BackToSummary = (
    <button
      type="button"
      className="prt-btn"
      onClick={() => selectCategory('semua')}
      style={{
        alignSelf: 'flex-start',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px 8px 10px',
        borderRadius: 999,
        background: t.primarySoft,
        border: isDark ? '1px solid #22443A' : '1px solid #CFE6DA',
        color: t.primaryText,
        fontSize: 12.5,
        fontWeight: 700,
        fontFamily: 'inherit',
        cursor: 'pointer',
      }}
    >
      <IconArrowLeft size={14} />
      {tr('Kembali ke Ringkasan', 'Back to Summary')}
    </button>
  )

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 430,
        margin: '0 auto',
        minHeight: '100dvh',
        background: t.bg,
        overflowX: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ══ HEADER (FIXED) — identik dengan halaman Pendaftaran ══ */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          height: HEADER_HEIGHT,
          zIndex: 40,
          background: t.surface,
          borderBottom: `1px solid ${t.border}`,
          padding: '0 16px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Link
          href="/siswa"
          aria-label={tr('Kembali', 'Back')}
          className="psmb-back"
          style={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: '50%',
            background: t.primarySoft,
            border: isDark ? '1px solid #22443A' : '1px solid #CFE6DA',
            boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,107,74,.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: t.primaryText,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <IconArrowLeft size={18} />
        </Link>

        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: t.text,
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {tr('Peraturan Pondok', 'Pondok Regulations')}
          </h1>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 13,
              color: t.muted,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {tr('Pondok Pesantren Al-Istiqomah', 'Al-Istiqomah Islamic Boarding School')}
          </p>
        </div>
      </div>

      {/* ══ KONTEN ══ */}
      <div
        style={{
          paddingTop: HEADER_HEIGHT + 16,
          paddingBottom: NAV_HEIGHT + 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Banner */}
        {isSemua && (
          <div style={{ padding: '0 16px' }}>
            <div style={{ ...getCardStyle(isDark), overflow: 'hidden', background: t.primarySoft }}>
              <Image
                src="/icons/peraturan-banner.png"
                alt={tr('Peraturan Pondok Pesantren Al-Istiqomah', 'Al-Istiqomah Islamic Boarding School Regulations')}
                width={440}
                height={200}
                priority
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        )}

        {/* Filter chips */}
        <div
          className="prt-chips"
          role="tablist"
          style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 16px 4px' }}
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className="prt-chip"
                onClick={() => selectCategory(tab.id)}
                style={{
                  padding: '9px 16px',
                  minHeight: 38,
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: isActive ? 800 : 600,
                  lineHeight: 1.3,
                  border: isActive ? 'none' : `1px solid ${t.borderInput}`,
                  background: isActive ? t.gradient : t.surface,
                  color: isActive ? '#FFFFFF' : t.muted,
                  boxShadow: isActive ? '0 4px 10px rgba(15,107,74,.24)' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ── Ringkasan ── */}
          {isSemua && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: t.text, letterSpacing: '-.01em' }}>
                  {tr('Ringkasan Peraturan', 'Regulation Summary')}
                </h2>
                <button
                  type="button"
                  className="prt-btn"
                  onClick={() => selectCategory('lengkap')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: t.primarySoft,
                    border: isDark ? '1px solid #22443A' : '1px solid #CFE6DA',
                    color: t.primaryText,
                    fontSize: 12.5,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  {tr('Lihat Semua', 'View All')}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {CATEGORIES.map((cat) => {
                  const tone = toneOf(cat.id, isDark)
                  const txt = RINGKASAN_TEXT[cat.id]
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className="prt-row"
                      onClick={() => selectCategory(cat.id)}
                      style={{
                        ...getCardStyle(isDark),
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 14px 14px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      <PeraturanBubble categoryId={cat.id} size={50} imgSize={34} />

                      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: t.text,
                            lineHeight: 1.3,
                            letterSpacing: '-.01em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tr(txt.title.id, txt.title.en)}
                        </span>
                        <span
                          style={{
                            fontSize: 12.5,
                            color: t.muted,
                            fontWeight: 500,
                            lineHeight: 1.45,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {tr(txt.desc.id, txt.desc.en)}
                        </span>
                      </span>

                      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Chip fg={tone.fg} soft={tone.soft} line={tone.line}>
                          {cat.pasalCount} {tr('Pasal', 'Articles')}
                        </Chip>
                        <span
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: t.surfaceAlt,
                            border: `1px solid ${t.border}`,
                            color: t.faint,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconChevronRight size={13} />
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* ── Detail satu kategori ── */}
          {!isSemua && !isLengkap && activeCategory && (
            <div key={activeCategory.id} style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'prt-fade .25s ease both' }}>
              {BackToSummary}
              <CategoryDetail category={activeCategory} expandedKey={expandedKey} toggle={toggle} />
            </div>
          )}

          {/* ── Semua kategori ── */}
          {isLengkap && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, animation: 'prt-fade .25s ease both' }}>
              {BackToSummary}
              {CATEGORIES.map((cat) => (
                <CategoryDetail key={cat.id} category={cat} expandedKey={expandedKey} toggle={toggle} />
              ))}
            </div>
          )}

          {/* ── Catatan kaki ── */}
          <div
            style={{
              ...getCardStyle(isDark),
              padding: '14px 16px',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              background: t.primarySoft,
              border: isDark ? '1px solid #22443A' : '1px solid #CFE6DA',
              boxShadow: 'none',
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                minWidth: 34,
                borderRadius: '50%',
                background: t.gradient,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconInfo size={17} />
            </span>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.65, color: t.label, fontWeight: 500, ...JUSTIFY }}>
              {tr(
                'Tata tertib ini berlaku sejak ditetapkan pada 12 Maret 2026 dan mengikat seluruh santri Pondok Pesantren Al-Istiqomah. Ketidaktahuan tidak dapat dijadikan alasan pelanggaran.',
                'These regulations have been in effect since March 12, 2026 and are binding on all students of Al-Istiqomah Islamic Boarding School. Ignorance cannot be used as an excuse for violations.',
              )}
            </p>
          </div>
        </div>
      </div>

      <style>{PAGE_CSS}</style>
    </div>
  )
}