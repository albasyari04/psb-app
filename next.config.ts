import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    remotePatterns: [
      {
        // ✅ Google profile photos (avatar Google login)
        protocol:  'https',
        hostname:  'lh3.googleusercontent.com',
        pathname:  '/**',
      },
      {
        // ✅ Google user content lainnya
        protocol:  'https',
        hostname:  '*.googleusercontent.com',
        pathname:  '/**',
      },
      {
        // ✅ Supabase storage
        protocol:  'https',
        hostname:  '**.supabase.co',
        pathname:  '/**',
      },
    ],
  },
}

export default nextConfig