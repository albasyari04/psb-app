import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ── Menu data ─────────────────────────────────────────────────────────────────
const ALL_MENUS = [
  {
    category: 'Pendaftaran',
    items: [
      {
        href:    '/siswa/pendaftaran',
        icon:    '/icons/formulir icon.png',
        title:   'Formulir',
        sub:     'Isi & edit data diri',
        isImage: true,
      },
      {
        href:    '/siswa/berkas',
        icon:    '/icons/berkas icon.png',
        title:   'Berkas',
        sub:     'Upload dokumen persyaratan',
        isImage: true,
      },
      {
        href:    '/siswa/status',
        icon:    '/icons/status icon.png',
        title:   'Status',
        sub:     'Pantau seleksi pendaftaran',
        isImage: true,
      },
    ],
  },
  {
    category: 'Keuangan',
    items: [
      {
        href:    '/siswa/pembayaran',
        icon:    '/icons/pembayaran icon.png',
        title:   'Pembayaran',
        sub:     'Biaya pendaftaran santri',
        isImage: true,
      },
    ],
  },
  {
    category: 'Informasi',
    items: [
      {
        href:    '/siswa/pengumuman',
        icon:    '/icons/pengumuman icon.png',
        title:   'Pengumuman',
        sub:     'Info & berita terbaru',
        isImage: true,
      },
      {
        href:    '/siswa/jadwal',
        icon:    '/icons/jadwal icon.png',
        title:   'Jadwal',
        sub:     'Jadwal kegiatan santri',
        isImage: true,
      },
      {
        href:    '/siswa/laporan',
        icon:    '/icons/laporan icon.png',
        title:   'Laporan',
        sub:     'Laporan pendaftaran',
        isImage: true,
      },
    ],
  },
  {
    category: 'Akun',
    items: [
      {
        href:    '/siswa/profile',
        icon:    '/icons/profil icon.png',
        title:   'Profil',
        sub:     'Data & pengaturan akun',
        isImage: true,
      },
      {
        href:    '/siswa/bantuan',
        icon:    '/image/bantuan.jpg',
        title:   'Bantuan',
        sub:     'Pusat bantuan & FAQ',
        isImage: true,
      },
    ],
  },
]

export default async function MenuPage() {
  const session  = await getServerSession(authOptions)
  const fullName = session?.user?.name ?? 'Siswa'

  return (
    <div style={s.shell}>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div style={s.header}>
        <div style={s.orbA} />
        <div style={s.orbB} />
        <div style={s.orbC} />

        <div style={s.headerInner}>
          {/* Text and Icon - tanpa back button */}
          <div style={s.headerContent}>
            <div style={s.headerLeft}>
              <h1 style={s.headerTitle}>Semua Menu</h1>
              <p style={s.headerSub}>Pilih menu berikut dengan mudah!</p>
            </div>
            <Image
              src="/icons/menu icon.png"
              alt="Menu Icon"
              width={80}
              height={80}
              style={s.headerIcon}
              priority
            />
          </div>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <div style={s.content}>
        {ALL_MENUS.map((group, gi) => (
          <div key={group.category} style={{ ...s.group, marginTop: gi === 0 ? 0 : undefined }}>

            {/* Category label */}
            <p style={s.groupLabel}>{group.category}</p>

            {/* Card list */}
            <div style={s.listCard}>
              {group.items.map((item, idx) => (
                <div key={item.href}>
                  <Link href={item.href} style={s.row}>
                    {/* Icon - tanpa background/wrapper */}
                    <div style={s.iconWrapper}>
                      <Image
                        src={item.icon}
                        alt={item.title}
                        width={32}
                        height={32}
                        style={s.iconImg}
                      />
                    </div>

                    {/* Text */}
                    <div style={s.rowText}>
                      <p style={s.rowTitle}>{item.title}</p>
                      <p style={s.rowSub}>{item.sub}</p>
                    </div>

                    {/* Chevron */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>

                  {/* Divider — skip last item */}
                  {idx < group.items.length - 1 && (
                    <div style={s.divider} />
                  )}
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

      {/* ── BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav style={s.bottomNav}>
        <Link href="/siswa/dashboard" style={s.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>Beranda</span>
        </Link>
        <Link href="/siswa/pendaftaran" style={s.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span>Daftar</span>
        </Link>
        <Link href="/siswa/pembayaran" style={s.navItemActive}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span>Bayar</span>
        </Link>
        <Link href="/siswa/status" style={s.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>Status</span>
        </Link>
        <Link href="/siswa/profile" style={s.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Profil</span>
        </Link>
      </nav>

    </div>
  )
}

// ── Inline styles ─────────────────────────────────────────────────────────────
const navBase: React.CSSProperties = {
  display:        'flex',
  flexDirection:  'column',
  alignItems:     'center',
  gap:            '0.22rem',
  textDecoration: 'none',
  fontSize:       '0.63rem',
  fontWeight:     600,
  padding:        '0 0.5rem',
  fontFamily:     "'Inter', 'Plus Jakarta Sans', sans-serif",
}

const s: Record<string, React.CSSProperties> = {
  shell: {
    fontFamily:     "'Inter', 'Plus Jakarta Sans', sans-serif",
    background:     '#f8faff',
    minHeight:      '100vh',
    paddingBottom:  '5.5rem',
  },

  /* ── Header ── */
  header: {
    position:   'relative',
    overflow:   'hidden',
    background: 'linear-gradient(145deg, #0a1e6b 0%, #1a3a9a 35%, #2563eb 70%, #3b82f6 100%)',
    padding:    '2.5rem 1.25rem 3rem',
    boxShadow:  '0 4px 20px rgba(37, 99, 235, 0.15)',
  },
  orbA: {
    position:      'absolute',
    borderRadius:  '50%',
    filter:        'blur(80px)',
    opacity:       0.25,
    width:         300,
    height:        300,
    background:    '#93c5fd',
    top:           -120,
    right:         -80,
    pointerEvents: 'none',
  },
  orbB: {
    position:      'absolute',
    borderRadius:  '50%',
    filter:        'blur(70px)',
    opacity:       0.15,
    width:         200,
    height:        200,
    background:    '#818cf8',
    bottom:        -60,
    left:          -50,
    pointerEvents: 'none',
  },
  orbC: {
    position:      'absolute',
    borderRadius:  '50%',
    filter:        'blur(50px)',
    opacity:       0.1,
    width:         150,
    height:        150,
    background:    '#a78bfa',
    top:           40,
    left:          '30%',
    pointerEvents: 'none',
  },
  headerInner: {
    position:   'relative',
    zIndex:     2,
    display:    'flex',
    alignItems: 'center',
    paddingLeft: '0.25rem',
  },
  headerContent: {
    flex:           1,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            '1rem',
    minWidth:       0,
  },
  headerLeft: {
    flex:           1,
    minWidth:       0,
  },
  headerTitle: {
    margin:         '0.2rem 0 0',
    fontSize:       '1.8rem',
    fontWeight:     800,
    color:          'white',
    letterSpacing:  '-0.03em',
    lineHeight:     1.1,
    fontFamily:     "'Inter', 'Plus Jakarta Sans', sans-serif",
    textShadow:     '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerSub: {
    margin:     '0.35rem 0 0',
    fontSize:   '0.75rem',
    color:      'rgba(255,255,255,0.7)',
    fontWeight: 400,
    fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    letterSpacing: '0.01em',
  },
  headerIcon: {
    width:      80,
    height:     80,
    objectFit:  'contain' as const,
    flexShrink: 0,
    filter:     'brightness(0) invert(1)',
  },

  /* ── Content ── */
  content: {
    padding:       '1.5rem 1rem',
    display:       'flex',
    flexDirection: 'column',
    gap:           '1.5rem',
    marginTop:     '-0.5rem',
  },
  group: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.6rem',
  },
  groupLabel: {
    margin:          0,
    fontSize:        '0.7rem',
    fontWeight:      700,
    color:           '#94a3b8',
    letterSpacing:   '0.08em',
    textTransform:   'uppercase' as const,
    paddingLeft:     '0.35rem',
    fontFamily:      "'Inter', 'Plus Jakarta Sans', sans-serif",
  },

  /* List card container */
  listCard: {
    background:   'white',
    borderRadius: '1.25rem',
    overflow:     'hidden',
    boxShadow:    '0 4px 20px rgba(14,30,100,0.06), 0 1px 6px rgba(14,30,100,0.03)',
    border:       '1px solid rgba(226,232,240,0.6)',
    transition:   'all 0.2s ease',
  },

  /* Each row */
  row: {
    display:        'flex',
    alignItems:     'center',
    gap:            '0.875rem',
    padding:        '1rem 1.25rem',
    textDecoration: 'none',
    background:     'white',
    transition:     'all 0.15s ease',
    cursor:         'pointer',
  },

  /* Icon wrapper - tanpa background/border/shadow */
  iconWrapper: {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    width:           36,
    height:          36,
  },
  iconImg: {
    objectFit:    'contain' as const,
    width:        32,
    height:       32,
  },

  /* Row text */
  rowText: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.1rem',
    minWidth:      0,
  },
  rowTitle: {
    margin:     0,
    fontSize:   '0.92rem',
    fontWeight: 700,
    color:      '#0a1e3c',
    fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    letterSpacing: '-0.01em',
  },
  rowSub: {
    margin:     0,
    fontSize:   '0.72rem',
    fontWeight: 500,
    color:      '#94a3b8',
    fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
  },

  /* Divider between rows */
  divider: {
    height:     1,
    background: 'linear-gradient(to right, #f1f5f9 20%, #e2e8f0 50%, #f1f5f9 80%)',
    marginLeft: '4.5rem',
  },

  /* ── Bottom nav ── */
  bottomNav: {
    position:        'fixed',
    bottom:          0,
    left:            0,
    right:           0,
    zIndex:          100,
    background:      'rgba(255,255,255,0.92)',
    backdropFilter:  'blur(20px)',
    borderTop:       '1px solid rgba(226,232,240,0.5)',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-around',
    padding:         '0.5rem 0 0.85rem',
    boxShadow:       '0 -8px 32px rgba(30,58,138,0.06)',
  },
  navItem: {
    ...navBase,
    color: '#94a3b8',
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    ...navBase,
    color: '#2563eb',
    position: 'relative',
  },
}