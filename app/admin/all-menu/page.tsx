"use client";

// app/admin/semua-menu/page.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSettings } from "@/contexts/SettingsContext";
import type { TranslationKey } from "@/lib/i18n";

const fontFamily = "'Plus Jakarta Sans','Inter',system-ui,-apple-system,sans-serif";

function PngIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        background: "var(--purple-lighter)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <Image src={src} alt={alt} width={36} height={36} style={{ objectFit: "contain" }} />
    </div>
  );
}

type MenuItem = {
  labelKey: TranslationKey;
  descKey: TranslationKey;
  href: string;
  icon: React.ReactNode;
};
type MenuCategory = {
  titleKey: TranslationKey;
  items: MenuItem[];
};

const MENU: MenuCategory[] = [
  {
    titleKey: "allmenu_cat_pendaftaran",
    items: [
      { labelKey: "nav_pendaftar", descKey: "menu_pendaftar_sub", href: "/admin/pendaftar", icon: <PngIcon src="/icons/formulir icon.png" alt="Formulir" /> },
      { labelKey: "menu_berkas",   descKey: "menu_berkas_sub",    href: "/admin/berkas",    icon: <PngIcon src="/icons/berkas icon.png" alt="Berkas" /> },
      { labelKey: "nav_status",    descKey: "menu_status_sub",    href: "/admin/status",    icon: <PngIcon src="/icons/status icon.png" alt="Status" /> },
    ],
  },
  {
    titleKey: "allmenu_cat_keuangan",
    items: [
      { labelKey: "menu_pembayaran", descKey: "menu_pembayaran_sub", href: "/admin/pembayaran", icon: <PngIcon src="/icons/pembayaran icon.png" alt="Pembayaran" /> },
    ],
  },
  {
    titleKey: "allmenu_cat_obrolan",
    items: [
      { labelKey: "menu_chat", descKey: "menu_chat_sub", href: "/admin/chat", icon: <PngIcon src="/icons/chat icon.png" alt="Chat" /> },
    ],
  },
  {
    titleKey: "allmenu_cat_informasi",
    items: [
      { labelKey: "menu_pengumuman", descKey: "menu_pengumuman_sub", href: "/admin/pengumuman", icon: <PngIcon src="/icons/pengumuman icon.png" alt="Pengumuman" /> },
      { labelKey: "menu_jadwal",     descKey: "menu_jadwal_sub",     href: "/admin/jadwal",     icon: <PngIcon src="/icons/jadwal icon.png" alt="Jadwal" /> },
      { labelKey: "menu_laporan",    descKey: "menu_laporan_sub",    href: "/admin/laporan",    icon: <PngIcon src="/icons/laporan icon.png" alt="Laporan" /> },
    ],
  },
  {
    titleKey: "allmenu_cat_akun",
    items: [
      { labelKey: "nav_profil",     descKey: "menu_profil_sub",     href: "/admin/profile",    icon: <PngIcon src="/icons/profil icon.png" alt="Profil" /> },
      { labelKey: "settings_title", descKey: "menu_pengaturan_sub", href: "/admin/pengaturan", icon: <PngIcon src="/icons/pengaturan_icon.png" alt="Pengaturan" /> },
    ],
  },
];

export default function SemuaMenuPage() {
  const router = useRouter();
  const { t } = useSettings();

  return (
    <div
      className="admin-zoom-scope"
      style={{
        fontFamily,
        background: "var(--admin-page-bg)",
        minHeight: "100dvh",
        maxWidth: 430,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ══ HEADER CARD ══════════════════════════════════════════════ */}
      <div style={{ padding: "12px 16px 0" }}>
        <div
          style={{
            background: "var(--white)",
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
            aria-label={t('settings_back_home')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "var(--purple-lighter)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--violet-1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: 0, lineHeight: 1.3 }}>
              {t('allmenu_title')}
            </p>
            <p style={{ fontSize: 12, color: "var(--gray-light)", margin: 0, marginTop: 2, fontWeight: 500 }}>
              {t('allmenu_sub')}
            </p>
          </div>
        </div>
      </div>

      {/* ══ SCROLL CONTENT ═══════════════════════════════════════════ */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px", display: "flex", flexDirection: "column", gap: 20 }}>
        {MENU.map((cat) => (
          <section key={cat.titleKey}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--gray)", margin: "0 0 8px 4px" }}>
              {t(cat.titleKey as TranslationKey)}
            </p>
            <div style={{ background: "var(--white)", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              {cat.items.map((item, idx) => (
                <React.Fragment key={item.labelKey}>
                  <Link href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", textDecoration: "none" }}>
                    {item.icon}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: 0, lineHeight: 1.3 }}>
                        {t(item.labelKey)}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--gray-light)", margin: 0, marginTop: 2, fontWeight: 400 }}>
                        {t(item.descKey)}
                      </p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-light)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                  {idx < cat.items.length - 1 && (
                    <div style={{ height: 1, background: "var(--border)", margin: "0 16px" }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom nav dihapus dari sini — AdminLayout sudah render
          <AdminBottomNav/> global untuk semua halaman /admin/*.
          Versi lama file ini punya bottom nav sendiri yang linknya ke
          rute SISWA ('/', '/daftar', '/bayar', '/status', '/profil') —
          itu bug tersendiri (kemungkinan ke-copy dari template siswa),
          di luar scope tema/bahasa. Dihapus total di sini supaya tidak
          nyasar ke halaman siswa dari panel admin. */}
    </div>
  );
}