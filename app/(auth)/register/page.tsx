'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [focused, setFocused]       = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Password tidak cocok.'); return }
    if (form.password.length < 6) { setError('Password minimal 6 karakter.'); return }
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options:  { data: { name: form.name } },
    })

    if (authError) { setError(authError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id, email: form.email, name: form.name, role: 'siswa',
      })
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/login'), 3000)
  }

  /* ── Success Screen ──────────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="reg-shell">
        {/* Wave hero */}
        <div className="reg-wave-hero">
          <div className="reg-wave-icon-wrap">
            <span className="reg-wave-icon">🎓</span>
          </div>
          <h1 className="reg-wave-app-name">PSB Online</h1>
          <p className="reg-wave-app-sub">Penerimaan Siswa Baru 2025/2026</p>
          <svg className="reg-wave-svg" viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,32 C360,80 1080,-16 1440,32 L1440,64 L0,64 Z" fill="#f0f4f8"/>
          </svg>
        </div>

        <div className="reg-success-card">
          <div className="reg-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="reg-success-title">Akun Berhasil Dibuat!</h2>
          <p className="reg-success-sub">
            Selamat datang di PSB Online. Anda akan diarahkan ke halaman login...
          </p>
          <div className="reg-success-bar">
            <div className="reg-success-bar-fill" />
          </div>
          <button onClick={() => router.push('/login')} className="reg-btn">
            Masuk Sekarang →
          </button>
        </div>
      </div>
    )
  }

  /* ── Register Form ───────────────────────────────────────────────────── */
  return (
    <div className="reg-shell">
      {/* ── Wave Hero ──────────────────────────────────────────────────── */}
      <div className="reg-wave-hero">
        <div className="reg-wave-icon-wrap">
          <span className="reg-wave-icon">🎓</span>
        </div>
        <h1 className="reg-wave-app-name">PSB Online</h1>
        <p className="reg-wave-app-sub">Penerimaan Siswa Baru 2025/2026</p>
        <svg className="reg-wave-svg" viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,32 C360,80 1080,-16 1440,32 L1440,64 L0,64 Z" fill="#f0f4f8"/>
        </svg>
      </div>

      {/* ── Form Card ──────────────────────────────────────────────────── */}
      <div className="reg-container">
        {/* Progress steps */}
        <div className="reg-progress-steps">
          <div className="reg-prog-item">
            <div className="reg-prog-circle reg-prog-circle-active">1</div>
            <span className="reg-prog-label reg-prog-label-active">Akun</span>
          </div>
          <div className="reg-prog-gap" />
          <div className="reg-prog-item">
            <div className="reg-prog-circle reg-prog-circle-idle">2</div>
            <span className="reg-prog-label reg-prog-label-idle">Formulir</span>
          </div>
          <div className="reg-prog-gap" />
          <div className="reg-prog-item">
            <div className="reg-prog-circle reg-prog-circle-idle">3</div>
            <span className="reg-prog-label reg-prog-label-idle">Verifikasi</span>
          </div>
        </div>

        <div className="reg-card-header">
          <h2 className="reg-card-title">Buat Akun Baru</h2>
          <p className="reg-card-sub">Lengkapi semua kolom di bawah ini</p>
        </div>

        {error && (
          <div className="reg-error">
            <svg viewBox="0 0 20 20" fill="currentColor" className="reg-error-icon">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="reg-form">
          {/* Nama */}
          <div className={`reg-field ${focused === 'name' ? 'reg-field-focus' : ''}`}>
            <label className="reg-label">Nama Lengkap</label>
            <div className="reg-input-wrap">
              <svg className="reg-field-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              <input
                type="text" placeholder="Nama lengkap Anda" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                required className="reg-input"
              />
            </div>
          </div>

          {/* Email */}
          <div className={`reg-field ${focused === 'email' ? 'reg-field-focus' : ''}`}>
            <label className="reg-label">Email</label>
            <div className="reg-input-wrap">
              <svg className="reg-field-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <input
                type="email" placeholder="nama@email.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                required className="reg-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className={`reg-field ${focused === 'pass' ? 'reg-field-focus' : ''}`}>
            <label className="reg-label">Password</label>
            <div className="reg-input-wrap">
              <svg className="reg-field-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <input
                type={showPass ? 'text' : 'password'} placeholder="Min. 6 karakter" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                required className="reg-input reg-input-pass"
              />
              <button type="button" className="reg-eye" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  {showPass
                    ? <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                    : <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  }
                  {!showPass && <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>}
                </svg>
              </button>
            </div>
            {form.password && (
              <div className="reg-strength">
                <div className={`reg-strength-bar ${form.password.length >= 8 ? 'reg-strength-strong' : form.password.length >= 6 ? 'reg-strength-medium' : 'reg-strength-weak'}`} />
                <span className="reg-strength-label">
                  {form.password.length >= 8 ? 'Kuat' : form.password.length >= 6 ? 'Cukup' : 'Lemah'}
                </span>
              </div>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div className={`reg-field ${focused === 'confirm' ? 'reg-field-focus' : ''}`}>
            <label className="reg-label">Konfirmasi Password</label>
            <div className="reg-input-wrap">
              <svg className="reg-field-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <input
                type={showConfirm ? 'text' : 'password'} placeholder="Ulangi password" value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')}
                required className="reg-input reg-input-pass"
              />
              <button type="button" className="reg-eye" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                aria-label={showConfirm ? 'Sembunyikan konfirmasi' : 'Tampilkan konfirmasi'}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  {showConfirm
                    ? <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                    : <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  }
                  {!showConfirm && <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>}
                </svg>
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="reg-match-warn">⚠ Password tidak cocok</p>
            )}
            {form.confirmPassword && form.password === form.confirmPassword && form.confirmPassword.length > 0 && (
              <p className="reg-match-ok">✓ Password cocok</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="reg-btn">
            {loading
              ? <span className="reg-spinner-wrap"><span className="reg-spinner" />Mendaftarkan...</span>
              : 'Sign Up →'
            }
          </button>
        </form>

        <p className="reg-login-link">
          Sudah punya akun?{' '}
          <Link href="/login" className="reg-link">Masuk di sini</Link>
        </p>
      </div>
    </div>
  )
}