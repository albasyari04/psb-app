// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

interface UserWithRole { role: string; avatar_url?: string }
interface ProfileRow { id: string; name: string; email: string; role: string; avatar_url: string | null }
interface ProfileMini { id: string; role: string; avatar_url: string | null }
interface ProfileRoleAvatar { role: string; avatar_url: string | null }

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function findAuthUserByEmail(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    if (error || !data) return null
    const found = data.users.find((u) => u.email === email)
    return found?.id ?? null
  } catch { return null }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          // Ambil encrypted_password langsung dari auth_users_view
          const { data: viewData, error: viewErr } = await supabaseAdmin
            .from('auth_users_view')
            .select('id, encrypted_password')
            .eq('email', credentials.email)
            .single<{ id: string; encrypted_password: string }>()

          if (viewErr || !viewData) return null

          // Normalize $2a$ → $2b$ dan verifikasi password
          const hash = viewData.encrypted_password.replace(/^\$2a\$/, '$2b$')
          const valid = await bcrypt.compare(credentials.password, hash)

          if (!valid) return null

          // Ambil profile
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, name, email, role, avatar_url')
            .eq('id', viewData.id)
            .single<ProfileRow>()

          if (!profile) return null

          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            avatar_url: profile.avatar_url ?? undefined,
          }
        } catch { return null }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true
      try {
        const email = user.email!
        const name = user.name ?? ''
        const avatarUrl = user.image ?? null

        const { data: existingProfile } = await supabaseAdmin
          .from('profiles').select('id, role, avatar_url')
          .eq('email', email).maybeSingle<ProfileMini>()

        if (existingProfile) {
          await supabaseAdmin.from('profiles').update({ avatar_url: avatarUrl }).eq('email', email)
          user.id = existingProfile.id
          return true
        }

        let userId = await findAuthUserByEmail(email)
        if (!userId) {
          const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email, email_confirm: true, user_metadata: { name, avatar_url: avatarUrl },
          })
          if (createErr || !newUser?.user?.id) return false
          userId = newUser.user.id
        }

        const { error: upsertErr } = await supabaseAdmin.from('profiles').upsert(
          { id: userId, email, name, role: 'siswa', avatar_url: avatarUrl },
          { onConflict: 'id', ignoreDuplicates: false }
        )
        if (upsertErr) return false
        user.id = userId
        return true
      } catch { return false }
    },

    async jwt({ token, user, account, trigger, session }) {
      if (user && account?.provider === 'credentials') {
        const u = user as UserWithRole
        token.id = user.id
        token.role = u.role
        token.avatar_url = u.avatar_url ?? undefined
      }
      if (user && account?.provider === 'google') {
        token.id = user.id
        const { data: profile } = await supabaseAdmin
          .from('profiles').select('role, avatar_url')
          .eq('email', token.email!).maybeSingle<ProfileRoleAvatar>()
        token.role = profile?.role ?? 'siswa'
        token.avatar_url = profile?.avatar_url ?? user.image ?? undefined
      }
      if (trigger === 'update' && session) {
        if (session.name !== undefined) token.name = session.name as string
        if (session.avatar_url !== undefined) token.avatar_url = session.avatar_url as string
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string
        session.user.avatar_url = token.avatar_url as string | undefined
      }
      return session
    },
  },

  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}