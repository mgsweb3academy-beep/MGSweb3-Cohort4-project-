"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface NavProps {
  currentPath?: string;
}

export const Nav: React.FC<NavProps> = ({ currentPath }) => {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 p-[.6rem_var(--pad)] ${stuck ? 'stuck' : ''}`}>
      <div
        className="max-w-[var(--maxw)] mx-auto flex items-center gap-[2rem] p-[.7rem_1rem] border border-transparent rounded-[14px] transition-all duration-350 bg-transparent nav-bar"
        style={stuck ? { maxWidth: '860px', background: 'rgba(22,28,39,.72)', borderColor: 'var(--line)', backdropFilter: 'blur(14px)' } : {}}
      >
        <Link className="flex items-center gap-[.6rem] font-display font-semibold tracking-[-.01em] text-chalk" href="/" aria-label="Corridor, home">
          <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden="true">
            <rect x="0" y="6" width="3" height="12" rx="1" fill="var(--signal)" />
            <rect x="5" y="4" width="3" height="14" rx="1" fill="var(--signal)" />
            <rect x="10" y="0" width="3" height="18" rx="1" fill="var(--mark)" />
            <rect x="15" y="8" width="3" height="10" rx="1" fill="var(--line)" />
          </svg>
          Corridor
        </Link>
        <nav className="hidden md:flex gap-[1.6rem] ml-auto text-[.9rem] text-dim">
          <Link href="/programs" className={`hover:text-chalk ${currentPath === '/programs' ? 'text-chalk font-semibold' : ''}`}>
            Programs
          </Link>
          <Link href="/cohorts" className={`hover:text-chalk ${currentPath === '/cohorts' ? 'text-chalk font-semibold' : ''}`}>
            Cohorts
          </Link>
          <Link href="/admin" className={`hover:text-chalk ${currentPath === '/admin' ? 'text-chalk font-semibold' : ''}`}>
            Admin
          </Link>
        </nav>
        <div className="flex gap-[.5rem] items-center ml-auto md:ml-0">
          <Link className="btn text-xs px-3 py-1.5 rounded-lg border border-[var(--line)] hover:bg-[var(--ink-3)]" href="/cohorts">
            Sign in
          </Link>
          <Link className="btn btn-solid text-xs px-3 py-1.5 rounded-lg bg-[var(--chalk)] text-[var(--ink)] font-semibold hover:opacity-90" href="/cohorts?schedule=true">
            Start a cohort
          </Link>
        </div>
      </div>
    </header>
  );
};

