import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Belum login → redirect ke /login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const role = token.role as string | undefined

  // Akses /admin/* tapi bukan admin → ke dashboard siswa
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/siswa/dashboard', req.url))
  }

  // Akses /siswa/* tapi bukan siswa → ke dashboard admin
  if (pathname.startsWith('/siswa') && role !== 'siswa') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  // ✅ Hanya proteksi halaman admin & siswa saja
  // /login, /register, /api/auth — TIDAK disentuh middleware
  matcher: [
    '/admin/:path*',
    '/siswa/:path*',
  ],
}