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

// ── Component ──────────────────────────────────────────────────────────────
export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  // ✅ supabaseAdmin — bypass RLS, aman karena Server Component
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

  // ✅ supabaseAdmin — bypass RLS, aman karena Server Component
  const { data: terbaru } = await supabaseAdmin
    .from("pendaftaran")
    .select("id, nama_lengkap, jurusan_pilihan, status")
    .order("created_at", { ascending: false })
    .limit(5)

  const firstName = session?.user.name?.split(" ")[0] ?? "Admin"

  const statItems = [
    { label: "Total Pendaftar", value: stats.total,    icon: "👥", cardCls: "stat-card-violet"  },
    { label: "Menunggu Review", value: stats.menunggu, icon: "⏳", cardCls: "stat-card-amber"   },
    { label: "Diterima",        value: stats.diterima, icon: "✅", cardCls: "stat-card-emerald" },
    { label: "Ditolak",         value: stats.ditolak,  icon: "❌", cardCls: "stat-card-rose"    },
  ]

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
                <div className="admin-action-bg-icon">📋</div>
                <div className="admin-action-icon">📋</div>
                <p className="admin-action-name">Semua Pendaftar</p>
                <p className="admin-action-sub">{stats.total} total</p>
              </div>
            </Link>

            <Link href="/admin/verifikasi" className="no-underline">
              <div className={"admin-action-card " + (stats.menunggu > 0 ? "admin-action-amber" : "admin-action-blue")}>
                <div className="admin-action-bg-icon">⚡</div>
                {stats.menunggu > 0 && (
                  <div className="admin-action-badge">{stats.menunggu}</div>
                )}
                <div className="admin-action-icon">⚡</div>
                <p className="admin-action-name">Verifikasi</p>
                <p className="admin-action-sub">
                  {stats.menunggu > 0 ? `${stats.menunggu} menunggu` : "Semua selesai"}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Status Distribution Bar */}
        {stats.total > 0 && (
          <div className="admin-card admin-section">
            <p className="admin-dist-title">DISTRIBUSI STATUS</p>
            <div className="admin-dist-bar">
              {stats.diterima > 0 && (
                <div className="admin-dist-seg admin-dist-diterima"
                  data-pct={Math.round((stats.diterima / stats.total) * 100)} />
              )}
              {stats.diproses > 0 && (
                <div className="admin-dist-seg admin-dist-diproses"
                  data-pct={Math.round((stats.diproses / stats.total) * 100)} />
              )}
              {stats.menunggu > 0 && (
                <div className="admin-dist-seg admin-dist-menunggu"
                  data-pct={Math.round((stats.menunggu / stats.total) * 100)} />
              )}
              {stats.ditolak > 0 && (
                <div className="admin-dist-seg admin-dist-ditolak"
                  data-pct={Math.round((stats.ditolak / stats.total) * 100)} />
              )}
            </div>
            <div className="admin-dist-legend">
              {[
                { key: "diterima", label: "Diterima", dotCls: "dot-emerald", val: stats.diterima },
                { key: "diproses", label: "Diproses", dotCls: "dot-blue",    val: stats.diproses },
                { key: "menunggu", label: "Menunggu", dotCls: "dot-amber",   val: stats.menunggu },
                { key: "ditolak",  label: "Ditolak",  dotCls: "dot-rose",    val: stats.ditolak  },
              ].map(s => (
                <div key={s.key} className="admin-legend-item">
                  <div className={"admin-legend-dot " + s.dotCls} />
                  <span className="admin-legend-label">{s.label}</span>
                  <span className="admin-legend-value">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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