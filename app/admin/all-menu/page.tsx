"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ── Font ─────────────────────────────────────────────────────────────────────
const fontFamily = "'Plus Jakarta Sans','Inter',system-ui,-apple-system,sans-serif";

// ── PNG Icon wrapper ──────────────────────────────────────────────────────────
function PngIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        background: "#e8f5f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={36}
        height={36}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

// ── Bantuan icon (tidak ada PNG, pakai SVG fallback) ──────────────────────────
function BantuanIcon() {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        background: "#e8f5f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d9e6b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <line x1="4.93" y1="4.93" x2="8.46" y2="8.46" />
        <line x1="15.54" y1="8.46" x2="19.07" y2="4.93" />
        <line x1="15.54" y1="15.54" x2="19.07" y2="19.07" />
        <line x1="4.93" y1="19.07" x2="8.46" y2="15.54" />
      </svg>
    </div>
  );
}

// ── Tipe data ─────────────────────────────────────────────────────────────────
type MenuItem = {
  label: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
};
type MenuCategory = {
  title: string;
  items: MenuItem[];
};

// ── Data Menu ─────────────────────────────────────────────────────────────────
// Nama file icon sesuai yang diupload: berkas_icon.png, chat_icon.png, dst.
// Letakkan file-file ini di: /public/icons/
const MENU: MenuCategory[] = [
  {
    title: "PENDAFTARAN",
    items: [
      {
        label: "Pendaftar",
        desc: "Lihat Siapa saja yang mendaftarkan diri",
        href: "/admin/pendaftar",
        icon: <PngIcon src="/icons/formulir icon.png" alt="Formulir" />,
      },
      {
        label: "Berkas",
        desc: "Upload dokumen persyaratan",
        href: "/admin/berkas",
        icon: <PngIcon src="/icons/berkas icon.png" alt="Berkas" />,
      },
      {
        label: "Status",
        desc: "Pantau seleksi pendaftaran",
        href: "/admin/status",
        icon: <PngIcon src="/icons/status icon.png" alt="Status" />,
      },
    ],
  },
  {
    title: "KEUANGAN",
    items: [
      {
        label: "Pembayaran",
        desc: "Biaya pendaftaran santri",
        href: "/admin/pembayaran",
        icon: <PngIcon src="/icons/pembayaran icon.png" alt="Pembayaran" />,
      },
    ],
  },
  {
    title: "OBROLAN",
    items: [
      {
        label: "Chat",
        desc: "Chat Admin",
        href: "/admin/chat",
        icon: <PngIcon src="/icons/chat icon.png" alt="Chat" />,
      },
    ],
  },
  {
    title: "INFORMASI",
    items: [
      {
        label: "Pengumuman",
        desc: "Info & berita terbaru",
        href: "/admin/pengumuman",
        icon: <PngIcon src="/icons/pengumuman icon.png" alt="Pengumuman" />,
      },
      {
        label: "Jadwal",
        desc: "Jadwal kegiatan santri",
        href: "/admin/jadwal",
        icon: <PngIcon src="/icons/jadwal icon.png" alt="Jadwal" />,
      },
      {
        label: "Laporan",
        desc: "Laporan pendaftaran",
        href: "/admin/laporan",
        icon: <PngIcon src="/icons/laporan icon.png" alt="Laporan" />,
      },
    ],
  },
  {
    title: "AKUN",
    items: [
      {
        label: "Profil",
        desc: "Data & pengaturan akun",
        href: "/admin/profile",
        icon: <PngIcon src="/icons/profil icon.png" alt="Profil" />,
      },
       {
        label: "Pengaturan",
        desc: "pengaturan Aplikasi",
        href: "/admin/pengaturan",
        icon: <PngIcon src="/icons/pengaturan_icon.png" alt="Pengaturan" />,
      },
    ],
  },
];

// ── Bottom Nav Item ───────────────────────────────────────────────────────────
function NavItem({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const color = active ? "#16a34a" : "#9ca3af";
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        flex: 1,
        paddingTop: 4,
        paddingBottom: 4,
        textDecoration: "none",
      }}
    >
      <div style={{ color }}>{children}</div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SemuaMenuPage() {
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
          <button
            onClick={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#f0fdf4",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.3 }}>
              Semua Fitur
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, marginTop: 2, fontWeight: 500 }}>
              Kelola semua fitur sistem
            </p>
          </div>
        </div>
      </div>

      {/* ══ SCROLL CONTENT ═══════════════════════════════════════════════════ */}
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
        {MENU.map((cat) => (
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
                      padding: "13px 16px",
                      textDecoration: "none",
                    }}
                  >
                    {item.icon}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#111827",
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
                          marginTop: 2,
                          fontWeight: 400,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#d1d5db" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
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

        {/* Bayar */}
        <NavItem href="/bayar" label="Bayar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </NavItem>

        {/* Status */}
        <NavItem href="/status" label="Status">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </NavItem>

        {/* Profil – ACTIVE */}
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