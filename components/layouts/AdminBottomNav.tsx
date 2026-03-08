'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    color: '#7c3aed',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2"
          fill={active ? '#7c3aed' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="1.8"
        />
        <rect x="13" y="3" width="8" height="8" rx="2"
          fill={active ? '#a78bfa' : 'none'}
          stroke={active ? '#a78bfa' : '#94a3b8'} strokeWidth="1.8"
        />
        <rect x="3" y="13" width="8" height="8" rx="2"
          fill={active ? '#a78bfa' : 'none'}
          stroke={active ? '#a78bfa' : '#94a3b8'} strokeWidth="1.8"
        />
        <rect x="13" y="13" width="8" height="8" rx="2"
          fill={active ? '#6d28d9' : 'none'}
          stroke={active ? '#6d28d9' : '#94a3b8'} strokeWidth="1.8"
        />
      </svg>
    ),
  },
  {
    href: '/admin/pendaftar',
    label: 'Pendaftar',
    color: '#7c3aed',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3.5"
          fill={active ? '#7c3aed' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="1.8"
        />
        <path d="M2 20C2 16.134 5.13401 13 9 13H11"
          stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round"
        />
        <path d="M17 14V20M14 17H20"
          stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/admin/verifikasi',
    label: 'Verifikasi',
    color: '#d97706',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L13.8 8.2H19.2L14.7 11.5L16.5 16.7L12 13.4L7.5 16.7L9.3 11.5L4.8 8.2H10.2L12 3Z"
          fill={active ? '#d97706' : 'none'}
          stroke={active ? '#d97706' : '#94a3b8'} strokeWidth="1.8" strokeLinejoin="round"
        />
        <circle cx="18" cy="18" r="4"
          fill={active ? '#10b981' : 'none'}
          stroke={active ? '#10b981' : '#94a3b8'} strokeWidth="1.8"
        />
        <path d="M16 18L17.5 19.5L20 17"
          stroke={active ? 'white' : 'none'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/admin/profile',
    label: 'Admin',
    color: '#7c3aed',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5"
          fill={active ? '#7c3aed' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="1.8"
        />
        <path d="M4 20C4 16.134 7.58172 14 12 14C16.4183 14 20 16.134 20 20"
          stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round"
        />
        <path d="M18 9L19.5 10V12.5C19.5 13.5 18 14.5 18 14.5C18 14.5 16.5 13.5 16.5 12.5V10L18 9Z"
          fill={active ? '#7c3aed' : 'none'}
          stroke={active ? '#7c3aed' : '#94a3b8'} strokeWidth="1.4"
        />
      </svg>
    ),
  },
]

export default function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <>
      <div className="h-20" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-107.5">
        <div className="absolute inset-0 bg-white/85 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(15,23,42,0.10)]" />
        <div className="relative flex items-center justify-around px-2 pt-2 pb-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
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