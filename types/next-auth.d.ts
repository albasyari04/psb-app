// types/next-auth.d.ts
// File ini WAJIB ada agar session.user.id, session.user.role, dan session.user.avatar_url
// tersedia di runtime. Tanpa ini, field-field tersebut undefined meskipun sudah di-set
// di callback session() pada auth.ts.

import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      avatar_url?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    avatar_url?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    avatar_url?: string
  }
}