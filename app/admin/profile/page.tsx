'use client'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef } from 'react'

// ── Menu items ────────────────────────────────────────────────────────────
const menuItems = [
  { icon: IconPendaftar, label: 'Semua Pendaftar',    sub: 'Kelola data pendaftar',     href: '/admin/pendaftar',  colorCls: 'apr2-icon-violet' },
  { icon: IconVerifikasi, label: 'Verifikasi Pending', sub: 'Tinjau & proses pendaftar', href: '/admin/verifikasi', colorCls: 'apr2-icon-amber'  },
  { icon: IconDashboard,  label: 'Dashboard',          sub: 'Ringkasan & statistik',     href: '/admin/dashboard',  colorCls: 'apr2-icon-blue'   },
]

// ── SVG Icons ─────────────────────────────────────────────────────────────
function IconPendaftar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function IconVerifikasi({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  )
}

function IconDashboard({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

function IconEdit({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function IconCamera({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

function IconLogout({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function IconBack({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function IconChevron({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────
export default function AdminProfilePage() {
  const { data: session, update } = useSession()

  const name      = session?.user.name      ?? 'Admin'
  const email     = session?.user.email     ?? '—'
  const avatarUrl = (session?.user as { avatar_url?: string })?.avatar_url ?? null
  const initial   = name.charAt(0).toUpperCase()

  const [editMode,        setEditMode]        = useState(false)
  const [editName,        setEditName]        = useState(name)
  const [previewUrl,      setPreviewUrl]      = useState<string | null>(null)
  const [avatarFile,      setAvatarFile]      = useState<File | null>(null)
  const [saving,          setSaving]          = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [toast,           setToast]           = useState<{ msg: string; ok: boolean } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { showToast('Ukuran foto maks 2MB', false); return }
    setAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!editName.trim()) { showToast('Nama tidak boleh kosong', false); return }
    setSaving(true)
    try {
      let newAvatarUrl: string | null = null
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
      const body: Record<string, string> = { name: editName.trim() }
      if (newAvatarUrl) body.avatar_url = newAvatarUrl
      const res2  = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json2 = await res2.json()
      if (!res2.ok) throw new Error(json2.error ?? 'Update gagal')
      await update({ name: editName.trim(), avatar_url: newAvatarUrl ?? avatarUrl })
      setAvatarFile(null)
      setEditMode(false)
      showToast('Profil berhasil disimpan', true)
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Terjadi kesalahan', false)
    } finally {
      setSaving(false)
      setUploadingAvatar(false)
    }
  }

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
        <div className={'apr2-toast' + (toast.ok ? ' apr2-toast-ok' : ' apr2-toast-err')} role="status" aria-live="polite">
          <span className="apr2-toast-icon">{toast.ok ? '✓' : '✕'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="app-shell apr2-page">

        {/* ══════════════════════════════════════════
            APP BAR — sticky top, konsisten dgn dashboard
        ══════════════════════════════════════════ */}
        <div className="adm-appbar">
          <div className="adm-appbar-left">
            <Link href="/admin/dashboard" className="apr2-back-btn no-underline">
              <IconBack size={18} />
            </Link>
            <div>
              <p className="adm-appbar-greeting">Panel Admin</p>
              <p className="adm-appbar-name">Profil Saya</p>
            </div>
          </div>
          {editMode ? (
            <div className="adm-appbar-right">
              <button className="apr2-appbar-save" onClick={handleSave} disabled={saving} type="button">
                {saving ? <span className="apr2-spin">⟳</span> : '✓'} Simpan
              </button>
              <button className="apr2-appbar-cancel" onClick={handleCancel} disabled={saving} type="button">
                Batal
              </button>
            </div>
          ) : (
            <div className="adm-appbar-right">
              <button
                className="adm-appbar-btn"
                onClick={() => { setEditMode(true); setEditName(name) }}
                type="button"
                aria-label="Edit profil"
              >
                <IconEdit size={17} />
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            HERO — avatar + info utama
        ══════════════════════════════════════════ */}
        <div className="apr2-hero">
          {/* orbs */}
          <div className="apr2-orb apr2-orb1" />
          <div className="apr2-orb apr2-orb2" />
          <div className="apr2-orb apr2-orb3" />
          <div className="apr2-mesh" />

          <div className="apr2-hero-inner">
            {/* Avatar */}
            <div className="apr2-av-wrap">
              <div className="apr2-av-ring">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt="Foto profil"
                    width={88}
                    height={88}
                    className="apr2-av-img"
                    unoptimized
                  />
                ) : (
                  <div className="apr2-av-initial" aria-label={`Inisial: ${initial}`}>
                    {initial}
                  </div>
                )}
              </div>

              {/* Camera btn */}
              {editMode && (
                <button
                  className="apr2-camera"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  aria-label="Ganti foto"
                  title="Ganti foto profil"
                >
                  {uploadingAvatar
                    ? <span className="apr2-spin">⟳</span>
                    : <IconCamera size={14} />
                  }
                </button>
              )}

              <span className="apr2-online" aria-hidden="true" />
            </div>

            {/* hidden file input */}
            <label htmlFor="apr2-file" className="apr2-sr-only">Upload foto profil</label>
            <input
              id="apr2-file"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="apr2-hidden"
              onChange={handleFilePick}
              aria-label="Upload foto profil"
              title="Upload foto profil"
            />

            {/* Name */}
            {editMode ? (
              <>
                <label htmlFor="apr2-name" className="apr2-sr-only">Nama lengkap</label>
                <input
                  id="apr2-name"
                  className="apr2-name-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  maxLength={50}
                  placeholder="Nama lengkap"
                  autoFocus
                  aria-label="Nama lengkap"
                />
              </>
            ) : (
              <h1 className="apr2-name">{name}</h1>
            )}

            <p className="apr2-email">{email}</p>

            {/* Role badge */}
            <div className="apr2-role">
              <span className="apr2-role-dot" />
              Admin · PSB 2025/2026
            </div>

            {/* Stats row */}
            <div className="apr2-stats-row">
              <div className="apr2-stat">
                <span className="apr2-stat-num">PSB</span>
                <span className="apr2-stat-lbl">Sistem</span>
              </div>
              <div className="apr2-stat-div" />
              <div className="apr2-stat">
                <span className="apr2-stat-num">Admin</span>
                <span className="apr2-stat-lbl">Peran</span>
              </div>
              <div className="apr2-stat-div" />
              <div className="apr2-stat">
                <span className="apr2-stat-num">2025</span>
                <span className="apr2-stat-lbl">Tahun</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            BODY
        ══════════════════════════════════════════ */}
        <div className="apr2-body">

          {/* Navigation */}
          <p className="apr2-sect">Navigasi Cepat</p>
          <div className="apr2-card">
            {menuItems.map((item, i) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={'apr2-row' + (i > 0 ? ' apr2-row-sep' : '')}
                >
                  <div className={'apr2-icon-box ' + item.colorCls}>
                    <Icon size={18} />
                  </div>
                  <div className="apr2-row-text">
                    <p className="apr2-row-label">{item.label}</p>
                    <p className="apr2-row-sub">{item.sub}</p>
                  </div>
                  <span className="apr2-chevron"><IconChevron size={15} /></span>
                </Link>
              )
            })}
          </div>

          {/* Account info */}
          <p className="apr2-sect">Informasi Akun</p>
          <div className="apr2-card apr2-info-card">
            {[
              { key: 'Nama',   val: name,          mono: false },
              { key: 'Email',  val: email,          mono: true  },
              { key: 'Peran',  val: null,           mono: false, chip: 'Admin' },
              { key: 'Sistem', val: 'PSB 2025/2026', mono: false },
            ].map((row, i) => (
              <div key={row.key} className={'apr2-info-row' + (i > 0 ? ' apr2-info-sep' : '')}>
                <span className="apr2-info-key">{row.key}</span>
                {row.chip
                  ? <span className="apr2-chip">{row.chip}</span>
                  : <span className={'apr2-info-val' + (row.mono ? ' apr2-mono' : '')}>{row.val}</span>
                }
              </div>
            ))}
          </div>

          {/* Sign out */}
          <button
            className="apr2-signout"
            onClick={() => signOut({ callbackUrl: '/login' })}
            type="button"
            aria-label="Keluar dari akun"
          >
            <IconLogout size={16} />
            <span>Keluar dari Akun</span>
          </button>

          <p className="apr2-footer">PSB App v1.0 · Admin Panel</p>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SCOPED CSS
══════════════════════════════════════════════════════════════════════════ */
const css = `

/* ── Utilities ── */
.apr2-sr-only {
  position:absolute; width:1px; height:1px;
  padding:0; margin:-1px; overflow:hidden;
  clip:rect(0,0,0,0); white-space:nowrap; border:0;
}
.apr2-hidden { display:none; }
.no-underline { text-decoration:none; }

/* ── Page ── */
.apr2-page {
  background: #f4f3ff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100dvh;
}

/* ── App bar (override from globals.css) ── */
.adm-appbar {
  position:sticky; top:0; z-index:40;
  background:linear-gradient(90deg,rgba(30,27,75,0.85) 0%,rgba(55,48,163,0.8) 100%);
  border-bottom:1.5px solid rgba(167,139,250,0.2);
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  box-shadow:0 4px 30px rgba(99,102,241,0.15), 0 1px 2px rgba(0,0,0,0.05);
  padding:12px 18px;
  display:flex; align-items:center; justify-content:space-between;
}

.adm-appbar-left {
  display:flex; align-items:center; gap:12px; flex:1; min-width:0;
}

.adm-appbar-right {
  display:flex; align-items:center; gap:10px; flex-shrink:0;
}

.adm-appbar-greeting {
  font-size:10px; font-weight:700; letter-spacing:.1em;
  color:rgba(255,255,255,0.55); text-transform:uppercase; margin:0;
  text-shadow:0 1px 2px rgba(0,0,0,0.2);
}

.adm-appbar-name {
  font-size:15px; font-weight:900; color:#fff;
  margin:0; letter-spacing:-.3px;
  text-shadow:0 2px 8px rgba(0,0,0,0.25);
}

.adm-appbar-btn {
  width:38px; height:38px; border-radius:10px;
  background:rgba(255,255,255,0.1);
  border:1.5px solid rgba(255,255,255,0.2);
  display:flex; align-items:center; justify-content:center;
  color:#fff; cursor:pointer;
  transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-backdrop-filter:blur(10px);
  backdrop-filter:blur(10px);
}
.adm-appbar-btn:hover {
  background:rgba(255,255,255,0.15);
  border-color:rgba(255,255,255,0.35);
  transform:translateY(-1px);
}
.adm-appbar-btn:active { transform:scale(0.95); }

/* ── Toast ── */
.apr2-toast {
  position:fixed; top:70px; left:50%; transform:translateX(-50%);
  z-index:9999; display:inline-flex; align-items:center; gap:8px;
  padding:10px 18px; border-radius:100px;
  font-size:13px; font-weight:700;
  box-shadow:0 8px 32px rgba(0,0,0,0.15);
  animation:apr2ToastIn 0.3s cubic-bezier(.16,1,.3,1) both;
  white-space:nowrap; pointer-events:none;
}
@keyframes apr2ToastIn {
  from { opacity:0; transform:translateX(-50%) translateY(-8px) scale(.95); }
  to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
}
.apr2-toast-ok  { background:#ecfdf5; color:#065f46; border:1px solid #6ee7b7; }
.apr2-toast-err { background:#fef2f2; color:#991b1b; border:1px solid #fca5a5; }
.apr2-toast-icon { font-size:14px; }

/* ── App bar extras (extends .adm-appbar from globals.css) ── */
.apr2-back-btn {
  width:40px; height:40px; border-radius:12px;
  background:rgba(255,255,255,0.1);
  border:1.5px solid rgba(255,255,255,0.2);
  display:flex; align-items:center; justify-content:center;
  color:#7c3aed; cursor:pointer; 
  transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink:0;
  -webkit-backdrop-filter:blur(12px);
  backdrop-filter:blur(12px);
}
.apr2-back-btn:hover { 
  background:rgba(255,255,255,0.2); 
  border-color:rgba(255,255,255,0.4);
  transform:translateX(-2px);
}
.apr2-back-btn:active { transform:scale(0.97); }

.apr2-appbar-save {
  display:inline-flex; align-items:center; gap:6px;
  padding:10px 18px; border-radius:10px;
  background:linear-gradient(135deg,#16a34a 0%,#22c55e 100%);
  border:none; color:#fff; font-size:13px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; 
  transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:0 8px 20px rgba(34,197,94,0.25);
}
.apr2-appbar-save:disabled { 
  opacity:0.7; cursor:not-allowed; 
}
.apr2-appbar-save:not(:disabled):hover { 
  transform:translateY(-2px);
  box-shadow:0 12px 28px rgba(34,197,94,0.35);
}
.apr2-appbar-save:not(:disabled):active { 
  transform:translateY(0);
}

.apr2-appbar-cancel {
  display:inline-flex; align-items:center;
  padding:10px 16px; border-radius:10px;
  background:rgba(255,255,255,0.12);
  border:1.5px solid rgba(255,255,255,0.25);
  color:#fff; font-size:13px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; 
  transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-backdrop-filter:blur(12px);
  backdrop-filter:blur(12px);
}
.apr2-appbar-cancel:hover { 
  background:rgba(255,255,255,0.18); 
  border-color:rgba(255,255,255,0.35);
}
.apr2-appbar-cancel:active { 
  transform:scale(0.97);
}

/* ── Hero ── */
.apr2-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 20%, #312e81 45%, #3730a3 70%, #4f46e5 90%, #6d28d9 100%);
  padding: 36px 24px 40px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(165,180,252,0.1);
}

.apr2-orb { position:absolute; border-radius:50%; pointer-events:none; }
.apr2-orb1 { top:-80px; right:-60px; width:240px; height:240px;
  background:radial-gradient(circle,rgba(165,180,252,.2),transparent 68%); }
.apr2-orb2 { bottom:-40px; left:-40px; width:180px; height:180px;
  background:radial-gradient(circle,rgba(196,181,253,.16),transparent 70%); }
.apr2-orb3 { top:30%; left:40%; width:100px; height:100px;
  background:radial-gradient(circle,rgba(224,231,255,.1),transparent 70%); }

.apr2-mesh {
  position:absolute; inset:0; pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);
  background-size:32px 32px;
}

.apr2-hero-inner {
  position:relative; z-index:1;
  display:flex; flex-direction:column;
  align-items:center; gap:8px;
}

/* ── Avatar ── */
.apr2-av-wrap {
  position:relative;
  margin-bottom:8px;
}

.apr2-av-ring {
  width:108px; height:108px; border-radius:50%;
  border:3px solid rgba(255,255,255,0.35);
  background:rgba(255,255,255,0.08);
  display:flex; align-items:center; justify-content:center;
  overflow:hidden;
  box-shadow:
    0 0 0 8px rgba(167,139,250,0.12),
    0 0 0 1px rgba(255,255,255,0.15),
    0 20px 50px rgba(0,0,0,0.4),
    inset 0 1px 1px rgba(255,255,255,0.2);
  -webkit-backdrop-filter:blur(20px);
  backdrop-filter:blur(20px);
  transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);
}

.apr2-av-img {
  width:108px; height:108px;
  object-fit:cover; border-radius:50%;
}

.apr2-av-initial {
  width:96px; height:96px; border-radius:50%;
  background:linear-gradient(135deg,#c4b5fd 0%,#a78bfa 50%,#7c3aed 100%);
  display:flex; align-items:center; justify-content:center;
  font-size:38px; font-weight:900; color:#fff;
  font-family:'Plus Jakarta Sans',sans-serif;
  box-shadow:inset 0 1px 3px rgba(255,255,255,0.3);
}

.apr2-camera {
  position:absolute; bottom:0px; right:0px;
  width:32px; height:32px; border-radius:50%;
  background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%);
  border:3px solid rgba(255,255,255,0.95);
  display:flex; align-items:center; justify-content:center;
  color:#fff; cursor:pointer;
  box-shadow:
    0 4px 16px rgba(124,58,237,0.4),
    0 0 0 1px rgba(255,255,255,0.2);
  transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);
}
.apr2-camera:hover { 
  transform:scale(1.15);
  box-shadow:0 6px 24px rgba(124,58,237,0.5);
}
.apr2-camera:active { transform:scale(0.92); }

.apr2-online {
  position:absolute; bottom:6px; right:38px;
  width:15px; height:15px; border-radius:50%;
  background:#10b981; 
  border:3px solid #fff;
  box-shadow:
    0 0 0 2px rgba(15,172,145,0.3),
    0 0 12px rgba(16,185,129,0.7);
  animation:apr2PulseOnline 2s cubic-bezier(.4,0,.6,1) infinite;
}
@keyframes apr2PulseOnline {
  0%, 100% { box-shadow:0 0 0 2px rgba(15,172,145,0.3), 0 0 12px rgba(16,185,129,0.7); }
  50% { box-shadow:0 0 0 6px rgba(15,172,145,0.2), 0 0 16px rgba(16,185,129,0.9); }
}

/* ── Hero text ── */
.apr2-name {
  font-size:28px; font-weight:900; color:#fff;
  letter-spacing:-.6px; text-align:center; margin:0;
  text-shadow:0 2px 12px rgba(0,0,0,0.3);
  margin-top:4px;
}

.apr2-name-input {
  background:rgba(255,255,255,0.12);
  border:1.5px solid rgba(255,255,255,0.35);
  border-radius:14px; color:#fff;
  font-size:18px; font-weight:900;
  text-align:center; padding:12px 20px;
  font-family:'Plus Jakarta Sans',sans-serif;
  outline:none; width:260px;
  -webkit-backdrop-filter:blur(20px);
  backdrop-filter:blur(20px);
  transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);
}
.apr2-name-input::placeholder { color:rgba(255,255,255,0.4); }
.apr2-name-input:focus {
  border-color:rgba(255,255,255,0.6);
  background:rgba(255,255,255,0.15);
  box-shadow:0 0 0 4px rgba(255,255,255,0.12);
}

.apr2-email {
  font-size:13px; color:rgba(255,255,255,0.65);
  text-align:center; margin:0;
  font-weight:500;
  letter-spacing:.3px;
}

.apr2-role {
  display:inline-flex; align-items:center; gap:7px;
  padding:7px 16px; border-radius:12px;
  background:rgba(255,255,255,0.1);
  border:1.5px solid rgba(255,255,255,0.2);
  -webkit-backdrop-filter:blur(20px);
  backdrop-filter:blur(20px);
  font-size:12px; font-weight:700;
  color:rgba(255,255,255,0.9); 
  letter-spacing:.04em;
  margin-top:6px;
  transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:inset 0 1px 1px rgba(255,255,255,0.15);
}
.apr2-role:hover {
  background:rgba(255,255,255,0.12);
  border-color:rgba(255,255,255,0.3);
}
.apr2-role-dot {
  width:7px; height:7px; border-radius:50%;
  background:#10b981;
  box-shadow:0 0 8px rgba(16,185,129,0.8);
  flex-shrink:0;
  animation:apr2PulseRole 2s cubic-bezier(.4,0,.6,1) infinite;
}
@keyframes apr2PulseRole {
  0%, 100% { box-shadow:0 0 8px rgba(16,185,129,0.8); }
  50% { box-shadow:0 0 16px rgba(16,185,129,1); }
}

/* Stats row */
.apr2-stats-row {
  display:flex; align-items:center; gap:0;
  background:rgba(255,255,255,0.08);
  border:1.5px solid rgba(255,255,255,0.15);
  border-radius:18px; padding:16px 24px;
  margin-top:12px; gap:24px;
  -webkit-backdrop-filter:blur(20px);
  backdrop-filter:blur(20px);
  box-shadow:inset 0 1px 1px rgba(255,255,255,0.15);
}
.apr2-stat {
  display:flex; flex-direction:column;
  align-items:center; gap:3px;
}
.apr2-stat-num {
  font-size:14px; font-weight:900; color:#fff;
  letter-spacing:-.3px;
}
.apr2-stat-lbl {
  font-size:10px; font-weight:700;
  color:rgba(255,255,255,0.5);
  text-transform:uppercase; letter-spacing:.08em;
}
.apr2-stat-div {
  width:1.5px; height:32px;
  background:linear-gradient(180deg,transparent,rgba(255,255,255,0.2),transparent);
}

/* ── Body ── */
.apr2-body {
  padding:24px 16px 120px;
  display:flex; flex-direction:column; gap:16px;
}

.apr2-sect {
  font-size:11px; font-weight:800;
  letter-spacing:.12em; text-transform:uppercase;
  color:#7c3aed; padding:0 2px; margin-top:8px;
  text-shadow:0 1px 2px rgba(0,0,0,0.02);
}

/* ── Card ── */
.apr2-card {
  background:#fff; border-radius:24px; overflow:hidden;
  box-shadow:0 8px 32px rgba(99,102,241,0.12), 0 2px 6px rgba(0,0,0,0.06);
  border:1.5px solid rgba(167,139,250,0.15);
  transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);
}
.apr2-card:hover {
  box-shadow:0 12px 48px rgba(99,102,241,0.15), 0 2px 8px rgba(0,0,0,0.08);
  border-color:rgba(167,139,250,0.25);
}

/* ── Nav rows ── */
.apr2-row {
  display:flex; align-items:center; gap:14px;
  padding:15px 18px; 
  transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);
  color:inherit; text-decoration:none;
}
.apr2-row:hover  { 
  background:linear-gradient(90deg,#faf9ff,#f5f3ff);
  padding-left:22px;
}
.apr2-row:active { background:#f0ecff; }
.apr2-row-sep { border-top:1px solid #f9f8ff; }

.apr2-icon-box {
  width:44px; height:44px; border-radius:14px;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
  transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:0 2px 8px rgba(0,0,0,0.05);
}
.apr2-row:hover .apr2-icon-box {
  transform:scale(1.08);
  box-shadow:0 4px 12px rgba(0,0,0,0.1);
}
.apr2-icon-violet { background:#ede9fe; color:#7c3aed; }
.apr2-icon-amber  { background:#fef3c7; color:#d97706; }
.apr2-icon-blue   { background:#dbeafe; color:#2563eb; }

.apr2-row-text { flex:1; min-width:0; }
.apr2-row-label { font-size:13px; font-weight:700; color:#1e1b4b; margin-bottom:2px; }
.apr2-row-sub   { font-size:11px; color:#94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.apr2-chevron   { color:#d8bfd8; flex-shrink:0; display:flex; align-items:center; transition:all .2s; }
.apr2-row:hover .apr2-chevron { color:#c084fc; transform:translateX(2px); }

/* ── Info card ── */
.apr2-info-card  { padding:2px 0; }
.apr2-info-row   { 
  display:flex; align-items:center; justify-content:space-between; 
  padding:15px 18px; gap:12px;
  transition:background .2s;
}
.apr2-info-row:hover { background:#faf9ff; }
.apr2-info-sep   { border-top:1px solid #f9f8ff; }
.apr2-info-key   { 
  font-size:12px; font-weight:700; color:#7c3aed; 
  flex-shrink:0; min-width:60px;
  text-transform:uppercase; letter-spacing:.8px;
}
.apr2-info-val   { 
  font-size:13px; font-weight:600; color:#1e1b4b; 
  text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.apr2-mono       { font-size:11px; color:#64748b; font-weight:500; font-family:monospace; }
.apr2-chip       { 
  display:inline-flex; align-items:center; padding:5px 14px; 
  border-radius:8px; background:linear-gradient(135deg,#ede9fe,#f3e8ff); 
  color:#6d28d9; font-size:12px; font-weight:700;
  border:1px solid rgba(167,139,250,0.3);
  box-shadow:0 2px 6px rgba(109,40,217,0.1);
}

/* ── Sign out ── */
.apr2-signout {
  width:100%; display:flex; align-items:center;
  justify-content:center; gap:9px;
  padding:16px; border-radius:16px;
  border:1.5px solid #fecaca;
  background:linear-gradient(135deg,#fff5f5,#fef2f2);
  color:#dc2626; font-size:13px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; 
  transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top:4px;
  box-shadow:0 4px 12px rgba(220,38,38,0.1);
}
.apr2-signout:hover {
  background:linear-gradient(135deg,#fee2e2,#fecaca);
  border-color:#f87171;
  box-shadow:0 8px 20px rgba(220,38,38,0.2);
  transform:translateY(-2px);
}
.apr2-signout:active { 
  transform:scale(0.98);
  box-shadow:0 2px 8px rgba(220,38,38,0.1);
}

.apr2-footer {
  text-align:center; font-size:11px; color:#cbd5e1;
  margin-top:4px; padding-bottom:8px;
  letter-spacing:.5px;
}

/* ── Spin animation ── */
.apr2-spin { display:inline-block; animation:apr2Spin .7s linear infinite; }
@keyframes apr2Spin { to { transform:rotate(360deg); } }
`