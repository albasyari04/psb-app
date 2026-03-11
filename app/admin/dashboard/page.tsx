import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"
import Link from "next/link"

// ── Types ──────────────────────────────────────────────────────────────────
interface StatusRow {
  status: string
}

interface Pendaftaran {
  id: string
  nama_lengkap: string
  jurusan_pilihan: string
  status: "menunggu" | "diproses" | "diterima" | "ditolak"
}

// ── Config ─────────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; cls: string }> = {
  menunggu: { label: "Menunggu", cls: "status-menunggu" },
  diproses: { label: "Diproses", cls: "status-diproses" },
  diterima: { label: "Diterima", cls: "status-diterima" },
  ditolak:  { label: "Ditolak",  cls: "status-ditolak"  },
}

const avatarCls = [
  "avatar-violet", "avatar-blue", "avatar-emerald",
  "avatar-rose", "avatar-amber",
]

// ── SVG Icons ──────────────────────────────────────────────────────────────
function IconUsers({ size = 22 }: { size?: number }) {
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

function IconVerifikasi({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  )
}

function IconBell({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function IconSettings({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

// ── Bar Chart Helper ───────────────────────────────────────────────────────
function buildBarSegments(stats: {
  total: number; menunggu: number; diproses: number;
  diterima: number; ditolak: number;
}) {
  const maxVal = Math.max(stats.menunggu, stats.diproses, stats.diterima, stats.ditolak, 1)
  return [
    { key: "diterima", label: "Diterima", value: stats.diterima, barCls: "adm-bar-emerald", pct: Math.round((stats.diterima / maxVal) * 100) },
    { key: "menunggu", label: "Menunggu", value: stats.menunggu, barCls: "adm-bar-amber",   pct: Math.round((stats.menunggu / maxVal) * 100) },
    { key: "diproses", label: "Diproses", value: stats.diproses, barCls: "adm-bar-blue",    pct: Math.round((stats.diproses / maxVal) * 100) },
    { key: "ditolak",  label: "Ditolak",  value: stats.ditolak,  barCls: "adm-bar-rose",    pct: Math.round((stats.ditolak  / maxVal) * 100) },
  ]
}

// ── Component ──────────────────────────────────────────────────────────────
export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  const { data: semua } = await supabaseAdmin
    .from("pendaftaran")
    .select("status")

  const rows = (semua ?? []) as StatusRow[]

  const stats = {
    total:    rows.length,
    menunggu: rows.filter((p) => p.status === "menunggu").length,
    diproses: rows.filter((p) => p.status === "diproses").length,
    diterima: rows.filter((p) => p.status === "diterima").length,
    ditolak:  rows.filter((p) => p.status === "ditolak").length,
  }

  const acceptRate = stats.total > 0
    ? Math.round((stats.diterima / stats.total) * 100)
    : 0

  const { data: terbaru } = await supabaseAdmin
    .from("pendaftaran")
    .select("id, nama_lengkap, jurusan_pilihan, status")
    .order("created_at", { ascending: false })
    .limit(5)

  const firstName  = session?.user.name?.split(" ")[0] ?? "Admin"
  const barSegments = buildBarSegments(stats)

  // ring circumference for r=42: 2πr ≈ 263.89
  const CIRC       = 263.89
  const ringDash   = (acceptRate / 100) * CIRC

  return (
    <div className="app-shell adm-bg">

      {/* ════════════════════════════════════════════════
          APP BAR
      ════════════════════════════════════════════════ */}
      <div className="adm-appbar">
        <div className="adm-appbar-left">
          <div className="adm-appbar-avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="adm-appbar-greeting">Selamat datang 👋</p>
            <p className="adm-appbar-name">{firstName}</p>
          </div>
        </div>
        <div className="adm-appbar-right">
          <Link href="/admin/profile" className="adm-appbar-btn no-underline">
            <IconSettings size={18} />
          </Link>
          <div className="adm-appbar-btn adm-appbar-bell-wrap">
            <IconBell size={18} />
            {stats.menunggu > 0 && <span className="adm-appbar-notif" />}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          HERO BANNER
      ════════════════════════════════════════════════ */}
      <div className="adm-hero">
        <div className="adm-orb adm-orb-1" />
        <div className="adm-orb adm-orb-2" />
        <div className="adm-orb adm-orb-3" />
        <div className="adm-hero-mesh" />

        <div className="adm-hero-inner">
          <div className="adm-hero-eyebrow">
            <span className="adm-hero-eyebrow-dot" />
            PSB 2025/2026 · PANEL AKTIF
          </div>

          <div className="adm-hero-body">
            {/* Ring gauge */}
            <div className="adm-ring-wrap">
              <svg viewBox="0 0 100 100" width="108" height="108">
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke="rgba(255,255,255,0.12)" strokeWidth="9" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke="rgba(255,255,255,0.92)" strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${ringDash} ${CIRC}`}
                  strokeDashoffset={CIRC * 0.25}
                  className="adm-ring-arc"
                />
              </svg>
              <div className="adm-ring-inner">
                <span className="adm-ring-num">{acceptRate}</span>
                <span className="adm-ring-pct">%</span>
              </div>
            </div>

            {/* Text info */}
            <div className="adm-hero-info">
              <p className="adm-hero-info-title">Tingkat Penerimaan</p>
              <p className="adm-hero-info-sub">
                dari <strong>{stats.total}</strong> total pendaftar
              </p>
              <div className="adm-hero-chips">
                <span className="adm-chip adm-chip-green">
                  <span className="adm-chip-dot" />
                  {stats.diterima} diterima
                </span>
                <span className="adm-chip adm-chip-red">
                  <span className="adm-chip-dot" />
                  {stats.ditolak} ditolak
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════════════ */}
      <div className="adm-main">

        {/* ── Bar Chart Card ───────────────────────────── */}
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <p className="adm-card-title">Statistik Pendaftar</p>
              <p className="adm-card-sub">Distribusi status saat ini</p>
            </div>
            <div className="adm-total-pill">
              <span className="adm-total-pill-num">{stats.total}</span>
              <span className="adm-total-pill-lbl">Total</span>
            </div>
          </div>

          <div className="adm-barchart">
            {barSegments.map((seg) => {
              const w = stats.total > 0
                ? Math.max(seg.pct, seg.value > 0 ? 5 : 0)
                : 0
              const sharePct = stats.total > 0
                ? Math.round((seg.value / stats.total) * 100)
                : 0
              return (
                <div key={seg.key} className="adm-bar-row">
                  <span className="adm-bar-label">{seg.label}</span>
                  <div className="adm-bar-track">
                    <div
                      className={"adm-bar-fill " + seg.barCls}
                      data-w={w}
                    />
                  </div>
                  <div className="adm-bar-right">
                    <span className="adm-bar-val">{seg.value}</span>
                    <span className="adm-bar-pct">{sharePct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Akses Cepat ──────────────────────────────── */}
        <div>
          <p className="adm-section-title">Akses Cepat</p>
          <div className="adm-actions-grid">
            <Link href="/admin/pendaftar" className="no-underline">
              <div className="adm-action-card adm-action-violet">
                <div className="adm-action-bg-icon">
                  <IconUsers size={56} />
                </div>
                <div className="adm-action-icon">
                  <IconUsers size={28} />
                </div>
                <p className="adm-action-name">Semua Pendaftar</p>
                <p className="adm-action-sub">{stats.total} total</p>
              </div>
            </Link>

            <Link href="/admin/verifikasi" className="no-underline">
              <div className={"adm-action-card " + (stats.menunggu > 0 ? "adm-action-amber" : "adm-action-blue")}>
                <div className="adm-action-bg-icon">
                  <IconVerifikasi size={56} />
                </div>
                {stats.menunggu > 0 && (
                  <div className="adm-action-badge">{stats.menunggu}</div>
                )}
                <div className="adm-action-icon">
                  <IconVerifikasi size={28} />
                </div>
                <p className="adm-action-name">Verifikasi</p>
                <p className="adm-action-sub">
                  {stats.menunggu > 0 ? `${stats.menunggu} menunggu` : "Semua selesai"}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Pendaftar Terbaru ─────────────────────────── */}
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <p className="adm-card-title">Pendaftar Terbaru</p>
              <p className="adm-card-sub">5 entri terakhir</p>
            </div>
            <Link href="/admin/pendaftar" className="adm-see-all no-underline">
              Lihat semua →
            </Link>
          </div>

          {terbaru && terbaru.length > 0 ? (
            <div className="adm-list">
              {(terbaru as Pendaftaran[]).map((p, i) => {
                const cfg = statusConfig[p.status] ?? statusConfig.menunggu
                return (
                  <Link
                    key={p.id ?? i}
                    href={"admin/pendaftar/" + p.id}
                    className="adm-list-row no-underline"
                  >
                    <div className={"admin-avatar " + avatarCls[i % avatarCls.length]}>
                      {p.nama_lengkap?.charAt(0) ?? "?"}
                    </div>
                    <div className="adm-list-info">
                      <p className="adm-list-name">{p.nama_lengkap}</p>
                      <p className="adm-list-sub">{p.jurusan_pilihan}</p>
                    </div>
                    <div className={"admin-status-pill " + cfg.cls}>
                      <div className="admin-status-dot" />
                      {cfg.label}
                    </div>
                    <span className="adm-chevron">›</span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="admin-empty">
              <div className="admin-empty-icon">📭</div>
              <p className="admin-empty-title">Belum ada pendaftar</p>
              <p className="admin-empty-sub">Data akan muncul saat ada pendaftar baru</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}