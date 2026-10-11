import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';
import { createUser, claimOAuthUser, getUserByEmail, verifyPassword } from '@/lib/auth-store';

export const config = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    // Only load OAuth providers if env vars are set — prevents crashes on Vercel
    // when GITHUB_ID / GOOGLE_ID are not configured.
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            profile(profile) {
              return {
                id: profile.id.toString(),
                name: profile.name || profile.login,
                email: profile.email,
                image: profile.avatar_url,
                role: 'student',
                githubUsername: profile.login,
              };
            },
          }),
        ]
      : []),
    ...(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Uses local auth-store directly — avoids fetch to NestJS API which
        // does not exist in the Vercel serverless environment.
        const email = typeof credentials?.email === 'string' ? credentials.email : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';
        if (!email || !password) return null;

        const user = await verifyPassword(email, password);
        if (!user || user.status === 'suspended') return null;
        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') return true;
      if (!user.email) return false;
      if (account?.provider === 'google' && (profile as { email_verified?: boolean })?.email_verified !== true) return false;
      const existing = await getUserByEmail(user.email);
      if (existing) return existing.status === 'active' && await claimOAuthUser(user.email);
      const created = await createUser({ email: user.email, name: user.name || user.email, provider: account?.provider as 'github' | 'google' });
      return !!created && await claimOAuthUser(user.email);
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'student';
        token.id = user.id;
        token.githubUsername = (user as any).githubUsername;
        token.email = user.email;
        token.sessionVersion = (user as any).sessionVersion;
      }

      if (token.email) {
        try {
          const storedUser = await getUserByEmail(token.email as string);
          if (storedUser && (user || token.sessionVersion === storedUser.sessionVersion)) {
            token.sessionVersion = storedUser.sessionVersion;
            token.role = storedUser.role;
            token.id = storedUser.id;
            token.githubUsername = (storedUser as any).githubUsername;
            token.status = storedUser.status;
          } else {
            token.status = 'suspended';
          }
        } catch (error) {
          console.error('[auth] Failed to fetch user in jwt callback:', error);
          token.status = 'suspended';
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        try {
          const storedUser = token.email ? await getUserByEmail(token.email as string) : undefined;
          const role = storedUser?.role || (token.role as string) || 'student';
          (session.user as any).role = role;
          session.user.id = (storedUser?.id || token.id) as string;
          (session.user as any).githubUsername = (storedUser as any)?.githubUsername || (token.githubUsername as string);
          (session.user as any).status = token.status === 'active' && storedUser?.sessionVersion === token.sessionVersion ? storedUser?.status : 'suspended';
          (session.user as any).sessionVersion = token.sessionVersion;
        } catch (error) {
          console.error('[auth] Failed to fetch user in session callback:', error);
          (session.user as any).status = 'suspended';
          (session.user as any).role = (token.role as string) || 'student';
          session.user.id = token.id as string;
          (session.user as any).githubUsername = token.githubUsername as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
