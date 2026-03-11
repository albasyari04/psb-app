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
  width:36px; height:36px; border-radius:10px;
  background:#f4f3ff; border:1px solid rgba(124,58,237,0.1);
  display:flex; align-items:center; justify-content:center;
  color:#7c3aed; cursor:pointer; transition:background .15s;
  flex-shrink:0;
}
.apr2-back-btn:hover { background:#ede9fe; }

.apr2-appbar-save {
  display:inline-flex; align-items:center; gap:5px;
  padding:7px 14px; border-radius:100px;
  background:linear-gradient(135deg,#16a34a,#4ade80);
  border:none; color:#fff; font-size:12px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; transition:all .15s;
  box-shadow:0 3px 10px rgba(74,222,128,.3);
}
.apr2-appbar-save:disabled { opacity:.7; cursor:not-allowed; }
.apr2-appbar-save:not(:disabled):hover { transform:translateY(-1px); }

.apr2-appbar-cancel {
  display:inline-flex; align-items:center;
  padding:7px 12px; border-radius:100px;
  background:#f4f3ff; border:1px solid rgba(124,58,237,0.15);
  color:#7c3aed; font-size:12px; font-weight:600;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; transition:background .15s;
}
.apr2-appbar-cancel:hover { background:#ede9fe; }

/* ── Hero ── */
.apr2-hero {
  background: linear-gradient(150deg, #1e1b4b 0%, #3730a3 25%, #4f46e5 55%, #6d28d9 80%, #7c3aed 100%);
  padding: 32px 24px 36px;
  position: relative;
  overflow: hidden;
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
  margin-bottom:4px;
}

.apr2-av-ring {
  width:96px; height:96px; border-radius:50%;
  border:3px solid rgba(255,255,255,0.25);
  background:rgba(255,255,255,0.1);
  display:flex; align-items:center; justify-content:center;
  overflow:hidden;
  box-shadow:
    0 0 0 6px rgba(167,139,250,0.15),
    0 12px 40px rgba(0,0,0,0.3);
  -webkit-backdrop-filter:blur(10px);
  backdrop-filter:blur(10px);
}

.apr2-av-img {
  width:96px; height:96px;
  object-fit:cover; border-radius:50%;
}

.apr2-av-initial {
  width:80px; height:80px; border-radius:50%;
  background:linear-gradient(135deg,#a78bfa,#7c3aed);
  display:flex; align-items:center; justify-content:center;
  font-size:32px; font-weight:800; color:#fff;
  font-family:'Plus Jakarta Sans',sans-serif;
}

.apr2-camera {
  position:absolute; bottom:2px; right:2px;
  width:28px; height:28px; border-radius:50%;
  background:linear-gradient(135deg,#7c3aed,#4f46e5);
  border:2.5px solid #fff;
  display:flex; align-items:center; justify-content:center;
  color:#fff; cursor:pointer;
  box-shadow:0 2px 8px rgba(0,0,0,.3);
  transition:transform .15s;
}
.apr2-camera:hover { transform:scale(1.1); }

.apr2-online {
  position:absolute; bottom:5px; right:28px;
  width:13px; height:13px; border-radius:50%;
  background:#4ade80; border:2.5px solid #4f46e5;
  box-shadow:0 0 8px rgba(74,222,128,.7);
}

/* ── Hero text ── */
.apr2-name {
  font-size:24px; font-weight:900; color:#fff;
  letter-spacing:-.5px; text-align:center; margin:0;
  text-shadow:0 2px 12px rgba(0,0,0,.2);
}

.apr2-name-input {
  background:rgba(255,255,255,.15);
  border:1.5px solid rgba(255,255,255,.4);
  border-radius:14px; color:#fff;
  font-size:17px; font-weight:700;
  text-align:center; padding:9px 18px;
  font-family:'Plus Jakarta Sans',sans-serif;
  outline:none; width:240px;
  -webkit-backdrop-filter:blur(8px);
  backdrop-filter:blur(8px);
}
.apr2-name-input::placeholder { color:rgba(255,255,255,.45); }
.apr2-name-input:focus {
  border-color:rgba(255,255,255,.7);
  box-shadow:0 0 0 3px rgba(255,255,255,.1);
}

.apr2-email {
  font-size:12px; color:rgba(255,255,255,.55);
  text-align:center; margin:0;
}

.apr2-role {
  display:inline-flex; align-items:center; gap:6px;
  padding:5px 14px; border-radius:100px;
  background:rgba(255,255,255,.1);
  border:1px solid rgba(255,255,255,.18);
  -webkit-backdrop-filter:blur(10px);
  backdrop-filter:blur(10px);
  font-size:11px; font-weight:700;
  color:rgba(255,255,255,.85); letter-spacing:.04em;
  margin-top:2px;
}
.apr2-role-dot {
  width:6px; height:6px; border-radius:50%;
  background:#4ade80;
  box-shadow:0 0 6px rgba(74,222,128,.8);
  flex-shrink:0;
}

/* Stats row */
.apr2-stats-row {
  display:flex; align-items:center; gap:0;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.12);
  border-radius:16px; padding:12px 20px;
  margin-top:8px; gap:20px;
  -webkit-backdrop-filter:blur(12px);
  backdrop-filter:blur(12px);
}
.apr2-stat {
  display:flex; flex-direction:column;
  align-items:center; gap:2px;
}
.apr2-stat-num {
  font-size:13px; font-weight:800; color:#fff;
  letter-spacing:-.2px;
}
.apr2-stat-lbl {
  font-size:9px; font-weight:600;
  color:rgba(255,255,255,.45);
  text-transform:uppercase; letter-spacing:.06em;
}
.apr2-stat-div {
  width:1px; height:28px;
  background:rgba(255,255,255,.15);
}

/* ── Body ── */
.apr2-body {
  padding:18px 16px 110px;
  display:flex; flex-direction:column; gap:10px;
}

.apr2-sect {
  font-size:10px; font-weight:700;
  letter-spacing:.09em; text-transform:uppercase;
  color:#94a3b8; padding:0 2px; margin-top:4px;
}

/* ── Card ── */
.apr2-card {
  background:#fff; border-radius:22px; overflow:hidden;
  box-shadow:0 4px 24px rgba(99,102,241,.08), 0 1px 4px rgba(0,0,0,.04);
  border:1px solid rgba(167,139,250,.1);
}

/* ── Nav rows ── */
.apr2-row {
  display:flex; align-items:center; gap:13px;
  padding:13px 16px; transition:background .15s;
  color:inherit; text-decoration:none;
}
.apr2-row:hover  { background:#faf9ff; }
.apr2-row:active { background:#f3f0ff; }
.apr2-row-sep { border-top:1px solid #f4f3ff; }

.apr2-icon-box {
  width:40px; height:40px; border-radius:12px;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
}
.apr2-icon-violet { background:#ede9fe; color:#7c3aed; }
.apr2-icon-amber  { background:#fef3c7; color:#d97706; }
.apr2-icon-blue   { background:#dbeafe; color:#2563eb; }

.apr2-row-text { flex:1; min-width:0; }
.apr2-row-label { font-size:13px; font-weight:700; color:#0f172a; margin-bottom:1px; }
.apr2-row-sub   { font-size:11px; color:#94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.apr2-chevron   { color:#c4b5fd; flex-shrink:0; display:flex; align-items:center; }

/* ── Info card ── */
.apr2-info-card  { padding:2px 0; }
.apr2-info-row   { display:flex; align-items:center; justify-content:space-between; padding:13px 16px; gap:8px; }
.apr2-info-sep   { border-top:1px solid #f4f3ff; }
.apr2-info-key   { font-size:12px; font-weight:600; color:#94a3b8; flex-shrink:0; min-width:56px; }
.apr2-info-val   { font-size:13px; font-weight:600; color:#1e1b4b; text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.apr2-mono       { font-size:11px; color:#64748b; font-weight:500; }
.apr2-chip       { display:inline-flex; align-items:center; padding:3px 12px; border-radius:100px; background:#ede9fe; color:#6d28d9; font-size:11px; font-weight:700; }

/* ── Sign out ── */
.apr2-signout {
  width:100%; display:flex; align-items:center;
  justify-content:center; gap:8px;
  padding:14px; border-radius:18px;
  border:1.5px solid #fecaca; background:#fff5f5;
  color:#dc2626; font-size:13px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; transition:all .2s; margin-top:2px;
}
.apr2-signout:hover {
  background:#fee2e2; border-color:#f87171;
  box-shadow:0 4px 16px rgba(220,38,38,.12);
  transform:translateY(-1px);
}
.apr2-signout:active { transform:scale(.98); box-shadow:none; }

.apr2-footer {
  text-align:center; font-size:11px; color:#cbd5e1;
  margin-top:2px; padding-bottom:4px;
}

/* ── Spin animation ── */
.apr2-spin { display:inline-block; animation:apr2Spin .7s linear infinite; }
@keyframes apr2Spin { to { transform:rotate(360deg); } }
`