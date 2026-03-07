'use client'
// app/siswa/profile/page.tsx
import '@/app/style/siswa.css'
import Image from 'next/image'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [loggingOut, setLoggingOut] = useState(false)

  const user     = session?.user
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="app-shell sp-bg">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div className="sp-hero">
        <div className="sp-hero-grid" />
        <div className="sp-hero-orb-1" />
        <div className="sp-hero-orb-2" />
        <div className="sp-hero-orb-3" />

        <div className="sp-hero-content">

          {/* Avatar */}
          <div className="sp-avatar-ring">
            <div className="sp-avatar">
              {user?.avatar_url ? (
                // ✅ Gunakan Next.js Image agar foto Google tampil
                <Image
                  src={user.avatar_url}
                  alt={user.name ?? 'Avatar'}
                  width={80}
                  height={80}
                  style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }}
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <span className="sp-avatar-initials">{initials}</span>
              )}
            </div>
          </div>

          {/* Name & Info */}
          <div>
            <h2 className="sp-hero-name">{user?.name ?? '-'}</h2>
            <p className="sp-hero-email">{user?.email ?? '-'}</p>
            <div className="sp-hero-badge">
              <div className="sp-hero-badge-dot" />
              SISWA AKTIF
            </div>
          </div>

        </div>
      </div>

      {/* ══ FLOATING STATS STRIP ═════════════════════════════════════════════ */}
      <div className="sp-float-zone">
        <div className="sp-stats-card">
          <div className="sp-stat-item">
            <span className="sp-stat-val">2025</span>
            <span className="sp-stat-label">T.A.</span>
          </div>
          <div className="sp-stat-item">
            <span className="sp-stat-val">SMA</span>
            <span className="sp-stat-label">Jenjang</span>
          </div>
          <div className="sp-stat-item">
            <span className="sp-stat-val">PSB</span>
            <span className="sp-stat-label">Program</span>
          </div>
        </div>
      </div>

      {/* ══ BODY ══════════════════════════════════════════════════════════════ */}
      <div className="sp-body">

        {/* ── Informasi Akun ── */}
        <div className="sp-card">
          <div className="sp-card-header">
            <div className="sp-card-header-dot blue" />
            <p className="sp-card-header-title">Informasi Akun</p>
          </div>

          <div className="sp-info-row">
            <div className="sp-info-icon blue">👤</div>
            <div className="sp-info-text">
              <p className="sp-info-label">Nama Lengkap</p>
              <p className="sp-info-value">{user?.name ?? '-'}</p>
            </div>
          </div>

          <div className="sp-info-row">
            <div className="sp-info-icon violet">✉️</div>
            <div className="sp-info-text">
              <p className="sp-info-label">Email</p>
              <p className="sp-info-value">{user?.email ?? '-'}</p>
            </div>
          </div>

          <div className="sp-info-row">
            <div className="sp-info-icon green">🎓</div>
            <div className="sp-info-text">
              <p className="sp-info-label">Role</p>
              <p className="sp-info-value">Siswa</p>
            </div>
          </div>
        </div>

        {/* ── Menu Navigasi ── */}
        <div className="sp-card">
          <div className="sp-card-header">
            <div className="sp-card-header-dot violet" />
            <p className="sp-card-header-title">Navigasi</p>
          </div>

          <Link href="/siswa/dashboard" className="sp-menu-row">
            <div className="sp-menu-icon indigo">🏠</div>
            <div className="sp-menu-text">
              <p className="sp-menu-title">Beranda</p>
              <p className="sp-menu-sub">Kembali ke dashboard utama</p>
            </div>
            <span className="sp-menu-chevron">›</span>
          </Link>

          <Link href="/siswa/pendaftaran" className="sp-menu-row">
            <div className="sp-menu-icon blue">📝</div>
            <div className="sp-menu-text">
              <p className="sp-menu-title">Formulir Pendaftaran</p>
              <p className="sp-menu-sub">Isi atau edit data pendaftaran</p>
            </div>
            <span className="sp-menu-chevron">›</span>
          </Link>

          <Link href="/siswa/status" className="sp-menu-row">
            <div className="sp-menu-icon teal">📊</div>
            <div className="sp-menu-text">
              <p className="sp-menu-title">Status Pendaftaran</p>
              <p className="sp-menu-sub">Pantau progress proses seleksi</p>
            </div>
            <span className="sp-menu-chevron">›</span>
          </Link>
        </div>

        {/* ── Logout ── */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="sp-logout-btn"
        >
          {loggingOut ? (
            <>
              <span className="sp-logout-spinner">⏳</span>
              <span>Keluar dari akun...</span>
            </>
          ) : (
            <>
              <span>🚪</span>
              <span>Keluar dari Akun</span>
            </>
          )}
        </button>

        <p className="sp-footer-note">PSB App · Tahun Ajaran 2025/2026</p>

      </div>
    </div>
  )
}