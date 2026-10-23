import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold">💼 Job Management Portal</h1>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 rounded text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            📋 Jobs
          </Link>
          <Link
            href="/music"
            className="px-3 py-1.5 rounded text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            🎵 Playlist
          </Link>
          <Link
            href="/vision-chat"
            className="px-3 py-1.5 rounded text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors font-semibold flex items-center gap-1"
          >
            🩺 Vision Chat
          </Link>
        </nav>
      </div>
      <span className="text-xs px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono">
        Job Dispatch & Console
      </span>
    </header>
  );
}
