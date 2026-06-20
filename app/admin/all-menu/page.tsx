import React from "react";
import Link from "next/link";
import Image from "next/image";
import AdminPageShell from "@/app/admin/AdminPageShell";

// ── Style tokens (selaras dengan AdminDashboardClient) ───────────────────────
const cardShadow = "0 10px 30px rgba(109,61,245,0.08), 0 2px 8px rgba(0,0,0,0.04)";
const heroShadow = "0 8px 28px rgba(109,40,217,0.45)";
const fontFamily = "'Plus Jakarta Sans','Inter',system-ui,-apple-system,sans-serif";

// ── Icon helper untuk menu yang punya gambar PNG khusus ──────────────────────
function PngIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
      <Image src={src} alt={alt} width={44} height={44} className="rounded-xl" />
    </div>
  );
}

// ── Icon helper untuk menu tanpa PNG (dibuat menyerupai gaya 3D icon lainnya) ─
function IconBox({ gradient, children }: { gradient: string; children: React.ReactNode }) {
  return (
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{ background: gradient, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
    >
      {children}
    </div>
  );
}

const NotifikasiIcon = () => (
  <IconBox gradient="linear-gradient(135deg,#3b82f6,#2563eb)">
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  </IconBox>
);

const PengaturanIcon = () => (
  <IconBox gradient="linear-gradient(135deg,#9ca3af,#6b7280)">
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  </IconBox>
);

// ── Data Menu (dikelompokkan per kategori) ────────────────────────────────────
type MenuItem = {
  label: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
};
type MenuCategory = {
  title: string;
  accent: string;
  items: MenuItem[];
};

const MENU: MenuCategory[] = [
  {
    title: "Pendaftaran & Verifikasi",
    accent: "#6D3DF5",
    items: [
      { label: "Pendaftar",  desc: "Lihat & kelola data calon santri", href: "/admin/pendaftar",  icon: <PngIcon src="/icons/formulir icon.png" alt="Pendaftar" /> },
      { label: "Verifikasi", desc: "Tinjau & validasi status berkas",  href: "/admin/verifikasi", icon: <PngIcon src="/icons/status icon.png" alt="Verifikasi" /> },
      { label: "Berkas",     desc: "Dokumen & arsip pendaftaran",      href: "/admin/berkas",     icon: <PngIcon src="/icons/berkas icon.png" alt="Berkas" /> },
    ],
  },
  {
    title: "Keuangan",
    accent: "#059669",
    items: [
      { label: "Pembayaran", desc: "Konfirmasi & riwayat pembayaran", href: "/admin/pembayaran", icon: <PngIcon src="/icons/pembayaran icon.png" alt="Pembayaran" /> },
    ],
  },
  {
    title: "Informasi & Komunikasi",
    accent: "#3B82F6",
    items: [
      { label: "Pengumuman", desc: "Buat & kelola info untuk calon santri", href: "/admin/pengumuman", icon: <PngIcon src="/icons/pengumuman icon.png" alt="Pengumuman" /> },
      { label: "Notifikasi", desc: "Riwayat & pengaturan notifikasi",       href: "/admin/notifikasi", icon: <NotifikasiIcon /> },
      { label: "Jadwal",     desc: "Jadwal tes, wawancara & daftar ulang",  href: "/admin/jadwal",     icon: <PngIcon src="/icons/jadwal icon.png" alt="Jadwal" /> },
    ],
  },
  {
    title: "Laporan & Analitik",
    accent: "#D97706",
    items: [
      { label: "Laporan", desc: "Statistik & rekap pendaftaran", href: "/admin/laporan", icon: <PngIcon src="/icons/laporan icon.png" alt="Laporan" /> },
    ],
  },
  {
    title: "Akun & Sistem",
    accent: "#6B7280",
    items: [
      { label: "Profil Saya", desc: "Kelola data & foto akun admin",     href: "/admin/profile",    icon: <PngIcon src="/icons/profil icon.png" alt="Profil" /> },
      { label: "Pengaturan",  desc: "Preferensi & konfigurasi sistem",   href: "/admin/pengaturan", icon: <PengaturanIcon /> },
    ],
  },
];

const TOTAL_MENU = MENU.reduce((sum, c) => sum + c.items.length, 0);

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AllMenuPage() {
  return (
    <AdminPageShell title="Semua Menu">
      <div
        className="max-w-[430px] mx-auto px-4 pt-4 pb-10"
        style={{ fontFamily, background: "#F8FAFC" }}
      >
        {/* ══ HERO BANNER ══════════════════════════════════════════════════ */}
        <div
          className="relative rounded-[26px] overflow-hidden mb-5"
          style={{
            minHeight: 132,
            background: "linear-gradient(125deg,#3b0764 0%,#5b21b6 40%,#7c3aed 75%,#8b5cf6 100%)",
            boxShadow: heroShadow,
          }}
        >
          <Image
            src="/image/futuristik.jpg"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center", mixBlendMode: "luminosity", opacity: 0.32 }}
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(110deg, rgba(30,5,100,0.95) 0%, rgba(76,29,149,0.82) 45%, rgba(109,40,217,0.55) 100%)" }}
          />
          {/* decorative blur circles */}
          <div className="absolute -right-6 -top-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-fuchsia-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10 px-5 py-5 flex flex-col justify-center h-full">
            <span className="inline-flex w-fit items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              {TOTAL_MENU} Menu Tersedia
            </span>
            <p className="text-white text-[15px] font-bold mt-2.5 leading-snug">
              Navigasi cepat ke seluruh fitur admin
            </p>
            <p className="text-white/65 text-[10.5px] mt-1 leading-relaxed font-medium max-w-[260px]">
              Pilih menu di bawah untuk mengakses pendaftaran, verifikasi, keuangan, hingga laporan.
            </p>
          </div>
        </div>

        {/* ══ QUICK STATS ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="bg-white rounded-2xl px-3 py-3 flex flex-col items-center text-center" style={{ boxShadow: cardShadow }}>
            <p className="text-[17px] font-extrabold leading-none" style={{ color: "#6D3DF5" }}>{TOTAL_MENU}</p>
            <p className="text-[9.5px] text-gray-400 font-semibold mt-1.5">Menu Aktif</p>
          </div>
          <div className="bg-white rounded-2xl px-3 py-3 flex flex-col items-center text-center" style={{ boxShadow: cardShadow }}>
            <p className="text-[17px] font-extrabold leading-none" style={{ color: "#059669" }}>{MENU.length}</p>
            <p className="text-[9.5px] text-gray-400 font-semibold mt-1.5">Kategori</p>
          </div>
          <div className="bg-white rounded-2xl px-3 py-3 flex flex-col items-center text-center" style={{ boxShadow: cardShadow }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[13px] font-extrabold text-gray-900">Online</p>
            </div>
            <p className="text-[9.5px] text-gray-400 font-semibold mt-1.5">Status Sistem</p>
          </div>
        </div>

        {/* ══ MENU CATEGORIES ══════════════════════════════════════════════ */}
        <div className="flex flex-col gap-6">
          {MENU.map((cat) => (
            <section key={cat.title}>
              <div className="flex items-center gap-2 mb-2.5 px-1">
                <span className="w-1 h-3.5 rounded-full" style={{ background: cat.accent }} />
                <h2 className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: "#6B7280" }}>
                  {cat.title}
                </h2>
              </div>
              <div
                className="bg-white rounded-[22px] overflow-hidden divide-y divide-gray-50"
                style={{ boxShadow: cardShadow }}
              >
                {cat.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAF8FF] active:bg-[#F3EFFE] transition-colors"
                  >
                    {item.icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-900 truncate">{item.label}</p>
                      <p className="text-[10.5px] text-gray-400 truncate mt-0.5 font-medium">{item.desc}</p>
                    </div>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"
                      className="flex-shrink-0 text-gray-300 group-hover:text-[#6D3DF5] group-hover:translate-x-0.5 transition-all duration-200"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ══ FOOTER NOTE ══════════════════════════════════════════════════ */}
        <div
          className="mt-7 rounded-2xl px-4 py-4 flex items-center gap-3"
          style={{ background: "#F5F0FF", border: "1.5px solid #EDE3FF" }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#6D3DF5" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <p className="text-[10.5px] text-[#5B21B6] font-semibold leading-snug">
            Butuh menu lain? Hubungi tim pengembang untuk menambahkan fitur baru ke sistem ini.
          </p>
        </div>
      </div>
    </AdminPageShell>
  );
}