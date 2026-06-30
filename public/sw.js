// public/sw.js
//
// Service Worker untuk PSMB - Pon-Pes Al Istiqomah.
//
// Punya 2 tanggung jawab:
// 1. (Sudah ada sebelumnya) Caching aset ringan agar memenuhi syarat
//    "installable PWA" — network-first, fallback ke cache saat offline.
// 2. (BARU) Menerima & menampilkan Web Push notification — popup yang
//    muncul di HP user walau app/tab sedang tidak dibuka, misal saat
//    admin membalas chat atau siswa mengirim pesan baru.

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

// ── PUSH — terima notifikasi dari server & tampilkan sebagai popup ─────────
self.addEventListener('push', (event) => {
  let data = {}

  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'PSMB - Pon-Pes Al Istiqomah', message: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'PSMB - Pon-Pes Al Istiqomah'
  const options = {
    body: data.message || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    vibrate: [120, 60, 120],
    // Disimpan di sini supaya bisa dibaca lagi saat user klik notifikasinya
    data: { url: data.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ── NOTIFICATIONCLICK — saat popup di-klik, buka/fokus halaman terkait ─────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Kalau tab dengan URL itu sudah terbuka, fokuskan saja (jangan buka tab baru)
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus()
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      })
  )
})