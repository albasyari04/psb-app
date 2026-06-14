"use client";
import { useState } from "react";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────
interface IconProps {
  active: boolean;
}

type CategoryKey = "PENTING" | "INFORMASI" | "KEGIATAN" | "PENGUMUMAN";

interface Announcement {
  id: number;
  category: CategoryKey;
  categoryColor: string;
  categoryBg: string;
  date: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
}

interface Category {
  id: string;
  label: string;
  count: number;
  imgSrc?: string;
  color: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<IconProps>;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const announcements: Announcement[] = [
  {
    id: 1,
    category: "PENTING",
    categoryColor: "#EF4444",
    categoryBg: "#FEE2E2",
    date: "08 Jun 2024",
    title: "Peraturan Penggunaan Alat Elektronik",
    description:
      "Santri dilarang keras membawa alat elektronik seperti HP, MP3, dan lain-lain ke dalam lingkungan pesantren.",
    icon: "/icons/icon penting.png",
    iconBg: "transparent",
  },
  {
    id: 2,
    category: "INFORMASI",
    categoryColor: "#3B82F6",
    categoryBg: "#DBEAFE",
    date: "30 Mei 2024",
    title: "Penyerahan Laporan Perkembangan Santri",
    description:
      "Wali santri harap segera berkumpul di pondok pesantren untuk penyerahan laporan perkembangan.",
    icon: "/icons/informasi icon.png",
    iconBg: "transparent",
  },
  {
    id: 3,
    category: "KEGIATAN",
    categoryColor: "#22C55E",
    categoryBg: "#DCFCE7",
    date: "28 Mei 2024",
    title: "Kajian Rutin Bulanan",
    description:
      "Kajian rutin bulanan akan dilaksanakan pada hari Ahad, 2 Juni 2024 di Aula Pondok Pesantren.",
    icon: "/icons/kegiatan icon.png",
    iconBg: "transparent",
  },
  {
    id: 4,
    category: "PENGUMUMAN",
    categoryColor: "#A855F7",
    categoryBg: "#F3E8FF",
    date: "25 Mei 2024",
    title: "Libur Akhir Semester Genap",
    description:
      "Libur akhir semester genap dimulai tanggal 15 Juni - 30 Juni 2024. Masuk kembali 1 Juli 2024.",
    icon: "/icons/pengumuman icon.png",
    iconBg: "transparent",
  },
];

const categories: Category[] = [
  { id: "semua", label: "Semua", count: 24, color: "#3B82F6" },
  { id: "penting", label: "Penting", count: 8, imgSrc: "/icons/icon penting.png", color: "#EF4444" },
  { id: "informasi", label: "Informasi", count: 10, imgSrc: "/icons/informasi icon.png", color: "#3B82F6" },
  { id: "kegiatan", label: "Kegiatan", count: 6, imgSrc: "/icons/kegiatan icon.png", color: "#22C55E" },
  { id: "pengumuman", label: "Pengumuman", count: 0, imgSrc: "/icons/pengumuman icon.png", color: "#A855F7" },
];

// ─── Icon map (fallback jika image gagal load) ────────────────────────────────
const categoryIconMap: Record<string, string> = {
  penting: "/icons/icon penting.png",
  informasi: "/icons/informasi icon.png",
  kegiatan: "/icons/kegiatan icon.png",
  pengumuman: "/icons/pengumuman icon.png",
};

const announcementIconMap: Record<CategoryKey, string> = {
  PENTING: "/icons/icon penting.png",
  INFORMASI: "/icons/informasi icon.png",
  KEGIATAN: "/icons/kegiatan icon.png",
  PENGUMUMAN: "/icons/pengumuman icon.png",
};



// ─── Nav Icon Components ──────────────────────────────────────────────────────
function HomeIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#1E3A8A" : "#9CA3AF"}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function DaftarIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1E3A8A" : "#9CA3AF"} strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  );
}

function BayarIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1E3A8A" : "#9CA3AF"} strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function StatusIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1E3A8A" : "#9CA3AF"} strokeWidth="2">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function ProfilIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1E3A8A" : "#9CA3AF"} strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { id: "beranda", label: "Beranda", icon: HomeIcon },
  { id: "daftar", label: "Daftar", icon: DaftarIcon },
  { id: "bayar", label: "Bayar", icon: BayarIcon },
  { id: "status", label: "Status", icon: StatusIcon },
  { id: "profil", label: "Profil", icon: ProfilIcon },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PengumumanPage() {
  const [activeTab, setActiveTab] = useState("semua");
  const [activeNav, setActiveNav] = useState("beranda");
  const [megaphoneError, setMegaphoneError] = useState(false);
  const [iconErrors, setIconErrors] = useState<Record<number, boolean>>({});
  const [catIconErrors, setCatIconErrors] = useState<Record<string, boolean>>({});

  const filtered =
    activeTab === "semua"
      ? announcements
      : announcements.filter((a) => a.category.toLowerCase() === activeTab);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F0F4FF",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ─── HERO BANNER ─── */}
      <div
        style={{
          background: "linear-gradient(160deg, #1E3A8A 0%, #1D4ED8 55%, #2563EB 100%)",
          padding: "48px 20px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", borderRadius: "50%", background: "rgba(255,255,255,0.06)", width: 160, height: 160, right: -30, top: -40 }} />
        <div style={{ position: "absolute", borderRadius: "50%", background: "rgba(255,255,255,0.04)", width: 100, height: 100, right: 60, bottom: -30 }} />

        {/* Gold accent line bottom-left */}
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "40%", height: 3, background: "linear-gradient(90deg, #F59E0B, transparent)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          {/* Kiri: judul + subtitle (tanpa icon kecil) */}
          <div style={{ flex: 1 }}>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 8px 0", letterSpacing: -0.5 }}>
              Pengumuman
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>
              Informasi &amp; pengumuman dari Pondok Pesantren
            </p>
          </div>

          {/* Kanan: icon megaphone besar 3D */}
          <div
            style={{
              width: 110,
              height: 100,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {megaphoneError ? (
              <span style={{ fontSize: 70 }}>📣</span>
            ) : (
              <Image
                src="/icons/icon pengumuman.png"
                alt="Megaphone"
                width={100}
                height={100}
                style={{ objectFit: "contain", filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))" }}
                onError={() => setMegaphoneError(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── CATEGORY FILTER TABS ─── */}
      <div
        style={{
          background: "#fff",
          padding: "16px 8px 12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none" }}>
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 8px 8px",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: "none",
                  borderLeft: "none",
                  background: "none",
                  cursor: "pointer",
                  flex: "1 0 0",
                  minWidth: 64,
                  position: "relative",
                  transition: "all 0.2s",
                }}
              >
                {/* Icon — transparan, ukuran besar */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s",
                    transform: isActive ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  {cat.id === "semua" ? (
                    /* Icon grid 4-kotak untuk "Semua" */
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: isActive ? "#EFF6FF" : "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: isActive ? `2px solid ${cat.color}` : "2px solid transparent",
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill={isActive ? cat.color : "#9CA3AF"}>
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                    </div>
                  ) : catIconErrors[cat.id] ? (
                    /* Fallback: render ulang dengan img biasa (bypass next/image domain) */
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={categoryIconMap[cat.id] ?? ""}
                      alt={cat.label}
                      width={44}
                      height={44}
                      style={{ objectFit: "contain", opacity: isActive ? 1 : 0.85 }}
                    />
                  ) : (
                    <Image
                      src={cat.imgSrc ?? ""}
                      alt={cat.label}
                      width={44}
                      height={44}
                      style={{
                        objectFit: "contain",
                        filter: isActive
                          ? "drop-shadow(0 2px 6px rgba(0,0,0,0.2))"
                          : "grayscale(0%) opacity(0.85)",
                      }}
                      onError={() =>
                        setCatIconErrors((prev) => ({ ...prev, [cat.id]: true }))
                      }
                    />
                  )}
                </div>

                {/* Label */}
                <div
                  style={{
                    fontSize: 11,
                    color: isActive ? cat.color : "#6B7280",
                    fontWeight: isActive ? 700 : 500,
                    lineHeight: 1,
                  }}
                >
                  {cat.label}
                </div>

                {/* Count */}
                <div
                  style={{
                    fontSize: 13,
                    color: isActive ? cat.color : "#374151",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {cat.count}
                </div>

                {/* Active underline indicator */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "20%",
                      right: "20%",
                      height: 2.5,
                      borderRadius: 2,
                      background: cat.color,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── SCROLLABLE CONTENT ─── */}
      <div style={{ padding: "16px 16px 100px", overflowY: "auto" }}>

        {/* ── Welcome Banner ── */}
        <div
          style={{
            borderRadius: 16,
            marginBottom: 20,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(30,58,138,0.25)",
            height: 160,
          }}
        >
          {/* Banner image — pakai <img> biasa agar tidak perlu domain config next/image */}
          {/* Simpan file di: public/image/pengumuman_banner.png */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/pengumuman banner.png"
            alt="Banner Pengumuman"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>

        {/* ── Section Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: 0 }}>
            Pengumuman Terbaru
          </h2>
          <button style={{ background: "none", borderTop: "none", borderRight: "none", borderBottom: "none", borderLeft: "none", color: "#3B82F6", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Lihat semua →
          </button>
        </div>

        {/* ── Announcement Cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "all 0.2s",
                border: "1px solid #F3F4F6",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Icon — transparan, icon sudah punya background warna sendiri */}
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {iconErrors[item.id] ? (
                  /* Fallback: img biasa agar pasti tampil */
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={announcementIconMap[item.category]}
                    alt={item.category}
                    width={50}
                    height={50}
                    style={{ objectFit: "contain" }}
                  />
                ) : (
                  <Image
                    src={item.icon}
                    alt={item.category}
                    width={50}
                    height={50}
                    style={{ objectFit: "contain" }}
                    onError={() =>
                      setIconErrors((prev) => ({ ...prev, [item.id]: true }))
                    }
                  />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: item.categoryColor,
                      background: item.categoryBg,
                      borderRadius: 20,
                      padding: "2px 8px",
                      letterSpacing: 0.3,
                    }}
                  >
                    ● {item.category}
                  </span>
                  <span style={{ fontSize: 10, color: "#6B7280" }}>{item.date}</span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.description}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── BOTTOM NAVIGATION BAR ─── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          background: "#fff",
          borderTop: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          padding: "8px 0 16px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          zIndex: 100,
        }}
      >
        {navItems.map((nav) => {
          const Icon = nav.icon;
          const isActive = activeNav === nav.id;
          return (
            <button
              key={nav.id}
              onClick={() => setActiveNav(nav.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                borderTop: "none",
                borderRight: "none",
                borderBottom: "none",
                borderLeft: "none",
                background: "none",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              <Icon active={isActive} />
              <span
                style={{
                  fontSize: 10,
                  color: isActive ? "#1E3A8A" : "#9CA3AF",
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {nav.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}