import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';
import { getUserByEmail, updateUserRole, updateUserStatus } from '@/lib/auth-store';

export const config = {
  secret: process.env.AUTH_SECRET || 'dev-corridor-secret',
  trustHost: true,
  providers: [
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
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Build against the mock API contract as per PRD
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        
        const data = await res.json();
        
        if (res.ok && data?.user) {
          return data.user;
        }
        return null;
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
        const storedUser = getUserByEmail(token.email as string);
        if (storedUser) {
          token.role = storedUser.role;
          token.id = storedUser.id;
          token.githubUsername = storedUser.githubUsername;
          token.status = storedUser.status;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const storedUser = token.email ? getUserByEmail(token.email as string) : undefined;
        const role = storedUser?.role || (token.role as string) || 'student';
        (session.user as any).role = role;
        session.user.id = (storedUser?.id || token.id) as string;
        (session.user as any).githubUsername = storedUser?.githubUsername || (token.githubUsername as string);
        (session.user as any).status = storedUser?.status || (token.status as string);
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
