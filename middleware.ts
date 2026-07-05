import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthPage = pathname === '/login' || pathname === '/register'

  // Sudah login tapi buka /login atau /register -> lempar ke dashboard sesuai role
  if (token && isAuthPage) {
    const role = token.role as string | undefined
    const dest = role === 'admin' ? '/admin/dashboard' : '/siswa/dashboard'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  // Belum login & bukan halaman auth -> redirect ke /login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token) {
    const role = token.role as string | undefined

    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/siswa/dashboard', req.url))
    }

    if (pathname.startsWith('/siswa') && role !== 'siswa') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/siswa/:path*',
    '/login',
    '/register',
  ],
}