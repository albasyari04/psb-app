// page.tsx - VERSI LENGKAP DENGAN PERBAIKAN
'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import styles from './peraturan.module.css'

// ════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════
interface PasalItem {
  pasal: number
  title: string
  items: string[]
}

interface CategoryColors {
  cardBg: string
  border: string
  iconBg: string
  accent: string
  tagBg: string
  tagText: string
}

interface CategoryDef {
  id: string
  chipLabel: string
  title: string
  desc: string
  bab: string
  babTitle: string
  pasalCount: number
  illustration?: string
  colors: CategoryColors
  pasal: PasalItem[]
}

interface SanksiLevel {
  level: string
  color: string
  bg: string
  border: string
  iconBg: string
  barColor: string
  barWidth: string
  pasalRef: string
  hukuman: string[]
}

// ════════════════════════════════════════════════════════════════════════
// Icon set
// ════════════════════════════════════════════════════════════════════════
const IconArrowLeft = ({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const IconChevronRight = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const IconChevronDown = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const IconGrid = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
  </svg>
)

const IconShieldCheck = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-4z" />
    <polyline points="9 12 11 14 15 9.5" />
  </svg>
)

const IconAlertTriangle = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const IconGavel = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 9.5L5 19" />
    <path d="M17.5 12.5L21 9" />
    <path d="M10.5 5.5l8 8" />
    <path d="M13.5 2.5l8 8" />
    <line x1="3" y1="21" x2="10" y2="21" />
  </svg>
)

const IconScroll = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const IconUsers = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconBookOpen = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4.5h6.5A2.5 2.5 0 0 1 11 7v13.5A2 2 0 0 0 9 19H2z" />
    <path d="M22 4.5h-6.5A2.5 2.5 0 0 0 13 7v13.5a2 2 0 0 1 2-1.5h7z" />
  </svg>
)

const IconInfo = ({ color = '#15803d', size = 15 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '0.12rem' }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

// ════════════════════════════════════════════════════════════════════════
// Data peraturan
// ════════════════════════════════════════════════════════════════════════
const CATEGORIES: CategoryDef[] = [
  {
    id: 'tata-tertib',
    chipLabel: 'Tata Tertib',
    title: 'Tata Tertib Umum',
    desc: 'Aturan dasar dan umum yang wajib diikuti seluruh santri.',
    bab: 'BAB I',
    babTitle: 'Ketentuan Umum',
    pasalCount: 2,
    illustration: '/icons/tata-tertib-icon.png',
    colors: {
      cardBg: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%)',
      border: '#bbf7d0',
      iconBg: '#dcfce7',
      accent: '#16a34a',
      tagBg: '#dcfce7',
      tagText: '#166534',
    },
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
    chipLabel: 'Kewajiban',
    title: 'Kewajiban & Ketentuan',
    desc: 'Kewajiban santri dalam menjalankan kegiatan di pondok.',
    bab: 'BAB II',
    babTitle: 'Kewajiban Santri',
    pasalCount: 5,
    illustration: '/image/kewajiban.png',
    colors: {
      cardBg: 'linear-gradient(160deg, #f0fdf9 0%, #d1fae5 100%)',
      border: '#a7f3d0',
      iconBg: '#d1fae5',
      accent: '#059669',
      tagBg: '#d1fae5',
      tagText: '#065f46',
    },
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
    chipLabel: 'Larangan',
    title: 'Larangan & Pelanggaran',
    desc: 'Pelanggaran yang tidak boleh dilakukan santri di lingkungan pondok.',
    bab: 'BAB III',
    babTitle: 'Larangan',
    pasalCount: 5,
    illustration: '/icons/icon penting.png',
    colors: {
      cardBg: 'linear-gradient(160deg, #fffbeb 0%, #fef3c7 100%)',
      border: '#fde68a',
      iconBg: '#fee2e2',
      accent: '#dc2626',
      tagBg: '#fee2e2',
      tagText: '#991b1b',
    },
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
    chipLabel: 'Sanksi',
    title: 'Sanksi & Hukuman',
    desc: 'Jenis pelanggaran dan sanksi sesuai tingkat pelanggaran.',
    bab: 'BAB IV',
    babTitle: 'Sanksi & Pelaksanaan',
    pasalCount: 4,
    illustration: '/image/icon hakim.png',
    colors: {
      cardBg: 'linear-gradient(160deg, #faf5ff 0%, #ede9fe 100%)',
      border: '#ddd6fe',
      iconBg: '#ede9fe',
      accent: '#7c3aed',
      tagBg: '#ede9fe',
      tagText: '#5b21b6',
    },
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
    chipLabel: 'Ketentuan Lain',
    title: 'Tujuan & Aturan Tambahan',
    desc: 'Tujuan tata tertib serta aturan tambahan bagi santri.',
    bab: 'BAB V & VI',
    babTitle: 'Ketentuan Lain',
    pasalCount: 3,
    colors: {
      cardBg: 'linear-gradient(160deg, #f0fdfa 0%, #ccfbf1 100%)',
      border: '#99f6e4',
      iconBg: '#ccfbf1',
      accent: '#0d9488',
      tagBg: '#ccfbf1',
      tagText: '#115e59',
    },
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
    chipLabel: 'Wali Santri',
    title: 'Tata Tertib Wali Santri',
    desc: 'Ketentuan dan etika bertamu bagi wali/orang tua santri.',
    bab: 'Lampiran',
    babTitle: 'Wali Santri & Etika Bertamu',
    pasalCount: 2,
    colors: {
      cardBg: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%)',
      border: '#bfdbfe',
      iconBg: '#dbeafe',
      accent: '#2563eb',
      tagBg: '#dbeafe',
      tagText: '#1e40af',
    },
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
    level: 'RINGAN',
    color: '#d97706',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef9ec 100%)',
    border: '#fde68a',
    iconBg: '#fef3c7',
    barColor: '#fbbf24',
    barWidth: '33%',
    pasalRef: 'Pasal 10 ayat 11, 12, 13, 14 · Pasal 11 ayat 1, 3, 8 · Pasal 12 ayat 1, 4, 5',
    hukuman: ['Diperingatkan', 'Pernyataan diri tidak mengulangi', 'Disiram dengan air'],
  },
  {
    level: 'SEDANG',
    color: '#ea580c',
    bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    border: '#fed7aa',
    iconBg: '#ffedd5',
    barColor: '#fb923c',
    barWidth: '66%',
    pasalRef: 'Pasal 8 ayat 1–2 · Pasal 9 ayat 2 · Pasal 10 ayat 8, 10, 15–19, 21 · Pasal 11 ayat 2, 6, 7 · Pasal 12 ayat 2, 3, 7, 8, 9',
    hukuman: ['Nadhofah / bersih-bersih', 'Membaca atau menulis surat pilihan di lapangan', 'Membuat surat perjanjian'],
  },
  {
    level: 'BERAT',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)',
    border: '#ddd6fe',
    iconBg: '#ede9fe',
    barColor: '#a78bfa',
    barWidth: '100%',
    pasalRef: 'Pasal 9 ayat 1, 3 · Pasal 10 ayat 1–7, 9, 20 · Pasal 11 ayat 4, 5, 9 · Pasal 12 ayat 6, 10',
    hukuman: ['Dicukur', 'Ganti rugi', 'Penyitaan barang tanpa dikembalikan', 'Denda', 'Disowankan kepada pengasuh', 'Dikembalikan kepada wali/orang tua'],
  },
]

// ════════════════════════════════════════════════════════════════════════
// Sub-komponen: detail satu kategori
// ════════════════════════════════════════════════════════════════════════
function CategoryDetail({
  category,
  expandedKey,
  toggle,
}: {
  category: CategoryDef
  expandedKey: string | null
  toggle: (key: string) => void
}) {
  return (
    <div className={styles.detailSection}>
      <div className={styles.detailHeader} style={{ borderColor: category.colors.border }}>
        <div className={styles.detailIconWrap} style={{ background: category.colors.iconBg }}>
          {category.id === 'tata-tertib' && (
            <Image
              src="/icons/tata-tertib-icon.png"
              alt="Tata Tertib"
              width={24}
              height={24}
              className={styles.detailIconImage}
            />
          )}
          {category.id === 'kewajiban' && <IconShieldCheck color={category.colors.accent} size={22} />}
          {category.id === 'larangan' && <IconAlertTriangle color={category.colors.accent} size={22} />}
          {category.id === 'sanksi' && <IconGavel color={category.colors.accent} size={22} />}
          {category.id === 'lain' && <IconScroll color={category.colors.accent} size={22} />}
          {category.id === 'wali-santri' && <IconUsers color={category.colors.accent} size={22} />}
        </div>
        <div>
          <p className={styles.detailBabTag} style={{ color: category.colors.accent }}>
            {category.bab} &mdash; {category.babTitle}
          </p>
          <h3 className={styles.detailTitle}>{category.title}</h3>
          <p className={styles.detailDesc}>{category.desc}</p>
        </div>
      </div>

      {category.id === 'sanksi' && (
        <div className={styles.sanksiList}>
          {SANKSI_LEVELS.map((s) => (
            <div key={s.level} className={styles.sanksiCard} style={{ background: s.bg, borderColor: s.border }}>
              <div className={styles.sanksiIconWrap} style={{ background: s.iconBg }}>
                <IconAlertTriangle color={s.color} size={18} />
              </div>
              <div className={styles.sanksiBody}>
                <div className={styles.sanksiLabelRow}>
                  <p className={styles.sanksiLevel} style={{ color: s.color }}>{s.level}</p>
                  <span className={styles.sanksiPill} style={{ background: s.iconBg, color: s.color }}>
                    Pelanggaran {s.level.charAt(0) + s.level.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className={styles.sanksiBarTrack}>
                  <div className={styles.sanksiBar} style={{ width: s.barWidth, background: s.barColor }} />
                </div>
                <p className={styles.sanksiRef}>Berlaku untuk: {s.pasalRef}</p>
                <div className={styles.sanksiHukumanList}>
                  {s.hukuman.map((h, i) => (
                    <span key={i} className={styles.sanksiHukumanPill} style={{ borderColor: s.border, color: s.color }}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.pasalList}>
        {category.pasal.map((p) => {
          const key = `${category.id}-${p.pasal}-${p.title}`
          const isOpen = expandedKey === key
          return (
            <div
              key={key}
              className={styles.accordionCard}
              style={{ borderColor: isOpen ? category.colors.border : '#e8eef8' }}
            >
              <button
                className={styles.accordionHeader}
                onClick={() => toggle(key)}
                aria-expanded={isOpen}
                style={{ background: isOpen ? category.colors.tagBg : 'white' }}
              >
                <div className={styles.accordionHeaderLeft}>
                  <div
                    className={styles.accordionNum}
                    style={{
                      background: category.colors.iconBg,
                      border: `1.5px solid ${category.colors.border}`,
                      color: category.colors.accent
                    }}
                  >
                    {p.pasal > 0 ? p.pasal : '\u2022'}
                  </div>
                  <div>
                    <p className={styles.accordionTitle}>{p.title}</p>
                    <span className={styles.accordionTag}
                      style={{
                        background: category.colors.tagBg,
                        color: category.colors.tagText
                      }}
                    >
                      {p.pasal > 0 ? `Pasal ${p.pasal}` : 'Umum'} · {p.items.length} ketentuan
                    </span>
                  </div>
                </div>
                <div
                  className={`${styles.accordionChevron} ${isOpen ? styles.accordionChevronOpen : ''}`}
                  style={{ color: category.colors.accent }}
                >
                  <IconChevronDown />
                </div>
              </button>

              {isOpen && (
                <div className={styles.ruleList}>
                  {p.items.map((item, i) => (
                    <div key={i} className={styles.ruleItem}>
                      <div 
                        className={styles.ruleBullet} 
                        style={{ 
                          background: category.colors.accent
                        }}
                      >
                        {i + 1}
                      </div>
                      <p className={styles.ruleText}>{item}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// Komponen utama
// ════════════════════════════════════════════════════════════════════════
export default function PeraturanPage() {
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

  return (
    <div className={styles.shell}>

      {/* ══ TOP HEADER ══════════════════════════════════════════════════ */}
      <div className={styles.topHeader}>
        <Link href="/siswa" className={styles.backBtn} aria-label="Kembali">
          <IconArrowLeft color="#0f172a" />
        </Link>
        <div className={styles.topHeaderTitleGroup}>
          <h1 className={styles.topHeaderTitle}>Peraturan Pondok</h1>
          <p className={styles.topHeaderSub}>Pondok Pesantren Al-Istiqomah</p>
        </div>
        <a
          href="/documents/tata-tertib-pondok-2026.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.bukuSakuBtn}
        >
          <IconBookOpen color="#15803d" size={15} />
          <span>Buku Saku</span>
        </a>
      </div>

      {/* ══ HERO BANNER ══════════════════════════════════════════════════ */}
      {isSemua && (
        <div className={styles.bannerWrapper}>
          <div className={styles.bannerCard}>
            <Image
              src="/icons/peraturan-banner.png"
              alt="Peraturan Pondok Pesantren Al-Istiqomah"
              width={440}
              height={200}
              className={styles.bannerImage}
              priority
            />
          </div>
        </div>
      )}

      {/* ══ FILTER CHIPS ═══════════════════════════════════════════════ */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsWrap}>
          <div className={styles.tabsScroll}>
            <button
              className={`${styles.tabBtn} ${isSemua ? styles.tabBtnActive : ''}`}
              onClick={() => selectCategory('semua')}
            >
              <span className={styles.tabIcon}>
                <IconGrid color={isSemua ? 'white' : '#64748b'} size={14} />
              </span>
              <span>Semua</span>
            </button>

            <button
              className={`${styles.tabBtn} ${activeFilter === 'tata-tertib' ? styles.tabBtnActive : ''}`}
              onClick={() => selectCategory('tata-tertib')}
            >
              <span className={styles.tabIcon}>
                <Image
                  src="/icons/tata-tertib-icon.png"
                  alt="Tata Tertib"
                  width={16}
                  height={16}
                  className={styles.tabIconImage}
                />
              </span>
              <span>Tata Tertib</span>
            </button>

            <button
              className={`${styles.tabBtn} ${activeFilter === 'kewajiban' ? styles.tabBtnActive : ''}`}
              onClick={() => selectCategory('kewajiban')}
            >
              <span className={styles.tabIcon}>
                <IconShieldCheck color={activeFilter === 'kewajiban' ? 'white' : '#64748b'} size={14} />
              </span>
              <span>Kewajiban</span>
            </button>

            <button
              className={`${styles.tabBtn} ${activeFilter === 'larangan' ? styles.tabBtnActive : ''}`}
              onClick={() => selectCategory('larangan')}
            >
              <span className={styles.tabIcon}>
                <IconAlertTriangle color={activeFilter === 'larangan' ? 'white' : '#64748b'} size={14} />
              </span>
              <span>Larangan</span>
            </button>

            <button
              className={`${styles.tabBtn} ${activeFilter === 'sanksi' ? styles.tabBtnActive : ''}`}
              onClick={() => selectCategory('sanksi')}
            >
              <span className={styles.tabIcon}>
                <IconGavel color={activeFilter === 'sanksi' ? 'white' : '#64748b'} size={14} />
              </span>
              <span>Sanksi</span>
            </button>

            <button
              className={`${styles.tabBtn} ${activeFilter === 'lain' ? styles.tabBtnActive : ''}`}
              onClick={() => selectCategory('lain')}
            >
              <span className={styles.tabIcon}>
                <IconScroll color={activeFilter === 'lain' ? 'white' : '#64748b'} size={14} />
              </span>
              <span>Ketentuan Lain</span>
            </button>

            <button
              className={`${styles.tabBtn} ${activeFilter === 'wali-santri' ? styles.tabBtnActive : ''}`}
              onClick={() => selectCategory('wali-santri')}
            >
              <span className={styles.tabIcon}>
                <IconUsers color={activeFilter === 'wali-santri' ? 'white' : '#64748b'} size={14} />
              </span>
              <span>Wali Santri</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ═════════════════════════════════════════════════════ */}
      <div className={styles.content}>

        {isSemua && (
          <>
            <div className={styles.sectionLabel}>
              <p className={styles.sectionLabelTitle}>Kategori Peraturan</p>
              <p className={styles.sectionLabelSub}>Pilih kategori untuk melihat peraturan lebih detail</p>
            </div>
            <div className={styles.categoryGrid}>
              {/* Tata Tertib Umum */}
              <button
                className={styles.categoryCard}
                style={{ 
                  background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%)', 
                  borderColor: '#bbf7d0',
                  padding: '1.2rem 1rem 3.8rem 1.5rem'
                }}
                onClick={() => selectCategory('tata-tertib')}
              >
                <div className={styles.categoryIconWrap}>
                  <Image
                    src="/icons/tata-tertib-icon.png"
                    alt="Tata Tertib Umum"
                    width={28}
                    height={28}
                    className={styles.categoryIconImage}
                  />
                </div>
                <p className={styles.categoryTitle}>Tata Tertib Umum</p>
                <p className={styles.categorySub}>Aturan dasar dan umum yang wajib diikuti seluruh santri.</p>
                <div className={styles.categoryImgWrap}>
                  <Image
                    src="/icons/tata-tertib-icon.png"
                    alt="Tata Tertib Umum"
                    width={120}
                    height={105}
                    className={styles.categoryImg}
                  />
                </div>
                <span className={styles.categoryChevron} style={{ color: '#16a34a', left: '1.5rem' }}>
                  <IconChevronRight size={14} />
                </span>
              </button>

              {/* Kewajiban & Ketentuan */}
              <button
                className={styles.categoryCard}
                style={{ 
                  background: 'linear-gradient(160deg, #f0fdf9 0%, #d1fae5 100%)', 
                  borderColor: '#a7f3d0',
                  padding: '1.2rem 1rem 3.8rem 1.5rem'
                }}
                onClick={() => selectCategory('kewajiban')}
              >
                <div className={styles.categoryIconWrap}>
                  <IconShieldCheck color="#059669" size={24} />
                </div>
                <p className={styles.categoryTitle}>Kewajiban & Ketentuan</p>
                <p className={styles.categorySub}>Kewajiban santri dalam menjalankan kegiatan di pondok.</p>
                <div className={styles.categoryImgWrap}>
                  <Image
                    src="/image/kewajiban.png"
                    alt="Kewajiban & Ketentuan"
                    width={120}
                    height={105}
                    className={styles.categoryImg}
                  />
                </div>
                <span className={styles.categoryChevron} style={{ color: '#059669', left: '1.5rem' }}>
                  <IconChevronRight size={14} />
                </span>
              </button>

              {/* Larangan & Pelanggaran */}
              <button
                className={styles.categoryCard}
                style={{ 
                  background: 'linear-gradient(160deg, #fffbeb 0%, #fef3c7 100%)', 
                  borderColor: '#fde68a',
                  padding: '1.2rem 1rem 3.8rem 1.5rem'
                }}
                onClick={() => selectCategory('larangan')}
              >
                <div className={styles.categoryIconWrap}>
                  <IconAlertTriangle color="#dc2626" size={24} />
                </div>
                <p className={styles.categoryTitle}>Larangan & Pelanggaran</p>
                <p className={styles.categorySub}>Pelanggaran yang tidak boleh dilakukan santri di lingkungan pondok.</p>
                <div className={styles.categoryImgWrap}>
                  <Image
                    src="/icons/icon penting.png"
                    alt="Larangan & Pelanggaran"
                    width={120}
                    height={105}
                    className={styles.categoryImg}
                  />
                </div>
                <span className={styles.categoryChevron} style={{ color: '#dc2626', left: '1.5rem' }}>
                  <IconChevronRight size={14} />
                </span>
              </button>

              {/* Sanksi & Hukuman */}
              <button
                className={styles.categoryCard}
                style={{ 
                  background: 'linear-gradient(160deg, #faf5ff 0%, #ede9fe 100%)', 
                  borderColor: '#ddd6fe',
                  padding: '1.2rem 1rem 3.8rem 1.5rem'
                }}
                onClick={() => selectCategory('sanksi')}
              >
                <div className={styles.categoryIconWrap}>
                  <IconGavel color="#7c3aed" size={24} />
                </div>
                <p className={styles.categoryTitle}>Sanksi & Hukuman</p>
                <p className={styles.categorySub}>Jenis pelanggaran dan sanksi sesuai tingkat pelanggaran.</p>
                <div className={styles.categoryImgWrap}>
                  <Image
                    src="/image/icon hakim.png"
                    alt="Sanksi & Hukuman"
                    width={120}
                    height={105}
                    className={styles.categoryImg}
                  />
                </div>
                <span className={styles.categoryChevron} style={{ color: '#7c3aed', left: '1.5rem' }}>
                  <IconChevronRight size={14} />
                </span>
              </button>
            </div>

            <div className={styles.ringkasanHeader}>
              <p className={styles.sectionLabelTitle} style={{ margin: 0 }}>Ringkasan Peraturan</p>
              <button className={styles.ringkasanLink} onClick={() => selectCategory('lengkap')}>
                Lihat Semua
              </button>
            </div>

            <div className={styles.ringkasanList}>
              <button className={styles.ringkasanRow} onClick={() => selectCategory('tata-tertib')}>
                <div className={styles.ringkasanIconWrap}>
                  <Image
                    src="/icons/tata-tertib-icon.png"
                    alt="Tata Tertib"
                    width={24}
                    height={24}
                    className={styles.ringkasanIconImage}
                  />
                </div>
                <div className={styles.ringkasanBody}>
                  <p className={styles.ringkasanTitle}>BAB I — Ketentuan Umum</p>
                  <p className={styles.ringkasanDesc}>Aturan dasar dan umum yang berlaku.</p>
                </div>
                <span className={styles.ringkasanPill} style={{ background: '#dcfce7', color: '#166534' }}>
                  2 Pasal
                </span>
                <span className={styles.ringkasanChevron}><IconChevronRight size={15} /></span>
              </button>

              <button className={styles.ringkasanRow} onClick={() => selectCategory('kewajiban')}>
                <div className={styles.ringkasanIconWrap}>
                  <IconShieldCheck color="#059669" size={20} />
                </div>
                <div className={styles.ringkasanBody}>
                  <p className={styles.ringkasanTitle}>BAB II — Kewajiban Santri</p>
                  <p className={styles.ringkasanDesc}>Kewajiban santri dalam keseluruhan.</p>
                </div>
                <span className={styles.ringkasanPill} style={{ background: '#d1fae5', color: '#065f46' }}>
                  5 Pasal
                </span>
                <span className={styles.ringkasanChevron}><IconChevronRight size={15} /></span>
              </button>

              <button className={styles.ringkasanRow} onClick={() => selectCategory('larangan')}>
                <div className={styles.ringkasanIconWrap}>
                  <IconAlertTriangle color="#dc2626" size={20} />
                </div>
                <div className={styles.ringkasanBody}>
                  <p className={styles.ringkasanTitle}>BAB III — Pelanggaran</p>
                  <p className={styles.ringkasanDesc}>Pelanggaran yang tidak boleh dilakukan.</p>
                </div>
                <span className={styles.ringkasanPill} style={{ background: '#fee2e2', color: '#991b1b' }}>
                  5 Pasal
                </span>
                <span className={styles.ringkasanChevron}><IconChevronRight size={15} /></span>
              </button>

              <button className={styles.ringkasanRow} onClick={() => selectCategory('sanksi')}>
                <div className={styles.ringkasanIconWrap}>
                  <IconGavel color="#7c3aed" size={20} />
                </div>
                <div className={styles.ringkasanBody}>
                  <p className={styles.ringkasanTitle}>BAB IV — Sanksi & Pelaksanaan</p>
                  <p className={styles.ringkasanDesc}>Jenis pelanggaran dan sanksi yang diterapkan.</p>
                </div>
                <span className={styles.ringkasanPill} style={{ background: '#ede9fe', color: '#5b21b6' }}>
                  4 Pasal
                </span>
                <span className={styles.ringkasanChevron}><IconChevronRight size={15} /></span>
              </button>

              <button className={styles.ringkasanRow} onClick={() => selectCategory('lain')}>
                <div className={styles.ringkasanIconWrap}>
                  <IconScroll color="#0d9488" size={20} />
                </div>
                <div className={styles.ringkasanBody}>
                  <p className={styles.ringkasanTitle}>BAB V & VI — Ketentuan Lain</p>
                  <p className={styles.ringkasanDesc}>Tujuan tata tertib serta aturan tambahan.</p>
                </div>
                <span className={styles.ringkasanPill} style={{ background: '#ccfbf1', color: '#115e59' }}>
                  3 Pasal
                </span>
                <span className={styles.ringkasanChevron}><IconChevronRight size={15} /></span>
              </button>

              <button className={styles.ringkasanRow} onClick={() => selectCategory('wali-santri')}>
                <div className={styles.ringkasanIconWrap}>
                  <IconUsers color="#2563eb" size={20} />
                </div>
                <div className={styles.ringkasanBody}>
                  <p className={styles.ringkasanTitle}>Lampiran — Wali Santri & Lainnya</p>
                  <p className={styles.ringkasanDesc}>Ketentuan dan etika bersama wali santri.</p>
                </div>
                <span className={styles.ringkasanPill} style={{ background: '#dbeafe', color: '#1e40af' }}>
                  2 Pasal
                </span>
                <span className={styles.ringkasanChevron}><IconChevronRight size={15} /></span>
              </button>
            </div>
          </>
        )}

        {!isSemua && !isLengkap && activeCategory && (
          <>
            <button className={styles.backToSummary} onClick={() => selectCategory('semua')}>
              <IconArrowLeft size={14} /> Kembali ke Ringkasan
            </button>
            <CategoryDetail category={activeCategory} expandedKey={expandedKey} toggle={toggle} />
          </>
        )}

        {isLengkap && (
          <>
            <button className={styles.backToSummary} onClick={() => selectCategory('semua')}>
              <IconArrowLeft size={14} /> Kembali ke Ringkasan
            </button>
            {CATEGORIES.map((cat) => (
              <CategoryDetail key={cat.id} category={cat} expandedKey={expandedKey} toggle={toggle} />
            ))}
          </>
        )}

        {/* ── Footer Note ─────────────────────────────────────────────── */}
        <div className={styles.footerNote}>
          <IconInfo />
          <p>
            Tata tertib ini berlaku sejak ditetapkan pada 12 Maret 2026 dan mengikat seluruh santri
            Pondok Pesantren Al-Istiqomah. Ketidaktahuan tidak dapat dijadikan alasan pelanggaran.
          </p>
        </div>

      </div>

      {/* ══ BOTTOM NAV ══════════════════════════════════════════════════ */}
      <nav className={styles.bottomNav}>
        <Link href="/siswa" className={styles.navItem}>
          <div className={styles.navIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          <span>Beranda</span>
        </Link>
        <Link href="/siswa/pendaftaran" className={styles.navItem}>
          <div className={styles.navIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <span>Daftar</span>
        </Link>
        <Link href="/siswa/pembayaran" className={styles.navItem}>
          <div className={styles.navIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <span>Bayar</span>
        </Link>
        <Link href="/siswa/status" className={styles.navItem}>
          <div className={styles.navIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <span>Status</span>
        </Link>
        <Link href="/siswa/more" className={`${styles.navItem} ${styles.navItemActive}`}>
          <div className={`${styles.navIconWrap} ${styles.navIconWrapActive}`}>
            <IconGrid color="#15803d" size={18} />
          </div>
          <span>More</span>
        </Link>
      </nav>

    </div>
  )
}