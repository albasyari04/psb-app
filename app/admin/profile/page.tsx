'use client'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef } from 'react'

// ── Menu items — warna dimasukkan ke CSS class, bukan inline style ────────
const menuItems = [
  { icon: '📋', label: 'Semua Pendaftar',    sub: 'Kelola data pendaftar',     href: '/admin/pendaftar',  colorCls: 'apr-icon-violet' },
  { icon: '⚡', label: 'Verifikasi Pending', sub: 'Tinjau & proses pendaftar', href: '/admin/verifikasi', colorCls: 'apr-icon-amber'  },
  { icon: '🏠', label: 'Dashboard',          sub: 'Ringkasan & statistik',     href: '/admin/dashboard',  colorCls: 'apr-icon-blue'   },
]

export default function AdminProfilePage() {
  const { data: session, update } = useSession()

  const name      = session?.user.name      ?? 'Admin'
  const email     = session?.user.email     ?? '—'
  const avatarUrl = (session?.user as { avatar_url?: string })?.avatar_url ?? null
  const initial   = name.charAt(0).toUpperCase()

  // ── State ────────────────────────────────────────────────────────────
  const [editMode,         setEditMode]         = useState(false)
  const [editName,         setEditName]         = useState(name)
  const [previewUrl,       setPreviewUrl]       = useState<string | null>(null)
  const [avatarFile,       setAvatarFile]       = useState<File | null>(null)
  const [saving,           setSaving]           = useState(false)
  const [uploadingAvatar,  setUploadingAvatar]  = useState(false)
  const [toast,            setToast]            = useState<{ msg: string; ok: boolean } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Toast helper ──────────────────────────────────────────────────────
  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Pick avatar file ──────────────────────────────────────────────────
  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran foto maks 2MB', false)
      return
    }
    setAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // ── Save ──────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!editName.trim()) {
      showToast('Nama tidak boleh kosong', false)
      return
    }
    setSaving(true)
    try {
      let newAvatarUrl: string | null = null

      // 1. Upload foto jika ada file baru
      if (avatarFile) {
        setUploadingAvatar(true)
        const fd = new FormData()
        fd.append('file', avatarFile)
        const res  = await fetch('/api/profile/avatar', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Upload gagal')
        newAvatarUrl = json.url
        setUploadingAvatar(false)
      }

      // 2. Update nama (+ avatar_url jika baru)
      const body: Record<string, string> = { name: editName.trim() }
      if (newAvatarUrl) body.avatar_url = newAvatarUrl

      const res2  = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json2 = await res2.json()
      if (!res2.ok) throw new Error(json2.error ?? 'Update gagal')

      // 3. Refresh session
      await update({ name: editName.trim(), avatar_url: newAvatarUrl ?? avatarUrl })

      setAvatarFile(null)
      setEditMode(false)
      showToast('Profil berhasil disimpan ✓', true)
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Terjadi kesalahan', false)
    } finally {
      setSaving(false)
      setUploadingAvatar(false)
    }
  }

  // ── Cancel ────────────────────────────────────────────────────────────
  function handleCancel() {
    setEditMode(false)
    setEditName(name)
    setPreviewUrl(null)
    setAvatarFile(null)
  }

  const displayAvatar = previewUrl ?? avatarUrl

  return (
    <>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div className={'apr-toast' + (toast.ok ? ' apr-toast-ok' : ' apr-toast-err')} role="status" aria-live="polite">
          <span aria-hidden="true">{toast.ok ? '✓' : '✕'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="app-shell apr-page">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="apr-hero">
          <div className="apr-orb apr-orb1" />
          <div className="apr-orb apr-orb2" />
          <div className="apr-orb apr-orb3" />
          <div className="apr-grid" />

          <div className="apr-hero-body">

            {/* Avatar */}
            <div className="apr-avatar-wrap">
              <div className="apr-ring">
                {displayAvatar ? (
                  // ✅ FIX 1: Ganti <img> → <Image> dari next/image
                  <Image
                    src={displayAvatar}
                    alt="Foto profil"
                    width={84}
                    height={84}
                    className="apr-avatar-img"
                    unoptimized={!!previewUrl} // blob URL tidak perlu dioptimasi
                  />
                ) : (
                  <div className="apr-avatar" aria-label={`Inisial nama: ${initial}`}>
                    {initial}
                  </div>
                )}
              </div>

              {/* Camera button */}
              {editMode && (
                <button
                  className="apr-camera-btn"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Ganti foto profil"
                  title="Ganti foto profil"
                  type="button"
                >
                  {uploadingAvatar
                    ? <span className="apr-spin" aria-hidden="true">⟳</span>
                    : <span aria-hidden="true">📷</span>
                  }
                </button>
              )}

              <div className="apr-online-dot" aria-hidden="true" />

              {/* ✅ FIX 2: Tambah aria-label + title pada input file hidden */}
              <label htmlFor="avatar-file-input" className="apr-visually-hidden">
                Upload foto profil
              </label>
              <input
                id="avatar-file-input"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="apr-input-hidden"   // ✅ FIX 3: Pindah dari inline style ke CSS class
                onChange={handleFilePick}
                aria-label="Upload foto profil"
                title="Upload foto profil"
              />
            </div>

            {/* Name */}
            {editMode ? (
              <>
                {/* ✅ FIX 2: label eksplisit untuk input nama */}
                <label htmlFor="edit-name-input" className="apr-visually-hidden">
                  Nama lengkap
                </label>
                <input
                  id="edit-name-input"
                  className="apr-name-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  maxLength={50}
                  placeholder="Nama lengkap"
                  autoFocus
                  aria-label="Nama lengkap"
                />
              </>
            ) : (
              <h1 className="apr-name">{name}</h1>
            )}

            <p className="apr-email">{email}</p>

            <div className="apr-role-pill">
              <span aria-hidden="true">🔑</span>
              <span>Admin / Panitia</span>
            </div>

            {/* Action buttons */}
            <div className="apr-hero-actions">
              {editMode ? (
                <>
                  <button
                    className="apr-btn-save"
                    onClick={handleSave}
                    disabled={saving}
                    type="button"
                    aria-label="Simpan perubahan profil"
                  >
                    <span aria-hidden="true">{saving ? <span className="apr-spin">⟳</span> : '✓'}</span>
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    className="apr-btn-cancel"
                    onClick={handleCancel}
                    disabled={saving}
                    type="button"
                    aria-label="Batal edit profil"
                  >
                    Batal
                  </button>
                </>
              ) : (
                <button
                  className="apr-btn-edit"
                  onClick={() => { setEditMode(true); setEditName(name) }}
                  type="button"
                  aria-label="Edit profil"
                >
                  <span aria-hidden="true">✏️</span> Edit Profil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="apr-body">

          {/* Navigation */}
          <p className="apr-sect-lbl">Navigasi</p>
          {/* ✅ FIX 3: Hapus semua inline style — pindah ke CSS class */}
          <div className="apr-card">
            {menuItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={'apr-row' + (i > 0 ? ' apr-row-sep' : '')}
              >
                <div className={'apr-icon-box ' + item.colorCls}>
                  <span className="apr-menu-emoji" aria-hidden="true">{item.icon}</span>
                </div>
                <div className="apr-row-text">
                  <p className="apr-row-label">{item.label}</p>
                  <p className="apr-row-sub">{item.sub}</p>
                </div>
                <span className="apr-chevron" aria-hidden="true">›</span>
              </Link>
            ))}
          </div>

          {/* Account info */}
          <p className="apr-sect-lbl">Informasi Akun</p>
          <div className="apr-card apr-info-card">
            <div className="apr-info-row">
              <span className="apr-info-key">Nama</span>
              <span className="apr-info-val">{name}</span>
            </div>
            <div className="apr-info-row apr-info-sep">
              <span className="apr-info-key">Email</span>
              <span className="apr-info-val apr-mono">{email}</span>
            </div>
            <div className="apr-info-row apr-info-sep">
              <span className="apr-info-key">Peran</span>
              <span className="apr-chip">Admin</span>
            </div>
            <div className="apr-info-row apr-info-sep">
              <span className="apr-info-key">Sistem</span>
              <span className="apr-info-val">PSB 2025/2026</span>
            </div>
          </div>

          {/* Sign out */}
          <button
            className="apr-signout"
            onClick={() => signOut({ callbackUrl: '/login' })}
            type="button"
            aria-label="Keluar dari akun"
          >
            <span aria-hidden="true">🚪</span>
            <span>Keluar dari Akun</span>
          </button>

          <p className="apr-footer">PSB App v1.0 · Admin Panel</p>
        </div>
      </div>
    </>
  )
}

/* ── Scoped CSS ─────────────────────────────────────────────────────────── */
const css = `
/* ── Accessibility helper ── */
.apr-visually-hidden {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

/* ✅ FIX 3: Input hidden via class (bukan inline style) */
.apr-input-hidden {
  display: none;
}

/* ── Page ── */
.apr-page {
  background: #f4f2ff;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── Toast ── */
.apr-toast {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  z-index: 9999; display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 100px;
  font-size: 13px; font-weight: 700;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  animation: toastIn 0.3s cubic-bezier(.16,1,.3,1) both;
  white-space: nowrap; pointer-events: none;
}
@keyframes toastIn {
  from { opacity:0; transform:translateX(-50%) translateY(-10px) scale(0.95); }
  to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
}
.apr-toast-ok  { background:#ecfdf5; color:#065f46; border:1px solid #6ee7b7; }
.apr-toast-err { background:#fef2f2; color:#991b1b; border:1px solid #fca5a5; }

/* ── Hero ── */
.apr-hero {
  background: linear-gradient(140deg, #3730a3 0%, #4f46e5 40%, #6d28d9 80%, #7c3aed 100%);
  padding: 52px 20px 44px;
  position: relative; overflow: hidden;
}
.apr-orb { position:absolute; border-radius:50%; pointer-events:none; }
.apr-orb1 { top:-60px; right:-40px; width:200px; height:200px; background:radial-gradient(circle,rgba(165,180,252,.24),transparent 70%); }
.apr-orb2 { bottom:-30px; left:-30px; width:150px; height:150px; background:radial-gradient(circle,rgba(196,181,253,.18),transparent 70%); }
.apr-orb3 { top:20px; left:45%; width:80px; height:80px; background:radial-gradient(circle,rgba(221,214,254,.14),transparent 70%); }
.apr-grid {
  position:absolute; inset:0; pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
  background-size:28px 28px;
}
.apr-hero-body {
  position:relative; z-index:1;
  display:flex; flex-direction:column; align-items:center; gap:6px;
}

/* ── Avatar ── */
.apr-avatar-wrap { position:relative; margin-bottom:4px; }
.apr-ring {
  width:88px; height:88px; border-radius:50%;
  background:rgba(255,255,255,.15);
  border:2.5px solid rgba(255,255,255,.3);
  display:flex; align-items:center; justify-content:center;
  -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
  box-shadow:0 0 0 8px rgba(196,181,253,.14),0 8px 32px rgba(0,0,0,.2);
  overflow:hidden;
}
.apr-avatar {
  width:68px; height:68px; border-radius:50%;
  background:linear-gradient(135deg,#a78bfa,#7c3aed);
  display:flex; align-items:center; justify-content:center;
  font-size:28px; font-weight:800; color:#fff;
  font-family:'Plus Jakarta Sans',sans-serif;
}
.apr-avatar-img {
  width:84px; height:84px; object-fit:cover; border-radius:50%;
}
.apr-camera-btn {
  position:absolute; bottom:0; right:0;
  width:28px; height:28px; border-radius:50%;
  background:linear-gradient(135deg,#7c3aed,#4f46e5);
  border:2px solid #fff;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; cursor:pointer;
  box-shadow:0 2px 8px rgba(0,0,0,.25);
  transition:transform .15s;
}
.apr-camera-btn:hover { transform:scale(1.12); }
.apr-online-dot {
  position:absolute; bottom:4px; right:4px;
  width:14px; height:14px; border-radius:50%;
  background:#4ade80; border:2.5px solid #4f46e5;
  box-shadow:0 0 8px rgba(74,222,128,.6);
}

/* ── Name ── */
.apr-name {
  font-size:22px; font-weight:800; color:#fff;
  letter-spacing:-.4px; text-align:center; margin:0;
  font-family:'Plus Jakarta Sans',sans-serif;
}
.apr-name-input {
  background:rgba(255,255,255,.15);
  border:1.5px solid rgba(255,255,255,.4);
  border-radius:12px;
  color:#fff; font-size:16px; font-weight:700;
  text-align:center; padding:8px 16px;
  font-family:'Plus Jakarta Sans',sans-serif;
  outline:none; width:220px;
  -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px);
}
.apr-name-input::placeholder { color:rgba(255,255,255,.5); }
.apr-name-input:focus { border-color:rgba(255,255,255,.7); box-shadow:0 0 0 3px rgba(255,255,255,.1); }
.apr-email { font-size:12px; color:rgba(255,255,255,.6); text-align:center; margin:0; }
.apr-role-pill {
  display:inline-flex; align-items:center; gap:6px;
  margin-top:4px; padding:5px 14px; border-radius:100px;
  background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.22);
  -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
  font-size:11px; font-weight:700; color:rgba(255,255,255,.9); letter-spacing:.03em;
}

/* ── Hero action buttons ── */
.apr-hero-actions { display:flex; gap:8px; margin-top:10px; }
.apr-btn-edit {
  display:inline-flex; align-items:center; gap:6px;
  padding:8px 20px; border-radius:100px;
  background:rgba(255,255,255,.18); border:1.5px solid rgba(255,255,255,.3);
  color:#fff; font-size:12px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; transition:all .2s;
  -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
}
.apr-btn-edit:hover { background:rgba(255,255,255,.26); }
.apr-btn-save {
  display:inline-flex; align-items:center; gap:6px;
  padding:8px 20px; border-radius:100px;
  background:linear-gradient(135deg,#4ade80,#16a34a);
  border:none; color:#fff; font-size:12px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; transition:all .2s;
  box-shadow:0 4px 14px rgba(74,222,128,.35);
}
.apr-btn-save:disabled { opacity:.7; cursor:not-allowed; }
.apr-btn-save:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(74,222,128,.45); }
.apr-btn-cancel {
  display:inline-flex; align-items:center; gap:6px;
  padding:8px 16px; border-radius:100px;
  background:rgba(255,255,255,.1); border:1.5px solid rgba(255,255,255,.25);
  color:rgba(255,255,255,.8); font-size:12px; font-weight:600;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; transition:all .2s;
}
.apr-btn-cancel:hover { background:rgba(255,255,255,.18); }
.apr-spin { display:inline-block; animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

/* ── Body ── */
.apr-body {
  padding:20px 16px 110px;
  display:flex; flex-direction:column; gap:10px;
  animation:aprUp .45s ease both;
}
@keyframes aprUp {
  from { opacity:0; transform:translateY(14px); }
  to   { opacity:1; transform:translateY(0); }
}
.apr-sect-lbl {
  font-size:10px; font-weight:700; letter-spacing:.1em;
  text-transform:uppercase; color:#94a3b8;
  padding:0 2px; margin-top:6px;
}

/* ── Card ── */
.apr-card {
  background:#fff; border-radius:22px; overflow:hidden;
  box-shadow:0 4px 24px rgba(99,102,241,.09),0 1px 4px rgba(0,0,0,.04);
  border:1px solid rgba(167,139,250,.1);
}

/* ── Nav rows ── */
.apr-row {
  display:flex; align-items:center; gap:13px;
  padding:14px 16px; transition:background .18s ease;
  color:inherit; text-decoration:none;
}
.apr-row:hover  { background:#faf9ff; }
.apr-row:active { background:#f3f0ff; }
.apr-row-sep { border-top:1px solid #f1f0fe; }

/* ✅ FIX 3: Icon box warna via CSS class — tidak perlu inline style */
.apr-icon-box {
  width:42px; height:42px; border-radius:13px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.apr-icon-violet { background:#ede9fe; }
.apr-icon-amber  { background:#fef3c7; }
.apr-icon-blue   { background:#dbeafe; }

/* ✅ FIX 3: Emoji size via CSS class — tidak perlu inline style */
.apr-menu-emoji { font-size:18px; line-height:1; }

.apr-row-text { flex:1; min-width:0; }
.apr-row-label { font-size:13px; font-weight:700; color:#0f172a; margin-bottom:1px; }
.apr-row-sub { font-size:11px; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.apr-chevron { font-size:22px; color:#c4b5fd; flex-shrink:0; line-height:1; }

/* ── Info card ── */
.apr-info-card { padding:4px 0; }
.apr-info-row { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; gap:8px; }
.apr-info-sep { border-top:1px solid #f1f0fe; }
.apr-info-key { font-size:12px; font-weight:600; color:#94a3b8; flex-shrink:0; min-width:60px; }
.apr-info-val { font-size:13px; font-weight:600; color:#1e1b4b; text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.apr-mono { font-size:11px; color:#64748b; font-weight:500; }
.apr-chip { display:inline-flex; align-items:center; padding:3px 10px; border-radius:100px; background:#ede9fe; color:#6d28d9; font-size:11px; font-weight:700; }

/* ── Sign out ── */
.apr-signout {
  width:100%; display:flex; align-items:center; justify-content:center; gap:8px;
  padding:14px; border-radius:18px; border:1.5px solid #fecaca; background:#fff5f5;
  color:#dc2626; font-size:13px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; transition:all .2s; margin-top:4px;
}
.apr-signout:hover { background:#fee2e2; border-color:#f87171; box-shadow:0 4px 16px rgba(220,38,38,.12); transform:translateY(-1px); }
.apr-signout:active { transform:scale(.98); box-shadow:none; }
.apr-footer { text-align:center; font-size:11px; color:#cbd5e1; margin-top:4px; padding-bottom:4px; }
`