// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createClient, PostgrestError } from '@supabase/supabase-js'
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
        console.log('[auth] Authorize attempt for email:', credentials?.email)
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[auth] Missing email or password.')
            return null
          }

          const url = process.env.NEXT_PUBLIC_SUPABASE_URL
          const key = process.env.SUPABASE_SERVICE_ROLE_KEY

          if (!url || !key) {
            console.error('[auth] CRITICAL: Supabase URL or Service Role Key is missing in env.')
            return null
          }
          console.log('[auth] Supabase credentials found. Creating client.')

          const client = createClient(url, key, {
            auth: { autoRefreshToken: false, persistSession: false },
          })

          console.log('[auth] Querying auth_users_view for user.')
          const { data: viewData, error: viewErr } = (await client
            .from('auth_users_view')
            .select('id, encrypted_password')
            .eq('email', credentials.email)
            .single()) as { data: { id: string; encrypted_password: string } | null; error: PostgrestError | null }

          if (viewErr) {
            console.error('[auth] Error querying auth_users_view:', viewErr)
            return null
          }

          if (!viewData) {
            console.log('[auth] No user found in auth_users_view for this email.')
            return null
          }

          if (!viewData.encrypted_password) {
            console.error('[auth] User found, but has no encrypted_password. Cannot use credentials login.')
            return null
          }

          console.log('[auth] User found in view. Comparing password.')
          const valid = await bcrypt.compare(credentials.password, viewData.encrypted_password)

          if (!valid) {
            console.log('[auth] Password comparison failed.')
            return null
          }

          console.log('[auth] Password is valid. Fetching profile.')
          const { data: profile, error: profileErr } = (await client
            .from('profiles')
            .select('id, name, email, role, avatar_url')
            .eq('id', viewData.id)
            .single()) as { data: ProfileRow | null; error: PostgrestError | null }

          if (profileErr) {
            console.error('[auth] Error fetching profile:', profileErr)
            return null
          }

          if (!profile) {
            console.error('[auth] CRITICAL: Profile not found for a valid user. Data inconsistency!')
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