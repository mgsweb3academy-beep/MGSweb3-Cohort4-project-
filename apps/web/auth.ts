import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';
import { getUserByEmail, verifyPassword } from '@/lib/auth-store';

export const config = {
  secret: process.env.AUTH_SECRET || 'dev-corridor-secret',
  trustHost: true,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
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
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'student';
        token.id = user.id;
        token.githubUsername = (user as any).githubUsername;
        token.email = user.email;
      }

      if (token.email) {
        try {
          const storedUser = await getUserByEmail(token.email as string);
          if (storedUser) {
            token.role = storedUser.role;
            token.id = storedUser.id;
            token.githubUsername = (storedUser as any).githubUsername;
            token.status = storedUser.status;
          }
        } catch (error) {
          console.error('[auth] Failed to fetch user from Convex in jwt callback:', error);
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
          (session.user as any).status = storedUser?.status || (token.status as string);
        } catch (error) {
          console.error('[auth] Failed to fetch user from Convex in session callback:', error);
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
