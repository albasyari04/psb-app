'use client'
// app/admin/profile/password/page.tsx
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconEye({ show }: { show: boolean }) {
  return show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Password strength checker ─────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '#E5E7EB' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Lemah', color: '#EF4444' }
  if (score <= 2) return { score, label: 'Cukup', color: '#F59E0B' }
  if (score <= 3) return { score, label: 'Baik', color: '#3B82F6' }
  return { score, label: 'Kuat', color: '#10B981' }
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPasswordPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [currentPw, setCurrentPw]   = useState('')
  const [newPw,     setNewPw]       = useState('')
  const [confirmPw, setConfirmPw]   = useState('')

  const [showCurrent, setShowCurrent]   = useState(false)
  const [showNew,     setShowNew]       = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)

  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const strength = getStrength(newPw)

  const handleSave = async () => {
    setError(null)
    if (!currentPw) { setError('Masukkan password saat ini'); return }
    if (newPw.length < 8) { setError('Password baru minimal 8 karakter'); return }
    if (newPw !== confirmPw) { setError('Konfirmasi password tidak cocok'); return }
    if (newPw === currentPw) { setError('Password baru harus berbeda dari password lama'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok || !data.success) { setError(data.error ?? 'Gagal mengubah password'); return }
      setSuccess(true)
      setTimeout(() => router.push('/admin/profile'), 1500)
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F3F4F8; font-family: 'Segoe UI', system-ui, sans-serif; }

        .pw-root {
          max-width: 430px; margin: 0 auto;
          min-height: 100vh; background: #F3F4F8;
        }

        /* ── Header ── */
        .pw-header {
          background: linear-gradient(135deg, #4C1D95 0%, #5B21B6 40%, #6D28D9 100%);
          padding: 56px 20px 80px;
          position: relative; overflow: hidden;
        }
        .pw-header-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .pw-header-orb {
          position: absolute; border-radius: 50%;
          background: rgba(167,139,250,0.15); filter: blur(30px);
        }
        .pw-header-top {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 12px; margin-bottom: 28px;
        }
        .pw-back-btn {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
          color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px); transition: background 0.2s;
        }
        .pw-back-btn:hover { background: rgba(255,255,255,0.25); }
        .pw-header-title { color: #fff; font-size: 20px; font-weight: 700; }
        .pw-header-sub { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 2px; }

        /* Shield icon center */
        .pw-shield-zone {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .pw-shield-wrap {
          width: 72px; height: 72px; border-radius: 20px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.9);
        }
        .pw-shield-label {
          color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 600;
        }
        .pw-shield-sub {
          color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 2px; text-align: center;
        }

        /* ── Float card ── */
        .pw-float-zone {
          padding: 0 16px; margin-top: -60px; position: relative; z-index: 10;
        }
        .pw-card {
          background: #fff; border-radius: 20px;
          box-shadow: 0 4px 24px rgba(91,33,182,0.12);
          border: 1px solid rgba(91,33,182,0.06);
          overflow: hidden;
        }

        /* ── Fields ── */
        .pw-field-group { padding: 20px 20px 4px; }
        .pw-field { margin-bottom: 18px; }
        .pw-field-label {
          font-size: 11px; font-weight: 700; color: #7C3AED;
          text-transform: uppercase; letter-spacing: 0.06em;
          margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
        }
        .pw-field-wrap { position: relative; }
        .pw-field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #9CA3AF; pointer-events: none; display: flex; align-items: center;
        }
        .pw-field-input {
          width: 100%; padding: 14px 44px 14px 44px;
          border: 1.5px solid #E5E7EB; border-radius: 12px;
          font-size: 15px; color: #111827; background: #FAFAFA;
          outline: none; transition: border-color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .pw-field-input:focus {
          border-color: #7C3AED; background: #fff;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }
        .pw-field-input.error { border-color: #EF4444; }
        .pw-eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #9CA3AF; display: flex; align-items: center; padding: 0;
          transition: color 0.15s;
        }
        .pw-eye-btn:hover { color: #6B7280; }

        /* Strength bar */
        .pw-strength { margin-top: 8px; }
        .pw-strength-bars {
          display: flex; gap: 4px; margin-bottom: 4px;
        }
        .pw-strength-bar {
          flex: 1; height: 4px; border-radius: 2px;
          background: #E5E7EB; transition: background 0.3s;
        }
        .pw-strength-label {
          font-size: 11px; color: #9CA3AF; display: flex; justify-content: space-between;
        }
        .pw-strength-label span { font-weight: 600; }

        /* Match indicator */
        .pw-match-hint {
          font-size: 11px; margin-top: 6px; display: flex; align-items: center; gap: 4px;
        }
        .pw-match-ok   { color: #10B981; }
        .pw-match-fail { color: #EF4444; }

        /* Tips */
        .pw-tips {
          margin: 0 20px 20px;
          padding: 14px 16px;
          background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 12px;
        }
        .pw-tips-title {
          font-size: 12px; font-weight: 700; color: #7C3AED; margin-bottom: 8px;
          display: flex; align-items: center; gap: 6px;
        }
        .pw-tip-item {
          font-size: 12px; color: #5B21B6;
          display: flex; align-items: center; gap: 6px;
          padding: 3px 0;
        }
        .pw-tip-dot { width: 4px; height: 4px; border-radius: 50%; background: #A78BFA; flex-shrink: 0; }

        /* Error / Success */
        .pw-feedback {
          margin: 0 20px 16px; padding: 12px 16px;
          border-radius: 12px; font-size: 13px;
          display: flex; align-items: center; gap: 8px;
        }
        .pw-feedback.error {
          background: #FEF2F2; border: 1px solid #FECACA; color: #EF4444;
        }
        .pw-feedback.success {
          background: #F0FDF4; border: 1px solid #BBF7D0; color: #059669; font-weight: 600;
        }

        /* Buttons */
        .pw-btn-section { padding: 0 20px 20px; }
        .pw-save-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #5B21B6, #7C3AED);
          border: none; border-radius: 14px;
          color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.35);
          transition: opacity 0.2s, transform 0.1s; font-family: inherit;
        }
        .pw-save-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .pw-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pw-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pw-cancel-btn {
          width: 100%; padding: 13px; margin-top: 12px;
          background: transparent; border: 1.5px solid #E5E7EB; border-radius: 14px;
          color: #6B7280; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: background 0.2s; font-family: inherit;
        }
        .pw-cancel-btn:hover { background: #F9FAFB; }

        /* Divider */
        .pw-divider { height: 1px; background: #F3F4F6; margin: 4px 20px 20px; }

        /* User info strip */
        .pw-user-strip {
          display: flex; align-items: center; gap: 12px;
          margin: 0 20px 20px; padding: 14px 16px;
          background: #F5F3FF; border-radius: 14px; border: 1px solid #DDD6FE;
        }
        .pw-user-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #A78BFA, #7C3AED);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 15px; font-weight: 700; flex-shrink: 0;
        }
        .pw-user-name { font-size: 14px; font-weight: 700; color: #1F2937; }
        .pw-user-email { font-size: 12px; color: #9CA3AF; margin-top: 2px; }
      `}</style>

      <div className="pw-root">

        {/* ── HEADER ── */}
        <div className="pw-header">
          <div className="pw-header-grid" />
          <div className="pw-header-orb" style={{ width: 200, height: 200, top: -80, right: -60 }} />
          <div className="pw-header-orb" style={{ width: 120, height: 120, bottom: 30, left: -40 }} />

          <div className="pw-header-top">
            <button onClick={() => router.back()} className="pw-back-btn" type="button">
              <IconArrowLeft />
            </button>
            <div>
              <div className="pw-header-title">Ubah Password</div>
              <div className="pw-header-sub">Atur ulang password akun Anda</div>
            </div>
          </div>

          <div className="pw-shield-zone">
            <div className="pw-shield-wrap">
              <IconShield />
            </div>
            <div>
              <div className="pw-shield-label">Keamanan Akun</div>
              <div className="pw-shield-sub">Gunakan password yang kuat dan unik</div>
            </div>
          </div>
        </div>

        {/* ── FORM CARD ── */}
        <div className="pw-float-zone">
          <div className="pw-card">

            {/* User info */}
            <div className="pw-user-strip" style={{ marginTop: 20 }}>
              <div className="pw-user-avatar">
                {session?.user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
              </div>
              <div>
                <div className="pw-user-name">{session?.user?.name ?? 'Admin'}</div>
                <div className="pw-user-email">{session?.user?.email ?? ''}</div>
              </div>
            </div>

            <div className="pw-field-group">

              {/* Password saat ini */}
              <div className="pw-field">
                <div className="pw-field-label"><IconLock /> Password Saat Ini</div>
                <div className="pw-field-wrap">
                  <div className="pw-field-icon"><IconLock /></div>
                  <input
                    className={`pw-field-input${error && !currentPw ? ' error' : ''}`}
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPw}
                    onChange={(e) => { setCurrentPw(e.target.value); setError(null) }}
                    placeholder="Masukkan password saat ini"
                    disabled={saving}
                    autoComplete="current-password"
                  />
                  <button className="pw-eye-btn" onClick={() => setShowCurrent(v => !v)} type="button">
                    <IconEye show={showCurrent} />
                  </button>
                </div>
              </div>

              {/* Password baru */}
              <div className="pw-field">
                <div className="pw-field-label"><IconLock /> Password Baru</div>
                <div className="pw-field-wrap">
                  <div className="pw-field-icon"><IconLock /></div>
                  <input
                    className="pw-field-input"
                    type={showNew ? 'text' : 'password'}
                    value={newPw}
                    onChange={(e) => { setNewPw(e.target.value); setError(null) }}
                    placeholder="Masukkan password baru"
                    disabled={saving}
                    autoComplete="new-password"
                  />
                  <button className="pw-eye-btn" onClick={() => setShowNew(v => !v)} type="button">
                    <IconEye show={showNew} />
                  </button>
                </div>

                {/* Strength bar */}
                {newPw.length > 0 && (
                  <div className="pw-strength">
                    <div className="pw-strength-bars">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className="pw-strength-bar"
                          style={{ background: i <= strength.score ? strength.color : '#E5E7EB' }}
                        />
                      ))}
                    </div>
                    <div className="pw-strength-label">
                      <span>Kekuatan password</span>
                      <span style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Konfirmasi */}
              <div className="pw-field">
                <div className="pw-field-label"><IconLock /> Konfirmasi Password</div>
                <div className="pw-field-wrap">
                  <div className="pw-field-icon"><IconLock /></div>
                  <input
                    className="pw-field-input"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPw}
                    onChange={(e) => { setConfirmPw(e.target.value); setError(null) }}
                    placeholder="Ulangi password baru"
                    disabled={saving}
                    autoComplete="new-password"
                  />
                  <button className="pw-eye-btn" onClick={() => setShowConfirm(v => !v)} type="button">
                    <IconEye show={showConfirm} />
                  </button>
                </div>
                {confirmPw.length > 0 && (
                  <div className={`pw-match-hint ${newPw === confirmPw ? 'pw-match-ok' : 'pw-match-fail'}`}>
                    {newPw === confirmPw
                      ? <><IconCheck /> Password cocok</>
                      : <>✕ Password tidak cocok</>
                    }
                  </div>
                )}
              </div>

            </div>

            {/* Tips */}
            <div className="pw-tips">
              <div className="pw-tips-title">
                💡 Tips Password Aman
              </div>
              {[
                'Minimal 8 karakter',
                'Kombinasi huruf besar & kecil',
                'Tambahkan angka & simbol',
                'Jangan gunakan info pribadi',
              ].map((tip, i) => (
                <div key={i} className="pw-tip-item">
                  <div className="pw-tip-dot" />
                  {tip}
                </div>
              ))}
            </div>

            {/* Feedback */}
            {error && (
              <div className="pw-feedback error">
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div className="pw-feedback success">
                <IconCheck /> Password berhasil diubah! Mengalihkan...
              </div>
            )}

            {/* Buttons */}
            <div className="pw-btn-section">
              <button
                className="pw-save-btn"
                onClick={handleSave}
                disabled={saving || success}
                type="button"
              >
                {saving
                  ? <><div className="pw-spinner" /> Menyimpan...</>
                  : success
                    ? <><IconCheck /> Berhasil!</>
                    : <><IconLock /> Ubah Password</>
                }
              </button>
              <button
                className="pw-cancel-btn"
                onClick={() => router.push('/admin/profile')}
                disabled={saving}
                type="button"
              >
                Batal
              </button>
            </div>

          </div>
        </div>

        <div style={{ height: 32 }} />
      </div>
    </>
  )
}