// File: d:\laragon\www\next-js\psb-app\app\(auth)\login\LoginForm.tsx
'use client'
import { useState, useMemo } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

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
    <div className="login-shell">
      <div className="login-wave-hero">
        <div className="login-wave-icon-wrap">
          <span className="login-wave-icon">🎓</span>
        </div>
        <h1 className="login-wave-app-name">PSB Online</h1>
        <p className="login-wave-app-sub">Penerimaan Siswa Baru 2025/2026</p>

        <svg className="login-wave-svg" viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,32 C360,80 1080,-16 1440,32 L1440,64 L0,64 Z" fill="#f0f4f8"/>
        </svg>
      </div>

      <div className="login-card">
        <h2 className="login-card-title">Welcome Back!</h2>
        <p className="login-card-sub">Masuk ke akun Anda untuk melanjutkan</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span className="login-error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="login-field">
            <label className="login-label" htmlFor="email">Email Address</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">✉️</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="login-input"
                autoComplete="email"
                disabled={loading || googleLoading}
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="login-input login-input-pass"
                autoComplete="current-password"
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="login-eye-btn"
                tabIndex={-1}
                aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className={'login-btn' + (loading ? ' login-btn-loading' : '')}
          >
            {loading ? (
              <><span className="login-spinner" /><span>Masuk...</span></>
            ) : (
              <span>Log In →</span>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span className="login-divider-line" />
          <span className="login-divider-text">atau</span>
          <span className="login-divider-line" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="login-google-btn"
        >
          {googleLoading ? (
            <><span className="login-spinner login-spinner-dark" /><span>Menghubungkan...</span></>
          ) : (
            <>
              <svg className="login-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="login-footer">
          <p className="login-footer-text">
            Belum punya akun?{' '}
            <a href="/register" className="login-footer-link">Daftar di sini</a>
          </p>
          <p className="login-footer-hint">
            Siswa gunakan akun yang didaftarkan saat registrasi
          </p>
        </div>
      </div>
    </div>
  )
}
