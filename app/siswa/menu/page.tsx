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
        icon:    '/image/icon formulir.jpg',
        title:   'Formulir',
        sub:     'Isi & edit data diri',
        iconBg:  '#dbeafe',
        isImage: true,
      },
      {
        href:    '/siswa/berkas',
        icon:    '/image/icon berkas.jpg',
        title:   'Berkas',
        sub:     'Upload dokumen persyaratan',
        iconBg:  '#fef3c7',
        isImage: true,
      },
      {
        href:    '/siswa/status',
        icon:    '/image/icon status.webp',
        title:   'Status',
        sub:     'Pantau seleksi pendaftaran',
        iconBg:  '#dcfce7',
        isImage: true,
      },
    ],
  },
  {
    category: 'Keuangan',
    items: [
      {
        href:    '/siswa/pembayaran',
        icon:    '/image/icon dompet.png',
        title:   'Pembayaran',
        sub:     'Biaya pendaftaran santri',
        iconBg:  '#ede9fe',
        isImage: true,
      },
    ],
  },
  {
    category: 'Informasi',
    items: [
      {
        href:    '/siswa/pengumuman',
        icon:    '/image/icon pengumuman.png',
        title:   'Pengumuman',
        sub:     'Info & berita terbaru',
        iconBg:  '#ffe4e6',
        isImage: true,
      },
      {
        href:    '/siswa/jadwal',
        icon:    '/image/jadwal.jpg',
        title:   'Jadwal',
        sub:     'Jadwal kegiatan santri',
        iconBg:  '#e0f2fe',
        isImage: true,
      },
      {
        href:    '/siswa/laporan',
        icon:    '/image/laporan.jpg',
        title:   'Laporan',
        sub:     'Laporan pendaftaran',
        iconBg:  '#fef9c3',
        isImage: true,
      },
    ],
  },
  {
    category: 'Akun',
    items: [
      {
        href:    '/siswa/profile',
        icon:    '/image/icon santri.png',
        title:   'Profil',
        sub:     'Data & pengaturan akun',
        iconBg:  '#f1f5f9',
        isImage: true,
      },
      {
        href:    '/siswa/bantuan',
        icon:    '/image/bantuan.jpg',
        title:   'Bantuan',
        sub:     'Pusat bantuan & FAQ',
        iconBg:  '#cffafe',
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

        {/* Masjid silhouette */}
        <div style={s.masjidWrap}>
          <Image
            src="/image/ilustrasi masjid.png"
            alt=""
            width={180}
            height={110}
            style={s.masjidImg}
            priority
          />
        </div>

        {/* Bell icon top right */}
        <div style={s.bellWrap}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>

        <div style={s.headerInner}>
          {/* Back button */}
          <Link href="/siswa/dashboard" style={s.backBtn} aria-label="Kembali">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>

          {/* Texts */}
          <div>
            <p style={s.headerGreet}>Halo, {fullName} 👋</p>
            <h1 style={s.headerTitle}>Semua Menu</h1>
            <p style={s.headerSub}>Kelola semua aktivitas santri dengan mudah</p>
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
                    {/* Icon box */}
                    <div style={{ ...s.iconBox, background: item.iconBg }}>
                      <Image
                        src={item.icon}
                        alt={item.title}
                        width={26}
                        height={26}
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
        <Link href="/siswa/dashboard" style={s.navItemActive}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
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
        <Link href="/siswa/pembayaran" style={s.navItem}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  fontFamily:     "'Plus Jakarta Sans', sans-serif",
}

const s: Record<string, React.CSSProperties> = {
  shell: {
    fontFamily:     "'Plus Jakarta Sans', sans-serif",
    background:     '#f0f4ff',
    minHeight:      '100vh',
    paddingBottom:  '5.5rem',
  },

  /* ── Header ── */
  header: {
    position:   'relative',
    overflow:   'hidden',
    background: 'linear-gradient(135deg, #0f2c8f 0%, #1e40af 35%, #2563eb 65%, #1d4ed8 100%)',
    padding:    '3rem 1.25rem 2.5rem',
  },
  orbA: {
    position:      'absolute',
    borderRadius:  '50%',
    filter:        'blur(55px)',
    opacity:       0.2,
    width:         220,
    height:        220,
    background:    '#93c5fd',
    top:           -70,
    right:         -60,
    pointerEvents: 'none',
  },
  orbB: {
    position:      'absolute',
    borderRadius:  '50%',
    filter:        'blur(50px)',
    opacity:       0.15,
    width:         160,
    height:        160,
    background:    '#818cf8',
    bottom:        -50,
    left:          -40,
    pointerEvents: 'none',
  },
  masjidWrap: {
    position:      'absolute',
    right:         0,
    bottom:        0,
    opacity:       0.18,
    pointerEvents: 'none',
    zIndex:        1,
  },
  masjidImg: {
    objectFit: 'contain' as const,
  },
  bellWrap: {
    position:        'absolute',
    top:             '3rem',
    right:           '1.25rem',
    zIndex:          3,
    width:           38,
    height:          38,
    background:      'rgba(255,255,255,0.15)',
    borderRadius:    '50%',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    backdropFilter:  'blur(4px)',
  },
  headerInner: {
    position:   'relative',
    zIndex:     2,
    display:    'flex',
    alignItems: 'flex-start',
    gap:        '0.875rem',
    marginTop:  '0.25rem',
  },
  backBtn: {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    width:           36,
    height:          36,
    background:      'rgba(255,255,255,0.15)',
    borderRadius:    '50%',
    flexShrink:      0,
    backdropFilter:  'blur(4px)',
    marginTop:       '0.2rem',
    textDecoration:  'none',
  },
  headerGreet: {
    margin:      0,
    fontSize:    '0.82rem',
    color:       'rgba(255,255,255,0.75)',
    fontWeight:  500,
    fontFamily:  "'Plus Jakarta Sans', sans-serif",
  },
  headerTitle: {
    margin:         '0.2rem 0 0',
    fontSize:       '1.75rem',
    fontWeight:     800,
    color:          'white',
    letterSpacing:  '-0.03em',
    lineHeight:     1.1,
    fontFamily:     "'Plus Jakarta Sans', sans-serif",
  },
  headerSub: {
    margin:     '0.35rem 0 0',
    fontSize:   '0.72rem',
    color:      'rgba(255,255,255,0.6)',
    fontWeight: 400,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  /* ── Content ── */
  content: {
    padding:       '1.25rem 1rem',
    display:       'flex',
    flexDirection: 'column',
    gap:           '1.25rem',
  },
  group: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '0.5rem',
  },
  groupLabel: {
    margin:          0,
    fontSize:        '0.72rem',
    fontWeight:      700,
    color:           '#94a3b8',
    letterSpacing:   '0.07em',
    textTransform:   'uppercase' as const,
    paddingLeft:     '0.25rem',
    fontFamily:      "'Plus Jakarta Sans', sans-serif",
  },

  /* List card container */
  listCard: {
    background:   'white',
    borderRadius: '1.25rem',
    overflow:     'hidden',
    boxShadow:    '0 2px 12px rgba(14,30,100,0.07), 0 1px 3px rgba(14,30,100,0.04)',
    border:       '1px solid rgba(226,232,240,0.8)',
  },

  /* Each row */
  row: {
    display:        'flex',
    alignItems:     'center',
    gap:            '0.875rem',
    padding:        '0.95rem 1rem',
    textDecoration: 'none',
    background:     'white',
    transition:     'background 0.15s',
  },

  /* Icon box */
  iconBox: {
    width:           44,
    height:          44,
    borderRadius:    '0.75rem',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  iconImg: {
    objectFit:    'contain' as const,
    borderRadius: '0.4rem',
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
    fontSize:   '0.9rem',
    fontWeight: 700,
    color:      '#0f172a',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  rowSub: {
    margin:     0,
    fontSize:   '0.72rem',
    fontWeight: 500,
    color:      '#94a3b8',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  /* Divider between rows */
  divider: {
    height:     1,
    background: '#f1f5f9',
    marginLeft: '4.5rem', // align with text, skip icon area
  },

  /* ── Bottom nav ── */
  bottomNav: {
    position:        'fixed',
    bottom:          0,
    left:            0,
    right:           0,
    zIndex:          100,
    background:      'white',
    borderTop:       '1px solid #e8eef8',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-around',
    padding:         '0.6rem 0 0.85rem',
    boxShadow:       '0 -4px 20px rgba(30,58,138,0.07)',
  },
  navItem: {
    ...navBase,
    color: '#94a3b8',
  },
  navItemActive: {
    ...navBase,
    color: '#2563eb',
  },
}