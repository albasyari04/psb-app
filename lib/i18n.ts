// lib/i18n.ts
// Dictionary terjemahan sederhana. Tambahkan key baru di sini lalu pakai
// lewat hook `useTranslation()` -> `t('key')`.

export type Language = 'id' | 'en'

export const translations = {
  id: {
    // ── Bottom Nav ──────────────────────────────
    nav_beranda: 'Beranda',
    nav_pendaftar: 'Pendaftar',
    nav_pembayaran: 'Pembayaran',
    nav_laporan: 'Laporan',
    nav_profil: 'Profil',

    // ── Pengaturan ──────────────────────────────
    settings_title: 'Pengaturan',
    settings_subtitle: 'Sesuaikan bahasa, tampilan, dan ukuran teks aplikasi sesuai preferensi Anda.',
    settings_section_language: 'Bahasa',
    settings_section_display: 'Tampilan',
    settings_section_text: 'Teks',
    settings_language_title: 'Bahasa Aplikasi',
    settings_language_sub: 'Pilih bahasa yang digunakan di seluruh halaman.',
    settings_theme_title: 'Mode Tampilan',
    settings_theme_sub: 'Atur tampilan terang atau gelap pada aplikasi.',
    settings_theme_light: 'Terang',
    settings_theme_dark: 'Gelap',
    settings_font_title: 'Ukuran Font',
    settings_font_sub: 'Sesuaikan ukuran teks agar lebih nyaman dibaca.',
    settings_font_small: 'Kecil',
    settings_font_medium: 'Sedang',
    settings_font_large: 'Besar',
    settings_preview_label: 'Pratinjau',
    settings_preview_title: 'Penerimaan Santri Baru 2025/2026',
    settings_preview_sub: 'Begini tampilan teks dengan ukuran yang dipilih.',
    settings_reset: 'Kembalikan ke Pengaturan Default',
    settings_saved_toast: 'Pengaturan tersimpan',
    settings_back_home: '← Kembali ke Beranda',
    settings_admin_label: 'ADMIN · PSB 2025/2026',
  },
  en: {
    // ── Bottom Nav ──────────────────────────────
    nav_beranda: 'Home',
    nav_pendaftar: 'Applicants',
    nav_pembayaran: 'Payment',
    nav_laporan: 'Reports',
    nav_profil: 'Profile',

    // ── Settings ────────────────────────────────
    settings_title: 'Settings',
    settings_subtitle: 'Customize the language, appearance, and text size to your preference.',
    settings_section_language: 'Language',
    settings_section_display: 'Display',
    settings_section_text: 'Text',
    settings_language_title: 'App Language',
    settings_language_sub: 'Choose the language used across all pages.',
    settings_theme_title: 'Display Mode',
    settings_theme_sub: 'Set the app appearance to light or dark.',
    settings_theme_light: 'Light',
    settings_theme_dark: 'Dark',
    settings_font_title: 'Font Size',
    settings_font_sub: 'Adjust the text size for comfortable reading.',
    settings_font_small: 'Small',
    settings_font_medium: 'Medium',
    settings_font_large: 'Large',
    settings_preview_label: 'Preview',
    settings_preview_title: 'New Student Admission 2025/2026',
    settings_preview_sub: 'This is how text looks at the selected size.',
    settings_reset: 'Restore Default Settings',
    settings_saved_toast: 'Settings saved',
    settings_back_home: '← Back to Home',
    settings_admin_label: 'ADMIN · PSB 2025/2026',
  },
} as const

export type TranslationKey = keyof typeof translations.id