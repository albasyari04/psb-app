'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/siswa/dashboard', icon: '🏠', label: 'Beranda' },
  { href: '/siswa/pendaftaran', icon: '📝', label: 'Daftar' },
  { href: '/siswa/status', icon: '📊', label: 'Status' },
  { href: '/siswa/profile', icon: '👤', label: 'Profil' },
]

export default function SiswaBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-107.5 border-t border-slate-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-1.5 transition-all ${isActive ? 'bg-blue-100' : ''}`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span
                className={`text-xs font-semibold ${isActive ? 'text-blue-800' : 'text-slate-400'}`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}