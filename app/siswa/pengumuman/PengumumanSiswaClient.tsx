"use client";
// app/siswa/pengumuman/PengumumanSiswaClient.tsx
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSettings } from "@/contexts/SettingsContext";

/* ════════════════════════════════════════════════════════════════
   ICON SET — SVG line-style (gaya sama dengan halaman Pendaftaran)
   ════════════════════════════════════════════════════════════════ */
type IconProps = { size?: number; color?: string; strokeWidth?: number };
type IconCmp = React.ComponentType<IconProps>;

const Svg = ({
  size,
  color,
  strokeWidth,
  children,
}: Required<IconProps> & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

// Ikon panah kembali — IDENTIK dengan halaman Pendaftaran / Jadwal / Laporan
const IconArrowLeft = ({ size = 18, color = "currentColor", strokeWidth = 2.3 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </Svg>
);

const IconArrowRight = ({ size = 14, color = "currentColor", strokeWidth = 2.4 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
);

const IconX = ({ size = 15, color = "currentColor", strokeWidth = 2.3 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

const IconCalendar = ({ size = 13, color = "currentColor", strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </Svg>
);

const IconPaperclip = ({ size = 14, color = "currentColor", strokeWidth = 1.9 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="m20.5 11.5-8.6 8.6a5 5 0 0 1-7.1-7.1l8.9-8.9a3.4 3.4 0 0 1 4.8 4.8l-8.9 8.9a1.8 1.8 0 0 1-2.5-2.5l8.2-8.2" />
  </Svg>
);

const IconInbox = ({ size = 28, color = "currentColor", strokeWidth = 1.6 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M3 13.5 5.8 5.8A2 2 0 0 1 7.7 4.5h8.6a2 2 0 0 1 1.9 1.3L21 13.5" />
    <path d="M3 13.5V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4.5h-5.2a1 1 0 0 0-.9.6 3.3 3.3 0 0 1-5.8 0 1 1 0 0 0-.9-.6H3Z" />
  </Svg>
);

const IconGrid = ({ size = 22, color = "currentColor", strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
  </Svg>
);

const IconAlertTriangle = ({ size = 20, color = "currentColor", strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M12 3.5 21.5 20H2.5L12 3.5Z" />
    <path d="M12 10v4" />
    <path d="M12 17.2h.01" />
  </Svg>
);

const IconInfo = ({ size = 20, color = "currentColor", strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 7.8h.01" />
  </Svg>
);

const IconBell = ({ size = 20, color = "currentColor", strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Svg>
);

// Ikon navigasi bawah
const NavHome = ({ size = 22, color = "currentColor", strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
  </Svg>
);
const NavForm = ({ size = 22, color = "currentColor", strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
    <path d="m9 14 2 2 4-4" />
  </Svg>
);
const NavCard = ({ size = 22, color = "currentColor", strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 10h19M6.5 15h3" />
  </Svg>
);
const NavChart = ({ size = 22, color = "currentColor", strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />
  </Svg>
);
const NavUser = ({ size = 22, color = "currentColor", strokeWidth = 1.8 }: IconProps) => (
  <Svg size={size} color={color} strokeWidth={strokeWidth}>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 21c0-3.866 3.134-7 7-7s7 3.134 7 7" />
  </Svg>
);

/* ════════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════════ */
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

interface CategoryDef {
  id: string;
  label: { id: string; en: string };
  tipe?: TipeKey; // filter ke API
}

/* ════════════════════════════════════════════════════════════════
   THEME (identik dengan halaman Pendaftaran / Jadwal / Laporan)
   ════════════════════════════════════════════════════════════════ */
const HEADER_HEIGHT = 84;
const NAV_HEIGHT = 68;

function getTheme(isDark: boolean) {
  return {
    bg: isDark ? "#0E1512" : "#F5F8F6",
    surface: isDark ? "#15201B" : "#FFFFFF",
    surfaceAlt: isDark ? "#101A16" : "#F6F9F7",
    border: isDark ? "#22332B" : "#E7EEE9",
    borderInput: isDark ? "#2A3D34" : "#DCE6DF",
    divider: isDark ? "#22332B" : "#EAF0EC",
    text: isDark ? "#EEF5F1" : "#14231C",
    label: isDark ? "#CFE0D6" : "#1B2E25",
    muted: isDark ? "#8FA89B" : "#6B7F74",
    faint: isDark ? "#5E7569" : "#A3B3AA",
    primary: "#0F6B4A",
    primaryDark: "#0A4F37",
    primaryText: isDark ? "#4ADE98" : "#0F6B4A",
    primarySoft: isDark ? "#16302A" : "#E8F4EE",
    accent: "#F2B705",
    pendingBg: isDark ? "#22332B" : "#EDF2EF",
    line: isDark ? "#22332B" : "#DCE6DF",
    gradient: "linear-gradient(135deg, #0F6B4A 0%, #0A4F37 100%)",
    shadowBtn: "0 8px 20px rgba(15,107,74,.26)",
  };
}

function getCardStyle(isDark: boolean): React.CSSProperties {
  const t = getTheme(isDark);
  return {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 22,
    boxShadow: isDark
      ? "none"
      : "0 1px 2px rgba(15,60,40,.04), 0 10px 28px rgba(15,60,40,.06)",
  };
}

/* ════════════════════════════════════════════════════════════════
   TIPE → TONE
   Penting = merah, Informasi/Info = hijau, Peringatan = emas
   ════════════════════════════════════════════════════════════════ */
interface ToneDef {
  fg: string;
  fgDark: string;
  soft: string;
  softDark: string;
  line: string;
  lineDark: string;
  grad: string;
  glow: string;
  icon: string; // path PNG milik Anda di /public/icons
  Fallback: IconCmp;
  label: { id: string; en: string };
}

const GREEN_TONE = {
  fg: "#0A4F37",
  fgDark: "#4ADE98",
  soft: "#E8F4EE",
  softDark: "#16302A",
  line: "#BFE0CE",
  lineDark: "#22443A",
  grad: "linear-gradient(135deg, #0F6B4A 0%, #0A4F37 100%)",
  glow: "rgba(15,107,74,.26)",
};

const TONES: Record<TipeKey, ToneDef> = {
  Penting: {
    fg: "#B42318",
    fgDark: "#fca5a5",
    soft: "#FEECEC",
    softDark: "#2e1a1a",
    line: "#F5A9A9",
    lineDark: "#4a1a1a",
    grad: "linear-gradient(135deg, #E5484D 0%, #B42318 100%)",
    glow: "rgba(220,38,38,.26)",
    icon: "/icons/icon penting.png",
    Fallback: IconAlertTriangle,
    label: { id: "Penting", en: "Important" },
  },
  Informasi: {
    ...GREEN_TONE,
    icon: "/icons/informasi icon.png",
    Fallback: IconInfo,
    label: { id: "Informasi", en: "Information" },
  },
  Info: {
    ...GREEN_TONE,
    icon: "/icons/informasi icon.png",
    Fallback: IconInfo,
    label: { id: "Info", en: "Info" },
  },
  Peringatan: {
    fg: "#8A6200",
    fgDark: "#fbbf24",
    soft: "#FFF6D6",
    softDark: "#2e2a1a",
    line: "#F2D77A",
    lineDark: "#4a3a1a",
    grad: "linear-gradient(135deg, #F2B705 0%, #D99A00 100%)",
    glow: "rgba(242,183,5,.30)",
    icon: "/icons/pengumuman icon.png",
    Fallback: IconBell,
    label: { id: "Peringatan", en: "Warning" },
  },
};

function toneOf(tipe: string, isDark: boolean, isEn: boolean) {
  const m = TONES[tipe as TipeKey] ?? TONES.Informasi;
  return {
    fg: isDark ? m.fgDark : m.fg,
    soft: isDark ? m.softDark : m.soft,
    line: isDark ? m.lineDark : m.line,
    grad: m.grad,
    glow: m.glow,
    icon: m.icon,
    Fallback: m.Fallback,
    label: isEn ? m.label.en : m.label.id,
  };
}

const CATEGORIES: CategoryDef[] = [
  { id: "semua", label: { id: "Semua", en: "All" } },
  { id: "penting", label: { id: "Penting", en: "Important" }, tipe: "Penting" },
  { id: "informasi", label: { id: "Informasi", en: "Information" }, tipe: "Informasi" },
  { id: "peringatan", label: { id: "Peringatan", en: "Warning" }, tipe: "Peringatan" },
];

/* ════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════ */
function formatTanggal(iso: string, isEn: boolean): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(isEn ? "en-US" : "id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function useUi() {
  const { theme, language } = useSettings();
  const isDark = theme === "dark";
  const isEn = language === "en";
  return {
    isDark,
    isEn,
    t: getTheme(isDark),
    tr: (id: string, en: string) => (isEn ? en : id),
  };
}

// Gambar dari /public/icons — otomatis fallback ke ikon vektor jika file gagal dimuat
function AssetIcon({
  src,
  alt,
  size,
  fallback,
}: {
  src: string;
  alt: string;
  size: number;
  fallback: React.ReactNode;
}) {
  const [err, setErr] = useState(false);
  if (err) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={encodeURI(src)}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: "contain", display: "block", userSelect: "none" }}
    />
  );
}

// Lingkaran ikon (card BUNDAR) berisi PNG tipe pengumuman
function TipeCircle({
  tipe,
  size,
  imgSize,
}: {
  tipe: string;
  size: number;
  imgSize: number;
}) {
  const { isDark, isEn } = useUi();
  const tone = toneOf(tipe, isDark, isEn);
  return (
    <span
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        background: tone.soft,
        border: `1.5px solid ${tone.line}`,
        boxSizing: "border-box",
        boxShadow: isDark ? "none" : `0 4px 12px ${tone.glow}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <AssetIcon
        src="/icons/pengumuman.png"
        alt={isEn ? "Announcement" : "Pengumuman"}
        size={imgSize}
        fallback={
          <span style={{ display: "flex", color: tone.fg }}>
            <tone.Fallback size={Math.round(imgSize * 0.8)} />
          </span>
        }
      />
    </span>
  );
}

function Chip({
  fg,
  soft,
  line,
  dot,
  children,
}: {
  fg: string;
  soft: string;
  line: string;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: soft,
        color: fg,
        border: `1px solid ${line}`,
        whiteSpace: "nowrap",
        lineHeight: 1.3,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />}
      {children}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   CATEGORY TABS — card bundar per kategori
   ════════════════════════════════════════════════════════════════ */
function CategoryTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  const { isDark, isEn, t } = useUi();

  return (
    <div role="tablist" style={{ ...getCardStyle(isDark), padding: "16px 8px 14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${CATEGORIES.length}, 1fr)` }}>
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.id;
          const isAll = !cat.tipe;
          const tone = cat.tipe ? toneOf(cat.tipe, isDark, isEn) : null;
          const FallbackIcon = tone?.Fallback ?? IconInfo;
          const ringColor = isAll ? t.primary : tone!.fg;
          const circleBg = isActive
            ? isAll
              ? t.primarySoft
              : tone!.soft
            : t.surfaceAlt;
          const labelColor = isActive ? (isAll ? t.primaryText : tone!.fg) : t.muted;

          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className="pn-tab"
              onClick={() => onChange(cat.id)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: circleBg,
                  border: `2px solid ${isActive ? ringColor : t.border}`,
                  boxSizing: "border-box",
                  boxShadow: isActive
                    ? `0 0 0 4px ${isDark ? "rgba(74,222,152,.14)" : "rgba(15,107,74,.10)"}`
                    : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "box-shadow .2s ease, border-color .2s ease, background-color .2s ease, transform .2s ease",
                  transform: isActive ? "scale(1.04)" : "scale(1)",
                }}
              >
                {isAll ? (
                  <span style={{ display: "flex", color: isActive ? t.primaryText : t.faint }}>
                    <IconGrid size={22} />
                  </span>
                ) : (
                  <span style={{ opacity: isActive ? 1 : 0.8, display: "flex" }}>
                    <AssetIcon
                      src={tone!.icon}
                      alt={isEn ? cat.label.en : cat.label.id}
                      size={30}
                      fallback={
                        <span style={{ display: "flex", color: tone!.fg }}>
                          <FallbackIcon size={22} />
                        </span>
                      }
                    />
                  </span>
                )}
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: isActive ? 800 : 600,
                  color: labelColor,
                  lineHeight: 1.2,
                  textAlign: "center",
                }}
              >
                {isEn ? cat.label.en : cat.label.id}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   BANNER
   ════════════════════════════════════════════════════════════════ */
function Banner() {
  const { isDark, t, tr } = useUi();
  const [err, setErr] = useState(false);

  return (
    <div
      style={{
        ...getCardStyle(isDark),
        position: "relative",
        overflow: "hidden",
        height: 160,
        background: t.gradient,
      }}
    >
      {!err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={encodeURI("/icons/pengumuman banner.png")}
          alt={tr("Banner Pengumuman", "Announcement Banner")}
          onError={() => setErr(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      ) : (
        <>
          <div style={{ position: "absolute", top: -28, right: -28, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
          <div style={{ position: "absolute", bottom: -26, left: "40%", width: 80, height: 80, borderRadius: "50%", background: "rgba(242,183,5,.16)" }} />
          <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", gap: 14, padding: "0 20px" }}>
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "rgba(255,255,255,.14)",
                border: "1px solid rgba(255,255,255,.22)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconBell size={24} />
            </span>
            <div>
              <p style={{ margin: 0, color: "#FFFFFF", fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>
                {tr("Pengumuman", "Announcements")}
              </p>
              <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,.82)", fontSize: 12.5, lineHeight: 1.45 }}>
                {tr("Informasi resmi dari Pondok Pesantren", "Official information from the boarding school")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ANNOUNCEMENT CARD
   ════════════════════════════════════════════════════════════════ */
function AnnouncementCard({
  item,
  onClick,
}: {
  item: Announcement;
  onClick: (a: Announcement) => void;
}) {
  const { isDark, isEn, t, tr } = useUi();
  const tone = toneOf(item.tipe, isDark, isEn);

  return (
    <button
      type="button"
      className="pn-card"
      onClick={() => onClick(item)}
      style={{
        ...getCardStyle(isDark),
        width: "100%",
        textAlign: "left",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <TipeCircle tipe={item.tipe} size={56} imgSize={34} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
            <Chip fg={tone.fg} soft={tone.soft} line={tone.line} dot={tone.fg}>
              {tone.label}
            </Chip>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 500, color: t.muted, whiteSpace: "nowrap" }}>
              <span style={{ display: "flex", color: t.primaryText }}>
                <IconCalendar size={12} />
              </span>
              {formatTanggal(item.tanggal, isEn)}
            </span>
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 800,
              color: t.text,
              lineHeight: 1.35,
              letterSpacing: "-.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.judul}
          </h3>
        </div>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: t.muted,
          fontWeight: 500,
          lineHeight: 1.55,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {item.konten}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          paddingTop: 12,
          borderTop: `1px solid ${t.divider}`,
        }}
      >
        {item.lampiran_url ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: t.muted }}>
            <span style={{ display: "flex", color: t.primaryText }}>
              <IconPaperclip size={14} />
            </span>
            {tr("Ada lampiran", "Has attachment")}
          </span>
        ) : (
          <span />
        )}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 800, color: tone.fg }}>
          {tr("Baca selengkapnya", "Read more")}
          <IconArrowRight size={14} />
        </span>
      </div>
    </button>
  );
}

function SkeletonCard() {
  const { isDark, t } = useUi();
  const bar = (w: string, h: number, r = 6, mb = 0): React.CSSProperties => ({
    width: w,
    height: h,
    borderRadius: r,
    background: t.pendingBg,
    marginBottom: mb,
  });
  return (
    <div style={{ ...getCardStyle(isDark), padding: 16, animation: "pn-pulse 1.5s ease-in-out infinite" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: t.pendingBg, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={bar("35%", 20, 999, 8)} />
          <div style={bar("75%", 14)} />
        </div>
      </div>
      <div style={bar("92%", 11, 6, 6)} />
      <div style={bar("68%", 11)} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DETAIL MODAL — bottom sheet
   ════════════════════════════════════════════════════════════════ */
function DetailModal({ item, onClose }: { item: Announcement; onClose: () => void }) {
  const { isDark, isEn, t, tr } = useUi();
  const tone = toneOf(item.tipe, isDark, isEn);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={item.judul}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(8,20,14,.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        animation: "pn-backdrop .22s ease forwards",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          background: t.surface,
          borderTop: `1px solid ${t.border}`,
          borderRadius: "28px 28px 0 0",
          padding: "0 20px calc(24px + env(safe-area-inset-bottom))",
          maxHeight: "88dvh",
          overflowY: "auto",
          animation: "pn-sheet .3s cubic-bezier(.32,.72,0,1) forwards",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 999, background: t.borderInput, margin: "12px auto 18px" }} />

        {/* Chip + tombol tutup */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Chip fg={tone.fg} soft={tone.soft} line={tone.line} dot={tone.fg}>
            {tone.label}
          </Chip>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr("Tutup", "Close")}
            className="psmb-back"
            style={{
              width: 36,
              height: 36,
              minWidth: 36,
              borderRadius: "50%",
              background: t.primarySoft,
              border: isDark ? "1px solid #22443A" : "1px solid #CFE6DA",
              color: t.primaryText,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <IconX size={15} />
          </button>
        </div>

        {/* Judul */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <TipeCircle tipe={item.tipe} size={60} imgSize={36} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: t.text, lineHeight: 1.35, letterSpacing: "-.01em", wordBreak: "break-word" }}>
              {item.judul}
            </h2>
            <p style={{ margin: "6px 0 0", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 500, color: t.muted }}>
              <span style={{ display: "flex", color: t.primaryText }}>
                <IconCalendar size={13} />
              </span>
              {formatTanggal(item.tanggal, isEn)}
            </p>
          </div>
        </div>

        {/* Isi */}
        <div
          style={{
            background: t.surfaceAlt,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            padding: "14px 16px",
            marginBottom: 16,
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: t.label, lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {item.konten}
          </p>
        </div>

        {/* Lampiran */}
        {item.lampiran_url && (
          <a
            href={item.lampiran_url}
            target="_blank"
            rel="noopener noreferrer"
            className="pn-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 16,
              background: t.primarySoft,
              border: isDark ? "1px solid #22443A" : "1px solid #CFE6DA",
              color: t.primaryText,
              textDecoration: "none",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                minWidth: 38,
                borderRadius: "50%",
                background: t.gradient,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconPaperclip size={16} />
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, wordBreak: "break-word" }}>
              {item.lampiran_nama ?? tr("Lihat Lampiran", "View Attachment")}
            </span>
            <IconArrowRight size={16} />
          </a>
        )}

        <button
          type="button"
          onClick={onClose}
          className="pn-btn"
          style={{
            width: "100%",
            minHeight: 50,
            padding: "14px 18px",
            borderRadius: 14,
            border: "none",
            background: t.gradient,
            boxShadow: t.shadowBtn,
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          {tr("Tutup", "Close")}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CSS GLOBAL HALAMAN
   ════════════════════════════════════════════════════════════════ */
const PAGE_CSS = `
@keyframes pn-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
@keyframes pn-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pn-backdrop { from { opacity: 0; } to { opacity: 1; } }
@keyframes pn-sheet { from { transform: translateY(100%); opacity: .6; } to { transform: translateY(0); opacity: 1; } }
.psmb-back { transition: transform .12s ease, background-color .15s ease; -webkit-tap-highlight-color: transparent; }
.psmb-back:active { transform: scale(.94); }
.pn-btn { transition: transform .12s ease, filter .15s ease; -webkit-tap-highlight-color: transparent; }
.pn-btn:active { transform: scale(.98); }
.pn-tab { -webkit-tap-highlight-color: transparent; }
.pn-tab:active { transform: scale(.96); }
.pn-card { transition: transform .15s ease; -webkit-tap-highlight-color: transparent; }
.pn-card:active { transform: scale(.985); }
@media (hover: hover) { .pn-card:hover { transform: translateY(-2px); } }
.pn-nav { -webkit-tap-highlight-color: transparent; }
`;

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function PengumumanSiswaClient() {
  const { isDark, isEn, t, tr } = useUi();

  const [activeTab, setActiveTab] = useState("semua");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Announcement | null>(null);

  const fetchAnnouncements = useCallback(
    async (tipeFilter?: string) => {
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
    },
    [isEn],
  );

  useEffect(() => {
    const cat = CATEGORIES.find((c) => c.id === activeTab);
    fetchAnnouncements(cat?.tipe);
  }, [activeTab, fetchAnnouncements]);

  const handleClose = useCallback(() => setSelectedItem(null), []);

  const navItems = [
    { href: "/siswa", label: tr("Beranda", "Home"), Icon: NavHome },
    { href: "/siswa/pendaftaran", label: tr("Daftar", "Register"), Icon: NavForm },
    { href: "/siswa/pembayaran", label: tr("Bayar", "Pay"), Icon: NavCard },
    { href: "/siswa/status", label: "Status", Icon: NavChart },
    { href: "/siswa/profile", label: tr("Profil", "Profile"), Icon: NavUser },
  ];

  return (
    <div
      style={{
        position: "relative",
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100dvh",
        background: t.bg,
        overflowX: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* ══ HEADER (FIXED) — identik dengan halaman Pendaftaran ══ */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          height: HEADER_HEIGHT,
          zIndex: 40,
          background: t.surface,
          borderBottom: `1px solid ${t.border}`,
          padding: "0 16px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href="/siswa"
          aria-label={tr("Kembali", "Back")}
          className="psmb-back"
          style={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: "50%",
            background: t.primarySoft,
            border: isDark ? "1px solid #22443A" : "1px solid #CFE6DA",
            boxShadow: isDark ? "none" : "0 1px 2px rgba(15,107,74,.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: t.primaryText,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <IconArrowLeft size={18} />
        </Link>

        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: t.text,
              lineHeight: 1.25,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tr("Pengumuman", "Announcements")}
          </h1>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 13,
              color: t.muted,
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tr("Informasi resmi dari Pondok Pesantren", "Official information from the boarding school")}
          </p>
        </div>
      </div>

      {/* ══ KONTEN ══ */}
      <div
        style={{
          paddingTop: HEADER_HEIGHT + 16,
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: NAV_HEIGHT + 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <CategoryTabs active={activeTab} onChange={setActiveTab} />

        <Banner />

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: t.text, letterSpacing: "-.01em" }}>
            {tr("Pengumuman Terbaru", "Latest Announcements")}
          </h2>
          {!loading && !error && (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                background: t.primarySoft,
                color: t.primaryText,
              }}
            >
              {announcements.length} {tr("pengumuman", "announcements")}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            style={{
              background: isDark ? "#2e1a1a" : "#FEECEC",
              border: `1px solid ${isDark ? "#4a1a1a" : "#F5A9A9"}`,
              borderRadius: 14,
              padding: "12px 14px",
              color: isDark ? "#fca5a5" : "#B42318",
              fontSize: 13.5,
              lineHeight: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ display: "flex", flexShrink: 0 }}>
              <IconAlertTriangle size={17} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>{error}</span>
            <button
              type="button"
              onClick={() => {
                const cat = CATEGORIES.find((c) => c.id === activeTab);
                fetchAnnouncements(cat?.tipe);
              }}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                fontWeight: 800,
                fontSize: 13,
                fontFamily: "inherit",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {tr("Coba Lagi", "Try Again")}
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && announcements.length === 0 && (
          <div
            style={{
              ...getCardStyle(isDark),
              padding: "40px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              animation: "pn-fade .3s ease both",
            }}
          >
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: t.primarySoft,
                color: t.primaryText,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconInbox size={28} />
            </span>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: t.text }}>
                {tr("Belum Ada Pengumuman", "No Announcements Yet")}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: t.muted, lineHeight: 1.5 }}>
                {tr("Pengumuman akan muncul di sini.", "Announcements will appear here.")}
              </p>
            </div>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && announcements.length > 0 && (
          <div
            key={activeTab}
            style={{ display: "flex", flexDirection: "column", gap: 12, animation: "pn-fade .3s ease both" }}
          >
            {announcements.map((item) => (
              <AnnouncementCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </div>
        )}
      </div>

      {/* ══ BOTTOM NAV (FIXED) ══ */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          zIndex: 100,
          background: t.surface,
          borderTop: `1px solid ${t.border}`,
          boxShadow: isDark ? "none" : "0 -4px 20px rgba(15,60,40,.07)",
          display: "flex",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {navItems.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="pn-nav"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "10px 0 12px",
              gap: 4,
              color: t.faint,
              textDecoration: "none",
              fontSize: 10.5,
              fontWeight: 500,
            }}
          >
            <Icon size={22} color={t.faint} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {selectedItem && <DetailModal item={selectedItem} onClose={handleClose} />}

      <style>{PAGE_CSS}</style>
    </div>
  );
}