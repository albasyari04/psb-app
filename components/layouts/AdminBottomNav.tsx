'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/pendaftar', icon: '📋', label: 'Pendaftar' },
  { href: '/admin/verifikasi', icon: '⚡', label: 'Verifikasi' },
  { href: '/admin/profile', icon: '⚙️', label: 'Admin' },
]

export default function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-107.5 mx-auto z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(item => {
          // startsWith digunakan agar /admin/pendaftar/[id] tetap highlight menu Pendaftar
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${isActive ? 'bg-violet-100' : ''}`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span
                className={`text-xs font-semibold ${isActive ? 'text-violet-600' : 'text-slate-400'}`}
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