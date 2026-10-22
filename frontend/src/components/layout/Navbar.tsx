import React from 'react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
            ⚡ DevHub
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Tasks
            </Link>
            <Link href="/team" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Team
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-mono">
            Full-Stack Monorepo
          </span>
        </div>
      </div>
    </header>
  );
};
