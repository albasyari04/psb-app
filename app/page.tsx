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
    // Mulai fade out di detik ke-2
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 2000)

    // Sembunyikan splash di detik ke-2.5
    const splashTimer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)

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
      if (role === 'admin') {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/siswa/dashboard')
      }
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
        }}
      >
        {/* Splash background image */}
        <Image
          src="/icons/splash.png"
          alt="PSMB Splash"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />

        {/* Overlay gelap tipis agar spinner terlihat */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
          }}
        />

        {/* Spinner di tengah bawah */}
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Spinner */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid #ffffff',
              animation: 'spin 0.8s linear infinite',
            }}
          />

          {/* Teks loading */}
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '13px',
              fontFamily: 'sans-serif',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            Memuat aplikasi...
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}