"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
interface IconProps {
  active: boolean;
}

type TipeKey = "Penting" | "Informasi" | "Info" | "Peringatan";

interface Announcement {
  id: string;
  judul: string;
  tipe: TipeKey;
  konten: string;
  tanggal: string;
  lampiran_url: string | null;
  lampiran_nama: string | null;
  created_at: string;
}

interface Category {
  id: string;
  label: string;
  imgSrc?: string;
  color: string;
  tipeFilter?: string; // nilai yang dikirim ke API sebagai ?tipe=
}

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<IconProps>;
}

// ─── Tipe → style map ────────────────────────────────────────────────────────
const TIPE_CONFIG: Record<
  TipeKey,
  { color: string; bg: string; icon: string }
> = {
  Penting: {
    color: "#EF4444",
    bg: "#FEE2E2",
    icon: "/icons/icon penting.png",
  },
  Informasi: {
    color: "#3B82F6",
    bg: "#DBEAFE",
    icon: "/icons/informasi icon.png",
  },
  Info: {
    color: "#3B82F6",
    bg: "#DBEAFE",
    icon: "/icons/informasi icon.png",
  },
  Peringatan: {
    color: "#F59E0B",
    bg: "#FEF3C7",
    icon: "/icons/pengumuman icon.png",
  },
};

// ─── Category tabs ────────────────────────────────────────────────────────────
const categories: Category[] = [
  { id: "semua", label: "Semua", color: "#3B82F6" },
  {
    id: "penting",
    label: "Penting",
    imgSrc: "/icons/icon penting.png",
    color: "#EF4444",
    tipeFilter: "Penting",
  },
  {
    id: "informasi",
    label: "Informasi",
    imgSrc: "/icons/informasi icon.png",
    color: "#3B82F6",
    tipeFilter: "Informasi",
  },
  {
    id: "peringatan",
    label: "Peringatan",
    imgSrc: "/icons/pengumuman icon.png",
    color: "#F59E0B",
    tipeFilter: "Peringatan",
  },
];

// ─── Nav Icon Components ──────────────────────────────────────────────────────
function HomeIcon({ active }: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "#1E3A8A" : "#9CA3AF"}
    >
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}
function DaftarIcon({ active }: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#1E3A8A" : "#9CA3AF"}
      strokeWidth="2"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  );
}
function BayarIcon({ active }: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#1E3A8A" : "#9CA3AF"}
      strokeWidth="2"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}
function StatusIcon({ active }: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#1E3A8A" : "#9CA3AF"}
      strokeWidth="2"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function ProfilIcon({ active }: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#1E3A8A" : "#9CA3AF"}
      strokeWidth="2"
    >
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

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({
  item,
  onClose,
}: {
  item: Announcement;
  onClose: () => void;
}) {
  const cfg = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG.Informasi;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 36px",
          width: "100%",
          maxWidth: 430,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Handle bar */}
        <div
          style={{
            width: 40,
            height: 4,
            background: "#E5E7EB",
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />

        {/* Tipe badge */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: cfg.color,
            background: cfg.bg,
            borderRadius: 20,
            padding: "3px 10px",
            letterSpacing: 0.4,
          }}
        >
          ● {item.tipe.toUpperCase()}
        </span>

        {/* Judul */}
        <h2
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#111827",
            margin: "10px 0 6px",
          }}
        >
          {item.judul}
        </h2>

        {/* Tanggal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "#6B7280",
            marginBottom: 16,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {formatTanggal(item.tanggal)}
        </div>

        {/* Konten */}
        <p
          style={{
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.7,
            margin: "0 0 20px",
            whiteSpace: "pre-wrap",
          }}
        >
          {item.konten}
        </p>

        {/* Lampiran */}
        {item.lampiran_url && (
          <a
            href={item.lampiran_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "#F3F4F6",
              borderRadius: 10,
              fontSize: 13,
              color: "#1D4ED8",
              fontWeight: 600,
              textDecoration: "none",
              marginBottom: 20,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            {item.lampiran_nama ?? "Lihat Lampiran"}
          </a>
        )}

        {/* Tombol tutup */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "13px",
            background: "#1E3A8A",
            color: "#fff",
            borderRadius: 12,
            border: "none",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PengumumanSiswaClient() {
  const [activeTab, setActiveTab] = useState("semua");
  const [activeNav, setActiveNav] = useState("beranda");
  const [megaphoneError, setMegaphoneError] = useState(false);
  const [iconErrors, setIconErrors] = useState<Record<string, boolean>>({});
  const [catIconErrors, setCatIconErrors] = useState<Record<string, boolean>>(
    {}
  );

  // ── Data state ──
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Announcement | null>(null);

  // ── Fetch dari API ──
  const fetchAnnouncements = useCallback(async (tipeFilter?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (tipeFilter) params.set("tipe", tipeFilter);

      const res = await fetch(`/api/siswa/announcements?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Gagal memuat pengumuman");
        return;
      }
      setAnnouncements(json.data ?? []);
    } catch {
      setError("Koneksi gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch ulang setiap kali tab berubah
  useEffect(() => {
    const cat = categories.find((c) => c.id === activeTab);
    fetchAnnouncements(cat?.tipeFilter);
  }, [activeTab, fetchAnnouncements]);

  // ── Render card ──
  function renderCard(item: Announcement) {
    const cfg = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG.Informasi;

    return (
      <div
        key={item.id}
        onClick={() => setSelectedItem(item)}
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
        {/* Icon */}
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            background: cfg.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {iconErrors[item.id] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cfg.icon}
              alt={item.tipe}
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
            />
          ) : (
            <Image
              src={cfg.icon}
              alt={item.tipe}
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
              onError={() =>
                setIconErrors((prev) => ({ ...prev, [item.id]: true }))
              }
            />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 3,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: cfg.color,
                background: cfg.bg,
                borderRadius: 20,
                padding: "2px 8px",
                letterSpacing: 0.3,
              }}
            >
              ● {item.tipe.toUpperCase()}
            </span>
            <span style={{ fontSize: 10, color: "#6B7280" }}>
              {formatTanggal(item.tanggal)}
            </span>
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
            {item.judul}
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
            {item.konten}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ flexShrink: 0 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F0F4FF",
        fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ─── HERO BANNER ─── */}
      <div
        style={{
          background:
            "linear-gradient(160deg, #1E3A8A 0%, #1D4ED8 55%, #2563EB 100%)",
          padding: "48px 20px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            width: 160,
            height: 160,
            right: -30,
            top: -40,
          }}
        />
        <div
          style={{
            position: "absolute",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            width: 100,
            height: 100,
            right: 60,
            bottom: -30,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "40%",
            height: 3,
            background: "linear-gradient(90deg, #F59E0B, transparent)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ flex: 1 }}>
            <h1
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: 800,
                margin: "0 0 8px 0",
                letterSpacing: -0.5,
              }}
            >
              Pengumuman
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>
              Informasi &amp; pengumuman dari Pondok Pesantren
            </p>
          </div>

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
                src="/icons/pengumuman-icon.png"
                alt="Megaphone"
                width={100}
                height={100}
                style={{
                  objectFit: "contain",
                  filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))",
                }}
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
        <div
          style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none" }}
        >
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
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  flex: "1 0 0",
                  minWidth: 64,
                  position: "relative",
                  transition: "all 0.2s",
                }}
              >
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
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: isActive ? "#EFF6FF" : "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: isActive
                          ? `2px solid ${cat.color}`
                          : "2px solid transparent",
                      }}
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill={isActive ? cat.color : "#9CA3AF"}
                      >
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                    </div>
                  ) : catIconErrors[cat.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.imgSrc ?? ""}
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
                        setCatIconErrors((prev) => ({
                          ...prev,
                          [cat.id]: true,
                        }))
                      }
                    />
                  )}
                </div>

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

                {/* Jumlah hasil */}
                <div
                  style={{
                    fontSize: 13,
                    color: isActive ? cat.color : "#374151",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {loading ? "…" : isActive ? announcements.length : ""}
                </div>

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: 0 }}>
            Pengumuman Terbaru
          </h2>
          {!loading && (
            <span style={{ fontSize: 12, color: "#6B7280" }}>
              {announcements.length} pengumuman
            </span>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "14px",
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: "#F3F4F6",
                    flexShrink: 0,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      height: 10,
                      background: "#F3F4F6",
                      borderRadius: 6,
                      width: "40%",
                    }}
                  />
                  <div
                    style={{
                      height: 13,
                      background: "#F3F4F6",
                      borderRadius: 6,
                      width: "80%",
                    }}
                  />
                  <div
                    style={{
                      height: 10,
                      background: "#F3F4F6",
                      borderRadius: 6,
                      width: "60%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 12,
              padding: "16px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#DC2626", fontSize: 14, margin: "0 0 12px" }}>
              {error}
            </p>
            <button
              onClick={() => {
                const cat = categories.find((c) => c.id === activeTab);
                fetchAnnouncements(cat?.tipeFilter);
              }}
              style={{
                padding: "8px 20px",
                background: "#1E3A8A",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && announcements.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              color: "#9CA3AF",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>
              Belum Ada Pengumuman
            </p>
            <p style={{ fontSize: 12, margin: 0 }}>
              Pengumuman akan muncul di sini.
            </p>
          </div>
        )}

        {/* ── Announcement Cards ── */}
        {!loading && !error && announcements.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {announcements.map((item) => renderCard(item))}
          </div>
        )}
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
                border: "none",
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

      {/* ─── DETAIL MODAL ─── */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}