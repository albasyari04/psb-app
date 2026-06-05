// File: app/(auth)/login/LoginForm.tsx
'use client'
import { useState, useMemo } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [loading, setLoading]             = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formError, setFormError]         = useState('')
  const [showPass, setShowPass]           = useState(false)

  const authError = useMemo(() => {
    const e = searchParams.get('error')
    if (e === 'unauthorized' || e === 'Unauthorized')
      return 'Sesi Anda telah berakhir. Silakan login kembali.'
    if (e === 'OAuthAccountNotLinked')
      return 'Email ini sudah terdaftar dengan metode lain. Gunakan email & password.'
    if (e === 'OAuthCallback' || e === 'OAuthSignin')
      return 'Gagal login dengan Google. Silakan coba lagi.'
    if (e) return 'Terjadi kesalahan. Silakan login kembali.'
    return ''
  }, [searchParams])

  const error = formError || authError

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setFormError('')
    await signIn('google', { callbackUrl: '/' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setFormError('Email dan password wajib diisi'); return }

    setLoading(true)
    setFormError('')

    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)

    if (result?.error) {
      setFormError('Email atau password salah. Silakan coba lagi.')
      return
    }

    const res     = await fetch('/api/auth/session')
    const session = await res.json()
    router.push(session?.user?.role === 'admin' ? '/admin/dashboard' : '/siswa/dashboard')
  }

  return (
    <div className="lgn-shell">

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <div className="lgn-hero">
        {/* Masjid background image */}
        <div className="lgn-hero-img-wrap">
          <Image
            src="/image/masjid.png"
            alt="Masjid Al-Istiqomah"
            fill
            className="lgn-hero-img"
            priority
          />
          {/* Blue overlay on top of image */}
          <div className="lgn-hero-overlay" />
        </div>

        {/* Content above image */}
        <div className="lgn-hero-content">
          {/* Logo */}
          <div className="lgn-logo-wrap">
            <Image
              src="/image/logo.png"
              alt="Logo Al-Istiqomah"
              width={80}
              height={80}
              className="lgn-logo-img"
              priority
            />
          </div>

          <h1 className="lgn-hero-title">PSMB</h1>
          <p className="lgn-hero-subtitle">
            Penerimaan Santri Baru Pondok Pesantren{'\u00A0'}Al-Istiqomah
          </p>
        </div>

        {/* Wave curve */}
        <svg className="lgn-wave-svg" viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 C480,64 960,64 1440,0 L1440,64 L0,64 Z" fill="#ffffff"/>
        </svg>
      </div>

      {/* ── Form Card ─────────────────────────────────────────────── */}
      <div className="lgn-card">

        <h2 className="lgn-card-title">Welcome Back!</h2>
        <p className="lgn-card-sub">Masuk ke akun Anda untuk melanjutkan</p>

        <form onSubmit={handleSubmit} className="lgn-form">

          {error && (
            <div className="lgn-error">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="lgn-error-icon">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="lgn-field">
            <label className="lgn-label" htmlFor="email">Email Address</label>
            <div className="lgn-input-wrap">
              <span className="lgn-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="lgn-input"
                autoComplete="email"
                disabled={loading || googleLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="lgn-field">
            <label className="lgn-label" htmlFor="password">Password</label>
            <div className="lgn-input-wrap">
              <span className="lgn-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="lgn-input lgn-input-pass"
                autoComplete="current-password"
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="lgn-eye-btn"
                tabIndex={-1}
                aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className={'lgn-btn' + (loading ? ' lgn-btn-loading' : '')}
          >
            {loading ? (
              <><span className="lgn-spinner" /><span>Masuk...</span></>
            ) : (
              <span>Log In &nbsp;→</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="lgn-divider">
          <span className="lgn-divider-line" />
          <span className="lgn-divider-text">ATAU</span>
          <span className="lgn-divider-line" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="lgn-google-btn"
        >
          {googleLoading ? (
            <><span className="lgn-spinner lgn-spinner-dark" /><span>Menghubungkan...</span></>
          ) : (
            <>
              <svg className="lgn-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Footer */}
        <div className="lgn-footer">
          <p className="lgn-footer-text">
            Belum punya akun?{' '}
            <a href="/register" className="lgn-footer-link">Daftar di sini</a>
          </p>
          <div className="lgn-security-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Sistem aman dan terpercaya</span>
          </div>
          <p className="lgn-security-sub">Data Anda dilindungi dengan enkripsi</p>
        </div>
      </div>
    </div>
  )
}