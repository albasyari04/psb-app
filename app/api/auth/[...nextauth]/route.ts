// app/api/auth/[...nextauth]/route.ts
// Path wajib TEPAT:
// app/
//   api/
//     auth/
//       [...nextauth]/
//           route.ts   <-- file ini

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// ✅ FIX #1: Paksa Node.js runtime
// bcryptjs dan Supabase Admin TIDAK kompatibel dengan Edge Runtime.
// Tanpa ini, Next.js bisa menjalankan handler ini di Edge → crash → return HTML
export const runtime = 'nodejs'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }