'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSettings } from '@/contexts/SettingsContext'

// ── Menu data dengan i18n ─────────────────────────────────────────────────────────────────
const ALL_MENUS = [
  {
    category: { id: 'Pendaftaran', en: 'Registration' },
    items: [
      {
        href:    '/siswa/pendaftaran',
        icon:    '/icons/formulir icon.png',
        title:   { id: 'Formulir', en: 'Form' },
        sub:     { id: 'Isi & edit data diri', en: 'Fill & edit personal data' },
        isImage: true,
      },
      {
        href:    '/siswa/berkas',
        icon:    '/icons/berkas icon.png',
        title:   { id: 'Berkas', en: 'Documents' },
        sub:     { id: 'Upload dokumen persyaratan', en: 'Upload required documents' },
        isImage: true,
      },
      {
        href:    '/siswa/status',
        icon:    '/icons/status icon.png',
        title:   { id: 'Status', en: 'Status' },
        sub:     { id: 'Pantau seleksi pendaftaran', en: 'Monitor registration selection' },
        isImage: true,
      },
    ],
  },
  {
    category: { id: 'Keuangan', en: 'Finance' },
    items: [
      {
        href:    '/siswa/pembayaran',
        icon:    '/icons/pembayaran icon.png',
        title:   { id: 'Pembayaran', en: 'Payment' },
        sub:     { id: 'Biaya pendaftaran santri', en: 'Student registration fees' },
        isImage: true,
      },
    ],
  },
  {
    category: { id: 'Obrolan', en: 'Chat' },
    items: [
      {
        href:    '/siswa/chat',
        icon:    '/icons/chat icon.png',
        title:   { id: 'Chat', en: 'Chat' },
        sub:     { id: 'Chat Admin', en: 'Chat Admin' },
        isImage: true,
      },
    ],
  },
  {
    category: { id: 'Informasi', en: 'Information' },
    items: [
      {
        href:    '/siswa/pengumuman',
        icon:    '/icons/pengumuman icon.png',
        title:   { id: 'Pengumuman', en: 'Announcements' },
        sub:     { id: 'Info & berita terbaru', en: 'Latest info & news' },
        isImage: true,
      },
      {
        href:    '/siswa/jadwal',
        icon:    '/icons/jadwal icon.png',
        title:   { id: 'Jadwal', en: 'Schedule' },
        sub:     { id: 'Jadwal kegiatan santri', en: 'Student activity schedule' },
        isImage: true,
      },
      {
        href:    '/siswa/laporan',
        icon:    '/icons/laporan icon.png',
        title:   { id: 'Laporan', en: 'Reports' },
        sub:     { id: 'Laporan pendaftaran', en: 'Registration reports' },
        isImage: true,
      },
    ],
  },
  {
    category: { id: 'Akun', en: 'Account' },
    items: [
      {
        href:    '/siswa/profile',
        icon:    '/icons/profil icon.png',
        title:   { id: 'Profil', en: 'Profile' },
        sub:     { id: 'Data & pengaturan akun', en: 'Account data & settings' },
        isImage: true,
      },
      {
        href:    '/siswa/bantuan',
        icon:    '/icons/bantuan_icon.png',
        title:   { id: 'Bantuan', en: 'Help' },
        sub:     { id: 'Pusat bantuan & FAQ', en: 'Help center & FAQ' },
        isImage: true,
      },
    ],
  },
]

const NAV_ITEMS = [
  { href: '/siswa/dashboard', label: { id: 'Beranda', en: 'Home' }, icon: 'home' },
  { href: '/siswa/pendaftaran', label: { id: 'Daftar', en: 'Register' }, icon: 'register' },
  { href: '/siswa/pembayaran', label: { id: 'Bayar', en: 'Pay' }, icon: 'pay' },
  { href: '/siswa/status', label: { id: 'Status', en: 'Status' }, icon: 'status' },
  { href: '/siswa/profile', label: { id: 'Profil', en: 'Profile' }, icon: 'profile' },
]

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

const IconHome = ({ active = false, color = '#94a3b8' }: { active?: boolean; color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563eb' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
)

const IconRegister = ({ active = false, color = '#94a3b8' }: { active?: boolean; color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563eb' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

const IconPay = ({ active = false, color = '#94a3b8' }: { active?: boolean; color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#2563eb' : 'none'} stroke={active ? '#2563eb' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

const IconStatus = ({ active = false, color = '#94a3b8' }: { active?: boolean; color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563eb' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)

const IconProfile = ({ active = false, color = '#94a3b8' }: { active?: boolean; color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563eb' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const IconChevronLeft = ({ color = '#0a1e3c' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const IconChevronRight = ({ color = '#cbd5e1' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

function getNavIcon(key: string, active: boolean, color: string) {
  const props = { active, color }
  switch (key) {
    case 'home': return <IconHome {...props} />
    case 'register': return <IconRegister {...props} />
    case 'pay': return <IconPay {...props} />
    case 'status': return <IconStatus {...props} />
    case 'profile': return <IconProfile {...props} />
    default: return <IconHome {...props} />
  }
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const { theme, language } = useSettings()
  const isDark = theme === 'dark'
  const isEn = language === 'en'

  // ─── Dark mode colors ──────────────────────────────────────────────────────
  const bgColor = isDark ? '#15131f' : '#f8faff'
  const headerBg = isDark ? '#1e1b2e' : 'rgba(255,255,255,0.95)'
  const headerBorder = isDark ? '1px solid #2e2a40' : '1px solid rgba(226,232,240,0.7)'
  const textColor = isDark ? '#f1f0f5' : '#0a1e3c'
  const mutedColor = isDark ? '#94a3b8' : '#94a3b8'
  const backBtnBg = isDark ? '#2e2a40' : '#f1f5f9'
  const backBtnColor = isDark ? '#a5b4fc' : '#0a1e3c'
  const cardBg = isDark ? '#1e1b2e' : 'white'
  const cardBorder = isDark ? '1px solid #2e2a40' : '1px solid rgba(226,232,240,0.6)'
  const cardShadow = isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(14,30,100,0.06), 0 1px 6px rgba(14,30,100,0.03)'
  const rowBg = isDark ? '#1e1b2e' : 'white'
  const rowHoverBg = isDark ? '#2e2a40' : '#f8faff'
  const dividerBg = isDark ? 'linear-gradient(to right, #2e2a40 20%, #3d3655 50%, #2e2a40 80%)' : 'linear-gradient(to right, #f1f5f9 20%, #e2e8f0 50%, #f1f5f9 80%)'
  const groupLabelColor = isDark ? '#6b6885' : '#94a3b8'
  const rowTitleColor = isDark ? '#f1f0f5' : '#0a1e3c'
  const rowSubColor = isDark ? '#94a3b8' : '#94a3b8'
  const navBg = isDark ? 'rgba(30,27,46,0.92)' : 'rgba(255,255,255,0.92)'
  const navBorder = isDark ? '1px solid #2e2a40' : '1px solid rgba(226,232,240,0.5)'
  const navColor = isDark ? '#6b6885' : '#94a3b8'
  const navActiveColor = isDark ? '#a5b4fc' : '#2563eb'

  // ─── Get localized text ────────────────────────────────────────────────────
  const getText = (obj: { id: string; en: string }) => isEn ? obj.en : obj.id

  return (
    <div style={{ 
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
      background: bgColor,
      minHeight: '100vh',
      paddingBottom: '5.5rem',
    }}>

      {/* ── HEADER (sticky) ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: headerBg,
        backdropFilter: 'blur(20px)',
        padding: '0.85rem 1.25rem',
        borderBottom: headerBorder,
        boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(14,30,100,0.04)',
      }}>
        <Link 
          href="/siswa/dashboard" 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: '0.75rem',
            background: backBtnBg,
            textDecoration: 'none',
            color: backBtnColor,
          }}
        >
          <IconChevronLeft color={backBtnColor} />
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.05rem',
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
          }}>
            {isEn ? 'All Menus' : 'Semua Menu'}
          </h1>
          <p style={{
            margin: '0.15rem 0 0',
            fontSize: '0.72rem',
            color: mutedColor,
            fontWeight: 500,
            fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
          }}>
            {isEn ? 'Choose your menu easily!' : 'Pilih menu berikut dengan mudah!'}
          </p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {ALL_MENUS.map((group, gi) => (
          <div key={getText(group.category)} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            marginTop: gi === 0 ? 0 : undefined,
          }}>

            {/* Category label */}
            <p style={{
              margin: 0,
              fontSize: '0.7rem',
              fontWeight: 700,
              color: groupLabelColor,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              paddingLeft: '0.35rem',
              fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
            }}>
              {getText(group.category)}
            </p>

            {/* Card list */}
            <div style={{
              background: cardBg,
              borderRadius: '1.25rem',
              overflow: 'hidden',
              boxShadow: cardShadow,
              border: cardBorder,
              transition: 'all 0.2s ease',
            }}>
              {group.items.map((item, idx) => (
                <div key={item.href}>
                  <Link 
                    href={item.href} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      padding: '1rem 1.25rem',
                      textDecoration: 'none',
                      background: rowBg,
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = rowHoverBg
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = rowBg
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      width: 36,
                      height: 36,
                    }}>
                      <Image
                        src={item.icon}
                        alt={getText(item.title)}
                        width={32}
                        height={32}
                        style={{
                          objectFit: 'contain' as const,
                          width: 32,
                          height: 32,
                        }}
                      />
                    </div>

                    {/* Text */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.1rem',
                      minWidth: 0,
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: rowTitleColor,
                        fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
                        letterSpacing: '-0.01em',
                      }}>
                        {getText(item.title)}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '0.72rem',
                        fontWeight: 500,
                        color: rowSubColor,
                        fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
                      }}>
                        {getText(item.sub)}
                      </p>
                    </div>

                    {/* Chevron */}
                    <IconChevronRight color={isDark ? '#6b6885' : '#cbd5e1'} />
                  </Link>

                  {/* Divider */}
                  {idx < group.items.length - 1 && (
                    <div style={{
                      height: 1,
                      background: dividerBg,
                      marginLeft: '4.5rem',
                    }} />
                  )}
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: navBg,
        backdropFilter: 'blur(20px)',
        borderTop: navBorder,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0.5rem 0 0.85rem',
        boxShadow: isDark ? '0 -8px 32px rgba(0,0,0,0.3)' : '0 -8px 32px rgba(30,58,138,0.06)',
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/siswa/pembayaran' // Bayar active
          return (
            <Link 
              key={item.href}
              href={item.href} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.22rem',
                textDecoration: 'none',
                fontSize: '0.63rem',
                fontWeight: 600,
                padding: '0 0.5rem',
                fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
                color: isActive ? navActiveColor : navColor,
                transition: 'all 0.2s ease',
                position: isActive ? 'relative' : undefined,
              }}
            >
              {getNavIcon(item.icon, isActive, isActive ? navActiveColor : navColor)}
              <span>{getText(item.label)}</span>
            </Link>
          )
        })}
      </nav>

    </div>
  )
}