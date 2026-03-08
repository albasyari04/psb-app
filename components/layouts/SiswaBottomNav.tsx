'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/siswa/dashboard',
    label: 'Beranda',
    color: '#2563eb',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          fill={active ? '#2563eb' : 'none'}
          stroke={active ? '#2563eb' : '#94a3b8'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/siswa/pendaftaran',
    label: 'Daftar',
    color: '#4f46e5',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2.5"
          fill={active ? '#4f46e5' : 'none'}
          stroke={active ? '#4f46e5' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path d="M8 8H16M8 12H16M8 16H12"
          stroke={active ? '#ffffff' : '#94a3b8'}
          strokeWidth="1.6" strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/siswa/status',
    label: 'Status',
    color: '#059669',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3"
          fill={active ? '#059669' : 'none'}
          stroke={active ? '#059669' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path d="M7 16L10 12L13 14L17 9"
          stroke={active ? '#ffffff' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/siswa/profile',
    label: 'Profil',
    color: '#d97706',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4"
          fill={active ? '#d97706' : 'none'}
          stroke={active ? '#d97706' : '#94a3b8'}
          strokeWidth="1.8"
        />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
          stroke={active ? '#d97706' : '#94a3b8'}
          strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function SiswaBottomNav() {
  const pathname = usePathname()

  return (
    <>
      <div className="h-20" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-107.5">
        <div className="absolute inset-0 bg-white/85 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(15,23,42,0.10)]" />
        <div className="relative flex items-center justify-around px-2 pt-2 pb-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-1"
                style={{ minWidth: 60 }}
              >
                <span
                  className="relative flex items-center justify-center w-12 h-10 rounded-2xl transition-all duration-200"
                  style={isActive ? { backgroundColor: `${item.color}18` } : {}}
                >
                  {isActive && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  {item.icon(isActive)}
                </span>
                <span className="text-[10.5px] font-bold tracking-wide transition-colors duration-200"
                  style={{ color: isActive ? item.color : '#94a3b8' }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}