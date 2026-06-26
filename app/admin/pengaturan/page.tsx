"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const fontFamily = "'Plus Jakarta Sans','Inter',system-ui,-apple-system,sans-serif";

// ── Icon Box ──────────────────────────────────────────────────────────────────
function IconBox({ children, red }: { children: React.ReactNode; red?: boolean }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        background: red ? "#fff0f0" : "#e8f5f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const G = "#2d9e6b"; // green stroke
const R = "#ef4444"; // red stroke

const IconProfil   = () => (
  <IconBox>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  </IconBox>
);

const IconGlobe    = () => (
  <IconBox>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  </IconBox>
);

const IconMonitor  = () => (
  <IconBox>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="3" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  </IconBox>
);

const IconText     = () => (
  <IconBox>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  </IconBox>
);

const IconBell     = () => (
  <IconBox>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  </IconBox>
);

const IconHelp     = () => (
  <IconBox>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="0.6" fill={G} stroke="none" />
    </svg>
  </IconBox>
);

const IconReset    = () => (
  <IconBox red>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={R} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 2.6-6.4M3 4v5h5" />
    </svg>
  </IconBox>
);

const IconGear     = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconChevron  = ({ red }: { red?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke={red ? R : "#d1d5db"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ── Data ──────────────────────────────────────────────────────────────────────
type SettingItem = {
  label: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  red?: boolean;
};
type SettingCategory = {
  title: string;
  items: SettingItem[];
};

const SETTINGS: SettingCategory[] = [
  {
    title: "AKUN & PROFIL",
    items: [
      {
        label: "Pengaturan Akun & Profil",
        desc: "Kelola informasi akun, keamanan, dan profil Anda",
        href: "/pengaturan/akun",
        icon: <IconProfil />,
      },
    ],
  },
  {
    title: "PREFERENSI & TAMPILAN",
    items: [
      {
        label: "Bahasa / Language",
        desc: "Ubah bahasa tampilan aplikasi",
        href: "/pengaturan/bahasa",
        icon: <IconGlobe />,
      },
      {
        label: "Tampilan",
        desc: "Atur mode tampilan, tema, dan ukuran teks",
        href: "/pengaturan/tampilan",
        icon: <IconMonitor />,
      },
      {
        label: "Teks",
        desc: "Sesuaikan ukuran huruf agar nyaman dibaca",
        href: "/pengaturan/teks",
        icon: <IconText />,
      },
    ],
  },
  {
    title: "NOTIFIKASI",
    items: [
      {
        label: "Notifikasi",
        desc: "Kelola preferensi notifikasi dan pengingat",
        href: "/pengaturan/notifikasi",
        icon: <IconBell />,
      },
    ],
  },
  {
    title: "BANTUAN & INFORMASI",
    items: [
      {
        label: "Bantuan & Informasi Aplikasi",
        desc: "Temukan bantuan, panduan, dan informasi aplikasi",
        href: "/pengaturan/bantuan",
        icon: <IconHelp />,
      },
    ],
  },
  {
    title: "PENGATURAN LAINNYA",
    items: [
      {
        label: "Reset ke Pengaturan Awal",
        desc: "Kembalikan semua pengaturan ke default",
        href: "/pengaturan/reset",
        icon: <IconReset />,
        red: true,
      },
    ],
  },
];

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function NavItem({
  href, label, active, children,
}: {
  href: string; label: string; active?: boolean; children: React.ReactNode;
}) {
  const color = active ? "#16a34a" : "#9ca3af";
  return (
    <Link
      href={href}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 3, flex: 1, paddingTop: 4, paddingBottom: 4, textDecoration: "none",
      }}
    >
      <div style={{ color }}>{children}</div>
      <span style={{ fontSize: 10, fontWeight: 600, color, lineHeight: 1 }}>{label}</span>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PengaturanPage() {
  const router = useRouter();

  return (
    <div
      style={{
        fontFamily,
        background: "#eef2f7",
        minHeight: "100dvh",
        maxWidth: 430,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ══ HEADER CARD ══════════════════════════════════════════════════════ */}
      <div style={{ padding: "12px 16px 0" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {/* Back */}
          <button
            onClick={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 12, background: "#f0fdf4",
              border: "none", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Title */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.3 }}>
              Pengaturan
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, marginTop: 2, fontWeight: 500 }}>
              Preferensi aplikasi sistem
            </p>
          </div>

          {/* Gear */}
          <div
            style={{
              width: 40, height: 40, borderRadius: 12, background: "#f0fdf4",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <IconGear />
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══════════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 16px 100px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {SETTINGS.map((cat) => (
          <section key={cat.title}>
            {/* Category label */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#6b7280",
                margin: "0 0 8px 4px",
              }}
            >
              {cat.title}
            </p>

            {/* Card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              {cat.items.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <Link
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 16px",
                      textDecoration: "none",
                    }}
                  >
                    {item.icon}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: item.red ? R : "#111827",
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#9ca3af",
                          margin: 0,
                          marginTop: 3,
                          fontWeight: 400,
                          lineHeight: 1.5,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                    <IconChevron red={item.red} />
                  </Link>

                  {/* Divider */}
                  {idx < cat.items.length - 1 && (
                    <div style={{ height: 1, background: "#f3f4f6", margin: "0 16px" }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ══ BOTTOM NAV ═══════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          background: "#fff",
          borderTop: "1px solid #f1f5f9",
          boxShadow: "0 -2px 16px rgba(0,0,0,0.07)",
          display: "flex",
          alignItems: "center",
          paddingTop: 10,
          paddingBottom: 20,
        }}
      >
        {/* Beranda */}
        <NavItem href="/" label="Beranda">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </NavItem>

        {/* Daftar */}
        <NavItem href="/daftar" label="Daftar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="9" y1="7" x2="15" y2="7" />
            <line x1="9" y1="11" x2="15" y2="11" />
            <line x1="9" y1="15" x2="13" y2="15" />
          </svg>
        </NavItem>

        {/* Pembayaran */}
        <NavItem href="/pembayaran" label="Pembayaran">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </NavItem>

        {/* Laporan */}
        <NavItem href="/laporan" label="Laporan">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </NavItem>

        {/* Profil – active */}
        <NavItem href="/profil" label="Profil" active>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </NavItem>
      </div>
    </div>
  );
}