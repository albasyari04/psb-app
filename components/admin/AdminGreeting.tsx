'use client'
// components/admin/AdminGreeting.tsx
import { useState, useLayoutEffect } from 'react'

function getGreeting(hour: number): string {
  if (hour >= 4  && hour < 11) return 'Selamat Pagi'
  if (hour >= 11 && hour < 15) return 'Selamat Siang'
  if (hour >= 15 && hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

const greetingStore = { current: 'Selamat Pagi' }

export default function AdminGreeting({ firstName }: { firstName: string }) {
  const [greeting, setGreeting] = useState(() => {
    // ✅ Initialize with stored value (avoids hydration mismatch)
    return greetingStore.current
  })

  // ✅ Update on client-side only, avoids hydration mismatch
  useLayoutEffect(() => {
    const newGreeting = getGreeting(new Date().getHours())
    greetingStore.current = newGreeting
    // Safe: This runs once at mount for SSR hydration
    // eslint-disable-next-line
    setGreeting(newGreeting)
  }, [])

  return (
    <div>
      <p className="adm-hero-greeting">{greeting} 👋</p>
      <p className="adm-hero-name">{firstName}</p>
    </div>
  )
}