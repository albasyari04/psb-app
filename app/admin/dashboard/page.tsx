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
  "avatar-violet",
  "avatar-blue",
  "avatar-emerald",
  "avatar-rose",
  "avatar-amber",
]

// ── Donut Chart Helper ─────────────────────────────────────────────────────
function buildDonutSegments(
  data: { value: number; color: string }[],
  radius = 54
) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return []

  const circumference = 2 * Math.PI * radius
  let cumulative = 0

  return data.map((d) => {
    const pct = d.value / total
    const dash = pct * circumference
    const gap  = circumference - dash
    const offset = circumference * (1 - cumulative)
    cumulative += pct
    return { ...d, dash, gap, offset, circumference }
  })
}

// ── SVG Icons (match navbar icons) ────────────────────────────────────────
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

// ── Component ──────────────────────────────────────────────────────────────
export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  const { data: semua } = await supabaseAdmin
    .from("pendaftaran")
    .select("status")

  const rows = (semua ?? []) as StatusRow[]

  const stats = {
    total:    rows.length,
    menunggu: rows.filter((p: StatusRow) => p.status === "menunggu").length,
    diproses: rows.filter((p: StatusRow) => p.status === "diproses").length,
    diterima: rows.filter((p: StatusRow) => p.status === "diterima").length,
    ditolak:  rows.filter((p: StatusRow) => p.status === "ditolak").length,
  }

  const acceptRate = stats.total > 0
    ? Math.round((stats.diterima / stats.total) * 100)
    : 0

  const { data: terbaru } = await supabaseAdmin
    .from("pendaftaran")
    .select("id, nama_lengkap, jurusan_pilihan, status")
    .order("created_at", { ascending: false })
    .limit(5)

  const firstName = session?.user.name?.split(" ")[0] ?? "Admin"

  const statItems = [
    { label: "Total Pendaftar", value: stats.total,    icon: <IconUsers size={22} />,    cardCls: "stat-card-violet"  },
    { label: "Menunggu Review", value: stats.menunggu, icon: "⏳",                        cardCls: "stat-card-amber"   },
    { label: "Diterima",        value: stats.diterima, icon: "✅",                        cardCls: "stat-card-emerald" },
    { label: "Ditolak",         value: stats.ditolak,  icon: "❌",                        cardCls: "stat-card-rose"    },
  ]

  // Donut chart data
  const donutData = [
    { value: stats.diterima, color: "#10b981", label: "Diterima" },
    { value: stats.diproses, color: "#3b82f6", label: "Diproses" },
    { value: stats.menunggu, color: "#f59e0b", label: "Menunggu" },
    { value: stats.ditolak,  color: "#ef4444", label: "Ditolak"  },
  ]
  const donutSegments = buildDonutSegments(donutData)
  const hasData = stats.total > 0

  return (
    <div className="app-shell admin-dashboard-bg">

      {/* ── Hero Header ──────────────────────────────────────── */}
      <div className="admin-hero">
        <div className="admin-hero-orb admin-hero-orb-1" />
        <div className="admin-hero-orb admin-hero-orb-2" />
        <div className="admin-hero-orb admin-hero-orb-3" />

        <div className="admin-hero-content">
          <div className="admin-online-badge">
            <span className="admin-online-dot" />
            <span>PANEL ADMIN · PSB 2025/2026</span>
          </div>

          <h1 className="admin-hero-title">Selamat datang, {firstName}! 👋</h1>
          <p className="admin-hero-subtitle">
            Pantau seluruh aktivitas penerimaan siswa baru
          </p>

          <div className="admin-rate-card">
            <div>
              <p className="admin-rate-label">Tingkat Penerimaan</p>
              <div className="admin-rate-value-row">
                <span className="admin-rate-number">{acceptRate}</span>
                <span className="admin-rate-pct">%</span>
              </div>
              <p className="admin-rate-sublabel">dari {stats.total} pendaftar</p>
            </div>
            <div className="admin-rate-badge">
              <span className="admin-rate-badge-icon">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="admin-main">

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          {statItems.map(item => (
            <div key={item.label} className={"admin-stat-card " + item.cardCls}>
              <div className="admin-stat-icon">{item.icon}</div>
              <div className="admin-stat-value">{item.value}</div>
              <div className="admin-stat-label">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="admin-section">
          <p className="admin-section-title">Akses Cepat</p>
          <div className="admin-actions-grid">

            <Link href="/admin/pendaftar" className="no-underline">
              <div className="admin-action-card admin-action-violet">
                {/* Background decorative icon */}
                <div className="admin-action-bg-svg">
                  <IconUsers size={52} />
                </div>
                <div className="admin-action-icon-svg">
                  <IconUsers size={26} />
                </div>
                <p className="admin-action-name">Semua Pendaftar</p>
                <p className="admin-action-sub">{stats.total} total</p>
              </div>
            </Link>

            <Link href="/admin/verifikasi" className="no-underline">
              <div className={"admin-action-card " + (stats.menunggu > 0 ? "admin-action-amber" : "admin-action-blue")}>
                <div className="admin-action-bg-svg">
                  <IconVerifikasi size={52} />
                </div>
                {stats.menunggu > 0 && (
                  <div className="admin-action-badge">{stats.menunggu}</div>
                )}
                <div className="admin-action-icon-svg">
                  <IconVerifikasi size={26} />
                </div>
                <p className="admin-action-name">Verifikasi</p>
                <p className="admin-action-sub">
                  {stats.menunggu > 0 ? `${stats.menunggu} menunggu` : "Semua selesai"}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Distribusi Status — Donut Chart ──────────────── */}
        <div className="admin-card admin-section">
          <p className="admin-dist-title">DISTRIBUSI STATUS</p>

          {hasData ? (
            <div className="admin-donut-wrap">
              {/* Donut SVG */}
              <div className="admin-donut-svg-wrap">
                <svg viewBox="0 0 128 128" width="128" height="128" className="admin-donut-svg">
                  {/* track */}
                  <circle
                    cx="64" cy="64" r="54"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                  />
                  {donutSegments.map((seg, i) => (
                    <circle
                      key={i}
                      cx="64" cy="64" r="54"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={`${seg.dash} ${seg.gap}`}
                      strokeDashoffset={seg.offset}
                      strokeLinecap="butt"
                      className="admin-donut-segment"
                    />
                  ))}
                  {/* center text */}
                  <text x="64" y="58" textAnchor="middle" className="admin-donut-text-total">
                    {stats.total}
                  </text>
                  <text x="64" y="72" textAnchor="middle" className="admin-donut-text-label">
                    TOTAL
                  </text>
                </svg>
              </div>

              {/* Legend + values */}
              <div className="admin-donut-legend">
                {[
                  { key: "diterima", label: "Diterima", dotCls: "admin-donut-dot-emerald", val: stats.diterima },
                  { key: "diproses", label: "Diproses", dotCls: "admin-donut-dot-blue",    val: stats.diproses },
                  { key: "menunggu", label: "Menunggu", dotCls: "admin-donut-dot-amber",   val: stats.menunggu },
                  { key: "ditolak",  label: "Ditolak",  dotCls: "admin-donut-dot-rose",    val: stats.ditolak  },
                ].map(s => {
                  const pct = stats.total > 0 ? Math.round((s.val / stats.total) * 100) : 0
                  return (
                    <div key={s.key} className="admin-donut-legend-row">
                      <div className="admin-donut-legend-left">
                        <div className={"admin-donut-legend-dot " + s.dotCls} />
                        <span className="admin-donut-legend-label">{s.label}</span>
                      </div>
                      <div className="admin-donut-legend-right">
                        <span className="admin-donut-legend-val">{s.val}</span>
                        <span className="admin-donut-legend-pct">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="admin-empty">
              <div className="admin-empty-icon">📊</div>
              <p className="admin-empty-title">Belum ada data</p>
              <p className="admin-empty-sub">Diagram akan muncul saat ada pendaftar</p>
            </div>
          )}
        </div>

        {/* Pendaftar Terbaru */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-card-title">Pendaftar Terbaru</p>
              <p className="admin-card-sub">5 entri terakhir</p>
            </div>
            <Link href="/admin/pendaftar" className="admin-see-all no-underline">
              Lihat semua →
            </Link>
          </div>

          {terbaru && terbaru.length > 0 ? (
            <div className="admin-list">
              {(terbaru as Pendaftaran[]).map((p, i) => {
                const cfg = statusConfig[p.status] ?? statusConfig.menunggu
                return (
                  <Link
                    key={p.id ?? i}
                    href={"admin/pendaftar/" + p.id}
                    className="admin-list-row no-underline"
                  >
                    <div className={"admin-avatar " + avatarCls[i % avatarCls.length]}>
                      {p.nama_lengkap?.charAt(0) ?? "?"}
                    </div>
                    <div className="admin-list-info">
                      <p className="admin-list-name">{p.nama_lengkap}</p>
                      <p className="admin-list-sub">{p.jurusan_pilihan}</p>
                    </div>
                    <div className={"admin-status-pill " + cfg.cls}>
                      <div className="admin-status-dot" />
                      {cfg.label}
                    </div>
                    <span className="admin-chevron">›</span>
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