// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { User } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase'  // ✅ pakai fungsi, bukan proxy
import bcrypt from 'bcryptjs'

interface UserWithRole { role: string; avatar_url?: string }

async function findAuthUserByEmail(email: string): Promise<string | null> {
  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
    if (error || !data) return null
    const found = data.users.find((u: User) => u.email === email)
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
        console.log('[auth] Authorize attempt for email:', credentials?.email)
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[auth] Missing email or password.')
            return null
          }

          const admin = getSupabaseAdmin()  // ✅ type-safe

          console.log('[auth] Using supabaseAdmin to query auth_users_view.')
          const { data: viewData, error: viewErr } = await admin
            .from('auth_users_view')
            .select('id, encrypted_password')
            .eq('email', credentials.email)
            .single()

          if (viewErr) {
            console.error('[auth] Error querying auth_users_view:', viewErr)
            return null
          }

          if (!viewData) {
            console.log('[auth] No user found in auth_users_view for this email.')
            return null
          }

          if (!viewData.encrypted_password) {
            console.error('[auth] User found, but has no encrypted_password.')
            return null
          }

          console.log('[auth] User found in view. Comparing password.')
          const valid = await bcrypt.compare(credentials.password, viewData.encrypted_password)

          if (!valid) {
            console.log('[auth] Password comparison failed.')
            return null
          }

          console.log('[auth] Password is valid. Fetching profile.')
          const { data: profile, error: profileErr } = await admin
            .from('profiles')
            .select('id, name, email, role, avatar_url')
            .eq('id', viewData.id)
            .single()

          if (profileErr) {
            console.error('[auth] Error fetching profile:', profileErr)
            return null
          }

          if (!profile) {
            console.error('[auth] CRITICAL: Profile not found for a valid user.')
            return null
          }

          console.log('[auth] Authorization successful. Returning user object.')
          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            avatar_url: profile.avatar_url ?? undefined,
          }
        } catch (e) {
          console.error('[auth] UNHANDLED authorize error:', e)
          return null
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true
      try {
        const admin = getSupabaseAdmin()  // ✅ type-safe
        const email = user.email!
        const name = user.name ?? ''
        const avatarUrl = user.image ?? null

        const { data: existingProfile } = await admin
          .from('profiles')
          .select('id, role, avatar_url')
          .eq('email', email)
          .maybeSingle()

        if (existingProfile) {
          await admin
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('email', email)
          user.id = existingProfile.id
          return true
        }

        let userId = await findAuthUserByEmail(email)
        if (!userId) {
          const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
            email, email_confirm: true, user_metadata: { name, avatar_url: avatarUrl },
          })
          if (createErr || !newUser?.user?.id) return false
          userId = newUser.user.id
        }

        const { error: upsertErr } = await admin
          .from('profiles')
          .upsert({
            id: userId,
            email,
            name,
            role: 'siswa',
            avatar_url: avatarUrl,
          })

        if (upsertErr) return false
        if (!userId) return false
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
        const admin = getSupabaseAdmin()  // ✅ type-safe
        token.id = user.id
        const { data: profile } = await admin
          .from('profiles')
          .select('role, avatar_url')
          .eq('email', token.email!)
          .maybeSingle()
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