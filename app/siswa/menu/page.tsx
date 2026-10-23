'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSettings } from '@/contexts/SettingsContext'

/* ════════════════════════════════════════════════════════════════
   LOKASI FILE ICON
   Icon dibaca dari public/icons/ dengan nama file asli Anda:

   formulir-santri.png      → icon form + pulpen
   berkas.png               → icon laci arsip
   status-santri.png        → icon badge centang
   pembayran-santri.png     → icon kartu + perisai centang
   chat-santri.png          → icon dua gelembung chat
   pengumuman.png           → icon toa / megaphone
   jadwal-santri.png        → icon kalender
   laporan-santri (2).png   → icon notepad checklist + pensil
   profile-santri.png       → icon user bulat
   bantuan.png              → icon kotak di atas tangan
   ════════════════════════════════════════════════════════════════ */
/* File icon baru ada langsung di public/icons/ (bukan di subfolder).
   Tiap icon punya beberapa kandidat nama file; komponen akan mencoba
   satu per satu sampai ada yang ketemu. Jadi nama seperti
   "status.png" atau "status-removebg-preview.png" sama-sama bisa. */
const candidates = (...names: string[]): string[] =>
  names.flatMap((n) => [
    encodeURI(`/icons/${n}.png`),
    encodeURI(`/icons/${n}-removebg-preview.png`),
  ])

/* Urutan nama = prioritas. Nama file ASLI di folder Anda ditaruh paling depan
   (formulir-santri.png, status-santri.png, dst). */
const ICON = {
  formulir:   candidates('formulir-santri', 'formulir'),
  berkas:     candidates('berkas'),
  status:     candidates('status-santri', 'status'),
  // di folder Anda tertulis "pembayran-santri.png" (tanpa 'a'); ejaan benar ikut dicoba
  pembayaran: candidates('pembayran-santri', 'pembayaran-santri'),
  chat:       candidates('chat-santri'),
  pengumuman: candidates('pengumuman'),
  jadwal:     candidates('jadwal-santri'),
  laporan:    candidates('laporan-santri (2)'),
  profil:     candidates('profile-santri'),
  bantuan:    candidates('bantuan'),
}

/* Warna "bola 3D" per kategori */
type Tone = { light: string; mid: string; edge: string; shadow: string }

const TONES: Record<string, Tone> = {
  green:  { light: '#d1fae5', mid: '#6ee7b7', edge: '#10b981', shadow: 'rgba(16,185,129,0.38)' },
  gold:   { light: '#fef3c7', mid: '#fcd34d', edge: '#d99a06', shadow: 'rgba(217,154,6,0.38)' },
  blue:   { light: '#dbeafe', mid: '#93c5fd', edge: '#3b82f6', shadow: 'rgba(59,130,246,0.38)' },
  purple: { light: '#ede9fe', mid: '#c4b5fd', edge: '#8b5cf6', shadow: 'rgba(139,92,246,0.38)' },
  slate:  { light: '#e2e8f0', mid: '#cbd5e1', edge: '#64748b', shadow: 'rgba(100,116,139,0.38)' },
}

// ── Menu data dengan i18n ─────────────────────────────────────────────────────
const ALL_MENUS = [
  {
    category: { id: 'Pendaftaran', en: 'Registration' },
    tone: 'green',
    items: [
      {
        href:  '/siswa/pendaftaran',
        icon:  ICON.formulir,
        title: { id: 'Formulir', en: 'Form' },
        sub:   { id: 'Isi & edit data diri', en: 'Fill & edit personal data' },
      },
      {
        href:  '/siswa/berkas',
        icon:  ICON.berkas,
        title: { id: 'Berkas', en: 'Documents' },
        sub:   { id: 'Upload dokumen persyaratan', en: 'Upload required documents' },
      },
      {
        href:  '/siswa/status',
        icon:  ICON.status,
        title: { id: 'Status', en: 'Status' },
        sub:   { id: 'Pantau seleksi pendaftaran', en: 'Monitor registration selection' },
      },
    ],
  },
  {
    category: { id: 'Keuangan', en: 'Finance' },
    tone: 'gold',
    items: [
      {
        href:  '/siswa/pembayaran',
        icon:  ICON.pembayaran,
        title: { id: 'Pembayaran', en: 'Payment' },
        sub:   { id: 'Biaya pendaftaran santri', en: 'Student registration fees' },
      },
    ],
  },
  {
    category: { id: 'Obrolan', en: 'Chat' },
    tone: 'blue',
    items: [
      {
        href:  '/siswa/chat',
        icon:  ICON.chat,
        title: { id: 'Chat', en: 'Chat' },
        sub:   { id: 'Chat Admin', en: 'Chat Admin' },
      },
    ],
  },
  {
    category: { id: 'Informasi', en: 'Information' },
    tone: 'purple',
    items: [
      {
        href:  '/siswa/pengumuman',
        icon:  ICON.pengumuman,
        title: { id: 'Pengumuman', en: 'Announcements' },
        sub:   { id: 'Info & berita terbaru', en: 'Latest info & news' },
      },
      {
        href:  '/siswa/jadwal',
        icon:  ICON.jadwal,
        title: { id: 'Jadwal', en: 'Schedule' },
        sub:   { id: 'Jadwal kegiatan santri', en: 'Student activity schedule' },
      },
      {
        href:  '/siswa/laporan',
        icon:  ICON.laporan,
        title: { id: 'Laporan', en: 'Reports' },
        sub:   { id: 'Laporan pendaftaran', en: 'Registration reports' },
      },
    ],
  },
  {
    category: { id: 'Akun', en: 'Account' },
    tone: 'slate',
    items: [
      {
        href:  '/siswa/profile',
        icon:  ICON.profil,
        title: { id: 'Profil', en: 'Profile' },
        sub:   { id: 'Data & pengaturan akun', en: 'Account data & settings' },
      },
      {
        href:  '/siswa/bantuan',
        icon:  ICON.bantuan,
        title: { id: 'Bantuan', en: 'Help' },
        sub:   { id: 'Pusat bantuan & FAQ', en: 'Help center & FAQ' },
      },
    ],
  },
]

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

/* Panah back — sama dengan halaman Pendaftaran (arrow-left) */
const IconBack = ({ color = '#0e7c5f' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const IconChevronRight = ({ color = '#cbd5e1' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

/* ─── Icon 3D dalam kartu bulat ─────────────────────────────────────────────── */
function Icon3D({ src, alt, tone }: { src: string[]; alt: string; tone: Tone }) {
  // undefined = sedang mengecek, string = file yang ketemu, null = tidak ada satupun
  const [resolved, setResolved] = useState<string | null | undefined>(undefined)

  /* Cek kandidat satu per satu di browser (pakai objek Image) SEBELUM
     ditampilkan. Cara ini tidak bergantung pada event onError pada tag
     <img> yang bisa terlewat saat hydration Next.js, sehingga gambar
     rusak tidak pernah tampil. */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      for (const candidate of src) {
        const ok = await new Promise<boolean>((resolve) => {
          const probe = new window.Image()
          probe.onload = () => resolve(true)
          probe.onerror = () => resolve(false)
          probe.src = candidate
        })
        if (cancelled) return
        if (ok) {
          setResolved(candidate)
          return
        }
      }
      if (!cancelled) setResolved(null)
    })()
    return () => {
      cancelled = true
    }
  }, [src])

  return (
    <div
      style={{
        position: 'relative',
        isolation: 'isolate',
        width: 50,
        height: 50,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 32% 26%, #ffffff 0%, ${tone.light} 32%, ${tone.mid} 100%)`,
        border: '2px solid #ffffff',
        boxShadow: [
          `0 8px 16px ${tone.shadow}`,               // bayangan jatuh
          `0 2px 4px rgba(15,23,42,0.10)`,            // bayangan dekat
          `inset 0 -5px 9px ${tone.edge}55`,          // sisi bawah gelap (volume)
          `inset 0 3px 6px rgba(255,255,255,0.95)`,   // sisi atas terang
        ].join(', '),
      }}
    >
      {/* kilau (gloss) di bagian atas */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 3,
          left: '16%',
          width: '68%',
          height: '38%',
          borderRadius: '50%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.75), rgba(255,255,255,0))',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      {resolved === undefined ? null : resolved === null ? (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tone.edge}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={alt}
          width={28}
          height={28}
          style={{
            position: 'relative',
            zIndex: 1,
            width: 28,
            height: 28,
            objectFit: 'contain',
            /* multiply: latar putih/transparan menyatu dengan bola,
               garis hitam tetap tegas */
            mixBlendMode: 'multiply',
          }}
        />
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'

  // ─── Warna tema ────────────────────────────────────────────────────────────
  const bgColor = isDark ? '#15131f' : '#f6f8fa'
  const headerBg = isDark ? '#1e1b2e' : 'rgba(255,255,255,0.95)'
  const headerBorder = isDark ? '1px solid #2e2a40' : '1px solid rgba(226,232,240,0.7)'
  const textColor = isDark ? '#f1f0f5' : '#0a1e3c'
  const mutedColor = '#94a3b8'

  // Tombol back — sama dengan halaman Pendaftaran (hijau muda + panah teal)
  const backBtnBg = isDark ? '#14352b' : '#ecfdf5'
  const backBtnBorder = isDark ? '1px solid #1d4d3d' : '1px solid #dcfce7'
  const backBtnColor = isDark ? '#6ee7b7' : '#0e7c5f'

  const cardBg = isDark ? '#1e1b2e' : '#ffffff'
  const cardBorder = isDark ? '1px solid #2e2a40' : '1px solid rgba(226,232,240,0.7)'
  const cardShadow = isDark
    ? '0 4px 20px rgba(0,0,0,0.3)'
    : '0 4px 20px rgba(14,30,100,0.06), 0 1px 6px rgba(14,30,100,0.03)'
  const rowBg = cardBg
  const rowHoverBg = isDark ? '#2e2a40' : '#f6faf8'
  const dividerBg = isDark
    ? 'linear-gradient(to right, #2e2a40 20%, #3d3655 50%, #2e2a40 80%)'
    : 'linear-gradient(to right, #f1f5f9 20%, #e2e8f0 50%, #f1f5f9 80%)'
  const groupLabelColor = isDark ? '#6b6885' : '#94a3b8'
  const rowTitleColor = isDark ? '#f1f0f5' : '#0a1e3c'
  const rowSubColor = '#94a3b8'

  const getText = (obj: { id: string; en: string }) => (isEn ? obj.en : obj.id)

  const FONT = "'Inter', 'Plus Jakarta Sans', sans-serif"

  return (
    <div
      style={{
        fontFamily: FONT,
        background: bgColor,
        minHeight: '100vh',
        /* ruang untuk bottom navigation bawaan layout */
        paddingBottom: '7rem',
      }}
    >
      {/* ── HEADER (sticky) ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          background: headerBg,
          backdropFilter: 'blur(20px)',
          padding: '0.85rem 1.25rem',
          borderBottom: headerBorder,
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(14,30,100,0.04)',
        }}
      >
        <Link
          href="/siswa/dashboard"
          aria-label={isEn ? 'Back to Home' : 'Kembali ke Beranda'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: backBtnBg,
            border: backBtnBorder,
            textDecoration: 'none',
            color: backBtnColor,
          }}
        >
          <IconBack color={backBtnColor} />
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 800,
              color: textColor,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              fontFamily: FONT,
            }}
          >
            {isEn ? 'All Menus' : 'Semua Menu'}
          </h1>
          <p
            style={{
              margin: '0.15rem 0 0',
              fontSize: '0.72rem',
              color: mutedColor,
              fontWeight: 500,
              fontFamily: FONT,
            }}
          >
            {isEn ? 'Choose your menu easily!' : 'Pilih menu berikut dengan mudah!'}
          </p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div
        style={{
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {ALL_MENUS.map((group) => {
          const tone = TONES[group.tone]
          return (
            <div
              key={group.category.id}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
            >
              {/* Category label */}
              <p
                style={{
                  margin: 0,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: groupLabelColor,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  paddingLeft: '0.35rem',
                  fontFamily: FONT,
                }}
              >
                {getText(group.category)}
              </p>

              {/* Card list */}
              <div
                style={{
                  background: cardBg,
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  boxShadow: cardShadow,
                  border: cardBorder,
                }}
              >
                {group.items.map((item, idx) => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.95rem',
                        padding: '0.9rem 1.15rem',
                        textDecoration: 'none',
                        background: rowBg,
                        transition: 'background 0.15s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = rowHoverBg }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = rowBg }}
                    >
                      {/* Icon 3D dalam kartu bulat */}
                      <Icon3D src={item.icon} alt={getText(item.title)} tone={tone} />

                      {/* Text */}
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.1rem',
                          minWidth: 0,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            color: rowTitleColor,
                            fontFamily: FONT,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {getText(item.title)}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            color: rowSubColor,
                            fontFamily: FONT,
                          }}
                        >
                          {getText(item.sub)}
                        </p>
                      </div>

                      {/* Chevron */}
                      <IconChevronRight color={isDark ? '#6b6885' : '#cbd5e1'} />
                    </Link>

                    {/* Divider */}
                    {idx < group.items.length - 1 && (
                      <div style={{ height: 1, background: dividerBg, marginLeft: '5rem' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}