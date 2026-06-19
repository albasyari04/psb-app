// public/sw.js
//
// Service Worker minimal untuk PSMB - Pon-Pes Al Istiqomah.
// Tujuannya HANYA memenuhi syarat "installable PWA" (dibutuhkan agar
// Bubblewrap/PWABuilder bisa generate TWA dengan kualitas baik) —
// bukan untuk membuat seluruh app bisa dipakai offline penuh, karena
// PSB adalah app berbasis data live (pendaftaran, status, dashboard)
// yang memang butuh koneksi internet.
//
// Strategi: cache aset statis ringan (manifest, icon) saat install,
// lalu network-first untuk semua request lain — jika offline & ada
// di cache, baru fallback ke cache.

const CACHE_NAME = 'psmb-shell-v1'

const PRECACHE_URLS = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// ── INSTALL ─────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// ── ACTIVATE — bersihkan cache versi lama ───────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ── FETCH — network-first, fallback ke cache kalau offline ─────────
self.addEventListener('fetch', (event) => {
  // Hanya tangani GET request; biarkan POST/PUT/dll (form submit, API) lewat normal.
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan copy response ke cache untuk fallback offline berikutnya.
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => caches.match(event.request))
  )
})