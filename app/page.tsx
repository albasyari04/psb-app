// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function SplashPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [showSplash, setShowSplash] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2000)
    const splashTimer = setTimeout(() => setShowSplash(false), 2500)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(splashTimer)
    }
  }, [])

  useEffect(() => {
    if (showSplash) return
    if (status === 'loading') return

    if (status === 'authenticated') {
      const role = session?.user?.role
      router.replace(role === 'admin' ? '/admin/dashboard' : '/siswa/dashboard')
    } else {
      router.replace('/login')
    }
  }, [showSplash, status, session, router])

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Badge versi (kanan atas) ───────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#e8fbef',
            borderRadius: '20px',
            padding: '6px 8px 6px 14px',
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            V1.0.0
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              color: '#ffffff',
              background: '#16a34a',
              borderRadius: '14px',
              padding: '3px 10px',
              letterSpacing: '0.02em',
            }}
          >
            BARU
          </span>
        </div>

        {/* ── Konten tengah: Logo + Nama App ─────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            paddingBottom: '60px',
          }}
        >
          <div className="splash-logo-wrap">
            <Image
              src="/icons/logo.png"
              alt="Logo PSMB"
              width={140}
              height={140}
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '28px',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '0.02em',
              }}
            >
              PSMB
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                color: '#475569',
                margin: '4px 0 0',
              }}
            >
              Pon-Pes Al Istiqomah
            </p>
          </div>
        </div>

        {/* ── Loading bar ala Donghive ──────────────────────────── */}
        <div
          style={{
            paddingBottom: '56px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div className="splash-progress-track">
            <div className="splash-progress-fill" />
          </div>
          <p className="splash-status-text">Memeriksa status aplikasi…</p>
        </div>
      </div>

      <style>{`
        .splash-logo-wrap {
          animation: splashPulse 1.8s ease-in-out infinite;
        }

        @keyframes splashPulse {
          0%, 100% { transform: scale(1);   opacity: 1;   }
          50%      { transform: scale(1.04); opacity: 0.92; }
        }

        .splash-progress-track {
          width: 200px;
          height: 4px;
          border-radius: 4px;
          background: rgba(15, 23, 42, 0.08);
          overflow: hidden;
          position: relative;
        }

        .splash-progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 40%;
          border-radius: 4px;
          background: linear-gradient(90deg, #d4af37, #f0c96b, #d4af37);
          animation: splashSlide 1.3s cubic-bezier(.4,0,.2,1) infinite;
        }

        @keyframes splashSlide {
          0%   { left: -40%; }
          100% { left: 100%; }
        }

        .splash-status-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          color: #94a3b8;
          letter-spacing: 0.04em;
          margin: 0;
        }
      `}</style>
    </>
  )
}