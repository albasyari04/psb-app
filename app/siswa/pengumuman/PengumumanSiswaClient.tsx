"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useSettings } from "@/contexts/SettingsContext";

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
  label: { id: string; en: string };
  imgSrc?: string;
  color: string;
  tipeFilter?: string;
}

interface NavItem {
  id: string;
  label: { id: string; en: string };
  icon: React.FC<IconProps>;
}

// ─── Tipe → style map ────────────────────────────────────────────────────────
const TIPE_CONFIG: Record<
  TipeKey,
  { color: string; bg: string; bgDark: string; icon: string; label: { id: string; en: string } }
> = {
  Penting: {
    color: "#EF4444",
    bg: "#FEE2E2",
    bgDark: "#2e1a1a",
    icon: "/icons/icon penting.png",
    label: { id: "Penting", en: "Important" },
  },
  Informasi: {
    color: "#3B82F6",
    bg: "#DBEAFE",
    bgDark: "#1a2a3d",
    icon: "/icons/informasi icon.png",
    label: { id: "Informasi", en: "Information" },
  },
  Info: {
    color: "#3B82F6",
    bg: "#DBEAFE",
    bgDark: "#1a2a3d",
    icon: "/icons/informasi icon.png",
    label: { id: "Info", en: "Info" },
  },
  Peringatan: {
    color: "#F59E0B",
    bg: "#FEF3C7",
    bgDark: "#2e2a1a",
    icon: "/icons/pengumuman icon.png",
    label: { id: "Peringatan", en: "Warning" },
  },
};

// ─── Category tabs ────────────────────────────────────────────────────────────
const categories: Category[] = [
  { id: "semua", label: { id: "Semua", en: "All" }, color: "#3B82F6" },
  {
    id: "penting",
    label: { id: "Penting", en: "Important" },
    imgSrc: "/icons/icon penting.png",
    color: "#EF4444",
    tipeFilter: "Penting",
  },
  {
    id: "informasi",
    label: { id: "Informasi", en: "Information" },
    imgSrc: "/icons/informasi icon.png",
    color: "#3B82F6",
    tipeFilter: "Informasi",
  },
  {
    id: "peringatan",
    label: { id: "Peringatan", en: "Warning" },
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
      width="22" height="22" viewBox="0 0 24 24"
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
  { id: "beranda", label: { id: "Beranda", en: "Home" }, icon: HomeIcon },
  { id: "daftar", label: { id: "Daftar", en: "Register" }, icon: DaftarIcon },
  { id: "bayar", label: { id: "Bayar", en: "Pay" }, icon: BayarIcon },
  { id: "status", label: { id: "Status", en: "Status" }, icon: StatusIcon },
  { id: "profil", label: { id: "Profil", en: "Profile" }, icon: ProfilIcon },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatTanggal(iso: string, isEn: boolean): string {
  try {
    const locale = isEn ? "en-US" : "id-ID";
    return new Date(iso).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getText(obj: { id: string; en: string }, isEn: boolean): string {
  return isEn ? obj.en : obj.id;
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({
  item,
  onClose,
  isDark = false,
  isEn = false,
}: {
  item: Announcement;
  onClose: () => void;
  isDark?: boolean;
  isEn?: boolean;
}) {
  const cfg = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG.Informasi;
  const bgColor = isDark ? "#1e1b2e" : "#fff";
  const textColor = isDark ? "#f1f0f5" : "#111827";
  const subColor = isDark ? "#94a3b8" : "#374151";
  const mutedColor = isDark ? "#6b6885" : "#6B7280";
  const handleBg = isDark ? "#3d3655" : "#E5E7EB";
  const lampBg = isDark ? "#2e2a40" : "#F3F4F6";
  const lampColor = isDark ? "#a5b4fc" : "#1D4ED8";
  const badgeBg = isDark ? cfg.bgDark : cfg.bg;
  const closeBtnBg = isDark ? "#2e2a40" : "#1E3A8A";
  const closeBtnColor = isDark ? "#f1f0f5" : "#fff";

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: bgColor,
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 36px",
          width: "100%",
          maxWidth: 430,
          maxHeight: "80vh",
          overflowY: "auto",
          borderTop: isDark ? "1px solid #2e2a40" : "none",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: handleBg,
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: cfg.color,
            background: badgeBg,
            borderRadius: 20,
            padding: "3px 10px",
            letterSpacing: 0.4,
          }}
        >
          ● {getText(cfg.label, isEn)}
        </span>

        <h2
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: textColor,
            margin: "10px 0 6px",
          }}
        >
          {item.judul}
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: mutedColor,
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
          {formatTanggal(item.tanggal, isEn)}
        </div>

        <p
          style={{
            fontSize: 14,
            color: subColor,
            lineHeight: 1.7,
            margin: "0 0 20px",
            whiteSpace: "pre-wrap",
          }}
        >
          {item.konten}
        </p>

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
              background: lampBg,
              borderRadius: 10,
              fontSize: 13,
              color: lampColor,
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
            {item.lampiran_nama ?? (isEn ? "View Attachment" : "Lihat Lampiran")}
          </a>
        )}

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "13px",
            background: closeBtnBg,
            color: closeBtnColor,
            borderRadius: 12,
            border: "none",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {isEn ? "Close" : "Tutup"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PengumumanSiswaClient() {
  const { theme, language } = useSettings();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState("semua");
  const [activeNav, setActiveNav] = useState("beranda");
  const [megaphoneError, setMegaphoneError] = useState(false);
  const [iconErrors, setIconErrors] = useState<Record<string, boolean>>({});
  const [catIconErrors, setCatIconErrors] = useState<Record<string, boolean>>({});

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Announcement | null>(null);

  // ── Fixed header measurement (agar header tidak ikut ter-scroll) ───────────
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(72);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const updateHeight = () => setHeaderHeight(el.offsetHeight);
    updateHeight();

    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Dark mode colors ──────────────────────────────────────────────────────
  const bgColor = isDark ? "#15131f" : "#F0F4FF";
  const cardBg = isDark ? "#1e1b2e" : "#fff";
  const cardBorder = isDark ? "1px solid #2e2a40" : "1px solid #F3F4F6";
  const textColor = isDark ? "#f1f0f5" : "#111827";
  const subColor = isDark ? "#94a3b8" : "#6B7280";
  const mutedColor = isDark ? "#6b6885" : "#9CA3AF";
  const tabBg = isDark ? "#1e1b2e" : "#fff";
  const tabBorder = isDark ? "1px solid #2e2a40" : "1px solid #E5E7EB";
  const navBg = isDark ? "#1e1b2e" : "#fff";
  const navBorder = isDark ? "1px solid #2e2a40" : "1px solid #E5E7EB";
  const navColor = isDark ? "#6b6885" : "#9CA3AF";
  const navActiveColor = isDark ? "#a5b4fc" : "#1E3A8A";
  const skeletonBg = isDark ? "#2e2a40" : "#F3F4F6";
  const emptyColor = isDark ? "#6b6885" : "#9CA3AF";
  const errorBg = isDark ? "#2e1a1a" : "#FEF2F2";
  const errorBorder = isDark ? "1px solid #4a1a1a" : "1px solid #FECACA";
  const errorColor = isDark ? "#fca5a5" : "#DC2626";
  const retryBtnBg = isDark ? "#2e2a40" : "#1E3A8A";
  const retryBtnColor = isDark ? "#f1f0f5" : "#fff";
  const detailBtnBg = isDark ? "#2e2a40" : "#1E3A8A";
  const detailBtnColor = isDark ? "#f1f0f5" : "#fff";

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
        setError(json.error ?? (isEn ? "Failed to load announcements" : "Gagal memuat pengumuman"));
        return;
      }
      setAnnouncements(json.data ?? []);
    } catch {
      setError(isEn ? "Connection failed, try again." : "Koneksi gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [isEn]);

  useEffect(() => {
    const cat = categories.find((c) => c.id === activeTab);
    fetchAnnouncements(cat?.tipeFilter);
  }, [activeTab, fetchAnnouncements]);

  // ── Render card ──
  function renderCard(item: Announcement) {
    const cfg = TIPE_CONFIG[item.tipe] ?? TIPE_CONFIG.Informasi;
    const badgeBg = isDark ? cfg.bgDark : cfg.bg;
    const cardShadow = isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.06)";
    const cardHoverShadow = isDark ? "0 4px 16px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.1)";

    return (
      <div
        key={item.id}
        onClick={() => setSelectedItem(item)}
        style={{
          background: cardBg,
          borderRadius: 14,
          padding: "14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: cardShadow,
          cursor: "pointer",
          transition: "all 0.2s",
          border: cardBorder,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = cardHoverShadow;
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = cardShadow;
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            background: badgeBg,
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
                background: badgeBg,
                borderRadius: 20,
                padding: "2px 8px",
                letterSpacing: 0.3,
              }}
            >
              ● {getText(cfg.label, isEn)}
            </span>
            <span style={{ fontSize: 10, color: mutedColor }}>
              {formatTanggal(item.tanggal, isEn)}
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: textColor,
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
              color: subColor,
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

        <div style={{ flexShrink: 0 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDark ? "#6b6885" : "#9CA3AF"}
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
        backgroundColor: bgColor,
        fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ─── TOP BAR (fixed, sama persis seperti header Pengaturan) ─── */}
      <div
        ref={headerRef}
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14.4px 16px 13.6px",
          background: isDark ? "#15131f" : "#ffffff",
          borderBottom: isDark ? "1px solid #2a2640" : "1px solid #e9eef2",
          boxShadow: isDark
            ? "0 2px 12px rgba(0,0,0,0.3)"
            : "0 2px 12px rgba(14,124,95,0.06)",
        }}
      >
        {/* Tombol kembali */}
        <a
          href="/siswa"
          aria-label={isEn ? "Back to Home" : "Kembali ke Beranda"}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: isDark ? "rgba(14,124,95,0.15)" : "#ecfdf5",
            border: isDark
              ? "1.5px solid rgba(14,124,95,0.3)"
              : "1.5px solid #dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0e7c5f",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </a>

        {/* Judul & subjudul */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontSize: "1.05rem",
              fontWeight: 800,
              color: isDark ? "#f1f0f5" : "#0f172a",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {isEn ? "Announcements" : "Pengumuman"}
          </h1>
          <p
            style={{
              fontSize: "0.68rem",
              color: isDark ? "#6b6680" : "#94a3b8",
              fontWeight: 500,
              margin: "0.1rem 0 0",
            }}
          >
            {isEn
              ? "Information & announcements from the Islamic Boarding School"
              : "Informasi & pengumuman dari Pondok Pesantren"}
          </p>
        </div>

        {/* Tombol ikon kanan */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: isDark ? "#1a1728" : "#f6f8fa",
            border: isDark ? "1.5px solid #2a2640" : "1.5px solid #e9eef2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0e7c5f",
            flexShrink: 0,
          }}
        >
          {megaphoneError ? (
            <span style={{ fontSize: 18 }}>📣</span>
          ) : (
            <Image
              src="/icons/pengumuman-icon.png"
              alt={isEn ? "Megaphone" : "Megaphone"}
              width={20}
              height={20}
              style={{ objectFit: "contain" }}
              onError={() => setMegaphoneError(true)}
            />
          )}
        </div>
      </div>

      {/* ─── SPACER: menggantikan tinggi header fixed di atas ─── */}
      <div style={{ height: headerHeight }} />

      {/* ─── CATEGORY FILTER TABS ─── */}
      <div
        style={{
          background: tabBg,
          padding: "16px 8px 12px",
          boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 2px 8px rgba(0,0,0,0.06)",
          borderBottom: tabBorder,
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
                        background: isActive ? (isDark ? "#1a2a3d" : "#EFF6FF") : (isDark ? "#2e2a40" : "#F3F4F6"),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: isActive
                          ? `2px solid ${cat.color}`
                          : `2px solid ${isDark ? "#2e2a40" : "transparent"}`,
                      }}
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill={isActive ? cat.color : (isDark ? "#6b6885" : "#9CA3AF")}
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
                      alt={getText(cat.label, isEn)}
                      width={44}
                      height={44}
                      style={{ objectFit: "contain", opacity: isActive ? 1 : 0.85 }}
                    />
                  ) : (
                    <Image
                      src={cat.imgSrc ?? ""}
                      alt={getText(cat.label, isEn)}
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
                    color: isActive ? cat.color : (isDark ? "#6b6885" : "#6B7280"),
                    fontWeight: isActive ? 700 : 500,
                    lineHeight: 1,
                  }}
                >
                  {getText(cat.label, isEn)}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: isActive ? cat.color : (isDark ? "#94a3b8" : "#374151"),
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
            boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(30,58,138,0.25)",
            height: 160,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/pengumuman banner.png"
            alt={isEn ? "Announcement Banner" : "Banner Pengumuman"}
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
          <h2 style={{ fontSize: 16, fontWeight: 800, color: textColor, margin: 0 }}>
            {isEn ? "Latest Announcements" : "Pengumuman Terbaru"}
          </h2>
          {!loading && (
            <span style={{ fontSize: 12, color: mutedColor }}>
              {announcements.length} {isEn ? "announcements" : "pengumuman"}
            </span>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: cardBg,
                  borderRadius: 14,
                  padding: "14px",
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: cardBorder,
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: skeletonBg,
                    flexShrink: 0,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      height: 10,
                      background: skeletonBg,
                      borderRadius: 6,
                      width: "40%",
                    }}
                  />
                  <div
                    style={{
                      height: 13,
                      background: skeletonBg,
                      borderRadius: 6,
                      width: "80%",
                    }}
                  />
                  <div
                    style={{
                      height: 10,
                      background: skeletonBg,
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
              background: errorBg,
              border: errorBorder,
              borderRadius: 12,
              padding: "16px",
              textAlign: "center",
            }}
          >
            <p style={{ color: errorColor, fontSize: 14, margin: "0 0 12px" }}>
              {error}
            </p>
            <button
              onClick={() => {
                const cat = categories.find((c) => c.id === activeTab);
                fetchAnnouncements(cat?.tipeFilter);
              }}
              style={{
                padding: "8px 20px",
                background: retryBtnBg,
                color: retryBtnColor,
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {isEn ? "Try Again" : "Coba Lagi"}
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && announcements.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              color: emptyColor,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>
              {isEn ? "No Announcements Yet" : "Belum Ada Pengumuman"}
            </p>
            <p style={{ fontSize: 12, margin: 0 }}>
              {isEn ? "Announcements will appear here." : "Pengumuman akan muncul di sini."}
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
          background: navBg,
          borderTop: navBorder,
          display: "flex",
          alignItems: "center",
          padding: "8px 0 16px",
          boxShadow: isDark ? "0 -4px 20px rgba(0,0,0,0.3)" : "0 -4px 20px rgba(0,0,0,0.08)",
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
                  color: isActive ? navActiveColor : navColor,
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {getText(nav.label, isEn)}
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
          isDark={isDark}
          isEn={isEn}
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