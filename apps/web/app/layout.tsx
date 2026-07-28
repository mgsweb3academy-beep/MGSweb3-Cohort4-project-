import type { Metadata } from 'next';
import {
  Bricolage_Grotesque,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
} from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Corridor — a cohort LMS where the work lives in git',
  description:
    'Corridor runs cohort programs where the work lives in git. Learners team up on tasks, push to a branch, and review each other. A manager watches every task and tells you who is stuck before they say so.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bricolage.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
        style={{
          fontFamily: 'var(--font-ibm-plex-sans), ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-ink/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <a href="/" className="font-display font-bold text-xl text-chalk tracking-tight">Corridor.</a>
            <nav className="flex gap-4">
              <a href="/courses" className="text-dim hover:text-chalk transition-colors text-sm">Courses</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
